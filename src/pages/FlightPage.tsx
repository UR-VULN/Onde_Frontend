import React, { useCallback, useEffect, useState } from 'react';
import { FlightSearchForm, type FlightSearchParams } from '@/components/flight/FlightSearchForm';
import { FlightRecommendationList } from '@/components/flight/FlightRecommendationList';
import { FlightReservationModal } from '@/components/flight/FlightReservationModal';
import { search_flights_api } from '@/api/flightApi';
import type { FlightDto, AvailableSeat, FlightSearchResponse } from '@/store/useFlightStore';
import { useFlightStore } from '@/store/useFlightStore';
import { useTravelStore } from '@/store/useTravelStore';
import { build_flight_search_payload, count_flights_in_results } from '@/utils/flightSearchPayload';
import { todayStr, addDaysStr } from '@/utils/calendarUtils';

const defaultSearch = (): FlightSearchParams => ({
  tripType: 'RT',
  departures: 'ICN',
  arrivals: 'NRT',
  dates: `${todayStr()},${addDaysStr(todayStr(), 3)}`,
  seatClass: 'ALL',
  passengerCount: 1,
});

export const FlightPage: React.FC = () => {
  const { addToast } = useTravelStore();
  const { set_search_query, set_search_results } = useFlightStore();
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null);
  const [results, setResults] = useState<FlightSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<FlightDto | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<AvailableSeat | null>(null);

  const loadFlights = useCallback(
    async (params: FlightSearchParams, showToast = false) => {
      setLoading(true);
      set_search_query(params);
      try {
        const res = await search_flights_api(build_flight_search_payload(params));
        if (res.success && res.data) {
          setResults(res.data);
          set_search_results(res.data);
          if (showToast) {
            const count = count_flights_in_results(res.data);
            addToast(
              count > 0 ? `항공편 ${count}편을 찾았습니다.` : '검색 결과가 없습니다.',
              count > 0 ? 'success' : 'warning'
            );
          }
        } else {
          setResults(null);
          set_search_results(null);
          if (showToast) addToast(res.message || '검색에 실패했습니다.', 'warning');
        }
      } catch (err: unknown) {
        setResults(null);
        set_search_results(null);
        const msg =
          (err as { message?: string })?.message ||
          (err as { error?: { message?: string } })?.error?.message ||
          '항공편 검색 중 오류가 발생했습니다.';
        if (showToast) addToast(msg, 'warning');
      } finally {
        setLoading(false);
      }
    },
    [addToast, set_search_query, set_search_results]
  );

  useEffect(() => {
    const initial = defaultSearch();
    set_search_query(initial);
    loadFlights(initial);
  }, [loadFlights, set_search_query]);

  const handleSearch = (params: FlightSearchParams) => {
    setSearchParams(params);
    setHasSearched(true);
    loadFlights(params, true);
  };

  return (
    <div className="w-full !-mt-[40px] relative z-20 transition-all duration-300 animate-[fadeIn_0.35s_ease]">
      <FlightSearchForm onSearch={handleSearch} loading={loading} />
      <div style={{ height: '4rem' }} />
      <FlightRecommendationList
        results={results}
        searchParams={searchParams}
        loading={loading}
        hasSearched={hasSearched}
        on_select_seat={(flight, seat) => {
          setSelectedFlight(flight);
          setSelectedSeat(seat);
        }}
      />
      {selectedFlight && selectedSeat && (
        <FlightReservationModal
          flight={selectedFlight}
          seat={selectedSeat}
          onClose={() => {
            setSelectedFlight(null);
            setSelectedSeat(null);
          }}
        />
      )}
    </div>
  );
};
