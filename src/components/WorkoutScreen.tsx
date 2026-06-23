/*
Author: AI Coding Assistant
OS support: Linux, macOS, Windows
Description: Interactive training platform workout screen with day switcher, exercise checklist, and breathing synth pacing
*/
import React, { useState } from 'react';
import { 
  Dumbbell, Play, Pause, Info, Check, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AthleteProfile, Exercise, WorkoutDay } from '../types';
import { WARM_UPS } from '../data';
import NumpadBottomSheet from './NumpadBottomSheet';
import { computeStreak, getTodayISO, makeSetKey } from '../utils/workoutDates';

interface WorkoutScreenProps {
  activeProfile: AthleteProfile;
  currentDay: string;
  setCurrentDay: (day: string) => void;
  activeWorkout: WorkoutDay;
  updateActiveProfile: (updater: (prev: AthleteProfile) => AthleteProfile) => void;
  triggerToast: (msg: string) => void;
  checkedWarmups: Record<string, boolean>;
  setCheckedWarmups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  isWarmupOpen: boolean;
  setIsWarmupOpen: (open: boolean) => void;
  warmupTimerActive: boolean;
  setWarmupTimerActive: (active: boolean) => void;
  warmupTimeRemaining: number;
  setWarmupTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  setTimerRemaining: (val: number) => void;
  setTimerMax: (val: number) => void;
  setTimerRunning: (val: boolean) => void;
  isSynthRunning: boolean;
  setIsSynthRunning: (running: boolean) => void;
  synthTrack: string;
  setSynthTrack: (track: string) => void;
  synthVolume: number;
  setSynthVolume: (vol: number) => void;
  handleInitSynthAudio: () => void;
  handleStopSynthAudio: () => void;
  setCuesModalState: (state: { isOpen: boolean; exerciseName: string; category: string }) => void;
  getBadgeIconComponent: (icon: string, size?: number) => React.ReactNode;
}

export default function WorkoutScreen({
  activeProfile,
  currentDay,
  setCurrentDay,
  activeWorkout,
  updateActiveProfile,
  triggerToast,
  checkedWarmups,
  setCheckedWarmups,
  isWarmupOpen,
  setIsWarmupOpen,
  warmupTimerActive,
  setWarmupTimerActive,
  warmupTimeRemaining,
  setWarmupTimeRemaining,
  setTimerRemaining,
  setTimerMax,
  setTimerRunning,
  isSynthRunning,
  setIsSynthRunning,
  synthTrack,
  setSynthTrack,
  synthVolume,
  setSynthVolume,
  handleInitSynthAudio,
  handleStopSynthAudio,
  setCuesModalState,
  getBadgeIconComponent
}: WorkoutScreenProps) {
  
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [numpadOpenFor, setNumpadOpenFor] = useState<string | null>(null);
  const [numpadValue, setNumpadValue] = useState("");
  const todayISO = getTodayISO();
  const setKeyPrefix = `${todayISO}-${currentDay}`;

  const isWorkoutFullyComplete = (sets: Record<string, boolean>) => {
    const exercises = activeWorkout.exercises;
    if (!exercises || exercises.length === 0) return false;
    return exercises.every((ex, exIdx) =>
      Array.from({ length: ex.sets }).every((_, sIdx) =>
        !!sets[makeSetKey(todayISO, currentDay, exIdx, sIdx)]
      )
    );
  };

  const handleToggleWarmup = (item: string) => {
    const nextCheck = { ...checkedWarmups, [item]: !checkedWarmups[item] };
    setCheckedWarmups(nextCheck);
    
    updateActiveProfile(prev => {
      return {
        ...prev
      };
    });
    
    if (!checkedWarmups[item]) {
      triggerToast("Warm-up completed!");
    }
  };

  const handleToggleSetComplete = (exIdx: number, sIdx: number) => {
    const key = makeSetKey(todayISO, currentDay, exIdx, sIdx);
    const alreadyDone = !!activeProfile.completedSets[key];
    
    updateActiveProfile(prev => {
      const nextSets = { ...prev.completedSets, [key]: !alreadyDone };
      let nextWorkouts = prev.completedWorkouts || [];
      let lastActiveDate = prev.lastActiveDate || '';

      if (!alreadyDone && isWorkoutFullyComplete(nextSets)) {
        const hasToday = nextWorkouts.some((w) => w.date === todayISO);
        if (!hasToday) {
          nextWorkouts = [...nextWorkouts, { date: todayISO, dayName: currentDay }];
          lastActiveDate = todayISO;
        }
      }

      return {
        ...prev,
        completedSets: nextSets,
        completedWorkouts: nextWorkouts,
        lastActiveDate,
        streak: computeStreak(nextWorkouts)
      };
    });

    if (!alreadyDone) {
      triggerToast(`Set logged. Rest timer triggered!`);
      setTimerMax(90);
      setTimerRemaining(90);
      setTimerRunning(true);
    }
  };

  const activeProtocol = WARM_UPS[activeWorkout.tag] || { title: "", focus: "", routine: [] };
  const currentWarmups = activeProtocol.routine;

  return (
    <div className="space-y-6">
      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-4">
        <div className="flex justify-between items-center bg-ntc p-1 rounded-xl border border-ntc-border w-full overflow-x-auto no-scrollbar">
          {daysOfWeek.map((day) => {
            const isActive = currentDay === day;
            return (
              <button
                key={day}
                onClick={() => setCurrentDay(day)}
                className={`py-2.5 px-3 rounded-lg font-semibold text-xs flex-1 transition shrink-0 select-none text-center cursor-pointer ${
                  isActive 
                    ? 'bg-white text-black font-bold' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl overflow-hidden relative">
        <div className="h-24 bg-gradient-to-br from-zinc-800 to-ntc-elevated relative">
          <div className="absolute inset-0 bg-gradient-to-t from-ntc-elevated via-ntc-elevated/60 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <span className="text-xs font-semibold text-volt-500 uppercase tracking-wide">
              {activeWorkout.tag || "Rest"}
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              {activeWorkout.title}
            </h2>
          </div>
        </div>
        <div className="p-5 pt-3">
          <p className="text-sm text-zinc-400 pb-4 border-b border-ntc-border leading-relaxed">
            {activeWorkout.title === "Active Recovery" ? "Active recovery, hydration, and stretching." : "Strength and conditioning session."}
          </p>

          <div className="flex gap-4 mt-4 w-full justify-between sm:justify-start">
            <div className="bg-ntc border border-ntc-border px-4 py-2.5 rounded-xl text-center min-w-[90px]">
              <span className="text-[10px] font-medium text-zinc-500 block leading-none mb-1">Exercises</span>
              <span className="text-lg font-black text-white">{activeWorkout.exercises?.length || 0}</span>
            </div>
            <div className="bg-ntc border border-ntc-border px-4 py-2.5 rounded-xl text-center min-w-[90px]">
              <span className="text-[10px] font-medium text-zinc-500 block leading-none mb-1">Sets done</span>
              <span className="text-lg font-black text-volt-500">
                {Object.keys(activeProfile.completedSets || {}).filter(k => k.startsWith(setKeyPrefix)).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {currentWarmups.length > 0 && (
        <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5">
          <div 
            onClick={() => setIsWarmupOpen(!isWarmupOpen)}
            className="flex justify-between items-center cursor-pointer select-none border-b border-ntc-border pb-3"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-volt-500" />
              <h3 className="text-sm font-bold text-white">
                Warm-up
              </h3>
            </div>
            <button className="text-xs bg-ntc px-3 py-1 rounded-full border border-ntc-border text-zinc-400">
              {isWarmupOpen ? "Hide" : "Show"}
            </button>
          </div>

          <AnimatePresence>
            {isWarmupOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-2.5 overflow-hidden"
              >
                {currentWarmups.map((w, idx) => {
                  const checkKey = `${currentDay}-${idx}`;
                  const isChecked = !!checkedWarmups[checkKey];
                  return (
                    <div 
                      key={idx}
                      onClick={() => handleToggleWarmup(checkKey)}
                      className="flex items-center gap-3 bg-ntc p-3 rounded-xl border border-ntc-border hover:border-zinc-700 transition-all cursor-pointer"
                    >
                      <button
                        className={`h-6 w-6 rounded-md flex items-center justify-center border transition-all ${
                          isChecked 
                            ? 'bg-volt-500 border-volt-500 text-black' 
                            : 'border-zinc-700 bg-ntc-elevated'
                        }`}
                      >
                        {isChecked && <Check size={12} className="stroke-[3px]" />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold leading-tight ${isChecked ? 'line-through text-zinc-600' : 'text-zinc-100'}`}>
                          {w.name} <span className="text-xs text-zinc-500 ml-1">({w.duration})</span>
                        </p>
                        <p className={`text-xs ${isChecked ? 'line-through text-zinc-700' : 'text-zinc-400'} mt-0.5 leading-tight`}>
                          {w.cue}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="space-y-4">
        {activeWorkout.exercises && activeWorkout.exercises.length > 0 ? (
          activeWorkout.exercises.map((ex, exIdx) => {
            const exerciseSetCompletes = Array.from({ length: ex.sets }).map((_, sIdx) => {
              const setKey = makeSetKey(todayISO, currentDay, exIdx, sIdx);
              return !!activeProfile.completedSets[setKey];
            });

            return (
              <div key={exIdx} className="bg-ntc-elevated border border-ntc-border rounded-2xl overflow-hidden hover:border-zinc-700 transition relative">
                <div className="h-16 bg-gradient-to-r from-zinc-800/80 to-ntc-elevated" />
                <div className="p-5 -mt-8 relative">
                <div className="flex justify-between items-start border-b border-ntc-border pb-3 mb-4">
                  <div>
                    <h4 className="text-lg font-black text-white tracking-tight">{ex.name}</h4>
                    <span className="text-xs text-zinc-500 mt-0.5 block">
                      {ex.category}
                    </span>
                  </div>
                  <button
                    onClick={() => setCuesModalState({ isOpen: true, exerciseName: ex.name, category: ex.category })}
                    className="p-2 rounded-full bg-ntc hover:bg-zinc-900 text-zinc-400 hover:text-white border border-ntc-border transition-all cursor-pointer flex items-center justify-center gap-1 text-xs font-semibold"
                  >
                    <Info size={14} /> Cues
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-ntc-border mb-4 items-center">
                  <div>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide leading-none mb-1">Target</p>
                    <p className="text-sm font-bold text-white">{ex.sets} sets × {ex.spec}</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {ex.bodyweight ? (
                      <div className="w-full flex flex-col justify-center text-right">
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide leading-none mb-1 text-right">Load</p>
                        <p className="text-sm font-bold text-zinc-400">Bodyweight</p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide leading-none mb-1 text-right">Weight (lbs)</p>
                        <div 
                          onClick={() => {
                            setNumpadValue(activeProfile.savedWeights[ex.name] || "");
                            setNumpadOpenFor(ex.name);
                          }}
                          className="w-full bg-ntc border border-ntc-border rounded-xl px-3 py-2 text-sm text-right text-white cursor-pointer min-h-[38px] flex items-center justify-end"
                        >
                          {activeProfile.savedWeights[ex.name] ? (
                            <span className="font-bold">{activeProfile.savedWeights[ex.name]} lbs</span>
                          ) : (
                            <span className="text-zinc-600">Tap to log</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide leading-none mb-3">Sets</p>
                  <div className="flex flex-wrap gap-3">
                    {Array.from({ length: ex.sets }).map((_, sIdx) => {
                      const setKey = makeSetKey(todayISO, currentDay, exIdx, sIdx);
                      const isSetDone = !!activeProfile.completedSets[setKey];
                      
                      const strokeDash = 2 * Math.PI * 18;
                      const offsetDash = isSetDone ? 0 : strokeDash * 0.9;

                      return (
                        <button
                          key={sIdx}
                          onClick={() => handleToggleSetComplete(exIdx, sIdx)}
                          className="relative h-11 w-11 flex items-center justify-center rounded-full bg-ntc hover:bg-zinc-900 text-zinc-400 hover:text-white font-bold text-xs transition-all cursor-pointer select-none border border-ntc-border"
                        >
                          <svg className="absolute inset-0 h-11 w-11 -rotate-90">
                            <circle 
                              cx="22" 
                              cy="22" 
                              r="18" 
                              fill="transparent" 
                              stroke={isSetDone ? "#CDF500" : "#333333"} 
                              strokeWidth="2.5"
                              strokeDasharray={strokeDash}
                              strokeDashoffset={offsetDash}
                              className="transition-all duration-500"
                            />
                          </svg>
                          <span className={isSetDone ? "text-volt-500 font-bold relative z-10" : "relative z-10"}>
                            {isSetDone ? "✓" : sIdx + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-8 text-center text-zinc-500">
            <span className="text-sm font-bold block text-zinc-400">Rest day</span>
            <span className="text-sm mt-1 block">Recovery and mobility.</span>
          </div>
        )}
      </div>

      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5 relative overflow-hidden">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2 border-b border-ntc-border pb-3">
          <Flame size={14} className="text-volt-500" /> Breathing rhythm
        </h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          Sync your breathing with rhythmic audio during lifts or rest.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 w-full bg-ntc border border-ntc-border p-3 rounded-xl flex justify-between items-center">
            <span className="text-xs text-zinc-400 font-medium">Tempo</span>
            <div className="flex gap-1">
              {['focus', 'combat', 'chill'].map((track) => (
                <button
                  key={track}
                  onClick={() => setSynthTrack(track)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition cursor-pointer ${
                    synthTrack === track 
                      ? 'bg-white text-black' 
                      : 'bg-ntc-elevated text-zinc-500 hover:text-white'
                  }`}
                >
                  {track}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => {
              if (isSynthRunning) {
                handleStopSynthAudio();
              } else {
                handleInitSynthAudio();
              }
            }}
            className={`w-full sm:w-auto h-11 px-5 rounded-full font-bold text-sm transition flex items-center justify-center gap-1.5 cursor-pointer ${
              isSynthRunning 
                ? 'bg-zinc-800 text-white' 
                : 'bg-white text-black hover:bg-zinc-100'
            }`}
          >
            {isSynthRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isSynthRunning ? "Stop" : "Play"}
          </button>
        </div>
      </div>

      <NumpadBottomSheet 
        isOpen={numpadOpenFor !== null}
        onClose={() => setNumpadOpenFor(null)}
        title={numpadOpenFor || "LOG WEIGHT"}
        value={numpadValue}
        onValueChange={setNumpadValue}
        onSave={() => {
          if (numpadOpenFor) {
            updateActiveProfile(prev => ({
              ...prev,
              savedWeights: {
                ...prev.savedWeights,
                [numpadOpenFor]: numpadValue
              }
            }));
          }
        }}
      />
    </div>
  );
}
/* --- End of WorkoutScreen.tsx --- */
