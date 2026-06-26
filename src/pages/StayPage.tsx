import React, { useCallback, useEffect, useState } from 'react';
import { StaySearchForm, type StaySearchParams } from '@/components/stay/StaySearchForm';
import { StayRecommendationList } from '@/components/stay/StayRecommendationList';
import { search_stays_api, type StayDto } from '@/api/stayApi';
import { useTravelStore } from '@/store/useTravelStore';
import { todayStr, addDaysStr } from '@/utils/calendarUtils';
import { extractApiErrorMessage } from '@/utils/apiResponse';

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadStays = useCallback(
    async (params: StaySearchParams, showToast = false) => {
      setLoading(true);
      setPage(0);
      setHasMore(true);
      try {
        const res = await search_stays_api({ ...params, page: 0, size: 20 });
        if (res.success && res.data) {
          setStays(res.data.stays);
          const totalCount = res.data.total ?? 0;
          setHasMore(res.data.stays.length < totalCount && res.data.stays.length > 0);
          if (showToast) {
            addToast(
              res.data.stays.length > 0
                ? `숙소 ${totalCount}건을 찾았습니다.`
                : '검색 결과가 없습니다.',
              res.data.stays.length > 0 ? 'success' : 'warning'
            );
          }
        } else {
          setStays([]);
          setHasMore(false);
          if (showToast) addToast(res.message || '검색에 실패했습니다.', 'warning');
        }
      } catch (err: unknown) {
        setStays([]);
        setHasMore(false);
        const msg = extractApiErrorMessage(err, '숙소 검색 중 오류가 발생했습니다.');
        if (showToast) addToast(msg, 'warning');
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const currentParams = searchParams || defaultSearch();
      const res = await search_stays_api({
        ...currentParams,
        page: nextPage,
        size: 20,
      });
      if (res.success && res.data) {
        const newStays = res.data.stays || [];
        setStays((prev) => {
          const merged = [...prev, ...newStays];
          const totalCount = res.data.total ?? 0;
          setHasMore(merged.length < totalCount && newStays.length > 0);
          return merged;
        });
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more stays:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, page, searchParams]);

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
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />
    </div>
  );
};
