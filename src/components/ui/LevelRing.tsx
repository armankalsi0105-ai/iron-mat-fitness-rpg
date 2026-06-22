import React from 'react';
import PremiumCard from './PremiumCard';
import ProgressRing from './ProgressRing';

interface LevelRingProps {
  level: number;
  xp: number;
  xpToNext: number;
  rank: string;
  className?: string;
}

export default function LevelRing({ level, xp, xpToNext, rank, className = '' }: LevelRingProps) {
  const pct = Math.min(100, (xp / xpToNext) * 100);

  return (
    <PremiumCard variant="glass" padding="sm" className={`flex-1 min-w-0 ${className}`}>
      <div className="flex items-center gap-3">
        <ProgressRing
          value={pct}
          size={52}
          strokeWidth={4}
          color="#f59e0b"
          trackColor="rgba(255,255,255,0.06)"
        >
          <span className="text-sm font-bold text-amber-400 tabular-nums">{level}</span>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-caption)] font-semibold text-zinc-500 uppercase tracking-wider truncate">
            Level {level}
          </p>
          <p className="text-sm font-bold text-white truncate">{rank}</p>
          <p className="text-[11px] text-zinc-500 tabular-nums mt-0.5">
            {xp} / {xpToNext} XP
          </p>
        </div>
      </div>
    </PremiumCard>
  );
}
