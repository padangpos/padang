export interface CartItemInput {
  unitPrice: number;
  quantity: number;
}

export type DiscountType = 'fixed' | 'percent';

export function calculateCartSubtotal(items: CartItemInput[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function calculateDiscount(
  subtotal: number,
  discountType: DiscountType = 'fixed',
  discountValue: number = 0
): number {
  if (discountValue <= 0) return 0;
  if (discountType === 'percent') {
    const calculated = (subtotal * discountValue) / 100;
    return Math.min(calculated, subtotal);
  }
  return Math.min(discountValue, subtotal);
}

export function calculateTax(
  amountAfterDiscount: number,
  taxRate: number = 7,
  isInclusive: boolean = false
): number {
  if (taxRate <= 0) return 0;
  if (isInclusive) {
    return (amountAfterDiscount * taxRate) / (100 + taxRate);
  }
  return (amountAfterDiscount * taxRate) / 100;
}

export function calculateGrandTotal(
  subtotal: number,
  discountAmount: number = 0,
  taxAmount: number = 0,
  isTaxInclusive: boolean = false
): number {
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  if (isTaxInclusive) {
    return afterDiscount;
  }
  return afterDiscount + taxAmount;
}

export function calculateChange(grandTotal: number, tenderedAmount: number): number {
  if (tenderedAmount < grandTotal) return 0;
  return Math.max(0, tenderedAmount - grandTotal);
}
