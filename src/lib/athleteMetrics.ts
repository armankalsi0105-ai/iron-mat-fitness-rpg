import { CharacterProfile } from '../types';
import { getWeeklyProgress, getWeekDayNamesForDate } from './homeUtils';
import { computeProgramStreak, DayOfWeek } from '../schedule';

export const WRESTLING_PHASES = [
  'Off Season',
  'Pre Season',
  'In Season',
  'Tournament',
] as const;

export type WrestlingPhase = (typeof WRESTLING_PHASES)[number];

export function normalizeWrestlingPhase(phase?: string): WrestlingPhase {
  if (phase === 'Post Season') return 'Tournament';
  if (WRESTLING_PHASES.includes(phase as WrestlingPhase)) {
    return phase as WrestlingPhase;
  }
  return 'Off Season';
}

/** 0–100 readiness from wrestling metrics (matches App.tsx logic). */
export function computeReadinessScore(profile: CharacterProfile): number {
  const grip = profile.gripRating || 5;
  const conditioning = profile.conditioningRating || 5;
  const pullups = Math.min(10, (profile.pullupsRating || 0) / 3);
  const deadhangs = Math.min(10, (profile.deadhangsRating || 0) / 15);
  const farmercarries = Math.min(10, (profile.farmercarriesRating || 0) / 12);
  const sum =
    grip * 2.0 +
    conditioning * 2.5 +
    pullups * 2.0 +
    deadhangs * 1.5 +
    farmercarries * 2.0;
  return Math.min(100, Math.round(sum * 10));
}

/** Composite wrestling performance score (grip, pullups, conditioning, hangs, carries). */
export function computeWrestlingPerformanceScore(profile: CharacterProfile): number {
  const grip = ((profile.gripRating || 5) / 10) * 100;
  const conditioning = ((profile.conditioningRating || 5) / 10) * 100;
  const pullups = Math.min(100, ((profile.pullupsRating || 0) / 25) * 100);
  const deadhangs = Math.min(100, ((profile.deadhangsRating || 0) / 120) * 100);
  const farmers = Math.min(100, ((profile.farmercarriesRating || 0) / 90) * 100);
  return Math.round((grip + conditioning + pullups + deadhangs + farmers) / 5);
}

export function computeTrainingScore(
  profile: CharacterProfile,
  now: Date = new Date()
): number {
  const weekly = getWeeklyProgress(profile, now);
  const sessionPct =
    weekly.plannedCount > 0
      ? (weekly.completedCount / weekly.plannedCount) * 100
      : 0;

  const weekDayNames = new Set(getWeekDayNamesForDate(now));
  const setsThisWeek = Object.entries(profile.completedSets || {}).filter(
    ([key, done]) => done && weekDayNames.has(key.split('-')[0] as DayOfWeek)
  ).length;
  const setsPct = Math.min(100, setsThisWeek * 4);

  return Math.round(sessionPct * 0.65 + setsPct * 0.35);
}

export function computeConsistencyScore(profile: CharacterProfile, now: Date = new Date()): number {
  const streak = computeProgramStreak(profile.completedWorkouts, now);
  const streakPct = Math.min(100, streak * 12);
  const logs = profile.completedWorkouts?.length || 0;
  const logPct = Math.min(100, (logs / 28) * 100);
  return Math.round(streakPct * 0.55 + logPct * 0.45);
}

export function computeStrengthScore(profile: CharacterProfile): number {
  const bodyWt = profile.weight || 145;
  const bests = profile.personalBests || {};
  const lifts = ['Squat', 'Bench Press', 'Deadlift'] as const;
  const ratios = lifts.map((lift) => {
    const wt = bests[lift] || 0;
    if (!wt || !bodyWt) return 0;
    return Math.min(100, (wt / bodyWt) * 50);
  });
  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return Math.round(avg);
}

export function computeAthleticScore(profile: CharacterProfile): number {
  const attrs = profile.attributes;
  const total =
    (attrs.pull + attrs.push + attrs.legs + attrs.grip + attrs.cardio) / 5;
  return Math.min(100, Math.round(total * 8));
}

export interface DashboardScores {
  recovery: number;
  training: number;
  consistency: number;
  strength: number;
  athletic: number;
  wrestling: number;
}

export function getDashboardScores(profile: CharacterProfile, now: Date = new Date()): DashboardScores {
  return {
    recovery: computeReadinessScore(profile),
    training: computeTrainingScore(profile, now),
    consistency: computeConsistencyScore(profile, now),
    strength: computeStrengthScore(profile),
    athletic: computeAthleticScore(profile),
    wrestling: computeWrestlingPerformanceScore(profile),
  };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#34d399';
  if (score >= 55) return '#fbbf24';
  return '#fb7185';
}

export function getWeeklyTrainingScore(profile: CharacterProfile): number {
  return computeTrainingScore(profile);
}

export function getStrengthTrendData(profile: CharacterProfile) {
  const bests = profile.personalBests || {};
  return ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press'].map((name) => ({
    name: name.replace(' Press', '').replace('Barbell ', ''),
    value: bests[name] || 0,
  }));
}

export function getBodyWeightTrend(profile: CharacterProfile) {
  const logs = profile.bodyWeightLogs || [];
  if (logs.length === 0) {
    return [{ date: 'Now', weight: profile.weight || 145 }];
  }
  return logs.map((l) => ({
    date: l.date.split('-').slice(1).join('/'),
    weight: l.weight,
  }));
}

export function getMonthlyGrowth(profile: CharacterProfile) {
  const logs = profile.bodyWeightLogs || [];
  if (logs.length < 2) return 0;
  const first = logs[0].weight;
  const last = logs[logs.length - 1].weight;
  return Math.round((last - first) * 10) / 10;
}

export interface AchievementTimelineEntry {
  id: string;
  name: string;
  date: string;
  unlocked: boolean;
}

export function getAchievementTimeline(
  profile: CharacterProfile,
  achievements: { id: string; name: string }[]
): AchievementTimelineEntry[] {
  const unlocked = new Set(profile.achievements || []);
  return achievements.map((ach) => ({
    id: ach.id,
    name: ach.name,
    date: unlocked.has(ach.id) ? 'Unlocked' : '—',
    unlocked: unlocked.has(ach.id),
  }));
}
