"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Exercise, AppData } from '@/lib/types';
import { PlusCircle, MoreVertical, Edit, Trash2, ArrowUpDown } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreateExerciseForm } from '@/components/forms/create-exercise-form';
import { getAppData, saveAppData } from '@/lib/actions';

type SortKey = keyof Exercise | '';

export default function ExercisesPage() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null);
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAppData();
        setAppData(data);
      } catch (error) {
        console.error("Failed to load exercises:", error);
      }
    }
    loadData();
  }, []);
  
  const exercises = appData?.exercises || [];

  const muscleGroups = useMemo(() => {
    const allGroups = exercises.map(ex => ex.muscleGroup);
    return ['all', ...Array.from(new Set(allGroups)).sort()];
  }, [exercises]);

  const displayedExercises = useMemo(() => {
    return exercises
      .filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (muscleGroupFilter === 'all' || ex.muscleGroup === muscleGroupFilter)
      )
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
        const key = sortConfig.key;
        const aValue = a[key] ?? '';
        const bValue = b[key] ?? '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [exercises, searchTerm, muscleGroupFilter, sortConfig]);

  const handleSort = (key: SortKey) => {
    if(!key) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(displayedExercises.map(ex => ex.id)));
    } else {
      setSelectedIds(new Set());
    }
  };
  
  const updateExercises = async (newExercises: Exercise[]) => {
    if(!appData) return;
    const newData = {...appData, exercises: newExercises};
    await saveAppData(newData);
    setAppData(newData);
  };

  const handleSaveExercise = (
    data: Omit<Exercise, 'id' | 'aiHint'>,
    id?: string
  ) => {
    if (id) {
        const newExercises = exercises.map((ex) =>
            ex.id === id ? { ...ex, ...data, imageUrl: data.imageUrl || undefined } : ex
        );
        updateExercises(newExercises);
    } else {
      const newExercise: Exercise = {
        id: `ex${Date.now()}`,
        ...data,
        imageUrl: data.imageUrl || undefined,
        aiHint: data.name.toLowerCase().split(' ').slice(0, 2).join(' '),
      };
      updateExercises([...exercises, newExercise]);
    }
    setIsDialogOpen(false);
    setEditingExercise(null);
  };

  const handleOpenCreateDialog = () => {
    setEditingExercise(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsDialogOpen(true);
  };
  
  const handleOpenViewDialog = (exercise: Exercise) => {
    setViewingExercise(exercise);
  };

  const handleOpenDeleteAlert = (exerciseId: string) => {
    setDeletingExerciseId(exerciseId);
    setIsAlertOpen(true);
  };

  const handleDeleteExercise = () => {
    if (deletingExerciseId) {
        updateExercises(exercises.filter((ex) => ex.id !== deletingExerciseId));
    }
    setIsAlertOpen(false);
    setDeletingExerciseId(null);
  };

  const handleConfirmBulkDelete = () => {
    updateExercises(exercises.filter(ex => !selectedIds.has(ex.id)));
    setSelectedIds(new Set());
    setIsBulkDeleteAlertOpen(false);
  }

  const handleCancelDialog = () => {
    setIsDialogOpen(false);
    setEditingExercise(null);
  };

  if (!appData) {
    return <div>Загрузка упражнений...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-headline">
          Библиотека упражнений
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={handleOpenCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Создать упражнение
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingExercise ? 'Редактировать упражнение' : 'Новое упражнение'}</DialogTitle>
              <DialogDescription>
                {editingExercise ? 'Измените информацию об упражнении ниже.' : 'Заполните информацию ниже, чтобы добавить новое упражнение в библиотеку.'}
              </DialogDescription>
            </DialogHeader>
            <CreateExerciseForm
              onFormSubmit={handleSaveExercise}
              onCancel={handleCancelDialog}
              initialData={editingExercise}
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
            <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Фильтр по группе мышц" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map(group => (
                  <SelectItem key={group} value={group}>
                    {group === 'all' ? 'Все группы мышц' : group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  checked={selectedIds.size > 0 && displayedExercises.length > 0 && selectedIds.size === displayedExercises.length}
                  onCheckedChange={(checked) => handleSelectAll(checked === true)}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">
                  Название
                  {sortConfig.key === 'name' && <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('muscleGroup')}>
                <div className="flex items-center gap-2">
                  Группа мышц
                  {sortConfig.key === 'muscleGroup' && <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort('type')}>
                <div className="flex items-center gap-2">
                  Тип
                  {sortConfig.key === 'type' && <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </TableHead>
              <TableHead className="text-right w-[80px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedExercises.length > 0 ? (
              displayedExercises.map((exercise) => (
                <TableRow key={exercise.id} data-state={selectedIds.has(exercise.id) ? "selected" : ""}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(exercise.id)}
                      onCheckedChange={(checked) => handleSelect(exercise.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{exercise.name}</div>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2">
                        {exercise.defaultSets && <span>{exercise.defaultSets} подх</span>}
                        {exercise.defaultReps != null && <span>× {exercise.defaultReps} повт</span>}
                        {exercise.defaultWeight != null && exercise.defaultWeight > 0 && <span>{exercise.defaultWeight} кг</span>}
                        {exercise.defaultDuration != null && <span>{exercise.defaultDuration}с</span>}
                        {exercise.defaultDistance != null && <span>{exercise.defaultDistance}км</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" style={{
                      backgroundColor: exercise.color,
                      color: '#fff', 
                    }}>{exercise.muscleGroup}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{exercise.type === 'weighted' ? 'На подход/повторение' : 'На время/расстояние'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenViewDialog(exercise)}>Подробнее</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(exercise)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDeleteAlert(exercise.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Упражнения не найдены.
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
              Это действие необратимо. Упражнение будет навсегда удалено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingExerciseId(null)}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExercise} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. {selectedIds.size} упражнения будут навсегда удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBulkDelete} className="bg-destructive hover:bg-destructive/90">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingExercise} onOpenChange={(isOpen) => !isOpen && setViewingExercise(null)}>
        <DialogContent className="max-w-md">
            {viewingExercise && (
                <>
                    <DialogHeader>
                        <DialogTitle>{viewingExercise.name}</DialogTitle>
                        <DialogDescription>{viewingExercise.muscleGroup}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {viewingExercise.imageUrl && (
                            <div className="relative aspect-video w-full">
                                <Image src={viewingExercise.imageUrl} alt={viewingExercise.name} fill className="rounded-md object-contain" data-ai-hint={viewingExercise.aiHint} />
                            </div>
                        )}
                        {viewingExercise.description && <p className="text-sm text-muted-foreground">{viewingExercise.description}</p>}
                        <div className="space-y-2 rounded-md border p-4 bg-muted/50">
                            <h4 className="font-medium text-sm text-foreground">Значения по умолчанию:</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                {viewingExercise.defaultSets && <li>Подходы: {viewingExercise.defaultSets}</li>}
                                {viewingExercise.defaultReps && <li>Повторения: {viewingExercise.defaultReps}</li>}
                                {viewingExercise.defaultWeight !== undefined && <li>Вес: {viewingExercise.defaultWeight} кг</li>}
                                {viewingExercise.defaultDuration && <li>Длительность: {viewingExercise.defaultDuration} сек</li>}
                                {viewingExercise.defaultDistance && <li>Дистанция: {viewingExercise.defaultDistance} км</li>}
                                {viewingExercise.defaultRestDuration && <li>Отдых: {viewingExercise.defaultRestDuration} сек</li>}
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
