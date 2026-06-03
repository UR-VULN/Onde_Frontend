import { userAxios } from '@/api/axiosInstance';
import type { FlightSearchResponse } from '@/store/useFlightStore';
import { unwrapApi } from '@/utils/apiResponse';

/** 백엔드 SeatInventoryDto.price → UI basePrice */
function normalizeFlightSearchResponse(data: FlightSearchResponse): FlightSearchResponse {
  const raw = data as FlightSearchResponse & {
    schedules?: Array<{
      scheduleId: number;
      flightNumber: string;
      origin?: string;
      destination?: string;
      departureAirport?: string;
      arrivalAirport?: string;
      departureTime: string;
      arrivalTime: string;
      durationMinutes: number;
      seatClass?: string;
      remainingSeats?: number;
      basePrice?: number;
      price?: number;
    }>;
    totalCount?: number;
  };

  const sourceJourneys = raw.journeys?.length
    ? raw.journeys
    : [{
        journeyIndex: 0,
        description: '검색 결과',
        flights: Object.values(
          (raw.schedules ?? []).reduce<Record<number, FlightSearchResponse['journeys'][number]['flights'][number]>>(
            (acc, schedule) => {
              const existing = acc[schedule.scheduleId];
              const seat = {
                classType: schedule.seatClass ?? 'ECONOMY',
                remainingSeats: Number(schedule.remainingSeats ?? 0),
                basePrice: Number(schedule.basePrice ?? schedule.price ?? 0),
              };
              if (existing) {
                existing.availableSeats.push(seat);
                return acc;
              }
              acc[schedule.scheduleId] = {
                scheduleId: schedule.scheduleId,
                flightNumber: schedule.flightNumber,
                departureAirport: schedule.departureAirport ?? schedule.origin ?? '',
                arrivalAirport: schedule.arrivalAirport ?? schedule.destination ?? '',
                departureTime: schedule.departureTime,
                arrivalTime: schedule.arrivalTime,
                durationMinutes: schedule.durationMinutes,
                availableSeats: [seat],
              };
              return acc;
            },
            {}
          )
        ),
      }];

  return {
    ...data,
    tripType: data.tripType ?? 'ONE_WAY',
    passengerCount: data.passengerCount ?? 1,
    journeys: sourceJourneys.map((journey) => ({
      ...journey,
      flights: (journey.flights ?? []).map((flight) => ({
        ...flight,
        availableSeats: (flight.availableSeats ?? []).map((seat) => {
          const raw = seat as { basePrice?: number; price?: number };
          return {
            classType: seat.classType,
            remainingSeats: seat.remainingSeats,
            basePrice: Number(raw.basePrice ?? raw.price ?? 0),
          };
        }),
      })),
    })),
  };
}

export const search_flights_api = async (
  params: Record<string, string | number>
): Promise<{ success: boolean; data: FlightSearchResponse; message: string }> => {
  const raw = await userAxios.get('/api/v1/flights/search', { params });
  const res = unwrapApi<FlightSearchResponse>(raw);
  return {
    success: res.success,
    message: res.message,
    data: normalizeFlightSearchResponse(res.data),
  };
};

/** 백엔드 FlightBookingRequest — 탑승객 1명 */
export interface FlightBookingPayload {
  scheduleId: number;
  seatClass: string;
  passengerName: string;
  passengerPassport: string;
  passengerBirthdate: string;
  totalPrice: number;
}

export interface FlightBookingResult {
  bookingCode: string;
  passengerName: string;
  seatClass: string;
  totalPrice: number;
  status: string;
}

export const book_flight_reservation_api = async (
  payload: FlightBookingPayload
): Promise<{ success: boolean; data: FlightBookingResult; message: string }> => {
  const raw = await userAxios.post('/api/v1/reservations/flights', payload);
  return unwrapApi<FlightBookingResult>(raw);
};

export const confirm_flight_payment_api = async (
  bookingCode: string,
  pgTransactionId: string,
  paymentAmount: number
): Promise<{ success: boolean; data: Record<string, unknown>; message: string }> => {
  const raw = await userAxios.post(`/api/v1/reservations/flights/${bookingCode}/confirm`, {
    pgTransactionId,
    paymentAmount: String(paymentAmount),
  });
  return unwrapApi<Record<string, unknown>>(raw);
};

export interface FlightBatchRegisterPayload {
  departureAirport: string;
  arrivalAirport: string;
  distanceKm: number;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  startDate: string;
  endDate: string;
  operatingDays: string;
  firstSeats: number;
  firstPrice: number;
  businessSeats: number;
  businessPrice: number;
  economySeats: number;
  economyPrice: number;
}

const mapDaysToIntegers = (daysStr: string): number[] => {
  const dayMap: Record<string, number> = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 7 };
  return daysStr.split(',').map((d) => dayMap[d.trim()]).filter(Boolean);
};

export const seller_register_flights_batch_api = async (
  payload: FlightBatchRegisterPayload
): Promise<{ success: boolean; message: string }> => {
  const formattedTime =
    payload.departureTime.includes(':') && payload.departureTime.split(':').length === 2
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
      { classType: 'ECONOMY', totalSeats: payload.economySeats, basePrice: payload.economyPrice },
    ],
  };

  const raw = await userAxios.post('/api/v1/seller/flights', backendBody);
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};

/** 백엔드: year, month(Integer)만 사용 */
export interface CalendarParams {
  year: number;
  month: number;
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

export const seller_get_calendar_schedules_api = async (
  params: CalendarParams
): Promise<{ success: boolean; data: SellerCalendarCellDto[]; message: string }> => {
  const raw = await userAxios.get('/api/v1/seller/flights/calendar', {
    params: { year: params.year, month: params.month },
  });
  return unwrapApi<SellerCalendarCellDto[]>(raw);
};

/** 백엔드 SellerScheduleControlRequest */
export interface ScheduleControlPayload {
  controlType: 'PRICE_OVERRIDE' | 'INVENTORY_CLOSE';
  classType: string;
  remainingSeats?: number;
  overridePrice?: number;
}

export const seller_control_schedule_api = async (
  scheduleId: number,
  payload: ScheduleControlPayload
): Promise<{ success: boolean; message: string }> => {
  const body: Record<string, unknown> = {
    controlType: payload.controlType,
    classType: payload.classType,
  };
  if (payload.remainingSeats != null) body.remainingSeats = payload.remainingSeats;
  if (payload.overridePrice != null) body.overridePrice = payload.overridePrice;

  const raw = await userAxios.patch(`/api/v1/seller/schedules/${scheduleId}/control`, body);
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};
