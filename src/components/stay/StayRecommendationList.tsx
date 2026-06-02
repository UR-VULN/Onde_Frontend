import React, { useEffect, useRef, useState } from 'react';
import type { StayDto } from '@/api/stayApi';
import type { StaySearchParams } from './StaySearchForm';
import { StayDetailModal } from './StayDetailModal';
import { addDaysStr, todayStr } from '@/utils/calendarUtils';
import { ListingThumbnail } from '@/components/common/ListingThumbnail';
import { formatKrwPriceOrDash } from '@/utils/listingDisplay';

interface StayCardProps {
  stay: StayDto;
  index: number;
  onSelect: (stay: StayDto) => void;
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

  const delayMs = (index % 4) * 90;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`flex flex-col cursor-pointer group transition-all duration-500 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      onClick={() => onSelect(stay)}
    >
      <div className="w-full aspect-[16/10] rounded-xl overflow-hidden relative mb-3 border border-slate-100">
        <ListingThumbnail
          imageUrl={stay.imageUrl}
          alt={stay.title}
          iconClass="fa-hotel"
          className="w-full h-full text-3xl"
          imgClassName="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
      </div>
      <div className="px-1">
        <span className="font-bold text-[1.45rem] lg:text-[0.95rem] text-slate-800 leading-snug block truncate">
          {stay.location}
        </span>
        <p className="text-[1.25rem] lg:text-[0.83rem] text-slate-400 font-medium truncate leading-snug">
          {stay.description}
        </p>
        <div className="text-[1.3rem] lg:text-[0.9rem] text-slate-700">
          <span className="font-bold text-slate-900">{formatKrwPriceOrDash(stay.pricePerNight)}</span>
          {stay.pricePerNight != null && stay.pricePerNight > 0 && (
            <span className="text-slate-400 font-normal"> / per Day</span>
          )}
        </div>
      </div>
    </div>
  );
};

interface StayRecommendationListProps {
  stays: StayDto[];
  searchParams: StaySearchParams | null;
  loading?: boolean;
  hasSearched?: boolean;
}

export const StayRecommendationList: React.FC<StayRecommendationListProps> = ({
  stays,
  searchParams,
  loading = false,
  hasSearched = false,
}) => {
  const [selectedStay, setSelectedStay] = useState<StayDto | null>(null);

  const rangeCheckIn = searchParams?.checkIn ?? todayStr();
  const rangeCheckOut = searchParams?.checkOut ?? addDaysStr(rangeCheckIn, 1);
  const isSearchMode = hasSearched && !!searchParams?.destination.trim();

  return (
    <div className="!px-5 lg:!px-0" style={{ paddingBottom: '4rem' }}>
      <div className="recommendation-section-head">
        {isSearchMode ? (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">
              &ldquo;{searchParams!.destination}&rdquo; 검색 결과
            </h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {loading
                ? '조회 중...'
                : `${stays.length}개 숙소 · ${searchParams!.checkIn} ~ ${searchParams!.checkOut} · 성인 ${searchParams!.guests}명`}
            </p>
          </>
        ) : (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">잠들기 좋은 밤만 골랐어요</h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {loading ? '불러오는 중...' : `총 ${stays.length}개`}
            </p>
          </>
        )}
      </div>

      {loading && stays.length === 0 ? (
        <p className="recommendation-section-status">숙소를 불러오는 중입니다...</p>
      ) : stays.length === 0 ? (
        <p className="recommendation-section-status">표시할 숙소가 없습니다.</p>
      ) : (
        <div className="recommendation-section-content grid grid-cols-1 lg:grid-cols-4 gap-6">
          {stays.map((stay, index) => (
            <StayCard key={stay.accommodationId} stay={stay} index={index} onSelect={setSelectedStay} />
          ))}
        </div>
      )}

      {selectedStay && (
        <StayDetailModal
          stay={selectedStay}
          soldOutDays={[]}
          roomId={selectedStay.roomId ?? selectedStay.accommodationId}
          defaultCheckIn={rangeCheckIn}
          defaultCheckOut={rangeCheckOut}
          onClose={() => setSelectedStay(null)}
        />
      )}
    </div>
  );
};
