import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'motion/react';
import PremiumCard from './PremiumCard';

interface StreakCardProps {
  streak: number;
  className?: string;
}

export default function StreakCard({ streak, className = '' }: StreakCardProps) {
  const isHot = streak >= 3;

  return (
    <PremiumCard variant="glass" padding="sm" className={`flex-1 min-w-0 ${className}`}>
      <div className="flex items-center gap-3">
        <motion.div
          className={`flex items-center justify-center w-11 h-11 rounded-2xl ${
            isHot
              ? 'bg-gradient-to-br from-orange-500/30 to-amber-500/20'
              : 'bg-white/[0.04]'
          }`}
          animate={isHot ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame
            size={22}
            className={isHot ? 'text-orange-400 fill-orange-400' : 'text-zinc-500'}
          />
        </motion.div>
        <div className="min-w-0">
          <p className="text-[var(--text-caption)] font-semibold text-zinc-500 uppercase tracking-wider">
            Streak
          </p>
          <p className="text-2xl font-bold text-white tabular-nums leading-tight">
            {streak}
            <span className="text-sm font-medium text-zinc-400 ml-1">days</span>
          </p>
        </div>
      </div>
    </PremiumCard>
  );
}
