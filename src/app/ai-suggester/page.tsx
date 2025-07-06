"use client";

import { useFormState, useFormStatus } from "react-dom";
import { suggestWorkout, SuggestWorkoutOutput } from "@/ai/flows/suggest-workout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

async function suggestWorkoutAction(
  prevState: any,
  formData: FormData
): Promise<SuggestWorkoutOutput | { error: string }> {
  const workoutHistory = formData.get("workoutHistory") as string;
  const fitnessGoals = formData.get("fitnessGoals") as string;

  if (!workoutHistory || !fitnessGoals) {
    return { error: "Пожалуйста, заполните оба поля." };
  }

  try {
    const result = await suggestWorkout({ workoutHistory, fitnessGoals });
    return result;
  } catch (e) {
    return { error: "Не удалось получить рекомендацию. Пожалуйста, попробуйте снова." };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Получить рекомендацию
    </Button>
  );
}

export default function AiSuggesterPage() {
  const [state, formAction] = useFormState(suggestWorkoutAction, null);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI-ассистент тренировок</CardTitle>
          <CardDescription>
            Опишите свои недавние тренировки и цели, чтобы получить
            персональный план тренировок, сгенерированный ИИ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="workoutHistory">Ваша история тренировок</Label>
              <Textarea
                id="workoutHistory"
                name="workoutHistory"
                placeholder="Например: Я занимаюсь 3 раза в неделю, делаю упор на базовые упражнения, такие как приседания и жим лежа."
                rows={4}
                required
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="fitnessGoals">Ваши фитнес-цели</Label>
              <Textarea
                id="fitnessGoals"
                name="fitnessGoals"
                placeholder="Например: Я хочу набрать мышечную массу в верхней части тела и увеличить общую силу."
                rows={4}
                required
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">Рекомендуемая тренировка</CardTitle>
          <CardDescription>
            Ваш сгенерированный ИИ план тренировок появится здесь.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {state && 'suggestedWorkout' in state && (
            <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
              {state.suggestedWorkout}
            </div>
          )}
          {state && 'error' in state && (
            <p className="text-destructive">{state.error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
