import React, { useCallback, useEffect, useState } from 'react';
import { StaySearchForm, type StaySearchParams } from '@/components/stay/StaySearchForm';
import { StayRecommendationList } from '@/components/stay/StayRecommendationList';
import { search_stays_api, type StayDto } from '@/api/stayApi';
import { useTravelStore } from '@/store/useTravelStore';
import { todayStr, addDaysStr } from '@/utils/calendarUtils';

const defaultSearch = (): StaySearchParams => ({
  destination: '',
  checkIn: todayStr(),
  checkOut: addDaysStr(todayStr(), 1),
  guests: 2,
  rooms: 1,
});

export const StayPage: React.FC = () => {
  const { addToast } = useTravelStore();
  const [searchParams, setSearchParams] = useState<StaySearchParams | null>(null);
  const [stays, setStays] = useState<StayDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const loadStays = useCallback(
    async (params: StaySearchParams, showToast = false) => {
      setLoading(true);
      try {
        const res = await search_stays_api(params);
        if (res.success && res.data) {
          setStays(res.data.stays);
          if (showToast) {
            addToast(
              res.data.stays.length > 0
                ? `숙소 ${res.data.stays.length}건을 찾았습니다.`
                : '검색 결과가 없습니다.',
              res.data.stays.length > 0 ? 'success' : 'warning'
            );
          }
        } else {
          setStays([]);
          if (showToast) addToast(res.message || '검색에 실패했습니다.', 'warning');
        }
      } catch (err: unknown) {
        setStays([]);
        const msg =
          (err as { message?: string })?.message ||
          (err as { error?: { message?: string } })?.error?.message ||
          '숙소 검색 중 오류가 발생했습니다.';
        if (showToast) addToast(msg, 'warning');
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    loadStays(defaultSearch());
  }, [loadStays]);

  const handleSearch = (params: StaySearchParams) => {
    setSearchParams(params);
    setHasSearched(true);
    loadStays(params, true);
  };

  return (
    <div className="w-full !-mt-[40px] relative z-20 transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      <StaySearchForm onSearch={handleSearch} loading={loading} />
      <div className="h-16" />
      <StayRecommendationList
        stays={stays}
        searchParams={searchParams}
        loading={loading}
        hasSearched={hasSearched}
      />
    </div>
  );
};
