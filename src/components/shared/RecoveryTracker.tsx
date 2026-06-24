import React, { memo, useEffect, useState } from 'react';
import { Check, Heart } from 'lucide-react';
import { AthleteProfile, RecoveryLog } from '../../types';
import {
  computeRecoveryScore,
  getTodayRecovery,
  recoveryLabel,
} from '../../services/recoveryService';

interface RecoveryTrackerProps {
  profile: AthleteProfile;
  onSave: (data: Omit<RecoveryLog, 'date'>) => void;
}

function RecoveryTracker({ profile, onSave }: RecoveryTrackerProps) {
  const today = getTodayRecovery(profile);
  const [sleep, setSleep] = useState(today?.sleep ?? 7);
  const [water, setWater] = useState(today?.water ?? 6);
  const [energy, setEnergy] = useState(today?.energy ?? 7);
  const [soreness, setSoreness] = useState(today?.soreness ?? 4);
  const [stress, setStress] = useState(today?.stress ?? 4);
  const [savedToday, setSavedToday] = useState(!!today);

  useEffect(() => {
    const entry = getTodayRecovery(profile);
    setSleep(entry?.sleep ?? 7);
    setWater(entry?.water ?? 6);
    setEnergy(entry?.energy ?? 7);
    setSoreness(entry?.soreness ?? 4);
    setStress(entry?.stress ?? 4);
    setSavedToday(!!entry);
  }, [profile.id, profile.recoveryLogs]);

  const score = computeRecoveryScore({ date: '', sleep, water, energy, soreness, stress });

  const save = () => {
    onSave({ sleep, water, energy, soreness, stress });
    setSavedToday(true);
  };

  const sliders: { label: string; value: number; set: (v: number) => void; max: number; unit?: string }[] = [
    { label: 'Sleep', value: sleep, set: setSleep, max: 10, unit: 'hrs' },
    { label: 'Water', value: water, set: setWater, max: 12, unit: 'glasses' },
    { label: 'Energy', value: energy, set: setEnergy, max: 10 },
    { label: 'Soreness', value: soreness, set: setSoreness, max: 10 },
    { label: 'Stress', value: stress, set: setStress, max: 10 },
  ];

  return (
    <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-4">
      <div className="flex justify-between items-center mb-4 border-b border-ntc-border pb-3">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-volt-500" />
          <h3 className="text-sm font-bold text-white">Recovery</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-volt-500">{score}</span>
          <p className="text-[10px] text-zinc-500">{recoveryLabel(score)}</p>
        </div>
      </div>
      <div className="space-y-4">
        {sliders.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>{s.label}</span>
              <span className="text-volt-500 font-bold">
                {s.value}
                {s.unit ? ` ${s.unit}` : ''}
              </span>
            </div>
            <input
              type="range"
              min={s.label === 'Sleep' ? 4 : 1}
              max={s.max}
              value={s.value}
              onChange={(e) => {
                s.set(parseInt(e.target.value, 10));
                setSavedToday(false);
              }}
              className="w-full accent-volt-500 h-1 min-h-[44px]"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={save}
        className={`w-full mt-4 py-3 font-bold text-sm rounded-full min-h-[44px] flex items-center justify-center gap-2 ${
          savedToday ? 'bg-volt-500/20 text-volt-500 border border-volt-500/40' : 'bg-white text-black'
        }`}
      >
        {savedToday ? (
          <>
            <Check size={16} /> Logged for today
          </>
        ) : (
          'Log recovery'
        )}
      </button>
    </div>
  );
}

export default memo(RecoveryTracker);
