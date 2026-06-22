import React from 'react';
import { Check } from 'lucide-react';
import PremiumCard from './PremiumCard';
import { WeeklyProgressData, DayStatus } from '../../lib/homeUtils';

interface WeeklyProgressProps {
  data: WeeklyProgressData;
  programStarted: boolean;
}

const statusStyles: Record<DayStatus, string> = {
  completed: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  today: 'bg-amber-500/25 border-amber-400/60 text-amber-300 ring-2 ring-amber-500/30',
  planned: 'bg-zinc-800/60 border-zinc-700/50 text-zinc-500',
  rest: 'bg-zinc-900/40 border-zinc-800/40 text-zinc-600',
  upcoming: 'bg-white/[0.03] border-white/[0.06] text-zinc-600',
  preview: 'bg-white/[0.02] border-dashed border-zinc-800 text-zinc-700',
};

export default function WeeklyProgress({ data, programStarted }: WeeklyProgressProps) {
  return (
    <PremiumCard variant="default" padding="md">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h3 className="text-[var(--text-section)] font-bold text-white tracking-tight">
            This Week
          </h3>
          <p className="text-[var(--text-caption)] text-zinc-500 mt-0.5">{data.weekLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white tabular-nums leading-none">
            {data.completedCount}
            <span className="text-base text-zinc-500 font-medium">/{programStarted ? data.plannedCount : '—'}</span>
          </p>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-1">
            {programStarted ? 'Sessions' : 'Starts soon'}
          </p>
        </div>
      </div>

      <div className="flex gap-1.5 justify-between">
        {data.days.map((day) => (
          <div key={day.dateKey} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <div
              className={`w-full aspect-square max-w-[40px] rounded-xl border flex items-center justify-center transition-all ${statusStyles[day.status]}`}
              title={`${day.label}${day.workoutTag ? ` · ${day.workoutTag}` : ''}`}
            >
              {day.status === 'completed' ? (
                <Check size={14} strokeWidth={3} />
              ) : day.status === 'rest' ? (
                <span className="text-[9px] font-bold">R</span>
              ) : (
                <span className="text-[10px] font-bold">{day.label.charAt(0)}</span>
              )}
            </div>
            <span className="text-[9px] font-medium text-zinc-600 uppercase">{day.label}</span>
          </div>
        ))}
      </div>

      {!programStarted && (
        <p className="text-[11px] text-zinc-500 mt-4 text-center italic">
          Program preview — your first session unlocks tomorrow
        </p>
      )}
    </PremiumCard>
  );
}
