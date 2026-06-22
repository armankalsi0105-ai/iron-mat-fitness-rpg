export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return startOfDay(new Date(y, m - 1, d));
}

const PROGRAM_START_KEY = "iron_mat_program_start_v1";

function createInitialProgramStartDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return startOfDay(tomorrow);
}

/** Program day 1 is pinned on first load (tomorrow at that moment), then stays fixed. */
export function getProgramStartDate(): Date {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(PROGRAM_START_KEY);
    if (stored) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(stored)) {
        return parseDateKey(stored);
      }
      const parsed = new Date(stored);
      if (!Number.isNaN(parsed.getTime())) {
        const normalized = toDateKey(startOfDay(parsed));
        localStorage.setItem(PROGRAM_START_KEY, normalized);
        return parseDateKey(normalized);
      }
    }

    const initial = createInitialProgramStartDate();
    localStorage.setItem(PROGRAM_START_KEY, toDateKey(initial));
    return initial;
  }

  return createInitialProgramStartDate();
}

export function hasProgramStarted(now: Date = new Date()): boolean {
  return startOfDay(now).getTime() >= getProgramStartDate().getTime();
}

export function getDaysUntilProgramStart(now: Date = new Date()): number {
  const diffMs = getProgramStartDate().getTime() - startOfDay(now).getTime();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

export function getDayNameForDate(date: Date): DayOfWeek {
  return DAYS_OF_WEEK[date.getDay()];
}

/** Default workout tab: today once the program has started, otherwise day 1. */
export function getDefaultWorkoutDayName(now: Date = new Date()): DayOfWeek {
  if (hasProgramStarted(now)) {
    return getDayNameForDate(now);
  }
  return getDayNameForDate(getProgramStartDate());
}

export function getProgramDayIndexForDate(date: Date): number {
  const diffMs = startOfDay(date).getTime() - getProgramStartDate().getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

export function getDateForProgramDay(dayIndex: number): Date {
  const start = getProgramStartDate();
  const date = new Date(start);
  date.setDate(date.getDate() + dayIndex);
  return date;
}

export function getDateKeyForProgramDay(dayIndex: number): string {
  return toDateKey(getDateForProgramDay(dayIndex));
}

export function getDayNameForProgramDay(dayIndex: number): DayOfWeek {
  return getDayNameForDate(getDateForProgramDay(dayIndex));
}

export function formatProgramDayLabel(dayIndex: number): string {
  return getDateForProgramDay(dayIndex).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function canLogProgramDay(dayIndex: number, now: Date = new Date()): boolean {
  const dayDate = startOfDay(getDateForProgramDay(dayIndex));
  const today = startOfDay(now);
  const programStart = getProgramStartDate();
  return (
    dayDate.getTime() <= today.getTime() &&
    dayDate.getTime() >= programStart.getTime()
  );
}

export function getCompletedDateKeys(
  completedWorkouts: { date: string }[] = []
): Set<string> {
  const keys = new Set<string>();

  for (const entry of completedWorkouts) {
    const dayMatch = /^day-(\d+)$/.exec(entry.date);
    if (dayMatch) {
      keys.add(getDateKeyForProgramDay(Number(dayMatch[1])));
    } else {
      keys.add(entry.date);
    }
  }

  return keys;
}

/** Consecutive logged program days ending at today (or yesterday if today is open). */
export function computeProgramStreak(
  completedWorkouts: { date: string }[] = [],
  now: Date = new Date()
): number {
  if (!hasProgramStarted(now)) return 0;

  const completed = getCompletedDateKeys(completedWorkouts);
  const todayIndex = getProgramDayIndexForDate(now);
  if (todayIndex < 0) return 0;

  let startIndex = todayIndex;
  const todayKey = toDateKey(startOfDay(now));
  if (!completed.has(todayKey)) {
    startIndex = todayIndex - 1;
  }

  let streak = 0;
  for (let i = startIndex; i >= 0; i--) {
    if (completed.has(getDateKeyForProgramDay(i))) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
