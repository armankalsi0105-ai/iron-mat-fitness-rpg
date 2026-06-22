import { CharacterProfile } from '../types';
import { ACHIEVEMENTS } from '../data';
import { WORKOUTS } from '../data';
import {
  DAYS_OF_WEEK,
  DayOfWeek,
  computeProgramStreak,
  getCompletedDateKeys,
  getDayNameForDate,
  getProgramStartDate,
  hasProgramStarted,
  startOfDay,
  toDateKey,
} from '../schedule';

export function getTimeAwareGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDisplayName(name: string): string {
  if (!name) return 'Athlete';
  const lower = name.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export type DayStatus = 'completed' | 'today' | 'planned' | 'rest' | 'upcoming' | 'preview';

export interface WeekDayProgress {
  label: string;
  shortLabel: string;
  dateKey: string;
  status: DayStatus;
  workoutTag?: string;
}

export interface WeeklyProgressData {
  days: WeekDayProgress[];
  completedCount: number;
  plannedCount: number;
  weekLabel: string;
}

function getWeekStart(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

export function getWeekDayNamesForDate(now: Date = new Date()): DayOfWeek[] {
  const weekStart = getWeekStart(now);
  return DAYS_OF_WEEK.map((_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return getDayNameForDate(date);
  });
}

export function getWeeklyProgress(
  profile: CharacterProfile,
  now: Date = new Date()
): WeeklyProgressData {
  const weekStart = getWeekStart(now);
  const programStart = getProgramStartDate();
  const programStarted = hasProgramStarted(now);
  const completedDates = getCompletedDateKeys(profile.completedWorkouts);
  const todayKey = toDateKey(startOfDay(now));

  const days: WeekDayProgress[] = DAYS_OF_WEEK.map((dayName, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateKey = toDateKey(date);
    const workout = WORKOUTS[dayName];
    const isRest = workout?.tag === 'REST';
    const isBeforeProgram = date.getTime() < programStart.getTime();
    const isToday = dateKey === todayKey;

    let status: DayStatus;

    if (!programStarted && isBeforeProgram) {
      status = 'preview';
    } else if (completedDates.has(dateKey)) {
      status = 'completed';
    } else if (isRest) {
      status = 'rest';
    } else if (isToday) {
      status = 'today';
    } else if (date.getTime() < startOfDay(now).getTime()) {
      status = 'planned';
    } else {
      status = 'upcoming';
    }

    return {
      label: dayName.slice(0, 3),
      shortLabel: dayName.charAt(0),
      dateKey,
      status,
      workoutTag: workout?.tag,
    };
  });

  const trainingDays = days.filter(d => d.workoutTag !== 'REST' && d.status !== 'preview');
  const completedCount = days.filter(d => d.status === 'completed').length;
  const plannedCount = trainingDays.length;

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekLabel = `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  return { days, completedCount, plannedCount, weekLabel };
}

export interface NextAchievement {
  achievement: (typeof ACHIEVEMENTS)[number];
  current: number;
  target: number;
  progress: number;
}

export function getNextAchievement(profile: CharacterProfile): NextAchievement | null {
  const unlocked = new Set(profile.achievements || []);

  for (const ach of ACHIEVEMENTS) {
    if (unlocked.has(ach.id)) continue;

    let current = 0;
    switch (ach.milestoneType) {
      case 'reps':
        current = profile.totalReps || 0;
        break;
      case 'streak':
        current = computeProgramStreak(profile.completedWorkouts);
        break;
      case 'level':
        current = profile.level;
        break;
      case 'warmups':
        current = profile.warmupsCompleted || 0;
        break;
      case 'weight': {
        const pbMax = Math.max(0, ...Object.values(profile.personalBests || {}));
        const loggedMax = Math.max(
          0,
          ...Object.values(profile.savedWeights || {}).map(w => parseFloat(w) || 0)
        );
        current = Math.max(pbMax, loggedMax);
        break;
      }
    }

    return {
      achievement: ach,
      current,
      target: ach.targetValue,
      progress: Math.min(100, Math.round((current / ach.targetValue) * 100)),
    };
  }

  return null;
}

export function getReadinessFeedback(score: number): {
  label: string;
  color: string;
  stroke: string;
  description: string;
} {
  if (score >= 80) {
    return {
      label: 'Optimal',
      color: 'text-emerald-400',
      stroke: '#34d399',
      description: 'Neural drive is high. Attack today\'s session with intent.',
    };
  }
  if (score >= 55) {
    return {
      label: 'Moderate',
      color: 'text-amber-400',
      stroke: '#fbbf24',
      description: 'Solid capacity. Prioritize warm-up and controlled loading.',
    };
  }
  return {
    label: 'Recovery',
    color: 'text-rose-400',
    stroke: '#fb7185',
    description: 'CNS needs care. Light work, mobility, and sleep tonight.',
  };
}

export function getRitualRecoveryBoost(profile: CharacterProfile): number {
  const rituals = profile.dailyRituals || {};
  const total = 4;
  const done = Object.values(rituals).filter(Boolean).length;
  return Math.round((done / total) * 12);
}
