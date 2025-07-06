
import { getAppData } from "@/lib/actions";
import { WorkoutPlayer } from "@/components/workout-player";

export async function generateStaticParams() {
  const { workouts } = await getAppData();
  return workouts.map((workout) => ({
    id: workout.id,
  }));
}

export default async function WorkoutPlayerPage({ params }: { params: { id:string } }) {
  const appData = await getAppData();
  return <WorkoutPlayer initialAppData={appData} workoutId={params.id} />;
}
