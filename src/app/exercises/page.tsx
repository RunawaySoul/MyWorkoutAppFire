import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { exercises } from '@/lib/data';
import type { Exercise } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="relative aspect-video w-full">
          <Image
            src={exercise.imageUrl}
            alt={exercise.name}
            fill
            className="rounded-md object-cover"
            data-ai-hint={exercise.aiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardTitle className="text-lg font-headline">{exercise.name}</CardTitle>
        <Badge variant="secondary" className="mt-2">{exercise.muscleGroup}</Badge>
        <p className="mt-2 text-sm text-muted-foreground">
          {exercise.description}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ExercisesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-headline">Exercise Library</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Exercise
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </div>
  );
}
