// hooks/store/useWeeklyStats.ts
import { store } from "@/store/schema";
import { DAYS } from "@/utils";
import { useRowIds } from "tinybase/ui-react";

const DAY_TO_JS_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export const useWeeklyStats = () => {
  const workoutIds = useRowIds("workouts", store);
  const workoutSetIds = useRowIds("workoutSets", store);
  const scheduleIds = useRowIds("schedules", store);

  const now = new Date();
  const startJsDay = DAY_TO_JS_INDEX[DAYS[0]];
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  // days back to the first day of the week, per DAYS ordering
  const backToStart = (now.getDay() - startJsDay + 7) % 7;
  weekStart.setDate(now.getDate() - backToStart);

  return DAYS.map((day) => {
    const dayIndex = DAYS.indexOf(day);
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + dayIndex);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayWorkouts = workoutIds.filter((id) => {
      const finishedAt = store.getCell("workouts", id, "finishedAt") as number;
      return finishedAt >= dayStart.getTime() && finishedAt <= dayEnd.getTime();
    });

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

    const totalDuration = daySets.reduce(
      (sum, setId) =>
        sum + (store.getCell("workoutSets", setId, "duration") as number),
      0,
    );

    const scheduleId = scheduleIds.find(
      (id) => store.getCell("schedules", id, "day") === day,
    );
    const scheduleName = scheduleId
      ? (store.getCell("schedules", scheduleId, "name") as string)
      : null;

    return { day, totalReps, totalWeight, totalDuration, scheduleName };
  });
};

export const useExerciseProgress = (exerciseId: string) => {
  const workoutIds = useRowIds("workouts", store);
  const workoutSetIds = useRowIds("workoutSets", store);

  return workoutIds
    .filter(
      (workoutId) =>
        (store.getCell("workouts", workoutId, "finishedAt") as number) > 0,
    )
    .map((workoutId) => {
      const sets = workoutSetIds.filter(
        (setId) =>
          store.getCell("workoutSets", setId, "workoutId") === workoutId &&
          store.getCell("workoutSets", setId, "exerciseId") === exerciseId,
      );

      if (sets.length === 0) return null;

      const maxWeight = Math.max(
        ...sets.map(
          (setId) => store.getCell("workoutSets", setId, "weight") as number,
        ),
      );

      const totalReps = sets.reduce(
        (sum, setId) =>
          sum + (store.getCell("workoutSets", setId, "reps") as number),
        0,
      );

      const totalVolume = sets.reduce(
        (sum, setId) =>
          sum +
          (store.getCell("workoutSets", setId, "reps") as number) *
            (store.getCell("workoutSets", setId, "weight") as number),
        0,
      );

      const totalDuration = sets.reduce(
        (sum, setId) =>
          sum + (store.getCell("workoutSets", setId, "duration") as number),
        0,
      );

      return {
        workoutId,
        finishedAt: store.getCell(
          "workouts",
          workoutId,
          "finishedAt",
        ) as number,
        maxWeight,
        totalReps,
        totalVolume,
        totalDuration,
        numberOfSets: sets.length,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.finishedAt - b!.finishedAt);
};

export const useAllExercisesProgress = () => {
  const scheduleIds = useRowIds("schedules", store);
  const exerciseIds = useRowIds("exercises", store);
  const workoutIds = useRowIds("workouts", store);
  const workoutSetIds = useRowIds("workoutSets", store);

  return scheduleIds.map((scheduleId) => {
    const scheduleName = store.getCell(
      "schedules",
      scheduleId,
      "name",
    ) as string;
    const scheduleDay = store.getCell("schedules", scheduleId, "day") as string;

    const scheduleExercises = exerciseIds.filter(
      (id) => store.getCell("exercises", id, "scheduleId") === scheduleId,
    );

    const exercises = scheduleExercises
      .map((exerciseId) => {
        const name = store.getCell("exercises", exerciseId, "name") as string;
        const type =
          (store.getCell("exercises", exerciseId, "type") as string) ??
          "weighted";

        const progress = workoutIds
          .filter(
            (workoutId) =>
              (store.getCell("workouts", workoutId, "finishedAt") as number) >
              0,
          )
          .map((workoutId) => {
            const sets = workoutSetIds.filter(
              (setId) =>
                store.getCell("workoutSets", setId, "workoutId") ===
                  workoutId &&
                store.getCell("workoutSets", setId, "exerciseId") ===
                  exerciseId,
            );

            if (sets.length === 0) return null;

            const maxWeight = Math.max(
              ...sets.map(
                (setId) =>
                  store.getCell("workoutSets", setId, "weight") as number,
              ),
            );

            const totalReps = sets.reduce(
              (sum, setId) =>
                sum + (store.getCell("workoutSets", setId, "reps") as number),
              0,
            );

            const totalVolume = sets.reduce(
              (sum, setId) =>
                sum +
                (store.getCell("workoutSets", setId, "reps") as number) *
                  (store.getCell("workoutSets", setId, "weight") as number),
              0,
            );

            const totalDuration = sets.reduce(
              (sum, setId) =>
                sum +
                (store.getCell("workoutSets", setId, "duration") as number),
              0,
            );

            return {
              workoutId,
              finishedAt: store.getCell(
                "workouts",
                workoutId,
                "finishedAt",
              ) as number,
              maxWeight,
              totalReps,
              totalVolume,
              totalDuration,
              numberOfSets: sets.length,
            };
          })
          .filter(Boolean)
          .sort((a, b) => a!.finishedAt - b!.finishedAt);

        const allTimePR = progress.length
          ? Math.max(...progress.map((p) => p!.maxWeight))
          : 0;

        const totalSessions = progress.length;
        const latestSession = progress.at(-1) ?? null;

        return {
          exerciseId,
          name,
          type,
          progress,
          allTimePR,
          totalSessions,
          latestSession,
        };
      })
      .filter((ex) => ex.progress.length > 0);

    return {
      scheduleId,
      scheduleName,
      scheduleDay,
      exercises,
    };
  });
};
