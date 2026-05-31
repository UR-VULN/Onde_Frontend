import { userAxios } from '@/api/axiosInstance';
import type { FlightSearchQuery, FlightSearchResponse } from '@/store/useFlightStore';

// 1. 고객용 항공권 통합 실시간 검색
export const search_flights_api = async (params: FlightSearchQuery): Promise<{ success: boolean; data: FlightSearchResponse; message: string }> => {
  return userAxios.get('/api/v1/flights/search', { params });
};

/** 명세: POST /api/v1/reservations/flights — 숙소·렌터카와 동일 예약 후 결제 */
export interface FlightReservationPayload {
  scheduleId: number;
  seatClass: string;
  passengers: Array<{
    name: string;
    passportNumber: string;
    birthdate: string;
  }>;
}

export interface FlightReservationResponse {
  reservationId: number;
  bookingId: number;
  bookingCode: string;
  scheduleId: number;
  flightNumber: string;
  seatClass: string;
  totalPrice: number;
  status: string;
}

export const book_flight_reservation_api = async (
  payload: FlightReservationPayload
): Promise<{ success: boolean; data: FlightReservationResponse; message: string }> => {
  return userAxios.post('/api/v1/reservations/flights', payload);
};

/** @deprecated book_flight_reservation_api */
export const book_flight_seat_api = book_flight_reservation_api;

// 3. 판매자용 정기 스케줄 일괄 등록 신청
export interface FlightBatchRegisterPayload {
  departureAirport: string;
  arrivalAirport: string;
  distanceKm: number;
  flightNumber: string;
  departureTime: string; // "HH:mm"
  arrivalTime: string;   // "HH:mm"
  durationMinutes: number;
  startDate: string;     // "YYYY-MM-DD"
  endDate: string;       // "YYYY-MM-DD"
  operatingDays: string; // "MON,WED,FRI"
  firstSeats: number;
  firstPrice: number;
  businessSeats: number;
  businessPrice: number;
  economySeats: number;
  economyPrice: number;
}

const mapDaysToIntegers = (daysStr: string): number[] => {
  const dayMap: Record<string, number> = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 7 };
  return daysStr.split(',').map(d => dayMap[d.trim()]).filter(Boolean);
};

export const seller_register_flights_batch_api = async (
  payload: FlightBatchRegisterPayload
): Promise<{ success: boolean; message: string }> => {
  const formattedTime = payload.departureTime.includes(':') && payload.departureTime.split(':').length === 2
    ? `${payload.departureTime}:00`
    : payload.departureTime;

  const backendBody = {
    flightNumber: payload.flightNumber,
    departureAirport: payload.departureAirport,
    arrivalAirport: payload.arrivalAirport,
    startDate: payload.startDate,
    endDate: payload.endDate,
    operatingDays: mapDaysToIntegers(payload.operatingDays),
    departureTime: formattedTime,
    durationMinutes: payload.durationMinutes,
    seatSetup: [
      { classType: 'FIRST', totalSeats: payload.firstSeats, basePrice: payload.firstPrice },
      { classType: 'BUSINESS', totalSeats: payload.businessSeats, basePrice: payload.businessPrice },
      { classType: 'ECONOMY', totalSeats: payload.economySeats, basePrice: payload.economyPrice }
    ]
  };

  return userAxios.post('/api/v1/seller/flights', backendBody);
};

// 4. 판매자용 달력 스케줄 목록 조회
export interface CalendarParams {
  origin: string;
  dest: string;
  year: number;
  month: number;
  seatClass?: string;
}

export interface SellerCalendarCellDto {
  scheduleId: number;
  flightNumber: string;
  departureTime: string;
  classType: string;
  totalSeats: number;
  remainingSeats: number;
  basePrice: number;
}

export const seller_get_calendar_schedules_api = async (params: CalendarParams): Promise<{ success: boolean; data: SellerCalendarCellDto[]; message: string }> => {
  return userAxios.get('/api/v1/seller/flights/calendar', { params });
};

// 5. 판매자용 달력 기반 가격/재고 수동 제어 (명세: PATCH .../control)
export interface ScheduleControlPayload {
  seatClass: string;
  newPrice?: number;
  availableSeats?: number;
}

export const seller_control_schedule_api = async (
  scheduleId: number,
  payload: ScheduleControlPayload
): Promise<{ success: boolean; message: string }> => {
  return userAxios.patch(`/api/v1/seller/schedules/${scheduleId}/control`, payload);
};
