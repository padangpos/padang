import { NextResponse } from 'next/server';
import { parseTextIntent } from '@/lib/ai/intent-parser';
import { createCommandDraft } from '@/lib/ai/draft-store';
import { ParsedDraftResult } from '@/lib/ai/intent-parser';
import { DraftInputType } from '@/lib/types/database';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

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
    userMessage: 'ป้ารับข้อมูลแล้ว แต่ยังอ่านรายละเอียดไม่ได้ กรุณาตรวจและแก้ไข Draft ก่อนยืนยัน',
  };

  return { inputType, rawInput, parsed };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const events = body.events || [];

    for (const event of events) {
      if (event.type === 'message' && event.message) {
        const parsedMessage = parseLineMessage(event.message);
        const draft = createCommandDraft({
          storeId: 'store-1',
          branchId: 'branch-main',
          rawInput: parsedMessage.rawInput,
          inputType: parsedMessage.inputType,
          parsed: parsedMessage.parsed,
        });
        const liffUrl = liffId
          ? `https://liff.line.me/${liffId}?draftId=${encodeURIComponent(draft.id)}`
          : `${appUrl}/liff/drafts/${draft.id}`;

        console.log('🤖 [LINE AI Webhook Parsed]:', {
          draftId: draft.id,
          inputType: draft.input_type,
          parsedIntent: draft.intent,
          liffUrl,
        });

        // Response payload structure with Quick Replies & LIFF draft link
        return NextResponse.json({
          status: 'success',
          replyMessage: {
            text: `${parsedMessage.parsed.userMessage}\n\n👉 กดตรวจและยืนยัน Draft ที่นี่:\n${liffUrl}`,
            quickReply: {
              items: [
                {
                  type: 'action',
                  action: {
                    type: 'uri',
                    label: 'ตรวจ Draft',
                    uri: liffUrl,
                  },
                },
                {
                  type: 'action',
                  action: {
                    type: 'message',
                    label: 'ยกเลิก',
                    text: 'ยกเลิก Draft นี้',
                  },
                },
              ],
            },
          },
        });
      }
    }

    return NextResponse.json({ status: 'ok', processed: events.length });
  } catch (error) {
    console.error('❌ LINE Webhook Error:', error);
    return NextResponse.json({ error: 'Internal webhook error' }, { status: 500 });
  }
}
