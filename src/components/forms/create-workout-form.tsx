'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Workout, Exercise } from '@/lib/types';
import { PlusCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';

const workoutExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.coerce.number().min(1, 'Минимум 1 подход'),
  reps: z.coerce.number().min(1, 'Минимум 1 повторение').optional(),
  duration: z.coerce.number().min(1, 'Минимум 1 секунда').optional(),
  distance: z.coerce.number().step(0.01).gt(0, 'Дистанция должна быть положительным числом').optional(),
  weight: z.coerce.number().min(0, 'Вес не может быть отрицательным').optional(),
  restDuration: z.coerce.number().optional(),
});

const formSchema = z.object({
  name: z.string().min(1, { message: 'Название обязательно.' }),
  description: z.string().min(1, { message: 'Описание обязательно.' }),
  exercises: z
    .array(workoutExerciseSchema)
    .min(1, { message: 'Добавьте хотя бы одно упражнение.' }),
});

type CreateWorkoutFormProps = {
  allExercises: Exercise[];
  onFormSubmit: (data: Omit<Workout, 'id'>, id?: string) => void;
  onCancel: () => void;
  initialData?: Workout | null;
};

export function CreateWorkoutForm({
  allExercises,
  onFormSubmit,
  onCancel,
  initialData,
}: CreateWorkoutFormProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      exercises: [],
    },
  });
  
  const { fields, append, remove, replace, swap } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  useEffect(() => {
    if (initialData) {
        form.reset({
            name: initialData.name,
            description: initialData.description,
        });
        // useFieldArray's `replace` is recommended for resetting the array
        replace(initialData.exercises);
    } else {
        form.reset({
            name: '',
            description: '',
        });
        replace([]);
    }
  }, [initialData, form, replace]);

  const handleAddExercise = () => {
    const exerciseToAdd = allExercises.find(
      (e) => e.id === selectedExercise
    );
    if (exerciseToAdd && !fields.some(f => f.exerciseId === exerciseToAdd.id)) {
      append({ 
        exerciseId: exerciseToAdd.id, 
        sets: exerciseToAdd.defaultSets || 3, 
        reps: exerciseToAdd.defaultReps,
        weight: exerciseToAdd.defaultWeight,
        duration: exerciseToAdd.defaultDuration,
        distance: exerciseToAdd.defaultDistance,
        restDuration: exerciseToAdd.defaultRestDuration || 60,
      });
      setSelectedExercise('');
    }
  };

  const getExerciseById = (id: string) => {
    return allExercises.find((e) => e.id === id);
  };
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    onFormSubmit(values, initialData?.id);
  }

  const isEditing = !!initialData;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название тренировки</FormLabel>
              <FormControl>
                <Input placeholder="Например: Силовая на все тело" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea placeholder="Опишите цель этой тренировки" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Упражнения</FormLabel>
          <div className="flex items-center gap-2 mt-2">
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите упражнение для добавления" />
              </SelectTrigger>
              <SelectContent>
                {allExercises.map((ex) => (
                  <SelectItem key={ex.id} value={ex.id} disabled={fields.some(f => f.exerciseId === ex.id)}>
                    {ex.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={handleAddExercise} disabled={!selectedExercise}>
              <PlusCircle className="mr-2" /> Добавить
            </Button>
          </div>
          <FormMessage>{form.formState.errors.exercises?.root?.message}</FormMessage>
        </div>

        <ScrollArea className="h-64 pr-4">
          <div className="space-y-4">
            {fields.map((field, index) => {
              const exercise = getExerciseById(field.exerciseId);
              if (!exercise) return null;
              
              const exerciseType = exercise.type;
              const exerciseColor = exercise.color;

              return (
                <Card key={field.id} className="p-4 overflow-hidden" style={{ borderLeft: `4px solid ${exerciseColor || 'hsl(var(--border))'}` }}>
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-2">
                          <h4 className="font-semibold">
                              {exercise.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                            {form.watch(`exercises.${index}.sets`) && <span><span className="font-medium">{form.watch(`exercises.${index}.sets`)}</span> подх</span>}
                            {form.watch(`exercises.${index}.reps`) && <span>× <span className="font-medium">{form.watch(`exercises.${index}.reps`)}</span></span>}
                            {form.watch(`exercises.${index}.weight`) != null && <span>@ <span className="font-medium">{form.watch(`exercises.${index}.weight`)}</span>кг</span>}
                            {form.watch(`exercises.${index}.duration`) && <span><span className="font-medium">{form.watch(`exercises.${index}.duration`)}</span>с</span>}
                            {form.watch(`exercises.${index}.distance`) && <span><span className="font-medium">{form.watch(`exercises.${index}.distance`)}</span>км</span>}
                          </div>
                      </div>
                      <div className="flex items-center -mr-2">
                        <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => swap(index, index - 1)}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" disabled={index === fields.length - 1} onClick={() => swap(index, index + 1)}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`exercises.${index}.sets`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Подх</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`exercises.${index}.reps`}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Повт</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                      />

                      {exerciseType === 'weighted' && (
                        <FormField
                        control={form.control}
                        name={`exercises.${index}.weight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Вес (кг)</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                      )}
                      
                      {exerciseType === 'timed-distance' && (
                        <>
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.duration`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Время (сек)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.distance`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Дист. (км)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                          control={form.control}
                          name={`exercises.${index}.restDuration`}
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Отдых (сек)</FormLabel>
                                  <FormControl>
                                      <Input type="number" placeholder="60" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">{isEditing ? 'Сохранить' : 'Создать тренировку'}</Button>
        </div>
      </form>
    </Form>
  );
}
