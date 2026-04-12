// hooks/store/useWorkout.ts
import { v4 as uuid } from "uuid";
import { store } from "@/store/schema";
import { useRowIds } from "tinybase/ui-react";

type WorkoutSetEntry = {
  exerciseId: string;
  reps: number;
  weight: number;
  duration: number;
  order: number;
};

export const useStartWorkout = () => {
  return (scheduleId: string) => {
    const workoutId = uuid();
    store.setRow("workouts", workoutId, {
      scheduleId,
      startedAt: Date.now(),
      finishedAt: 0,
      durationSeconds: 0,
    });
    return workoutId;
  };
};

export const useFinishWorkout = () => {
  return (
    workoutId: string,
    durationSeconds: number,
    sets: WorkoutSetEntry[],
  ) => {
    const startedAt = store.getCell(
      "workouts",
      workoutId,
      "startedAt",
    ) as number;

    store.setRow("workouts", workoutId, {
      scheduleId: store.getCell("workouts", workoutId, "scheduleId") as string,
      startedAt,
      finishedAt: Date.now(),
      durationSeconds,
    });

    sets.forEach((set) => {
      store.setRow("workoutSets", uuid(), {
        workoutId,
        exerciseId: set.exerciseId,
        reps: set.reps,
        weight: set.weight,
        duration: set.duration,
        order: set.order,
      });
    });
  };
};

export const useWorkoutHistory = () => {
  const workoutIds = useRowIds("workouts", store);
  const workoutSetIds = useRowIds("workoutSets", store);

  return workoutIds
    .filter((id) => store.getCell("workouts", id, "finishedAt") !== 0)
    .map((id) => {
      const scheduleId = store.getCell("workouts", id, "scheduleId") as string;
      const scheduleName = store.getCell(
        "schedules",
        scheduleId,
        "name",
      ) as string;

      const sets = workoutSetIds.filter(
        (setId) => store.getCell("workoutSets", setId, "workoutId") === id,
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

      const exercisesDone = [
        ...new Set(
          sets.map(
            (setId) =>
              store.getCell("workoutSets", setId, "exerciseId") as string,
          ),
        ),
      ].map((exerciseId) => ({
        id: exerciseId,
        name: store.getCell("exercises", exerciseId, "name") as string,
        type: store.getCell("exercises", exerciseId, "type") as string,
      }));

      return {
        id,
        scheduleId,
        scheduleName,
        startedAt: store.getCell("workouts", id, "startedAt") as number,
        finishedAt: store.getCell("workouts", id, "finishedAt") as number,
        durationSeconds: store.getCell(
          "workouts",
          id,
          "durationSeconds",
        ) as number,
        totalReps,
        totalVolume,
        totalDuration,
        numberOfSets: sets.length,
        exercisesDone,
      };
    })
    .sort((a, b) => b.startedAt - a.startedAt);
};
