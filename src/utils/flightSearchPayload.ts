import type { FlightSearchQuery } from '@/store/useFlightStore';
import { todayStr } from '@/utils/calendarUtils';

function addDays(dateStr: string, days: number): string {
  const next = new Date(`${dateStr}T00:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().split('T')[0];
}

/** API 검색용 페이로드 (왕복 시 출발·도착·일자 배열 변환) */
export function build_flight_search_payload(query: FlightSearchQuery): FlightSearchQuery {
  const payload = { ...query };
  if (query.tripType === 'RT') {
    const datesArray = query.dates.split(',');
    const depDate = datesArray[0] || todayStr();
    const retDate = datesArray[1] || addDays(depDate, 7);
    payload.departures = `${query.departures},${query.arrivals}`;
    payload.arrivals = `${query.arrivals},${query.departures}`;
    payload.dates = `${depDate},${retDate}`;
  }
  return payload;
}

export function count_flights_in_results(
  results: { journeys: Array<{ flights: unknown[] }> } | null
): number {
  if (!results) return 0;
  return results.journeys.reduce((sum, j) => sum + j.flights.length, 0);
}
