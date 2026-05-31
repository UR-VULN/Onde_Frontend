import { userAxios } from '@/api/axiosInstance';
import type { PremiumEstimate } from '@/store/useInsuranceStore';

/** 명세: POST /api/v1/insurance/calculate */
export interface CalculatePremiumPayload {
  productId: number;
  birthdate: string;
  destination?: string;
  startDate: string;
  endDate: string;
  coverageLevel: string;
}

export const calculate_premium_api = async (
  payload: CalculatePremiumPayload
): Promise<{ success: boolean; data: PremiumEstimate; message: string }> => {
  return userAxios.post('/api/v1/insurance/calculate', payload);
};

/** 명세: POST /api/v1/reservations/insurances */
export interface InsuranceReservationPayload {
  productId: number;
  insuredName: string;
  insuredBirthdate: string;
  startDate: string;
  endDate: string;
  coverageLevel: string;
}

export interface InsurancePolicyResponse {
  policyId: number;
  policyCode: string;
  productName: string;
  insuredName: string;
  startDate: string;
  endDate: string;
  totalPremium: number;
  status: string;
}

export const apply_insurance_policy_api = async (
  payload: InsuranceReservationPayload
): Promise<{ success: boolean; data: InsurancePolicyResponse; message: string }> => {
  return userAxios.post('/api/v1/reservations/insurances', payload);
};

/** 명세: POST /api/v1/seller/insurance */
export interface RegisterInsuranceProductPayload {
  productName: string;
  baseDailyRate: number;
  coverageDetails: Record<string, string> | string;
}

export const seller_register_insurance_rate_api = async (
  payload: RegisterInsuranceProductPayload
): Promise<{ success: boolean; message: string }> => {
  const body =
    typeof payload.coverageDetails === 'string'
      ? payload
      : { ...payload, coverageDetails: JSON.stringify(payload.coverageDetails) };
  return userAxios.post('/api/v1/seller/insurance', body);
};
