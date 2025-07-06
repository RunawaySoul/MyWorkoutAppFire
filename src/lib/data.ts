import type { Exercise, Workout, WorkoutLog, BodyMeasurement } from './types';

export const exercises: Exercise[] = [
  {
    id: 'ex1',
    name: 'Barbell Bench Press',
    description: 'Lie on a flat bench and press a barbell up from your chest.',
    type: 'weighted',
    muscleGroup: 'Chest',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'barbell bench',
  },
  {
    id: 'ex2',
    name: 'Squat',
    description: 'Lower your hips from a standing position and then stand back up.',
    type: 'weighted',
    muscleGroup: 'Legs',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'barbell squat',
  },
  {
    id: 'ex3',
    name: 'Deadlift',
    description: 'Lift a loaded barbell or bar off the ground to the hips, then controllably lower it back to the ground.',
    type: 'weighted',
    muscleGroup: 'Back',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'barbell deadlift',
  },
  {
    id: 'ex4',
    name: 'Overhead Press',
    description: 'Press a barbell or dumbbells from your shoulders to overhead.',
    type: 'weighted',
    muscleGroup: 'Shoulders',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'overhead press',
  },
  {
    id: 'ex5',
    name: 'Pull Up',
    description: 'Lift your body up with your arms until your chin is over the bar.',
    type: 'weighted',
    muscleGroup: 'Back',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'man pullup',
  },
  {
    id: 'ex6',
    name: 'Plank',
    description: 'Hold a push-up position, resting on your forearms.',
    type: 'timed',
    muscleGroup: 'Core',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'woman plank',
  },
   {
    id: 'ex7',
    name: 'Running',
    description: 'Run at a steady pace on a treadmill or outdoors.',
    type: 'distance',
    muscleGroup: 'Cardio',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'woman running',
  },
  {
    id: 'ex8',
    name: 'Dumbbell Curl',
    description: 'Curl dumbbells up towards your shoulders, keeping your elbows stationary.',
    type: 'weighted',
    muscleGroup: 'Biceps',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'dumbbell curl',
  },
];

export const workouts: Workout[] = [
  {
    id: 'w1',
    name: 'Full Body Strength A',
    description: 'A comprehensive full-body workout focusing on major muscle groups.',
    exercises: [
      { exerciseId: 'ex2', sets: 3, reps: 8 }, // Squat
      { exerciseId: 'ex1', sets: 3, reps: 8 }, // Bench Press
      { exerciseId: 'ex3', sets: 1, reps: 5 }, // Deadlift
    ],
  },
  {
    id: 'w2',
    name: 'Full Body Strength B',
    description: 'An alternative full-body session to balance your routine.',
    exercises: [
      { exerciseId: 'ex2', sets: 3, reps: 8 }, // Squat
      { exerciseId: 'ex4', sets: 3, reps: 8 }, // Overhead Press
      { exerciseId: 'ex5', sets: 3, reps: 8 }, // Pull Up
    ],
  },
  {
    id: 'w3',
    name: 'Cardio & Core',
    description: 'A workout to boost cardiovascular health and strengthen your core.',
    exercises: [
      { exerciseId: 'ex7', sets: 1, distance: 3000 }, // Running
      { exerciseId: 'ex6', sets: 3, duration: 60 }, // Plank
    ],
  },
];

export const workoutLogs: WorkoutLog[] = [
    { id: 'log1', workoutId: 'w1', date: '2024-07-01T08:00:00Z', duration: 60 },
    { id: 'log2', workoutId: 'w2', date: '2024-07-03T08:00:00Z', duration: 55 },
    { id: 'log3', workoutId: 'w3', date: '2024-07-05T08:00:00Z', duration: 45 },
    { id: 'log4', workoutId: 'w1', date: '2024-07-08T08:00:00Z', duration: 65 },
    { id: 'log5', workoutId: 'w2', date: '2024-07-10T08:00:00Z', duration: 58 },
    { id: 'log6', workoutId: 'w3', date: '2024-07-12T08:00:00Z', duration: 48 },
];

export const bodyMeasurements: BodyMeasurement[] = [
    { date: '2024-05-01', weight: 85.5 },
    { date: '2024-05-15', weight: 85.0 },
    { date: '2024-06-01', weight: 84.7 },
    { date: '2024-06-15', weight: 84.2 },
    { date: '2024-07-01', weight: 83.9 },
    { date: '2024-07-15', weight: 83.5 },
];
