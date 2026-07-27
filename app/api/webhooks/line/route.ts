import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { ParsedDraftResult, parseTextIntent } from '@/lib/ai/intent-parser';
import { createServerCommandDraft } from '@/lib/ai/server-draft-store';
import { DraftInputType } from '@/lib/types/database';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://padaeng-pos.vercel.app';
const lineChannelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const lineChannelSecret = process.env.LINE_CHANNEL_SECRET;

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
    if (!lineChannelSecret) {
      console.error('LINE_CHANNEL_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook is not configured' }, { status: 500 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get('x-line-signature');
    const expectedSignature = createHmac('sha256', lineChannelSecret).update(rawBody).digest('base64');
    const signatureMatches =
      typeof signature === 'string' &&
      signature.length === expectedSignature.length &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    if (!signatureMatches) {
      return NextResponse.json({ error: 'Invalid LINE signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const events = body.events || [];

    for (const event of events) {
      if (event.type !== 'message' || !event.message) continue;

      const parsedMessage = parseLineMessage(event.message);
      const parsedWithSource: ParsedDraftResult = {
        ...parsedMessage.parsed,
        extractedData: { ...parsedMessage.parsed.extractedData, lineUserId: typeof event.source?.userId === 'string' ? event.source.userId : undefined },
      };
      const draft = await createServerCommandDraft({
        branchId: '00000000-0000-0000-0000-000000000002',
        rawInput: parsedMessage.rawInput,
        inputType: parsedMessage.inputType,
        parsed: parsedWithSource,
      });
      // LINE's in-app redirect can strip LIFF path state on some clients.
      // Use the HTTPS app route directly so the Draft ID is never lost.
      const liffUrl = `${appUrl}/liff/drafts/${draft.id}`;
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
