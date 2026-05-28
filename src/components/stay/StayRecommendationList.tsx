import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MOCK_STAYS, type MockStay } from '@/constants/mockStays';
import type { StaySearchParams } from './StaySearchForm';
import { StayDetailModal } from './StayDetailModal';
import { addDaysStr, isStayRangeAvailable, todayStr } from '@/utils/calendarUtils';
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Today → tomorrow (1박) 기준 랜덤 셔플 - 컴포넌트 최초 로드 시 1회 고정
const SHUFFLED_STAYS = shuffleArray(MOCK_STAYS);
const TODAY = todayStr();
const TOMORROW = addDaysStr(TODAY, 1);

interface StayCardProps {
  stay: MockStay;
  index: number;
  onSelect: (stay: MockStay) => void;
}

const StayCard: React.FC<StayCardProps> = ({ stay, index, onSelect }) => {
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
      { threshold: 0.08, rootMargin: '60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Stagger delay based on column position (0–3)
  const delayMs = (index % 4) * 90;
  const formattedPrice = stay.pricePerNight.toLocaleString('ko-KR');

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`flex flex-col cursor-pointer group transition-all duration-500 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      onClick={() => onSelect(stay)}
    >
      {/* Image Wrapper */}
      <div className="w-full aspect-[16/10] rounded-xl overflow-hidden relative mb-3 border border-slate-100">
        <img
          src={stay.imageUrl}
          alt={stay.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
      </div>

      {/* Card Body */}
      <div className="px-1">
        {/* Location */}
        <span className="font-bold text-[1.45rem] lg:text-[0.95rem] text-slate-800 leading-snug block truncate">
          {stay.location}
        </span>

        {/* Description */}
        <p className="text-[1.25rem] lg:text-[0.83rem] text-slate-400 font-medium truncate leading-snug">
          {stay.description}
        </p>

        {/* Price */}
        <div className="text-[1.3rem] lg:text-[0.9rem] text-slate-700">
          <span className="font-bold text-slate-900">₩{formattedPrice}</span>
          <span className="text-slate-400 font-normal"> / per Day</span>
        </div>
      </div>
    </div>
  );
};

interface StayRecommendationListProps {
  searchParams: StaySearchParams | null;
}

export const StayRecommendationList: React.FC<StayRecommendationListProps> = ({ searchParams }) => {
  const [selectedStay, setSelectedStay] = useState<MockStay | null>(null);

  const rangeCheckIn = searchParams?.checkIn ?? todayStr();
  const rangeCheckOut = searchParams?.checkOut ?? addDaysStr(rangeCheckIn, 1);

  const filterByAvailability = (stays: MockStay[]) =>
    stays.filter((stay) => isStayRangeAvailable(rangeCheckIn, rangeCheckOut, stay.soldOutDays));

  const displayedStays = useMemo(() => {
    if (!searchParams || !searchParams.destination.trim()) {
      return filterByAvailability(SHUFFLED_STAYS);
    }

    const keyword = searchParams.destination.trim().toLowerCase();

    const filtered = MOCK_STAYS.filter((stay) =>
      stay.city.toLowerCase().includes(keyword) ||
      stay.country.toLowerCase().includes(keyword) ||
      stay.location.toLowerCase().includes(keyword) ||
      stay.title.toLowerCase().includes(keyword) ||
      stay.tags.some((tag) => tag.toLowerCase().includes(keyword))
    );

    const available = filterByAvailability(filtered);
    return available.length > 0 ? available : filterByAvailability(SHUFFLED_STAYS);
  }, [searchParams, rangeCheckIn, rangeCheckOut]);

  const isSearchMode = !!(searchParams && searchParams.destination.trim());

  const modalCheckIn = rangeCheckIn;
  const modalCheckOut = rangeCheckOut;

  const hasNoResults = isSearchMode && MOCK_STAYS.filter((s) => {
    const keyword = searchParams!.destination.trim().toLowerCase();
    return (
      s.city.toLowerCase().includes(keyword) ||
      s.country.toLowerCase().includes(keyword) ||
      s.title.toLowerCase().includes(keyword)
    );
  }).length === 0;

  return (
    <div className="!px-5 lg:!px-0" style={{ paddingBottom: '4rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '2rem', borderBottom: '1.5px solid #e2e8f0' }}>
        {isSearchMode ? (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">
              &ldquo;{searchParams!.destination}&rdquo; 검색 결과
            </h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {hasNoResults
                ? '검색 결과가 없어 인기 숙소를 보여드립니다'
                : `${displayedStays.length}개 숙소 · ${searchParams!.checkIn} ~ ${searchParams!.checkOut} · 성인 ${searchParams!.guests}명`}
            </p>
          </>
        ) : (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">인기 숙소 및 객실 추천</h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              오늘 1박 기준 · {TODAY} ~ {TOMORROW}
            </p>
          </>
        )}
      </div>

      {/* Mobile·Tablet: 1 column / Desktop: 4-column grid */}
      <div
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        style={{ paddingTop: '2rem' }}
      >
        {displayedStays.map((stay, index) => (
          <StayCard key={stay.id} stay={stay} index={index} onSelect={setSelectedStay} />
        ))}
      </div>

      {selectedStay && (
        <StayDetailModal
          stay={selectedStay}
          defaultCheckIn={modalCheckIn}
          defaultCheckOut={modalCheckOut}
          onClose={() => setSelectedStay(null)}
        />
      )}
    </div>
  );
};
