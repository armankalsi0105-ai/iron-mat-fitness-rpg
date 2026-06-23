import React, { useState } from 'react';
import { AthleteProfile } from '../types';
import { ArrowRight, Dumbbell, User, Activity, Target } from 'lucide-react';

interface OnboardingScreenProps {
  updateActiveProfile: (updater: (prev: AthleteProfile) => AthleteProfile) => void;
}

export default function OnboardingScreen({ updateActiveProfile }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<'Strength' | 'Size' | 'Conditioning'>('Strength');
  const [equipment, setEquipment] = useState<'Full Gym' | 'Dumbbells Only' | 'Bodyweight'>('Full Gym');

  const handleComplete = () => {
    updateActiveProfile(prev => ({
      ...prev,
      name: name.trim() || 'ATHLETE',
      weight: parseFloat(weight) || 0,
      goals: goal,
      equipment: equipment
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between pt-16 pb-8 px-6 overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute -inset-10 bg-gradient-to-br from-amber-500/10 to-orange-650/5 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-md w-full mx-auto flex-1 flex flex-col">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3.5 bg-amber-500/10 rounded-2xl text-amber-500 mb-4 border border-amber-500/20">
            <Dumbbell size={28} />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tight font-sans uppercase">
            IRONPATH
          </h1>
          <div className="flex justify-center gap-1.5 mt-4">
             {[1, 2, 3].map(i => (
               <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-amber-500' : 'w-2 bg-zinc-800'}`} />
             ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white font-sans uppercase mb-2">Identify Yourself</h2>
                <p className="text-zinc-500 text-sm font-mono leading-relaxed">Enter your callsign and current bodyweight to establish your baseline.</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 focus-within:border-amber-500 transition-colors">
                  <label className="text-[10px] font-black tracking-widest text-zinc-500 font-mono uppercase block mb-1">Athlete Name</label>
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-zinc-500" />
                    <input 
                      type="text" 
                      value={name}
                      autoFocus
                      onChange={e => setName(e.target.value)}
                      placeholder="CALLSIGN"
                      className="w-full bg-transparent text-white font-mono font-bold text-lg focus:outline-none placeholder-zinc-700 uppercase"
                    />
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 focus-within:border-amber-500 transition-colors">
                  <label className="text-[10px] font-black tracking-widest text-zinc-500 font-mono uppercase block mb-1">Current Weight</label>
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-zinc-500" />
                    <input 
                      type="number" 
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder="185"
                      className="w-full bg-transparent text-white font-mono font-bold text-lg focus:outline-none placeholder-zinc-700"
                    />
                    <span className="text-zinc-500 font-mono text-sm font-bold">LBS</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white font-sans uppercase mb-2">Primary Objective</h2>
                <p className="text-zinc-500 text-sm font-mono leading-relaxed">What adaptation are we driving?</p>
              </div>
              
              <div className="space-y-3">
                {(['Strength', 'Size', 'Conditioning'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${goal === g ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Target size={18} className={goal === g ? 'text-amber-500' : 'text-zinc-600'} />
                      <span className="font-mono font-bold uppercase text-lg">{g}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white font-sans uppercase mb-2">Logistical Capacity</h2>
                <p className="text-zinc-500 text-sm font-mono leading-relaxed">What equipment do you have access to?</p>
              </div>
              
              <div className="space-y-3">
                {(['Full Gym', 'Dumbbells Only', 'Bodyweight'] as const).map(eq => (
                  <button
                    key={eq}
                    onClick={() => setEquipment(eq)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${equipment === eq ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Dumbbell size={18} className={equipment === eq ? 'text-amber-500' : 'text-zinc-600'} />
                      <span className="font-mono font-bold uppercase text-base">{eq}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
           <button
             onClick={() => {
               if (step < 3) setStep(step + 1);
               else handleComplete();
             }}
             disabled={step === 1 && (!name || !weight)}
             className="w-full py-5 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black uppercase text-sm rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] active:scale-95 disabled:shadow-none"
           >
             {step < 3 ? 'Continue' : 'Initialize Protocol'} <ArrowRight size={18} />
           </button>
        </div>
      </div>
    </div>
  );
}
