import { WorkoutDay } from "./types";

export const WORKOUTS: Record<string, WorkoutDay> = {
  Sunday: { tag: "PULL", title: "Back & Grip Warfare", exercises: [
    { name: "Lat Pulldown", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "Barbell Row", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "One-Arm Dumbbell Row", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "Seated Cable Row", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "Hammer Curls", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "Dumbbell Curls", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "Farmer Carries", spec: "2 × to failure", category: "grip", sets: 2 },
    { name: "Dead Hangs", spec: "2 × to failure", category: "grip", sets: 2, bodyweight: true }
  ]},
  Monday: { tag: "PUSH", title: "Chest & Shoulder Siege", exercises: [
    { name: "Incline Dumbbell Press", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Dumbbell Bench Press", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Dumbbell Shoulder Press", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Lateral Raises", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Push-Ups", spec: "2 × to failure", category: "push", sets: 2, bodyweight: true },
    { name: "Cable Tricep Pushdowns", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Dumbbell Tricep Kickbacks", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Plank Shoulder Taps", spec: "2 × to failure", category: "push", sets: 2, bodyweight: true }
  ]},
  Tuesday: { tag: "LEGS", title: "Lower Body Engine", exercises: [
    { name: "Barbell Squat", spec: "2 × to failure", category: "legs", sets: 2 },
    { name: "Romanian Deadlift", spec: "2 × to failure", category: "legs", sets: 2 },
    { name: "Walking Lunges", spec: "2 × to failure", category: "legs", sets: 2, bodyweight: true },
    { name: "Goblet Squats", spec: "2 × to failure", category: "legs", sets: 2 },
    { name: "Calf Raises", spec: "2 × to failure", category: "legs", sets: 2, bodyweight: true },
    { name: "Hanging Knee Raises", spec: "2 × to failure", category: "legs", sets: 2, bodyweight: true },
    { name: "Plank", spec: "2 × to failure", category: "cardio", sets: 2, bodyweight: true },
    { name: "Russian Twists", spec: "2 × to failure", category: "cardio", sets: 2, bodyweight: true }
  ]},
  Wednesday: { tag: "ATHLETIC", title: "Combat Conditioning", exercises: [
    { name: "Burpees", spec: "2 × to failure", category: "cardio", sets: 2, bodyweight: true },
    { name: "Mountain Climbers", spec: "2 × to failure", category: "cardio", sets: 2, bodyweight: true },
    { name: "Jump Squats", spec: "2 × to failure", category: "legs", sets: 2, bodyweight: true },
    { name: "Bear Crawls", spec: "2 × to failure", category: "cardio", sets: 2, bodyweight: true },
    { name: "Farmer Carries", spec: "2 × to failure", category: "grip", sets: 2 },
    { name: "Dead Hangs", spec: "2 × to failure", category: "grip", sets: 2, bodyweight: true },
    { name: "Push-Ups", spec: "2 × to failure", category: "push", sets: 2, bodyweight: true },
    { name: "Plank", spec: "2 × to failure", category: "cardio", sets: 2, bodyweight: true }
  ]},
  Thursday: { tag: "PULL", title: "Chain Strength", exercises: [
    { name: "Lat Pulldown", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "Barbell Row", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "One-Arm Dumbbell Row", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "Seated Cable Row", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "Hammer Curls", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "Dumbbell Curls", spec: "2 × to failure", category: "pull", sets: 2 },
    { name: "Farmer Carries", spec: "2 × to failure", category: "grip", sets: 2 },
    { name: "Dead Hangs", spec: "2 × to failure", category: "grip", sets: 2, bodyweight: true }
  ]},
  Friday: { tag: "PUSH", title: "Explosive Output", exercises: [
    { name: "Incline Dumbbell Press", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Dumbbell Bench Press", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Dumbbell Shoulder Press", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Lateral Raises", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Push-Ups", spec: "2 × to failure", category: "push", sets: 2, bodyweight: true },
    { name: "Cable Tricep Pushdowns", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Dumbbell Tricep Kickbacks", spec: "2 × to failure", category: "push", sets: 2 },
    { name: "Plank Shoulder Taps", spec: "2 × to failure", category: "push", sets: 2, bodyweight: true }
  ]},
  Saturday: { tag: "REST", title: "Active Recovery", exercises: [
    { name: "20-30 Minute Walk", spec: "20–30 Mins", category: "cardio", sets: 1, bodyweight: true },
    { name: "Stretching & Mobility", spec: "15 Mins", category: "legs", sets: 1, bodyweight: true },
    { name: "Foam Rolling", spec: "Light", category: "pull", sets: 1, bodyweight: true }
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


