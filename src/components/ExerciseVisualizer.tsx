import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Zap, Flame } from 'lucide-react';

export type ExerciseVisualizerVariant = 'inline' | 'detail';

interface ExerciseVisualizerProps {
  exerciseName: string;
  targetSpecialization: string;
  /** @deprecated use variant="inline" */
  compact?: boolean;
  variant?: ExerciseVisualizerVariant;
}

export const EXERCISE_VISUALS: Record<
  string,
  {
    image: string;
    pattern: 'up-down' | 'push-pull' | 'hinge' | 'static' | 'side-to-side';
    primaryMuscle: string;
  }
> = {
  'Lat Pulldown': {
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'lats',
  },
  'Barbell Row': {
    image: 'https://images.unsplash.com/photo-1605296867424-35fc25c9542a?auto=format&fit=crop&q=80&w=400',
    pattern: 'push-pull',
    primaryMuscle: 'back',
  },
  'One-Arm Dumbbell Row': {
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?auto=format&fit=crop&q=80&w=400',
    pattern: 'push-pull',
    primaryMuscle: 'back',
  },
  'Seated Cable Row': {
    image: 'https://images.unsplash.com/photo-1541579318913-a48f400743ae?auto=format&fit=crop&q=80&w=400',
    pattern: 'push-pull',
    primaryMuscle: 'back',
  },
  'Hammer Curls': {
    image: 'https://images.unsplash.com/photo-1521804906057-1df8fdb7df2e?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'arms',
  },
  'Dumbbell Curls': {
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'arms',
  },
  'Farmer Carries': {
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=400',
    pattern: 'static',
    primaryMuscle: 'forearms',
  },
  'Dead Hangs': {
    image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=400',
    pattern: 'static',
    primaryMuscle: 'forearms',
  },
  'Barbell Bench Press': {
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'chest',
  },
  'Incline Dumbbell Press': {
    image: 'https://images.unsplash.com/photo-1605296867304-46d5465a25f1?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'chest',
  },
  'Dumbbell Shoulder Press': {
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'shoulders',
  },
  'Lateral Raises': {
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400',
    pattern: 'side-to-side',
    primaryMuscle: 'shoulders',
  },
  'Push-Ups': {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400',
    pattern: 'push-pull',
    primaryMuscle: 'chest',
  },
  'Cable Tricep Pushdowns': {
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'arms',
  },
  'Close-Grip Bench Press': {
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'arms',
  },
  'Plank Shoulder Taps': {
    image: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?auto=format&fit=crop&q=80&w=400',
    pattern: 'static',
    primaryMuscle: 'core',
  },
  'Barbell Squat': {
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400',
    pattern: 'hinge',
    primaryMuscle: 'legs',
  },
  'Romanian Deadlift': {
    image: 'https://images.unsplash.com/photo-1605296867294-b74adb7b8a7c?auto=format&fit=crop&q=80&w=400',
    pattern: 'hinge',
    primaryMuscle: 'legs',
  },
  'Walking Lunges': {
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=400',
    pattern: 'hinge',
    primaryMuscle: 'legs',
  },
  'Goblet Squats': {
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400',
    pattern: 'hinge',
    primaryMuscle: 'legs',
  },
  'Calf Raises': {
    image: 'https://images.unsplash.com/photo-1541579318913-a48f400743ae?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'legs',
  },
  'Hanging Knee Raises': {
    image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'core',
  },
  'Plank': {
    image: 'https://images.unsplash.com/photo-1566241477600-ac026ad43874?auto=format&fit=crop&q=80&w=400',
    pattern: 'static',
    primaryMuscle: 'core',
  },
  'Russian Twists': {
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80&w=400',
    pattern: 'side-to-side',
    primaryMuscle: 'core',
  },
  'Burpees': {
    image: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'core',
  },
  'Mountain Climbers': {
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80&w=400',
    pattern: 'push-pull',
    primaryMuscle: 'core',
  },
  'Jump Squats': {
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=400',
    pattern: 'up-down',
    primaryMuscle: 'legs',
  },
  'Bear Crawls': {
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&q=80&w=400',
    pattern: 'side-to-side',
    primaryMuscle: 'core',
  },
  '20-30 Minute Walk': {
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=400',
    pattern: 'static',
    primaryMuscle: 'legs',
  },
  'Stretching & Mobility': {
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
    pattern: 'side-to-side',
    primaryMuscle: 'legs',
  },
  'Foam Rolling': {
    image: 'https://images.unsplash.com/photo-1616279969096-54b228f5f103?auto=format&fit=crop&q=80&w=400',
    pattern: 'static',
    primaryMuscle: 'back',
  },
};

const DEFAULT_VISUAL = {
  image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400',
  pattern: 'static' as const,
  primaryMuscle: 'core',
};

type MotionPattern = 'up-down' | 'push-pull' | 'hinge' | 'static' | 'side-to-side';

function MotionGlyph({ pattern }: { pattern: MotionPattern }) {
  if (pattern === 'up-down') {
    return (
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center"
      >
        <Dumbbell size={10} className="text-amber-400 rotate-45" />
      </motion.div>
    );
  }
  if (pattern === 'push-pull') {
    return (
      <motion.div
        animate={{ x: [-3, 3, -3] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center"
      >
        <Zap size={10} className="text-amber-400" />
      </motion.div>
    );
  }
  return (
    <motion.div
      animate={{ scale: [0.92, 1.05, 0.92] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="w-6 h-6 rounded-full border border-dashed border-amber-500/40"
    />
  );
}

function InlinePreview({
  visual,
}: {
  visual: (typeof EXERCISE_VISUALS)[string];
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-black/30 border border-white/[0.06] p-2 pr-3">
      <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-white/[0.08]">
        <img
          src={visual.image}
          alt=""
          className="h-full w-full object-cover opacity-60 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase">
          <Flame size={10} className="text-orange-400" />
          {visual.primaryMuscle}
        </span>
        <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">
          {visual.pattern.replace('-', ' ')} pattern
        </p>
      </div>
      <MotionGlyph pattern={visual.pattern} />
    </div>
  );
}

function DetailPreview({
  exerciseName,
  targetSpecialization,
  visual,
}: {
  exerciseName: string;
  targetSpecialization: string;
  visual: (typeof EXERCISE_VISUALS)[string];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-black/20 border border-white/[0.06] p-3 overflow-hidden">
      <div className="relative h-36 rounded-xl overflow-hidden border border-white/[0.08]">
        <img
          src={visual.image}
          alt={exerciseName}
          className="w-full h-full object-cover opacity-50 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MotionGlyph pattern={visual.pattern} />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-2">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Target muscle
        </p>
        <span className="text-sm font-bold text-amber-400 uppercase w-fit px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
          {visual.primaryMuscle}
        </span>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Focus on controlled tempo — explode up, pause 1s, lower with control.
        </p>
        <p className="text-[10px] text-zinc-600 uppercase tracking-wide">
          {targetSpecialization} · {visual.pattern.replace('-', ' ')}
        </p>
      </div>
    </div>
  );
}

export default function ExerciseVisualizer({
  exerciseName,
  targetSpecialization,
  compact = false,
  variant,
}: ExerciseVisualizerProps) {
  const resolvedVariant: ExerciseVisualizerVariant =
    variant ?? (compact ? 'inline' : 'detail');
  const visual = useMemo(
    () => EXERCISE_VISUALS[exerciseName] || DEFAULT_VISUAL,
    [exerciseName]
  );

  if (resolvedVariant === 'inline') {
    return <InlinePreview visual={visual} />;
  }

  return (
    <DetailPreview
      exerciseName={exerciseName}
      targetSpecialization={targetSpecialization}
      visual={visual}
    />
  );
}
