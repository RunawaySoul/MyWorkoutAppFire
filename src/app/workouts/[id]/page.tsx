import initialData from "../../../../data/db.json";
import { WorkoutPlayer } from "@/components/workout-player";
import type { AppData } from "@/lib/types";

// This function runs at build time to tell Next.js which pages to generate
export async function generateStaticParams() {
  const { workouts } = initialData as AppData;
  return workouts.map((workout) => ({
    id: workout.id,
  }));
}

// This is a server component that fetches initial data at build time
export default async function WorkoutPlayerPage({ params }: { params: { id:string } }) {
  const appData = initialData as AppData;
  
  // The WorkoutPlayer component will handle all client-side logic and state,
  // including loading the latest data from localStorage.
  return <WorkoutPlayer initialAppData={appData} workoutId={params.id} />;
}
