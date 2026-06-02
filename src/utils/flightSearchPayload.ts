import type { FlightSearchQuery } from '@/store/useFlightStore';
import { todayStr } from '@/utils/calendarUtils';

function addDays(dateStr: string, days: number): string {
  const next = new Date(`${dateStr}T00:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().split('T')[0];
}

const TRIP_TYPE_MAP: Record<string, string> = {
  OW: 'ONE_WAY',
  RT: 'ROUND_TRIP',
  MC: 'MULTI_CITY',
  ONE_WAY: 'ONE_WAY',
  ROUND_TRIP: 'ROUND_TRIP',
  MULTI_CITY: 'MULTI_CITY',
};

/** UI tripType → 백엔드 FlightSearchRequest */
export function build_flight_search_payload(query: FlightSearchQuery): Record<string, string | number> {
  const tripType = TRIP_TYPE_MAP[query.tripType] ?? query.tripType;
  const payload: Record<string, string | number> = {
    tripType,
    departures: query.departures,
    arrivals: query.arrivals,
    dates: query.dates,
    passengerCount: query.passengerCount,
  };

  if (query.seatClass && query.seatClass !== 'ALL') {
    payload.seatClass = query.seatClass;
  }

  if (query.tripType === 'RT' || query.tripType === 'ROUND_TRIP') {
    const datesArray = query.dates.split(',');
    const depDate = datesArray[0] || todayStr();
    const retDate = datesArray[1] || addDays(depDate, 7);
    payload.departures = `${query.departures},${query.arrivals}`;
    payload.arrivals = `${query.arrivals},${query.departures}`;
    payload.dates = `${depDate},${retDate}`;
    payload.tripType = 'ROUND_TRIP';
  }

  return payload;
}

export function count_flights_in_results(
  results: { journeys?: Array<{ flights?: unknown[] }> } | null
): number {
  if (!results) return 0;
  return (results.journeys ?? []).reduce((sum, j) => sum + (j.flights ?? []).length, 0);
}
