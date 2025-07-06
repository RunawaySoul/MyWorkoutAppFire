"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAppData } from '@/lib/actions';
import type { AppData } from '@/lib/types';
import {
  Activity,
  ArrowRight,
  Dumbbell,
  Sparkles,
  Zap,
  RotateCw,
} from 'lucide-react';
import Link from 'next/link';
import { differenceInSeconds } from 'date-fns';

export default function DashboardPage() {
  const [appData, setAppData] = useState<AppData | null>(null);

  useEffect(() => {
    // Data is fetched on the client side from localStorage or initial file
    const data = getAppData();
    setAppData(data);
  }, []);

  if (!appData) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-center text-muted-foreground">
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Загрузка данных...
            </div>
        </div>
    );
  }

  const { workouts, exercises, workoutLogs } = appData;

  const totalWorkouts = workouts.length;
  const totalExercises = exercises.length;
  
  const completedLogs = workoutLogs.filter(log => log.status === 'completed' && log.endTime);
  const totalTimeUnderLoad = completedLogs.reduce((acc, log) => {
    const start = new Date(log.date);
    const end = new Date(log.endTime!);
    return acc + differenceInSeconds(end, start);
  }, 0);

  const hours = Math.floor(totalTimeUnderLoad / 3600);
  const minutes = Math.floor((totalTimeUnderLoad % 3600) / 60);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего тренировок
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">создано в приложении</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Время под нагрузкой
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hours}ч {minutes}м</div>
            <p className="text-xs text-muted-foreground">
              на основе завершенных тренировок
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Освоено упражнений
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExercises}</div>
            <p className="text-xs text-muted-foreground">
              в вашей библиотеке
            </p>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Недавние тренировки</CardTitle>
          </CardHeader>
          <CardContent>
            {completedLogs.length > 0 ? (
              <ul className="space-y-2">
                {completedLogs.slice(0, 5).map(log => {
                   const workout = workouts.find(w => w.id === log.workoutId);
                   return (
                    <li key={log.id} className="text-sm text-muted-foreground">
                      Вы завершили тренировку "{workout?.name || 'Неизвестная'}" {new Date(log.date).toLocaleDateString('ru-RU')}.
                    </li>
                   )
                })}
              </ul>
            ) : (
              <p>Здесь будет отображаться история ваших недавних тренировок.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
