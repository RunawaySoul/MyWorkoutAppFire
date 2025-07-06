
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import type { Workout, Exercise, AppData, WorkoutLog, ExerciseStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, Timer, Flame, CheckCircle, Check, X, Plus, SkipForward, DoorOpen } from "lucide-react";
import { getAppData, saveAppData } from "@/lib/actions";

export default function WorkoutPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const [appData, setAppData] = useState<AppData | null>(null);
  const [currentLog, setCurrentLog] = useState<WorkoutLog | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [exerciseTimerActive, setExerciseTimerActive] = useState(false);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  
  const workoutId = params.id as string;
  const workout = useMemo(() => appData?.workouts.find(w => w.id === workoutId), [appData, workoutId]);

  const saveProgress = useCallback(async () => {
    if (!appData || !currentLog || currentLog.status !== 'in-progress') return;
    await saveAppData({ ...appData });
  }, [appData, currentLog]);
  
  useEffect(() => {
    async function loadData() {
        try {
            const data = await getAppData();
            setAppData(data);
            
            let log = data.workoutLogs.find(l => l.workoutId === workoutId && l.status === 'in-progress');
            
            if (!log) {
                const workoutToStart = data.workouts.find(w => w.id === workoutId);
                if (workoutToStart) {
                    const newLog: WorkoutLog = {
                        id: `log${Date.now()}`,
                        workoutId,
                        date: new Date().toISOString(),
                        status: 'in-progress',
                        currentExerciseIndex: 0,
                        exerciseStatuses: Object.fromEntries(workoutToStart.exercises.map((_, i) => [i, 'pending']))
                    };
                    const newData = { ...data, workoutLogs: [...data.workoutLogs, newLog] };
                    await saveAppData(newData);
                    setAppData(newData);
                    log = newLog;
                }
            }

            if(log) {
                setCurrentLog(log);
                setCurrentExerciseIndex(log.currentExerciseIndex);
            }
            
        } catch (error) {
            console.error("Failed to load data:", error);
        }
        setIsDataLoaded(true);
    }
    if (workoutId) {
        loadData();
    }
  }, [workoutId]);

  const updateLog = useCallback((updates: Partial<WorkoutLog>) => {
    if (!currentLog) return;
    const updatedLog = { ...currentLog, ...updates };
    setCurrentLog(updatedLog);
    setAppData(prev => {
        if (!prev) return null;
        const updatedLogs = prev.workoutLogs.map(log => log.id === updatedLog.id ? updatedLog : log);
        return { ...prev, workoutLogs: updatedLogs };
    });
  }, [currentLog]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if(currentLog && currentLog.status === 'in-progress') {
            saveProgress();
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [currentLog, saveProgress]);

  const goToNextExercise = useCallback(() => {
    if (!workout || currentExerciseIndex >= workout.exercises.length - 1) return;
    const nextIndex = currentExerciseIndex + 1;
    setCurrentExerciseIndex(nextIndex);
    updateLog({ currentExerciseIndex: nextIndex });
    setExerciseTimerActive(false);
    setIsResting(false);
  }, [workout, currentExerciseIndex, updateLog]);

  const handleFinishWorkout = useCallback(async (finalStatuses: Record<number, ExerciseStatus>) => {
    if (!appData || !currentLog || isFinishing) return;
    setIsFinishing(true);

    const finalLog: WorkoutLog = {
      ...currentLog,
      status: 'completed',
      exerciseStatuses: finalStatuses,
      endTime: new Date().toISOString(),
    };
    
    const updatedLogs = appData.workoutLogs.map(log => 
      log.id === finalLog.id ? finalLog : log
    );

    const newData = { ...appData, workoutLogs: updatedLogs };

    try {
      await saveAppData(newData);
      setAppData(newData);
      setCurrentLog(finalLog);
      setIsFinished(true);
    } catch (error) {
      console.error("Failed to save finished workout:", error);
    } finally {
      setIsFinishing(false);
    }
  }, [appData, currentLog, isFinishing]);

  const handleMarkComplete = useCallback(() => {
    if (!workout || !currentLog) return;

    const newStatuses = { ...currentLog.exerciseStatuses, [currentExerciseIndex]: 'completed' as ExerciseStatus };
    setExerciseTimerActive(false);
    
    const isLast = currentExerciseIndex >= workout.exercises.length - 1;

    if (isLast) {
        handleFinishWorkout(newStatuses);
    } else {
      updateLog({ exerciseStatuses: newStatuses });
      const restDuration = workout.exercises[currentExerciseIndex]?.restDuration;
      if (restDuration && restDuration > 0) {
        setRestTimeLeft(restDuration);
        setIsResting(true);
      } else {
        goToNextExercise();
      }
    }
  }, [workout, currentLog, currentExerciseIndex, updateLog, goToNextExercise, handleFinishWorkout]);

  const handleSkip = useCallback(() => {
    if (!workout || !currentLog) return;
    const newStatuses = { ...currentLog.exerciseStatuses, [currentExerciseIndex]: 'skipped' as ExerciseStatus };
    setExerciseTimerActive(false);
    setIsResting(false); 

    const isLast = currentExerciseIndex >= workout.exercises.length - 1;

    if (isLast) {
        handleFinishWorkout(newStatuses);
    } else {
        updateLog({ exerciseStatuses: newStatuses });
        goToNextExercise();
    }
  }, [workout, currentLog, currentExerciseIndex, updateLog, goToNextExercise, handleFinishWorkout]);

  useEffect(() => {
    if (!workout || isResting || !isDataLoaded || !currentLog) return;
    
    const currentWorkoutEx = workout.exercises[currentExerciseIndex];
    if (!currentWorkoutEx) return;

    const currentEx = appData?.exercises.find(e => e.id === currentWorkoutEx.exerciseId);
    
    if (currentEx?.type === 'timed-distance' && currentWorkoutEx?.duration) {
      setExerciseTimeLeft(currentWorkoutEx.duration);
      setExerciseTimerActive(true);
    } else {
      setExerciseTimerActive(false);
    }
  }, [currentExerciseIndex, workout, appData, isResting, isDataLoaded, currentLog]);

  useEffect(() => {
    if (!exerciseTimerActive || exerciseTimeLeft <= 0) {
      if (exerciseTimeLeft <= 0 && exerciseTimerActive) handleMarkComplete();
      return;
    }
    const intervalId = setInterval(() => setExerciseTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(intervalId);
  }, [exerciseTimerActive, exerciseTimeLeft, handleMarkComplete]);

  useEffect(() => {
    if (!isResting || restTimeLeft <= 0) {
      if (restTimeLeft <= 0 && isResting) {
        goToNextExercise();
      }
      return;
    }
    const intervalId = setInterval(() => setRestTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(intervalId);
  }, [isResting, restTimeLeft, goToNextExercise]);
  
  const handleExit = () => {
    saveProgress().then(() => {
        router.push('/workouts');
    });
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!isDataLoaded || !appData || !workout || !currentLog) {
    return <div>Загрузка тренировки...</div>;
  }
  
  const currentWorkoutExercise = workout.exercises[currentExerciseIndex];
  const currentExercise = appData.exercises.find(e => e.id === currentWorkoutExercise.exerciseId);
  
  const completedCount = Object.values(currentLog.exerciseStatuses).filter(s => s !== 'pending').length;
  const progressPercentage = (completedCount / workout.exercises.length) * 100;

  if(isFinished) {
    const finalCompletedCount = Object.values(currentLog.exerciseStatuses).filter(s => s === 'completed').length;
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
    const nextExercise = appData.exercises.find(e => e.id === workout.exercises[currentExerciseIndex + 1]?.exerciseId);
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
            <CardContent className="flex-grow flex flex-col items-center justify-center">
              <p className="text-8xl font-bold my-4 text-primary">{formatTime(restTimeLeft)}</p>
              <p className="text-muted-foreground">Следующее упражнение: {nextExercise?.name || 'Тренировка почти завершена!'}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setRestTimeLeft(prev => prev + 15)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Продлить (+15с)
                </Button>
                <Button onClick={() => setRestTimeLeft(0)}>
                    Пропустить <SkipForward className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <Button variant="ghost" size="sm" onClick={handleExit}><ChevronLeft className="mr-2 h-4 w-4"/> Завершить досрочно</Button>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Flame className="h-4 w-4" />
                        <span>{currentExerciseIndex + 1} / {workout.exercises.length}</span>
                    </div>
                </div>
                <Progress value={progressPercentage} />
                <CardTitle className="font-headline text-2xl mt-2">{workout.name}</CardTitle>
            </CardHeader>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-4">
            <Card>
                {currentExercise.imageUrl && (
                  <CardHeader>
                      <div className="relative aspect-video">
                          <Image src={currentExercise.imageUrl} alt={currentExercise.name} fill className="object-contain rounded-md" data-ai-hint={currentExercise.aiHint} />
                      </div>
                  </CardHeader>
                )}
                <CardContent className={!currentExercise.imageUrl ? "pt-6" : ""}>
                    <h3 className="font-bold text-xl font-headline">{currentExercise.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Группа мышц: {currentExercise.muscleGroup}</p>
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
                        {currentWorkoutExercise.reps != null && (
                             <div>
                                <p className="text-sm text-muted-foreground">Повторения</p>
                                <p className="text-3xl font-bold">{currentWorkoutExercise.reps}</p>
                            </div>
                        )}
                        {currentWorkoutExercise.weight != null && (
                             <div>
                                <p className="text-sm text-muted-foreground">Вес</p>
                                <p className="text-3xl font-bold">{currentWorkoutExercise.weight}кг</p>
                            </div>
                        )}
                        {currentWorkoutExercise.duration != null && (
                             <div>
                                <p className="text-sm text-muted-foreground">Длительность</p>
                                <p className="text-3xl font-bold">{formatTime(currentWorkoutExercise.duration)}</p>
                            </div>
                        )}
                         {currentWorkoutExercise.distance != null && (
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
                            <Button variant="outline" onClick={() => setExerciseTimerActive(prev => !prev)} disabled={exerciseTimeLeft === 0}>
                                {exerciseTimerActive ? 'Пауза' : 'Продолжить'}
                            </Button>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
        </div>
        
        <div className="flex justify-center mt-4 gap-2">
            <Button variant="outline" onClick={handleSkip} disabled={isFinishing} className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">
                Пропустить <X className="ml-2 h-4 w-4"/>
            </Button>
            <Button onClick={handleMarkComplete} disabled={isFinishing} className="bg-green-600 text-white hover:bg-green-700">
                Готово <Check className="ml-2 h-4 w-4"/>
            </Button>
        </div>
    </div>
  );
}

    