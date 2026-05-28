import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MOCK_CARS, type MockCar } from '@/constants/mockCars';
import type { CarSearchParams } from './CarSearchForm';
import { CarDetailModal } from './CarDetailModal';
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

const SHUFFLED_CARS = shuffleArray(MOCK_CARS);
const TODAY = formatDate(new Date());
const TOMORROW = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

interface CarCardProps {
  car: MockCar;
  index: number;
  onSelect: (car: MockCar) => void;
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

  const delayMs = (index % 4) * 90;
  const formattedPrice = car.pricePerDay.toLocaleString('ko-KR');

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={`flex flex-col cursor-pointer group transition-all duration-500 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      onClick={() => onSelect(car)}
    >
      {/* Image Wrapper */}
      <div className="w-full aspect-[16/10] rounded-xl overflow-hidden relative mb-3 border border-slate-100">
        <img
          src={car.imageUrl}
          alt={car.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
      </div>

      {/* Card Body */}
      <div className="px-1">
        {/* Car Name */}
        <span className="font-bold text-[1.45rem] lg:text-[0.95rem] text-slate-800 leading-snug block truncate">
          {car.name}
        </span>

        {/* Description */}
        <p className="text-[1.25rem] lg:text-[0.83rem] text-slate-400 font-medium truncate leading-snug">
          {car.description}
        </p>

        {/* Seats + Fuel */}
        <p className="text-[1rem] lg:text-[0.75rem] text-slate-400 font-medium leading-snug">
          <i className="fa-solid fa-user text-slate-300 mr-1"></i>{car.seats}인승
          <span className="mx-1.5 text-slate-200">·</span>
          <i className="fa-solid fa-gas-pump text-slate-300 mr-1"></i>{car.fuel}
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

interface CarRecommendationListProps {
  searchParams: CarSearchParams | null;
}

export const CarRecommendationList: React.FC<CarRecommendationListProps> = ({ searchParams }) => {
  const [selectedCar, setSelectedCar] = useState<MockCar | null>(null);
  const displayedCars = useMemo(() => {
    if (!searchParams) return SHUFFLED_CARS;

    const { carType, pickupSpot } = searchParams;
    const keyword = pickupSpot.trim().toLowerCase();

    let filtered = MOCK_CARS;

    // Filter by car type
    if (carType !== 'ALL') {
      filtered = filtered.filter((c) => c.type === carType);
    }

    // Filter by pickup spot keyword (tags / name / typeLabel)
    if (keyword) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(keyword) ||
        c.typeLabel.toLowerCase().includes(keyword) ||
        c.description.toLowerCase().includes(keyword) ||
        c.tags.some((t) => t.toLowerCase().includes(keyword))
      );
    }

    return filtered.length > 0 ? filtered : SHUFFLED_CARS;
  }, [searchParams]);

  const isSearchMode = !!searchParams;

  const hasNoResults = isSearchMode && (() => {
    const { carType, pickupSpot } = searchParams!;
    const keyword = pickupSpot.trim().toLowerCase();
    let filtered = MOCK_CARS;
    if (carType !== 'ALL') filtered = filtered.filter((c) => c.type === carType);
    if (keyword) filtered = filtered.filter((c) =>
      c.name.toLowerCase().includes(keyword) ||
      c.tags.some((t) => t.toLowerCase().includes(keyword))
    );
    return filtered.length === 0;
  })();

  const typeLabelMap: Record<string, string> = {
    ALL: '전체 차량',
    MINI: '경형/소형',
    SEDAN: '중형/대형',
    SUV: 'SUV/RV',
    IMPORT: '수입/스포츠',
    EV: '전기차',
  };

  return (
    <div className="!px-5 lg:!px-0" style={{ paddingBottom: '4rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '2rem', borderBottom: '1.5px solid #e2e8f0' }}>
        {isSearchMode ? (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">
              {searchParams!.carType !== 'ALL'
                ? `"${typeLabelMap[searchParams!.carType]}" 검색 결과`
                : `"${searchParams!.pickupSpot || '전체'}" 검색 결과`}
            </h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              {hasNoResults
                ? '검색 결과가 없어 인기 차량을 보여드립니다'
                : `${displayedCars.length}대 · ${searchParams!.pickupDate} ~ ${searchParams!.returnDate}`}
            </p>
          </>
        ) : (
          <>
            <h4 className="font-logo font-black text-3xl text-slate-800 tracking-tight">인기 렌터카 추천</h4>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
              오늘 1일 기준 · {TODAY} ~ {TOMORROW}
            </p>
          </>
        )}
      </div>

      {/* Desktop: 4-column grid */}
      <div
        className="hidden lg:grid lg:grid-cols-4 gap-6"
        style={{ paddingTop: '2rem' }}
      >
        {displayedCars.map((car, index) => (
          <CarCard key={car.id} car={car} index={index} onSelect={setSelectedCar} />
        ))}
      </div>

      {/* Mobile·Tablet: 1 column */}
      <div
        className="grid grid-cols-1 lg:hidden gap-6"
        style={{ paddingTop: '2rem' }}
      >
        {displayedCars.map((car, index) => (
          <CarCard key={car.id} car={car} index={index} onSelect={setSelectedCar} />
        ))}
      </div>

      {selectedCar && (
        <CarDetailModal
          car={selectedCar}
          defaultPickup={searchParams?.pickupDate}
          defaultReturn={searchParams?.returnDate}
          onClose={() => setSelectedCar(null)}
        />
      )}
    </div>
  );
};
