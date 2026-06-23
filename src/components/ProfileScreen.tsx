/*
Author: AI Coding Assistant
OS support: Linux, macOS, Windows
Description: Biometrics, goals, units, and profile preferences editor screen for IronPath
*/
import React, { useState, useEffect } from 'react';
import { 
  User, Sparkles, Check, Moon, Settings, Database
} from 'lucide-react';
import { AthleteProfile } from '../types';

interface ProfileScreenProps {
  activeProfile: AthleteProfile;
  updateActiveProfile: (updater: (prev: AthleteProfile) => AthleteProfile) => void;
  triggerToast: (msg: string) => void;
  setAvatarModalOpen: (val: boolean) => void;
}

export default function ProfileScreen({
  activeProfile,
  updateActiveProfile,
  triggerToast,
  setAvatarModalOpen
}: ProfileScreenProps) {
  
  const [name, setName] = useState(activeProfile.name);
  const [age, setAge] = useState(activeProfile.age || 0);
  const [height, setHeight] = useState(activeProfile.height || "");
  const [weight, setWeight] = useState(activeProfile.weight || 0);
  const [sport, setSport] = useState(activeProfile.sport || "Athlete");
  const [goals, setGoals] = useState(activeProfile.goals || "");
  const [lbsUnit, setLbsUnit] = useState(true);

  useEffect(() => {
    setName(activeProfile.name);
    setAge(activeProfile.age || 0);
    setHeight(activeProfile.height || "");
    setWeight(activeProfile.weight || 0);
    setSport(activeProfile.sport || "Athlete");
    setGoals(activeProfile.goals || "");
  }, [activeProfile.id, activeProfile.name, activeProfile.age, activeProfile.height, activeProfile.weight, activeProfile.sport, activeProfile.goals]);

  const handleUpdateAthleteProfile = () => {
    if (!name.trim()) {
      triggerToast("Name cannot be blank.");
      return;
    }
    
    updateActiveProfile(prev => ({
      ...prev,
      name: name.trim().toUpperCase(),
      age: Number(age) || 0,
      height: height.trim(),
      weight: Number(weight) || 0,
      sport: sport,
      goals: goals.trim()
    }));
    triggerToast("Profile saved.");
  };

  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProfile, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ironpath_backup_${activeProfile.name.toLowerCase()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast("Backup exported.");
    } catch (e) {
      triggerToast("Export failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-center gap-3 border-b border-ntc-border pb-4 mb-5">
          <div className="p-2 bg-ntc rounded-xl text-volt-500">
            <User size={18} />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
              Profile
            </h3>
            <p className="text-xl font-black text-white tracking-tight">
              Your details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-ntc border border-ntc-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-volt-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Sport</label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full bg-ntc border border-ntc-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-volt-500/50 h-10"
            >
              <option value="Wrestling">Wrestling</option>
              <option value="Football">Football</option>
              <option value="Track">Track</option>
              <option value="General Strength">General strength</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Age</label>
            <input 
              type="number"
              value={age || ""}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              className="w-full bg-ntc border border-ntc-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-volt-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Height</label>
            <input 
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 5ft 9in"
              className="w-full bg-ntc border border-ntc-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-volt-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Weight ({lbsUnit ? 'lbs' : 'kg'})</label>
            <input 
              type="number"
              value={weight || ""}
              onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
              className="w-full bg-ntc border border-ntc-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-volt-500/50"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-zinc-500">Goals</label>
            <textarea 
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
              placeholder="What are you training for?"
              className="w-full bg-ntc border border-ntc-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-volt-500/50 resize-none leading-relaxed"
            />
          </div>
        </div>

        <button
          onClick={handleUpdateAthleteProfile}
          className="mt-5 w-full py-3.5 bg-white hover:bg-zinc-100 text-black font-bold text-sm rounded-full flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Check size={16} strokeWidth={3} /> Save profile
        </button>
      </div>

      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-volt-500 uppercase tracking-wide">
            Avatar
          </span>
          <h3 className="text-base font-bold text-white mt-1">Generate avatar</h3>
          <p className="text-sm text-zinc-500 mt-1">Create a custom athletic avatar with AI.</p>
        </div>
        <button
          onClick={() => setAvatarModalOpen(true)}
          className="px-5 py-3 bg-ntc hover:bg-zinc-900 text-white font-bold text-sm rounded-full flex items-center gap-2 border border-ntc-border transition cursor-pointer shrink-0"
        >
          <Sparkles size={14} className="text-volt-500" /> Open creator
        </button>
      </div>

      <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-ntc-border pb-3">
          <Settings size={14} className="text-volt-500" /> Preferences
        </h3>

        <div className="divide-y divide-ntc-border space-y-4">
          <div className="flex justify-between items-center pb-4">
            <div>
              <p className="text-sm font-semibold text-white">Weight units</p>
              <p className="text-xs text-zinc-500">Display pounds or kilograms</p>
            </div>
            
            <div className="flex gap-1 bg-ntc p-1 rounded-full border border-ntc-border">
              <button
                onClick={() => {
                  setLbsUnit(true);
                  triggerToast("Units set to lbs");
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  lbsUnit ? 'bg-white text-black' : 'text-zinc-500'
                }`}
              >
                lbs
              </button>
              <button
                onClick={() => {
                  setLbsUnit(false);
                  triggerToast("Units set to kg");
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  !lbsUnit ? 'bg-white text-black' : 'text-zinc-500'
                }`}
              >
                kg
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center py-4">
            <div>
              <p className="text-sm font-semibold text-white">Dark mode</p>
              <p className="text-xs text-zinc-500">Always on for training focus</p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-ntc border border-ntc-border px-3 py-1.5 rounded-full text-xs text-volt-500 font-semibold">
              <Moon size={12} /> On
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div>
              <p className="text-sm font-semibold text-white">Export data</p>
              <p className="text-xs text-zinc-500">Download your progress as JSON</p>
            </div>
            
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 bg-ntc hover:bg-zinc-900 text-zinc-300 font-semibold text-xs rounded-full transition border border-ntc-border cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Database size={12} /> Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
/* --- End of ProfileScreen.tsx --- */
