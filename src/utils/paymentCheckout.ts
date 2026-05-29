import type { PaymentCheckoutState } from '@/types/payment';

/** mock string id → 백엔드 reservationId (실 API 연동 시 서버 발급값으로 대체) */
export function deriveReservationId(entityId: string): number {
  let hash = 0;
  for (let i = 0; i < entityId.length; i += 1) {
    hash = (hash * 31 + entityId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 900000 + 1;
}

export function buildPaymentCheckout(
  payload: PaymentCheckoutState
): PaymentCheckoutState {
  return payload;
}

export function calcPgAmount(totalAmount: number, usedMileage: number): number {
  return Math.max(0, totalAmount - usedMileage);
}
