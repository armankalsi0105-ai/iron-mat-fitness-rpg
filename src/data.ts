import { WorkoutDay } from "./types";

export const WORKOUTS: Record<string, WorkoutDay> = {
  Sunday: { tag: "PULL", title: "Back & Grip Warfare", exercises: [
    { name: "Lat Pulldown", spec: "3 × 8–12", category: "pull", sets: 3 },
    { name: "Barbell Row", spec: "3 × 8", category: "pull", sets: 3 },
    { name: "One-Arm Dumbbell Row", spec: "3 × 10 (each arm)", category: "pull", sets: 3 },
    { name: "Seated Cable Row", spec: "3 × 10–12", category: "pull", sets: 3 },
    { name: "Hammer Curls", spec: "3 × 10", category: "pull", sets: 3 },
    { name: "Dumbbell Curls", spec: "3 × 10", category: "pull", sets: 3 },
    { name: "Farmer Carries", spec: "3 × 30s", category: "grip", sets: 3, timer: 30 },
    { name: "Dead Hangs", spec: "2 × Max Time", category: "grip", sets: 2, stopwatch: true }
  ]},
  Monday: { tag: "PUSH", title: "Chest & Shoulder Siege", exercises: [
    { name: "Barbell Bench Press", spec: "3 × 8", category: "push", sets: 3 },
    { name: "Incline Dumbbell Press", spec: "3 × 10", category: "push", sets: 3 },
    { name: "Dumbbell Shoulder Press", spec: "3 × 8", category: "push", sets: 3 },
    { name: "Lateral Raises", spec: "3 × 15", category: "push", sets: 3 },
    { name: "Push-Ups", spec: "2 × Near Failure", category: "push", sets: 2 },
    { name: "Cable Tricep Pushdowns", spec: "3 × 12", category: "push", sets: 3 },
    { name: "Close-Grip Bench Press", spec: "3 × 8", category: "push", sets: 3 },
    { name: "Plank Shoulder Taps", spec: "2 × 20", category: "push", sets: 2 }
  ]},
  Tuesday: { tag: "LEGS", title: "Lower Body Engine", exercises: [
    { name: "Barbell Squat", spec: "4 × 5–8", category: "legs", sets: 4 },
    { name: "Romanian Deadlift", spec: "3 × 8", category: "legs", sets: 3 },
    { name: "Walking Lunges", spec: "3 × 10 (each leg)", category: "legs", sets: 3 },
    { name: "Goblet Squats", spec: "3 × 12", category: "legs", sets: 3 },
    { name: "Calf Raises", spec: "4 × 15", category: "legs", sets: 4 },
    { name: "Hanging Knee Raises", spec: "3 × 10", category: "legs", sets: 3 },
    { name: "Plank", spec: "3 × 45s", category: "cardio", sets: 3, timer: 45 },
    { name: "Russian Twists", spec: "3 × 20", category: "cardio", sets: 3 }
  ]},
  Wednesday: { tag: "ATHLETIC", title: "Combat Conditioning", exercises: [
    { name: "Burpees", spec: "3 × 10", category: "cardio", sets: 3 },
    { name: "Mountain Climbers", spec: "3 × 30s", category: "cardio", sets: 3, timer: 30 },
    { name: "Jump Squats", spec: "3 × 10", category: "legs", sets: 3 },
    { name: "Bear Crawls", spec: "3 Rounds", category: "cardio", sets: 3 },
    { name: "Farmer Carries", spec: "3 × 30s", category: "grip", sets: 3, timer: 30 },
    { name: "Dead Hangs", spec: "2 × Max Time", category: "grip", sets: 2, stopwatch: true },
    { name: "Push-Ups", spec: "2 × Near Failure", category: "push", sets: 2 },
    { name: "Plank", spec: "3 × 45s", category: "cardio", sets: 3, timer: 45 }
  ]},
  Thursday: { tag: "PULL", title: "Chain Strength", exercises: [
    { name: "Lat Pulldown", spec: "3 × 8–12", category: "pull", sets: 3 },
    { name: "Barbell Row", spec: "3 × 8", category: "pull", sets: 3 },
    { name: "One-Arm Dumbbell Row", spec: "3 × 10 (each arm)", category: "pull", sets: 3 },
    { name: "Seated Cable Row", spec: "3 × 10–12", category: "pull", sets: 3 },
    { name: "Hammer Curls", spec: "3 × 10", category: "pull", sets: 3 },
    { name: "Dumbbell Curls", spec: "3 × 10", category: "pull", sets: 3 },
    { name: "Farmer Carries", spec: "3 × 30s", category: "grip", sets: 3, timer: 30 },
    { name: "Dead Hangs", spec: "2 × Max Time", category: "grip", sets: 2, stopwatch: true }
  ]},
  Friday: { tag: "PUSH", title: "Explosive Output", exercises: [
    { name: "Barbell Bench Press", spec: "3 × 8", category: "push", sets: 3 },
    { name: "Incline Dumbbell Press", spec: "3 × 10", category: "push", sets: 3 },
    { name: "Dumbbell Shoulder Press", spec: "3 × 8", category: "push", sets: 3 },
    { name: "Lateral Raises", spec: "3 × 15", category: "push", sets: 3 },
    { name: "Push-Ups", spec: "2 × Near Failure", category: "push", sets: 2 },
    { name: "Cable Tricep Pushdowns", spec: "3 × 12", category: "push", sets: 3 },
    { name: "Close-Grip Bench Press", spec: "3 × 8", category: "push", sets: 3 },
    { name: "Plank Shoulder Taps", spec: "2 × 20", category: "push", sets: 2 }
  ]},
  Saturday: { tag: "REST", title: "Active Recovery", exercises: [
    { name: "20-30 Minute Walk", spec: "20–30 Mins", category: "cardio", sets: 1 },
    { name: "Stretching & Mobility", spec: "15 Mins", category: "legs", sets: 1 },
    { name: "Foam Rolling", spec: "Light", category: "pull", sets: 1 }
  ]}
};

export const QUOTES = [
  "EARN YOUR SLEEP.",
  "THE MAT DOES NOT LIE.",
  "PRESSURE CREATES DIAMONDS.",
  "TRAIN LIKE THE NO. 2 CONTENDER.",
  "OBSTACLES ARE OPPORTUNITIES.",
  "FATIGUE MAKES COWARDS OF US ALL.",
  "DO NOT PRAY FOR AN EASY LIFE, PRAY FOR THE STRENGTH TO ENDURE A DIFFICULT ONE."
];

export const RANKS = [
  { minLvl: 1, name: "WHITE BELT" },
  { minLvl: 5, name: "BLUE BELT" },
  { minLvl: 15, name: "PURPLE BELT" },
  { minLvl: 30, name: "BROWN BELT" },
  { minLvl: 50, name: "BLACK BELT" },
  { minLvl: 100, name: "MAT LEGEND" }
];

export const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256&h=256",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256&h=256",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256&h=256"
];

export interface WarmUpMove {
  name: string;
  duration: string;
  cue: string;
}

export interface WarmUpProtocol {
  title: string;
  focus: string;
  routine: WarmUpMove[];
}

export const WARM_UPS: Record<string, WarmUpProtocol> = {
  PULL: {
    title: "Pull Kinetic Integration",
    focus: "T-Spine Mobility, Scapular Shrugs & Grip Activation",
    routine: [
      { name: "Scapular Pull-Ups / Lat Shrugs", duration: "60s", cue: "Hang active, pull shoulder blades down and back without bending elbows" },
      { name: "Banded Pull-Aparts & Face Pulls", duration: "90s", cue: "Create tension, squeeze upper back and pull towards forehead" },
      { name: "Cat-Camel Thoracic Flow", duration: "60s", cue: "Synchronize spinal flexion and extension with deep nasal breathing" },
      { name: "Wrist Rolls & Grip Extenders", duration: "60s", cue: "Loosen fingers and forearms under light static reach" },
      { name: "Arm Swings & Chest Openers", duration: "30s", cue: "Release anterior shoulder tension prior to back warfare" }
    ]
  },
  PUSH: {
    title: "Push Rotator & Chest Prep",
    focus: "Shoulder Capsule Health & Anterior Chain Centering",
    routine: [
      { name: "Push-Up to Downward Dog", duration: "90s", cue: "Squeeze chest on push-up, pike hips back and press shoulders down" },
      { name: "Banded Over-and-Backs", duration: "60s", cue: "Keep arms straight, clear shoulder girdle cleanly with deep control" },
      { name: "Dynamic Cable/Band External Rotations", duration: "90s", cue: "Keep elbow pinned to rib cage, rotate outward to hit cuffs" },
      { name: "Prone Y-T-W Raises", duration: "60s", cue: "Activate lower middle traps, hold peak contractions for 2 seconds" }
    ]
  },
  LEGS: {
    title: "Leg Posterior/Hip Screw-In",
    focus: "Hip Flexion, Gluteal Fire-up & Ankle Dorsiflexion",
    routine: [
      { name: "Deep Goblet Prying Squats (Bodyweight)", duration: "90s", cue: "Sit deep, pry knees apart with elbows to open up groin and hips" },
      { name: "World's Greatest Stretch", duration: "90s", cue: "Deep lunge with elbow-to-ankle drop, rotate chest up to the sky" },
      { name: "Active Glute Bridges", duration: "60s", cue: "Drive heels into the floor, thrust hips and hold dry squeeze at top" },
      { name: "Dynamic Leg Swings (Front/Side)", duration: "60s", cue: "Swing loose to unlock hip capsules in all directions" }
    ]
  },
  ATHLETIC: {
    title: "Athletic Neural Drive Warm-up",
    focus: "Cardiovascular Ramp, Joint Splay & Kinetic Balance",
    routine: [
      { name: "Jumping Jacks & Arm Flaps", duration: "60s", cue: "Establish clean rhythm to elevate core heart rate smoothly" },
      { name: "Inchworm Walkouts + Shoulder Tap", duration: "90s", cue: "Hinge forward, crawl out to solid high plank, tap alternate shoulders" },
      { name: "World's Greatest Stretch", duration: "90s", cue: "Deep lunging thoracic opener for absolute total-body priming" },
      { name: "Air Squats to High-Knee Skip", duration: "60s", cue: "Fire up quick concentric leg extension to ramp CNS output" }
    ]
  },
  REST: {
    title: "Rest Day Joint Preservation Flow",
    focus: "Active Decompression & Parasympathetic Shift",
    routine: [
      { name: "Cat-Camel to Deep Child's Pose", duration: "90s", cue: "Sink hips heavily to heels, reach hands forward to decompress lats" },
      { name: "Shinbox 90/90 Rotation Switches", duration: "90s", cue: "Sit with legs bent 90-degrees, rotate hips side-to-side dynamically" },
      { name: "Thoracic Thread-The-Needle", duration: "60s", cue: "Reach arm deep under opposite armpit to twist mid-back" },
      { name: "Dynamic Neck & Wrist Rolls", duration: "60s", cue: "Slow therapeutic circles to remove high-intensity residue" }
    ]
  }
};

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  milestoneType: 'reps' | 'streak' | 'level' | 'warmups' | 'weight';
  targetValue: number;
  badgeName: string;
  badgeColor: string; // Tailwind gradient classes
  textColor: string;  // Text color on badge
  badgeIcon: string;  // Lucide icon name
  badgeGlow: string;  // Tailwind shadow/glow effect
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "reps_100",
    name: "Dojo Initiate",
    description: "Complete a total of 100 reps of combat exercises",
    milestoneType: "reps",
    targetValue: 100,
    badgeName: "100 REPS BRONZE",
    badgeColor: "from-amber-800 to-amber-700",
    textColor: "text-amber-100",
    badgeIcon: "Target",
    badgeGlow: "shadow-amber-900/30 border-amber-800/40"
  },
  {
    id: "reps_500",
    name: "Savage Striker",
    description: "Complete a total of 500 reps of combat exercises",
    milestoneType: "reps",
    targetValue: 500,
    badgeName: "500 REPS SILVER",
    badgeColor: "from-zinc-400 to-zinc-200",
    textColor: "text-zinc-950",
    badgeIcon: "Dumbbell",
    badgeGlow: "shadow-zinc-500/30 border-zinc-300/40"
  },
  {
    id: "reps_1000",
    name: "Centurion of Steel",
    description: "Complete a total of 1,000 reps of combat exercises",
    milestoneType: "reps",
    targetValue: 1000,
    badgeName: "1,000 REPS GOLD",
    badgeColor: "from-amber-400 via-yellow-300 to-orange-400",
    textColor: "text-amber-950",
    badgeIcon: "Trophy",
    badgeGlow: "shadow-amber-500/40 border-amber-300/50"
  },
  {
    id: "streak_3",
    name: "Iron Consistency",
    description: "Build a consecutive 3-day workout activity streak",
    milestoneType: "streak",
    targetValue: 3,
    badgeName: "3-DAY STREAK",
    badgeColor: "from-orange-600 to-rose-600",
    textColor: "text-orange-50",
    badgeIcon: "Zap",
    badgeGlow: "shadow-orange-600/30 border-orange-500/40"
  },
  {
    id: "streak_7",
    name: "Path of the Ascendant",
    description: "Build a consecutive 7-day workout activity streak",
    milestoneType: "streak",
    targetValue: 7,
    badgeName: "7-DAY MYSTIC",
    badgeColor: "from-purple-600 via-fuchsia-600 to-pink-600",
    textColor: "text-purple-50",
    badgeIcon: "Flame",
    badgeGlow: "shadow-fuchsia-500/40 border-fuchsia-400/50"
  },
  {
    id: "level_5",
    name: "Temple Master",
    description: "Elevate your character level to lvl 5 or higher",
    milestoneType: "level",
    targetValue: 5,
    badgeName: "LEVEL 5 GURU",
    badgeColor: "from-indigo-600 via-blue-600 to-cyan-500",
    textColor: "text-indigo-50",
    badgeIcon: "Award",
    badgeGlow: "shadow-indigo-500/40 border-indigo-400/50"
  },
  {
    id: "warmups_3",
    name: "Synovial Sentinel",
    description: "Complete 3 full dojo warm-up routine protocols",
    milestoneType: "warmups",
    targetValue: 3,
    badgeName: "WARMUP ELITE",
    badgeColor: "from-emerald-600 to-teal-500",
    textColor: "text-emerald-50",
    badgeIcon: "Activity",
    badgeGlow: "shadow-emerald-500/30 border-emerald-400/40"
  },
  {
    id: "weight_150",
    name: "Titan Destroyer",
    description: "Log any heavy combat lift with 150 lbs or more",
    milestoneType: "weight",
    targetValue: 150,
    badgeName: "150+ LBS MASS",
    badgeColor: "from-rose-700 via-red-600 to-orange-500",
    textColor: "text-rose-50",
    badgeIcon: "Dumbbell",
    badgeGlow: "shadow-rose-600/40 border-rose-500/50"
  }
];


