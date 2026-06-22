import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Dumbbell, Trophy, Plus, Award, Scale, BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, AreaChart, Area,
} from 'recharts';
import { motion } from 'motion/react';
import { CharacterProfile } from '../types';
import { ACHIEVEMENTS } from '../data';
import AthleteDashboard from './AthleteDashboard';
import PremiumCard from './ui/PremiumCard';
import SectionHeader from './ui/SectionHeader';
import Button from './ui/Button';
import TrendIndicator from './ui/TrendIndicator';
import {
  getBodyWeightTrend,
  getStrengthTrendData,
  getMonthlyGrowth,
  getAchievementTimeline,
} from '../lib/athleteMetrics';

interface ProgressScreenProps {
  activeProfile: CharacterProfile;
  updateActiveProfile: (updater: (prev: CharacterProfile) => CharacterProfile) => void;
  triggerToast: (msg: string) => void;
  newBodyWeight: string;
  setNewBodyWeight: (val: string) => void;
  handleAddBodyWeight: () => void;
  handleUpdateWrestlingPhase: (phase: string) => void;
  handleUpdateWrestlingRating: (
    metric: 'gripRating' | 'conditioningRating' | 'pullupsRating' | 'deadhangsRating' | 'farmercarriesRating',
    value: number
  ) => void;
  readinessScore: number;
}

export default function ProgressScreen({
  activeProfile,
  updateActiveProfile,
  triggerToast,
  newBodyWeight,
  setNewBodyWeight,
  handleAddBodyWeight,
  handleUpdateWrestlingPhase,
  handleUpdateWrestlingRating,
}: ProgressScreenProps) {
  const [editingLiftKey, setEditingLiftKey] = useState<string | null>(null);
  const [tempLiftWeight, setTempLiftWeight] = useState('');
  const [oneRepWeight, setOneRepWeight] = useState(135);
  const [oneRepReps, setOneRepReps] = useState(5);

  const oneRepMax = useMemo(
    () => Math.round(oneRepWeight * (1 + oneRepReps / 30)),
    [oneRepWeight, oneRepReps]
  );

  const chartWeightData = useMemo(
    () => getBodyWeightTrend(activeProfile),
    [activeProfile]
  );
  const strengthData = useMemo(
    () => getStrengthTrendData(activeProfile),
    [activeProfile]
  );
  const monthlyGrowth = useMemo(
    () => getMonthlyGrowth(activeProfile),
    [activeProfile]
  );
  const timeline = useMemo(
    () => getAchievementTimeline(activeProfile, ACHIEVEMENTS),
    [activeProfile]
  );

  const handleSavePB = (key: string) => {
    const wt = parseInt(tempLiftWeight, 10);
    if (isNaN(wt) || wt < 0) {
      triggerToast('Enter a valid weight.');
      return;
    }
    updateActiveProfile((prev) => ({
      ...prev,
      personalBests: { ...(prev.personalBests || {}), [key]: wt },
      xp: (prev.xp || 0) + 15,
    }));
    setEditingLiftKey(null);
    triggerToast(`${key} PR updated · +15 XP`);
  };

  const unlockedCount = activeProfile.achievements?.length || 0;
  const consistencyRate = Math.round(
    ((activeProfile.completedWorkouts?.length || 0) / 28) * 100
  );

  return (
    <div className="space-y-5 pb-4 tab-content-enter">
      <AthleteDashboard
        profile={activeProfile}
        onPhaseChange={handleUpdateWrestlingPhase}
        onMetricChange={handleUpdateWrestlingRating}
      />

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Reps', value: activeProfile.totalReps || 0 },
          { label: 'Streak', value: `${activeProfile.streak || 0}d` },
          { label: 'Consistency', value: `${consistencyRate}%` },
          { label: 'Level', value: activeProfile.level },
        ].map((stat) => (
          <div key={stat.label}>
          <PremiumCard variant="glass" padding="sm">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-xl font-bold text-white tabular-nums mt-1">
              {stat.value}
            </p>
          </PremiumCard>
          </div>
        ))}
      </div>

      {/* Body weight chart */}
      <PremiumCard variant="default" padding="md">
        <SectionHeader
          title="Body Weight"
          subtitle={monthlyGrowth !== 0 ? `${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth} lbs this period` : 'Log weight to track trends'}
          icon={Scale}
          action={
            <div className="flex gap-2 shrink-0">
              <input
                type="number"
                placeholder="lbs"
                value={newBodyWeight}
                onChange={(e) => setNewBodyWeight(e.target.value)}
                className="w-16 bg-black/40 border border-white/[0.08] rounded-lg px-2 py-2 text-xs text-white min-h-[44px] focus:outline-none focus:border-amber-500/50"
                aria-label="Body weight in pounds"
              />
              <Button size="sm" icon={<Plus size={14} />} onClick={handleAddBodyWeight}>
                Log
              </Button>
            </div>
          }
          className="mb-2"
        />
        <div className="h-44 w-full bg-black/20 rounded-xl border border-white/[0.04] p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartWeightData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
              <YAxis domain={['auto', 'auto']} stroke="#71717a" fontSize={10} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#111118',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#bwGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      {/* Strength trends + PRs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PremiumCard variant="glass" padding="md">
          <SectionHeader title="Strength Trends" subtitle="Personal records by lift" icon={BarChart3} className="mb-3" />
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strengthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#111118',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        <PremiumCard variant="default" padding="md">
          <SectionHeader title="Personal Records" subtitle="Tap to edit" icon={Dumbbell} className="mb-3" />
          <div className="space-y-2">
            {['Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Pull-Ups'].map((lift) => {
              const val = activeProfile.personalBests?.[lift] ?? 0;
              const isEditing = editingLiftKey === lift;
              return (
                <div
                  key={lift}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/30 border border-white/[0.06] hover:border-white/[0.1] transition"
                >
                  <span className="text-sm font-semibold text-zinc-300">{lift}</span>
                  {isEditing ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        autoFocus
                        value={tempLiftWeight}
                        onChange={(e) => setTempLiftWeight(e.target.value)}
                        className="w-20 bg-zinc-900 border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-white min-h-[44px]"
                      />
                      <Button size="sm" onClick={() => handleSavePB(lift)}>Save</Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLiftKey(lift);
                        setTempLiftWeight(String(val));
                      }}
                      className="text-lg font-bold text-amber-400 tabular-nums touch-target min-h-[44px] px-2 cursor-pointer"
                    >
                      {val} <span className="text-xs text-zinc-500 font-medium">lbs</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </PremiumCard>
      </div>

      {/* 1-RM calculator */}
      <PremiumCard variant="elevated" padding="md">
        <SectionHeader title="1-RM Estimator" subtitle="Epley formula · training zones" icon={TrendingUp} className="mb-4" />
        <div className="flex items-center justify-between bg-black/30 rounded-xl p-4 mb-4 border border-white/[0.06]">
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase">Estimated max</p>
            <p className="text-3xl font-bold text-white tabular-nums">{oneRepMax} <span className="text-sm text-zinc-500">lbs</span></p>
          </div>
          <TrendIndicator value={Math.round((oneRepMax / 135 - 1) * 100)} suffix=" vs baseline" />
        </div>
        <div className="space-y-3">
          {[
            ['Weight', oneRepWeight, 45, 450, setOneRepWeight],
            ['Reps', oneRepReps, 1, 12, setOneRepReps],
          ].map(([label, val, min, max, setter]) => (
            <div key={String(label)}>
              <div className="flex justify-between text-[11px] font-semibold text-zinc-400 mb-1">
                <span>{label}</span>
                <span className="text-amber-400">{val}</span>
              </div>
              <input
                type="range"
                min={min as number}
                max={max as number}
                step={label === 'Weight' ? 5 : 1}
                value={val as number}
                onChange={(e) => (setter as (n: number) => void)(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </PremiumCard>

      {/* Achievement timeline */}
      <PremiumCard variant="glass" padding="md">
        <SectionHeader
          title="Achievement Timeline"
          subtitle={`${unlockedCount} of ${ACHIEVEMENTS.length} unlocked`}
          icon={Trophy}
          className="mb-4"
        />
        <div className="relative pl-4 border-l border-white/[0.08] space-y-4">
          {timeline.map((entry, i) => {
            const ach = ACHIEVEMENTS.find((a) => a.id === entry.id);
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative flex gap-3"
              >
                <span
                  className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                    entry.unlocked
                      ? 'bg-amber-500 border-amber-400'
                      : 'bg-zinc-900 border-zinc-700'
                  }`}
                />
                <div className={`flex-1 p-3 rounded-xl border ${entry.unlocked ? 'bg-amber-500/5 border-amber-500/20' : 'bg-black/20 border-white/[0.04] opacity-60'}`}>
                  <div className="flex items-center gap-2">
                    {entry.unlocked && <Award size={14} className="text-amber-400" />}
                    <p className="text-sm font-bold text-white">{entry.name}</p>
                  </div>
                  {ach && (
                    <p className="text-[11px] text-zinc-500 mt-0.5">{ach.description}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </PremiumCard>
    </div>
  );
}
