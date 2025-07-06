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

const formSchema = z.object({
  name: z.string().min(1, { message: 'Название обязательно.' }),
  description: z.string().min(1, { message: 'Описание обязательно.' }),
  muscleGroup: z.string().min(1, { message: 'Группа мышц обязательна.' }),
  type: z.enum(['weighted', 'timed', 'distance'], {
    required_error: 'Выберите тип.',
  }),
});

type CreateExerciseFormProps = {
  onFormSubmit: (data: Omit<Exercise, 'id' | 'imageUrl' | 'aiHint'>) => void;
  onCancel: () => void;
};

export function CreateExerciseForm({ onFormSubmit, onCancel }: CreateExerciseFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      muscleGroup: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onFormSubmit(values);
  }

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
              <FormLabel>Описание</FormLabel>
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
                  <SelectItem value="weighted">С весом</SelectItem>
                  <SelectItem value="timed">На время</SelectItem>
                  <SelectItem value="distance">На дистанцию</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit">Создать упражнение</Button>
        </div>
      </form>
    </Form>
  );
}
