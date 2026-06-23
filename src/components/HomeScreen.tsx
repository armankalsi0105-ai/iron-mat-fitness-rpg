import React, { useMemo } from 'react';
import { Play, Flame, ChevronRight, ActivitySquare, TrendingUp } from 'lucide-react';
import { AthleteProfile, WorkoutDay } from '../types';

interface HomeScreenProps {
  currentDay: string;
  todayWorkout: WorkoutDay;
  setActiveTab: (tab: 'home' | 'workout' | 'progress' | 'calendar' | 'profile') => void;
  activeProfile: AthleteProfile;
  triggerToast: (msg: string) => void;
  updateActiveProfile: (updater: (prev: AthleteProfile) => AthleteProfile) => void;
}

export default function HomeScreen({ 
  currentDay, 
  todayWorkout, 
  setActiveTab,
  activeProfile
}: HomeScreenProps) {
  const exercisesCount = todayWorkout.exercises.length;
  const estTime = exercisesCount * 6; // roughly 6 mins per exercise

  const hasCompletedWorkout = activeProfile.completedWorkouts && activeProfile.completedWorkouts.length > 0;

  // Simple weekly volume or workout count
  const weeklyWorkouts = useMemo(() => {
    if (!activeProfile.completedWorkouts) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return activeProfile.completedWorkouts.filter(w => new Date(w.date) >= oneWeekAgo).length;
  }, [activeProfile.completedWorkouts]);

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER / GREETING */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight font-sans uppercase">
              {activeProfile.name !== "NEW ATHLETE" ? `HI, ${activeProfile.name}` : "WELCOME"}
            </h1>
            <p className="text-zinc-400 text-xs mt-1 font-mono uppercase tracking-wider">
              {activeProfile.sport ? `${activeProfile.sport} Athlete` : "General Strength"}
            </p>
          </div>
          <div className="text-right">
             <span className="text-sm font-black text-amber-500 font-mono flex items-center justify-end gap-1 border border-zinc-800 bg-zinc-900 rounded-lg px-2 py-1">
               <Flame size={14} className="fill-current text-orange-500" />
               {(activeProfile.streak || 0)} DAY STREAK
             </span>
          </div>
        </div>
      </div>

      {/* TODAY'S WORKOUT */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-amber-500 font-mono uppercase bg-amber-500/10 px-2.5 py-1 rounded-md">
              TODAY'S PROTOCOL • {currentDay}
            </span>
            <h2 className="text-2xl font-black text-white italic tracking-tight font-sans uppercase mt-2 leading-tight">
              {todayWorkout.title}
            </h2>
            <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase mt-1">
              {exercisesCount} Exercises • ~{estTime} Mins
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setActiveTab('workout')}
          className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-sm rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] hover:-translate-y-1 active:scale-95 transition-all"
        >
          <Play size={18} fill="currentColor" /> {hasCompletedWorkout ? "START WORKOUT" : "BEGIN FIRST WORKOUT"}
        </button>
      </div>

      {/* DASHBOARD STATS */}
      {hasCompletedWorkout ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ActivitySquare size={16} className="text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-widest">Last 7 Days</span>
            </div>
            <p className="text-3xl font-black text-white font-mono uppercase">{weeklyWorkouts}</p>
            <p className="text-[10px] text-zinc-500 font-mono uppercase mt-1 tracking-wider">Workouts Logged</p>
          </div>

          <div 
            className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 flex flex-col justify-between shadow-sm cursor-pointer hover:border-zinc-800 transition-colors"
            onClick={() => setActiveTab('progress')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-widest">Records</span>
              </div>
              <ChevronRight size={14} className="text-zinc-600" />
            </div>
            <p className="text-3xl font-black text-amber-500 font-mono uppercase">
              {Object.keys(activeProfile.personalBests || {}).length}
            </p>
            <p className="text-[10px] text-zinc-500 font-mono uppercase mt-1 tracking-wider">PRs Set All-Time</p>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 text-center flex flex-col items-center justify-center border-dashed">
          <span className="bg-zinc-900 p-3 rounded-full mb-3 text-zinc-500">
            <ActivitySquare size={24} />
          </span>
          <h3 className="text-zinc-300 font-black font-sans uppercase text-sm">NO DATA YET</h3>
          <p className="text-xs text-zinc-500 mt-2 font-mono max-w-[200px] leading-relaxed">Complete your first workout to start tracking your athletic progression.</p>
        </div>
      )}

      {/* CURRENT GOALS */}
      {activeProfile.goals && activeProfile.goals.trim() !== "" && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-sm">
           <h3 className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-widest mb-1.5">Current Focus</h3>
           <p className="text-sm font-medium text-white italic tracking-wide">"{activeProfile.goals}"</p>
        </div>
      )}
      
      {/* EQUIPMENT PROFILE */}
      {activeProfile.equipment && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-sm">
           <h3 className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-widest mb-1.5">Equipment Access</h3>
           <p className="text-sm font-medium text-white font-mono uppercase tracking-wide">{activeProfile.equipment}</p>
        </div>
      )}
    </div>
  );
}
