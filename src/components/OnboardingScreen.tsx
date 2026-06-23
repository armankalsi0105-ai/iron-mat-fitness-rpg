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
    <div className="fixed inset-0 z-50 bg-ntc flex flex-col justify-between pt-16 pb-8 px-6 overflow-hidden">
      <div className="relative z-10 max-w-md w-full mx-auto flex-1 flex flex-col">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-black text-white tracking-tight">
            IronPath
          </h1>
          <p className="text-zinc-500 text-sm mt-2">Let's set up your profile</p>
          <div className="flex justify-center gap-1.5 mt-6">
             {[1, 2, 3].map(i => (
               <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-volt-500' : 'w-2 bg-zinc-800'}`} />
             ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white mb-2">About you</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">Enter your name and current bodyweight.</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-4 focus-within:border-volt-500/50 transition-colors">
                  <label className="text-xs font-medium text-zinc-500 block mb-1">Name</label>
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-zinc-500" />
                    <input 
                      type="text" 
                      value={name}
                      autoFocus
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-transparent text-white font-semibold text-lg focus:outline-none placeholder-zinc-600"
                    />
                  </div>
                </div>

                <div className="bg-ntc-elevated border border-ntc-border rounded-2xl p-4 focus-within:border-volt-500/50 transition-colors">
                  <label className="text-xs font-medium text-zinc-500 block mb-1">Current weight</label>
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-zinc-500" />
                    <input 
                      type="number" 
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder="185"
                      className="w-full bg-transparent text-white font-semibold text-lg focus:outline-none placeholder-zinc-600"
                    />
                    <span className="text-zinc-500 text-sm font-medium">lbs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white mb-2">Your goal</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">What are you training for?</p>
              </div>
              
              <div className="space-y-3">
                {(['Strength', 'Size', 'Conditioning'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${goal === g ? 'bg-volt-500/10 border-volt-500 text-white' : 'bg-ntc-elevated border-ntc-border text-zinc-400 hover:border-zinc-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Target size={18} className={goal === g ? 'text-volt-500' : 'text-zinc-600'} />
                      <span className="font-semibold text-lg">{g}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white mb-2">Equipment</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">What do you have access to?</p>
              </div>
              
              <div className="space-y-3">
                {(['Full Gym', 'Dumbbells Only', 'Bodyweight'] as const).map(eq => (
                  <button
                    key={eq}
                    onClick={() => setEquipment(eq)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all ${equipment === eq ? 'bg-volt-500/10 border-volt-500 text-white' : 'bg-ntc-elevated border-ntc-border text-zinc-400 hover:border-zinc-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Dumbbell size={18} className={equipment === eq ? 'text-volt-500' : 'text-zinc-600'} />
                      <span className="font-semibold text-base">{eq}</span>
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
             className="w-full py-4 bg-white hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold text-base rounded-full flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.98] disabled:shadow-none"
           >
             {step < 3 ? 'Continue' : 'Get started'} <ArrowRight size={18} />
           </button>
        </div>
      </div>
    </div>
  );
}
