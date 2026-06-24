import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';
import { Plus, TrendingUp, Lightbulb } from 'lucide-react';
import { useVault } from '../../contexts/VaultContext';
import { useUI } from '../../contexts/UIContext';
import PRCenter from '../../components/shared/PRCenter';
import WorkoutHeatmap from '../../components/shared/WorkoutHeatmap';
import RecoveryTracker from '../../components/shared/RecoveryTracker';
import ExerciseLibrary from '../../components/shared/ExerciseLibrary';
import ProgressPhotos from '../../components/shared/ProgressPhotos';
import WeeklyReportCard from '../../components/shared/WeeklyReportCard';
import GoalProgress from '../../components/shared/GoalProgress';
import {
  computeConsistencyScore,
  computeWeeklyVolume,
  generateInsights,
  generateWeeklyReport,
  rescheduleMissedWorkout,
} from '../../services/insightsService';
import { updatePR, countPRs } from '../../services/prService';
import { syncStructuredGoals } from '../../services/goalService';
import { upsertRecoveryLog } from '../../services/recoveryService';
import { PRLift } from '../../types';

export default function ProgressScreen() {
  const { activeProfile, updateActiveProfile, addBodyWeight, flushVault } = useVault();
  const { triggerToast } = useUI();
  const [newBodyWeight, setNewBodyWeight] = useState('');

  const report = useMemo(() => generateWeeklyReport(activeProfile), [activeProfile]);
  const goals = useMemo(() => syncStructuredGoals(activeProfile), [activeProfile]);
  const insights = useMemo(() => generateInsights(activeProfile), [activeProfile]);
  const consistency = useMemo(() => computeConsistencyScore(activeProfile), [activeProfile]);
  const weeklyVolume = useMemo(() => computeWeeklyVolume(activeProfile), [activeProfile]);
  const prCount = useMemo(() => countPRs(activeProfile), [activeProfile]);

  const chartWeightData = useMemo(() => {
    const logs = activeProfile.bodyWeightLogs ?? [];
    if (logs.length === 0) return [];
    return logs.map((l) => ({
      date: l.date.split('-').slice(1).join('/'),
      weight: l.weight,
    }));
  }, [activeProfile.bodyWeightLogs]);

  const handleAddBodyWeight = () => {
    const wt = parseFloat(newBodyWeight);
    if (isNaN(wt) || wt <= 0) {
      triggerToast('Enter a valid bodyweight.');
      return;
    }
    addBodyWeight(wt);
    setNewBodyWeight('');
    triggerToast(`Logged ${wt} lbs`);
  };

  const missed = activeProfile.missedWorkouts ?? [];
  const unscheduled = missed.filter((m) => !m.rescheduledTo);

  return (
    <div className="space-y-5 pb-24">
      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-4">
        <h2 className="text-xl font-black text-white">Athlete dashboard</h2>
        <p className="text-sm text-zinc-500 mt-1">Am I improving?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="flex flex-col justify-center bg-ntc rounded-2xl p-4 border border-ntc-border min-h-[72px]">
            <span className="text-[10px] text-zinc-500">Completion</span>
            <p className="text-xl font-black text-volt-500">{consistency}%</p>
          </div>
          <div className="flex flex-col justify-center bg-ntc rounded-2xl p-4 border border-ntc-border min-h-[72px]">
            <span className="text-[10px] text-zinc-500">Weekly sets</span>
            <p className="text-xl font-black text-white">{weeklyVolume}</p>
          </div>
          <div className="flex flex-col justify-center bg-ntc rounded-2xl p-4 border border-ntc-border min-h-[72px]">
            <span className="text-[10px] text-zinc-500">PRs</span>
            <p className="text-xl font-black text-white">{prCount}</p>
          </div>
          <div className="flex flex-col justify-center bg-ntc rounded-2xl p-4 border border-ntc-border min-h-[72px]">
            <span className="text-[10px] text-zinc-500">Streak</span>
            <p className="text-xl font-black text-white">{activeProfile.streak ?? 0}</p>
          </div>
        </div>
      </div>

      <GoalProgress goals={goals} />
      <WorkoutHeatmap profile={activeProfile} />
      <WeeklyReportCard report={report} />

      {unscheduled.length > 0 && (
        <div className="bg-ntc-elevated border border-amber-500/30 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-amber-400 mb-2">Missed workouts</h3>
          {unscheduled.slice(-3).map((m) => (
            <div key={m.date} className="flex justify-between items-center py-2">
              <span className="text-sm text-zinc-300">{m.date}</span>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  updateActiveProfile((prev) => rescheduleMissedWorkout(prev, m.date, today));
                  triggerToast('Rescheduled to today');
                }}
                className="text-xs font-bold text-volt-500 min-h-[44px] px-3"
              >
                Reschedule
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-volt-500" />
          <h3 className="text-sm font-bold text-white">Smart insights</h3>
        </div>
        <ul className="space-y-2">
          {insights.map((i) => (
            <li key={i} className="text-sm text-zinc-400">
              {i}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-volt-500" />
            <h3 className="text-sm font-bold text-white">Bodyweight</h3>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="number"
              placeholder="lbs"
              value={newBodyWeight}
              onChange={(e) => setNewBodyWeight(e.target.value)}
              className="bg-white/5 border border-ntc-border rounded-lg px-3 py-2.5 text-sm w-24 min-h-[44px]"
            />
            <button
              onClick={handleAddBodyWeight}
              className="bg-white text-black px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1 min-h-[44px]"
            >
              <Plus size={12} /> Log
            </button>
          </div>
        </div>
        {chartWeightData.length > 0 ? (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartWeightData}>
                <defs>
                  <linearGradient id="bw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CDF500" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#CDF500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#6b6b6b" fontSize={10} />
                <YAxis domain={['auto', 'auto']} stroke="#6b6b6b" fontSize={10} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    borderColor: '#2a2a2a',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#CDF500"
                  strokeWidth={2}
                  fill="url(#bw)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 text-center py-8">Log bodyweight to see trends.</p>
        )}
      </div>

      <PRCenter
        profile={activeProfile}
        onUpdate={(lift, weight) => {
          updateActiveProfile((prev) => updatePR(prev, lift as PRLift, weight));
          triggerToast(`PR updated: ${lift}`);
        }}
      />

      <RecoveryTracker
        profile={activeProfile}
        onSave={(data) => {
          updateActiveProfile((prev) => upsertRecoveryLog(prev, data));
          flushVault();
          triggerToast('Recovery logged for today');
        }}
      />

      <ProgressPhotos
        profile={activeProfile}
        onUpdate={(photos) => updateActiveProfile((prev) => ({ ...prev, progressPhotos: photos }))}
      />

      <ExerciseLibrary />
    </div>
  );
}
