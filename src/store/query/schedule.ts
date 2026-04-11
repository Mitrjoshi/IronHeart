import { v4 as uuid } from "uuid";
import { store } from "../schema";

export const addSchedule = (name: string, day: string) => {
  const id = uuid();

  store.setRow("schedules", id, {
    name,
    day: day.toLowerCase(),
    createdAt: Date.now(),
  });

  return id;
};
