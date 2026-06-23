import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Eye, Zap, Flame } from 'lucide-react';

interface ExerciseVisualizerProps {
  exerciseName: string;
  targetSpecialization: string;
}

// Map exercises to premium dark atmospheric athletic images and motion patterns
export const EXERCISE_VISUALS: Record<string, { image: string; pattern: 'up-down' | 'push-pull' | 'hinge' | 'static' | 'side-to-side'; primaryMuscle: string }> = {
  "Lat Pulldown": {
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'lats'
  },
  "Barbell Row": {
    image: "https://images.unsplash.com/photo-1605296867424-35fc25c9542a?auto=format&fit=crop&q=80&w=400",
    pattern: 'push-pull',
    primaryMuscle: 'back'
  },
  "One-Arm Dumbbell Row": {
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?auto=format&fit=crop&q=80&w=400",
    pattern: 'push-pull',
    primaryMuscle: 'back'
  },
  "Seated Cable Row": {
    image: "https://images.unsplash.com/photo-1541579318913-a48f400743ae?auto=format&fit=crop&q=80&w=400",
    pattern: 'push-pull',
    primaryMuscle: 'back'
  },
  "Hammer Curls": {
    image: "https://images.unsplash.com/photo-1521804906057-1df8fdb7df2e?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'arms'
  },
  "Farmer Carries": {
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=400",
    pattern: 'static',
    primaryMuscle: 'forearms'
  },
  "Dead Hangs": {
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=400",
    pattern: 'static',
    primaryMuscle: 'forearms'
  },
  "Barbell Bench": {
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'chest'
  },
  "Barbell Bench Press": {
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'chest'
  },
  "Dumbbell Press": {
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'chest'
  },
  "Incline Dumbbell Press": {
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'chest'
  },
  "Dumbbell Shoulder Press": {
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'shoulders'
  },
  "Lateral Raises": {
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400",
    pattern: 'side-to-side',
    primaryMuscle: 'shoulders'
  },
  "Push-Ups": {
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400",
    pattern: 'push-pull',
    primaryMuscle: 'chest'
  },
  "Tricep Pushdowns": {
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'arms'
  },
  "Cable Tricep Pushdowns": {
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'arms'
  },
  "Close-Grip Bench Press": {
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'arms'
  },
  "Plank Shoulder Taps": {
    image: "https://images.unsplash.com/photo-1566241477600-ac026ad43874?auto=format&fit=crop&q=80&w=400",
    pattern: 'static',
    primaryMuscle: 'core'
  },
  "Barbell Squat": {
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400",
    pattern: 'hinge',
    primaryMuscle: 'legs'
  },
  "Romanian DL": {
    image: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?auto=format&fit=crop&q=80&w=400",
    pattern: 'hinge',
    primaryMuscle: 'legs'
  },
  "Romanian Deadlift": {
    image: "https://images.unsplash.com/photo-1605296867294-b74adb7b8a7c?auto=format&fit=crop&q=80&w=400",
    pattern: 'hinge',
    primaryMuscle: 'legs'
  },
  "Walking Lunges": {
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=400",
    pattern: 'hinge',
    primaryMuscle: 'legs'
  },
  "Goblet Squats": {
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400",
    pattern: 'hinge',
    primaryMuscle: 'legs'
  },
  "Calf Raises": {
    image: "https://images.unsplash.com/photo-1541579318913-a48f400743ae?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'legs'
  },
  "Hanging Knee Raises": {
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'core'
  },
  "Plank": {
    image: "https://images.unsplash.com/photo-1566241477600-ac026ad43874?auto=format&fit=crop&q=80&w=400",
    pattern: 'static',
    primaryMuscle: 'core'
  },
  "Russian Twists": {
    image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80&w=400",
    pattern: 'side-to-side',
    primaryMuscle: 'core'
  },
  "Burpees": {
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'core'
  },
  "Mountain Climbers": {
    image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80&w=400",
    pattern: 'push-pull',
    primaryMuscle: 'core'
  },
  "Jump Squats": {
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'legs'
  },
  "Bear Crawls": {
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=400",
    pattern: 'side-to-side',
    primaryMuscle: 'core'
  },
  "Weighted Pull-Ups": {
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'lats'
  },
  "Seated Rows": {
    image: "https://images.unsplash.com/photo-1605296867424-35fc25c9542a?auto=format&fit=crop&q=80&w=400",
    pattern: 'push-pull',
    primaryMuscle: 'back'
  },
  "Face Pulls": {
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400",
    pattern: 'push-pull',
    primaryMuscle: 'shoulders'
  },
  "Dumbbell Curls": {
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'arms'
  },
  "Grip Squeezers": {
    image: "https://images.unsplash.com/photo-1521804906057-1df8fdb7df2e?auto=format&fit=crop&q=80&w=400",
    pattern: 'push-pull',
    primaryMuscle: 'forearms'
  },
  "Incline Bench": {
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'chest'
  },
  "Military Press": {
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'shoulders'
  },
  "Dips": {
    image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'chest'
  },
  "Skull Crushers": {
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=400",
    pattern: 'up-down',
    primaryMuscle: 'arms'
  },
  "Battle Ropes": {
    image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=400",
    pattern: 'side-to-side',
    primaryMuscle: 'arms'
  },
  "Long Walk": {
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400",
    pattern: 'static',
    primaryMuscle: 'legs'
  },
  "20-30 Minute Walk": {
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400",
    pattern: 'static',
    primaryMuscle: 'legs'
  },
  "Mobility Flow": {
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400",
    pattern: 'side-to-side',
    primaryMuscle: 'legs'
  },
  "Stretching & Mobility": {
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400",
    pattern: 'side-to-side',
    primaryMuscle: 'legs'
  },
  "Foam Roll": {
    image: "https://images.unsplash.com/photo-1616279969096-54b228f5f103?auto=format&fit=crop&q=80&w=400",
    pattern: 'static',
    primaryMuscle: 'back'
  },
  "Foam Rolling": {
    image: "https://images.unsplash.com/photo-1616279969096-54b228f5f103?auto=format&fit=crop&q=80&w=400",
    pattern: 'static',
    primaryMuscle: 'back'
  }
};

const DEFAULT_VISUAL = {
  image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
  pattern: 'static' as const,
  primaryMuscle: 'core'
};

export default function ExerciseVisualizer({ exerciseName, targetSpecialization }: ExerciseVisualizerProps) {
  const visual = useMemo(() => EXERCISE_VISUALS[exerciseName] || DEFAULT_VISUAL, [exerciseName]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-zinc-950/60 border border-zinc-900/60 p-4 rounded-2xl overflow-hidden text-left relative">
      {/* Decorative grid pattern inside visual */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-10 pointer-events-none" />

      {/* COLUMN 1: Ambient Gym Photo + Cadence Tracker (span 6) */}
      <div className="sm:col-span-6 flex flex-col gap-3 relative z-10">
        <div className="relative h-44 w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
          <img 
            src={visual.image} 
            alt={exerciseName} 
            className="w-full h-full object-cover grayscale opacity-45 active:grayscale-0 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700 select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
          
          {/* Active Visual Target indicator */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-amber-500/30 text-[8px] font-mono font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
            <Eye size={10} className="text-amber-500" /> Active Demonstration
          </div>

          {/* Real-time vector motion simulator trace overlaid on image */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {visual.pattern === 'up-down' && (
              <div className="flex flex-col items-center">
                <motion.div 
                  animate={{ y: [-24, 20, -24] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                >
                  <Dumbbell size={14} className="text-amber-400 rotate-45" />
                </motion.div>
                {/* Glowing wire-frame cable line */}
                <div className="h-20 w-[1px] bg-gradient-to-b from-amber-500 via-amber-500/20 to-transparent" />
              </div>
            )}

            {visual.pattern === 'push-pull' && (
              <div className="flex items-center gap-4">
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-12 h-12 rounded-full border border-orange-500/40 bg-orange-500/10 flex items-center justify-center"
                />
                <motion.div 
                  animate={{ x: [-15, 15, -15] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-8 h-8 rounded-lg bg-amber-500/30 border border-amber-400 flex items-center justify-center"
                >
                  <Zap size={12} className="text-amber-300" />
                </motion.div>
              </div>
            )}

            {visual.pattern === 'hinge' && (
              <div className="relative">
                {/* Visual hinge arc */}
                <svg className="w-20 h-20 text-amber-500/40" viewBox="0 0 100 100">
                  <motion.path 
                    d="M 20,80 Q 50,20 80,80" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                  />
                  <motion.circle 
                    cx="50" 
                    cy="40" 
                    r="6" 
                    fill="#f59e0b"
                    animate={{ cy: [40, 70, 40], cx: [50, 40, 50] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </svg>
              </div>
            )}

            {visual.pattern === 'side-to-side' && (
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 36, 8] }}
                    transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 bg-gradient-to-t from-amber-500 to-orange-400 rounded-full"
                  />
                ))}
              </div>
            )}

            {visual.pattern === 'static' && (
              <motion.div
                animate={{ scale: [0.9, 1.15, 0.9], rotate: [0, 180, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-full border-2 border-dashed border-amber-500/40 flex items-center justify-center"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-400/50" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Dynamic Cadence Bar indicating Concentric vs Eccentric cycle */}
        <div className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl">
          <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 font-bold mb-1.5 uppercase tracking-wider">
            <span>CONCENTRIC (LIFT)</span>
            <span className="text-amber-500">PAUSE</span>
            <span>ECCENTRIC (LOWER)</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden relative">
            <motion.div 
              animate={{ 
                left: ["0%", "100%", "0%"],
                width: ["15%", "35%", "15%"]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-[0_0_8px_#f59e0b]"
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 font-black mt-1 uppercase">
            <span>EXPLODE ▲</span>
            <span className="text-zinc-500">HOLD (1S)</span>
            <span>CONTROL ▼</span>
          </div>
        </div>
      </div>

      {/* COLUMN 2: Isometric Torso / Muscle Target Highlight (span 6) */}
      <div className="sm:col-span-6 flex flex-col justify-between gap-3 relative z-10">
        <div className="bg-zinc-900/40 border border-zinc-850/60 p-3 rounded-xl flex-1 flex flex-col justify-between">
          <div className="text-[10px] font-black text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-900 pb-1.5 flex items-center gap-1.5">
            <Flame size={12} className="text-orange-500 animate-pulse" /> Target Muscle Radar
          </div>

          {/* Beautiful vector stylized body map highlighting muscle groups */}
          <div className="py-2.5 flex items-center justify-center gap-4">
            <div className="relative w-20 h-28 opacity-75">
              {/* Dummy vector outline shape representing torso */}
              <svg viewBox="0 0 100 150" className="w-full h-full text-zinc-800">
                {/* Head */}
                <circle cx="50" cy="15" r="9" fill="currentColor" />
                {/* Torso & shoulders */}
                <path d="M 33,26 L 67,26 L 69,50 L 61,110 L 39,110 L 31,50 Z" fill="currentColor" />
                {/* Arms */}
                <path d="M 28,28 Q 15,60 20,95 Q 24,95 24,90 Q 20,60 30,35 Z" fill="currentColor" />
                <path d="M 72,28 Q 85,60 80,95 Q 76,95 76,90 Q 80,60 70,35 Z" fill="currentColor" />
                {/* Legs */}
                <path d="M 40,111 L 44,147 L 49,147 L 48,111 Z" fill="currentColor" />
                <path d="M 60,111 L 56,147 L 51,147 L 52,111 Z" fill="currentColor" />

                {/* Highlight overlays depending on muscle target */}
                {visual.primaryMuscle === 'lats' && (
                  <motion.path 
                    d="M 34,42 Q 50,45 66,42 L 56,88 Q 50,88 44,88 Z" 
                    fill="#f59e0b" 
                    className="opacity-80"
                    animate={{ fillOpacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                )}

                {visual.primaryMuscle === 'back' && (
                  <motion.path 
                    d="M 35,33 Q 50,30 65,33 L 60,78 Q 50,80 40,78 Z" 
                    fill="#f59e0b" 
                    className="opacity-80"
                    animate={{ fillOpacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                )}

                {visual.primaryMuscle === 'chest' && (
                  <motion.path 
                    d="M 35,32 Q 50,38 65,32 L 62,56 Q 50,58 38,56 Z" 
                    fill="#f59e0b" 
                    className="opacity-80"
                    animate={{ fillOpacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                )}

                {visual.primaryMuscle === 'shoulders' && (
                  <g>
                    <motion.circle 
                      cx="31" cy="30" r="5" 
                      fill="#f59e0b" 
                      animate={{ fillOpacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <motion.circle 
                      cx="69" cy="30" r="5" 
                      fill="#f59e0b" 
                      animate={{ fillOpacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                  </g>
                )}

                {visual.primaryMuscle === 'arms' && (
                  <g>
                    <motion.path 
                      d="M 28,38 Q 23,55 24,70" 
                      stroke="#f59e0b" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                      fill="none" 
                      animate={{ strokeOpacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <motion.path 
                      d="M 72,38 Q 77,55 76,70" 
                      stroke="#f59e0b" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                      fill="none" 
                      animate={{ strokeOpacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                  </g>
                )}

                {visual.primaryMuscle === 'forearms' && (
                  <g>
                    <motion.path 
                      d="M 21,70 Q 20,83 22,94" 
                      stroke="#f59e0b" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      fill="none" 
                      animate={{ strokeOpacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <motion.path 
                      d="M 79,70 Q 80,83 78,94" 
                      stroke="#f59e0b" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      fill="none" 
                      animate={{ strokeOpacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                  </g>
                )}

                {visual.primaryMuscle === 'legs' && (
                  <g>
                    <motion.path 
                      d="M 37,112 L 44,142" 
                      stroke="#f59e0b" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      fill="none" 
                      animate={{ strokeOpacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <motion.path 
                      d="M 63,112 L 56,142" 
                      stroke="#f59e0b" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      fill="none" 
                      animate={{ strokeOpacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                  </g>
                )}

                {visual.primaryMuscle === 'core' && (
                  <motion.path 
                    d="M 39,64 Q 50,68 61,64 L 59,96 Q 50,98 41,96 Z" 
                    fill="#f59e0b" 
                    className="opacity-80"
                    animate={{ fillOpacity: [0.3, 0.9, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                )}
              </svg>
            </div>

            <div className="flex-1 space-y-1.5 text-left">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Specialization Zone</span>
              <span className="text-xs font-black font-mono text-amber-500 uppercase tracking-wider block bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/15 w-fit">
                {visual.primaryMuscle.toUpperCase()}
              </span>
              <p className="text-[10px] text-zinc-400 leading-normal font-medium max-w-[130px]">
                Focus raw neural drive completely on this zone during movement execution.
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-between gap-2 text-[9px] font-mono">
          <span className="text-zinc-500 font-bold uppercase">TRAINING TYPE:</span>
          <span className="text-zinc-300 font-black tracking-widest uppercase">
            {targetSpecialization.split(',')[0] || "STRENGTH"}
          </span>
        </div>
      </div>
    </div>
  );
}
