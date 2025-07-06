import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAppData } from '@/lib/actions';
import {
  Activity,
  ArrowRight,
  Dumbbell,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const { workouts, exercises } = await getAppData();

  const totalWorkouts = workouts.length;
  const totalExercises = exercises.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="text-2xl font-bold">0ч 0м</div>
            <p className="text-xs text-muted-foreground">
              данные еще не собраны
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
        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              AI-ассистент
            </CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              Нужно вдохновение? Получите новый план тренировок.
            </div>
            <Button asChild size="sm" className="mt-2">
              <Link href="/ai-suggester">
                Попробовать <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Недавние тренировки</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Здесь будет отображаться история ваших недавних тренировок.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
