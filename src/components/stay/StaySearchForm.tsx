import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';

export const StaySearchForm: React.FC = () => {
  const { addToast } = useTravelStore();

  // Local state for interactive search values
  const [destination, setDestination] = useState('도쿄 신주쿠');
  
  const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [checkOutDate, setCheckOutDate] = useState(() => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  
  const [guestCount, setGuestCount] = useState(2);
  const [roomCount, setRoomCount] = useState(1);

  const handleGuestChange = (amount: number) => {
    setGuestCount(prev => Math.max(1, prev + amount));
  };

  const handleRoomChange = (amount: number) => {
    setRoomCount(prev => Math.max(1, prev + amount));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast(
      `🏨 [${destination}] 숙소 검색 중: ${checkInDate} ~ ${checkOutDate} (${guestCount}명, 객실 ${roomCount}개)`,
      "info"
    );
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col select-none">
      <form onSubmit={handleSearchSubmit} className="w-full">
        
        {/* Main search layout: Inputs grid and the standalone action button side-by-side */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          
          {/* Inputs Container Card */}
          <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col lg:flex-row items-stretch min-h-[64px] lg:h-[68px] relative overflow-visible">
            
            {/* 1. Destination */}
            <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center py-2 px-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">여행 목적지 / 숙소명</span>
              <div className="flex items-center justify-center w-full px-2">
                <div className="relative flex items-center justify-center">
                  <i className="fa-solid fa-location-dot text-[#005ce6] text-xs mr-1.5 shrink-0"></i>
                  {/* Invisible span to dynamically size the parent container */}
                  <span className="invisible text-base font-extrabold whitespace-pre select-none pointer-events-none h-6">
                    {destination || "어디로 떠나시나요?"}
                  </span>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="bg-transparent border-none text-base font-extrabold text-slate-800 focus:outline-none placeholder:text-slate-400 p-0 text-left absolute left-[18px] w-[calc(100%-18px)] h-full"
                    placeholder="어디로 떠나시나요?"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] bg-slate-200 hidden lg:block my-2.5"></div>

            {/* 2. Check-in Date */}
            <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center py-2 px-3 relative">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">체크인 일시</span>
              <div className="flex items-center justify-center text-base font-extrabold text-slate-800 relative cursor-pointer select-none w-full">
                <i className="fa-regular fa-calendar text-slate-400 text-sm mr-2 pointer-events-none"></i>
                <span className="pointer-events-none">{checkInDate}</span>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-center"
                  style={{ colorScheme: 'light' }}
                  required
                />
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] bg-slate-200 hidden lg:block my-2.5"></div>

            {/* 3. Check-out Date */}
            <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center py-2 px-3 relative">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">체크아웃 일시</span>
              <div className="flex items-center justify-center text-base font-extrabold text-slate-800 relative cursor-pointer select-none w-full">
                <i className="fa-regular fa-calendar text-slate-400 text-sm mr-2 pointer-events-none"></i>
                <span className="pointer-events-none">{checkOutDate}</span>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-center"
                  min={checkInDate}
                  style={{ colorScheme: 'light' }}
                  required
                />
              </div>
            </div>

            {/* Divider */}
            <div className="w-[1px] bg-slate-200 hidden lg:block my-2.5"></div>

            {/* 4. Guests */}
            <div className="flex-1 min-w-0 flex flex-col justify-center items-center text-center py-2 px-3 relative">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">투스크 인원</span>
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
            <div className="w-[1px] bg-slate-200 hidden lg:block my-2.5"></div>

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
  );
};
