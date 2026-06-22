import React, { useState, useMemo } from 'react';
import {
  User, Sparkles, Settings, Database, Moon, Shield, Award, Upload,
} from 'lucide-react';
import { CharacterProfile } from '../types';
import PremiumCard from './ui/PremiumCard';
import SectionHeader from './ui/SectionHeader';
import Button from './ui/Button';
import ScoreRing from './ui/ScoreRing';
import ProgressRing from './ui/ProgressRing';
import {
  computeWrestlingPerformanceScore,
  normalizeWrestlingPhase,
  WRESTLING_PHASES,
} from '../lib/athleteMetrics';

interface ProfileScreenProps {
  activeProfile: CharacterProfile;
  updateActiveProfile: (updater: (prev: CharacterProfile) => CharacterProfile) => void;
  triggerToast: (msg: string) => void;
  setAvatarModalOpen: (val: boolean) => void;
}

export default function ProfileScreen({
  activeProfile,
  updateActiveProfile,
  triggerToast,
  setAvatarModalOpen,
}: ProfileScreenProps) {
  const [name, setName] = useState(activeProfile.name);
  const [age, setAge] = useState(activeProfile.age || 16);
  const [height, setHeight] = useState(activeProfile.height || "5'9\"");
  const [weight, setWeight] = useState(activeProfile.weight || 145);
  const [sport, setSport] = useState(activeProfile.sport || 'Wrestling');
  const [goals, setGoals] = useState(activeProfile.goals || '');
  const [lbsUnit, setLbsUnit] = useState(true);

  const wrestlingScore = useMemo(
    () => computeWrestlingPerformanceScore(activeProfile),
    [activeProfile]
  );
  const phase = normalizeWrestlingPhase(activeProfile.wrestlingPhase);
  const xpPct = Math.min(100, (activeProfile.xp / activeProfile.xpToNext) * 100);

  const handleUpdateAthleteProfile = () => {
    if (!name.trim()) {
      triggerToast('Name cannot be blank.');
      return;
    }
    updateActiveProfile((prev) => ({
      ...prev,
      name: name.trim().toUpperCase(),
      age: Number(age) || 16,
      height: height.trim(),
      weight: Number(weight) || 145,
      sport,
      goals: goals.trim(),
      xp: (prev.xp || 0) + 10,
    }));
    triggerToast('Profile saved · +10 XP');
  };

  const handleExportBackup = () => {
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(activeProfile, null, 2));
      const anchor = document.createElement('a');
      anchor.href = dataStr;
      anchor.download = `ironpath_${activeProfile.name.toLowerCase()}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      triggerToast('Backup exported.');
    } catch {
      triggerToast('Export failed.');
    }
  };

  return (
    <div className="space-y-4 pb-4 tab-content-enter">
      {/* Hero profile card */}
      <PremiumCard variant="gradient" padding="lg" className="gradient-mesh-workout">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={activeProfile.avatarUrl}
              alt={activeProfile.name}
              className="w-20 h-20 rounded-2xl border-2 border-amber-500/30 object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-md">
              L{activeProfile.level}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-hero font-bold text-white truncate">{activeProfile.name}</h1>
            <p className="text-body text-zinc-400 mt-1">
              {sport} · {phase}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <ProgressRing value={xpPct} size={36} strokeWidth={3} color="#f59e0b" trackColor="rgba(255,255,255,0.1)">
                <span className="text-[9px] font-bold text-amber-400">{Math.round(xpPct)}%</span>
              </ProgressRing>
              <span className="text-[11px] text-zinc-500 tabular-nums">
                {activeProfile.xp}/{activeProfile.xpToNext} XP
              </span>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Wrestling performance */}
      <PremiumCard variant="glass" padding="md">
        <SectionHeader title="Wrestling Performance" subtitle="Signature athlete score" icon={Shield} className="mb-4" />
        <div className="flex items-center justify-around gap-4">
          <ScoreRing score={wrestlingScore} label="Overall" size={88} />
          <div className="flex-1 space-y-2 text-sm">
            {[
              ['Grip', activeProfile.gripRating || 5, 10],
              ['Conditioning', activeProfile.conditioningRating || 5, 10],
              ['Pull-ups', activeProfile.pullupsRating || 0, 25],
            ].map(([label, val, max]) => (
              <div key={String(label)}>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-0.5">
                  <span>{label}</span>
                  <span className="text-amber-400 tabular-nums">{val}/{max}</span>
                </div>
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((val as number) / (max as number)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {WRESTLING_PHASES.map((p) => (
            <span
              key={p}
              className={`text-[9px] font-bold uppercase px-2 py-1 rounded-lg ${
                phase === p ? 'bg-amber-500 text-black' : 'bg-white/[0.04] text-zinc-500'
              }`}
            >
              {p}
            </span>
          ))}
        </div>
      </PremiumCard>

      {/* Registration form */}
      <PremiumCard variant="default" padding="md">
        <SectionHeader title="Athlete Profile" subtitle="Biometrics & goals" icon={User} className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-caption font-semibold text-zinc-500 uppercase">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white min-h-[44px] focus:outline-none focus:border-amber-500/50"
            />
          </label>
          <label className="space-y-1">
            <span className="text-caption font-semibold text-zinc-500 uppercase">Sport</span>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white min-h-[44px] focus:outline-none focus:border-amber-500/50"
            >
              <option value="Wrestling">Wrestling</option>
              <option value="Football">Football</option>
              <option value="Track">Track</option>
              <option value="General Strength">General Strength</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-caption font-semibold text-zinc-500 uppercase">Age</span>
            <input
              type="number"
              min={10}
              max={25}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 16)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white min-h-[44px] focus:outline-none focus:border-amber-500/50"
            />
          </label>
          <label className="space-y-1">
            <span className="text-caption font-semibold text-zinc-500 uppercase">Height</span>
            <input
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white min-h-[44px] focus:outline-none focus:border-amber-500/50"
            />
          </label>
          <label className="space-y-1">
            <span className="text-caption font-semibold text-zinc-500 uppercase">
              Weight ({lbsUnit ? 'lbs' : 'kg'})
            </span>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value, 10) || 145)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white min-h-[44px] focus:outline-none focus:border-amber-500/50"
            />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-caption font-semibold text-zinc-500 uppercase">Goals</span>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
              className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-3 text-sm text-white resize-none focus:outline-none focus:border-amber-500/50"
            />
          </label>
        </div>
        <Button fullWidth className="mt-4" onClick={handleUpdateAthleteProfile}>
          Save Profile
        </Button>
      </PremiumCard>

      {/* Avatar */}
      <PremiumCard variant="elevated" padding="md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <SectionHeader
              title="Avatar Studio"
              subtitle="Upload or AI-generate your athlete look"
              icon={Sparkles}
              className="mb-0"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              icon={<Upload size={14} />}
              className="flex-1 sm:flex-none"
              onClick={() => setAvatarModalOpen(true)}
            >
              Upload / Edit
            </Button>
          </div>
        </div>
      </PremiumCard>

      {/* Settings */}
      <PremiumCard variant="default" padding="md">
        <SectionHeader title="Preferences" icon={Settings} className="mb-4" />
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-white">Weight units</p>
              <p className="text-[11px] text-zinc-500">Display preference</p>
            </div>
            <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
              {(['lbs', 'kg'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    setLbsUnit(u === 'lbs');
                    triggerToast(`Units: ${u}`);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold min-h-[44px] cursor-pointer ${
                    (u === 'lbs') === lbsUnit ? 'bg-amber-500 text-black' : 'text-zinc-500'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Moon size={16} className="text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-white">Dark mode</p>
                <p className="text-[11px] text-zinc-500">High contrast · always on</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-500 uppercase">Locked</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-zinc-400" />
              <div>
                <p className="text-sm font-semibold text-white">Export backup</p>
                <p className="text-[11px] text-zinc-500">Download JSON vault</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportBackup}>
              Export
            </Button>
          </div>
          {(activeProfile.achievements?.length || 0) > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] text-[11px] text-zinc-500">
              <Award size={14} className="text-amber-400" />
              {activeProfile.achievements?.length} achievements unlocked
            </div>
          )}
        </div>
      </PremiumCard>
    </div>
  );
}
