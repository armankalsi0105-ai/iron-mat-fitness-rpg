import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Exercise } from '../../types';
import PremiumCard from './PremiumCard';
import Button from './Button';
import ProgressRing from './ProgressRing';
import ExerciseVisualizer from '../ExerciseVisualizer';
import {
  formatExerciseSpec,
  getCategoryLabel,
  getCategoryStyle,
} from '../../lib/exerciseUtils';

interface ExerciseCardProps {
  exercise: Exercise;
  setsDone: number;
  savedWeight: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onWeightChange: (value: string) => void;
  onSetToggle: (setIdx: number) => void;
  onOpenCues: () => void;
  isSetDone: (setIdx: number) => boolean;
}

export default function ExerciseCard({
  exercise,
  setsDone,
  savedWeight,
  isExpanded,
  onToggleExpand,
  onWeightChange,
  onSetToggle,
  onOpenCues,
  isSetDone,
}: ExerciseCardProps) {
  const specLabel = formatExerciseSpec(exercise);
  const progressPct =
    exercise.sets > 0 ? Math.round((setsDone / exercise.sets) * 100) : 0;
  const isComplete = setsDone >= exercise.sets;
  const categoryStyle = getCategoryStyle(exercise.category);

  return (
    <PremiumCard
      variant="elevated"
      padding="md"
      animate={false}
      className={isComplete ? 'border-emerald-500/20' : undefined}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <ProgressRing
          value={progressPct}
          size={44}
          strokeWidth={4}
          color={isComplete ? '#34d399' : '#f59e0b'}
          trackColor="rgba(255,255,255,0.06)"
          className="shrink-0"
        >
          {isComplete ? (
            <Check size={16} className="text-emerald-400" strokeWidth={3} />
          ) : (
            <span className="text-[10px] font-bold text-white tabular-nums">
              {setsDone}/{exercise.sets}
            </span>
          )}
        </ProgressRing>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${categoryStyle}`}
            >
              {getCategoryLabel(exercise.category)}
            </span>
          </div>
          <h3 className="text-card-title font-bold text-white leading-tight truncate">
            {exercise.name}
          </h3>
          <p className="text-body text-zinc-400 mt-0.5 tabular-nums">{specLabel}</p>
        </div>

        <button
          type="button"
          onClick={onToggleExpand}
          className="touch-target shrink-0 p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.05] cursor-pointer"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Hide exercise details' : 'Show exercise details'}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Thin progress bar */}
      <div className="h-1 bg-black/40 rounded-full overflow-hidden mt-3">
        <motion.div
          className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`}
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Inline preview — always visible, compact */}
      <div className="mt-3">
        <ExerciseVisualizer
          exerciseName={exercise.name}
          targetSpecialization={exercise.category}
          variant="inline"
        />
      </div>

      {/* Weight + cues — always visible for fast logging */}
      <div className="flex gap-2 mt-3">
        <input
          type="number"
          inputMode="decimal"
          placeholder="lbs"
          value={savedWeight}
          onChange={(e) => onWeightChange(e.target.value)}
          className="flex-1 bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-amber-400 font-semibold min-h-[48px] focus:outline-none focus:border-amber-500/50 tabular-nums"
          aria-label={`Weight for ${exercise.name}`}
        />
        <Button
          variant="secondary"
          size="md"
          icon={<Info size={16} />}
          onClick={onOpenCues}
          aria-label={`Form cues for ${exercise.name}`}
        >
          Cues
        </Button>
      </div>

      {/* Set buttons — always visible, 1-tap logging */}
      <div
        className="grid gap-2 mt-3"
        style={{
          gridTemplateColumns: `repeat(${Math.min(exercise.sets, 6)}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: exercise.sets }).map((_, sIdx) => {
          const done = isSetDone(sIdx);
          return (
            <motion.button
              key={sIdx}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => onSetToggle(sIdx)}
              className={`min-h-[52px] rounded-2xl font-bold text-sm transition cursor-pointer border-2 touch-target ${
                done
                  ? 'bg-amber-500 border-amber-400 text-black shadow-[var(--shadow-glow)]'
                  : 'bg-zinc-900/80 border-white/[0.08] text-zinc-300 hover:border-amber-500/40'
              }`}
              aria-label={`Set ${sIdx + 1} ${done ? 'completed' : 'log set'}`}
            >
              {done ? <Check size={22} strokeWidth={3} className="mx-auto" /> : `S${sIdx + 1}`}
            </motion.button>
          );
        })}
      </div>

      {/* Full detail — optional expand */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <ExerciseVisualizer
                exerciseName={exercise.name}
                targetSpecialization={exercise.category}
                variant="detail"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PremiumCard>
  );
}
