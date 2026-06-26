import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInsuranceStore } from '@/store/useInsuranceStore';
import { useTravelStore } from '@/store/useTravelStore';
import { InsuranceHeader } from './InsuranceHeader';
import { InsuranceCalculatorForm } from './InsuranceCalculatorForm';
import { InsuranceCoverageGrid } from './InsuranceCoverageGrid';
import { calculate_premium_api, apply_insurance_policy_api } from '@/api/insuranceApi';
import { buildPaymentCheckout } from '@/utils/paymentCheckout';
import { extractApiErrorMessage } from '@/utils/apiResponse';
import type { InsuranceQuotePanelStatus } from '@/components/insurance/insuranceQuoteTypes';

function getQuoteInputIssue(
  details: { birthdate: string; startDate: string; endDate: string }
): string | null {
  if (!details.birthdate || !details.startDate || !details.endDate) {
    return '생년월일과 보장 기간(출발·종료)을 입력해 주세요.';
  }
  const start = new Date(details.startDate);
  const end = new Date(details.endDate);
  if (end.getTime() < start.getTime()) {
    return '보장 종료일은 출발일 이후여야 합니다.';
  }
  return null;
}

function resolveApiErrorMessage(err: unknown): string {
  const msg = extractApiErrorMessage(err, '');
  if (/네트워크|연결|timeout|ECONNREFUSED|fetch/i.test(msg)) {
    return '서버에 연결할 수 없습니다';
  }
  return msg || '서버에 연결할 수 없습니다';
}

export const InsuranceCalculatorWidget: React.FC = () => {
  const navigate = useNavigate();
  const { insured_details, premium_estimate, set_premium_estimate } = useInsuranceStore();
  const { addToast, isLoggedIn, openAuthModal } = useTravelStore();

  const [insuredName, setInsuredName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [isAgreed, setIsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteStatus, setQuoteStatus] = useState<InsuranceQuotePanelStatus>('incomplete');
  const [quoteHint, setQuoteHint] = useState('');

  useEffect(() => {
    const inputIssue = getQuoteInputIssue(insured_details);
    if (inputIssue) {
      setQuoteStatus('incomplete');
      setQuoteHint(inputIssue);
      set_premium_estimate(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const handler = setTimeout(async () => {
      setLoading(true);
      setQuoteStatus('loading');
      setQuoteHint('');
      try {
        const res = await calculate_premium_api({
          insuranceProductId: insured_details.insuranceProductId,
          birthdate: insured_details.birthdate,
          startDate: insured_details.startDate,
          endDate: insured_details.endDate,
          coverageLevel: insured_details.coverageLevel,
        });
        if (cancelled) return;
        if (!res.success || !res.data) {
          set_premium_estimate(null);
          setQuoteStatus('api_error');
          setQuoteHint(res.message || '서버에 연결할 수 없습니다');
          return;
        }
        const d = res.data as unknown as Record<string, unknown>;
        const totalPremium = Number(d.totalPremium ?? d.calculatedPremium ?? 0);
        const tripDays = Number(d.travelDays ?? d.tripDurationDays ?? 1);
        set_premium_estimate({
          insuranceProductId: insured_details.insuranceProductId,
          tripDurationDays: tripDays,
          age: Number(d.age ?? 30),
          ageMultiplier: Number(d.ageMultiplier ?? 1),
          coverageLevel: String(d.coverageLevel ?? insured_details.coverageLevel),
          coverageMultiplier: gender === 'F' ? 0.9 : 1,
          calculatedPremium: totalPremium,
          breakdown: {
            baseDailyRate: Number((d.breakdown as { baseDailyRate?: number })?.baseDailyRate ?? 3500),
            basePremiumWithoutMultipliers: totalPremium,
          },
        });
        setQuoteStatus('ready');
      } catch (err: unknown) {
        if (!cancelled) {
          set_premium_estimate(null);
          setQuoteStatus('api_error');
          setQuoteHint(resolveApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
  }, [
    insured_details.birthdate,
    insured_details.startDate,
    insured_details.endDate,
    insured_details.coverageLevel,
    insured_details.insuranceProductId,
    gender,
    set_premium_estimate,
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
    if (!premium_estimate) {
      if (quoteStatus === 'api_error') {
        addToast('서버에 연결할 수 없습니다', 'warning');
      } else if (getQuoteInputIssue(insured_details)) {
        addToast(getQuoteInputIssue(insured_details)!, 'warning');
      } else {
        addToast('보험료를 먼저 산출해 주십시오.', 'warning');
      }
      return;
    }

    const { openConfirmPopup } = useTravelStore.getState();
    
    openConfirmPopup(async (confirmed) => {
      if (!confirmed) {
        addToast('보험 가입 신청이 취소되었습니다.', 'info');
        return;
      }
      try {
        addToast('보험 가입을 처리 중입니다...', 'info');
        const res = await apply_insurance_policy_api({
          insuranceProductId: insured_details.insuranceProductId,
          insuredName: insuredName.trim(),
          insuredBirthdate: insured_details.birthdate,
          startDate: insured_details.startDate,
          endDate: insured_details.endDate,
          coverageLevel: insured_details.coverageLevel,
          totalPremium: premium_estimate.calculatedPremium,
        });
        if (!res.success || !res.data) {
          addToast(res.message || '보험 가입에 실패했습니다.', 'warning');
          return;
        }
        const policy = res.data;
        setInsuredName('');
        setIsAgreed(false);
        navigate('/payment', {
          state: buildPaymentCheckout({
            reservationType: 'INSURANCE',
            reservationId: policy.policyId ?? 0,
            productTitle: `🛡️ 여행자 보험 (${insured_details.coverageLevel})`,
            productSubtitle: `피보험자: ${insuredName} | 플랜: ${insured_details.coverageLevel}`,
            categoryLabel: '여행자 보험',
            categoryIcon: 'fa-shield-halved',
            totalAmount: policy.totalPremium,
            usedMileage: 0,
            dateSummary: `${insured_details.startDate} ~ ${insured_details.endDate}`,
            detailLines: [
              `피보험자: ${insuredName}`,
              `보장 기간: ${insured_details.startDate} ~ ${insured_details.endDate}`,
              `증권 번호: ${policy.policyCode}`
            ],
            returnPath: '/insurance',
          }),
        });
      } catch (err: unknown) {
        addToast(extractApiErrorMessage(err, '가입 처리 중 오류가 발생했습니다.'), 'warning');
      }
    }, {
      title: '보험에 가입하시겠습니까?',
      description: '입력하신 정보로 여행자 보험 가입을 진행합니다.',
      yesLabel: '가입하기',
      noLabel: '취소',
    });
  };

  return (
    <div className="w-full space-y-8 page-hero-gap pb-6 animate-[fadeIn_0.35s_ease]">
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
          quoteStatus={quoteStatus}
          quoteHint={quoteHint}
          handleApplyPolicy={handle_apply_policy}
        />

        {/* 3. Right Side: Visual Coverage Grid */}
        <InsuranceCoverageGrid />
      </div>
    </div>
  );
};
