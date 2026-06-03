import { userAxios } from '@/api/axiosInstance';
import type { PaymentPrepareDto, PaymentReservationType, PaymentValidateDto } from '@/types/payment';
import { unwrapApi } from '@/utils/apiResponse';

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

export const prepare_payment_api = async (
  body: PaymentPrepareRequest
): Promise<{ success: boolean; data: PaymentPrepareDto; message: string }> => {
  const raw = await userAxios.post('/api/v1/payments/prepare', body);
  return unwrapApi<PaymentPrepareDto>(raw);
};

export const validate_payment_api = async (
  body: PaymentValidateRequest
): Promise<{ success: boolean; data: PaymentValidateDto; message: string }> => {
  const raw = await userAxios.post('/api/v1/payments/validate', body);
  const res = unwrapApi<Record<string, unknown>>(raw);
  const d = res.data;
  return {
    success: res.success,
    message: res.message,
    data: {
      paymentId: Number(d.paymentId ?? 0),
      merchantUid: String(d.merchantUid ?? body.merchantUid),
      status: String(d.status ?? ''),
      amount: Number(d.pgAmount ?? d.totalAmount ?? body.pgAmount),
    },
  };
};

export const cancel_payment_api = async (
  paymentId: number,
  reason: string
): Promise<{ success: boolean; message: string }> => {
  const raw = await userAxios.post(`/api/v1/payments/${paymentId}/cancel`, { reason });
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};
