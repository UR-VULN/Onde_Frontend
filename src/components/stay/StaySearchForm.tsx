import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { search_stays_api } from '@/api/stayApi';
import { SearchDateField } from '@/components/common/SearchDateField';
import { StayDestinationPicker } from '@/components/stay/StayDestinationPicker';
import { DEFAULT_DESTINATION } from '@/constants/travelDestinations';
import { todayStr, toDateStr } from '@/utils/calendarUtils';

export interface StaySearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

interface StaySearchFormProps {
  onSearch?: (params: StaySearchParams) => void;
}

export const StaySearchForm: React.FC<StaySearchFormProps> = ({ onSearch }) => {
  const { addToast } = useTravelStore();

  const [destinationCountry, setDestinationCountry] = useState<string>(DEFAULT_DESTINATION.country);
  const [destinationCity, setDestinationCity] = useState<string>(DEFAULT_DESTINATION.city);
  const destination = destinationCity;
  
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    return toDateStr(next);
  });

  const handleCheckInChange = (value: string) => {
    setCheckInDate(value);
    if (checkOutDate <= value) {
      const next = new Date(`${value}T00:00:00`);
      next.setDate(next.getDate() + 1);
      setCheckOutDate(toDateStr(next));
    }
  };
  
  const [guestCount, setGuestCount] = useState(1);
  const [roomCount, setRoomCount] = useState(1);

  const handleGuestChange = (amount: number) => {
    setGuestCount(prev => Math.max(1, prev + amount));
  };

  const handleRoomChange = (amount: number) => {
    setRoomCount(prev => Math.max(1, prev + amount));
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const params = {
      destination,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestCount,
      rooms: roomCount,
    };
    onSearch?.(params);
    try {
      addToast("실시간 숙소를 조회 중입니다...", "info");
      const res = await search_stays_api(params);
      if (res.success && res.data) {
        addToast("숙소 검색이 완료되었습니다.", "success");
      } else {
        addToast(res.message || "검색 결과가 없습니다.", "warning");
      }
    } catch (err: any) {
      addToast(err?.error?.message || "숙소 실시간 검색 중 오류가 발생했습니다.", "warning");
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col select-none overflow-visible">
      {/* Gradient accent bar — mobile/tablet only */}
      <div
        className="lg:hidden h-1 w-full"
        style={{ background: 'linear-gradient(135deg, #005ce6 0%, #ff5a5f 100%)' }}
      />
      <div className="p-4 md:p-5 flex flex-col">
      <form onSubmit={handleSearchSubmit} className="w-full">
        
        {/* Main search layout: Inputs grid and the standalone action button side-by-side */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          
          {/* Inputs Container Card */}
          <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col lg:flex-row items-stretch min-h-[64px] lg:h-[68px] relative overflow-visible">
            
            {/* 1. Destination */}
            <StayDestinationPicker
              country={destinationCountry}
              city={destinationCity}
              onChange={(country, city) => {
                setDestinationCountry(country);
                setDestinationCity(city);
              }}
            />

            {/* Divider — horizontal on mobile, vertical on desktop */}
            <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
            <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

            {/* 2. Check-in Date */}
            <SearchDateField
              className="flex-1 min-w-0"
              label="체크인 일시"
              value={checkInDate}
              onChange={handleCheckInChange}
              min={todayStr()}
            />

            {/* Divider */}
            <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
            <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

            {/* 3. Check-out Date */}
            <SearchDateField
              className="flex-1 min-w-0"
              label="체크아웃 일시"
              value={checkOutDate}
              onChange={setCheckOutDate}
              min={checkInDate}
            />

            {/* Divider */}
            <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
            <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

            {/* 4. Guests */}
            <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center py-2 px-3 relative">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">투숙 인원</span>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleGuestChange(-1)}
                  className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer shadow-sm active:scale-90"
                >
                  <i className="fa-solid fa-minus text-[8px]"></i>
                </button>
                
                <div className="flex items-center justify-center min-w-[50px]">
                  <span className="text-base font-extrabold text-slate-800 whitespace-nowrap">성인 {guestCount}명</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleGuestChange(1)}
                  className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer shadow-sm active:scale-90"
                >
                  <i className="fa-solid fa-plus text-[8px]"></i>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
            <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

            {/* 5. Rooms */}
            <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center py-2 px-3 relative">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">객실 수</span>
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRoomChange(-1)}
                  className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer shadow-sm active:scale-90"
                >
                  <i className="fa-solid fa-minus text-[8px]"></i>
                </button>
                
                <div className="flex items-center justify-center min-w-[50px]">
                  <span className="text-base font-extrabold text-slate-800 whitespace-nowrap">객실 {roomCount}개</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRoomChange(1)}
                  className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer shadow-sm active:scale-90"
                >
                  <i className="fa-solid fa-plus text-[8px]"></i>
                </button>
              </div>
            </div>

          </div>

          {/* Coral Gradient Signature Search Button */}
          <button
            type="submit"
            className="h-[48px] lg:h-[68px] w-full lg:w-[68px] rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 shadow-[0_4px_12px_rgba(255,90,95,0.2)] hover:shadow-[0_6px_20px_rgba(255,90,95,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #005ce6 0%, #ff5a5f 100%)', color: '#ffffff' }}
            title="숙소 검색"
          >
            <i className="fa-solid fa-magnifying-glass text-lg text-white"></i>
          </button>

        </div>
      </form>
      </div>
    </div>
  );
};
