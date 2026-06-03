// Shared calendar utilities for booking modals

export interface CalendarCell {
  day: number;
  dateStr: string; // YYYY-MM-DD
  price: number;
  disabled: boolean;
  isWeekend: boolean;
  isEmpty: boolean; // padding cell before month starts
  stock?: number;
}

/**
 * Build a 7-column grid of calendar cells for a given month.
 * Empty padding cells are inserted to align the first day correctly (Sunday = col 0).
 */
export function buildCalendarMonth(
  year: number,
  month: number, // 0-indexed (Jan=0)
  basePrice: number,
  options: {
    weekendSurchargeRate?: number; // e.g. 0.2 → +20%
    disabledDays?: Set<number>;   // day-of-month numbers to mark sold-out
    disableBeforeToday?: boolean;
  } = {}
): CalendarCell[] {
  const {
    weekendSurchargeRate = 0.2,
    disabledDays = new Set<number>(),
    disableBeforeToday = true,
  } = options;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay(); // 0=Sun … 6=Sat

  const cells: CalendarCell[] = [];

  // Leading empty padding cells
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: 0, dateStr: '', price: 0, disabled: true, isWeekend: false, isEmpty: true });
  }

  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, month, d);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isPast = disableBeforeToday && date < today;
    const isSoldOut = disabledDays.has(d);

    const price = isWeekend
      ? Math.round((basePrice * (1 + weekendSurchargeRate)) / 1000) * 1000
      : basePrice;

    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;

    cells.push({
      day: d,
      dateStr,
      price,
      disabled: isPast || isSoldOut,
      isWeekend,
      isEmpty: false,
    });
  }

  return cells;
}

/** Format YYYY-MM-DD → M월 D일 (e.g. "10월 24일") */
export function formatKorDate(dateStr: string): string {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}월 ${parseInt(d)}일`;
}

/** How many nights between two YYYY-MM-DD strings (end - start) */
export function countNights(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(0, Math.round((e - s) / (1000 * 60 * 60 * 24)));
}

/** YYYY-MM-DD string for a Date (local timezone) */
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Today's date as YYYY-MM-DD (local timezone) */
export function todayStr(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return toDateStr(d);
}

/** Add days to a date string or Date and return YYYY-MM-DD (local timezone) */
export function addDaysStr(base: Date | string, days: number): string {
  const d = typeof base === 'string' ? new Date(base) : new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

/** Parse YYYY-MM-DD as local midnight Date */
export function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Whether a date is in the past or blocked (sold-out / unavailable day-of-month) */
export function isDateBlocked(dateStr: string, disabledDays: number[] | Set<number>): boolean {
  if (!dateStr) return true;
  const blocked = disabledDays instanceof Set ? disabledDays : new Set(disabledDays);
  const date = parseDateLocal(dateStr);
  const today = parseDateLocal(todayStr());
  if (date < today) return true;
  return blocked.has(date.getDate());
}

/** Stay/Car: every occupied day in [checkIn, checkOut) must be available */
export function isStayRangeAvailable(
  checkIn: string,
  checkOut: string,
  disabledDays: number[],
): boolean {
  if (!checkIn || !checkOut || checkOut <= checkIn) return false;
  const blocked = new Set(disabledDays);
  const cur = parseDateLocal(checkIn);
  const end = parseDateLocal(checkOut);
  while (cur < end) {
    if (isDateBlocked(toDateStr(cur), blocked)) return false;
    cur.setDate(cur.getDate() + 1);
  }
  return true;
}

/** Flight: departure (+ return for RT) and any days strictly between must be available */
export function isFlightTripAvailable(
  depart: string,
  returnDate: string,
  unavailableDays: number[],
  tripType: 'RT' | 'OW',
): boolean {
  if (!depart || isDateBlocked(depart, unavailableDays)) return false;
  if (tripType === 'OW') return true;
  if (!returnDate || returnDate <= depart) return false;
  if (isDateBlocked(returnDate, unavailableDays)) return false;

  const blocked = new Set(unavailableDays);
  const cur = parseDateLocal(depart);
  cur.setDate(cur.getDate() + 1);
  const end = parseDateLocal(returnDate);
  while (cur < end) {
    if (blocked.has(cur.getDate())) return false;
    cur.setDate(cur.getDate() + 1);
  }
  return true;
}

/** Find nearest valid stay/car range matching preferred night count */
export function resolveValidStayRange(
  preferredCheckIn: string,
  preferredCheckOut: string,
  disabledDays: number[],
  maxSearchDays = 90,
): { checkIn: string; checkOut: string } {
  const nights = Math.max(1, countNights(preferredCheckIn, preferredCheckOut));
  const today = todayStr();
  const baseStart = preferredCheckIn >= today ? preferredCheckIn : today;

  for (let offset = 0; offset < maxSearchDays; offset++) {
    const checkIn = addDaysStr(baseStart, offset);
    const checkOut = addDaysStr(checkIn, nights);
    if (isStayRangeAvailable(checkIn, checkOut, disabledDays)) {
      return { checkIn, checkOut };
    }
  }

  for (let offset = 0; offset < maxSearchDays; offset++) {
    const checkIn = addDaysStr(today, offset);
    const checkOut = addDaysStr(checkIn, 1);
    if (isStayRangeAvailable(checkIn, checkOut, disabledDays)) {
      return { checkIn, checkOut };
    }
  }

  return { checkIn: today, checkOut: addDaysStr(today, 1) };
}

/** Find nearest valid flight dates matching preferred trip length */
export function resolveValidFlightDates(
  preferredDepart: string,
  preferredReturn: string,
  unavailableDays: number[],
  tripType: 'RT' | 'OW',
  maxSearchDays = 90,
): { depart: string; return: string } {
  const today = todayStr();
  const baseDepart = preferredDepart >= today ? preferredDepart : today;

  if (tripType === 'OW') {
    for (let offset = 0; offset < maxSearchDays; offset++) {
      const depart = addDaysStr(baseDepart, offset);
      if (!isDateBlocked(depart, unavailableDays)) return { depart, return: '' };
    }
    return { depart: today, return: '' };
  }

  const nights = Math.max(1, countNights(preferredDepart, preferredReturn));
  for (let offset = 0; offset < maxSearchDays; offset++) {
    const depart = addDaysStr(baseDepart, offset);
    const ret = addDaysStr(depart, nights);
    if (isFlightTripAvailable(depart, ret, unavailableDays, 'RT')) {
      return { depart, return: ret };
    }
  }

  for (let offset = 0; offset < maxSearchDays; offset++) {
    const depart = addDaysStr(today, offset);
    for (let n = 1; n <= 7; n++) {
      const ret = addDaysStr(depart, n);
      if (isFlightTripAvailable(depart, ret, unavailableDays, 'RT')) {
        return { depart, return: ret };
      }
    }
  }

  return { depart: today, return: addDaysStr(today, 3) };
}

/** Korean month name header, e.g. "2026년 10월" */
export function monthLabel(year: number, month: number): string {
  return `${year}년 ${month + 1}월`;
}
