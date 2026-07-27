import { randomUUID } from 'crypto';
import { CommandDraft, DraftInputType, DraftStatus } from '@/lib/types/database';
import { ParsedDraftResult } from '@/lib/ai/intent-parser';

type CreateDraftInput = {
  storeId: string;
  branchId?: string;
  createdBy?: string;
  rawInput?: string;
  inputType: DraftInputType;
  parsed: ParsedDraftResult;
};

// This store is intentionally an in-memory adapter for the demo/runtime without Supabase.
// It keeps the Draft-First contract explicit: callers can only create or change draft status.
const drafts = new Map<string, CommandDraft>();

function createDraftId() {
  return `draft-${randomUUID()}`;
}

export function createCommandDraft(input: CreateDraftInput): CommandDraft {
  const now = new Date().toISOString();
  const draft: CommandDraft = {
    id: createDraftId(),
    store_id: input.storeId,
    branch_id: input.branchId,
    created_by: input.createdBy,
    intent: input.parsed.intent,
    raw_input: input.rawInput,
    input_type: input.inputType,
    draft_data: input.parsed.extractedData,
    confidence_score: input.parsed.confidenceScore,
    status: 'pending',
    created_at: now,
  };

  drafts.set(draft.id, draft);
  return draft;
}

export function getCommandDraft(id: string) {
  return drafts.get(id);
}

export function updateCommandDraftStatus(id: string, status: Extract<DraftStatus, 'confirmed' | 'rejected'>) {
  const draft = drafts.get(id);
  if (!draft || draft.status !== 'pending') return undefined;

  const updated: CommandDraft = {
    ...draft,
    status,
    confirmed_at: status === 'confirmed' ? new Date().toISOString() : undefined,
  };
  drafts.set(id, updated);
  return updated;
}

export function resetCommandDraftsForTests() {
  drafts.clear();
}
