import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { workouts, exercises } from '@/lib/data';
import type { Workout } from '@/lib/types';
import { PlusCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function WorkoutCard({ workout }: { workout: Workout }) {
  const workoutExercises = workout.exercises
    .map((we) => exercises.find((e) => e.id === we.exerciseId))
    .filter(Boolean);
    
  const muscleGroups = [...new Set(workoutExercises.map(e => e!.muscleGroup))];

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">{workout.name}</CardTitle>
        <CardDescription>{workout.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
            {muscleGroups.map(mg => (
                <Badge key={mg} variant="secondary">{mg}</Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href={`/workouts/${workout.id}`}>
            Start Workout <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function WorkoutsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-headline">My Workouts</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Workout
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>
    </div>
  );
}
