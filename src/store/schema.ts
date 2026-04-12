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
});

const persister = createLocalPersister(store, "schedule-store");

export const initStore = async () => {
  await persister.startAutoLoad();
  await persister.startAutoSave();
};
