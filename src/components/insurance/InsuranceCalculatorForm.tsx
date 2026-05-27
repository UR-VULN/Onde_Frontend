import React from 'react';
import { useInsuranceStore } from '@/store/useInsuranceStore';

interface InsuranceCalculatorFormProps {
  insuredName: string;
  setInsuredName: (name: string) => void;
  gender: 'M' | 'F';
  setGender: (g: 'M' | 'F') => void;
  isAgreed: boolean;
  setIsAgreed: (agreed: boolean) => void;
  loading: boolean;
  handleApplyPolicy: () => void;
}

export const InsuranceCalculatorForm: React.FC<InsuranceCalculatorFormProps> = ({
  insuredName,
  setInsuredName,
  gender,
  setGender,
  isAgreed,
  setIsAgreed,
  loading,
  handleApplyPolicy
}) => {
  const { insured_details, set_insured_details, premium_estimate } = useInsuranceStore();

  const handle_input_change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    set_insured_details({ [name]: value });
  };

  return (
    <div className="flex flex-col">
      <div 
        style={{ padding: '20px 40px', borderRadius: '12px' }}
        className="bg-white border border-slate-200 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-between"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#005ce6] to-[#ff5a5f] opacity-80"></div>

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
            onClick={handleApplyPolicy}
            className="search-submit-btn w-full py-6 rounded-[22px] text-white font-black text-xl shadow-2xl active:scale-[0.98] transition-all tracking-tight"
          >
            지금 바로 보장받기
          </button>
        </div>
      </div>
    </div>
  );
};
