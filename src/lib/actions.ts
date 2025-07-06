import type { AppData, Exercise, Workout, WorkoutLog, BodyMeasurement } from '@/lib/types';
import initialDataFromFile from '@/data/db.json';

const LOCAL_STORAGE_KEY = 'myWorkoutAppData';

// This function now runs on the client side.
export function getAppData(): AppData {
    if (typeof window === 'undefined') {
        // During build time (server-side rendering for generateStaticParams), return initial data.
        return initialDataFromFile as AppData;
    }

    try {
        const storedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData) as AppData;
        }
    } catch (error) {
        console.error("Error reading from localStorage:", error);
    }
    
    // If no data in localStorage, use initial data from file and save it for next time.
    const initialData = initialDataFromFile as AppData;
    try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
    } catch (error) {
        console.error("Error saving initial data to localStorage:", error);
    }
    return initialData;
}

// This function now runs on the client side and saves to localStorage.
export function saveAppData(data: AppData): void {
    if (typeof window === 'undefined') {
        console.warn("Attempted to save app data outside of a browser environment.");
        return;
    }

    try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (error)
    {
        console.error("Error saving app data to localStorage:", error);
        // Optionally, show a toast notification to the user.
    }
}
