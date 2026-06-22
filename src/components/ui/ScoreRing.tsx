import React from 'react';
import ProgressRing from './ProgressRing';
import TrendIndicator from './TrendIndicator';

interface ScoreRingProps {
  score: number;
  label: string;
  sublabel?: string;
  trend?: number;
  size?: number;
  color?: string;
  className?: string;
}

export default function ScoreRing({
  score,
  label,
  sublabel,
  trend,
  size = 72,
  color,
  className = '',
}: ScoreRingProps) {
  const ringColor =
    color ??
    (score >= 80 ? '#34d399' : score >= 55 ? '#fbbf24' : '#fb7185');

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <ProgressRing
        value={score}
        size={size}
        strokeWidth={5}
        color={ringColor}
        trackColor="rgba(255,255,255,0.06)"
      >
        <span className="text-lg font-bold text-white tabular-nums">{score}</span>
      </ProgressRing>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wide">
          {label}
        </p>
        {sublabel && (
          <p className="text-[10px] text-zinc-500 mt-0.5">{sublabel}</p>
        )}
        {trend !== undefined && (
          <TrendIndicator value={trend} className="mt-1 justify-center" />
        )}
      </div>
    </div>
  );
}
