
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Workout, Exercise, AppData, WorkoutLog } from '@/lib/types';
import { PlusCircle, ArrowRight, MoreVertical, Edit, Trash2, Info, RotateCw } from 'lucide-react';
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
import { getAppData, saveAppData } from '@/lib/actions';
import { ScrollArea } from '@/components/ui/scroll-area';

function WorkoutCard({ 
    workout, 
    exercises, 
    inProgressLog,
    onEdit, 
    onDelete, 
    onView,
    onStartOver 
}: { 
    workout: Workout, 
    exercises: Exercise[], 
    inProgressLog?: WorkoutLog | null,
    onEdit: () => void, 
    onDelete: () => void, 
    onView: () => void,
    onStartOver: () => void
}) {
  const router = useRouter();
  const workoutExercises = workout.exercises
    .map((we) => exercises.find((e) => e.id === we.exerciseId))
    .filter((e): e is Exercise => !!e);

  const muscleGroups = [
    ...new Set(workoutExercises.map((e) => e!.muscleGroup)),
  ];

  const handleStartNew = () => {
    onStartOver();
    router.push(`/workouts/${workout.id}`);
  };

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
                <DropdownMenuItem onClick={onView}>
                  <Info className="mr-2 h-4 w-4" />
                  Подробнее
                </DropdownMenuItem>
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
      <CardFooter className="flex flex-col items-stretch gap-2">
        {inProgressLog ? (
            <>
                <Button asChild className="w-full">
                    <Link href={`/workouts/${workout.id}`}>
                        Продолжить тренировку <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={handleStartNew}>
                    Начать заново <RotateCw className="ml-2 h-4 w-4" />
                </Button>
            </>
        ) : (
            <Button asChild className="w-full">
              <Link href={`/workouts/${workout.id}`}>
                Начать тренировку <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function WorkoutsPage() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    async function loadData() {
        try {
            const data = await getAppData();
            setAppData(data);
        } catch (error) {
            console.error("Failed to load data:", error);
        }
    }
    loadData();
  }, []);

  const handleSaveWorkout = async (data: Omit<Workout, 'id'>, id?: string) => {
    if(!appData) return;

    let newWorkouts: Workout[];
    if (id) {
        newWorkouts = appData.workouts.map(w => w.id === id ? { ...w, ...data, id: w.id } : w);
    } else {
        const newWorkout: Workout = {
            id: `w${Date.now()}`,
            ...data,
        };
        newWorkouts = [...appData.workouts, newWorkout];
    }
    const newData = {...appData, workouts: newWorkouts};
    await saveAppData(newData);
    setAppData(newData);

    setIsDialogOpen(false);
    setEditingWorkout(null);
  };
  
  const handleStartOver = async (workoutId: string) => {
    if (!appData) return;
    const updatedLogs = appData.workoutLogs.filter(log => !(log.workoutId === workoutId && log.status === 'in-progress'));
    const newData = { ...appData, workoutLogs: updatedLogs };
    await saveAppData(newData);
    setAppData(newData);
  };

  const handleOpenCreateDialog = () => {
    setEditingWorkout(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (workout: Workout) => {
    setViewingWorkout(workout);
  };

  const handleOpenDeleteAlert = (workoutId: string) => {
    setDeletingWorkoutId(workoutId);
    setIsAlertOpen(true);
  };

  const handleDeleteWorkout = async () => {
    if (deletingWorkoutId && appData) {
        const newWorkouts = appData.workouts.filter(w => w.id !== deletingWorkoutId);
        const newData = {...appData, workouts: newWorkouts };
        await saveAppData(newData);
        setAppData(newData);
    }
    setIsAlertOpen(false);
    setDeletingWorkoutId(null);
  };

  const handleCancelDialog = () => {
    setIsDialogOpen(false);
    setEditingWorkout(null);
  };

  if (!appData) {
    return <div>Загрузка тренировок...</div>;
  }
  
  const { workouts, exercises, workoutLogs } = appData;

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
        {workouts.map((workout) => {
          const inProgressLog = workoutLogs.find(log => log.workoutId === workout.id && log.status === 'in-progress');
          return (
            <WorkoutCard 
              key={workout.id} 
              workout={workout} 
              exercises={exercises}
              inProgressLog={inProgressLog}
              onView={() => handleOpenViewDialog(workout)}
              onEdit={() => handleOpenEditDialog(workout)}
              onDelete={() => handleOpenDeleteAlert(workout.id)}
              onStartOver={() => handleStartOver(workout.id)}
            />
          )
        })}
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

      <Dialog open={!!viewingWorkout} onOpenChange={(isOpen) => !isOpen && setViewingWorkout(null)}>
        <DialogContent className="max-w-md">
            {viewingWorkout && (
                <>
                    <DialogHeader>
                        <DialogTitle>{viewingWorkout.name}</DialogTitle>
                        <DialogDescription>{viewingWorkout.description}</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                      <div className="space-y-4 py-4 pr-6">
                          {viewingWorkout.exercises.map((we, index) => {
                              const exercise = exercises.find(e => e.id === we.exerciseId);
                              if (!exercise) return null;
                              return (
                                  <div key={index} className="p-3 rounded-md border bg-muted/50">
                                      <h4 className="font-semibold">{exercise.name}</h4>
                                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                                          <li>Подходы: {we.sets}</li>
                                          {we.reps != null && <li>Повторения: {we.reps}</li>}
                                          {we.weight != null && <li>Вес: {we.weight} кг</li>}
                                          {we.duration != null && <li>Длительность: {we.duration} сек</li>}
                                          {we.distance != null && <li>Дистанция: {we.distance} км</li>}
                                          {we.restDuration != null && <li>Отдых: {we.restDuration} сек</li>}
                                      </ul>
                                  </div>
                              );
                          })}
                      </div>
                    </ScrollArea>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

    