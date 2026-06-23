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
  const estTime = exercisesCount * 6;

  const hasCompletedWorkout = activeProfile.completedWorkouts && activeProfile.completedWorkouts.length > 0;

  const weeklyWorkouts = useMemo(() => {
    if (!activeProfile.completedWorkouts) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return activeProfile.completedWorkouts.filter(w => new Date(w.date) >= oneWeekAgo).length;
  }, [activeProfile.completedWorkouts]);

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER / GREETING */}
      <div className="pt-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {activeProfile.name !== "NEW ATHLETE" ? `Hi, ${activeProfile.name}` : "Welcome"}
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              {activeProfile.sport ? `${activeProfile.sport} athlete` : "General strength"}
            </p>
          </div>
          <div className="text-right">
             <span className="text-sm font-bold text-white flex items-center justify-end gap-1.5 bg-ntc-elevated border border-ntc-border rounded-full px-3 py-1.5">
               <Flame size={14} className="text-volt-500 fill-volt-500" />
               {activeProfile.streak || 0} day streak
             </span>
          </div>
        </div>
      </div>

      {/* TODAY'S WORKOUT */}
      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl overflow-hidden relative">
        <div className="h-32 bg-gradient-to-br from-zinc-800 to-ntc-elevated relative">
          <div className="absolute inset-0 bg-gradient-to-t from-ntc-elevated via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <span className="text-xs font-semibold text-volt-500 uppercase tracking-wide">
              Today · {currentDay}
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1 leading-tight">
              {todayWorkout.title}
            </h2>
          </div>
        </div>
        <div className="p-5 pt-3">
          <p className="text-sm text-zinc-400 mb-5">
            {exercisesCount} exercises · ~{estTime} min
          </p>
        
          <button
            onClick={() => setActiveTab('workout')}
            className="w-full py-4 bg-white hover:bg-zinc-100 text-black font-bold text-base rounded-full flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98]"
          >
            <Play size={18} fill="currentColor" /> {hasCompletedWorkout ? "Start workout" : "Begin first workout"}
          </button>
        </div>
      </div>

      {/* DASHBOARD STATS */}
      {hasCompletedWorkout ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <ActivitySquare size={16} className="text-zinc-500" />
              <span className="text-xs font-medium text-zinc-500">Last 7 days</span>
            </div>
            <p className="text-3xl font-black text-white">{weeklyWorkouts}</p>
            <p className="text-xs text-zinc-500 mt-1">Workouts logged</p>
          </div>

          <div 
            className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5 flex flex-col justify-between cursor-pointer hover:border-zinc-700 transition-colors"
            onClick={() => setActiveTab('progress')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-zinc-500" />
                <span className="text-xs font-medium text-zinc-500">Records</span>
              </div>
              <ChevronRight size={14} className="text-zinc-600" />
            </div>
            <p className="text-3xl font-black text-volt-500">
              {Object.keys(activeProfile.personalBests || {}).length}
            </p>
            <p className="text-xs text-zinc-500 mt-1">PRs all-time</p>
          </div>
        </div>
      ) : (
        <div className="bg-ntc-elevated border border-ntc-border border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <span className="bg-zinc-900 p-3 rounded-full mb-3 text-zinc-500">
            <ActivitySquare size={24} />
          </span>
          <h3 className="text-zinc-300 font-bold text-sm">No data yet</h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-[220px] leading-relaxed">Complete your first workout to start tracking progress.</p>
        </div>
      )}

      {/* CURRENT GOALS */}
      {activeProfile.goals && activeProfile.goals.trim() !== "" && (
        <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5">
           <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Current focus</h3>
           <p className="text-base font-medium text-white">"{activeProfile.goals}"</p>
        </div>
      )}
      
      {/* EQUIPMENT PROFILE */}
      {activeProfile.equipment && (
        <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5">
           <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Equipment</h3>
           <p className="text-base font-medium text-white">{activeProfile.equipment}</p>
        </div>
      )}
    </div>
  );
}
