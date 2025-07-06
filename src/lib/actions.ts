'use server';

import fs from 'fs/promises';
import path from 'path';
import { exercises as initialExercises, workouts as initialWorkouts } from '@/lib/data';
import type { Exercise, Workout } from '@/lib/types';

type AppData = {
    exercises: Exercise[];
    workouts: Workout[];
};

// Define the path to the data file
const dataFilePath = path.join(process.cwd(), 'data', 'db.json');

/**
 * Ensures that the data file exists. If not, it creates it with initial data.
 */
async function ensureDataFileExists() {
    try {
        await fs.access(dataFilePath);
    } catch {
        // File doesn't exist, so create the directory and the file with initial data
        const initialData: AppData = {
            exercises: initialExercises,
            workouts: initialWorkouts,
        };
        try {
            await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
            await fs.writeFile(dataFilePath, JSON.stringify(initialData, null, 2), 'utf8');
        } catch (error) {
            console.error("Error creating data file:", error);
            throw new Error("Could not initialize data file.");
        }
    }
}

/**
 * Reads and returns all application data (exercises and workouts) from the JSON file.
 */
export async function getAppData(): Promise<AppData> {
    try {
        await ensureDataFileExists();
        const fileContent = await fs.readFile(dataFilePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading app data:", error);
        // Fallback to initial data if reading/parsing fails
        return {
            exercises: initialExercises,
            workouts: initialWorkouts,
        };
    }
}

/**
 * Saves the entire list of exercises to the JSON file.
 * @param exercises The array of exercises to save.
 */
export async function saveExercises(exercises: Exercise[]): Promise<void> {
    try {
        const currentData = await getAppData();
        const newData: AppData = { ...currentData, exercises };
        await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving exercises:", error);
        throw new Error("Could not save exercises.");
    }
}

/**
 * Saves the entire list of workouts to the JSON file.
 * @param workouts The array of workouts to save.
 */
export async function saveWorkouts(workouts: Workout[]): Promise<void> {
    try {
        const currentData = await getAppData();
        const newData: AppData = { ...currentData, workouts };
        await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving workouts:", error);
        throw new Error("Could not save workouts.");
    }
}
