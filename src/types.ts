export interface CharacterProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  attributes: {
    pull: number;
    push: number;
    legs: number;
    grip: number;
    cardio: number;
  };
  attrXp: {
    pull: number;
    push: number;
    legs: number;
    grip: number;
    cardio: number;
  };
  completedSets: Record<string, boolean>; // key: "day-exerciseIdx-setIdx"
  savedWeights: Record<string, string>; // key: exerciseName -> weight
  avatarUrl: string;
  dailyRituals?: Record<string, boolean>; // key: "ritualName"
  totalReps?: number;
  streak?: number;
  achievements?: string[];
  badgeShowcase?: string;
  lastActiveDate?: string;
  warmupsCompleted?: number;
  personalBests?: Record<string, number>;
  
  // Student athlete additional fields
  age?: number;
  height?: string;
  weight?: number; // body weight in lbs
  sport?: string; // "Wrestling" | "Football" | "Track" | "General Strength"
  goals?: string;
  
  // Wrestling/Athletics Mode ratings and phase
  wrestlingPhase?: string; // "Off Season" | "Pre Season" | "In Season" | "Post Season"
  gripRating?: number; // 0-10
  conditioningRating?: number; // 0-10
  pullupsRating?: number; // 0-10
  deadhangsRating?: number; // 0-10
  farmercarriesRating?: number; // 0-10
  
  // Logs & History
  bodyWeightLogs?: { date: string; weight: number }[];
  completedWorkouts?: { date: string; dayName: string; count: number }[];
}

export interface Exercise {
  name: string;
  spec: string;
  category: "pull" | "push" | "legs" | "grip" | "cardio";
  sets: number;
  timer?: number;
  stopwatch?: boolean;
}

export interface WorkoutDay {
  tag: string;
  title: string;
  exercises: Exercise[];
}
