/** ISO calendar helpers for workout logging and streak computation. */

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function isISODateString(value: string): boolean {
  return ISO_DATE_RE.test(value);
}

export function makeSetKey(date: string, day: string, exIdx: number, sIdx: number): string {
  return `${date}-${day}-${exIdx}-${sIdx}`;
}

export function prevDayISO(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function computeStreak(completedWorkouts: { date: string }[]): number {
  const uniqueDates = new Set(
    completedWorkouts.map((w) => w.date).filter(isISODateString)
  );
  if (uniqueDates.size === 0) return 0;

  const today = getTodayISO();
  const yesterday = prevDayISO(today);

  let anchor: string | null = null;
  if (uniqueDates.has(today)) anchor = today;
  else if (uniqueDates.has(yesterday)) anchor = yesterday;
  else return 0;

  let streak = 0;
  let cursor = anchor;
  while (uniqueDates.has(cursor)) {
    streak++;
    cursor = prevDayISO(cursor);
  }
  return streak;
}

export const CALENDAR_WINDOW_DAYS = 28;

export function getCalendarWindowStart(): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (CALENDAR_WINDOW_DAYS - 1));
  return start;
}

export function dateForCalendarIndex(idx: number): string {
  const start = getCalendarWindowStart();
  const d = new Date(start);
  d.setDate(start.getDate() + idx);
  return d.toISOString().split('T')[0];
}

export function dayNameForISO(iso: string): string {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return names[new Date(`${iso}T00:00:00`).getDay()];
}

export function countWorkoutsInLastDays(
  completedWorkouts: { date: string }[],
  days: number
): number {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return completedWorkouts.filter((w) => {
    if (!isISODateString(w.date)) return false;
    return new Date(`${w.date}T00:00:00`) >= cutoff;
  }).length;
}
