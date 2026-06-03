import React, { useEffect, useRef, useState } from 'react';
import type { CarDto } from '@/api/carApi';
import type { CarSearchParams } from './CarSearchForm';
import { CarDetailModal } from './CarDetailModal';

interface CarCardProps {
  car: CarDto;
  index: number;
  onSelect: (car: CarDto) => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, index, onSelect }) => {
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
        <img
          src={car.imageUrl}
          alt={car.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
      </div>
      <div className="px-1">
        <span className="font-bold text-[1.45rem] lg:text-[0.95rem] text-slate-800 leading-snug block truncate">
          {car.name}
        </span>
        <p className="text-[1.25rem] lg:text-[0.83rem] text-slate-400 font-medium truncate">{car.typeLabel}</p>
        <div className="text-[1.3rem] lg:text-[0.9rem] text-slate-700">
          <span className="font-bold text-slate-900">₩{car.pricePerDay.toLocaleString('ko-KR')}</span>
          <span className="text-slate-400 font-normal"> / per Day</span>
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
  const [selectedCar, setSelectedCar] = useState<CarDto | null>(null);
  return (
    <div className="!px-5 lg:!px-0" style={{ paddingBottom: '4rem' }}>
      <div className="recommendation-section-head">
        {hasSearched && searchParams?.pickupSpot ? (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">
              &ldquo;{searchParams.pickupSpot}&rdquo; 검색 결과
            </h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {loading
                ? '조회 중...'
                : `${cars.length}대 · ${searchParams.pickupDate} ~ ${searchParams.returnDate}`}
            </p>
          </>
        ) : (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">운전석이 비어 있어요</h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {loading ? '불러오는 중...' : `총 ${cars.length}대`}
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
          {cars.map((car, index) => (
            <CarCard key={car.carId} car={car} index={index} onSelect={setSelectedCar} />
          ))}
        </div>
      )}

      {selectedCar && (
        <CarDetailModal
          car={selectedCar}
          soldOutDays={[]}
          defaultPickup={searchParams?.pickupDate}
          defaultReturn={searchParams?.returnDate}
          onClose={() => setSelectedCar(null)}
        />
      )}
    </div>
  );
};
