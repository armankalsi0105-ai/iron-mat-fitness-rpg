/*
Author: AI Coding Assistant
OS support: Linux, macOS, Windows
Description: Student athlete metrics trackers including bodybuilding metrics, wrestling phase, PB registers, and RM zone calculators
*/
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Dumbbell, Flame, Plus, Sparkles, MessageSquare
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
    triggerToast(`COMBAT RECORD UPDATE: "${key}" set to ${wt} lbs!`);
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
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-3 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
              <TrendingUp size={15} />
            </div>
            <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest font-mono">
              Bodyweight Progression
            </h3>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <input 
              type="number" 
              placeholder="lbs"
              value={newBodyWeight}
              onChange={(e) => setNewBodyWeight(e.target.value)}
              className="bg-zinc-900 border border-zinc-850 rounded-lg px-2.5 py-1 text-xs select-none placeholder-zinc-705 w-20 font-mono text-zinc-100"
            />
            <button
              onClick={handleAddBodyWeight}
              className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase font-mono transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus size={11} className="stroke-[3px]" /> Record
            </button>
          </div>
        </div>

        {chartWeightData.length > 0 ? (
          <div className="h-44 w-full bg-black/20 p-2.5 rounded-2xl border border-zinc-900 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartWeightData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="bodyWeightColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#16161a" />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={8} fontFamily="monospace" />
                <YAxis domain={['auto', 'auto']} stroke="#4b5563" fontSize={8} fontFamily="monospace" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "#09090b", borderColor: "#1f2937", borderRadius: "10px", fontSize: "10px" }}
                />
                <Area type="monotone" dataKey="weight" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#bodyWeightColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-20 w-full bg-black/20 p-2.5 rounded-2xl border border-zinc-900 mt-4 flex items-center justify-center">
            <p className="text-[10px] font-mono text-zinc-500 uppercase">No Data Logged Yet</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["Squat", "Bench Press", "Deadlift"].map((lift) => {
          const personalBests = activeProfile.personalBests || { "Squat": 0, "Bench Press": 0, "Deadlift": 0 };
          const curRefWt = personalBests[lift] || 0;
          const isEditing = editingLiftKey === lift;

          return (
            <div key={lift} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 hover:border-zinc-800 transition relative overflow-hidden group">
              <p className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">{lift}</p>
              
              {isEditing ? (
                <div className="mt-3 space-y-2 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number"
                      autoFocus
                      value={tempLiftWeight}
                      onChange={(e) => setTempLiftWeight(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2.5 py-1 text-xs font-mono text-white focus:outline-none"
                    />
                    <span className="text-[9px] text-zinc-500 font-mono">lbs</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSavePB(lift)}
                      className="flex-1 py-1 rounded bg-amber-500 font-black text-[9px] uppercase font-mono text-black cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingLiftKey(null)}
                      className="px-2 py-1 bg-zinc-800 rounded font-bold text-[9px] uppercase font-mono text-zinc-400 cursor-pointer"
                    >
                      X
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => handleEditPB(lift, curRefWt)}
                  className="mt-3 cursor-pointer flex justify-between items-baseline relative z-10"
                >
                  <span className="text-2xl font-mono font-black text-white group-hover:text-amber-500 transition-colors">
                    {curRefWt} <span className="text-xs text-zinc-500 font-medium">lbs</span>
                  </span>
                  <span className="text-[8px] font-black text-zinc-500 font-mono uppercase group-hover:text-amber-500">Edit</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-inner">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-mono border-b border-zinc-900 pb-2">
          <Dumbbell size={14} className="text-amber-500" /> Dynamic 1-RM Zone Bracket
        </h3>

        <div className="flex justify-between items-center bg-black/30 p-4 rounded-2xl border border-zinc-900 mb-4">
          <div>
            <span className="text-[8px] font-mono font-black text-amber-500/80 uppercase tracking-widest block">ESTIMATED 1-RM</span>
            <span className="text-2xl font-black font-mono text-white tracking-snug mt-1 block">
              {oneRepMax} <span className="text-xs text-zinc-500">lbs</span>
            </span>
          </div>
          <div className="p-3 bg-zinc-900 rounded-xl text-center">
            <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase block leading-none">RATIO</span>
            <span className="text-sm font-black text-amber-500 font-mono block mt-1">
              {(oneRepMax / 135).toFixed(1)}x <span className="text-[9px] text-zinc-500">plates</span>
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono font-black text-zinc-400 uppercase">
              <span>Ref Weight</span>
              <span className="text-amber-500 font-bold">{oneRepWeight} lbs</span>
            </div>
            <input 
              type="range"
              min="45"
              max="450"
              step="5"
              value={oneRepWeight}
              onChange={(e) => setOneRepWeight(parseInt(e.target.value))}
              className="w-full accent-amber-500 bg-zinc-900 h-1 rounded cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono font-black text-zinc-400 uppercase">
              <span>Repetitions completed</span>
              <span className="text-amber-500 font-bold">{oneRepReps} reps</span>
            </div>
            <input 
              type="range"
              min="1"
              max="12"
              value={oneRepReps}
              onChange={(e) => setOneRepReps(parseInt(e.target.value))}
              className="w-full h-1 rounded accent-amber-500 bg-zinc-900 cursor-pointer"
            />
          </div>
        </div>

        <div className="border border-zinc-900 rounded-xl overflow-hidden text-xs">
          <div className="grid grid-cols-2 bg-zinc-900/60 p-2 text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900">
            <span>INTENSITY % ZONE</span>
            <span className="text-right">WEIGHT GOAL</span>
          </div>
          <div className="divide-y divide-zinc-900 px-2 bg-black/10">
            {[90, 85, 80, 75].map(pct => {
              const val = Math.round(oneRepMax * (pct / 100));
              return (
                <div key={pct} className="flex justify-between items-center py-2 text-zinc-400 font-mono font-bold">
                  <span>{pct}% Peak Intensity Capacity</span>
                  <span className="text-white font-black">{val} lbs</span>
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
