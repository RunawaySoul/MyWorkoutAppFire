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
    },
  });

  useEffect(() => {
    if (initialData) {
        form.reset({
            name: initialData.name,
            description: initialData.description || '',
            muscleGroup: initialData.muscleGroup,
            type: initialData.type,
            color: initialData.color || '',
        });
    } else {
        form.reset({
            name: '',
            description: '',
            muscleGroup: '',
            color: '#34d399',
            type: undefined,
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
                   <Input placeholder="#34d399" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
