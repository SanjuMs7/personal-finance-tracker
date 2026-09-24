import type { Period } from '@/types';

const DAY_MS = 86_400_000;

/** Midday of the day containing `ts`. Midday rather than midnight so a DST shift
 *  can never tip a stored date into the neighbouring day. */
export function dayOf(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0).getTime();
}

/** Calendar arithmetic, not `ts + n * DAY_MS`: only this keeps the clock at
 *  midday across a DST boundary. */
export function addDays(ts: number, n: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12, 0, 0, 0).getTime();
}

/** Whole days from `a` to `b`, both normalized to midday first. */
export function daysBetween(a: number, b: number): number {
  return Math.round((dayOf(b) - dayOf(a)) / DAY_MS);
}

/** Inclusive: Sep 29 to Oct 29 is 31 days. */
export function periodLength(period: Period): number {
  return daysBetween(period.start, period.end) + 1;
}

export function isInPeriod(ts: number, period: Period): boolean {
  const day = dayOf(ts);
  return day >= dayOf(period.start) && day <= dayOf(period.end);
}

/** Both ends normalized to midday, and swapped if they arrive the wrong way round. */
export function makePeriod(start: number, end: number): Period {
  const a = dayOf(start);
  const b = dayOf(end);
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

/** The period `n` whole lengths away — earlier with a negative `n`. */
export function shiftPeriod(period: Period, n: number): Period {
  const step = periodLength(period) * n;
  return { start: addDays(period.start, step), end: addDays(period.end, step) };
}

/** The calendar month containing `ts` — what Pocket starts out on. */
export function monthPeriod(ts: number): Period {
  const d = new Date(ts);
  return {
    start: new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0, 0).getTime(),
    // Day 0 of the next month is the last day of this one.
    end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 12, 0, 0, 0).getTime(),
  };
}

/** How many whole periods `ts` sits away from `period`, negative when earlier.
 *  Used to stop the back arrow once there is nothing older left to see. */
export function periodsBetween(period: Period, ts: number): number {
  return Math.floor(daysBetween(period.start, ts) / periodLength(period));
}

export function hasEnded(period: Period, today: number): boolean {
  return dayOf(today) > dayOf(period.end);
}

/** Days of `period` that have actually happened by `today`. A finished period
 *  counts in full; one still running counts only up to today. Never zero, so it
 *  is always safe to divide an average by. */
export function daysElapsed(period: Period, today: number): number {
  const day = dayOf(today);
  if (day >= dayOf(period.end)) return periodLength(period);
  if (day <= dayOf(period.start)) return 1;
  return daysBetween(period.start, day) + 1;
}


/** A true monthly cycle anchored on the start day: the 30th runs to the 29th of
 *  the next month, never overlapping. The day is clamped so a 31st start still
 *  lands inside a short month. */
export function monthlyCycleFrom(start: number): Period {
  const d = new Date(start);
  const day = d.getDate();
  const daysInNext = new Date(d.getFullYear(), d.getMonth() + 2, 0).getDate();
  const nextSame = new Date(d.getFullYear(), d.getMonth() + 1, Math.min(day, daysInNext), 12, 0, 0, 0).getTime();
  return { start: dayOf(start), end: addDays(nextSame, -1) };
}
