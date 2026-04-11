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
  },
  sets: {
    exerciseId: { type: "string" },
    reps: { type: "number" },
    weight: { type: "number" },
    order: { type: "number" },
  },
});

const persister = createLocalPersister(store, "schedule-store");

export const initStore = async () => {
  await persister.startAutoLoad();
  await persister.startAutoSave();
};
