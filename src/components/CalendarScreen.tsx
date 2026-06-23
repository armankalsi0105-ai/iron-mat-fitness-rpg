/*
Author: AI Coding Assistant
OS support: Linux, macOS, Windows
Description: Calendaring and consistency metrics tracker for student athletes with interactive logging grid
*/
import React from 'react';
import { Calendar, Trophy } from 'lucide-react';
import { AthleteProfile } from '../types';

interface CalendarScreenProps {
  activeProfile: AthleteProfile;
  updateActiveProfile: (updater: (prev: AthleteProfile) => AthleteProfile) => void;
  triggerToast: (msg: string) => void;
}

export default function CalendarScreen({
  activeProfile,
  updateActiveProfile,
  triggerToast
}: CalendarScreenProps) {
  
  const totalDays = 28;
  const completedWorkouts = activeProfile.completedWorkouts || [];

  const handleToggleDay = (dayIdx: number) => {
    const dayDateKey = `day-${dayIdx}`;
    const isAlreadyCompleted = completedWorkouts.some(cw => cw.date === dayDateKey);

    updateActiveProfile(prev => {
      const currentVal = prev.completedWorkouts || [];
      let nextVal = [...currentVal];

      if (isAlreadyCompleted) {
        nextVal = nextVal.filter(d => d.date !== dayDateKey);
      } else {
        nextVal.push({
          date: dayDateKey,
          dayName: `Day ${dayIdx + 1}`,
          count: 1
        });
      }

      let currentStreak = prev.streak || 0;
      if (!isAlreadyCompleted) {
        currentStreak += 1;
      } else {
        currentStreak = Math.max(0, currentStreak - 1);
      }

      return {
        ...prev,
        completedWorkouts: nextVal,
        streak: currentStreak
      };
    });

    if (!isAlreadyCompleted) {
      triggerToast(`Day ${dayIdx + 1} logged as training success!`);
    } else {
      triggerToast(`Day ${dayIdx + 1} log cleared.`);
    }
  };

  const currentMonthCompletesCount = completedWorkouts.length;
  const consistencyRate = Math.round((currentMonthCompletesCount / totalDays) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-inner">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
          <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
            <Calendar size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest font-mono italic">
              Consistency Monitor
            </h3>
            <p className="text-sm font-black text-white italic tracking-tight font-mono uppercase">
              ATHLETIC CALENDAR
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 border border-zinc-900 p-4 rounded-xl text-center">
            <span className="text-[8px] font-bold text-zinc-500 font-mono block uppercase">TRAINING DAYS LOGGED</span>
            <span className="text-3xl font-mono font-black text-white block mt-1">{currentMonthCompletesCount} <span className="text-xs font-bold text-zinc-500">/ {totalDays}</span></span>
          </div>

          <div className="bg-black/30 border border-zinc-900 p-4 rounded-xl text-center">
            <span className="text-[8px] font-bold text-zinc-500 font-mono block uppercase">CONSISTENCY RATE</span>
            <span className="text-3xl font-mono font-black text-amber-500 block mt-1">{consistencyRate}%</span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-2xl">
        <p className="text-[10px] font-black tracking-widest text-zinc-600 font-mono uppercase mb-4 text-center">
          Tap days to log your completed workouts
        </p>
        
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 justify-center items-center">
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayDateKey = `day-${idx}`;
            const isCompleted = completedWorkouts.some(cw => cw.date === dayDateKey);
            const isRestCycle = (idx + 1) % 7 === 0;

            return (
              <button
                key={idx}
                onClick={() => handleToggleDay(idx)}
                className={`h-11 w-full rounded-2xl flex flex-col justify-center items-center border transition-all cursor-pointer relative group select-none ${
                  isCompleted 
                    ? 'bg-emerald-555/20 border-emerald-500 text-emerald-400 font-black shadow-md' 
                    : isRestCycle 
                      ? 'bg-amber-500/5 border-amber-500/20 text-amber-500 font-bold'
                      : 'bg-zinc-900/40 border-zinc-850 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <span className="text-xs font-mono font-bold leading-none">{idx + 1}</span>
                <span className="text-[6px] font-mono tracking-widest uppercase font-black opacity-60 leading-none mt-1">
                  {isCompleted ? 'WORK' : isRestCycle ? 'REST' : 'LOG'}
                </span>
              </button>
            );
          })}
        </div>
        
        <div className="flex gap-4 items-center justify-center mt-5 pt-4 border-t border-zinc-900 text-[10px] font-mono text-zinc-500 uppercase font-black tracking-wider border-transparent">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 bg-emerald-500/20 border border-emerald-500 rounded" />
            <span>Success Drill</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 bg-amber-500/5 border border-amber-500/20 rounded" />
            <span>Active Rest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 bg-zinc-900/40 border border-zinc-850 rounded" />
            <span>No Log</span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-4 flex gap-3 text-zinc-400 items-start">
        <Trophy size={18} className="text-amber-500 shrink-0 mt-0.5 animate-bounce" />
        <div className="space-y-1">
          <p className="text-[10px] font-black text-zinc-300 font-mono uppercase tracking-wider leading-none">Championship Protocol</p>
          <p className="text-[10px] leading-relaxed">
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit." Consistency is the lock that holds strength gains together. Do not miss twice!
          </p>
        </div>
      </div>
    </div>
  );
}
/* --- End of CalendarScreen.tsx --- */
