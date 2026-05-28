import { create } from 'zustand';

export interface FlightSearchQuery {
  tripType: string;
  departures: string;
  arrivals: string;
  dates: string;
  seatClass: string;
  passengerCount: number;
}

export interface AvailableSeat {
  classType: string;
  remainingSeats: number;
  basePrice: number;
}

export interface FlightDto {
  scheduleId: number;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  availableSeats: AvailableSeat[];
}

export interface JourneyDto {
  journeyIndex: number;
  description: string;
  flights: FlightDto[];
}

export interface FlightSearchResponse {
  tripType: string;
  passengerCount: number;
  journeys: JourneyDto[];
}

export interface HeldBooking {
  bookingId: number;
  bookingCode: string;
  scheduleId: number;
  flightNumber: string;
  seatClass: string;
  totalPrice: number;
  status: string;
  reservedUntil: string;
}

interface FlightState {
  search_query: FlightSearchQuery;
  flight_search_results: FlightSearchResponse | null;
  held_booking: HeldBooking | null;
  booking_hold_time: number; // 남은 시간 (초)
  hold_timer_active: boolean;
  
  set_search_query: (query: Partial<FlightSearchQuery>) => void;
  set_search_results: (results: FlightSearchResponse | null) => void;
  set_held_booking: (booking: HeldBooking | null) => void;
  start_hold_timer: (reservedUntilStr: string, onExpire: () => void) => void;
  stop_hold_timer: () => void;
  tick_hold_timer: (onExpire: () => void) => void;
}

let timerInterval: any = null;

export const useFlightStore = create<FlightState>((set, get) => ({
  search_query: {
    tripType: 'RT',
    departures: 'ICN',
    arrivals: 'NRT',
    dates: `${new Date().toISOString().split('T')[0]},${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
    seatClass: 'ALL',
    passengerCount: 1
  },
  flight_search_results: null,
  held_booking: null,
  booking_hold_time: 0,
  hold_timer_active: false,

  set_search_query: (query) => set((state) => ({
    search_query: { ...state.search_query, ...query }
  })),

  set_search_results: (results) => set({ flight_search_results: results }),

  set_held_booking: (booking) => {
    set({ held_booking: booking });
    if (!booking) {
      get().stop_hold_timer();
    }
  },

  start_hold_timer: (reservedUntilStr, onExpire) => {
    get().stop_hold_timer();

    const calculateRemainingSeconds = () => {
      const expiry = new Date(reservedUntilStr).getTime();
      const now = new Date().getTime();
      return Math.max(0, Math.floor((expiry - now) / 1000));
    };

    const remaining = calculateRemainingSeconds();
    set({ booking_hold_time: remaining, hold_timer_active: true });

    if (remaining <= 0) {
      set({ held_booking: null, hold_timer_active: false });
      onExpire();
      return;
    }

    timerInterval = setInterval(() => {
      get().tick_hold_timer(onExpire);
    }, 1000);
  },

  stop_hold_timer: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    set({ booking_hold_time: 0, hold_timer_active: false });
  },

  tick_hold_timer: (onExpire) => {
    const currentRemaining = get().booking_hold_time;
    if (currentRemaining <= 1) {
      get().stop_hold_timer();
      set({ held_booking: null });
      onExpire();
    } else {
      set({ booking_hold_time: currentRemaining - 1 });
    }
  }
}));
