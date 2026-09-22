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

  return `${d.getDate().toString().padStart(2, '0')} · ${d.toLocaleDateString('en-IN', { month: 'short' })}`;
}
