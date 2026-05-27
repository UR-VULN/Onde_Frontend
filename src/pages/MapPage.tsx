import React from 'react';
import { useTravelStore } from '@/store/useTravelStore';

export const MapPage: React.FC = () => {
  const { addToast } = useTravelStore();

  return (
    <div className="w-full mt-8 mb-20 transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      
      {/* Map Main Grid Layout */}
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        
        {/* Left Side: Tourist spot listings (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-200/80 p-6 flex flex-col gap-6 bg-slate-50 flex-shrink-0">
          <div>
            <h4 className="font-logo font-black text-slate-800 text-sm flex items-center gap-2">
              <i className="fa-solid fa-map-pin text-[#005ce6]"></i> 도쿄 핫플레이스 탐색
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              ONDE 실시간 필터 및 테마별 추천 장소 목록입니다.
            </p>
          </div>

          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
            {[
              {
                id: 'spot-1',
                title: '시부야 스카이 전망대',
                tag: '📸 랜드마크 • 전망 명소',
                rating: '★ 4.9',
                addr: 'Shibuya, Tokyo'
              },
              {
                id: 'spot-2',
                title: '센소지 아사쿠사 사원',
                tag: '⛩️ 문화재 • 전통 명소',
                rating: '★ 4.7',
                addr: 'Asakusa, Tokyo'
              },
              {
                id: 'spot-3',
                title: '팀랩 플래닛 디지털 아트',
                tag: '🎨 현대 예술 • 전시회',
                rating: '★ 4.8',
                addr: 'Toyosu, Tokyo'
              }
            ].map((spot) => (
              <div 
                key={spot.id}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-[#005ce6]/30 shadow-sm transition-all cursor-pointer group"
                onClick={() => addToast(`${spot.title} 위치가 지도 위에 표시됩니다.`, "info")}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[9px] font-black text-[#005ce6] tracking-wider block mb-1">{spot.tag}</span>
                  <span className="text-[10px] font-extrabold text-slate-400">{spot.rating}</span>
                </div>
                <strong className="text-xs font-black text-slate-800 group-hover:text-[#005ce6] transition-colors">{spot.title}</strong>
                <p className="text-[9px] text-slate-400 font-bold mt-1">📍 {spot.addr}</p>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn-primary w-full text-[11px] py-2.5 mt-auto flex items-center justify-center gap-2"
            onClick={() => addToast("내 위치 공유 및 동선 연동 API가 호출됩니다.", "success")}
          >
            <i className="fa-solid fa-location-crosshairs"></i> 내 위치 주변 탐색
          </button>
        </div>

        {/* Right Side: Interactive Virtual Map Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-100 flex flex-col justify-center items-center relative overflow-hidden p-8 select-none min-h-[400px]">
          
          {/* Virtual Graphic Map Layer Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 filter grayscale pointer-events-none"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200')` }}
          ></div>

          {/* Interactive spot markers pins */}
          <div className="relative z-10 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 shadow-lg flex items-center justify-center text-3xl text-[#005ce6] animate-bounce">
              <i className="fa-solid fa-map-location-dot"></i>
            </div>
            
            <div className="space-y-2">
              <span className="inline-block bg-[#005ce6]/10 text-[#005ce6] border border-[#005ce6]/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                ONDE Interactive Map Canvas
              </span>
              <h5 className="font-logo font-black text-lg text-slate-800">지능형 핫플레이스 시각화 맵</h5>
              <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed">
                구글맵 API 연동 실시간 교통망 레이어 및 동선 시각화 서비스 영역입니다. C도메인 통합 인터페이스 연동 준비 중입니다.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
