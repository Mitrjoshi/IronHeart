import { store } from "@/store/schema";
import { useRow, useRowIds } from "tinybase/ui-react";
import { v4 as uuid } from "uuid";

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const SET_DURATION_SECONDS = 45;
const REST_BETWEEN_SETS_SECONDS = 60;
const REST_BETWEEN_EXERCISES_SECONDS = 90;

export const useAllSchedules = () => {
  const ids = useRowIds("schedules", store);
  const exerciseIds = useRowIds("exercises", store);
  const setIds = useRowIds("sets", store);

  return ids
    .map((id) => {
      const scheduleExercises = exerciseIds.filter(
        (exerciseId) =>
          store.getCell("exercises", exerciseId, "scheduleId") === id,
      );

      const scheduleSets = setIds.filter((setId) =>
        scheduleExercises.includes(
          store.getCell("sets", setId, "exerciseId") as string,
        ),
      );

      const totalSets = scheduleSets.length;

      const totalReps = scheduleSets.reduce(
        (sum, setId) => sum + (store.getCell("sets", setId, "reps") as number),
        0,
      );

      const estimatedSeconds =
        totalSets * SET_DURATION_SECONDS +
        totalSets * REST_BETWEEN_SETS_SECONDS +
        scheduleExercises.length * REST_BETWEEN_EXERCISES_SECONDS;

      const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

      return {
        id,
        name: store.getCell("schedules", id, "name") as string,
        day: store.getCell("schedules", id, "day") as string,
        totalSets,
        totalReps,
        estimatedMinutes,
        exercises: scheduleExercises
          .map(
            (exerciseId) =>
              store.getCell("exercises", exerciseId, "name") as string,
          )
          .join(", "),
      };
    })
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
  const exerciseIds = useRowIds("exercises", store);
  const setIds = useRowIds("sets", store);

  return ids.reduce(
    (acc, id) => {
      const scheduleDay = store.getCell("schedules", id, "day") as string;
      const name = store.getCell("schedules", id, "name") as string;

      if (scheduleDay === day.toLowerCase()) {
        const scheduleExercises = exerciseIds.filter(
          (exerciseId) =>
            store.getCell("exercises", exerciseId, "scheduleId") === id,
        );

        const scheduleSets = setIds.filter((setId) =>
          scheduleExercises.includes(
            store.getCell("sets", setId, "exerciseId") as string,
          ),
        );

        const totalSets = scheduleSets.length;

        const totalReps = scheduleSets.reduce(
          (sum, setId) =>
            sum + (store.getCell("sets", setId, "reps") as number),
          0,
        );

        acc.push({ id, name, day: scheduleDay, totalSets, totalReps });
      }

      return acc;
    },
    [] as {
      id: string;
      name: string;
      day: string;
      totalSets: number;
      totalReps: number;
    }[],
  );
};

export const useDeleteSchedule = () => {
  return (id: string) => {
    store.delRow("schedules", id);
  };
};

export const useAddSchedule = () => {
  return (name: string, day: string) => {
    const id = uuid();

    store.setRow("schedules", id, {
      name,
      day: day.toLowerCase(),
      createdAt: Date.now(),
    });

    return id;
  };
};
