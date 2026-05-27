import { userAxios } from '@/api/axiosInstance';
import type { PremiumEstimate } from '@/store/useInsuranceStore';

// 1. 고객용 실시간 동적 보험료 사전 계산
export interface CalculatePremiumPayload {
  insuranceProductId: number;
  birthdate: string;
  startDate: string;
  endDate: string;
  coverageLevel: string; // STANDARD, DELUXE, PREMIUM
}

export const calculate_premium_api = async (payload: CalculatePremiumPayload): Promise<{ success: boolean; data: PremiumEstimate; message: string }> => {
  return userAxios.post('/api/v1/insurance/calculate', payload);
};

// 2. 고객용 여행자 보험 최종 가입 신청 (JWT 인증 필수)
export interface ApplyPolicyPayload {
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
  coverageLevel: string;
  totalPremium: number;
  status: string;
}

export const apply_insurance_policy_api = async (payload: ApplyPolicyPayload): Promise<{ success: boolean; data: InsurancePolicyResponse; message: string }> => {
  return userAxios.post('/api/v1/insurance/policies', payload);
};

// 3. 판매자(보험사 파트너)용 신규 보험 요율 상품 등록 제안
export interface RegisterInsuranceProductPayload {
  productName: string;
  baseDailyRate: number;
  coverageDetails: string; // Stringified JSON
}

export const seller_register_insurance_rate_api = async (payload: RegisterInsuranceProductPayload): Promise<{ success: boolean; message: string }> => {
  return userAxios.post('/api/v1/seller/insurance', payload);
};
