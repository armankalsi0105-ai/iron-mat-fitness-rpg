/*
Author: AI Coding Assistant
OS support: Linux, macOS, Windows
Description: Main application container coordinating profile selection, workouts, progression, and the custom synthetic breathing pacing HUD
*/
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Dumbbell, Flame, RotateCcw, Play, Pause, ChevronRight, TrendingUp, Award, ShieldAlert,
  Zap, Trophy, Target, ChevronLeft, Activity, UserPlus, Users, Trash2, Edit3, Check, CheckSquare, Sparkles, MessageSquare, Volume2,
  Droplets, Moon, Brain, Apple, BookOpen, Info, Search, Home, Calendar, Sliders, Send, User, Layout, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AthleteProfile, Exercise, WorkoutDay } from './types';
import { WORKOUTS, QUOTES, DEFAULT_AVATARS, WARM_UPS, WarmUpMove, WarmUpProtocol } from './data';
import TacticalCuesModal from './components/TacticalCuesModal';
import AvatarCreator from './components/AvatarCreator';
import SettingsModal from './components/SettingsModal';

// Modular screen subcomponents
import HomeScreen from './components/HomeScreen';
import WorkoutScreen from './components/WorkoutScreen';
import ProgressScreen from './components/ProgressScreen';
import CalendarScreen from './components/CalendarScreen';
import ProfileScreen from './components/ProfileScreen';
import OnboardingScreen from './components/OnboardingScreen';
import AICoach from './components/AICoach';
import { getStorageItem, setStorageItem } from './utils/storage';

const DEFAULT_RITUALS = [
  {
    name: "Hydration Recovery",
    description: "Hydrate body with 3L+ of pure water",
    icon: <Droplets size={14} />
  },
  {
    name: "Sleep Protocol",
    description: "7-9 hours of deep restful sleep",
    icon: <Moon size={14} />
  },
  {
    name: "Mind Stillness",
    description: "10 min focused meditation/breathing",
    icon: <Brain size={14} />
  },
  {
    name: "Nutrition Intake",
    description: "Consume clean high-protein meals",
    icon: <Apple size={14} />
  }
];

function parseRepsFromSpec(spec: string): number {
  try {
    const cleanSpec = spec.toLowerCase().replace(/\s/g, '');
    if (cleanSpec.includes('maxtime') || cleanSpec.includes('failure')) {
      return 12; // default high index reps
    }
    const parts = cleanSpec.split(/[×*x]/);
    if (parts.length >= 2) {
      const repsPart = parts[1];
      const numMatch = repsPart.match(/^(\d+)/);
      if (numMatch) {
        return parseInt(numMatch[1], 10);
      }
    }
  } catch (e) {
    console.error("Failed to parse spec reps, using default 10", e);
  }
  return 10; // default safe fallback reps
}

function getBadgeIconComponent(iconName: string, size = 11) {
  switch (iconName) {
    case "Trophy": return <Trophy size={size} fill="currentColor" className="opacity-90 animate-pulse" />;
    case "Flame": return <Flame size={size} fill="currentColor" className="opacity-90 animate-pulse" />;
    case "Zap": return <Zap size={size} fill="currentColor" className="opacity-90" />;
    case "Award": return <Award size={size} className="opacity-90 stroke-[2.5]" />;
    case "Dumbbell": return <Dumbbell size={size} className="opacity-90 stroke-[2.5]" />;
    case "Activity": return <Activity size={size} className="opacity-90 stroke-[2.5]" />;
    case "Target": return <Target size={size} className="opacity-90 stroke-[2.5]" />;
    default: return <Award size={size} className="opacity-90 animate-pulse" />;
  }
}

export default function App() {
  // --- SAVED VAULT (Offline profiles engine) ---
  const [vault, setVault] = useState<{
    profiles: AthleteProfile[];
    currentProfileId: string;
  }>(() => {
    const saved = typeof window !== 'undefined' ? getStorageItem('iron_mat_vault_v3') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.profiles) && parsed.currentProfileId) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed loading local athlete ledger", e);
      }
    }

    // Default Seed Profile
    const seedId = "combatant-seed";
    const defaultProfile: AthleteProfile = {
      id: seedId,
      name: "NEW ATHLETE",
      completedSets: {},
      savedWeights: {},
      avatarUrl: DEFAULT_AVATARS[0],
      streak: 0,
      lastActiveDate: "",
      personalBests: {},
      age: 16,
      height: "",
      weight: 0,
      sport: "Athlete",
      goals: "",
      equipment: "Full Gym",
      bodyWeightLogs: [],
      completedWorkouts: []
    };

    return {
      profiles: [defaultProfile],
      currentProfileId: seedId
    };
  });

  // Keep local storage in perfect synchronization
  useEffect(() => {
    setStorageItem('iron_mat_vault_v3', JSON.stringify(vault));
  }, [vault]);

  // Current active profile helper
  const activeProfile = useMemo(() => {
    const profile = vault.profiles.find(p => p.id === vault.currentProfileId) || vault.profiles[0];
    // Retroactively add student athlete biometric array defaults if missing from cache
    let mutated = false;
    const nextProfile = { ...profile };
    
    if (nextProfile.age === undefined) { nextProfile.age = 16; mutated = true; }
    if (nextProfile.height === undefined) { nextProfile.height = "5ft 9in"; mutated = true; }
    if (nextProfile.weight === undefined) { nextProfile.weight = 145; mutated = true; }
    if (nextProfile.sport === undefined) { nextProfile.sport = "Wrestling"; mutated = true; }
    if (nextProfile.goals === undefined) { nextProfile.goals = "Build explosive speed & defense."; mutated = true; }

    if (!nextProfile.bodyWeightLogs) { nextProfile.bodyWeightLogs = []; mutated = true; }
    if (!nextProfile.completedWorkouts) { nextProfile.completedWorkouts = []; mutated = true; }
    if (!nextProfile.personalBests) {
      nextProfile.personalBests = {
        "Bench Press": 135,
        "Squat": 185,
        "Deadlift": 225,
        "Overhead Press": 95,
        "Pull-Ups": 0
      };
      mutated = true;
    }

    if (mutated) {
      setTimeout(() => {
        setVault(prev => ({
          ...prev,
          profiles: prev.profiles.map(p => p.id === nextProfile.id ? nextProfile : p)
        }));
      }, 0);
    }
    return nextProfile;
  }, [vault]);

  // --- STATE FOR CURRENT APP FLOW ---
  const [currentDay, setCurrentDay] = useState<string>("Sunday");
  const dList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  useEffect(() => {
    setCurrentDay(dList[new Date().getDay()]);
  }, []);

  const activeWorkout = useMemo(() => {
    return WORKOUTS[currentDay] || WORKOUTS.Sunday;
  }, [currentDay]);

  // Toast alert system
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });
  const triggerToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  };

  // Profilechanger views
  const [showManageProfiles, setShowManageProfiles] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Bottom Navigation tab routing state
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'progress' | 'calendar' | 'profile' | 'coach'>('home');

  // Bodyweight indicator state
  const [newBodyWeight, setNewBodyWeight] = useState("");

  // Modals state
  const [cuesModalState, setCuesModalState] = useState<{ isOpen: boolean; exerciseName: string; category: string }>({
    isOpen: false,
    exerciseName: "",
    category: ""
  });

  // Motivational quote index
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Rest Timer countdown mechanics
  const [timerMax, setTimerMax] = useState(90); // default rest 90s
  const [timerRemaining, setTimerRemaining] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);

  // Warmup protocol checkboxes
  const [checkedWarmups, setCheckedWarmups] = useState<Record<string, boolean>>({});
  const [isWarmupOpen, setIsWarmupOpen] = useState(true);
  const [warmupTimerActive, setWarmupTimerActive] = useState(false);
  const [warmupTimeRemaining, setWarmupTimeRemaining] = useState(300);

  // Sound play helper (using synthesized Web Audio buzzer alerts so we don't have broken public assets!)
  const playRestAlertAudio = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      
      // Beep tone 1
      const osc1 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc1.frequency.setValueAtTime(660, ctx.currentTime); // High pitch ring
      osc1.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      
      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.8);
      
      triggerToast("🔔 REST PERIOD COMPLETE! Back to the grind, athlete!");
    } catch (e) {
      console.warn("Audio Context alert blocked by browser guidelines", e);
    }
  };

  // Rest timer ticker decrementation effect
  useEffect(() => {
    let ticker: any = null;
    if (timerRunning && timerRemaining > 0) {
      ticker = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            playRestAlertAudio();
            return timerMax;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (ticker) clearInterval(ticker);
    };
  }, [timerRunning, timerRemaining, timerMax]);

  // Combat Rhythm Synth state & refs (Browser-synthesized sub-beats)
  const [isSynthRunning, setIsSynthRunning] = useState<boolean>(false);
  const [synthTrack, setSynthTrack] = useState<string>("focus");
  const [synthVolume, setSynthVolume] = useState<number>(0.2);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const synthIntervalRef = useRef<any>(null);

  const startCombatSynth = (track: string, vol: number) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtxClass();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Clear existing nodes if running
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
      }

      // Initialize gain
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.gain.value = vol;
      gainNodeRef.current.connect(ctx.destination);

      // Create a beat generator
      let stepIdx = 0;
      const beatInterval = track === "intense" ? 250 : track === "focus" ? 500 : 800; // fast pacing for intense

      synthIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
        
        // Synthesize kick/sub elements
        const osc = ctx.createOscillator();
        const nodeGain = ctx.createGain();
        
        osc.connect(nodeGain);
        if (gainNodeRef.current) {
          nodeGain.connect(gainNodeRef.current);
        }

        // Deep drop rhythm
        osc.type = "sine";
        if (stepIdx % 4 === 0) {
          osc.frequency.setValueAtTime(60, ctx.currentTime); // Heavy thump
          osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          nodeGain.gain.setValueAtTime(0.8, ctx.currentTime);
          nodeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.32);
        } else if (stepIdx % 2 === 0) {
          osc.frequency.setValueAtTime(90, ctx.currentTime); // Mid double leg click
          osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          nodeGain.gain.setValueAtTime(0.4, ctx.currentTime);
          nodeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start();
          osc.stop(ctx.currentTime + 0.16);
        } else {
          // Snare-like high frequency brush
          osc.type = "triangle";
          osc.frequency.setValueAtTime(150, ctx.currentTime);
          nodeGain.gain.setValueAtTime(0.15, ctx.currentTime);
          nodeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.start();
          osc.stop(ctx.currentTime + 0.09);
        }

        stepIdx++;
      }, beatInterval);

      setIsSynthRunning(true);
      triggerToast(`Pacemaker engaged: [${track.toUpperCase()} BEATS]`);
    } catch (err) {
      console.warn("Pacemaker failed to start", err);
    }
  };

  const stopCombatSynthNodes = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    setIsSynthRunning(false);
  };

  // Safely mutate profile data
  const updateActiveProfile = (updater: (prev: AthleteProfile) => AthleteProfile) => {
    setVault(prev => {
      const profilesCopy = prev.profiles.map(p => {
        if (p.id === prev.currentProfileId) {
          const nextProfile = updater(p);
          return nextProfile;
        }
        return p;
      });

      return {
        ...prev,
        profiles: profilesCopy
      };
    });
  };

  const handleCreateProfile = (nameArg: string) => {
    const freshId = `athlete-${Date.now()}`;
    const freshProfile: AthleteProfile = {
      id: freshId,
      name: nameArg.trim().toUpperCase() || "NEW ATHLETE",
      completedSets: {},
      savedWeights: {},
      avatarUrl: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
      streak: 0,
      lastActiveDate: "",
      personalBests: {},
      age: undefined,
      height: "",
      weight: undefined,
      sport: "",
      goals: "",
      equipment: "Full Gym",
      bodyWeightLogs: [],
      completedWorkouts: []
    };

    setVault(prev => ({
      profiles: [...prev.profiles, freshProfile],
      currentProfileId: freshId
    }));

    triggerToast(`Athlete ${freshProfile.name} registered on roster.`);
  };

  const handleDeleteProfile = (id: string) => {
    if (vault.profiles.length <= 1) return;
    setVault(prev => {
      const filtered = prev.profiles.filter(p => p.id !== id);
      const nextActiveId = prev.currentProfileId === id ? filtered[0].id : prev.currentProfileId;
      return {
        profiles: filtered,
        currentProfileId: nextActiveId
      };
    });
    triggerToast("Athlete cleared from active roster.");
  };

  const handleAddBodyWeight = () => {
    const wt = parseFloat(newBodyWeight);
    if (isNaN(wt) || wt <= 0) {
      triggerToast("Input a valid positive body weight.");
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    updateActiveProfile(prev => {
      const currentLogs = prev.bodyWeightLogs || [];
      const updatedLogs = [...currentLogs, { date: todayStr, weight: wt }];
      return {
        ...prev,
        weight: wt,
        bodyWeightLogs: updatedLogs
      };
    });
    setNewBodyWeight("");
    triggerToast(`Biometric log written: ${wt} lbs.`);
  };

  return (
    <div className="min-h-dvh bg-[#060609] text-zinc-100 font-sans tracking-tight pb-28 relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {activeProfile.name === "NEW ATHLETE" && (
        <OnboardingScreen updateActiveProfile={updateActiveProfile} />
      )}
      {/* Decorative dark grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Dynamic ambient lights */}
      <div className="fixed top-[-100px] left-[-100px] w-[350px] h-[350px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-amber-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* TOP HEADER */}
      <div className="bg-zinc-950/80 border-b border-zinc-900 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Dumbbell size={18} className="rotate-45" />
            </div>
            <div>
              <span className="text-[12px] font-black tracking-widest text-amber-500 uppercase font-mono block leading-none">IRONPATH</span>
              <span className="text-[9px] font-bold tracking-tight text-zinc-400 uppercase">Student-Athlete Hub</span>
            </div>
          </div>
          
          {/* Active Ledger / Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 hover:border-amber-500/50 hover:text-amber-500 transition-all text-zinc-400 select-none cursor-pointer"
              title="System Setup"
            >
              <Sliders size={16} />
            </button>
            <button
              onClick={() => setShowManageProfiles(!showManageProfiles)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-850 hover:border-zinc-700 transition-all text-xs font-bold text-zinc-300 select-none cursor-pointer"
            >
              <Users size={14} className="text-amber-500" />
              <span className="max-w-[110px] truncate font-mono">{activeProfile.name}</span>
            </button>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Local storage active" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6">
        
        {/* PROFILE CHANGER PANEL */}
        <AnimatePresence>
          {showManageProfiles && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden p-5"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-900">
                <h4 className="text-xs font-black tracking-wider text-amber-500 uppercase font-mono flex items-center gap-1.5">
                  <ShieldAlert size={12} /> Local Combatant Ledger
                </h4>
                <button
                  onClick={() => setShowManageProfiles(false)}
                  className="text-xs text-zinc-500 hover:text-white font-bold"
                >
                  Close Ledger
                </button>
              </div>

              {/* Profiles list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {vault.profiles.map(p => (
                  <div 
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      p.id === activeProfile.id 
                        ? 'bg-zinc-900/80 border-amber-500/50' 
                        : 'bg-black/30 border-zinc-900 hover:border-zinc-800'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => {
                        setVault(prev => ({ ...prev, currentProfileId: p.id }));
                        triggerToast(`Switched profile to: ${p.name}`);
                      }}
                    >
                      <img 
                        src={p.avatarUrl} 
                        alt={p.name} 
                        className="h-8 w-8 rounded-full border border-zinc-800 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-xs font-black text-white font-mono">{p.name}</p>
                        <p className="text-[10px] text-zinc-500 font-medium">Streak {p.streak} • {p.sport || "Wrestling"}</p>
                      </div>
                    </div>
                    {vault.profiles.length > 1 && (
                      <button 
                        onClick={() => handleDeleteProfile(p.id)}
                        className="p-1.5 text-zinc-650 hover:text-rose-500 transition-colors"
                        title="Delete athlete profile"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Create new profile form */}
              <div className="border-t border-zinc-900 pt-4">
                <span className="text-[10px] font-bold text-zinc-500 font-mono block uppercase mb-2">Register New Athlete</span>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newProfileName.trim()) return;
                    handleCreateProfile(newProfileName.trim());
                    setNewProfileName("");
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="E.G. CHAMPION-ATHLETE"
                    className="flex-1 bg-black/40 border border-zinc-900 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-zinc-700 uppercase focus:outline-none focus:border-amber-500/40"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-black text-xs font-black rounded-xl hover:bg-amber-400 font-mono uppercase tracking-tight"
                  >
                    Register
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="transition-all duration-300 pb-20"
          >
            {activeTab === 'home' && (
              <HomeScreen
                currentDay={currentDay}
                todayWorkout={activeWorkout}
                setActiveTab={setActiveTab}
                activeProfile={activeProfile}
                triggerToast={triggerToast}
                updateActiveProfile={updateActiveProfile}
              />
            )}

            {activeTab === 'workout' && (
              <WorkoutScreen
                activeProfile={activeProfile}
                currentDay={currentDay}
                setCurrentDay={setCurrentDay}
                activeWorkout={activeWorkout}
                updateActiveProfile={updateActiveProfile}
                triggerToast={triggerToast}
                checkedWarmups={checkedWarmups}
                setCheckedWarmups={setCheckedWarmups}
                isWarmupOpen={isWarmupOpen}
                setIsWarmupOpen={setIsWarmupOpen}
                warmupTimerActive={warmupTimerActive}
                setWarmupTimerActive={setWarmupTimerActive}
                warmupTimeRemaining={warmupTimeRemaining}
                setWarmupTimeRemaining={setWarmupTimeRemaining}
                setTimerRemaining={setTimerRemaining}
                setTimerMax={setTimerMax}
                setTimerRunning={setTimerRunning}
                isSynthRunning={isSynthRunning}
                setIsSynthRunning={setIsSynthRunning}
                synthTrack={synthTrack}
                setSynthTrack={setSynthTrack}
                synthVolume={synthVolume}
                setSynthVolume={setSynthVolume}
                handleInitSynthAudio={() => startCombatSynth(synthTrack, synthVolume)}
                handleStopSynthAudio={stopCombatSynthNodes}
                setCuesModalState={setCuesModalState}
                getBadgeIconComponent={getBadgeIconComponent}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressScreen
                activeProfile={activeProfile}
                updateActiveProfile={updateActiveProfile}
                triggerToast={triggerToast}
                newBodyWeight={newBodyWeight}
                setNewBodyWeight={setNewBodyWeight}
                handleAddBodyWeight={handleAddBodyWeight}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarScreen
                activeProfile={activeProfile}
                updateActiveProfile={updateActiveProfile}
                triggerToast={triggerToast}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                activeProfile={activeProfile}
                updateActiveProfile={updateActiveProfile}
                triggerToast={triggerToast}
                setAvatarModalOpen={setAvatarModalOpen}
              />
            )}

            {activeTab === 'coach' && (
              <AICoach activeProfile={activeProfile} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FLOATING REST TIMER OVERLAY / METRICS MINI HUD */}
      {timerRunning && (
        <div className="fixed bottom-24 right-4 z-50 bg-zinc-950/95 border border-amber-500/40 rounded-full px-4 py-2.5 flex items-center gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <div className="relative h-9 w-9 flex items-center justify-center">
            {/* SVG Progress Circle behind */}
            <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500 transition-all duration-300"
                strokeWidth="2.5"
                strokeDasharray={`${(timerRemaining / timerMax) * 100}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="text-[10px] font-mono font-black text-amber-500 z-10">{timerRemaining}s</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {timerRunning ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button
              onClick={() => {
                setTimerRemaining(timerMax);
                setTimerRunning(false);
                triggerToast("Rest timer reset");
              }}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      )}

      {activeTab !== 'workout' && !timerRunning && (
        <button
          onClick={() => setActiveTab('workout')}
          className="fixed bottom-24 right-5 z-40 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-sm rounded-full px-5 py-3.5 flex items-center gap-2 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 cursor-pointer font-mono tracking-widest"
        >
          <Zap size={16} className="fill-current" /> Start
        </button>
      )}

      {/* BOTTOM FLOATING NAV BAR TO PREVENT OVERSHOOT (LARGE TARGETS >= 44x44) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/90 border-t border-zinc-900/60 backdrop-blur-md pb-safe">
        <div className="max-w-md mx-auto h-[68px] px-3 flex justify-between items-center">
          {[
            { id: 'home', label: 'Home', icon: Layout },
            { id: 'workout', label: 'Train', icon: Dumbbell },
            { id: 'progress', label: 'Progress', icon: TrendingUp },
            { id: 'coach', label: 'Coach', icon: Bot },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'profile', label: 'Profile', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full min-h-[44px] min-w-[44px] text-center select-none cursor-pointer transition-all ${
                  isSel ? 'text-amber-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={18} className={isSel ? "animate-pulse" : ""} />
                <span className="text-[9px] font-black tracking-wider uppercase font-mono leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL SYSTEM */}
      <TacticalCuesModal
        isOpen={cuesModalState.isOpen}
        exerciseName={cuesModalState.exerciseName}
        category={cuesModalState.category}
        onClose={() => setCuesModalState(prev => ({ ...prev, isOpen: false }))}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      <AvatarCreator
        currentAvatarUrl={activeProfile.avatarUrl}
        onAvatarGenerated={(newUrl) => {
          updateActiveProfile(prev => ({
            ...prev,
            avatarUrl: newUrl
          }));
          triggerToast("Combatant visual profile successfully forged!");
        }}
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
      />

      {/* ENCAPSULATED TOAST ALERTS */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: -40, x: "-50%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-11 left-1/2 -translate-x-1/2 bg-amber-500 text-black px-6 py-2.5 rounded-full font-black text-xs tracking-tight shadow-[0_12px_36px_rgba(0,0,0,0.6)] border border-amber-400 z-50 flex items-center gap-2"
          >
            <Zap size={12} className="fill-current" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
/* --- End of App.tsx --- */
