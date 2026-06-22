import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  value: number;
  suffix?: string;
  className?: string;
}

export default function TrendIndicator({
  value,
  suffix = '%',
  className = '',
}: TrendIndicatorProps) {
  const isUp = value > 0;
  const isFlat = value === 0;
  const color = isFlat ? 'text-zinc-500' : isUp ? 'text-emerald-400' : 'text-rose-400';
  const Icon = isFlat ? Minus : isUp ? TrendingUp : TrendingDown;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums ${color} ${className}`}
      aria-label={`Trend ${value}${suffix}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {isUp ? '+' : ''}
      {value}
      {suffix}
    </span>
  );
}
