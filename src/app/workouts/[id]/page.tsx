"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import { workouts as initialWorkouts, exercises as initialExercises } from "@/lib/data";
import type { Workout, Exercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Timer, Flame, CheckCircle, Check, X } from "lucide-react";
import { getAppData } from "@/lib/actions";

type ExerciseStatus = 'pending' | 'completed' | 'skipped';

export default function WorkoutPlayerPage() {
  const params = useParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // State for workout player logic
  const [exerciseStatuses, setExerciseStatuses] = useState<Record<number, ExerciseStatus>>({});
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [exerciseTimerActive, setExerciseTimerActive] = useState(false);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(0);

  useEffect(() => {
    async function loadData() {
        try {
            const data = await getAppData();
            const foundWorkout = data.workouts.find((w) => w.id === params.id);
            if (foundWorkout) {
                setWorkout(foundWorkout);
                const initialStatuses: Record<number, ExerciseStatus> = {};
                foundWorkout.exercises.forEach((_, index) => {
                    initialStatuses[index] = 'pending';
                });
                setExerciseStatuses(initialStatuses);
            }
            setAllExercises(data.exercises);
        } catch (error) {
            console.error("Failed to load data:", error);
            const foundWorkout = initialWorkouts.find((w) => w.id === params.id);
            setWorkout(foundWorkout || null);
            setAllExercises(initialExercises);
        }
        setIsDataLoaded(true);
    }
    if (params.id) {
        loadData();
    }
  }, [params.id]);

  const setExercise = (index: number) => {
    if (!workout || index < 0 || index >= workout.exercises.length) {
        return;
    }
    setCurrentExerciseIndex(index);
    setExerciseTimerActive(false); // This will be handled by the auto-start useEffect
    setIsResting(false);
  };
  
  const handleNext = useCallback(() => {
    if (!workout) return;
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setExercise(currentExerciseIndex + 1);
    } else {
      setIsFinished(true);
    }
  }, [workout, currentExerciseIndex]);

  const handlePrev = useCallback(() => {
    if (currentExerciseIndex > 0) {
      setExercise(currentExerciseIndex - 1);
    }
  }, [currentExerciseIndex]);

  const handleMarkComplete = useCallback(() => {
    if (!workout) return;
    setExerciseStatuses(prev => ({ ...prev, [currentExerciseIndex]: 'completed' }));
    setExerciseTimerActive(false);

    const restDuration = workout.exercises[currentExerciseIndex]?.restDuration;
    if (restDuration && restDuration > 0) {
      setRestTimeLeft(restDuration);
      setIsResting(true);
    } else {
      handleNext();
    }
  }, [workout, currentExerciseIndex, handleNext]);

  // Auto-start timer when exercise changes
  useEffect(() => {
    if (!workout || isResting || !isDataLoaded) return;
    
    const currentWorkoutEx = workout.exercises[currentExerciseIndex];
    if (!currentWorkoutEx) return;

    const currentEx = allExercises.find(e => e.id === currentWorkoutEx.exerciseId);
    
    if (currentEx?.type === 'timed-distance' && currentWorkoutEx?.duration) {
      setExerciseTimeLeft(currentWorkoutEx.duration);
      setExerciseTimerActive(true);
    } else {
      setExerciseTimerActive(false);
    }
  }, [currentExerciseIndex, workout, allExercises, isResting, isDataLoaded]);

  // Timer for the exercise itself
  useEffect(() => {
    if (!exerciseTimerActive) {
      return;
    }
    
    if (exerciseTimeLeft <= 0) {
      handleMarkComplete();
      return;
    }

    const intervalId = setInterval(() => {
      setExerciseTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [exerciseTimerActive, exerciseTimeLeft, handleMarkComplete]);

  // Timer for rest periods
  useEffect(() => {
    if (!isResting || restTimeLeft <= 0) {
      if (restTimeLeft <= 0 && isResting) {
        setIsResting(false);
        handleNext();
      }
      return;
    }

    const intervalId = setInterval(() => {
      setRestTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isResting, restTimeLeft, handleNext]);

  const handleSkip = () => {
      setExerciseStatuses(prev => ({ ...prev, [currentExerciseIndex]: 'skipped' }));
      setExerciseTimerActive(false);
      setIsResting(false); // Ensure rest is cancelled if skipping
      handleNext();
  };
  
  const handleToggleExerciseTimer = () => {
    setExerciseTimerActive(prev => !prev);
  };
  
  const getNextExerciseName = () => {
    if (!workout || currentExerciseIndex >= workout.exercises.length - 1) {
        return "Тренировка почти завершена!";
    }
    const nextWorkoutExercise = workout.exercises[currentExerciseIndex + 1];
    const nextExercise = allExercises.find(e => e.id === nextWorkoutExercise?.exerciseId);
    return nextExercise?.name || "";
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!isDataLoaded) {
    return <div>Загрузка тренировки...</div>;
  }

  if (!workout) {
    return <div>Тренировка не найдена.</div>;
  }
  
  const currentWorkoutExercise = workout.exercises[currentExerciseIndex];
  const currentExercise = allExercises.find(e => e.id === currentWorkoutExercise.exerciseId);

  const completedCount = Object.values(exerciseStatuses).filter(s => s !== 'pending').length;
  const progressPercentage = (completedCount / workout.exercises.length) * 100;

  if(isFinished) {
    const finalCompletedCount = Object.values(exerciseStatuses).filter(s => s === 'completed').length;
    return (
        <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <CardTitle className="text-3xl font-headline mt-4">Тренировка завершена!</CardTitle>
                <CardDescription>Отличная работа! Вы завершили тренировку "{workout.name}".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-lg">
                    Вы выполнили <span className="font-bold text-primary">{finalCompletedCount}</span> из <span className="font-bold">{workout.exercises.length}</span> упражнений.
                </div>
                <Button asChild>
                    <Link href="/workouts">К тренировкам</Link>
                </Button>
            </CardContent>
        </Card>
    );
  }

  if(!currentExercise) {
      return <div>Упражнение не найдено.</div>
  }

  if (isResting) {
    return (
      <div className="flex flex-col gap-4">
        <Card>
            <CardHeader>
                <Progress value={progressPercentage} />
                <div className="flex justify-between items-baseline mt-2">
                    <CardTitle className="font-headline text-2xl">{workout.name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Flame className="h-4 w-4" />
                        <span>{currentExerciseIndex + 1} / {workout.exercises.length}</span>
                    </div>
                </div>
            </CardHeader>
        </Card>
        <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
            <CardHeader>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Timer className="h-8 w-8"/>
                  <CardTitle className="text-3xl font-headline">Отдых</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-8xl font-bold my-4 text-primary">{formatTime(restTimeLeft)}</p>
              <p className="text-muted-foreground">Следующее упражнение: {getNextExerciseName()}</p>
            </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
        <Card>
            <CardHeader>
                <Progress value={progressPercentage} />
                <div className="flex justify-between items-baseline mt-2">
                    <CardTitle className="font-headline text-2xl">{workout.name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Flame className="h-4 w-4" />
                        <span>{currentExerciseIndex + 1} / {workout.exercises.length}</span>
                    </div>
                </div>
            </CardHeader>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <div className="relative aspect-video">
                        <Image src={currentExercise.imageUrl} alt={currentExercise.name} fill className="object-cover rounded-md" data-ai-hint={currentExercise.aiHint} />
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="font-bold text-xl font-headline">{currentExercise.name}</h3>
                    <p className="text-muted-foreground mt-2">{currentExercise.description}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Детали</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap justify-around text-center gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Подходы</p>
                            <p className="text-3xl font-bold">{currentWorkoutExercise.sets}</p>
                        </div>
                        {currentWorkoutExercise.reps && (
                             <div>
                                <p className="text-sm text-muted-foreground">Повторения</p>
                                <p className="text-3xl font-bold">{currentWorkoutExercise.reps}</p>
                            </div>
                        )}
                        {currentWorkoutExercise.weight !== undefined && (
                             <div>
                                <p className="text-sm text-muted-foreground">Вес</p>
                                <p className="text-3xl font-bold">{currentWorkoutExercise.weight}кг</p>
                            </div>
                        )}
                        {currentWorkoutExercise.duration && (
                             <div>
                                <p className="text-sm text-muted-foreground">Длительность</p>
                                <p className="text-3xl font-bold">{formatTime(currentWorkoutExercise.duration)}</p>
                            </div>
                        )}
                         {currentWorkoutExercise.distance && (
                             <div>
                                <p className="text-sm text-muted-foreground">Дистанция</p>
                                <p className="text-3xl font-bold">{currentWorkoutExercise.distance}км</p>
                            </div>
                        )}
                    </div>
                    
                    {currentExercise.type === 'timed-distance' && currentWorkoutExercise.duration ? (
                        <div className="p-4 bg-accent/10 rounded-lg text-center border border-accent/20">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Timer className="h-5 w-5"/>
                                <span className="text-lg font-semibold">Таймер упражнения</span>
                            </div>
                            <p className="text-5xl font-bold my-2 text-accent">
                                {formatTime(exerciseTimeLeft)}
                            </p>
                            <Button variant="outline" onClick={handleToggleExerciseTimer} disabled={exerciseTimeLeft === 0}>
                                {exerciseTimerActive ? 'Пауза' : 'Продолжить'}
                            </Button>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
        
        <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handlePrev} disabled={currentExerciseIndex === 0}>
                <ChevronLeft className="mr-2 h-4 w-4"/> Назад
            </Button>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleSkip} className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">
                    Пропустить <X className="ml-2 h-4 w-4"/>
                </Button>
                <Button onClick={handleMarkComplete} className="bg-green-600 text-white hover:bg-green-700">
                    Готово <Check className="ml-2 h-4 w-4"/>
                </Button>
            </div>
        </div>
    </div>
  );
}
