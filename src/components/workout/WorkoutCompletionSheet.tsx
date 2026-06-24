import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Flame, Trophy, Clock, Dumbbell, TrendingUp, ArrowRight } from 'lucide-react';
import { PRLift } from '../../types';
import { formatDuration } from '../../services/workoutSessionService';
import { getPRUnit } from '../../services/prService';

export interface CompletionData {
  title: string;
  durationMs: number;
  totalSets: number;
  totalReps: number;
  volumeLoad: number;
  streak: number;
  prsAchieved: PRLift[];
  nextWorkoutDay: string;
}

interface WorkoutCompletionSheetProps {
  data: CompletionData;
  onDone: () => void;
  onNextWorkout?: () => void;
}

function WorkoutCompletionSheet({ data, onDone, onNextWorkout }: WorkoutCompletionSheetProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-4"
      onClick={onDone}
    >
      <motion.div
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-ntc-elevated border border-ntc-border rounded-2xl p-5 max-h-[85dvh] overflow-y-auto"
      >
        <div className="flex items-center gap-3 mb-5">
          <Trophy size={22} className="text-volt-500 shrink-0" />
          <div>
            <p className="text-xs text-volt-500 uppercase font-semibold">Workout complete</p>
            <h3 className="text-xl font-black text-white">{data.title}</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-ntc rounded-xl p-3 border border-ntc-border">
            <Clock size={14} className="text-zinc-500 mb-1" />
            <span className="text-lg font-black text-white block">{formatDuration(data.durationMs)}</span>
            <p className="text-[10px] text-zinc-500">duration</p>
          </div>
          <div className="bg-ntc rounded-xl p-3 border border-ntc-border">
            <Dumbbell size={14} className="text-zinc-500 mb-1" />
            <span className="text-lg font-black text-white block">{data.totalSets}</span>
            <p className="text-[10px] text-zinc-500">sets · {data.totalReps} reps</p>
          </div>
          <div className="bg-ntc rounded-xl p-3 border border-ntc-border">
            <TrendingUp size={14} className="text-zinc-500 mb-1" />
            <span className="text-lg font-black text-volt-500 block">
              {data.volumeLoad > 0 ? data.volumeLoad.toLocaleString() : '—'}
            </span>
            <p className="text-[10px] text-zinc-500">volume (lbs)</p>
          </div>
          <div className="bg-ntc rounded-xl p-3 border border-ntc-border">
            <Flame size={14} className="text-volt-500 fill-volt-500 mb-1" />
            <span className="text-lg font-black text-volt-500 block">{data.streak}</span>
            <p className="text-[10px] text-zinc-500">day streak</p>
          </div>
        </div>

        {data.prsAchieved.length > 0 && (
          <div className="bg-volt-500/10 border border-volt-500/30 rounded-xl p-3 mb-4">
            <p className="text-xs font-bold text-volt-500 uppercase mb-2">New PRs</p>
            <div className="flex flex-wrap gap-2">
              {data.prsAchieved.map((pr) => (
                <span
                  key={pr}
                  className="text-xs font-semibold bg-ntc px-2.5 py-1 rounded-full text-white border border-ntc-border"
                >
                  {pr}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-ntc rounded-xl p-3 border border-ntc-border mb-5">
          <p className="text-[10px] text-zinc-500 uppercase mb-1">What next?</p>
          <p className="text-sm text-white font-medium">
            Next up: <span className="text-volt-500">{data.nextWorkoutDay}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {onNextWorkout && (
            <button
              type="button"
              onClick={onNextWorkout}
              className="w-full py-3.5 bg-volt-500 text-black font-bold rounded-full min-h-[44px] flex items-center justify-center gap-2"
            >
              Preview next workout <ArrowRight size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onDone}
            className="w-full py-3.5 bg-white text-black font-bold rounded-full min-h-[44px]"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default memo(WorkoutCompletionSheet);
