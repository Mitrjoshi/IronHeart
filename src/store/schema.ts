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
});

const persister = createLocalPersister(store, "schedule-store");

export const initStore = async () => {
  await persister.startAutoLoad();
  await persister.startAutoSave();
};
