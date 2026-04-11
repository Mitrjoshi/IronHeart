// hooks/store/useWeeklyStats.ts
import { store } from "@/store/schema";
import { useRowIds } from "tinybase/ui-react";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const useWeeklyStats = () => {
  const scheduleIds = useRowIds("schedules", store);
  const exerciseIds = useRowIds("exercises", store);
  const setIds = useRowIds("sets", store);

  return DAYS.map((day) => {
    const daySchedules = scheduleIds.filter(
      (id) => store.getCell("schedules", id, "day") === day,
    );

    const dayExercises = exerciseIds.filter((exerciseId) =>
      daySchedules.includes(
        store.getCell("exercises", exerciseId, "scheduleId") as string,
      ),
    );

    const daySets = setIds.filter((setId) =>
      dayExercises.includes(
        store.getCell("sets", setId, "exerciseId") as string,
      ),
    );

    const totalReps = daySets.reduce(
      (sum, setId) => sum + (store.getCell("sets", setId, "reps") as number),
      0,
    );

    const totalWeight = daySets.reduce(
      (sum, setId) =>
        sum +
        (store.getCell("sets", setId, "reps") as number) *
          (store.getCell("sets", setId, "weight") as number),
      0,
    );

    return {
      day,
      totalReps,
      totalWeight,
    };
  });
};
