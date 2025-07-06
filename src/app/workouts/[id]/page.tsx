"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import { workouts as initialWorkouts, exercises as initialExercises } from "@/lib/data";
import type { Workout, Exercise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Timer, Flame, CheckCircle } from "lucide-react";

export default function WorkoutPlayerPage() {
  const params = useParams();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedWorkouts = localStorage.getItem('workouts');
      const workouts: Workout[] = savedWorkouts ? JSON.parse(savedWorkouts) : initialWorkouts;
      const foundWorkout = workouts.find((w) => w.id === params.id);
      setWorkout(foundWorkout || null);

      const savedExercises = localStorage.getItem('exercises');
      const exercises: Exercise[] = savedExercises ? JSON.parse(savedExercises) : initialExercises;
      setAllExercises(exercises);
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      const foundWorkout = initialWorkouts.find((w) => w.id === params.id);
      setWorkout(foundWorkout || null);
      setAllExercises(initialExercises);
    }
    setIsDataLoaded(true);
  }, [params.id]);

  if (!isDataLoaded) {
    return <div>Загрузка тренировки...</div>;
  }

  if (!workout) {
    return <div>Тренировка не найдена.</div>;
  }
  
  const currentWorkoutExercise = workout.exercises[currentExerciseIndex];
  const currentExercise = allExercises.find(e => e.id === currentWorkoutExercise.exerciseId);

  const handleNext = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
        setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const progressPercentage = ((currentExerciseIndex + 1) / workout.exercises.length) * 100;

  if(isFinished) {
    return (
        <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <CardTitle className="text-3xl font-headline mt-4">Тренировка завершена!</CardTitle>
                <CardDescription>Отличная работа! Вы завершили тренировку "{workout.name}".</CardDescription>
            </CardHeader>
            <CardContent>
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
                                <p className="text-3xl font-bold">{currentWorkoutExercise.duration}с</p>
                            </div>
                        )}
                         {currentWorkoutExercise.distance && (
                             <div>
                                <p className="text-sm text-muted-foreground">Дистанция</p>
                                <p className="text-3xl font-bold">{currentWorkoutExercise.distance}км</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-secondary rounded-lg text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Timer className="h-5 w-5"/>
                            <span className="text-lg font-semibold">Таймер отдыха</span>
                        </div>
                        <p className="text-5xl font-bold my-2">{currentWorkoutExercise.restDuration || 60}</p>
                        <Button variant="outline">Начать отдых</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        
        <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handlePrev} disabled={currentExerciseIndex === 0}>
                <ChevronLeft className="mr-2 h-4 w-4"/> Назад
            </Button>
            <Button onClick={handleNext} className="bg-accent hover:bg-accent/90">
                {currentExerciseIndex === workout.exercises.length - 1 ? 'Завершить' : 'Далее'}
                <ChevronRight className="ml-2 h-4 w-4"/>
            </Button>
        </div>
    </div>
  );
}
