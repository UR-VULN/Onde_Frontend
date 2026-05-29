import { userAxios } from '@/api/axiosInstance';
import type { PaymentPrepareDto, PaymentReservationType, PaymentValidateDto } from '@/types/payment';

export interface PaymentPrepareRequest {
  reservationId: number;
  reservationType: PaymentReservationType;
  usedMileage: number;
  totalAmount: number;
}

export interface PaymentValidateRequest {
  impUid: string;
  merchantUid: string;
  pgAmount: number;
}

function paymentHeaders() {
  const memberId = localStorage.getItem('onde_member_id');
  return memberId ? { 'X-User-Id': memberId } : {};
}

export const prepare_payment_api = async (
  body: PaymentPrepareRequest
): Promise<{ success: boolean; data: PaymentPrepareDto; message: string }> => {
  return userAxios.post('/api/v1/payments/prepare', body, {
    headers: paymentHeaders(),
  });
};

export const validate_payment_api = async (
  body: PaymentValidateRequest
): Promise<{ success: boolean; data: PaymentValidateDto; message: string }> => {
  return userAxios.post('/api/v1/payments/validate', body, {
    headers: paymentHeaders(),
  });
};
