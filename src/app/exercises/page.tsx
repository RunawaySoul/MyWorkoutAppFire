"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { exercises as initialExercises } from '@/lib/data';
import type { Exercise } from '@/lib/types';
import { PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
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
import { CreateExerciseForm } from '@/components/forms/create-exercise-form';

function ExerciseCard({ 
    exercise, 
    onEdit, 
    onDelete 
}: { 
    exercise: Exercise;
    onEdit: () => void;
    onDelete: () => void;
}) {
  return (
    <Card className="flex flex-col border-t-4" style={{ borderColor: exercise.color || 'hsl(var(--primary))' }}>
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full">
          <Image
            src={exercise.imageUrl}
            alt={exercise.name}
            fill
            className="rounded-t-md object-cover"
            data-ai-hint={exercise.aiHint}
          />
           <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/50 hover:bg-background/80">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-headline">{exercise.name}</CardTitle>
        <Badge variant="secondary" className="mt-2">
          {exercise.muscleGroup}
        </Badge>
        {exercise.description && (
            <p className="mt-2 text-sm text-muted-foreground">
                {exercise.description}
            </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" size="sm">
          Подробнее
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null);

  const handleSaveExercise = (
    data: Omit<Exercise, 'id' | 'imageUrl' | 'aiHint'>,
    id?: string
  ) => {
    if (id) {
      setExercises((prev) =>
        prev.map((ex) => (ex.id === id ? { ...ex, ...data, color: data.color || ex.color } : ex))
      );
    } else {
      const newExercise: Exercise = {
        id: `ex${exercises.length + 1 + Math.random()}`,
        ...data,
        imageUrl: 'https://placehold.co/600x400.png',
        aiHint: data.name.toLowerCase().split(' ').slice(0, 2).join(' '),
      };
      setExercises((prev) => [...prev, newExercise]);
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

  const handleOpenDeleteAlert = (exerciseId: string) => {
    setDeletingExerciseId(exerciseId);
    setIsAlertOpen(true);
  };

  const handleDeleteExercise = () => {
    if (deletingExerciseId) {
      setExercises((prev) => prev.filter((ex) => ex.id !== deletingExerciseId));
    }
    setIsAlertOpen(false);
    setDeletingExerciseId(null);
  };

  const handleCancelDialog = () => {
    setIsDialogOpen(false);
    setEditingExercise(null);
  };

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {exercises.map((exercise) => (
          <ExerciseCard 
            key={exercise.id} 
            exercise={exercise} 
            onEdit={() => handleOpenEditDialog(exercise)}
            onDelete={() => handleOpenDeleteAlert(exercise.id)}
            />
        ))}
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
    </div>
  );
}
