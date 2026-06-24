import { AthleteProfile, WorkoutDay } from '../types';
import { getTodayISO, makeSetKey } from '../utils/workoutDates';

export interface WorkoutSession {
  date: string;
  day: string;
  exerciseIdx: number;
  setIdx: number;
  savedReps: Record<string, string>;
  startedAt: string;
  restTimer?: {
    remaining: number;
    max: number;
    running: boolean;
  };
}

export function getWorkoutSession(profile: AthleteProfile): WorkoutSession | null {
  return profile.workoutSession ?? null;
}

export function hasResumableSession(
  profile: AthleteProfile,
  workout: WorkoutDay,
  day: string
): boolean {
  const session = getWorkoutSession(profile);
  if (!session) return false;
  const today = getTodayISO();
  if (session.date !== today || session.day !== day) return false;

  const prefix = `${today}-${day}`;
  const totalSets = workout.exercises.reduce((s, e) => s + e.sets, 0);
  const doneSets = Object.keys(profile.completedSets).filter((k) => k.startsWith(prefix)).length;
  return doneSets > 0 && doneSets < totalSets;
}

export function sessionProgress(
  profile: AthleteProfile,
  workout: WorkoutDay,
  day: string
): { done: number; total: number; pct: number } {
  const today = getTodayISO();
  const prefix = `${today}-${day}`;
  const total = workout.exercises.reduce((s, e) => s + e.sets, 0);
  const done = Object.keys(profile.completedSets).filter((k) => k.startsWith(prefix)).length;
  return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
}

export function findCurrentIndices(
  profile: AthleteProfile,
  workout: WorkoutDay,
  day: string
): { exerciseIdx: number; setIdx: number } {
  const today = getTodayISO();
  for (let i = 0; i < workout.exercises.length; i++) {
    const ex = workout.exercises[i];
    for (let s = 0; s < ex.sets; s++) {
      if (!profile.completedSets[makeSetKey(today, day, i, s)]) {
        return { exerciseIdx: i, setIdx: s };
      }
    }
  }
  return { exerciseIdx: -1, setIdx: 0 };
}

export function saveWorkoutSession(
  profile: AthleteProfile,
  partial: Partial<WorkoutSession> & Pick<WorkoutSession, 'day'>
): AthleteProfile {
  const today = getTodayISO();
  const existing = profile.workoutSession;
  const session: WorkoutSession = {
    date: today,
    day: partial.day,
    exerciseIdx: partial.exerciseIdx ?? existing?.exerciseIdx ?? 0,
    setIdx: partial.setIdx ?? existing?.setIdx ?? 0,
    savedReps: partial.savedReps ?? existing?.savedReps ?? {},
    startedAt: partial.startedAt ?? existing?.startedAt ?? new Date().toISOString(),
    restTimer: 'restTimer' in partial ? partial.restTimer : existing?.restTimer,
  };
  return { ...profile, workoutSession: session };
}

export function clearWorkoutSession(profile: AthleteProfile): AthleteProfile {
  if (!profile.workoutSession) return profile;
  const { workoutSession: _, ...rest } = profile;
  return rest as AthleteProfile;
}

export function computeSessionDurationMs(session: WorkoutSession | null): number {
  if (!session?.startedAt) return 0;
  return Math.max(0, Date.now() - new Date(session.startedAt).getTime());
}

export function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  }
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}
