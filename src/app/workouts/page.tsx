"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { workouts as initialWorkouts, exercises } from '@/lib/data';
import type { Workout, Exercise } from '@/lib/types';
import { PlusCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreateWorkoutForm } from '@/components/forms/create-workout-form';

function WorkoutCard({ workout }: { workout: Workout }) {
  const workoutExercises = workout.exercises
    .map((we) => exercises.find((e) => e.id === we.exerciseId))
    .filter((e): e is Exercise => !!e);

  const muscleGroups = [
    ...new Set(workoutExercises.map((e) => e!.muscleGroup)),
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">{workout.name}</CardTitle>
        <CardDescription>{workout.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {muscleGroups.map((mg) => (
            <Badge key={mg} variant="secondary">
              {mg}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href={`/workouts/${workout.id}`}>
            Начать тренировку <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddWorkout = (data: Omit<Workout, 'id'>) => {
    const newWorkout: Workout = {
      id: `w${workouts.length + 1 + Math.random()}`,
      ...data,
    };
    setWorkouts((prev) => [...prev, newWorkout]);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-headline">Мои тренировки</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Создать тренировку
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Новая тренировка</DialogTitle>
              <DialogDescription>
                Заполните информацию и добавьте упражнения, чтобы создать новую
                тренировку.
              </DialogDescription>
            </DialogHeader>
            <CreateWorkoutForm
              allExercises={exercises}
              onFormSubmit={handleAddWorkout}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>
    </div>
  );
}
