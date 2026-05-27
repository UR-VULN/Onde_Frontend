import React from 'react';
import { useFlightStore } from '@/store/useFlightStore';
import type { FlightDto, AvailableSeat } from '@/store/useFlightStore';

interface FlightSearchResultListProps {
  on_select_seat: (flight: FlightDto, seat: AvailableSeat) => void;
}

export const FlightSearchResultList: React.FC<FlightSearchResultListProps> = ({ on_select_seat }) => {
  const { flight_search_results } = useFlightStore();

  if (!flight_search_results || flight_search_results.journeys.length === 0) {
    return null;
  }

  const format_time = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const format_date = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return (
    <div className="max-w-none w-full mt-10 px-0">
      <div className="section-header border-b border-slate-100 pb-3 mb-6">
        <h3 className="font-logo font-extrabold text-xl text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-plane-departure text-primary"></i> 실시간 운항 스케줄 검색 결과
        </h3>
        <span className="text-xs text-slate-500 font-bold">
          인원: {flight_search_results.passengerCount}명 기준
        </span>
      </div>

      {flight_search_results.journeys.map((journey) => (
        <div key={journey.journeyIndex} className="mb-10">
          <h4 className="text-sm font-black text-slate-700 bg-slate-100/80 px-4 py-2 rounded-2xl mb-4 inline-block">
            📍 {journey.description}
          </h4>

          {journey.flights.length === 0 ? (
            <div className="bg-white p-12 rounded-[28px] border border-slate-200 shadow-sm text-center">
              <i className="fa-solid fa-plane-slash text-4xl text-slate-300 mb-3 block"></i>
              <p className="text-xs text-slate-500 font-bold">해당 조건에 만족하는 운항 노선이 존재하지 않거나 승인되지 않았습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {journey.flights.map((flight) => (
                <div
                  key={flight.scheduleId}
                  className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 hover:shadow-md transition-all border-l-4 border-l-primary"
                >
                  {/* Left: Flight Info & Route */}
                  <div className="flex items-center gap-6 flex-1 min-w-[280px]">
                    <div className="flex flex-col items-center justify-center bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex-shrink-0">
                      <i className="fa-solid fa-plane text-primary text-xl mb-1"></i>
                      <span className="text-xs font-black text-slate-800">{flight.flightNumber}</span>
                    </div>

                    <div className="flex items-center gap-4 flex-1">
                      {/* Departure */}
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 block">{flight.departureAirport}</span>
                        <strong className="text-lg font-black text-slate-800 block">{format_time(flight.departureTime)}</strong>
                        <span className="text-[10px] font-bold text-slate-500">{format_date(flight.departureTime)}</span>
                      </div>

                      {/* Route Indicator Arrow */}
                      <div className="flex-1 flex flex-col items-center justify-center relative px-2">
                        <span className="text-[10px] font-bold text-slate-400 mb-1">{flight.durationMinutes}분 소요</span>
                        <div className="w-full h-[1.5px] bg-slate-200 relative flex items-center justify-center">
                          <i className="fa-solid fa-chevron-right text-[10px] text-slate-300 absolute right-0"></i>
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-400 block">{flight.arrivalAirport}</span>
                        <strong className="text-lg font-black text-slate-800 block">{format_time(flight.arrivalTime)}</strong>
                        <span className="text-[10px] font-bold text-slate-500">{format_date(flight.arrivalTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Seat Grades & Booking Trigger */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center min-w-[340px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                    {flight.availableSeats.map((seat) => {
                      const is_low_inventory = seat.remainingSeats < 5;
                      
                      return (
                        <div
                          key={seat.classType}
                          className="flex-1 bg-slate-50/50 hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-2 relative transition-all"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {seat.classType}
                            </span>
                            
                            {/* Coral color pulse Warning badge on low seats */}
                            {is_low_inventory ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-secondary border border-rose-100 flex items-center gap-1 animate-pulse">
                                매진 임박 {seat.remainingSeats}석 남음
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-500">
                                {seat.remainingSeats}석 남음
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-col">
                            <span className="text-xs font-bold text-slate-400">1인 요금</span>
                            <strong className="text-sm font-black text-slate-800">
                              ₩{seat.basePrice.toLocaleString()}
                            </strong>
                          </div>

                          <button
                            type="button"
                            className="btn-primary text-[10px] font-extrabold w-full py-1.5 px-3 mt-2"
                            onClick={() => on_select_seat(flight, seat)}
                          >
                            예약하기
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
