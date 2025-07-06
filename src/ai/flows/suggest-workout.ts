'use server';

/**
 * @fileOverview Suggests workout routines based on past workout history and fitness goals.
 *
 * - suggestWorkout - A function that suggests workout routines.
 * - SuggestWorkoutInput - The input type for the suggestWorkout function.
 * - SuggestWorkoutOutput - The return type for the suggestWorkout function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWorkoutInputSchema = z.object({
  workoutHistory: z
    .string()
    .describe(
      'A description of the user past workout history including exercises performed, sets, reps, and weights used.'
    ),
  fitnessGoals: z
    .string()
    .describe(
      'A description of the user fitness goals, including desired outcomes such as weight loss, muscle gain, or improved endurance.'
    ),
});
export type SuggestWorkoutInput = z.infer<typeof SuggestWorkoutInputSchema>;

const SuggestWorkoutOutputSchema = z.object({
  suggestedWorkout: z.string().describe('The suggested workout routine.'),
});
export type SuggestWorkoutOutput = z.infer<typeof SuggestWorkoutOutputSchema>;

export async function suggestWorkout(input: SuggestWorkoutInput): Promise<SuggestWorkoutOutput> {
  return suggestWorkoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWorkoutPrompt',
  input: {schema: SuggestWorkoutInputSchema},
  output: {schema: SuggestWorkoutOutputSchema},
  prompt: `You are a personal fitness trainer who suggests workout routines based on the user past workout history and fitness goals.

  Suggest a workout routine that aligns with the user's goals and takes into consideration their past workout experience. Provide a workout routine that includes exercises, sets, reps, and rest times.

  Workout History: {{{workoutHistory}}}
  Fitness Goals: {{{fitnessGoals}}}`,
});

const suggestWorkoutFlow = ai.defineFlow(
  {
    name: 'suggestWorkoutFlow',
    inputSchema: SuggestWorkoutInputSchema,
    outputSchema: SuggestWorkoutOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
