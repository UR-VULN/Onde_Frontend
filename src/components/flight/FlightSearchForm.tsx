import React from 'react';
import { useFlightStore } from '@/store/useFlightStore';
import { search_flights_api } from '@/api/flightApi';
import { useTravelStore } from '@/store/useTravelStore';

export const FlightSearchForm: React.FC = () => {
  const { search_query, set_search_query, set_search_results } = useFlightStore();
  const { addToast } = useTravelStore();


  const handle_toggle_trip_type = () => {
    const nextType = search_query.tripType === 'RT' ? 'OW' : 'RT';
    handle_trip_type_change(nextType);
  };

  const handle_change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    set_search_query({ [name]: value });
  };

  const handle_passenger_change = (amount: number) => {
    const next = Math.max(1, search_query.passengerCount + amount);
    set_search_query({ passengerCount: next });
  };

  const handle_swap_airports = () => {
    const temp = search_query.departures;
    set_search_query({
      departures: search_query.arrivals,
      arrivals: temp
    });
  };

  const handle_date_change = (type: 'departure' | 'return', value: string) => {
    if (search_query.tripType === 'OW') {
      set_search_query({ dates: value });
    } else {
      const datesArray = search_query.dates.split(',');
      const dep = type === 'departure' ? value : (datesArray[0] || new Date().toISOString().split('T')[0]);
      const ret = type === 'return' ? value : (datesArray[1] || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      set_search_query({ dates: `${dep},${ret}` });
    }
  };

  const handle_trip_type_change = (type: 'OW' | 'RT') => {
    const today = new Date().toISOString().split('T')[0];
    if (type === 'OW') {
      const depDate = search_query.dates.split(',')[0] || today;
      set_search_query({ tripType: 'OW', dates: depDate });
    } else {
      const depDate = search_query.dates.split(',')[0] || today;
      const nextWeek = new Date(new Date(depDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      set_search_query({ tripType: 'RT', dates: `${depDate},${nextWeek}` });
    }
  };

  const handle_search = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addToast("실시간 항공 운항편을 조회 중입니다...", "info");
      
      const queryPayload = { ...search_query };
      if (search_query.tripType === 'RT') {
        const datesArray = search_query.dates.split(',');
        const depDate = datesArray[0] || new Date().toISOString().split('T')[0];
        const retDate = datesArray[1] || new Date(new Date(depDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        queryPayload.departures = `${search_query.departures},${search_query.arrivals}`;
        queryPayload.arrivals = `${search_query.arrivals},${search_query.departures}`;
        queryPayload.dates = `${depDate},${retDate}`;
      }
      
      const res = await search_flights_api(queryPayload);
      if (res.success && res.data) {
        set_search_results(res.data);
        addToast("항공 스케줄 통합 검색이 완료되었습니다.", "success");
      } else {
        set_search_results(null);
        addToast(res.message || "검색 결과가 없습니다.", "warning");
      }
    } catch (err: any) {
      set_search_results(null);
      addToast(err?.error?.message || "항공편 실시간 검색 중 오류가 발생했습니다.", "warning");
    }
  };

  const datesArray = search_query.dates.split(',');
  const departureDate = datesArray[0] || new Date().toISOString().split('T')[0];
  const returnDate = datesArray[1] || new Date(new Date(departureDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="w-full !-mt-[40px] relative z-20 transition-all duration-300">
      
      {/* Main Search Card */}
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-4 md:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col select-none">
        <form onSubmit={handle_search} className="w-full">
          
          {/* Main search layout: Inputs grid and the standalone action button side-by-side */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4">
            
            {/* Inputs Container Card (Reduced height lg:h-[68px] for vertical slimness) */}
            <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col lg:flex-row items-stretch min-h-[64px] lg:h-[68px] relative overflow-visible">
              
              {/* 1. Trip Type Toggle Box integrated inside (Direct Toggle UX) */}
              <div className="flex-1 lg:min-w-[110px] min-w-0 flex flex-col justify-center items-center text-center py-2 px-3 relative">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">여정 구분</span>
                <button
                  type="button"
                  onClick={handle_toggle_trip_type}
                  className="bg-transparent border-none text-base font-extrabold text-slate-800 focus:outline-none w-full text-center flex items-center justify-center cursor-pointer select-none p-0 hover:scale-[1.03] active:scale-[0.97] transition-all"
                  title="클릭하여 편도/왕복 전환"
                >
                  <div className="flex items-center justify-center">
                    <i className="fa-solid fa-plane-departure text-[#005ce6] text-xs" style={{ marginRight: '6px' }}></i>
                    <span>{search_query.tripType === 'RT' ? '왕복 여정' : '편도 여정'}</span>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="w-[1px] bg-slate-200 hidden lg:block my-2.5"></div>

              {/* 2. Departures */}
              <div className="flex-1 lg:min-w-[160px] min-w-0 flex flex-col justify-center items-center text-center py-2 px-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">출발 공항</span>
                <input
                  type="text"
                  name="departures"
                  value={search_query.departures}
                  onChange={handle_change}
                  className="bg-transparent border-none text-base font-extrabold text-slate-800 focus:outline-none w-full placeholder:text-slate-400 p-0 text-center"
                  placeholder="인천 국제공항 (ICN)"
                  required
                />
              </div>

              {/* Swap Button (Inline, prevents overlapping mathematically) */}
              <div className="flex items-center justify-center px-0.5 py-0.5 lg:py-0">
                <button
                  type="button"
                  onClick={handle_swap_airports}
                  className="w-7 h-7 bg-white border border-slate-200 hover:border-slate-300 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <i className="fa-solid fa-right-left text-[10px] lg:rotate-0 rotate-90"></i>
                </button>
              </div>

              {/* 3. Arrivals */}
              <div className="flex-1 lg:min-w-[160px] min-w-0 flex flex-col justify-center items-center text-center py-2 px-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">도착 공항</span>
                <input
                  type="text"
                  name="arrivals"
                  value={search_query.arrivals}
                  onChange={handle_change}
                  className="bg-transparent border-none text-base font-extrabold text-slate-800 focus:outline-none w-full placeholder:text-slate-400 p-0 text-center"
                  placeholder="도쿄 나리타 공항 (NRT)"
                  required
                />
              </div>

              {/* Divider */}
              <div className="w-[1px] bg-slate-200 hidden lg:block my-2.5"></div>

              {/* 4. Departure Date */}
              <div className="flex-1 min-w-[125px] flex flex-col justify-center items-center text-center py-2 px-3 relative">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">출발 일시</span>
                <div className="flex items-center justify-center text-base font-extrabold text-slate-800 relative cursor-pointer select-none w-full">
                  <i className="fa-regular fa-calendar text-slate-400 text-sm mr-2 pointer-events-none"></i>
                  <span className="pointer-events-none">{departureDate}</span>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => handle_date_change('departure', e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-center"
                    style={{ colorScheme: 'light' }}
                    required
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="w-[1px] bg-slate-200 hidden lg:block my-2.5"></div>

              {/* 5. Return Date */}
              <div className={`flex-1 min-w-[125px] flex flex-col justify-center items-center text-center py-2 px-3 relative transition-all duration-300 ${
                search_query.tripType === 'OW' ? 'bg-slate-100/40 opacity-40 cursor-not-allowed' : ''
              }`}>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">오는 일시</span>
                {search_query.tripType === 'OW' ? (
                  <div className="flex items-center justify-center text-base font-extrabold text-slate-400 select-none">
                    <i className="fa-regular fa-calendar text-slate-300 text-sm mr-2"></i>
                    <span>편도 여정</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-base font-extrabold text-slate-800 relative cursor-pointer select-none w-full">
                    <i className="fa-regular fa-calendar text-slate-400 text-sm mr-2 pointer-events-none"></i>
                    <span className="pointer-events-none">{returnDate}</span>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => handle_date_change('return', e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full text-center"
                      min={departureDate}
                      style={{ colorScheme: 'light' }}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-[1px] bg-slate-200 hidden lg:block my-2.5"></div>

              {/* 6. Passengers */}
              <div className="flex-1 lg:min-w-[180px] min-w-0 flex flex-col justify-center items-center text-center py-2 px-5 relative">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">탑승 인원</span>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handle_passenger_change(-1)}
                    className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer shadow-sm active:scale-90"
                  >
                    <i className="fa-solid fa-minus text-[10px]"></i>
                  </button>
                  
                  <div className="flex items-center justify-center min-w-[60px]">
                    <span className="text-base font-extrabold text-slate-800 whitespace-nowrap">성인 {search_query.passengerCount}명</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handle_passenger_change(1)}
                    className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer shadow-sm active:scale-90"
                  >
                    <i className="fa-solid fa-plus text-[10px]"></i>
                  </button>
                </div>
              </div>

            </div>

            {/* Premium standalone Search Button with ONLY magnifying glass (Reduced to lg:h-[68px] lg:w-[68px] for visual consistency) */}
            <button
              type="submit"
              className="search-submit-btn h-[48px] lg:h-[68px] w-full lg:w-[68px] rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0"
              title="항공권 검색"
            >
              <i className="fa-solid fa-magnifying-glass text-lg text-white"></i>
            </button>

          </div>
        </form>
      </div>


    </div>
  );
};


