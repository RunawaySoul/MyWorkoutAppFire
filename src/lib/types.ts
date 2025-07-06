export interface Exercise {
  id: string;
  name: string;
  description: string;
  type: 'weighted' | 'timed' | 'distance';
  muscleGroup: string;
  imageUrl: string;
  aiHint?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
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
