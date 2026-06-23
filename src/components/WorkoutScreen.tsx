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
    const key = `${currentDay}-${exIdx}-${sIdx}`;
    const alreadyDone = !!activeProfile.completedSets[key];
    const exercise = activeWorkout.exercises[exIdx];
    
    updateActiveProfile(prev => {
      const nextSets = { ...prev.completedSets, [key]: !alreadyDone };
      
      return {
        ...prev,
        completedSets: nextSets
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
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-4 shadow-xl">
        <p className="text-[9px] font-black tracking-widest text-zinc-500 font-mono uppercase mb-3 text-center">
          ATHLETIC SCHEDULE DAY SWITCHER
        </p>
        <div className="flex justify-between items-center bg-black/40 p-1 rounded-2xl border border-zinc-900 w-full overflow-x-auto no-scrollbar">
          {daysOfWeek.map((day) => {
            const isActive = currentDay === day;
            return (
              <button
                key={day}
                onClick={() => setCurrentDay(day)}
                className={`py-2.5 px-3 rounded-xl font-bold tracking-tight text-xs flex-1 transition shrink-0 select-none text-center cursor-pointer ${
                  isActive 
                    ? 'bg-amber-500 text-black font-black shadow-md' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                {day.toUpperCase().slice(0, 3)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
          <Dumbbell size={80} className="text-amber-500 select-none" />
        </div>
        <div>
          <span className="text-[10px] font-black tracking-widest font-mono text-amber-500 uppercase bg-amber-500/10 px-2.5 py-1 rounded">
            {activeWorkout.tag || "REST"}
          </span>
          <h2 className="text-2xl font-black text-white italic tracking-tight font-mono uppercase mt-1">
            {activeWorkout.title}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 pb-3 border-b border-zinc-900 leading-relaxed font-mono">
            {activeWorkout.title === "Active Recovery" ? "Active muscle preservation, hydration, and active stretching." : "Dojo athletic strength conditioning."}
          </p>
        </div>

        <div className="flex gap-4 mt-4 w-full justify-between sm:justify-start">
          <div className="bg-zinc-900/40 border border-zinc-850 px-3 py-2 rounded-xl text-center min-w-[90px]">
            <span className="text-[8px] font-bold text-zinc-500 block font-mono uppercase leading-none mb-1">TOTAL Lifts</span>
            <span className="text-base font-black text-white font-mono">{activeWorkout.exercises?.length || 0}</span>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-850 px-3 py-2 rounded-xl text-center min-w-[90px]">
            <span className="text-[8px] font-bold text-zinc-500 block font-mono uppercase leading-none mb-1">COMPLETED SETS</span>
            <span className="text-base font-black text-amber-500 font-mono">
              {Object.keys(activeProfile.completedSets || {}).filter(k => k.startsWith(currentDay)).length}
            </span>
          </div>
        </div>
      </div>

      {currentWarmups.length > 0 && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-inner">
          <div 
            onClick={() => setIsWarmupOpen(!isWarmupOpen)}
            className="flex justify-between items-center cursor-pointer select-none border-b border-zinc-900 pb-3"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest font-mono">
                Wrestling & Mobility Warmups
              </h3>
            </div>
            <button className="text-[10px] bg-zinc-900 px-2 py-1 rounded border border-zinc-850 font-mono text-zinc-400 uppercase">
              {isWarmupOpen ? "Collapse" : "Open"}
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
                      className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-850/50 hover:bg-zinc-900 transition-all cursor-pointer"
                    >
                      <button
                        className={`h-6 w-6 rounded-lg flex items-center justify-center border transition-all ${
                          isChecked 
                            ? 'bg-amber-500 border-amber-500 text-black shadow-md' 
                            : 'border-zinc-805 bg-black/40 hover:border-zinc-650'
                        }`}
                      >
                        {isChecked && <Check size={12} className="stroke-[3.5px]" />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-xs font-bold leading-tight ${isChecked ? 'line-through text-zinc-555' : 'text-zinc-100'}`}>
                          {w.name} <span className="text-[10px] text-zinc-555 font-mono ml-1">({w.duration})</span>
                        </p>
                        <p className={`text-[10px] ${isChecked ? 'line-through text-zinc-650' : 'text-zinc-400'} mt-0.5 leading-tight font-medium`}>
                          Cue: {w.cue}
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
              const setKey = `${currentDay}-${exIdx}-${sIdx}`;
              return !!activeProfile.completedSets[setKey];
            });
            const setsCompletedCount = exerciseSetCompletes.filter(c => c).length;

            return (
              <div key={exIdx} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-xl hover:border-zinc-850 transition relative overflow-hidden">
                <div className="flex justify-between items-start border-b border-zinc-900 pb-3 mb-4">
                  <div>
                    <h4 className="text-base font-black italic text-white uppercase tracking-tight font-mono">{ex.name}</h4>
                    <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                      MUSCLES: <span className="text-amber-500">{ex.category.toUpperCase()} GROUP</span> • TYPE: {ex.category.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => setCuesModalState({ isOpen: true, exerciseName: ex.name, category: ex.category })}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 hover:text-white text-zinc-400 border border-zinc-850/80 transition-all cursor-pointer flex items-center justify-center gap-1 text-[9px] font-mono font-black tracking-tight"
                  >
                    <Info size={12} /> Cues
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-900/60 mb-4 items-center">
                  <div>
                    <p className="text-[8px] font-bold text-zinc-500 font-mono uppercase tracking-widest leading-none mb-1">Target Intensity</p>
                    <p className="text-xs font-black text-white font-mono uppercase">{ex.sets} Sets x {ex.spec}</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {ex.bodyweight ? (
                      <div className="w-full flex flex-col justify-center text-right">
                        <p className="text-[8px] font-bold text-zinc-500 font-mono uppercase tracking-widest leading-none mb-1 text-right">Load Type</p>
                        <p className="text-xs font-black text-zinc-400 font-mono uppercase">Bodyweight Only</p>
                      </div>
                    ) : (
                      <div className="w-full">
                        <p className="text-[8px] font-bold text-zinc-500 font-mono uppercase tracking-widest leading-none mb-1 text-right">Lifting Load (lbs)</p>
                        <div 
                          onClick={() => {
                            setNumpadValue(activeProfile.savedWeights[ex.name] || "");
                            setNumpadOpenFor(ex.name);
                          }}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-right font-mono text-amber-500 cursor-pointer min-h-[34px] flex items-center justify-end"
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
                  <p className="text-[8px] font-bold text-zinc-510 font-mono uppercase tracking-widest leading-none mb-3">Athletic Sets Checklist</p>
                  <div className="flex flex-wrap gap-3.5">
                    {Array.from({ length: ex.sets }).map((_, sIdx) => {
                      const setKey = `${currentDay}-${exIdx}-${sIdx}`;
                      const isSetDone = !!activeProfile.completedSets[setKey];
                      
                      const strokeDash = 2 * Math.PI * 18;
                      const offsetDash = isSetDone ? 0 : strokeDash * 0.9;

                      return (
                        <button
                          key={sIdx}
                          onClick={() => handleToggleSetComplete(exIdx, sIdx)}
                          className="relative h-11 w-11 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-855 text-zinc-400 hover:text-white font-black text-[10px] font-mono tracking-tight shadow transition-all cursor-pointer uppercase select-none border border-transparent"
                        >
                          <svg className="absolute inset-0 h-11 w-11 -rotate-90">
                            <circle 
                              cx="22" 
                              cy="22" 
                              r="18" 
                              fill="transparent" 
                              stroke={isSetDone ? "#00f0ff" : "#1b1b22"} 
                              strokeWidth="2.5"
                              strokeDasharray={strokeDash}
                              strokeDashoffset={offsetDash}
                              className="transition-all duration-500"
                            />
                          </svg>
                          <span className={isSetDone ? "text-amber-500 font-black relative z-10" : "relative z-10"}>
                            {isSetDone ? "✓" : `S${sIdx + 1}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 text-center text-zinc-500 shadow-inner">
            <span className="text-sm font-black uppercase font-mono tracking-widest block text-zinc-400">NO DRILLS COMPILED</span>
            <span className="text-xs mt-1 block">Enjoy your active muscles preservation and restore energy!</span>
          </div>
        )}
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-inner relative overflow-hidden group">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2 font-mono border-b border-zinc-900 pb-2">
          <Flame size={14} className="text-amber-500" /> Platform Breathing Synth
        </h3>
        <p className="text-[11px] text-zinc-510 leading-relaxed mb-4">
          Enable the vocalizing beat system to synchronize diaphragmatic core breathing loops (Inhale 4s, Hold 4s, Exhale 4s) during lifts or rest.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 w-full bg-black/40 border border-zinc-900 p-3 rounded-xl flex justify-between items-center">
            <span className="text-xs font-mono text-zinc-400 font-bold">RHYTHMIC TEMPO</span>
            <div className="flex gap-1">
              {['focus', 'combat', 'chill'].map((track) => (
                <button
                  key={track}
                  onClick={() => setSynthTrack(track)}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono tracking-widest uppercase font-black transition cursor-pointer ${
                    synthTrack === track 
                      ? 'bg-amber-500 text-black' 
                      : 'bg-zinc-905 hover:bg-zinc-800 text-zinc-500'
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
            className={`w-full sm:w-auto h-11 px-5 rounded-xl uppercase font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
              isSynthRunning 
                ? 'bg-rose-500 border border-transparent text-white' 
                : 'bg-amber-500 border border-transparent text-black font-black hover:bg-amber-400'
            }`}
          >
            {isSynthRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            {isSynthRunning ? "Mute synth" : "Activate Synth Audio"}
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
