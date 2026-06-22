import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Dumbbell, Flame, RotateCcw, Play, Pause, ChevronRight, TrendingUp, Award, ShieldAlert,
  Zap, Trophy, Target, ChevronLeft, Activity, UserPlus, Users, Trash2, Edit3, Check, CheckSquare, Sparkles, MessageSquare, Volume2,
  Droplets, Moon, Brain, Apple, BookOpen, Info, Search, Home, Calendar, Sliders, Send, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterProfile, Exercise, WorkoutDay } from './types';
import { WORKOUTS, QUOTES, RANKS, DEFAULT_AVATARS, WARM_UPS, ACHIEVEMENTS, WarmUpMove, WarmUpProtocol } from './data';
import { getDefaultWorkoutDayName, hasProgramStarted, getDaysUntilProgramStart, toDateKey, computeProgramStreak } from './schedule';
import { computeReadinessScore } from './lib/athleteMetrics';
import TacticalCuesModal from './components/TacticalCuesModal';
import AvatarCreator from './components/AvatarCreator';

// Modular screen subcomponents
import HomeScreen from './components/HomeScreen';
import WorkoutScreen from './components/WorkoutScreen';
import ProgressScreen from './components/ProgressScreen';
import CalendarScreen from './components/CalendarScreen';
import ProfileScreen from './components/ProfileScreen';
import BottomNav, { TabId } from './components/ui/BottomNav';
import AchievementUnlock from './components/ui/AchievementUnlock';

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
    profiles: CharacterProfile[];
    currentProfileId: string;
  }>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('iron_mat_vault_v3') : null;
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
    const defaultProfile: CharacterProfile = {
      id: seedId,
      name: "PATH-FINDER",
      level: 1,
      xp: 0,
      xpToNext: 100,
      attributes: { pull: 1, push: 1, legs: 1, grip: 1, cardio: 1 },
      attrXp: { pull: 0, push: 0, legs: 0, grip: 0, cardio: 0 },
      completedSets: {},
      savedWeights: {},
      avatarUrl: DEFAULT_AVATARS[0],
      dailyRituals: {},
      totalReps: 0,
      streak: 0,
      achievements: [],
      badgeShowcase: "",
      lastActiveDate: "",
      warmupsCompleted: 0,
      personalBests: {
        "Bench Press": 135,
        "Squat": 185,
        "Deadlift": 225,
        "Overhead Press": 95,
        "Pull-Ups": 0
      },
      age: 16,
      height: "5ft 9in",
      weight: 145,
      sport: "Wrestling",
      goals: "Build explosive doubleleg take-down speed, back arch conditioning, and match-ready grip endurance.",
      wrestlingPhase: "In Season",
      gripRating: 5,
      conditioningRating: 5,
      pullupsRating: 15,
      deadhangsRating: 45,
      farmercarriesRating: 30,
      bodyWeightLogs: [
        { date: "2026-06-15", weight: 146.5 },
        { date: "2026-06-18", weight: 145.8 },
        { date: "2026-06-21", weight: 145.0 }
      ],
      completedWorkouts: []
    };

    return {
      profiles: [defaultProfile],
      currentProfileId: seedId
    };
  });

  // Keep local storage in perfect synchronization
  useEffect(() => {
    localStorage.setItem('iron_mat_vault_v3', JSON.stringify(vault));
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
    if (nextProfile.wrestlingPhase === undefined) { nextProfile.wrestlingPhase = "Off Season"; mutated = true; }
    if (nextProfile.gripRating === undefined) { nextProfile.gripRating = 5; mutated = true; }
    if (nextProfile.conditioningRating === undefined) { nextProfile.conditioningRating = 5; mutated = true; }
    if (nextProfile.pullupsRating === undefined) { nextProfile.pullupsRating = 10; mutated = true; }
    if (nextProfile.deadhangsRating === undefined) { nextProfile.deadhangsRating = 45; mutated = true; }
    if (nextProfile.farmercarriesRating === undefined) { nextProfile.farmercarriesRating = 30; mutated = true; }
    if (!nextProfile.bodyWeightLogs) { nextProfile.bodyWeightLogs = []; mutated = true; }
    if (!nextProfile.completedWorkouts) { nextProfile.completedWorkouts = []; mutated = true; }
    const computedStreak = computeProgramStreak(nextProfile.completedWorkouts);
    if ((nextProfile.streak || 0) !== computedStreak) {
      nextProfile.streak = computedStreak;
      mutated = true;
    }
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
  const [currentDay, setCurrentDay] = useState<string>(() => getDefaultWorkoutDayName());

  useEffect(() => {
    setCurrentDay(getDefaultWorkoutDayName());
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

  // Bottom Navigation tab routing state
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('ironpath_welcome_seen');
  });
  const [pendingAchievement, setPendingAchievement] = useState<{
    name: string;
    description: string;
    badgeColor: string;
  } | null>(null);
  const achievementQueueRef = useRef<Array<{
    name: string;
    description: string;
    badgeColor: string;
  }>>([]);
  const isShowingAchievementRef = useRef(false);

  useEffect(() => {
    if (showWelcome) {
      const t = setTimeout(() => {
        setShowWelcome(false);
        sessionStorage.setItem('ironpath_welcome_seen', '1');
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [showWelcome]);

  // AI Coach State Management
  const [coachInput, setCoachInput] = useState("");
  const [coachHistory, setCoachHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: "Yo champion! I'm your IronPath AI Coach. Ask me how to blast doublelegs, pack explosive hip drive, optimize grip endurance safely, or lay down recovery meals. Remember: no ego-lifting in my room, protect your neck and joints!"
    }
  ]);
  const [coachLoading, setCoachLoading] = useState(false);

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
    if (!timerRunning) return;

    const ticker = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          playRestAlertAudio();
          return timerMax;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [timerRunning, timerMax]);

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
      const normalizedTrack = track === "combat" ? "intense" : track === "chill" ? "slow" : track;
      const beatInterval = normalizedTrack === "intense" ? 250 : normalizedTrack === "focus" ? 500 : 800;

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

  const enqueueAchievement = (achievement: {
    name: string;
    description: string;
    badgeColor: string;
  }) => {
    if (!isShowingAchievementRef.current) {
      isShowingAchievementRef.current = true;
      setPendingAchievement(achievement);
      return;
    }
    achievementQueueRef.current.push(achievement);
  };

  const dismissAchievement = () => {
    const next = achievementQueueRef.current.shift();
    if (next) {
      setPendingAchievement(next);
      return;
    }
    isShowingAchievementRef.current = false;
    setPendingAchievement(null);
  };

  // Safely mutate profile data
  const updateActiveProfile = (updater: (prev: CharacterProfile) => CharacterProfile) => {
    setVault(prev => {
      const profilesCopy = prev.profiles.map(p => {
        if (p.id === prev.currentProfileId) {
          const nextProfile = updater(p);
          
          // Verify and trigger unlockable achievements
          const unlockedSet = new Set(nextProfile.achievements || []);
          ACHIEVEMENTS.forEach(ach => {
            if (unlockedSet.has(ach.id)) return;
            
            let qualifies = false;
            if (ach.milestoneType === "reps" && (nextProfile.totalReps || 0) >= ach.targetValue) {
              qualifies = true;
            } else if (ach.milestoneType === "level" && nextProfile.level >= ach.targetValue) {
              qualifies = true;
            } else if (ach.milestoneType === "streak") {
              const streak = computeProgramStreak(nextProfile.completedWorkouts);
              if (streak >= ach.targetValue) {
                qualifies = true;
              }
            } else if (ach.milestoneType === "warmups" && (nextProfile.warmupsCompleted || 0) >= ach.targetValue) {
              qualifies = true;
            } else if (ach.milestoneType === "weight") {
              const pbMax = Math.max(0, ...Object.values(nextProfile.personalBests || {}));
              const loggedMax = Math.max(
                0,
                ...Object.values(nextProfile.savedWeights || {}).map(w => parseFloat(w) || 0)
              );
              if (Math.max(pbMax, loggedMax) >= ach.targetValue) {
                qualifies = true;
              }
            }

            if (qualifies) {
              unlockedSet.add(ach.id);
              triggerToast(`🏆 ACHIEVEMENT UNLOCKED: "${ach.name}"! +100 XP`);
              enqueueAchievement({
                name: ach.name,
                description: ach.description,
                badgeColor: ach.badgeColor,
              });
              nextProfile.xp += 100;
            }
          });

          // Level up looping checker
          let nextXp = nextProfile.xp;
          let newLevel = nextProfile.level;
          let nextXpLimit = nextProfile.xpToNext;

          while (nextXp >= nextXpLimit) {
            nextXp -= nextXpLimit;
            newLevel++;
            nextXpLimit = Math.floor(nextXpLimit * 1.25);
            triggerToast(`📈 RANK ELEVATION: Level ${newLevel} Athlete! 🔱`);
          }

          nextProfile.achievements = Array.from(unlockedSet);
          nextProfile.xp = Math.max(0, nextXp);
          nextProfile.level = newLevel;
          nextProfile.xpToNext = nextXpLimit;

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
    const freshProfile: CharacterProfile = {
      id: freshId,
      name: nameArg.trim().toUpperCase(),
      level: 1,
      xp: 0,
      xpToNext: 100,
      attributes: { pull: 1, push: 1, legs: 1, grip: 1, cardio: 1 },
      attrXp: { pull: 0, push: 0, legs: 0, grip: 0, cardio: 0 },
      completedSets: {},
      savedWeights: {},
      avatarUrl: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
      dailyRituals: {},
      totalReps: 0,
      streak: 0,
      achievements: [],
      badgeShowcase: "",
      lastActiveDate: "",
      warmupsCompleted: 0,
      personalBests: {
        "Bench Press": 135,
        "Squat": 185,
        "Deadlift": 225,
        "Overhead Press": 95,
        "Pull-Ups": 0
      },
      age: 16,
      height: "5ft 9in",
      weight: 145,
      sport: "Wrestling",
      goals: "Build explosive core speed and high-compliance tracking.",
      wrestlingPhase: "Off Season",
      gripRating: 5,
      conditioningRating: 5,
      pullupsRating: 10,
      deadhangsRating: 45,
      farmercarriesRating: 30,
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

  const handleSendCoachMessage = async () => {
    if (!coachInput.trim()) return;
    const msg = coachInput.trim();
    setCoachInput("");
    setCoachHistory(prev => [...prev, { role: 'user', text: msg }]);
    setCoachLoading(true);

    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: coachHistory,
          athleteProfile: activeProfile
        })
      });

      const data = await response.json();
      if (data.response) {
        setCoachHistory(prev => [...prev, { role: 'assistant', text: data.response }]);
      } else {
        setCoachHistory(prev => [...prev, { role: 'assistant', text: data.error || "Coaching connection timed out. Let's ask again, soldier!" }]);
      }
    } catch (err) {
      console.error(err);
      setCoachHistory(prev => [...prev, { role: 'assistant', text: "Connection error. Give me that query once more!" }]);
    } finally {
      setCoachLoading(false);
    }
  };

  const handleAddBodyWeight = () => {
    const wt = parseFloat(newBodyWeight);
    if (isNaN(wt) || wt <= 0) {
      triggerToast("Input a valid positive body weight.");
      return;
    }
    const todayStr = toDateKey(new Date());
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

  const handleUpdateWrestlingPhase = (phase: string) => {
    updateActiveProfile(prev => ({
      ...prev,
      wrestlingPhase: phase
    }));
    triggerToast(`Athletic track cycle: ${phase}`);
  };

  const handleUpdateWrestlingRating = (metric: 'gripRating' | 'conditioningRating' | 'pullupsRating' | 'deadhangsRating' | 'farmercarriesRating', value: number) => {
    updateActiveProfile(prev => ({
      ...prev,
      [metric]: value
    }));
  };

  const readinessScore = useMemo(
    () => computeReadinessScore(activeProfile),
    [activeProfile]
  );

  const resolvedRank = useMemo(() => {
    return [...RANKS].reverse().find(r => activeProfile.level >= r.minLvl)?.name || "WHITE BELT";
  }, [activeProfile.level]);

  return (
    <div className="min-h-screen bg-[#060609] text-zinc-100 font-sans tracking-tight pb-28 relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
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
                        <p className="text-[10px] text-zinc-500 font-medium">Lvl {p.level} • {p.sport || "Wrestling"}</p>
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

        {/* MAIN DYNAMIC CONTENT PORTAL */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="transition-all duration-300"
          >
          {activeTab === 'home' && (
            <HomeScreen
              activeProfile={activeProfile}
              resolvedRank={resolvedRank}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              todayWorkout={{
                title: activeWorkout.title,
                tag: activeWorkout.tag,
                exerciseCount: activeWorkout.exercises?.length,
              }}
              programStarted={hasProgramStarted()}
              daysUntilStart={getDaysUntilProgramStart()}
              readinessScore={readinessScore}
              quotes={QUOTES}
              quoteIdx={quoteIdx}
              setQuoteIdx={setQuoteIdx}
              updateActiveProfile={updateActiveProfile}
              coachInput={coachInput}
              setCoachInput={setCoachInput}
              coachHistory={coachHistory}
              setCoachHistory={setCoachHistory}
              coachLoading={coachLoading}
              setCoachLoading={setCoachLoading}
              handleSendCoachMessage={handleSendCoachMessage}
              getBadgeIconComponent={getBadgeIconComponent}
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
              programStarted={hasProgramStarted()}
              daysUntilStart={getDaysUntilProgramStart()}
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
              handleUpdateWrestlingPhase={handleUpdateWrestlingPhase}
              handleUpdateWrestlingRating={handleUpdateWrestlingRating}
              readinessScore={readinessScore}
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

      {/* BOTTOM NAV */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* MODAL SYSTEM */}
      <TacticalCuesModal
        isOpen={cuesModalState.isOpen}
        exerciseName={cuesModalState.exerciseName}
        category={cuesModalState.category}
        onClose={() => setCuesModalState(prev => ({ ...prev, isOpen: false }))}
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

      <AchievementUnlock
        isOpen={!!pendingAchievement}
        name={pendingAchievement?.name || ''}
        description={pendingAchievement?.description || ''}
        badgeColor={pendingAchievement?.badgeColor}
        onClose={dismissAchievement}
      />

      {/* Welcome splash */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-[#060609] flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 260 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Dumbbell size={32} className="text-amber-500 rotate-45" />
              </div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em] mb-2">IronPath</p>
              <h1 className="text-hero font-bold text-white">Train like a champion</h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
