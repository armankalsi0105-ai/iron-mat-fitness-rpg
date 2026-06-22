import { Exercise } from '../types';

/** Avoid "3 × 3 × 8" when spec already includes set count (e.g. "3 × 8"). */
export function formatExerciseSpec(exercise: Exercise): string {
  const spec = exercise.spec.trim();
  if (/^\d+\s*[×x*]/i.test(spec)) {
    return spec;
  }
  return `${exercise.sets} × ${spec}`;
}

export function getCategoryStyle(category: Exercise['category']): string {
  const map: Record<Exercise['category'], string> = {
    pull: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    push: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    legs: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    grip: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    cardio: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  };
  return map[category] || map.cardio;
}

export function getCategoryLabel(category: Exercise['category']): string {
  return category.toUpperCase();
}
