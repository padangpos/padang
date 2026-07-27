import { describe, it, expect } from 'vitest';
import {
  calculateCartSubtotal,
  calculateDiscount,
  calculateTax,
  calculateGrandTotal,
  calculateChange,
} from '../../lib/pos/calculator';

describe('POS Calculator Unit Tests', () => {
  it('should correctly calculate subtotal for items', () => {
    const items = [
      { unitPrice: 50, quantity: 2 }, // 100
      { unitPrice: 65, quantity: 1 }, // 65
    ];
    expect(calculateCartSubtotal(items)).toBe(165);
  });

  it('should correctly calculate fixed discount', () => {
    expect(calculateDiscount(100, 'fixed', 20)).toBe(20);
    expect(calculateDiscount(100, 'fixed', 150)).toBe(100); // capped at subtotal
  });

  it('should correctly calculate percentage discount', () => {
    expect(calculateDiscount(200, 'percent', 10)).toBe(20);
    expect(calculateDiscount(100, 'percent', 10)).toBe(10);
  });

  it('should correctly calculate 7% VAT', () => {
    expect(calculateTax(100, 7, false)).toBe(7);
  });

  it('should calculate grand total and change cash accurately', () => {
    const subtotal = 500;
    const discount = 50; // 450
    const tax = calculateTax(450, 7, false); // 31.5
    const grandTotal = calculateGrandTotal(subtotal, discount, tax, false); // 481.5

    expect(grandTotal).toBe(481.5);
    expect(calculateChange(481.5, 500)).toBe(18.5);
    expect(calculateChange(481.5, 400)).toBe(0); // insufficient cash
  });
});
