// hooks/store/useWeeklyStats.ts
import { store } from "@/store/schema";
import { useRowIds } from "tinybase/ui-react";

export const useWeeklyStats = () => {
  const workoutIds = useRowIds("workouts", store);
  const workoutSetIds = useRowIds("workoutSets", store);
  const scheduleIds = useRowIds("schedules", store);

  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  // ✅ group by schedule
  const statsMap: Record<
    string,
    {
      scheduleName: string;
      totalReps: number;
      totalWeight: number;
    }
  > = {};

  // init
  scheduleIds.forEach((id) => {
    statsMap[id] = {
      scheduleName: (store.getCell("schedules", id, "name") as string) || "—",
      totalReps: 0,
      totalWeight: 0,
    };
  });

  // aggregate
  workoutIds.forEach((workoutId) => {
    const finishedAt = store.getCell(
      "workouts",
      workoutId,
      "finishedAt",
    ) as number;

    if (!finishedAt || finishedAt < oneWeekAgo) return;

    const scheduleId = store.getCell(
      "workouts",
      workoutId,
      "scheduleId",
    ) as string;

    if (!statsMap[scheduleId]) return;

    workoutSetIds.forEach((setId) => {
      if (store.getCell("workoutSets", setId, "workoutId") !== workoutId)
        return;

      const reps = (store.getCell("workoutSets", setId, "reps") as number) || 0;

      const weight =
        (store.getCell("workoutSets", setId, "weight") as number) || 0;

      statsMap[scheduleId].totalReps += reps;
      statsMap[scheduleId].totalWeight += reps * weight;
    });
  });

  return Object.values(statsMap);
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
