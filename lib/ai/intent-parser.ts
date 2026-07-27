export interface ParsedDraftResult {
  intent: 'create_sale' | 'add_expense' | 'import_menu' | 'stock_query' | 'unknown';
  confidenceScore: number;
  extractedData: Record<string, unknown>;
  requiresConfirmation: boolean;
  userMessage: string;
}

export function parseTextIntent(inputText: string): ParsedDraftResult {
  const text = inputText.trim();

  // Sale pattern match (e.g., "ป้าแดง ขายน้ำ 3 ขวด เงินสด")
  if (text.includes('ขาย') || text.includes('คิดเงิน')) {
    const qtyMatch = text.match(/(\d+)\s*(ขวด|แก้ว|ถุง|ชิ้น|รายการ)?/);
    const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
    const isCash = text.includes('เงินสด');
    const paymentMethod = isCash ? 'cash' : text.includes('โอน') ? 'promptpay' : 'cash';

    return {
      intent: 'create_sale',
      confidenceScore: 0.92,
      extractedData: {
        rawInput: text,
        quantity: qty,
        paymentMethod,
      },
      requiresConfirmation: true,
      userMessage: `ป้าเตรียมบันทึกรายการขาย ${qty} รายการ (${isCash ? 'เงินสด' : 'โอนเงิน'}) ให้ตรวจก่อนบันทึกนะ`,
    };
  }

  // Expense pattern match (e.g., "จดค่าน้ำแข็ง 500 บาท")
  if (text.includes('จดค่า') || text.includes('รายจ่าย') || text.includes('ซื้อ')) {
    const amountMatch = text.match(/(\d+)\s*(บาท)?/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    return {
      intent: 'add_expense',
      confidenceScore: 0.90,
      extractedData: {
        rawInput: text,
        amount,
        category: 'operating_expense',
      },
      requiresConfirmation: true,
      userMessage: `ป้าเตรียมบันทึกรายจ่าย ${amount} บาท ให้ตรวจและยืนยันก่อนบันทึกจริงนะ`,
    };
  }

  return {
    intent: 'unknown',
    confidenceScore: 0.40,
    extractedData: { rawInput: text },
    requiresConfirmation: true,
    userMessage: 'ป้ายังไม่แน่ใจรายการนี้ ลองบอกป้าอีกครั้งแบบชัดเจนได้เลยนะ',
  };
}
