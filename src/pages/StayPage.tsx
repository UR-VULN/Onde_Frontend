import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { StaySearchForm } from '@/components/stay/StaySearchForm';

export const StayPage: React.FC = () => {
  const { addToast } = useTravelStore();

  return (
    <div className="w-full !-mt-[40px] relative z-20 transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      
      {/* Hotel/Stay Search Bar Capsule */}
      <StaySearchForm />

      {/* Featured stays showcases to make it look hyper premium */}
      <div className="mt-16 mb-20 px-4 md:px-0">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h4 className="font-logo font-black text-2xl text-slate-800 tracking-tight">이번 주 ONDE 초이스 숙소</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">ONDE Signature Stay curation</p>
          </div>
          <button 
            type="button" 
            className="text-xs font-bold text-[#005ce6] hover:underline"
            onClick={() => addToast("전체 숙소 보기 서비스 준비 중입니다.", "info")}
          >
            전체 보기 <i className="fa-solid fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              id: 'stay-1',
              title: '도쿄 신주쿠 펜트하우스 스위트',
              location: '일본 도쿄 Shinjuku',
              img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600',
              price: '₩235,000',
              rating: '4.95 (후기 342개)'
            },
            {
              id: 'stay-2',
              title: '제주 애월 한옥 프라이빗 감성 독채',
              location: '대한민국 제주 Aewol',
              img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600',
              price: '₩180,000',
              rating: '4.88 (후기 188개)'
            },
            {
              id: 'stay-3',
              title: '서울 성수 인더스트리얼 디자인 스튜디오',
              location: '대한민국 서울 Seongsu',
              img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600',
              price: '₩145,000',
              rating: '4.91 (후기 98개)'
            }
          ].map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group"
              onClick={() => addToast(`${item.title} 숙소 상세 조회가 로드됩니다.`, "info")}
            >
              <div className="relative h-48 overflow-hidden select-none">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-slate-800 shadow-sm">
                  ★ {item.rating}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-[#005ce6] uppercase tracking-wider block mb-1">{item.location}</span>
                  <strong className="text-sm font-black text-slate-800 leading-snug group-hover:text-[#005ce6] transition-colors">{item.title}</strong>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">1박 평균</span>
                  <strong className="text-base font-black text-[#ff5a5f]">{item.price}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
