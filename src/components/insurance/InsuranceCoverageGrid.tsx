import React from 'react';
import { useInsuranceStore } from '@/store/useInsuranceStore';

export const InsuranceCoverageGrid: React.FC = () => {
  const { insured_details, set_insured_details } = useInsuranceStore();

  const plans = [
    {
      level: 'STANDARD',
      desc: '합리적인 가격으로 실속 있는 보장',
      price: '평균 ₩9,000~',
      benefits: ['해외 상해/질병 치료 1,000만 원', '휴대품 손해/분실 50만 원', '국내외 배상책임 500만 원'],
      color: 'slate',
    },
    {
      level: 'DELUXE',
      desc: '가장 많은 여행자가 선택하는 대표 안심 플랜',
      price: '평균 ₩29,000~',
      benefits: ['해외 상해/질병 치료 3,000만 원', '휴대품 손해/분실 100만 원', '국내외 배상책임 1,000만 원', '여권 분실 재발급 비용 및 수수료 지원'],
      color: 'primary',
    },
    {
      level: 'PREMIUM',
      desc: '어떤 돌발 상황에서도 완벽한 최고 등급 VIP 전용 보장',
      price: '평균 ₩49,000~',
      benefits: ['해외 상해/질병 치료 5,000만 원 실손 보장', '휴대품 손해/분실 200만 원 최고 한도', '국내외 배상책임 3,000만 원 보장', '항공기 지연 및 수하물 도착 지연 보상', '24시간 한국어 핫라인 긴급구조 및 의료 송환'],
      color: 'secondary',
    }
  ];

  return (
    <div className="flex flex-col space-y-8">
      <div className="grid grid-cols-1 gap-8 flex-1">
        
        {/* Plan Cards */}
        {plans.map((plan) => (
          <div 
            key={plan.level}
            onClick={() => {
              const productIdMap: Record<string, number> = {
                STANDARD: 1,
                DELUXE: 2,
                PREMIUM: 3
              };
              set_insured_details({ 
                coverageLevel: plan.level,
                insuranceProductId: productIdMap[plan.level]
              });
            }}
            style={{ padding: '20px 40px', borderRadius: '12px' }}
            className={`group relative bg-white border-2 transition-all cursor-pointer hover:shadow-2xl flex flex-col justify-center ${
              insured_details.coverageLevel === plan.level 
                ? (plan.color === 'primary' ? 'border-primary shadow-xl scale-[1.01]' : plan.color === 'secondary' ? 'border-secondary shadow-xl scale-[1.01]' : 'border-slate-800 shadow-xl scale-[1.01]')
                : 'border-slate-100 hover:border-slate-200'
            }`}
          >
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
  );
};
