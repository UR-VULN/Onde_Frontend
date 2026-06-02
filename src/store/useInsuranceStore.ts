import { create } from 'zustand';

export interface InsuredDetails {
  insuranceProductId: number;
  name: string;
  birthdate: string;
  startDate: string;
  endDate: string;
  coverageLevel: string; // STANDARD, DELUXE, PREMIUM
}

export interface PremiumBreakdown {
  baseDailyRate: number;
  basePremiumWithoutMultipliers: number;
}

export interface PremiumEstimate {
  insuranceProductId: number;
  tripDurationDays: number;
  age: number;
  ageMultiplier: number;
  coverageLevel: string;
  coverageMultiplier: number;
  calculatedPremium: number;
  breakdown: PremiumBreakdown;
}

interface InsuranceState {
  insured_details: InsuredDetails;
  premium_estimate: PremiumEstimate | null;
  
  set_insured_details: (details: Partial<InsuredDetails>) => void;
  set_premium_estimate: (estimate: PremiumEstimate | null) => void;
}

export const useInsuranceStore = create<InsuranceState>((set) => ({
  insured_details: {
    insuranceProductId: 1,
    name: '',
    birthdate: '1995-05-25',
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    coverageLevel: 'DELUXE'
  },
  premium_estimate: null,

  set_insured_details: (details) => set((state) => ({
    insured_details: { ...state.insured_details, ...details }
  })),

  set_premium_estimate: (estimate) => set({ premium_estimate: estimate })
}));
