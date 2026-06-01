import type { PaymentCheckoutState } from '@/types/payment';

export function buildPaymentCheckout(
  payload: PaymentCheckoutState
): PaymentCheckoutState {
  return payload;
}

export function calcPgAmount(totalAmount: number, usedMileage: number): number {
  return Math.max(0, totalAmount - usedMileage);
}
