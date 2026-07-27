import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { ParsedDraftResult } from '@/lib/ai/intent-parser';
import { createCommandDraft, getCommandDraft, updateCommandDraftStatus } from '@/lib/ai/draft-store';
import { CommandDraft, DraftInputType, DraftStatus } from '@/lib/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storeId = process.env.PADAENG_STORE_ID || '00000000-0000-0000-0000-000000000001';
const branchId = process.env.PADAENG_BRANCH_ID || '00000000-0000-0000-0000-000000000002';

const adminClient = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

type ServerDraftInput = {
  branchId?: string;
  rawInput?: string;
  inputType: DraftInputType;
  parsed: ParsedDraftResult;
};

function mapDraft(row: Record<string, unknown>): CommandDraft {
  return {
    id: String(row.id),
    store_id: String(row.store_id),
    branch_id: row.branch_id ? String(row.branch_id) : undefined,
    created_by: row.created_by ? String(row.created_by) : undefined,
    intent: String(row.intent),
    raw_input: row.raw_input ? String(row.raw_input) : undefined,
    input_type: row.input_type as DraftInputType,
    draft_data: (row.draft_data || {}) as Record<string, unknown>,
    confidence_score: Number(row.confidence_score || 0),
    status: row.status as DraftStatus,
    created_at: String(row.created_at),
    confirmed_at: row.confirmed_at ? String(row.confirmed_at) : undefined,
  };
}

async function ensureDemoTenant() {
  if (!adminClient) return;
  await adminClient.from('stores').upsert({ id: storeId, name: 'PaDaeng POS Demo', business_type: 'retail' });
  await adminClient.from('branches').upsert({ id: branchId, store_id: storeId, name: 'สาขาหลัก', code: 'MAIN', is_main: true });
}

export async function createServerCommandDraft(input: ServerDraftInput): Promise<CommandDraft> {
  if (!adminClient) {
    return createCommandDraft({ storeId, branchId: input.branchId || branchId, ...input });
  }

  try {
    await ensureDemoTenant();
    const id = randomUUID();
    const { data, error } = await adminClient
      .from('command_drafts')
      .insert({
        id,
        store_id: storeId,
        branch_id: input.branchId || branchId,
        intent: input.parsed.intent,
        raw_input: input.rawInput,
        input_type: input.inputType,
        draft_data: input.parsed.extractedData,
        confidence_score: input.parsed.confidenceScore,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data) throw error || new Error('Draft insert returned no data');
    return mapDraft(data);
  } catch (error) {
    console.error('Supabase Draft insert failed; using temporary fallback:', error);
    return createCommandDraft({ storeId, branchId: input.branchId || branchId, ...input });
  }
}

export async function getServerCommandDraft(id: string) {
  if (!adminClient) return getCommandDraft(id);

  const { data, error } = await adminClient.from('command_drafts').select('*').eq('id', id).maybeSingle();
  if (!error && data) return mapDraft(data);
  return getCommandDraft(id);
}

export async function updateServerCommandDraftStatus(id: string, status: Extract<DraftStatus, 'confirmed' | 'rejected'>) {
  if (!adminClient) return updateCommandDraftStatus(id, status);

  const { data, error } = await adminClient
    .from('command_drafts')
    .update({ status, confirmed_at: status === 'confirmed' ? new Date().toISOString() : null })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .maybeSingle();
  if (!error && data) return mapDraft(data);
  return updateCommandDraftStatus(id, status);
}
