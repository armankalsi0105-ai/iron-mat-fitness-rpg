/*
Author: AI Coding Assistant
OS support: Linux, macOS, Windows
Description: Biometrics, goals, units, and profile preferences editor screen for IronPath
*/
import React, { useState } from 'react';
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

  const handleUpdateAthleteProfile = () => {
    if (!name.trim()) {
      triggerToast("Tag cannot be left blank!");
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
    triggerToast("Athlete registration metrics safely saved!");
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
      triggerToast("Athlete vault JSON export completed! Keep it safe.");
    } catch (e) {
      triggerToast("Export failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-5">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
            <User size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest font-mono italic">
              Athlete Registration Card
            </h3>
            <p className="text-sm font-black text-white italic tracking-tight font-mono uppercase">
              BIOMETRIC CONFIGURATION
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black tracking-widest text-zinc-500 font-mono uppercase">Athlete Name / Calltag</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black tracking-widest text-zinc-500 font-mono uppercase">Target Varsity Sport</label>
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50 h-9"
            >
              <option value="Wrestling">Wrestling (Mat Prep)</option>
              <option value="Football">Football VC Strength</option>
              <option value="Track">Track Athletics speed</option>
              <option value="General Strength">General Power Athlete</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black tracking-widest text-zinc-500 font-mono uppercase">Athlete Age (Safety Alert active)</label>
            <input 
              type="number"
              value={age || ""}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black tracking-widest text-zinc-500 font-mono uppercase">Biological Height</label>
            <input 
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 5ft 9in"
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black tracking-widest text-zinc-500 font-mono uppercase">Combat Target Weight ({lbsUnit ? 'lbs' : 'kg'})</label>
            <input 
              type="number"
              value={weight || ""}
              onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-[9px] font-black tracking-widest text-zinc-500 font-mono uppercase">Custom Athletic Focus Goals</label>
            <textarea 
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
              placeholder="Brief target description..."
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
            />
          </div>
        </div>

        <button
          onClick={handleUpdateAthleteProfile}
          className="mt-5 w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Check size={14} className="stroke-[3.5px]" /> Save Registration
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-inner flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[8px] font-black tracking-widest font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase">
            AI GENERATION SUITE
          </span>
          <h3 className="text-base font-black text-white italic tracking-tight font-mono mt-1 uppercase">Athlete Avatar Generator</h3>
          <p className="text-xs text-zinc-500 mt-1">Want a custom stylized wrestling/athletic avatar? Fire up our AI model.</p>
        </div>
        <button
          onClick={() => setAvatarModalOpen(true)}
          className="px-5 py-3 bg-zinc-900 hover:bg-zinc-850 text-amber-500 font-black uppercase text-xs rounded-xl flex items-center gap-2 border border-zinc-850 transition cursor-pointer shrink-0"
        >
          <Sparkles size={13} className="fill-current animate-pulse" /> Launch Avatar Creator
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-xl">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 font-mono border-b border-zinc-900 pb-2">
          <Settings size={14} className="text-amber-500" /> Platform Preferences
        </h3>

        <div className="divide-y divide-zinc-900 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <div>
              <p className="text-xs font-bold text-white font-mono">Weight standard units</p>
              <p className="text-[10px] text-zinc-500">Lbs and kgs units translation for exercises</p>
            </div>
            
            <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-zinc-900">
              <button
                onClick={() => {
                  setLbsUnit(true);
                  triggerToast("Units calibrated to Pounds [lbs]");
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold font-mono uppercase cursor-pointer ${
                  lbsUnit ? 'bg-amber-500 text-black font-black' : 'text-zinc-500'
                }`}
              >
                lbs
              </button>
              <button
                onClick={() => {
                  setLbsUnit(false);
                  triggerToast("Units calibrated to Kilograms [kg]");
                }}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold font-mono uppercase cursor-pointer ${
                  !lbsUnit ? 'bg-amber-500 text-black font-black' : 'text-zinc-500'
                }`}
              >
                kg
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center py-4">
            <div>
              <p className="text-xs font-bold text-white font-mono">IronPath High-Contrast Dark Mode</p>
              <p className="text-[10px] text-zinc-500">Lock high contrast dark mode for eye protection</p>
            </div>
            
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-xl text-[10px] text-amber-500 font-mono font-bold uppercase">
              <Moon size={11} className="fill-current animate-bounce" /> Dark Lock
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div>
              <p className="text-xs font-bold text-white font-mono">Dynamic local vault database exporter</p>
              <p className="text-[10px] text-zinc-500">Backup your reputation progress records offline</p>
            </div>
            
            <button
              onClick={handleExportBackup}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-black uppercase text-[10px] rounded-lg transition border border-zinc-850 cursor-pointer flex items-center gap-1 shrink-0 font-mono"
            >
              <Database size={11} /> Backup database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
/* --- End of ProfileScreen.tsx --- */
