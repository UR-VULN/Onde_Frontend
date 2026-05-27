import React, { useState, useEffect } from 'react';
import { useInsuranceStore } from '@/store/useInsuranceStore';
import { useTravelStore } from '@/store/useTravelStore';
// import { calculate_premium_api, apply_insurance_policy_api } from '@/api/insuranceApi';

export const InsuranceCalculatorWidget: React.FC = () => {
  const { insured_details, set_insured_details, premium_estimate, set_premium_estimate } = useInsuranceStore();
  const { addToast, isLoggedIn, addReservation, setActivePage } = useTravelStore();

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
      
      // Calculate local mock premium directly to avoid offline network errors
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
    gender
  ]);

  const handle_input_change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    set_insured_details({ [name]: value });
  };

  const handle_apply_policy = async () => {
    if (!isLoggedIn) {
      addToast("로그인 후에 보험에 가입해 주십시오.", "warning");
      setActivePage('flight'); // Redirect to main for focus
      return;
    }
    if (!insuredName.trim()) {
      addToast("피보험자 실명을 입력해 주십시오.", "warning");
      return;
    }
    if (!isAgreed) {
      addToast("보장 약관 동의가 필요합니다.", "warning");
      return;
    }
    if (!premium_estimate) {
      addToast("보험료를 먼저 산출해 주십시오.", "warning");
      return;
    }

    const { openConfirmPopup } = useTravelStore.getState();
    
    openConfirmPopup(async (confirmed) => {
      if (confirmed) {
        try {
          addToast("보험 가입 서명을 등록 중입니다...", "info");
          
          // Mimic backend network delay for offline experience
          await new Promise((resolve) => setTimeout(resolve, 800));

          const mockPolicyCode = `POL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

          addToast("여행자 보험 가입이 최종 승인 완료되었습니다!", "success");

          // Add to MyPage Reservation Dashboard list dynamically
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
        } catch (err: any) {
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
        
        {/* Header Section */}
        <div className="text-center space-y-10 pt-16">
          {/* Explicit spacer in the exact position of the removed badge */}
          <div className="h-16 w-full"></div>
          
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
            낯선 곳에서의 일상도 안심할 수 있도록,<br />
            <span className="highlight-text">온데 안심 여행자 보험</span>
          </h2>
          <div 
            style={{ margin: '16px 0' }}
            className="flex justify-center w-full"
          >
            <p className="text-slate-500 font-medium max-w-2xl text-lg leading-relaxed text-center">
              복잡한 서류 없이 1분 만에 가입하고, 해외 상해부터 수하물 지연까지<br />
              당신의 모든 여정을 든든하게 지켜드립니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch px-4">
          
          {/* Left Side: Calculator Form (Symmetrical Balanced Column) */}
          <div className="flex flex-col">
            <div 
              style={{ padding: '20px 40px', borderRadius: '12px' }}
              className="bg-white border border-slate-200 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary opacity-80"></div>

              <div className="space-y-8 w-full mt-4">
                <div className="flex items-center gap-5 pb-8 border-b border-slate-100">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary shadow-sm border border-slate-100 text-2xl">
                    <i className="fa-solid fa-file-signature"></i>
                  </div>
                  <div>
                    <h4 className="font-logo font-black text-2xl text-slate-800 tracking-tight">보험료 계산기</h4>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Premium Calculator</p>
                  </div>
                </div>

                <div 
                  className="space-y-8"
                  style={{ marginTop: '40px' }}
                >
                  <div className="form-group">
                    <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">피보험자 성명</label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0"
                        style={{ borderRadius: '4px' }}
                      >
                        <i className="fa-solid fa-user text-lg"></i>
                      </div>
                      <input
                        type="text"
                        value={insuredName}
                        onChange={(e) => setInsuredName(e.target.value)}
                        className="flex-grow bg-white border border-slate-200 px-5 py-3 text-base font-bold text-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                        style={{ borderRadius: '4px' }}
                        placeholder="실명을 입력해 주세요"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">성별 선택</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                          <i className="fa-solid fa-venus-mars text-lg"></i>
                        </div>
                        <div className="flex-grow grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-md border border-slate-100">
                          <button
                            type="button"
                            onClick={() => setGender('M')}
                            className={`py-2.5 rounded-sm text-sm font-black transition-all flex items-center justify-center gap-2 ${
                              gender === 'M'
                                ? 'bg-white text-primary shadow-sm border border-slate-100'
                                : 'text-slate-400 hover:text-slate-500'
                            }`}
                          >
                            <i className="fa-solid fa-mars"></i> 남성
                          </button>
                          <button
                            type="button"
                            onClick={() => setGender('F')}
                            className={`py-2.5 rounded-sm text-sm font-black transition-all flex items-center justify-center gap-2 ${
                              gender === 'F'
                                ? 'bg-white text-secondary shadow-sm border border-slate-100'
                                : 'text-slate-400 hover:text-slate-500'
                            }`}
                          >
                            <i className="fa-solid fa-venus"></i> 여성
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">피보험자 생년월일</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                          <i className="fa-solid fa-cake-candles text-lg"></i>
                        </div>
                        <input
                          type="date"
                          name="birthdate"
                          value={insured_details.birthdate}
                          onChange={handle_input_change}
                          className="flex-grow bg-white border border-slate-200 rounded-md px-4 py-3 text-base font-bold text-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">보장 출발</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                          <i className="fa-solid fa-plane-departure text-lg"></i>
                        </div>
                        <input
                          type="date"
                          name="startDate"
                          value={insured_details.startDate}
                          onChange={handle_input_change}
                          className="flex-grow bg-white border border-slate-200 rounded-md px-4 py-3 text-base font-bold text-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">보장 종료</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-md flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                          <i className="fa-solid fa-plane-arrival text-lg"></i>
                        </div>
                        <input
                          type="date"
                          name="endDate"
                          value={insured_details.endDate}
                          onChange={handle_input_change}
                          className="flex-grow bg-white border border-slate-200 rounded-md px-4 py-3 text-base font-bold text-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="text-[13px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">보장 등급 선택</label>
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                      {['STANDARD', 'DELUXE', 'PREMIUM'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => set_insured_details({ coverageLevel: level })}
                          className={`py-3.5 rounded-lg text-sm font-black transition-all tracking-widest ${
                            insured_details.coverageLevel === level
                              ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                              : 'text-slate-400 hover:text-slate-500'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dynamic Result Panel */}
                <div 
                  style={{ padding: '24px 28px', borderRadius: '12px', height: '200px' }}
                  className="bg-slate-900 text-white relative overflow-hidden shadow-2xl animate-[fadeIn_0.3s_ease] flex flex-col justify-center"
                >
                  {loading ? (
                    <div className="flex flex-col items-center justify-center gap-5">
                      <i className="fa-solid fa-circle-notch animate-spin text-3xl text-primary"></i>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pricing...</p>
                    </div>
                  ) : premium_estimate ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b border-white/10 pb-5 uppercase">
                        <span>{premium_estimate.tripDurationDays}일 보장</span>
                        <span>{premium_estimate.age}세 기준</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-400 font-bold uppercase">Plan</span>
                          <span className="text-sm font-black text-primary-light uppercase tracking-widest">{premium_estimate.coverageLevel}</span>
                        </div>
                        <div className="flex justify-between items-end pt-2">
                          <span className="text-lg font-black text-white">최종 보험료</span>
                          <div className="text-right">
                            <span className="block text-[10px] text-slate-500 line-through font-bold mb-1 opacity-50">₩{(premium_estimate.calculatedPremium * 1.2).toLocaleString()}</span>
                            <span className="text-4xl font-black text-secondary tracking-tighter">
                              ₩{premium_estimate.calculatedPremium.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <i className="fa-solid fa-shield-cat text-4xl text-slate-700"></i>
                      </div>
                      <div className="space-y-2">
                        <p className="text-base font-bold text-slate-500">정보를 모두 입력하시면</p>
                        <p className="text-base font-medium text-slate-400">맞춤 보험료를 계산해 드립니다</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div 
                className="space-y-8 w-full"
                style={{ paddingTop: '10px', paddingBottom: '40px' }}
              >
                <label 
                  className="flex items-start gap-5 cursor-pointer group px-2"
                  style={{ padding: '16px 0' }}
                >
                  <div className="relative flex items-center mt-1 shrink-0">
                    <input
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="peer h-7 w-7 cursor-pointer appearance-none rounded-xl border-2 border-slate-200 transition-all checked:bg-emerald-500 checked:border-emerald-500 shadow-sm"
                    />
                    <i className="fa-solid fa-check absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                  </div>
                  <span className="text-xs font-bold text-slate-500 leading-relaxed group-hover:text-slate-700 transition-colors pt-0.5">
                    ONDE Protect 안심 케어 보장 약관 및 중요 고지 사항을 충분히 검토하였으며 이에 서명 동의합니다.
                  </span>
                </label>

                <button
                  type="button"
                  onClick={handle_apply_policy}
                  className="search-submit-btn w-full py-6 rounded-[22px] text-white font-black text-xl shadow-2xl active:scale-[0.98] transition-all tracking-tight"
                >
                  지금 바로 보장받기
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Visual Coverage Grid (Symmetrical Balanced Column) */}
          <div className="flex flex-col space-y-8">
            <div className="grid grid-cols-1 gap-8 flex-1">
              
              {/* Plan Cards */}
              {[
                {
                  level: 'STANDARD',
                  desc: '합리적인 가격으로 실속 있는 보장',
                  price: '평균 ₩9,000~',
                  benefits: ['해외 상해/질병 치료 1,000만 원', '휴대품 손해/분실 50만 원', '국내외 배상책임 500만 원'],
                  color: 'slate',
                  isPopular: false
                },
                {
                  level: 'DELUXE',
                  desc: '가장 많은 여행자가 선택하는 대표 안심 플랜',
                  price: '평균 ₩29,000~',
                  benefits: ['해외 상해/질병 치료 3,000만 원', '휴대품 손해/분실 100만 원', '국내외 배상책임 1,000만 원', '여권 분실 재발급 비용 및 수수료 지원'],
                  color: 'primary',
                  isPopular: true
                },
                {
                  level: 'PREMIUM',
                  desc: '어떤 돌발 상황에서도 완벽한 최고 등급 VIP 전용 보장',
                  price: '평균 ₩49,000~',
                  benefits: ['해외 상해/질병 치료 5,000만 원 실손 보장', '휴대품 손해/분실 200만 원 최고 한도', '국내외 배상책임 3,000만 원 보장', '항공기 지연 및 수하물 도착 지연 보상', '24시간 한국어 핫라인 긴급구조 및 의료 송환'],
                  color: 'secondary',
                  isPopular: false
                }
              ].map((plan) => (
                <div 
                  key={plan.level}
                  onClick={() => set_insured_details({ coverageLevel: plan.level })}
                  style={{ padding: '20px 40px', borderRadius: '12px' }}
                  className={`group relative bg-white border-2 transition-all cursor-pointer hover:shadow-2xl flex flex-col justify-center ${
                    insured_details.coverageLevel === plan.level 
                      ? (plan.color === 'primary' ? 'border-primary shadow-xl scale-[1.01]' : plan.color === 'secondary' ? 'border-secondary shadow-xl scale-[1.01]' : 'border-slate-800 shadow-xl scale-[1.01]')
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {plan.isPopular && (
                    <span 
                      style={{ left: '40px' }}
                      className="absolute -top-3.5 bg-primary text-white text-[10px] font-black px-5 py-2 rounded-full shadow-lg z-10 tracking-widest"
                    >
                      MOST POPULAR
                    </span>
                  )}
                  
                  <div className="flex justify-between items-center gap-4">
                    <h5 className={`text-3xl font-black tracking-tight ${
                      plan.color === 'primary' ? 'text-primary' : plan.color === 'secondary' ? 'text-secondary' : 'text-slate-800'
                    }`}>
                      {plan.level}
                    </h5>
                    <div className="text-right shrink-0">
                      <span className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Start From</span>
                      <span className="text-2xl font-black text-slate-800 tracking-tight">{plan.price}</span>
                    </div>
                  </div>

                  <p 
                    style={{ margin: '18px 0' }}
                    className="text-sm font-bold text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {plan.desc}
                  </p>

                  <ul className="grid grid-cols-1 gap-y-1 mb-4">
                    {plan.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 py-0.5 text-[15px] font-bold text-slate-600 leading-tight whitespace-nowrap">
                        <i className={`fa-solid fa-circle-check mt-1 text-base shrink-0 ${
                          plan.color === 'primary' ? 'text-primary/60' : plan.color === 'secondary' ? 'text-secondary/60' : 'text-slate-600'
                        }`}></i>
                        <span className="leading-tight">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`mt-4 pt-4 border-t border-slate-50 flex items-center justify-between transition-all duration-500 ${
                    insured_details.coverageLevel === plan.level ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
                  }`}>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Coverage</span>
                    <i className="fa-solid fa-check-double text-xl text-primary"></i>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </div>
  );
};
