"use client";

import { useState, useEffect } from 'react';
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
import { workouts as initialWorkouts, exercises as initialExercises } from '@/lib/data';
import type { Workout, Exercise } from '@/lib/types';
import { PlusCircle, ArrowRight, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { CreateWorkoutForm } from '@/components/forms/create-workout-form';
import { getAppData, saveWorkouts } from '@/lib/actions';


function WorkoutCard({ workout, exercises, onEdit, onDelete }: { workout: Workout, exercises: Exercise[], onEdit: () => void, onDelete: () => void }) {
  const workoutExercises = workout.exercises
    .map((we) => exercises.find((e) => e.id === we.exerciseId))
    .filter((e): e is Exercise => !!e);

  const muscleGroups = [
    ...new Set(workoutExercises.map((e) => e!.muscleGroup)),
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
            <div>
              <CardTitle className="font-headline">{workout.name}</CardTitle>
              <CardDescription>{workout.description}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
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
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
        try {
            const data = await getAppData();
            setWorkouts(data.workouts);
            setExercises(data.exercises);
        } catch (error) {
            console.error("Failed to load data:", error);
            setWorkouts(initialWorkouts);
            setExercises(initialExercises);
        }
        setIsDataLoaded(true);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      saveWorkouts(workouts).catch(error => {
        console.error("Failed to save workouts:", error);
        // Optionally: show a toast notification for the user
      });
    }
  }, [workouts, isDataLoaded]);

  const handleSaveWorkout = (data: Omit<Workout, 'id'>, id?: string) => {
    if (id) {
        setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...data, id: w.id } : w));
    } else {
        const newWorkout: Workout = {
            id: `w${Date.now()}`,
            ...data,
        };
        setWorkouts((prev) => [...prev, newWorkout]);
    }
    setIsDialogOpen(false);
    setEditingWorkout(null);
  };

  const handleOpenCreateDialog = () => {
    setEditingWorkout(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsDialogOpen(true);
  };

  const handleOpenDeleteAlert = (workoutId: string) => {
    setDeletingWorkoutId(workoutId);
    setIsAlertOpen(true);
  };

  const handleDeleteWorkout = () => {
    if (deletingWorkoutId) {
        setWorkouts(prev => prev.filter(w => w.id !== deletingWorkoutId));
    }
    setIsAlertOpen(false);
    setDeletingWorkoutId(null);
  };

  const handleCancelDialog = () => {
    setIsDialogOpen(false);
    setEditingWorkout(null);
  };

  if (!isDataLoaded) {
    return <div>Загрузка тренировок...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-headline">Мои тренировки</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={handleOpenCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Создать тренировку
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingWorkout ? 'Редактировать тренировку' : 'Новая тренировка'}</DialogTitle>
              <DialogDescription>
                {editingWorkout ? 'Измените информацию и состав упражнений.' : 'Заполните информацию и добавьте упражнения, чтобы создать новую тренировку.'}
              </DialogDescription>
            </DialogHeader>
            <CreateWorkoutForm
              allExercises={exercises}
              onFormSubmit={handleSaveWorkout}
              onCancel={handleCancelDialog}
              initialData={editingWorkout}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workouts.map((workout) => (
          <WorkoutCard 
            key={workout.id} 
            workout={workout} 
            exercises={exercises}
            onEdit={() => handleOpenEditDialog(workout)}
            onDelete={() => handleOpenDeleteAlert(workout.id)}
            />
        ))}
      </div>
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. Тренировка будет навсегда удалена.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingWorkoutId(null)}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkout} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
