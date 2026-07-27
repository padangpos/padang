import { describe, it, expect } from 'vitest';
import { parseTextIntent } from '../../lib/ai/intent-parser';

describe('Draft Intent Parser Unit Tests', () => {
  it('should parse sale intent from text', () => {
    const res = parseTextIntent('ป้าแดง ขายน้ำ 3 ขวด เงินสด');
    expect(res.intent).toBe('create_sale');
    expect(res.extractedData.quantity).toBe(3);
    expect(res.extractedData.paymentMethod).toBe('cash');
    expect(res.requiresConfirmation).toBe(true);
  });

  it('should parse expense intent from text', () => {
    const res = parseTextIntent('จดค่าน้ำแข็ง 500 บาท');
    expect(res.intent).toBe('add_expense');
    expect(res.extractedData.amount).toBe(500);
    expect(res.requiresConfirmation).toBe(true);
  });

  it('should handle low confidence / unknown input gracefully', () => {
    const res = parseTextIntent('สวัสดีป้าแดงวันนี้อากาศดี');
    expect(res.intent).toBe('unknown');
    expect(res.confidenceScore).toBeLessThan(0.5);
    expect(res.requiresConfirmation).toBe(true);
  });
});
