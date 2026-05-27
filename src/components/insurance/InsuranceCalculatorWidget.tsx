import React, { useState, useEffect } from 'react';
import { useInsuranceStore } from '@/store/useInsuranceStore';
import { useTravelStore } from '@/store/useTravelStore';
import { InsuranceHeader } from './InsuranceHeader';
import { InsuranceCalculatorForm } from './InsuranceCalculatorForm';
import { InsuranceCoverageGrid } from './InsuranceCoverageGrid';

export const InsuranceCalculatorWidget: React.FC = () => {
  const { insured_details, premium_estimate, set_premium_estimate } = useInsuranceStore();
  const { addToast, isLoggedIn, addReservation, openAuthModal } = useTravelStore();

  const [insuredName, setInsuredName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  // 400ms Debouncing for local calculation (Offline development mode)
  useEffect(() => {
    const triggerCalculation = () => {
      if (!insured_details.birthdate || !insured_details.startDate || !insured_details.endDate) {
        return;
      }
      
      const start = new Date(insured_details.startDate);
      const end = new Date(insured_details.endDate);
      if (end.getTime() < start.getTime()) {
        return;
      }

      setLoading(true);
      
      try {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const tripDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Calculate age
        const birth = new Date(insured_details.birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }

        // Set base plan rate based on coverage level: STANDARD (9,000 KRW), DELUXE (29,000 KRW), PREMIUM (49,000 KRW)
        let basePlanRate = 29000; // DELUXE
        if (insured_details.coverageLevel === 'STANDARD') basePlanRate = 9000;
        else if (insured_details.coverageLevel === 'PREMIUM') basePlanRate = 49000;

        // Gender multiplier: Male (1.0), Female (0.9 - 10% discount for females)
        const genderMultiplier = gender === 'F' ? 0.9 : 1.0;

        // Age multiplier: under 20 (0.8), 20-39 (1.0), 40-59 (1.25), 60+ (1.6)
        let ageMultiplier = 1.0;
        if (age < 20) ageMultiplier = 0.8;
        else if (age >= 20 && age < 40) ageMultiplier = 1.0;
        else if (age >= 40 && age < 60) ageMultiplier = 1.25;
        else ageMultiplier = 1.6;

        // Daily scale factor: base price is for 1 day, then +10% base price for each additional day
        const dayFactor = 1 + (tripDays - 1) * 0.1;

        const calculatedPremium = Math.floor((basePlanRate * dayFactor * ageMultiplier * genderMultiplier) / 10) * 10;

        set_premium_estimate({
          insuranceProductId: insured_details.insuranceProductId,
          tripDurationDays: tripDays,
          age: age,
          ageMultiplier: ageMultiplier,
          coverageLevel: insured_details.coverageLevel,
          coverageMultiplier: genderMultiplier,
          calculatedPremium: calculatedPremium,
          breakdown: {
            baseDailyRate: Math.floor(basePlanRate / 10),
            basePremiumWithoutMultipliers: basePlanRate
          }
        });
      } catch (err) {
        console.error("Local premium calculation error:", err);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      triggerCalculation();
    }, 400);

    return () => clearTimeout(handler);
  }, [
    insured_details.birthdate,
    insured_details.startDate,
    insured_details.endDate,
    insured_details.coverageLevel,
    gender,
    set_premium_estimate
  ]);

  const handle_apply_policy = async () => {
    // 1. Check Login state first
    if (!isLoggedIn) {
      addToast("로그인 후에 여행자 보험에 가입하실 수 있습니다.", "warning");
      openAuthModal('login');
      return;
    }
    // 2. Check Agreement (Signature) state second
    if (!isAgreed) {
      addToast("서명에 동의해주셔야 가입을 진행할 수 있습니다.", "warning");
      return;
    }
    // 3. Check Name
    if (!insuredName.trim()) {
      addToast("피보험자 실명을 입력해 주십시오.", "warning");
      return;
    }
    // 4. Check premium estimate
    if (!premium_estimate) {
      addToast("보험료를 먼저 산출해 주십시오.", "warning");
      return;
    }

    const { openConfirmPopup } = useTravelStore.getState();
    
    openConfirmPopup(async (confirmed) => {
      if (confirmed) {
        try {
          addToast("보험 가입 서명을 등록 중입니다...", "info");
          
          await new Promise((resolve) => setTimeout(resolve, 800));

          const mockPolicyCode = `POL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

          addToast("여행자 보험 가입이 최종 승인 완료되었습니다!", "success");

          addReservation({
            id: mockPolicyCode,
            category: 'ins',
            title: `🛡️ ONDE Protect 안심 여행자 보험 (${insured_details.coverageLevel})`,
            badge: '가입 완료',
            badgeType: 'active',
            date: `${insured_details.startDate} ~ ${insured_details.endDate} (보장 기간)`,
            details: `피보험자: ${insuredName} | 보장 플랜: ${insured_details.coverageLevel} | 증권 코드: ${mockPolicyCode}`,
            price: `₩${premium_estimate.calculatedPremium.toLocaleString()}`
          });

          // Reset Form
          setInsuredName('');
          setIsAgreed(false);
        } catch {
          addToast("가입 처리 중 오류가 발생했습니다.", "warning");
        }
      } else {
        addToast("보험 가입 신청이 취소되었습니다.", "info");
      }
    }, {
      title: "결제 하시겠습니까?",
      description: "선택하신 보장 플랜으로 보험 가입 및 결제를 진행합니다.",
      yesLabel: "결제하기",
      noLabel: "조금 더 생각해볼게요"
    });
  };

  return (
    <div className="w-full space-y-16 pt-32 pb-6 animate-[fadeIn_0.35s_ease]">
      {/* 1. Header Area */}
      <InsuranceHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch px-4">
        {/* 2. Left Side: Calculator Form */}
        <InsuranceCalculatorForm
          insuredName={insuredName}
          setInsuredName={setInsuredName}
          gender={gender}
          setGender={setGender}
          isAgreed={isAgreed}
          setIsAgreed={setIsAgreed}
          loading={loading}
          handleApplyPolicy={handle_apply_policy}
        />

        {/* 3. Right Side: Visual Coverage Grid */}
        <InsuranceCoverageGrid />
      </div>
    </div>
  );
};
