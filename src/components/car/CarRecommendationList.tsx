import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { CarDto } from '@/api/carApi';
import type { CarSearchParams } from './CarSearchForm';
import { CarDetailModal } from './CarDetailModal';
import { ListingThumbnail } from '@/components/common/ListingThumbnail';
import { formatKrwPriceOrDash, hasDisplayPrice } from '@/utils/listingDisplay';

interface CarCardProps {
  car: CarDto;
  index: number;
  count: number;
  onSelect: (car: CarDto) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, index, count, onSelect }) => {
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

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${(index % 4) * 90}ms` }}
      className={`flex flex-col cursor-pointer group transition-all duration-500 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      onClick={() => onSelect(car)}
    >
      <div className="w-full aspect-[16/10] rounded-xl overflow-hidden relative mb-3 border border-slate-100">
        <ListingThumbnail
          imageUrl={car.imageUrl}
          alt={car.name}
          iconClass="fa-car"
          className="w-full h-full text-3xl"
          imgClassName="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[1.1rem] lg:text-[0.7rem] font-bold px-2 py-0.5 rounded-md shadow-md z-10">
          예약 가능 차량: {count}대
        </div>
      </div>
      <div className="px-1">
        <span className="font-bold text-[1.45rem] lg:text-[0.95rem] text-slate-800 leading-snug block truncate">
          {car.name}
        </span>
        <p className="text-[1.25rem] lg:text-[0.83rem] text-slate-400 font-medium truncate">{car.typeLabel}</p>
        <div className="text-[1.3rem] lg:text-[0.9rem] text-slate-700">
          <span className="font-bold text-slate-900">{formatKrwPriceOrDash(car.pricePerDay)}</span>
          {hasDisplayPrice(car.pricePerDay) && (
            <span className="text-slate-400 font-normal"> / per Day</span>
          )}
        </div>
      </div>
    </div>
  );
};

interface CarRecommendationListProps {
  cars: CarDto[];
  searchParams: CarSearchParams | null;
  loading?: boolean;
  hasSearched?: boolean;
}

export const CarRecommendationList: React.FC<CarRecommendationListProps> = ({
  cars,
  searchParams,
  loading = false,
  hasSearched = false,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<CarDto[] | null>(null);

  // Group cars by name (model name)
  const groupedCars = useMemo(() => {
    const groups: Record<string, CarDto[]> = {};
    cars.forEach((car) => {
      if (!groups[car.name]) {
        groups[car.name] = [];
      }
      groups[car.name].push(car);
    });
    return Object.values(groups);
  }, [cars]);

  // Adjust total count display
  const totalDisplayCount = groupedCars.length;

  return (
    <div className="px-5 lg:px-0 pb-16">
      <div className="recommendation-section-head">
        {hasSearched && searchParams?.pickupSpot ? (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">
              &ldquo;{searchParams.pickupSpot}&rdquo; 검색 결과
            </h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {loading
                ? '조회 중...'
                : `${totalDisplayCount}개 모델 · ${searchParams.pickupDate} ~ ${searchParams.returnDate}`}
            </p>
          </>
        ) : (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">운전석이 비어 있어요</h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {loading ? '불러오는 중...' : `총 ${totalDisplayCount}개 모델`}
            </p>
          </>
        )}
      </div>

      {loading && cars.length === 0 ? (
        <p className="recommendation-section-status">차량을 불러오는 중입니다...</p>
      ) : cars.length === 0 ? (
        <p className="recommendation-section-status">표시할 차량이 없습니다.</p>
      ) : (
        <div className="recommendation-section-content grid grid-cols-1 lg:grid-cols-4 gap-6">
          {groupedCars.map((group: CarDto[], index: number) => (
            <CarCard
              key={group[0].carId}
              car={group[0]}
              count={group.length}
              index={index}
              onSelect={() => setSelectedGroup(group)}
            />
          ))}
        </div>
      )}

      {selectedGroup && selectedGroup.length > 0 && (
        <CarDetailModal
          car={selectedGroup[0]}
          vehicles={selectedGroup}
          soldOutDays={[]}
          defaultPickup={searchParams?.pickupDate}
          defaultReturn={searchParams?.returnDate}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
};
