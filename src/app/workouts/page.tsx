
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import type { Workout, Exercise, AppData, WorkoutLog } from '@/lib/types';
import { PlusCircle, MoreVertical, Edit, Trash2, Info, RotateCw, ArrowRight, ArrowUpDown } from 'lucide-react';
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CreateWorkoutForm } from '@/components/forms/create-workout-form';
import { getAppData, saveAppData } from '@/lib/actions';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function WorkoutsPage() {
  const router = useRouter();
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const [viewingWorkout, setViewingWorkout] = useState<Workout | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);

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
  
  const workouts = appData?.workouts || [];
  const exercises = appData?.exercises || [];
  const workoutLogs = appData?.workoutLogs || [];

  const displayedWorkouts = useMemo(() => {
    return workouts
      .filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
        const key = sortConfig.key as keyof Workout | 'exerciseCount';

        let aValue, bValue;

        if (key === 'exerciseCount') {
          aValue = a.exercises.length;
          bValue = b.exercises.length;
        } else {
          aValue = a[key as keyof Workout] ?? '';
          bValue = b[key as keyof Workout] ?? '';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [workouts, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    if(!key) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(displayedWorkouts.map(w => w.id)) : new Set());
  };

  const handleSaveWorkout = async (data: Omit<Workout, 'id'>, id?: string) => {
    if(!appData) return;

    let newWorkouts: Workout[];
    if (id) {
        newWorkouts = appData.workouts.map(w => w.id === id ? { ...w, ...data, id: w.id } : w);
    } else {
        const newWorkout: Workout = { id: `w${Date.now()}`, ...data };
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
    router.push(`/workouts/${workoutId}`);
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
        const newLogs = appData.workoutLogs.filter(l => l.workoutId !== deletingWorkoutId);
        const newData = {...appData, workouts: newWorkouts, workoutLogs: newLogs };
        await saveAppData(newData);
        setAppData(newData);
    }
    setIsAlertOpen(false);
    setDeletingWorkoutId(null);
  };
  
  const handleConfirmBulkDelete = async () => {
    if (!appData) return;
    const newWorkouts = workouts.filter(w => !selectedIds.has(w.id));
    const newLogs = workoutLogs.filter(l => !selectedIds.has(l.workoutId));
    const newData = {...appData, workouts: newWorkouts, workoutLogs: newLogs };
    await saveAppData(newData);
    setAppData(newData);
    setSelectedIds(new Set());
    setIsBulkDeleteAlertOpen(false);
  }

  const handleCancelDialog = () => {
    setIsDialogOpen(false);
    setEditingWorkout(null);
  };

  if (!appData) {
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

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <Input
              placeholder="Поиск по названию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between p-2 bg-muted rounded-md">
              <span className="text-sm font-medium">{selectedIds.size} выбрано</span>
              <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteAlertOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить выбранные
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds.size > 0 && displayedWorkouts.length > 0 && selectedIds.size === displayedWorkouts.length}
                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">
                  Название
                  {sortConfig.key === 'name' && <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">Описание</TableHead>
              <TableHead className="cursor-pointer hidden lg:table-cell" onClick={() => handleSort('exerciseCount')}>
                <div className="flex items-center gap-2">
                  Упражнений
                  {sortConfig.key === 'exerciseCount' && <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </TableHead>
              <TableHead>Группы мышц</TableHead>
              <TableHead className="text-right w-[80px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedWorkouts.length > 0 ? (
              displayedWorkouts.map((workout) => {
                const inProgressLog = workoutLogs.find(log => log.workoutId === workout.id && log.status === 'in-progress');
                const workoutExercises = workout.exercises
                  .map((we) => exercises.find((e) => e.id === we.exerciseId))
                  .filter((e): e is Exercise => !!e);
                const muscleGroups = [...new Set(workoutExercises.map((e) => e.muscleGroup))];

                return (
                  <TableRow key={workout.id} data-state={selectedIds.has(workout.id) ? "selected" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(workout.id)}
                        onCheckedChange={(checked) => handleSelect(workout.id, checked === true)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{workout.name}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell max-w-xs truncate">{workout.description}</TableCell>
                    <TableCell className="hidden lg:table-cell">{workout.exercises.length}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {muscleGroups.slice(0, 3).map((mg) => (
                          <Badge key={mg} variant="secondary">{mg}</Badge>
                        ))}
                        {muscleGroups.length > 3 && <Badge variant="outline">...</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           {inProgressLog ? (
                              <>
                                <DropdownMenuItem asChild>
                                    <Link href={`/workouts/${workout.id}`}>Продолжить <ArrowRight className="ml-auto" /></Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStartOver(workout.id)}>
                                    Начать заново <RotateCw className="ml-auto" />
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem asChild>
                                <Link href={`/workouts/${workout.id}`}>Начать <ArrowRight className="ml-auto" /></Link>
                              </DropdownMenuItem>
                            )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleOpenViewDialog(workout)}>
                            <Info className="mr-2 h-4 w-4" />
                            Подробнее
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(workout)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenDeleteAlert(workout.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Тренировки не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. Тренировка и вся связанная с ней история будут навсегда удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingWorkoutId(null)}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkout} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. {selectedIds.size} тренировки и вся связанная с ними история будут навсегда удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBulkDelete} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
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
