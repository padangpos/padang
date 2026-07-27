import { describe, it, expect, beforeEach } from 'vitest';
import { parseTextIntent } from '../../lib/ai/intent-parser';
import {
  createCommandDraft,
  getCommandDraft,
  resetCommandDraftsForTests,
  updateCommandDraftStatus,
} from '../../lib/ai/draft-store';

describe('Draft-First command store', () => {
  beforeEach(() => resetCommandDraftsForTests());

  it('creates every AI command as a pending draft', () => {
    const parsed = parseTextIntent('ป้าแดง ขายน้ำ 3 ขวด เงินสด');
    const draft = createCommandDraft({
      storeId: 'store-1',
      inputType: 'text',
      rawInput: 'ป้าแดง ขายน้ำ 3 ขวด เงินสด',
      parsed,
    });

    expect(draft.status).toBe('pending');
    expect(draft.intent).toBe('create_sale');
    expect(getCommandDraft(draft.id)?.status).toBe('pending');
  });

  it('allows one explicit confirmation and blocks a second mutation', () => {
    const draft = createCommandDraft({
      storeId: 'store-1',
      inputType: 'voice',
      rawInput: 'LINE audio message audio-1',
      parsed: parseTextIntent('ไม่แน่ใจ'),
    });

    const confirmed = updateCommandDraftStatus(draft.id, 'confirmed');
    expect(confirmed?.status).toBe('confirmed');
    expect(confirmed?.confirmed_at).toBeDefined();
    expect(updateCommandDraftStatus(draft.id, 'rejected')).toBeUndefined();
  });
});
