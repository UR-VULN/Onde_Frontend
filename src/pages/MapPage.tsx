import React from 'react';

export const MapPage: React.FC = () => {
  return (
    <div className="w-full mt-8 mb-20 transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-lg overflow-hidden flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4 text-center select-none">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl text-slate-300">
            <i className="fa-solid fa-map-location-dot" />
          </div>
          <p className="text-sm font-bold text-slate-400">지도 서비스 준비 중입니다.</p>
        </div>
      </div>
    </div>
  );
};
