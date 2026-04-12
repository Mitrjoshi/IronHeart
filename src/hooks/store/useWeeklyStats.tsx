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
  const workoutIds = useRowIds("workouts", store);
  const workoutSetIds = useRowIds("workoutSets", store);
  const scheduleIds = useRowIds("schedules", store);

  // start of current week (monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() + diffToMonday);

  return DAYS.map((day) => {
    const dayIndex = DAYS.indexOf(day);
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + dayIndex);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    // workouts completed on this day
    const dayWorkouts = workoutIds.filter((id) => {
      const finishedAt = store.getCell("workouts", id, "finishedAt") as number;
      return finishedAt >= dayStart.getTime() && finishedAt <= dayEnd.getTime();
    });

    // sets from those workouts
    const daySets = workoutSetIds.filter((setId) =>
      dayWorkouts.includes(
        store.getCell("workoutSets", setId, "workoutId") as string,
      ),
    );

    const totalReps = daySets.reduce(
      (sum, setId) =>
        sum + (store.getCell("workoutSets", setId, "reps") as number),
      0,
    );

    const totalWeight = daySets.reduce(
      (sum, setId) =>
        sum +
        (store.getCell("workoutSets", setId, "reps") as number) *
          (store.getCell("workoutSets", setId, "weight") as number),
      0,
    );

    // schedule name for this day
    const scheduleId = scheduleIds.find(
      (id) => store.getCell("schedules", id, "day") === day,
    );
    const scheduleName = scheduleId
      ? (store.getCell("schedules", scheduleId, "name") as string)
      : null;

    return { day, totalReps, totalWeight, scheduleName };
  });
};
