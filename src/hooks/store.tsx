import { store } from "@/store/schema";
import { useRow, useRowIds } from "tinybase/ui-react";

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const useAllSchedules = () => {
  const ids = useRowIds("schedules", store);

  return ids
    .map((id) => ({
      id,
      name: store.getCell("schedules", id, "name") as string,
      day: store.getCell("schedules", id, "day") as string,
    }))
    .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
};

const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const useSchedulesToday = () => {
  const today = DAYS[new Date().getDay()];
  const ids = useRowIds("schedules", store);

  return ids.reduce(
    (acc, id) => {
      const day = store.getCell("schedules", id, "day") as string;

      if (day === today) {
        acc.push({
          id,
          day,
          name: store.getCell("schedules", id, "name") as string,
        });
      }

      return acc;
    },
    [] as { id: string; name: string; day: string }[],
  );
};

export const useScheduleById = (id: string) => {
  const row = useRow("schedules", id, store);

  if (!row.name) return null;

  return {
    id,
    name: row.name as string,
    day: row.day as string,
    createdAt: row.createdAt as number,
  };
};

export const useSchedulesByDay = (day: string) => {
  const ids = useRowIds("schedules", store);

  return ids.reduce(
    (acc, id) => {
      const scheduleDay = store.getCell("schedules", id, "day") as string;
      const name = store.getCell("schedules", id, "name") as string;

      if (scheduleDay === day.toLowerCase()) {
        acc.push({ id, name, day: scheduleDay });
      }

      return acc;
    },
    [] as { id: string; name: string; day: string }[],
  );
};

export const useDeleteSchedule = () => {
  return (id: string) => {
    store.delRow("schedules", id);
  };
};
