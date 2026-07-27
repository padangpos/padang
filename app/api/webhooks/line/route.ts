import { NextResponse } from 'next/server';
import { ParsedDraftResult, parseTextIntent } from '@/lib/ai/intent-parser';
import { createCommandDraft } from '@/lib/ai/draft-store';
import { DraftInputType } from '@/lib/types/database';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
const lineChannelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

type LineReplyMessage = {
  text: string;
  quickReply: { items: Array<Record<string, unknown>> };
};

async function replyToLine(replyToken: string, message: LineReplyMessage) {
  if (!lineChannelAccessToken) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
  }

  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${lineChannelAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ replyToken, messages: [{ type: 'text', ...message }] }),
  });

  if (!response.ok) {
    throw new Error(`LINE Reply API failed with status ${response.status}`);
  }
}

function parseLineMessage(message: Record<string, unknown>) {
  const messageType = message.type;

  if (messageType === 'text' && typeof message.text === 'string') {
    return {
      inputType: 'text' as const,
      rawInput: message.text,
      parsed: parseTextIntent(message.text),
    };
  }

  const inputType: DraftInputType = messageType === 'audio' ? 'voice' : 'image';
  const rawInput = typeof message.id === 'string' ? `LINE ${messageType} message ${message.id}` : undefined;
  const parsed: ParsedDraftResult = {
    intent: 'unknown',
    confidenceScore: 0,
    extractedData: { rawInput, lineMessageType: messageType },
    requiresConfirmation: true,
    userMessage: 'รับข้อมูลแล้ว กรุณาตรวจสอบและแก้ไข Draft ก่อนยืนยัน',
  };

  return { inputType, rawInput, parsed };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const events = body.events || [];

    for (const event of events) {
      if (event.type !== 'message' || !event.message) continue;

      const parsedMessage = parseLineMessage(event.message);
      const draft = createCommandDraft({
        storeId: 'store-1',
        branchId: 'branch-main',
        rawInput: parsedMessage.rawInput,
        inputType: parsedMessage.inputType,
        parsed: parsedMessage.parsed,
      });
      const liffUrl = liffId
        ? `https://liff.line.me/${liffId}?liff.state=${encodeURIComponent(`/liff/drafts/${draft.id}`)}`
        : `${appUrl}/liff/drafts/${draft.id}`;
      const replyMessage: LineReplyMessage = {
        text: `${parsedMessage.parsed.userMessage}\n\nOpen Draft to review and confirm:\n${liffUrl}`,
        quickReply: {
          items: [
            {
              type: 'action',
              action: { type: 'uri', label: 'ตรวจ Draft', uri: liffUrl },
            },
            {
              type: 'action',
              action: { type: 'message', label: 'ยกเลิก Draft', text: 'ยกเลิก Draft นี้' },
            },
          ],
        },
      };

      if (typeof event.replyToken === 'string') {
        await replyToLine(event.replyToken, replyMessage);
      }

      return NextResponse.json({ status: 'success', draftId: draft.id, replied: Boolean(event.replyToken) });
    }

    return NextResponse.json({ status: 'ok', processed: events.length });
  } catch (error) {
    console.error('LINE Webhook Error:', error);
    return NextResponse.json({ error: 'Internal webhook error' }, { status: 500 });
  }
}
