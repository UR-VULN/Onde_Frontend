import { userAxios } from '@/api/axiosInstance';
import type { PremiumEstimate } from '@/store/useInsuranceStore';
import { unwrapApi } from '@/utils/apiResponse';

export interface CalculatePremiumPayload {
  insuranceProductId: number;
  birthdate: string;
  startDate: string;
  endDate: string;
  coverageLevel: string;
}

export const calculate_premium_api = async (
  payload: CalculatePremiumPayload
): Promise<{ success: boolean; data: PremiumEstimate; message: string }> => {
  const raw = await userAxios.post('/api/v1/insurances/calculate', {
    productId: payload.insuranceProductId,
    insuranceProductId: payload.insuranceProductId,
    birthdate: payload.birthdate,
    startDate: payload.startDate,
    endDate: payload.endDate,
    coverageLevel: payload.coverageLevel,
  }, { skipErrorRedirect: true });
  return unwrapApi<PremiumEstimate>(raw);
};

export interface InsuranceReservationPayload {
  insuranceProductId: number;
  insuredName: string;
  insuredBirthdate: string;
  startDate: string;
  endDate: string;
  coverageLevel: string;
  totalPremium: number;
}

export interface InsurancePolicyResponse {
  policyCode: string;
  insuredName: string;
  startDate?: string;
  endDate?: string;
  totalPremium: number;
  status: string;
  coverageLevel?: string;
}

export const apply_insurance_policy_api = async (
  payload: InsuranceReservationPayload
): Promise<{ success: boolean; data: InsurancePolicyResponse; message: string }> => {
  const raw = await userAxios.post('/api/v1/reservations/insurances', {
    productId: payload.insuranceProductId,
    insuranceProductId: payload.insuranceProductId,
    insuredName: payload.insuredName,
    insuredBirthdate: payload.insuredBirthdate,
    startDate: payload.startDate,
    endDate: payload.endDate,
    coverageLevel: payload.coverageLevel,
    totalPremium: payload.totalPremium,
  }, { skipErrorRedirect: true });
  return unwrapApi<InsurancePolicyResponse>(raw);
};

export interface RegisterInsuranceProductPayload {
  productName: string;
  baseDailyRate: number;
  coverageDetails: Record<string, string> | string;
}

export const seller_register_insurance_rate_api = async (
  payload: RegisterInsuranceProductPayload
): Promise<{ success: boolean; message: string }> => {
  const raw = await userAxios.post('/api/v1/seller/insurances', payload);
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};
