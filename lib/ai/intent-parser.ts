export interface ParsedDraftResult {
  intent: 'create_sale' | 'add_expense' | 'import_menu' | 'stock_query' | 'unknown';
  confidenceScore: number;
  extractedData: Record<string, unknown>;
  requiresConfirmation: boolean;
  userMessage: string;
}

function parseThaiIntent(text: string): ParsedDraftResult | null {
  if (/ขาย|คิดเงิน|sell|checkout/i.test(text)) {
    const qtyMatch = text.match(/(\d+)\s*(?:ขวด|แก้ว|ถุง|ชิ้น|รายการ|หน่วย)?/u);
    const quantity = qtyMatch ? Number(qtyMatch[1]) : 1;
    const paymentMethod = /เงินสด|cash/i.test(text) ? 'cash' : 'promptpay';
    const productName = text
      .replace(/ป้าแดง|ขาย|คิดเงิน|sell|checkout|เงินสด|โอน|พร้อมเพย์|cash|promptpay/gi, ' ')
      .replace(/\d+/g, ' ')
      .replace(/ขวด|แก้ว|ถุง|ชิ้น|รายการ|หน่วย/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return {
      intent: 'create_sale',
      confidenceScore: 0.92,
      extractedData: { rawInput: text, quantity, paymentMethod, productName },
      requiresConfirmation: true,
      userMessage: `เตรียมรายการขาย ${quantity} รายการ กรุณาตรวจสอบก่อนยืนยัน`,
    };
  }
  if (/จดค่า|รายจ่าย|ซื้อ/i.test(text)) {
    const amountMatch = text.match(/(\d+(?:\.\d+)?)/);
    const amount = amountMatch ? Number(amountMatch[1]) : 0;
    return {
      intent: 'add_expense',
      confidenceScore: 0.90,
      extractedData: { rawInput: text, amount, category: 'operating_expense' },
      requiresConfirmation: true,
      userMessage: `เตรียมรายการค่าใช้จ่าย ${amount} บาท กรุณาตรวจสอบก่อนยืนยัน`,
    };
  }
  return null;
}

export function parseTextIntent(inputText: string): ParsedDraftResult {
  const text = inputText.trim();
  const thaiResult = parseThaiIntent(text);
  if (thaiResult) return thaiResult;
  const isSale = text.includes('เธเธฒเธข') || /ขาย|คิดเงิน|sell|checkout/i.test(text);

  if (isSale || text.includes('เธเธดเธ”เน€เธเธดเธ')) {
    const qtyMatch = text.match(/(\d+)\s*(?:ขวด|แก้ว|ถุง|ชิ้น|รายการ|หน่วย|เธเธงเธ”)?/u);
    const quantity = qtyMatch ? Number(qtyMatch[1]) : 1;
    const isCash = text.includes('เน€เธเธดเธเธชเธ”') || /เงินสด|cash/i.test(text);
    const paymentMethod = isCash || !/โอน|พร้อมเพย์|promptpay/i.test(text) ? 'cash' : 'promptpay';
    const productName = text
      .replace(/ป้าแดง|ขาย|คิดเงิน|sell|checkout|เงินสด|โอน|พร้อมเพย์|cash|promptpay/gi, ' ')
      .replace(/เธเธฒเธข|เธเธดเธ”เน€เธเธดเธ|เน€เธเธดเธเธชเธ”|เนเธญเธ/g, ' ')
      .replace(/\d+/g, ' ')
      .replace(/ขวด|แก้ว|ถุง|ชิ้น|รายการ|หน่วย/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      intent: 'create_sale',
      confidenceScore: 0.92,
      extractedData: { rawInput: text, quantity, paymentMethod, productName },
      requiresConfirmation: true,
      userMessage: `เตรียมรายการขาย ${quantity} รายการ กรุณาตรวจสอบก่อนยืนยัน`,
    };
  }

  if (text.includes('เธเธ”เธ') || /จดค่า|รายจ่าย|ซื้อ/i.test(text)) {
    const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:บาท|เธเธฒเธ—)?/);
    const amount = amountMatch ? Number(amountMatch[1]) : 0;
    return {
      intent: 'add_expense',
      confidenceScore: 0.90,
      extractedData: { rawInput: text, amount, category: 'operating_expense' },
      requiresConfirmation: true,
      userMessage: `เตรียมรายการค่าใช้จ่าย ${amount} บาท กรุณาตรวจสอบก่อนยืนยัน`,
    };
  }

  return {
    intent: 'unknown',
    confidenceScore: 0.40,
    extractedData: { rawInput: text },
    requiresConfirmation: true,
    userMessage: 'ยังไม่แน่ใจรายการนี้ กรุณาลองบอกใหม่ให้ชัดเจน',
  };
}
