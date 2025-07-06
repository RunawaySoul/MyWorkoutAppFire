'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Exercise } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Название обязательно.' }),
  description: z.string().optional(),
  muscleGroup: z.string().min(1, { message: 'Группа мышц обязательна.' }),
  type: z.enum(['weighted', 'timed-distance'], {
    required_error: 'Выберите тип.',
  }),
  color: z.string().regex(/^#([0-9a-f]{3,6})$/i, "Введите валидный HEX-код цвета (например, #c0ffee)").optional().or(z.literal('')),
  defaultSets: z.coerce.number().optional(),
  defaultReps: z.coerce.number().optional(),
  defaultWeight: z.coerce.number().optional(),
  defaultDuration: z.coerce.number().optional(),
  defaultDistance: z.coerce.number().step(0.01).optional(),
  defaultRestDuration: z.coerce.number().optional(),
});

type CreateExerciseFormProps = {
  onFormSubmit: (data: Omit<Exercise, 'id' | 'imageUrl' | 'aiHint'>, id?: string) => void;
  onCancel: () => void;
  initialData?: Exercise | null;
};

export function CreateExerciseForm({ onFormSubmit, onCancel, initialData }: CreateExerciseFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      muscleGroup: '',
      color: '',
      defaultSets: undefined,
      defaultReps: undefined,
      defaultWeight: undefined,
      defaultDuration: undefined,
      defaultDistance: undefined,
      defaultRestDuration: undefined,
    },
  });

  const exerciseType = form.watch('type');

  useEffect(() => {
    if (initialData) {
        form.reset({
            name: initialData.name,
            description: initialData.description || '',
            muscleGroup: initialData.muscleGroup,
            type: initialData.type,
            color: initialData.color || '',
            defaultSets: initialData.defaultSets,
            defaultReps: initialData.defaultReps,
            defaultWeight: initialData.defaultWeight,
            defaultDuration: initialData.defaultDuration,
            defaultDistance: initialData.defaultDistance,
            defaultRestDuration: initialData.defaultRestDuration,
        });
    } else {
        form.reset({
            name: '',
            description: '',
            muscleGroup: '',
            color: '#16a34a',
            type: undefined,
            defaultSets: undefined,
            defaultReps: undefined,
            defaultWeight: undefined,
            defaultDuration: undefined,
            defaultDistance: undefined,
            defaultRestDuration: undefined,
        });
    }
  }, [initialData, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onFormSubmit(values, initialData?.id);
  }

  const isEditing = !!initialData;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Название</FormLabel>
                <FormControl>
                  <Input placeholder="Например: Жим лежа" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="muscleGroup"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Группа мышц</FormLabel>
                <FormControl>
                  <Input placeholder="Например: Грудь" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание (необязательно)</FormLabel>
              <FormControl>
                <Textarea placeholder="Опишите как выполнять упражнение" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип упражнения" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="weighted">На подход/повторение</SelectItem>
                    <SelectItem value="timed-distance">На время/расстояние</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Цвет акцента</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input type="color" {...field} className="w-12 h-10 p-1" value={field.value || '#000000'} />
                    <Input placeholder="#16a34a" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {exerciseType && (
          <div className="p-4 border rounded-md space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Значения по умолчанию</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {exerciseType === 'weighted' && (
                <>
                  <FormField
                    control={form.control}
                    name="defaultSets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Подходы</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultReps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Повторы</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Вес (кг)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} />
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
                    name="defaultSets"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Подходы</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultReps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Повторы</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Время (сек)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="60" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultDistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дистанция (км)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name="defaultRestDuration"
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
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">{isEditing ? 'Сохранить' : 'Создать упражнение'}</Button>
        </div>
      </form>
    </Form>
  );
}
