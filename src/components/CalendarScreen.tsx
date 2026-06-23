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
      triggerToast(`Day ${dayIdx + 1} logged!`);
    } else {
      triggerToast(`Day ${dayIdx + 1} cleared.`);
    }
  };

  const currentMonthCompletesCount = completedWorkouts.length;
  const consistencyRate = Math.round((currentMonthCompletesCount / totalDays) * 100);

  return (
    <div className="space-y-6">
      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5">
        <div className="flex items-center gap-3 border-b border-ntc-border pb-4 mb-4">
          <div className="p-2 bg-ntc rounded-xl text-volt-500">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Consistency
            </h3>
            <p className="text-xl font-black text-white tracking-tight">
              Training calendar
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-ntc border border-ntc-border p-4 rounded-xl text-center">
            <span className="text-xs text-zinc-500 block">Days logged</span>
            <span className="text-3xl font-black text-white block mt-1">{currentMonthCompletesCount} <span className="text-sm font-medium text-zinc-500">/ {totalDays}</span></span>
          </div>

          <div className="bg-ntc border border-ntc-border p-4 rounded-xl text-center">
            <span className="text-xs text-zinc-500 block">Consistency</span>
            <span className="text-3xl font-black text-volt-500 block mt-1">{consistencyRate}%</span>
          </div>
        </div>
      </div>

      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5">
        <p className="text-sm text-zinc-500 mb-4 text-center">
          Tap days to log workouts
        </p>
        
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 justify-center items-center">
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayDateKey = `day-${idx}`;
            const isCompleted = completedWorkouts.some(cw => cw.date === dayDateKey);
            const isRestCycle = (idx + 1) % 7 === 0;

            return (
              <button
                key={idx}
                onClick={() => handleToggleDay(idx)}
                className={`h-11 w-full rounded-xl flex flex-col justify-center items-center border transition-all cursor-pointer relative select-none ${
                  isCompleted 
                    ? 'bg-volt-500/10 border-volt-500 text-volt-500 font-bold' 
                    : isRestCycle 
                      ? 'bg-ntc border-ntc-border text-zinc-500'
                      : 'bg-ntc border-ntc-border text-zinc-500 hover:border-zinc-600'
                }`}
              >
                <span className="text-sm font-bold leading-none">{idx + 1}</span>
              </button>
            );
          })}
        </div>
        
        <div className="flex gap-6 items-center justify-center mt-5 pt-4 border-t border-ntc-border text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-volt-500/10 border border-volt-500 rounded" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-ntc border border-ntc-border rounded" />
            <span>Rest / open</span>
          </div>
        </div>
      </div>

      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5 flex gap-3 text-zinc-400 items-start">
        <Trophy size={18} className="text-volt-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-white">Stay consistent</p>
          <p className="text-sm leading-relaxed text-zinc-400">
            Excellence is a habit. Show up, log your work, and build momentum one day at a time.
          </p>
        </div>
      </div>
    </div>
  );
}
/* --- End of CalendarScreen.tsx --- */
