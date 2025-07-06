"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getAppData, saveAppData } from "@/lib/actions";
import type { AppData, BodyMeasurement, WorkoutLog } from "@/lib/types";
import { format, parseISO, differenceInMinutes, sub, add, startOfDay, set } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const chartConfig = {
  weight: {
    label: "Вес (кг)",
    color: "hsl(var(--primary))",
  },
};

const addMeasurementSchema = z.object({
    date: z.date({
        required_error: "Дата обязательна.",
    }),
    hours: z.coerce.number().min(0).max(23),
    minutes: z.coerce.number().min(0).max(59),
    weight: z.coerce.number().positive("Вес должен быть положительным числом."),
});

type DateRangeType = "weeks" | "months" | "years";

export default function HistoryPage() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);
  const [isClearAllAlertOpen, setIsClearAllAlertOpen] = useState(false);
  const [isAddWeightDialogOpen, setIsAddWeightDialogOpen] = useState(false);
  
  const [dateRange, setDateRange] = useState({ type: 'months' as DateRangeType, value: 3, end: startOfDay(new Date()) });
  const { toast } = useToast();

  const now = new Date();
  const form = useForm<z.infer<typeof addMeasurementSchema>>({
    resolver: zodResolver(addMeasurementSchema),
    defaultValues: {
        date: now,
        hours: now.getHours(),
        minutes: now.getMinutes(),
        weight: undefined,
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAppData();
        setAppData(data);
      } catch (error) {
        console.error("Failed to load history data:", error);
      }
    }
    loadData();
  }, []);

  const updateAppData = async (newData: AppData) => {
    await saveAppData(newData);
    setAppData(newData);
  };

  const { workouts, workoutLogs, bodyMeasurements } = appData || { workouts: [], workoutLogs: [], bodyMeasurements: [] };

  const handleSelectLog = (id: string, checked: boolean) => {
    setSelectedLogIds(prev => {
        const newSet = new Set(prev);
        if (checked) newSet.add(id);
        else newSet.delete(id);
        return newSet;
    });
  };

  const completedLogs = useMemo(() => {
    return workoutLogs.filter(
      (log) => log.status === "completed" && log.endTime
    ).sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [workoutLogs]);

  const handleSelectAllLogs = (checked: boolean) => {
    setSelectedLogIds(checked ? new Set(completedLogs.map(log => log.id)) : new Set());
  };

  const handleDeleteSelectedLogs = () => {
    if (!appData) return;
    const newLogs = appData.workoutLogs.filter(log => !selectedLogIds.has(log.id));
    updateAppData({ ...appData, workoutLogs: newLogs });
    setSelectedLogIds(new Set());
    setIsBulkDeleteAlertOpen(false);
    toast({ title: "Журнал тренировок обновлен", description: `${selectedLogIds.size} записей удалено.` });
  };
  
  const handleClearAllLogs = () => {
    if (!appData) return;
    // We only want to clear completed logs, not in-progress ones.
    const newLogs = appData.workoutLogs.filter(log => log.status !== 'completed');
    updateAppData({ ...appData, workoutLogs: newLogs });
    setSelectedLogIds(new Set());
    setIsClearAllAlertOpen(false);
    toast({ title: "Журнал тренировок очищен", variant: "destructive" });
  };
  
  const handleAddBodyMeasurement = (values: z.infer<typeof addMeasurementSchema>) => {
    if(!appData) return;

    const combinedDateTime = set(values.date, { hours: values.hours, minutes: values.minutes, seconds: 0, milliseconds: 0 });

    const newMeasurement: BodyMeasurement = {
        datetime: combinedDateTime.toISOString(),
        weight: values.weight,
    };
    
    const newMeasurements = [...bodyMeasurements, newMeasurement];
    
    updateAppData({ ...appData, bodyMeasurements: newMeasurements });
    setIsAddWeightDialogOpen(false);
    const rightNow = new Date();
    form.reset({
        date: rightNow,
        hours: rightNow.getHours(),
        minutes: rightNow.getMinutes(),
        weight: undefined
    });
    toast({ title: "Измерения обновлены", description: `Вес ${values.weight}кг добавлен на ${format(combinedDateTime, "PPP p", { locale: ru })}.` });
  };

  const changeDateRange = (direction: 'prev' | 'next') => {
    setDateRange(prev => {
        const newEnd = direction === 'next' 
            ? add(prev.end, { [prev.type]: prev.value }) 
            : sub(prev.end, { [prev.type]: prev.value });
        return { ...prev, end: newEnd > new Date() ? startOfDay(new Date()) : newEnd };
    });
  };

  const chartData = useMemo(() => {
    if (!bodyMeasurements) return [];
    const startDate = sub(dateRange.end, { [dateRange.type]: dateRange.value });
    const endDate = add(dateRange.end, { days: 1 });

    const filteredMeasurements = bodyMeasurements
      .map(m => ({ ...m, datetimeObj: parseISO(m.datetime) }))
      .filter(m => m.datetimeObj >= startDate && m.datetimeObj < endDate)
      .sort((a, b) => a.datetimeObj.getTime() - b.datetimeObj.getTime());
    
    return filteredMeasurements.map(m => ({
        timestamp: m.datetimeObj.getTime(),
        weight: m.weight,
        displayDate: format(m.datetimeObj, 'PPP p', { locale: ru })
    }));
  }, [bodyMeasurements, dateRange]);
  
  if (!appData) {
    return <div>Загрузка истории...</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline">Журнал тренировок</CardTitle>
                <CardDescription>История ваших завершенных тренировок.</CardDescription>
              </div>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon"><MoreVertical/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setIsClearAllAlertOpen(true)} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4"/> Очистить все
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {selectedLogIds.size > 0 && (
                <div className="flex items-center justify-between p-2 mt-2 bg-muted rounded-md">
                    <span className="text-sm font-medium">{selectedLogIds.size} выбрано</span>
                    <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteAlertOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить выбранные
                    </Button>
                </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                        <Checkbox
                            checked={selectedLogIds.size > 0 && completedLogs.length > 0 && selectedLogIds.size === completedLogs.length}
                            onCheckedChange={(checked) => handleSelectAllLogs(checked === true)}
                            aria-label="Выбрать все"
                        />
                    </TableHead>
                    <TableHead>Тренировка</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-right">Длительность</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedLogs.length > 0 ? (
                    completedLogs.map((log) => {
                      const workout = workouts.find((w) => w.id === log.workoutId);
                      const duration = log.endTime ? differenceInMinutes(
                        parseISO(log.endTime),
                        parseISO(log.date)
                      ) : 0;
                      return (
                        <TableRow key={log.id} data-state={selectedLogIds.has(log.id) ? "selected" : ""}>
                          <TableCell>
                            <Checkbox
                                checked={selectedLogIds.has(log.id)}
                                onCheckedChange={(checked) => handleSelectLog(log.id, checked === true)}
                                aria-label={`Выбрать лог ${log.id}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {workout?.name || "Удаленная тренировка"}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(log.date), "PPP", { locale: ru })}
                          </TableCell>
                          <TableCell className="text-right">{duration} мин</TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        История тренировок пуста.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline">Прогресс веса</CardTitle>
                    <CardDescription>
                    Отслеживайте изменения вашего веса.
                    </CardDescription>
                </div>
                <Dialog open={isAddWeightDialogOpen} onOpenChange={setIsAddWeightDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4"/> Добавить</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Добавить измерение веса</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAddBodyMeasurement)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Дата</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            {field.value ? (format(field.value, "PPP", { locale: ru })) : (<span>Выберите дату</span>)}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="hours"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Часы</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Array.from({ length: 24 }, (_, i) => (
                                                            <SelectItem key={i} value={String(i)}>{String(i).padStart(2, '0')}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="minutes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Минуты</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Array.from({ length: 60 }, (_, i) => (
                                                            <SelectItem key={i} value={String(i)}>{String(i).padStart(2, '0')}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Вес (кг)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="75.5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Сохранить</Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center mb-4">
                <Input type="number" value={dateRange.value} onChange={e => setDateRange(p => ({...p, value: parseInt(e.target.value) || 1}))} className="w-16" min="1" />
                <Select value={dateRange.type} onValueChange={(v: DateRangeType) => setDateRange(p => ({...p, type: v}))}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="weeks">Недели</SelectItem>
                        <SelectItem value="months">Месяцы</SelectItem>
                        <SelectItem value="years">Годы</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={() => changeDateRange('prev')}><ChevronLeft className="h-4 w-4"/></Button>
                <Button variant="outline" size="icon" onClick={() => changeDateRange('next')} disabled={add(dateRange.end, {[dateRange.type]: 1}) > new Date()}><ChevronRight className="h-4 w-4"/></Button>
            </div>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <LineChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={(unixTime) => format(new Date(unixTime), 'MMM d', { locale: ru })}
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
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent
                        formatter={(value) => (`${value} кг`)}
                        labelFormatter={(label, payload) => {
                             if (payload && payload.length) {
                                return payload[0].payload.displayDate;
                            }
                            return '';
                        }}
                        indicator="dot" 
                    />}
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
                <p className="text-sm text-muted-foreground text-center px-4">
                  Нет данных о весе для отображения за выбранный период.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. {selectedLogIds.size} записей будут навсегда удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelectedLogs} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isClearAllAlertOpen} onOpenChange={setIsClearAllAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. ВЕСЬ журнал завершенных тренировок будет навсегда удален.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllLogs} className="bg-destructive hover:bg-destructive/90">Удалить все</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
