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
import { PlusCircle, Trash2 } from 'lucide-react';
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
  distance: z.coerce.number().gt(0, 'Дистанция должна быть положительным числом').optional(),
  weight: z.coerce.number().min(0, 'Вес не может быть отрицательным').optional(),
  restDuration: z.coerce.number().optional(),
});

const formSchema = z.object({
  name: z.string().min(1, { message: 'Название обязательно.' }),
  description: z.string().min(1, { message: 'Описание обязательно.' }),
  exercises: z
    .array(workoutExerciseSchema)
    .min(1, { message: 'Добавьте хотя бы одно упражнение.' })
    .superRefine((exercises, ctx) => {
      exercises.forEach((exercise, index) => {
        const selectedExercise = allExercises.find(e => e.id === exercise.exerciseId);
        if (!selectedExercise) return;

        if (selectedExercise.type === 'weighted') {
            if (!exercise.reps) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Укажите повторения`,
                path: [`exercises`, index, 'reps'],
              });
            }
            if (exercise.weight === undefined || exercise.weight === null) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Укажите вес`,
                path: [`exercises`, index, 'weight'],
              });
            }
        }
      });
    }),
});

type CreateWorkoutFormProps = {
  allExercises: Exercise[];
  onFormSubmit: (data: Omit<Workout, 'id'>, id?: string) => void;
  onCancel: () => void;
  initialData?: Workout | null;
};

// a global for this component to pass zod refine context
let allExercises: Exercise[] = [];

export function CreateWorkoutForm({
  allExercises: propsAllExercises,
  onFormSubmit,
  onCancel,
  initialData,
}: CreateWorkoutFormProps) {
  allExercises = propsAllExercises;
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      exercises: [],
    },
  });

  useEffect(() => {
    if (initialData) {
        form.reset(initialData);
    } else {
        form.reset({
            name: '',
            description: '',
            exercises: [],
        });
    }
  }, [initialData, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  const handleAddExercise = () => {
    const exerciseToAdd = propsAllExercises.find(
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

  const getExerciseNameById = (id: string) => {
    return propsAllExercises.find((e) => e.id === id)?.name || 'Неизвестное';
  };
  
  const getExerciseTypeById = (id: string) => {
    return propsAllExercises.find((e) => e.id === id)?.type;
  }

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
                {propsAllExercises.map((ex) => (
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
              const exerciseType = getExerciseTypeById(field.exerciseId);
              return (
                <Card key={field.id} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">
                        {getExerciseNameById(field.exerciseId)}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`exercises.${index}.sets`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Подходы</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {exerciseType === 'weighted' && (
                        <>
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.reps`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Повторения</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                          />
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
                        </>
                      )}
                      
                      {exerciseType === 'timed-distance' && (
                        <>
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.reps`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Повторения</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                          />
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
                                <FormLabel>Дистанция (км)</FormLabel>
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
