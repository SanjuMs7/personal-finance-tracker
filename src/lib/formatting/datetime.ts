// Looked up rather than asked of Intl: toLocaleDateString is slow enough in
// Hermes that the calendar sheet stuttered formatting its 42 cells on every
// month change. These are the exact strings 'en-IN' returns for the month.
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatFriendlyTime(timestamp: number): string {
  const d = new Date(timestamp);
  let h = d.getHours() % 12;
  if (h === 0) h = 12;
  const m = d.getMinutes().toString().padStart(2, '0');
  const ap = d.getHours() >= 12 ? 'PM' : 'AM';
  return `${h}:${m} ${ap}`;
}

export function isToday(timestamp: number): boolean {
  const d = new Date(timestamp);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function formatFriendlyDate(timestamp: number): string {
  if (isToday(timestamp)) return 'Today';
  const d = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.getFullYear() === yesterday.getFullYear() && d.getMonth() === yesterday.getMonth() && d.getDate() === yesterday.getDate()) {
    return 'Yesterday';
  }
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

/** 'Today' / 'Yesterday' / '14 · Sep'. Takes `now` so it stays pure. */
export function formatDateGroupLabel(timestamp: number, now: number): string {
  const d = new Date(timestamp);
  const ref = new Date(now);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(d, ref)) return 'Today';

  const yesterday = new Date(ref);
  yesterday.setDate(ref.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Yesterday';

  return `${d.getDate().toString().padStart(2, '0')} · ${MONTHS_SHORT[d.getMonth()]}`;
}

/** 'Sep 2026' — compact enough to sit in a screen header. */
export function formatMonthYearLabel(timestamp: number): string {
  const d = new Date(timestamp);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** 'September 2026' — the calendar's own heading. */
export function formatMonthTitle(timestamp: number): string {
  const d = new Date(timestamp);
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** 'Sep 29'. */
export function formatDayLabel(timestamp: number): string {
  const d = new Date(timestamp);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/** 'Sep 29, 2026'. */
export function formatFullDayLabel(timestamp: number): string {
  return `${formatDayLabel(timestamp)}, ${new Date(timestamp).getFullYear()}`;
}

/** 'Sep 29 – Oct 29', carrying the years only when the range crosses one. */
export function formatRangeLabel(start: number, end: number): string {
  const sameYear = new Date(start).getFullYear() === new Date(end).getFullYear();
  return sameYear
    ? `${formatDayLabel(start)} \u2013 ${formatDayLabel(end)}`
    : `${formatFullDayLabel(start)} \u2013 ${formatFullDayLabel(end)}`;
}

/** 'pocket-2026-09-29-to-2026-10-29' — a filename stem that sorts by date. */
export function formatRangeStamp(start: number, end: number): string {
  const iso = (ts: number) => {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  return `${iso(start)}-to-${iso(end)}`;
}
