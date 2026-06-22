import React from 'react';
import { Calendar, Trophy, Flame, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { CharacterProfile } from '../types';
import PremiumCard from './ui/PremiumCard';
import SectionHeader from './ui/SectionHeader';
import ProgressRing from './ui/ProgressRing';
import StreakCard from './ui/StreakCard';
import {
  canLogProgramDay,
  computeProgramStreak,
  formatProgramDayLabel,
  getDateKeyForProgramDay,
  getDayNameForProgramDay,
  getProgramStartDate,
  hasProgramStarted,
} from '../schedule';

interface CalendarScreenProps {
  activeProfile: CharacterProfile;
  updateActiveProfile: (updater: (prev: CharacterProfile) => CharacterProfile) => void;
  triggerToast: (msg: string) => void;
}

export default function CalendarScreen({
  activeProfile,
  updateActiveProfile,
  triggerToast,
}: CalendarScreenProps) {
  const totalDays = 28;
  const completedWorkouts = activeProfile.completedWorkouts || [];

  const handleToggleDay = (dayIdx: number) => {
    if (!canLogProgramDay(dayIdx)) {
      if (!hasProgramStarted()) {
        triggerToast('Training logs open on Day 1.');
      } else {
        triggerToast(`Day ${dayIdx + 1} (${formatProgramDayLabel(dayIdx)}) not available yet.`);
      }
      return;
    }

    const dayDateKey = getDateKeyForProgramDay(dayIdx);
    const legacyDayKey = `day-${dayIdx}`;
    const isAlreadyCompleted = completedWorkouts.some(
      (cw) => cw.date === dayDateKey || cw.date === legacyDayKey
    );

    updateActiveProfile((prev) => {
      const currentVal = prev.completedWorkouts || [];
      let nextVal = [...currentVal];

      const nextWorkouts = isAlreadyCompleted
        ? nextVal.filter((d) => d.date !== dayDateKey && d.date !== legacyDayKey)
        : [
            ...nextVal,
            {
              date: dayDateKey,
              dayName: getDayNameForProgramDay(dayIdx),
              count: 1,
            },
          ];

      const streak = computeProgramStreak(nextWorkouts);

      return {
        ...prev,
        completedWorkouts: nextWorkouts,
        streak,
        xp: Math.max(0, (prev.xp || 0) + (isAlreadyCompleted ? -10 : 10)),
      };
    });

    triggerToast(
      isAlreadyCompleted
        ? `Day ${dayIdx + 1} cleared`
        : `Day ${dayIdx + 1} logged · +10 XP`
    );
  };

  const loggedCount = completedWorkouts.length;
  const consistencyRate = Math.round((loggedCount / totalDays) * 100);
  const programStartLabel = getProgramStartDate().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-4 pb-4 tab-content-enter">
      {!hasProgramStarted() && (
        <PremiumCard variant="gradient" padding="md" className="border-amber-500/20">
          <p className="text-sm font-bold text-amber-400">28-day program begins {programStartLabel}</p>
          <p className="text-[12px] text-zinc-400 mt-1">
            Calendar logging unlocks as each training day arrives.
          </p>
        </PremiumCard>
      )}

      <div className="flex gap-3">
        <StreakCard streak={activeProfile.streak || 0} />
        <PremiumCard variant="glass" padding="sm" className="flex-1">
          <div className="flex items-center gap-3">
            <ProgressRing
              value={consistencyRate}
              size={52}
              strokeWidth={4}
              color="#34d399"
              trackColor="rgba(255,255,255,0.06)"
            >
              <span className="text-xs font-bold text-emerald-400">{consistencyRate}%</span>
            </ProgressRing>
            <div>
              <p className="text-caption font-semibold text-zinc-500 uppercase">Consistency</p>
              <p className="text-lg font-bold text-white tabular-nums">
                {loggedCount}
                <span className="text-sm text-zinc-500 font-medium">/{totalDays}</span>
              </p>
            </div>
          </div>
        </PremiumCard>
      </div>

      <PremiumCard variant="default" padding="md">
        <SectionHeader
          title="Training Calendar"
          subtitle={`Tap to log · Starts ${programStartLabel}`}
          icon={Calendar}
          className="mb-4"
        />

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayDateKey = getDateKeyForProgramDay(idx);
            const legacyDayKey = `day-${idx}`;
            const isCompleted = completedWorkouts.some(
              (cw) => cw.date === dayDateKey || cw.date === legacyDayKey
            );
            const isLoggable = canLogProgramDay(idx);
            const isRestCycle = (idx + 1) % 7 === 0;
            const isFutureDay = !isLoggable && !isCompleted;

            return (
              <motion.button
                key={idx}
                type="button"
                whileTap={!isFutureDay ? { scale: 0.95 } : undefined}
                onClick={() => handleToggleDay(idx)}
                disabled={isFutureDay}
                title={`${formatProgramDayLabel(idx)} · ${getDayNameForProgramDay(idx)}`}
                className={`min-h-[52px] rounded-xl flex flex-col items-center justify-center border transition cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : isFutureDay
                      ? 'bg-black/20 border-white/[0.04] text-zinc-600 opacity-50 cursor-not-allowed'
                      : isRestCycle
                        ? 'bg-amber-500/5 border-amber-500/20 text-amber-400 hover:border-amber-500/40'
                        : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:border-white/[0.12]'
                }`}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span className="text-sm font-bold tabular-nums">{idx + 1}</span>
                )}
                <span className="text-[8px] font-bold uppercase opacity-70 mt-0.5">
                  {isCompleted ? 'Done' : isFutureDay ? 'Soon' : isRestCycle ? 'Rest' : 'Log'}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-5 pt-4 border-t border-white/[0.06] text-[10px] text-zinc-500 font-semibold uppercase">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" /> Logged
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500/30" /> Rest
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white/[0.04] border border-white/[0.08]" /> Available
          </span>
        </div>
      </PremiumCard>

      <PremiumCard variant="glass" padding="md">
        <div className="flex gap-3">
          <Trophy size={20} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-white flex items-center gap-2">
              Championship Protocol
              <Flame size={14} className="text-orange-400" />
            </p>
            <p className="text-[12px] text-zinc-400 mt-1 leading-relaxed">
              Consistency beats intensity. Never miss twice — log every training day and build the habit that wins matches.
            </p>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
}
