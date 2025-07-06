export interface Exercise {
  id: string;
  name: string;
  description?: string;
  type: 'weighted' | 'timed-distance';
  muscleGroup: string;
  imageUrl?: string;
  aiHint?: string;
  color?: string;
  defaultSets?: number;
  defaultReps?: number;
  defaultWeight?: number;
  defaultDuration?: number; // in seconds
  defaultDistance?: number; // in kilometers
  defaultRestDuration?: number; // in seconds
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  duration?: number; // in seconds
  distance?: number; // in kilometers
  weight?: number; // in kg
  restDuration?: number; // in seconds
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  date: string; // ISO 8601 format
  duration: number; // in minutes
}

export interface BodyMeasurement {
  date: string; // YYYY-MM-DD
  weight: number;
}
