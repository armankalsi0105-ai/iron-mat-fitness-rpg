import React, { useMemo } from 'react';
import { Activity, Dumbbell, Flame, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { CharacterProfile } from '../types';
import PremiumCard from './ui/PremiumCard';
import ScoreRing from './ui/ScoreRing';
import SectionHeader from './ui/SectionHeader';
import {
  getDashboardScores,
  WRESTLING_PHASES,
  normalizeWrestlingPhase,
} from '../lib/athleteMetrics';

interface AthleteDashboardProps {
  profile: CharacterProfile;
  onPhaseChange?: (phase: string) => void;
  onMetricChange?: (
    metric:
      | 'gripRating'
      | 'conditioningRating'
      | 'pullupsRating'
      | 'deadhangsRating'
      | 'farmercarriesRating',
    value: number
  ) => void;
  showWrestlerControls?: boolean;
}

export default function AthleteDashboard({
  profile,
  onPhaseChange,
  onMetricChange,
  showWrestlerControls = true,
}: AthleteDashboardProps) {
  const scores = useMemo(() => getDashboardScores(profile), [profile]);
  const phase = normalizeWrestlingPhase(profile.wrestlingPhase);

  const rings = [
    { key: 'recovery', label: 'Recovery', score: scores.recovery },
    { key: 'training', label: 'Training', score: scores.training },
    { key: 'consistency', label: 'Consistency', score: scores.consistency },
    { key: 'strength', label: 'Strength', score: scores.strength },
    { key: 'athletic', label: 'Athletic', score: scores.athletic },
  ] as const;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Athlete Dashboard"
        subtitle="WHOOP-style readiness rings"
        icon={Activity}
      />

      <PremiumCard variant="gradient" padding="lg" className="gradient-mesh-amber">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 justify-items-center">
          {rings.map((ring, i) => (
            <motion.div
              key={ring.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <ScoreRing
                score={ring.score}
                label={ring.label}
                size={76}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-amber-400" />
            <span className="text-sm font-bold text-white">
              Wrestling Performance
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-amber-400 tabular-nums">
              {scores.wrestling}
            </span>
          </div>
        </div>
      </PremiumCard>

      {showWrestlerControls && onPhaseChange && (
        <PremiumCard variant="glass" padding="md">
          <SectionHeader
            title="Wrestler Mode"
            subtitle={`${phase} · grip · pull-ups · conditioning`}
            icon={Flame}
            className="mb-3"
          />

          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1 bg-black/30 rounded-xl border border-white/[0.06] mb-4"
            role="tablist"
            aria-label="Wrestling season phase"
          >
            {WRESTLING_PHASES.map((p) => {
              const isActive = phase === p;
              return (
                <button
                  key={p}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onPhaseChange(p)}
                  className={`py-2.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition cursor-pointer touch-target ${
                    isActive
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {p.replace(' ', '\u00a0')}
                </button>
              );
            })}
          </div>

          {onMetricChange && (
            <div className="space-y-4">
              {(
                [
                  ['gripRating', 'Grip Strength', profile.gripRating || 5, 1, 10],
                  [
                    'conditioningRating',
                    'Conditioning',
                    profile.conditioningRating || 5,
                    1,
                    10,
                  ],
                ] as const
              ).map(([key, label, val, min, max]) => (
                <div key={key}>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span className="text-zinc-400">{label}</span>
                    <span className="text-amber-400 tabular-nums">
                      {val} / {max}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={val}
                    onChange={(e) =>
                      onMetricChange(key, parseInt(e.target.value, 10))
                    }
                    className="w-full h-1.5 rounded accent-amber-500 cursor-pointer"
                    aria-label={label}
                  />
                </div>
              ))}

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ['pullupsRating', 'Pull-ups', profile.pullupsRating || 0],
                    ['deadhangsRating', 'Dead hang (s)', profile.deadhangsRating || 0],
                    [
                      'farmercarriesRating',
                      'Farmer (s)',
                      profile.farmercarriesRating || 0,
                    ],
                  ] as const
                ).map(([key, label, val]) => (
                  <label key={key} className="bg-black/30 border border-white/[0.06] rounded-xl p-2">
                    <span className="text-[9px] text-zinc-500 font-semibold block">
                      {label}
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={val}
                      onChange={(e) =>
                        onMetricChange(
                          key,
                          Math.max(0, parseInt(e.target.value, 10) || 0)
                        )
                      }
                      className="w-full bg-transparent text-white font-bold text-sm mt-1 focus:outline-none tabular-nums"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-500">
            <Zap size={12} className="text-amber-500" />
            <span>
              Phase adjusts training emphasis — tournament mode prioritizes
              recovery and grip.
            </span>
          </div>
        </PremiumCard>
      )}
    </div>
  );
}
