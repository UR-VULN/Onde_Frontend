import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import type { CarType } from '@/constants/mockCars';
import { search_cars_api } from '@/api/carApi';

export interface CarSearchParams {
  pickupSpot: string;
  pickupDate: string;
  returnDate: string;
  carType: CarType;
}

interface CarSearchFormProps {
  onSearch?: (params: CarSearchParams) => void;
}

export const CarSearchForm: React.FC<CarSearchFormProps> = ({ onSearch }) => {
  const { addToast } = useTravelStore();

  // Local state for interactive search values
  const [pickupSpot, setPickupSpot] = useState('도쿄 나리타 공항 (NRT) 지점');
  
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(() => new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  
  const [carType, setCarType] = useState<CarType>('ALL');

  const typeLabelMap: Record<CarType, string> = {
    ALL: '전체 차량',
    MINI: '경형/소형',
    SEDAN: '중형/대형',
    SUV: 'SUV/RV',
    IMPORT: '수입/스포츠',
    EV: '전기차'
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const params = { pickupSpot, pickupDate, returnDate, carType };
    onSearch?.(params);
    try {
      addToast("실시간 렌터카를 조회 중입니다...", "info");
      const res = await search_cars_api(params);
      if (res.success && res.data) {
        addToast("렌터카 검색이 완료되었습니다.", "success");
      } else {
        addToast(res.message || "검색 결과가 없습니다.", "warning");
      }
    } catch (err: any) {
      addToast(err?.error?.message || "렌터카 실시간 검색 중 오류가 발생했습니다.", "warning");
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col select-none overflow-hidden">
      {/* Gradient accent bar — mobile/tablet only */}
      <div className="lg:hidden h-1 w-full" style={{ background: 'linear-gradient(135deg, #005ce6 0%, #ff5a5f 100%)' }} />
      <div className="p-4 md:p-5 flex flex-col">
      <form onSubmit={handleSearchSubmit} className="w-full">
        
        {/* Main search layout: Inputs grid and the standalone action button side-by-side */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          
          {/* Inputs Container Card */}
          <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col lg:flex-row items-stretch min-h-[64px] lg:h-[68px] relative overflow-visible">
            
            {/* 1. Pick-up spot */}
            <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center py-2 px-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">인수 / 반납 장소</span>
              <div className="flex items-center justify-center w-full px-2">
                <div className="relative flex items-center justify-center">
                  <i className="fa-solid fa-car-tunnel text-[#005ce6] text-xs mr-1.5 shrink-0"></i>
                  {/* Invisible helper span to dynamically size container */}
                  <span className="invisible text-base font-extrabold whitespace-pre select-none pointer-events-none h-6">
                    {pickupSpot || "대여 지점을 입력하세요"}
                  </span>
                  <input
                    type="text"
                    value={pickupSpot}
                    onChange={(e) => setPickupSpot(e.target.value)}
                    className="bg-transparent border-none text-base font-extrabold text-slate-800 focus:outline-none placeholder:text-slate-400 p-0 text-left absolute left-[20px] w-[calc(100%-20px)] h-full"
                    placeholder="대여 지점을 입력하세요"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
            <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

            {/* 2. Pickup Date */}
            <div className="flex-1 min-w-[125px] flex flex-col justify-center items-center text-center py-2 px-3 relative">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">대여 일시</span>
              <div className="flex items-center justify-center text-base font-extrabold text-slate-800 relative cursor-pointer select-none w-full">
                <i className="fa-regular fa-calendar text-slate-400 text-sm mr-2 pointer-events-none"></i>
                <span className="pointer-events-none">{pickupDate}</span>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-center"
                  style={{ colorScheme: 'light' }}
                  required
                />
              </div>
            </div>

            {/* Divider */}
            <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
            <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

            {/* 3. Return Date */}
            <div className="flex-1 min-w-[125px] flex flex-col justify-center items-center text-center py-2 px-3 relative">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">반납 일시</span>
              <div className="flex items-center justify-center text-base font-extrabold text-slate-800 relative cursor-pointer select-none w-full">
                <i className="fa-regular fa-calendar text-slate-400 text-sm mr-2 pointer-events-none"></i>
                <span className="pointer-events-none">{returnDate}</span>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-center"
                  min={pickupDate}
                  style={{ colorScheme: 'light' }}
                  required
                />
              </div>
            </div>

            {/* Divider */}
            <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
            <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

            {/* 4. Car Type */}
            <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center py-2 px-3 relative">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">차종 선택</span>
              <div className="flex items-center justify-center w-full px-2">
                <div className="relative flex items-center justify-center">
                  <i className="fa-solid fa-car text-slate-400 text-xs mr-1.5 shrink-0"></i>
                  {/* Invisible helper span to dynamically size select box */}
                  <span className="invisible text-base font-extrabold whitespace-pre select-none pointer-events-none h-6">
                    {typeLabelMap[carType]}
                  </span>
                  <select
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                    className="bg-transparent border-none text-base font-extrabold text-slate-800 focus:outline-none w-full text-left absolute left-[18px] w-[calc(100%-18px)] h-full cursor-pointer appearance-none p-0"
                  >
                    <option value="ALL">전체 차량</option>
                    <option value="MINI">경형/소형</option>
                    <option value="SEDAN">중형/대형</option>
                    <option value="SUV">SUV/RV</option>
                    <option value="IMPORT">수입/스포츠</option>
                    <option value="EV">전기차</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Coral Gradient Signature Search Button */}
          <button
            type="submit"
            className="h-[48px] lg:h-[68px] w-full lg:w-[68px] rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 shadow-[0_4px_12px_rgba(255,90,95,0.2)] hover:shadow-[0_6px_20px_rgba(255,90,95,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #005ce6 0%, #ff5a5f 100%)', color: '#ffffff' }}
            title="렌터카 검색"
          >
            <i className="fa-solid fa-magnifying-glass text-lg text-white"></i>
          </button>

        </div>
      </form>
      </div>
    </div>
  );
};
