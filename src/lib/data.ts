import type { Exercise, Workout, WorkoutLog, BodyMeasurement } from './types';

export const exercises: Exercise[] = [
  {
    id: 'ex1',
    name: 'Жим лежа',
    description: 'Лягте на горизонтальную скамью и выжмите штангу от груди.',
    type: 'weighted',
    muscleGroup: 'Грудь',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'barbell bench',
    defaultSets: 3,
    defaultReps: 8,
    defaultWeight: 80,
    defaultRestDuration: 90,
  },
  {
    id: 'ex2',
    name: 'Приседания со штангой',
    description: 'Опустите бедра из положения стоя, а затем вернитесь в исходное положение.',
    type: 'weighted',
    muscleGroup: 'Ноги',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'barbell squat',
    defaultSets: 3,
    defaultReps: 8,
    defaultWeight: 100,
    defaultRestDuration: 120,
  },
  {
    id: 'ex3',
    name: 'Становая тяга',
    description: 'Поднимите нагруженную штангу с пола до уровня бедер, затем контролируемо опустите ее обратно.',
    type: 'weighted',
    muscleGroup: 'Спина',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'barbell deadlift',
    defaultSets: 1,
    defaultReps: 5,
    defaultWeight: 120,
    defaultRestDuration: 180,
  },
  {
    id: 'ex4',
    name: 'Армейский жим',
    description: 'Выжмите штангу или гантели от плеч над головой.',
    type: 'weighted',
    muscleGroup: 'Плечи',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'overhead press',
    defaultSets: 3,
    defaultReps: 8,
    defaultWeight: 50,
    defaultRestDuration: 90,
  },
  {
    id: 'ex5',
    name: 'Подтягивания',
    description: 'Поднимите тело вверх руками, пока подбородок не окажется над перекладиной.',
    type: 'weighted',
    muscleGroup: 'Спина',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'man pullup',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 0,
    defaultRestDuration: 60,
  },
  {
    id: 'ex6',
    name: 'Планка',
    description: 'Удерживайте положение, как при отжиманиях, опираясь на предплечья.',
    type: 'timed-distance',
    muscleGroup: 'Кор',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'woman plank',
    defaultSets: 3,
    defaultDuration: 60,
    defaultRestDuration: 30,
  },
   {
    id: 'ex7',
    name: 'Бег',
    description: 'Бегите в постоянном темпе на беговой дорожке или на улице.',
    type: 'timed-distance',
    muscleGroup: 'Кардио',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'woman running',
    defaultSets: 1,
    defaultDistance: 3,
    defaultDuration: 1200,
    defaultRestDuration: 0,
  },
  {
    id: 'ex8',
    name: 'Сгибание рук с гантелями',
    description: 'Сгибайте руки с гантелями к плечам, держа локти неподвижно.',
    type: 'weighted',
    muscleGroup: 'Бицепс',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'dumbbell curl',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 15,
    defaultRestDuration: 60,
  },
];

export const workouts: Workout[] = [
  {
    id: 'w1',
    name: 'Силовая на все тело A',
    description: 'Комплексная тренировка на все тело, с фокусом на основные группы мышц.',
    exercises: [
      { exerciseId: 'ex2', sets: 3, reps: 8, weight: 100 }, // Приседания
      { exerciseId: 'ex1', sets: 3, reps: 8, weight: 80 }, // Жим лежа
      { exerciseId: 'ex3', sets: 1, reps: 5, weight: 120 }, // Становая тяга
    ],
  },
  {
    id: 'w2',
    name: 'Силовая на все тело B',
    description: 'Альтернативная тренировка на все тело для сбалансированной программы.',
    exercises: [
      { exerciseId: 'ex2', sets: 3, reps: 8, weight: 105 }, // Приседания
      { exerciseId: 'ex4', sets: 3, reps: 8, weight: 50 }, // Армейский жим
      { exerciseId: 'ex5', sets: 3, reps: 8, weight: 10 }, // Подтягивания
    ],
  },
  {
    id: 'w3',
    name: 'Кардио и Кор',
    description: 'Тренировка для улучшения сердечно-сосудистой системы и укрепления кора.',
    exercises: [
      { exerciseId: 'ex7', sets: 1, distance: 3, duration: 1200, reps: 1 }, // Бег
      { exerciseId: 'ex6', sets: 3, duration: 60, reps: 1 }, // Планка
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
