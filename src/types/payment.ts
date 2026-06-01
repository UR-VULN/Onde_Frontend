export type PaymentReservationType = 'ROOM' | 'FLIGHT' | 'CAR' | 'INSURANCE';

/** 예약 모달 → 결제 페이지로 전달하는 주문 스냅샷 */
export interface PaymentCheckoutState {
  reservationType: PaymentReservationType;
  reservationId: number;
  /** 항공 예약 확정용 (백엔드 bookingCode) */
  flightBookingCode?: string;
  productTitle: string;
  productSubtitle: string;
  productImageUrl?: string;
  categoryLabel: string;
  categoryIcon: string;
  totalAmount: number;
  usedMileage: number;
  dateSummary: string;
  detailLines?: string[];
  returnPath: string;
}

export interface PaymentPrepareDto {
  merchantUid: string;
  pgAmount: number;
  usedMileage: number;
  reservationId: number;
}

export interface PaymentValidateDto {
  paymentId: number;
  merchantUid: string;
  status: string;
  amount: number;
}
