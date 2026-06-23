export interface AthleteProfile {
  id: string;
  name: string;
  completedSets: Record<string, boolean>; // key: "YYYY-MM-DD-day-exerciseIdx-setIdx"
  savedWeights: Record<string, string>; // key: exerciseName -> weight
  avatarUrl: string;

  streak?: number;
  lastActiveDate?: string;
  personalBests?: Record<string, number>;
  
  // Student athlete additional fields
  age?: number;
  height?: string;
  weight?: number; // body weight in lbs
  sport?: string; // "Wrestling" | "Football" | "Track" | "General Strength"
  goals?: string;
  equipment?: "Full Gym" | "Dumbbells Only" | "Bodyweight";
  
  // Logs & History
  bodyWeightLogs?: { date: string; weight: number }[];
  completedWorkouts?: { date: string; dayName: string; durationMs?: number; volumeLoad?: number; count?: number }[];
}

export interface Exercise {
  name: string;
  spec: string;
  category: "pull" | "push" | "legs" | "grip" | "cardio";
  sets: number;
  timer?: number;
  stopwatch?: boolean;
  bodyweight?: boolean;
}

export interface WorkoutDay {
  tag: string;
  title: string;
  exercises: Exercise[];
}
