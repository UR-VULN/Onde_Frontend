import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MOCK_FLIGHT_ROUTES, SHUFFLED_FLIGHT_ROUTES, type MockFlightRoute } from '@/constants/mockFlightRoutes';
import type { FlightSearchParams } from './FlightSearchForm';
import { useTravelStore } from '@/store/useTravelStore';

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const AIRLINE_COLORS: Record<string, string> = {
  KE: '#003580',
  OZ: '#005ce6',
  SQ: '#003366',
  EK: '#C8102E',
  AF: '#002157',
  BA: '#075AAA',
  QF: '#EE0000',
  CX: '#006564',
  MH: '#CC0001',
};

interface FlightRouteCardProps {
  route: MockFlightRoute;
  index: number;
}

const FlightRouteCard: React.FC<FlightRouteCardProps> = ({ route, index }) => {
  const { addToast } = useTravelStore();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.06, rootMargin: '60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayMs = (index % 2) * 100;
  const accentColor = AIRLINE_COLORS[route.airlineCode] ?? '#005ce6';
  const formattedPrice = route.priceFrom.toLocaleString('ko-KR');
  const isOvernight = route.arrivalDate !== route.date;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-500 ease-out cursor-pointer group overflow-hidden
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      onClick={() => addToast(`✈️ ${route.flightNumber} (${route.departureAirport} → ${route.arrivalAirport}) 예약 화면이 로드됩니다.`, 'info')}
    >
      {/* Airline accent top bar */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor} 0%, #ff5a5f 100%)` }} />

      <div className="p-5">
        {/* Top row: airline + flight number + price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="text-[0.7rem] font-black px-2 py-0.5 rounded-full text-white" style={{ background: accentColor }}>
              {route.airlineCode}
            </span>
            <span className="text-[0.78rem] font-bold text-slate-500">{route.airline}</span>
            <span className="text-[0.72rem] font-extrabold text-slate-300">·</span>
            <span className="text-[0.72rem] font-bold text-slate-400">{route.flightNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-[0.7rem] text-slate-400 font-bold block">이코노미 최저가</span>
            <strong className="text-base font-black" style={{ color: '#ff5a5f' }}>₩{formattedPrice}</strong>
            <span className="text-[0.7rem] text-slate-400 font-normal"> ~</span>
          </div>
        </div>

        {/* Route row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Departure */}
          <div style={{ textAlign: 'right', minWidth: '70px' }}>
            <strong className="text-2xl font-black text-slate-800 block leading-none">{route.departureAirport}</strong>
            <span className="text-[0.72rem] font-bold text-slate-400 block">{route.departureCity}</span>
            <span className="text-sm font-extrabold text-slate-700 block" style={{ marginTop: '0.2rem' }}>{route.departureTime}</span>
          </div>

          {/* Route line */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
            <span className="text-[0.68rem] font-bold text-slate-400">{formatDuration(route.durationMinutes)}</span>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, height: '1.5px', background: '#e2e8f0' }} />
              <i className="fa-solid fa-plane text-[0.7rem]" style={{ color: accentColor, margin: '0 4px' }}></i>
              <div style={{ flex: 1, height: '1.5px', background: '#e2e8f0' }} />
            </div>
            <span className="text-[0.62rem] font-bold text-slate-300">{route.date}</span>
          </div>

          {/* Arrival */}
          <div style={{ textAlign: 'left', minWidth: '70px' }}>
            <strong className="text-2xl font-black text-slate-800 block leading-none">
              {route.arrivalAirport}
              {isOvernight && <sup className="text-[0.5rem] font-black text-[#ff5a5f] ml-0.5">+1</sup>}
            </strong>
            <span className="text-[0.72rem] font-bold text-slate-400 block">{route.arrivalCity}</span>
            <span className="text-sm font-extrabold text-slate-700 block" style={{ marginTop: '0.2rem' }}>{route.arrivalTime}</span>
          </div>
        </div>

        {/* Bottom: tags + book button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {route.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[0.65rem] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="text-[0.72rem] font-black text-white px-3 py-1.5 rounded-full transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${accentColor} 0%, #ff5a5f 100%)` }}
            onClick={(e) => {
              e.stopPropagation();
              addToast(`✈️ ${route.flightNumber} 예약 화면이 로드됩니다.`, 'info');
            }}
          >
            예약하기
          </button>
        </div>
      </div>
    </div>
  );
};

interface FlightRecommendationListProps {
  searchParams: FlightSearchParams | null;
}

export const FlightRecommendationList: React.FC<FlightRecommendationListProps> = ({ searchParams }) => {
  const today = new Date().toISOString().split('T')[0];
  const returnDay = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const displayedRoutes = useMemo(() => {
    if (!searchParams) return SHUFFLED_FLIGHT_ROUTES;

    const dep = searchParams.departures.trim().toUpperCase();
    const arr = searchParams.arrivals.trim().toUpperCase();

    const filtered = MOCK_FLIGHT_ROUTES.filter((r) => {
      const depMatch = !dep || r.departureAirport.includes(dep) || r.departureCity.includes(dep);
      const arrMatch = !arr || r.arrivalAirport.includes(arr) || r.arrivalCity.includes(arr) ||
        r.tags.some((t) => t.toLowerCase().includes(arr.toLowerCase()));
      return depMatch && arrMatch;
    });

    return filtered.length > 0 ? filtered : SHUFFLED_FLIGHT_ROUTES;
  }, [searchParams]);

  const isSearchMode = !!searchParams;
  const hasNoResults = isSearchMode && displayedRoutes === SHUFFLED_FLIGHT_ROUTES &&
    MOCK_FLIGHT_ROUTES.filter((r) => {
      const arr = searchParams!.arrivals.trim().toUpperCase();
      return r.arrivalAirport.includes(arr) || r.arrivalCity.includes(arr);
    }).length === 0;

  const datesArray = searchParams?.dates?.split(',') ?? [];
  const depDate = datesArray[0] ?? today;
  const retDate = datesArray[1] ?? returnDay;

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '2rem', borderBottom: '1.5px solid #e2e8f0' }}>
        {isSearchMode ? (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">
              &ldquo;{searchParams!.departures} → {searchParams!.arrivals}&rdquo; 검색 결과
            </h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {hasNoResults
                ? '검색 결과가 없어 인기 노선을 보여드립니다'
                : `${displayedRoutes.length}개 노선 · ${depDate}${searchParams!.tripType === 'RT' ? ` ~ ${retDate}` : ''} · ${searchParams!.passengerCount}명 · ${searchParams!.tripType === 'RT' ? '왕복' : '편도'}`}
            </p>
          </>
        ) : (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">인기 항공 노선 추천</h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              왕복 3박 기준 · {today} ~ {returnDay}
            </p>
          </>
        )}
      </div>

      {/* 2-col grid on desktop, 1-col on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" style={{ paddingTop: '2rem' }}>
        {displayedRoutes.map((route, index) => (
          <FlightRouteCard key={route.id} route={route} index={index} />
        ))}
      </div>
    </div>
  );
};
