import React, { useCallback, useEffect, useState } from 'react';
import { CarSearchForm, type CarSearchParams } from '@/components/car/CarSearchForm';
import { CarRecommendationList } from '@/components/car/CarRecommendationList';
import { search_cars_api, type CarDto } from '@/api/carApi';
import { useTravelStore } from '@/store/useTravelStore';
import { todayStr, addDaysStr } from '@/utils/calendarUtils';

const defaultSearch = (): CarSearchParams => ({
  pickupSpot: '제주',
  pickupDate: todayStr(),
  returnDate: addDaysStr(todayStr(), 2),
  carType: 'ALL',
});

export const CarPage: React.FC = () => {
  const { addToast } = useTravelStore();
  const [searchParams, setSearchParams] = useState<CarSearchParams | null>(null);
  const [cars, setCars] = useState<CarDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const loadCars = useCallback(
    async (params: CarSearchParams, showToast = false) => {
      setLoading(true);
      try {
        const res = await search_cars_api(params);
        if (res.success && res.data) {
          setCars(res.data.cars);
          if (showToast) {
            addToast(
              res.data.cars.length > 0
                ? `렌터카 ${res.data.cars.length}건을 찾았습니다.`
                : '검색 결과가 없습니다.',
              res.data.cars.length > 0 ? 'success' : 'warning'
            );
          }
        } else {
          setCars([]);
          if (showToast) addToast(res.message || '검색에 실패했습니다.', 'warning');
        }
      } catch (err: unknown) {
        setCars([]);
        const msg =
          (err as { message?: string })?.message ||
          (err as { error?: { message?: string } })?.error?.message ||
          '렌터카 검색 중 오류가 발생했습니다.';
        if (showToast) addToast(msg, 'warning');
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    loadCars(defaultSearch());
  }, [loadCars]);

  const handleSearch = (params: CarSearchParams) => {
    setSearchParams(params);
    setHasSearched(true);
    loadCars(params, true);
  };

  return (
    <div className="w-full !-mt-[40px] relative z-20 transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      <CarSearchForm onSearch={handleSearch} loading={loading} />
      <div className="h-16" />
      <CarRecommendationList
        cars={cars}
        searchParams={searchParams}
        loading={loading}
        hasSearched={hasSearched}
      />
    </div>
  );
};
