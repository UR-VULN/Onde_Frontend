import React from 'react';
import { useFlightStore } from '@/store/useFlightStore';
import type { FlightSearchQuery } from '@/store/useFlightStore';
import { SearchDateField } from '@/components/common/SearchDateField';
import { SearchListPicker } from '@/components/common/SearchListPicker';
import {
  FLIGHT_DEPARTURE_AIRPORTS,
  FLIGHT_ARRIVAL_AIRPORTS,
} from '@/constants/flightAirports';
import { todayStr, toDateStr } from '@/utils/calendarUtils';

function addDays(dateStr: string, days: number): string {
  const next = new Date(`${dateStr}T00:00:00`);
  next.setDate(next.getDate() + days);
  return toDateStr(next);
}

export type FlightSearchParams = FlightSearchQuery;

interface FlightSearchFormProps {
  onSearch?: (params: FlightSearchParams) => void;
  loading?: boolean;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({ onSearch, loading = false }) => {
  const { search_query, set_search_query } = useFlightStore();

  const handle_toggle_trip_type = () => {
    const nextType = search_query.tripType === 'RT' ? 'OW' : 'RT';
    handle_trip_type_change(nextType);
  };

  const handle_passenger_change = (amount: number) => {
    const next = Math.max(1, search_query.passengerCount + amount);
    set_search_query({ passengerCount: next });
  };

  const handle_swap_airports = () => {
    const temp = search_query.departures;
    set_search_query({
      departures: search_query.arrivals,
      arrivals: temp,
    });
  };

  const handle_date_change = (type: 'departure' | 'return', value: string) => {
    if (search_query.tripType === 'OW') {
      set_search_query({ dates: value });
      return;
    }

    const datesArray = search_query.dates.split(',');
    const dep = type === 'departure' ? value : (datesArray[0] || todayStr());
    let ret = type === 'return' ? value : (datesArray[1] || addDays(dep, 7));

    if (type === 'departure' && ret <= value) {
      const next = new Date(`${value}T00:00:00`);
      next.setDate(next.getDate() + 1);
      ret = toDateStr(next);
    }

    set_search_query({ dates: `${dep},${ret}` });
  };

  const handle_trip_type_change = (type: 'OW' | 'RT') => {
    const today = todayStr();
    if (type === 'OW') {
      const depDate = search_query.dates.split(',')[0] || today;
      set_search_query({ tripType: 'OW', dates: depDate >= today ? depDate : today });
    } else {
      const depDate = search_query.dates.split(',')[0] || today;
      const safeDep = depDate >= today ? depDate : today;
      const next = new Date(`${safeDep}T00:00:00`);
      next.setDate(next.getDate() + 3);
      set_search_query({ tripType: 'RT', dates: `${safeDep},${toDateStr(next)}` });
    }
  };

  const handle_search = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(search_query);
  };

  const datesArray = search_query.dates.split(',');
  const departureDate = datesArray[0] || todayStr();
  const returnDate = datesArray[1] || addDays(departureDate, 7);

  return (
    <div className="w-full relative z-20 transition-all duration-300">
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col select-none overflow-visible">
        <div className="lg:hidden h-1 w-full" style={{ background: 'linear-gradient(135deg, #005ce6 0%, #ff5a5f 100%)' }} />
        <div className="p-4 md:p-5 flex flex-col">
          <form onSubmit={handle_search} className="w-full">
            <div className="flex flex-col lg:flex-row items-stretch gap-4">
              <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col lg:flex-row items-stretch min-h-[64px] lg:h-[68px] relative overflow-visible">

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

                <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
                <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

                <SearchListPicker
                  className="flex-1 lg:min-w-[150px]"
                  label="출발 공항"
                  value={search_query.departures}
                  options={FLIGHT_DEPARTURE_AIRPORTS}
                  onChange={(value) => set_search_query({ departures: value })}
                  iconClass="fa-solid fa-plane-departure text-[#005ce6]"
                  panelTitle="어디서 출발하시나요?"
                  panelSubtitle="출발 공항을 선택하세요"
                  listLabel="출발지"
                  panelWidth={340}
                />

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

                <SearchListPicker
                  className="flex-1 lg:min-w-[150px]"
                  label="도착 공항"
                  value={search_query.arrivals}
                  options={FLIGHT_ARRIVAL_AIRPORTS}
                  onChange={(value) => set_search_query({ arrivals: value })}
                  iconClass="fa-solid fa-plane-arrival text-[#005ce6]"
                  panelTitle="어디로 가시나요?"
                  panelSubtitle="도착 공항을 선택하세요"
                  listLabel="도착지"
                  panelWidth={340}
                />

                <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
                <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

                <SearchDateField
                  label="출발 일시"
                  value={departureDate}
                  onChange={(value) => handle_date_change('departure', value)}
                  min={todayStr()}
                />

                <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
                <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

                <SearchDateField
                  label="오는 일시"
                  value={returnDate}
                  onChange={(value) => handle_date_change('return', value)}
                  min={departureDate}
                  disabled={search_query.tripType === 'OW'}
                  disabledContent={(
                    <div className="flex items-center justify-center text-base font-extrabold text-slate-400 select-none pointer-events-none">
                      <i className="fa-regular fa-calendar text-slate-300 text-sm mr-2"></i>
                      <span>편도 여정</span>
                    </div>
                  )}
                  required={search_query.tripType === 'RT'}
                />

                <div className="lg:hidden" style={{ height: '1px', background: '#e2e8f0', margin: '0 0.75rem' }}></div>
                <div className="hidden lg:block" style={{ width: '1px', background: '#e2e8f0', margin: '0.625rem 0' }}></div>

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

              <button
                type="submit"
                disabled={loading}
                className="search-submit-btn h-[48px] lg:h-[68px] w-full lg:w-[68px] rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                title="항공권 검색"
              >
                <i className="fa-solid fa-magnifying-glass text-lg text-white"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
