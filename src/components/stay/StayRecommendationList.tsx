import React, { useEffect, useRef, useState } from 'react';
import type { StayDto } from '@/api/stayApi';
import type { StaySearchParams } from './StaySearchForm';
import { StayDetailModal } from './StayDetailModal';
import { addDaysStr, todayStr } from '@/utils/calendarUtils';
import { ListingThumbnail } from '@/components/common/ListingThumbnail';
import { formatKrwPriceOrDash } from '@/utils/listingDisplay';
import { TRAVEL_DESTINATIONS } from '@/constants/travelDestinations';

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

  // Parse location based on TRAVEL_DESTINATIONS mappings
  const locationStr = stay.location || '';
  let countryLabel: string;
  let cityLabel: string;

  const foundDest = TRAVEL_DESTINATIONS.find(dest => locationStr.startsWith(dest.value));
  if (foundDest) {
    countryLabel = foundDest.label;
    cityLabel = locationStr.substring(foundDest.value.length).trim();
  } else {
    // Fallback space split
    const parts = locationStr.split(' ');
    countryLabel = parts[0] || '';
    cityLabel = parts.slice(1).join(' ') || '';
  }

  const displayLocation = countryLabel && cityLabel ? `${countryLabel} · ${cityLabel}` : locationStr;
  const category = stay.tags?.[0] || '숙소';


  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`flex flex-col cursor-pointer group transition-all duration-500 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      onClick={() => onSelect(stay)}
    >
      {/* Image Block */}
      <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden relative mb-1.5 border border-slate-100/60 shadow-sm transition-all duration-300 group-hover:shadow-md">
        <ListingThumbnail
          imageUrl={stay.imageUrl}
          alt={stay.title}
          iconClass="fa-hotel"
          className="w-full h-full text-3xl"
          imgClassName="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />

        {/* Floating Location Badge (Glassmorphic Top-Left) */}
        <div className="absolute top-2.5 left-2.5 bg-black/45 backdrop-blur-md pl-4 pr-5 py-1.5 rounded-lg border border-white/15 flex items-center gap-1.5 whitespace-nowrap">
          <i className="fa-solid fa-location-dot text-rose-500 text-[1.1rem] lg:text-[0.7rem] flex-shrink-0" />
          <span className="text-white text-[1.1rem] lg:text-[0.7rem] font-bold tracking-normal whitespace-nowrap">
            {displayLocation}
          </span>
        </div>

        {/* Floating Rating Badge */}
        {stay.rating && stay.rating > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm border border-slate-100/50 flex items-center gap-1">
            <i className="fa-solid fa-star text-amber-400 text-[1.1rem] lg:text-[0.7rem]" />
            <span className="text-slate-800 text-[1.1rem] lg:text-[0.7rem] font-black">
              {stay.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Details Block */}
      <div className="px-0.5">
        {/* Category Label */}
        <div className="mb-0.5">
          <span className="block text-[1.25rem] lg:text-[0.82rem] font-black text-blue-600 uppercase tracking-wider">
            {category}
          </span>
        </div>

        {/* Stay Title */}
        <h3 className="font-extrabold text-[1.4rem] lg:text-[0.96rem] text-slate-800 leading-snug block group-hover:text-blue-600 transition-colors duration-200 mb-0.5 truncate">
          {stay.title}
        </h3>

        {/* Pricing Layout */}
        <div className="flex items-baseline gap-0.5">
          <span className="font-black text-[1.4rem] lg:text-[1.05rem] text-slate-900">
            {formatKrwPriceOrDash(stay.pricePerNight)}
          </span>
          {stay.pricePerNight != null && stay.pricePerNight > 0 && (
            <span className="text-slate-400 text-[1.1rem] lg:text-[0.75rem] font-medium">/1박</span>
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
    <div className="px-5 lg:px-0 pb-16">
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
