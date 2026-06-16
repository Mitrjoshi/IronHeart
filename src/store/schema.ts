import { createStore } from "tinybase";
import { createLocalPersister } from "tinybase/persisters/persister-browser";

export const store = createStore();

store.setTablesSchema({
  schedules: {
    name: { type: "string" },
    day: { type: "string" },
    createdAt: { type: "number" },
  },
  exercises: {
    name: { type: "string" },
    scheduleId: { type: "string" },
    createdAt: { type: "number" },
    type: { type: "string" },
    order: { type: "number" },

    // Add to exercises table
    targetSets: { type: "number" }, // e.g. 3
    targetReps: { type: "number" }, // e.g. 8-12 (store as "8-12" string or min/max)
    targetRepsMin: { type: "number" },
    targetRepsMax: { type: "number" },
    incrementKg: { type: "number" }, // default 2.5

    // Add to workoutSets table
    rpe: { type: "number" }, // Rate of Perceived Exertion 1-10, key for smarter suggestions
    completed: { type: "number" }, // 0 or 1, did they actually finish this set?
  },
  sets: {
    exerciseId: { type: "string" },
    reps: { type: "number" },
    weight: { type: "number" },
    duration: { type: "number" }, // seconds, used when type is "duration"
    order: { type: "number" },
  },
  workouts: {
    scheduleId: { type: "string" },
    startedAt: { type: "number" },
    finishedAt: { type: "number" },
    durationSeconds: { type: "number" },
  },
  workoutSets: {
    workoutId: { type: "string" },
    exerciseId: { type: "string" },
    reps: { type: "number" },
    weight: { type: "number" },
    order: { type: "number" },
  },
  activeSessions: {
    scheduleId: { type: "string" },
    workoutId: { type: "string" },
    elapsedTime: { type: "number" },
    exerciseSets: { type: "string" }, // JSON stringified
    savedAt: { type: "number" },
  },
  weights: {
    value: { type: "number" }, // kg
    note: { type: "string" },
    loggedAt: { type: "number" }, // timestamp
  },
  // in schema
  settings: {
    weightUnit: { type: "string" },
    theme: { type: "string" },
    height: { type: "number" },
    age: { type: "number" },
    targetWeight: { type: "number" },
    targetCalories: { type: "number" },
    targetProtein: { type: "number" },
    targetCarbs: { type: "number" },
    targetFats: { type: "number" },
  },

  meals: {
    name: { type: "string" }, // breakfast, lunch, etc.
    loggedAt: { type: "number" },
  },

  foodEntries: {
    mealId: { type: "string" },

    foodCode: { type: "string" }, // ASC001
    foodName: { type: "string" },

    quantity: { type: "number" }, // user input (e.g. 150)
    unit: { type: "string" }, // ml, g, cup, etc.

    calories: { type: "number" },
    protein: { type: "number" },
    carbs: { type: "number" },
    fats: { type: "number" },

    createdAt: { type: "number" },
  },

  measurements: {
    group: { type: "string" },
    value: { type: "number" },
    loggedAt: { type: "number" },
  },

  customFoods: {
    food_code: { type: "string" }, // "CUSTOM_<uuid>"
    food_name: { type: "string" },
    energy_kcal: { type: "number" },
    carb_g: { type: "number" },
    protein_g: { type: "number" },
    fat_g: { type: "number" },
    fibre_g: { type: "number" },
    servings_unit: { type: "string" }, // "g", "ml", "piece", etc.
    createdAt: { type: "number" },
    per_amount: { type: "number" }, // e.g. 100
  },
  photos: {
    loggedAt: { type: "number" },
    note: { type: "string" },
  },
});

const persister = createLocalPersister(store, "schedule-store");

export const initStore = async () => {
  await persister.startAutoLoad();
  await persister.startAutoSave();
};
