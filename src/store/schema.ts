// store/scheduleStore.ts
import { createStore } from "tinybase";
import { createLocalPersister } from "tinybase/persisters/persister-browser";

export const store = createStore();

store.setTablesSchema({
  schedules: {
    name: { type: "string" },
    day: { type: "string" },
    createdAt: { type: "number" },
  },
});

const persister = createLocalPersister(store, "schedule-store");

export const initStore = async () => {
  await persister.startAutoLoad();
  await persister.startAutoSave();
};
