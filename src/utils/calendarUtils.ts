// Shared calendar utilities for booking modals

export interface CalendarCell {
  day: number;
  dateStr: string; // YYYY-MM-DD
  price: number;
  disabled: boolean;
  isWeekend: boolean;
  isEmpty: boolean; // padding cell before month starts
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

/** YYYY-MM-DD string for a Date */
export function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Korean month name header, e.g. "2026년 10월" */
export function monthLabel(year: number, month: number): string {
  return `${year}년 ${month + 1}월`;
}
