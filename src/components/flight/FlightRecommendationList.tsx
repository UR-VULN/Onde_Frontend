import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MOCK_FLIGHT_ROUTES, SHUFFLED_FLIGHT_ROUTES, type MockFlightRoute } from '@/constants/mockFlightRoutes';
import type { FlightSearchParams } from './FlightSearchForm';
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
      style={{
        transitionDelay: `${delayMs}ms`,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}
      className={`rounded-2xl border border-slate-100 transition-all duration-500 ease-out cursor-pointer group overflow-hidden
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.10), 0 0 0 1.5px ${accentColor}22`;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.06)';
        (e.currentTarget as HTMLDivElement).style.transform = '';
      }}
      onClick={() => {}}
    >
      {/* Header band: airline info + price */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '1rem 1.75rem', background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`, borderBottom: `1px solid ${accentColor}20` }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Airline code pill */}
          <span
            className="text-[0.68rem] font-black px-2.5 py-1 rounded-lg text-white tracking-widest"
            style={{ background: accentColor, letterSpacing: '0.08em' }}
          >
            {route.airlineCode}
          </span>
          <div>
            <span className="font-bold text-slate-700 block leading-tight" style={{ fontSize: '1rem' }}>{route.airline}</span>
            <span className="font-semibold text-slate-400 leading-tight" style={{ fontSize: '0.88rem' }}>{route.flightNumber}</span>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <span className="text-slate-400 font-semibold block leading-tight" style={{ fontSize: '0.82rem' }}>이코노미 최저가</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', justifyContent: 'flex-end' }}>
            <strong className="font-black leading-tight" style={{ color: '#ff5a5f', fontSize: '1.45rem' }}>
              ₩{formattedPrice}
            </strong>
            <span className="text-slate-400 font-semibold" style={{ fontSize: '0.85rem' }}>~</span>
          </div>
        </div>
      </div>

      {/* Route body */}
      <div style={{ padding: '1.5rem 1.75rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

          {/* Departure */}
          <div style={{ flex: '0 0 auto', minWidth: '80px' }}>
            <strong
              className="font-black text-slate-800 block leading-none tracking-tight"
              style={{ fontSize: '1.9rem', letterSpacing: '-0.04em' }}
            >
              {route.departureAirport}
            </strong>
            <span className="font-semibold text-slate-400 block" style={{ fontSize: '0.95rem', marginTop: '4px' }}>
              {route.departureCity}
            </span>
            <span className="font-extrabold text-slate-700 block" style={{ fontSize: '1.35rem', marginTop: '6px' }}>
              {route.departureTime}
            </span>
          </div>

          {/* Route line */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            {/* Duration pill */}
            <span
              className="font-bold rounded-full"
              style={{ background: `${accentColor}15`, color: accentColor, fontSize: '0.9rem', padding: '0.25rem 0.85rem' }}
            >
              {formatDuration(route.durationMinutes)}
            </span>
            {/* Dashed route line */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', border: `2px solid ${accentColor}`, flexShrink: 0 }} />
              <div style={{ flex: 1, borderTop: `2px dashed ${accentColor}50` }} />
              <i className="fa-solid fa-plane-departure text-[0.85rem]" style={{ color: accentColor, flexShrink: 0 }}></i>
              <div style={{ flex: 1, borderTop: `2px dashed ${accentColor}50` }} />
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: accentColor, flexShrink: 0 }} />
            </div>
            <span className="text-[0.62rem] font-semibold text-slate-300">{route.date}</span>
          </div>

          {/* Arrival */}
          <div style={{ flex: '0 0 auto', minWidth: '80px', textAlign: 'right' }}>
            <strong
              className="font-black text-slate-800 block leading-none tracking-tight"
              style={{ fontSize: '1.9rem', letterSpacing: '-0.04em' }}
            >
              {route.arrivalAirport}
              {isOvernight && (
                <sup className="font-black ml-0.5" style={{ fontSize: '0.8rem', color: '#ff5a5f', verticalAlign: 'super' }}>+1</sup>
              )}
            </strong>
            <span className="font-semibold text-slate-400 block" style={{ fontSize: '0.95rem', marginTop: '4px' }}>
              {route.arrivalCity}
            </span>
            <span className="font-extrabold text-slate-700 block" style={{ fontSize: '1.35rem', marginTop: '6px' }}>
              {route.arrivalTime}
            </span>
          </div>
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
    <div className="!px-5 lg:!px-0" style={{ paddingBottom: '4rem' }}>
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
