/*
Author: AI Coding Assistant
OS support: Linux, macOS, Windows
Description: Student athlete metrics trackers including bodybuilding metrics, wrestling phase, PB registers, and RM zone calculators
*/
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Dumbbell, Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, CartesianGrid, Tooltip as RechartsTooltip,
  AreaChart, Area, XAxis, YAxis
} from 'recharts';
import { AthleteProfile } from '../types';

interface ProgressScreenProps {
  activeProfile: AthleteProfile;
  updateActiveProfile: (updater: (prev: AthleteProfile) => AthleteProfile) => void;
  triggerToast: (msg: string) => void;
  newBodyWeight: string;
  setNewBodyWeight: (val: string) => void;
  handleAddBodyWeight: () => void;
}

export default function ProgressScreen({
  activeProfile,
  updateActiveProfile,
  triggerToast,
  newBodyWeight,
  setNewBodyWeight,
  handleAddBodyWeight
}: ProgressScreenProps) {
  const [editingLiftKey, setEditingLiftKey] = useState<string | null>(null);
  const [tempLiftWeight, setTempLiftWeight] = useState<string>("");

  const [oneRepWeight, setOneRepWeight] = useState<number>(135);
  const [oneRepReps, setOneRepReps] = useState<number>(5);

  const oneRepMax = useMemo(() => {
    return Math.round(oneRepWeight * (1 + oneRepReps / 30));
  }, [oneRepWeight, oneRepReps]);

  const handleEditPB = (key: string, currentVal: number) => {
    setEditingLiftKey(key);
    setTempLiftWeight(String(currentVal || 0));
  };

  const handleSavePB = (key: string) => {
    const wt = parseInt(tempLiftWeight, 10);
    if (isNaN(wt) || wt < 0) {
      triggerToast("Input a valid non-negative weight.");
      return;
    }

    updateActiveProfile(prev => {
      const pBests = prev.personalBests || { "Squat": 0, "Bench Press": 0, "Deadlift": 0 };
      const updatedBests = {
        ...pBests,
        [key]: wt
      };

      return {
        ...prev,
        personalBests: updatedBests
      };
    });

    setEditingLiftKey(null);
    triggerToast(`Personal record updated: ${key} — ${wt} lbs`);
  };

  const chartWeightData = useMemo(() => {
    const logs = activeProfile.bodyWeightLogs || [];
    if (logs.length === 0) {
      if (!activeProfile.weight) return [];
      return [{ date: 'Start', weight: activeProfile.weight }];
    }
    return logs.map(l => ({
      date: l.date.split('-').slice(1).join('/'),
      weight: l.weight
    }));
  }, [activeProfile.bodyWeightLogs, activeProfile.weight]);

  return (
    <div className="space-y-6">
      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-ntc-border pb-3 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-ntc rounded-lg text-volt-500">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-sm font-bold text-white">
              Bodyweight
            </h3>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <input 
              type="number" 
              placeholder="lbs"
              value={newBodyWeight}
              onChange={(e) => setNewBodyWeight(e.target.value)}
              className="bg-ntc border border-ntc-border rounded-lg px-3 py-2 text-sm placeholder-zinc-600 w-20 text-zinc-100"
            />
            <button
              onClick={handleAddBodyWeight}
              className="bg-white hover:bg-zinc-100 text-black px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus size={12} strokeWidth={3} /> Log
            </button>
          </div>
        </div>

        {chartWeightData.length > 0 ? (
          <div className="h-44 w-full bg-ntc p-2.5 rounded-xl border border-ntc-border mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartWeightData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="bodyWeightColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CDF500" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#CDF500" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" stroke="#6b6b6b" fontSize={10} />
                <YAxis domain={['auto', 'auto']} stroke="#6b6b6b" fontSize={10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "#1a1a1a", borderColor: "#2a2a2a", borderRadius: "10px", fontSize: "12px", color: "#fff" }}
                />
                <Area type="monotone" dataKey="weight" stroke="#CDF500" strokeWidth={2} fillOpacity={1} fill="url(#bodyWeightColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-20 w-full bg-ntc p-2.5 rounded-xl border border-ntc-border mt-4 flex items-center justify-center">
            <p className="text-sm text-zinc-500">No data logged yet</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["Squat", "Bench Press", "Deadlift"].map((lift) => {
          const personalBests = activeProfile.personalBests || { "Squat": 0, "Bench Press": 0, "Deadlift": 0 };
          const curRefWt = personalBests[lift] || 0;
          const isEditing = editingLiftKey === lift;

          return (
            <div key={lift} className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5 hover:border-zinc-700 transition relative overflow-hidden group">
              <p className="text-xs font-medium text-zinc-500">{lift}</p>
              
              {isEditing ? (
                <div className="mt-3 space-y-2 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number"
                      autoFocus
                      value={tempLiftWeight}
                      onChange={(e) => setTempLiftWeight(e.target.value)}
                      className="w-full bg-ntc border border-ntc-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-volt-500/50"
                    />
                    <span className="text-xs text-zinc-500">lbs</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSavePB(lift)}
                      className="flex-1 py-2 rounded-full bg-white font-bold text-xs text-black cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingLiftKey(null)}
                      className="px-3 py-2 bg-ntc border border-ntc-border rounded-full font-medium text-xs text-zinc-400 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => handleEditPB(lift, curRefWt)}
                  className="mt-3 cursor-pointer flex justify-between items-baseline relative z-10"
                >
                  <span className="text-2xl font-black text-white group-hover:text-volt-500 transition-colors">
                    {curRefWt} <span className="text-sm text-zinc-500 font-medium">lbs</span>
                  </span>
                  <span className="text-xs text-zinc-500 group-hover:text-volt-500">Edit</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-ntc-border pb-3">
          <Dumbbell size={14} className="text-volt-500" /> 1RM calculator
        </h3>

        <div className="flex justify-between items-center bg-ntc p-4 rounded-xl border border-ntc-border mb-4">
          <div>
            <span className="text-xs text-zinc-500 block">Estimated 1RM</span>
            <span className="text-2xl font-black text-white mt-1 block">
              {oneRepMax} <span className="text-sm text-zinc-500">lbs</span>
            </span>
          </div>
          <div className="p-3 bg-ntc-elevated rounded-xl text-center border border-ntc-border">
            <span className="text-xs text-zinc-500 block">Ratio</span>
            <span className="text-sm font-black text-volt-500 block mt-1">
              {(oneRepMax / 135).toFixed(1)}×
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>Reference weight</span>
              <span className="text-volt-500 font-bold">{oneRepWeight} lbs</span>
            </div>
            <input 
              type="range"
              min="45"
              max="450"
              step="5"
              value={oneRepWeight}
              onChange={(e) => setOneRepWeight(parseInt(e.target.value))}
              className="w-full accent-volt-500 bg-ntc h-1 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>Reps completed</span>
              <span className="text-volt-500 font-bold">{oneRepReps} reps</span>
            </div>
            <input 
              type="range"
              min="1"
              max="12"
              value={oneRepReps}
              onChange={(e) => setOneRepReps(parseInt(e.target.value))}
              className="w-full h-1 rounded accent-volt-500 bg-ntc cursor-pointer"
            />
          </div>
        </div>

        <div className="border border-ntc-border rounded-xl overflow-hidden text-sm">
          <div className="grid grid-cols-2 bg-ntc p-3 text-xs font-semibold text-zinc-500 border-b border-ntc-border">
            <span>Intensity</span>
            <span className="text-right">Weight</span>
          </div>
          <div className="divide-y divide-ntc-border px-3 bg-ntc-elevated">
            {[90, 85, 80, 75].map(pct => {
              const val = Math.round(oneRepMax * (pct / 100));
              return (
                <div key={pct} className="flex justify-between items-center py-2.5 text-zinc-400">
                  <span>{pct}%</span>
                  <span className="text-white font-bold">{val} lbs</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
/* --- End of ProgressScreen.tsx --- */
