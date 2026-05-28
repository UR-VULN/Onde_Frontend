import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { CarSearchForm } from '@/components/car/CarSearchForm';

export const CarPage: React.FC = () => {
  const { addToast } = useTravelStore();

  return (
    <div className="w-full !-mt-[40px] relative z-20 transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      
      {/* Car Search Bar Capsule */}
      <CarSearchForm />

      {/* Featured cars showcases */}
      <div className="mt-16 mb-20 px-4 md:px-0">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h4 className="font-logo font-black text-2xl text-slate-800 tracking-tight">ONDE 인기 라인업 추천</h4>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Highly curated premium fleets</p>
          </div>
          <button 
            type="button" 
            className="text-xs font-bold text-[#005ce6] hover:underline"
            onClick={() => addToast("전체 차량 보기 서비스 준비 중입니다.", "info")}
          >
            전체 보기 <i className="fa-solid fa-arrow-right ml-1"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              id: 'car-1',
              title: '제네시스 G90 럭셔리 세단',
              type: '대형 세단 (Sedan) • 휘발유',
              img: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=600',
              price: '₩150,000 / 일',
              options: '완전 자차 포함 • 5인승 • 네비게이션'
            },
            {
              id: 'car-2',
              title: '테슬라 모델 Y 롱레인지',
              type: '중형 SUV (Electric) • 전기차',
              img: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=600',
              price: '₩120,000 / 일',
              options: '완전 자차 포함 • Autopilot • 5인승'
            },
            {
              id: 'car-3',
              title: '미니쿠퍼 컨버터블 S',
              type: '소형 오픈카 (Cabrio) • 휘발유',
              img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600',
              price: '₩95,000 / 일',
              options: '자차 면책 보험 • 4인승 • 후방카메라'
            }
          ].map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col group"
              onClick={() => addToast(`${item.title} 예약 화면이 로드됩니다.`, "info")}
            >
              <div className="relative h-48 overflow-hidden select-none">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-[#005ce6] uppercase tracking-wider block mb-1">{item.type}</span>
                  <strong className="text-sm font-black text-slate-800 leading-snug group-hover:text-[#005ce6] transition-colors">{item.title}</strong>
                  <p className="text-[10px] text-slate-400 font-extrabold mt-2"><i className="fa-solid fa-circle-check text-emerald-500 mr-1"></i> {item.options}</p>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">1일 요금</span>
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
