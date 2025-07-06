export type ExerciseStatus = 'pending' | 'completed' | 'skipped';

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
  date: string; // ISO 8601 format for start time
  status: 'in-progress' | 'completed';
  currentExerciseIndex: number;
  exerciseStatuses: Record<number, ExerciseStatus>;
  endTime?: string; // ISO 8601 format
}

export interface BodyMeasurement {
  datetime: string; // ISO 8601 format
  weight: number;
}

export interface AppData {
  exercises: Exercise[];
  workouts: Workout[];
  workoutLogs: WorkoutLog[];
  bodyMeasurements: BodyMeasurement[];
}
