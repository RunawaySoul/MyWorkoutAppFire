import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { getAppData } from "@/lib/actions";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { ru } from 'date-fns/locale';

const chartConfig = {
  weight: {
    label: "Вес (кг)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default async function HistoryPage() {
  const { workouts, workoutLogs, bodyMeasurements } = await getAppData();

  const chartData = bodyMeasurements.map((m) => ({
    date: format(new Date(m.date), "MMM d", { locale: ru }),
    weight: m.weight,
  }));
  
  const completedLogs = workoutLogs.filter(log => log.status === 'completed' && log.endTime);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Журнал тренировок</CardTitle>
            <CardDescription>
              История ваших завершенных тренировок.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Тренировка</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Длительность</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedLogs.length > 0 ? (
                  completedLogs.map((log) => {
                    const workout = workouts.find((w) => w.id === log.workoutId);
                    const duration = differenceInMinutes(parseISO(log.endTime!), parseISO(log.date));
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {workout?.name || "Неизвестная тренировка"}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(log.date), "PPP", { locale: ru })}
                        </TableCell>
                        <TableCell className="text-right">
                          {duration} мин
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      История тренировок пуста.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Прогресс веса</CardTitle>
            <CardDescription>
              Отслеживайте изменения вашего веса со временем.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    domain={["dataMin - 2", "dataMax + 2"]}
                  />
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Line
                    dataKey="weight"
                    type="monotone"
                    stroke="var(--color-weight)"
                    strokeWidth={2}
                    dot={true}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
                <div className="flex h-[250px] w-full items-center justify-center rounded-md border border-dashed bg-muted/50">
                    <p className="text-sm text-muted-foreground">Нет данных о весе для отображения.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
