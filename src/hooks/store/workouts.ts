// hooks/store/useWorkout.ts
import { v4 as uuid } from "uuid";
import { store } from "@/store/schema";
import { useRow, useRowIds } from "tinybase/ui-react";

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

export const useWorkoutById = (workoutId: string) => {
  const workout = useRow("workouts", workoutId, store);
  const workoutSetIds = useRowIds("workoutSets", store);

  if (!workout.startedAt) return null; // not found

  const scheduleId = workout.scheduleId as string;

  const setIds = workoutSetIds.filter(
    (setId) => store.getCell("workoutSets", setId, "workoutId") === workoutId,
  );

  // group this workout's sets by exercise
  const byExercise = new Map<
    string,
    {
      id: string;
      order: number;
      reps: number;
      weight: number;
      duration: number;
    }[]
  >();

  setIds.forEach((setId) => {
    const exerciseId = store.getCell(
      "workoutSets",
      setId,
      "exerciseId",
    ) as string;

    const list = byExercise.get(exerciseId) ?? [];
    list.push({
      id: setId,
      order: (store.getCell("workoutSets", setId, "order") as number) ?? 0,
      reps: (store.getCell("workoutSets", setId, "reps") as number) ?? 0,
      weight: (store.getCell("workoutSets", setId, "weight") as number) ?? 0,
      duration:
        (store.getCell("workoutSets", setId, "duration") as number) ?? 0,
    });
    byExercise.set(exerciseId, list);
  });

  const exercises = [...byExercise.entries()]
    .map(([exerciseId, rawSets]) => {
      const sets = rawSets
        .sort((a, b) => a.order - b.order)
        .map((set, i) => ({ ...set, setNumber: i + 1 }));

      const totalReps = sets.reduce((s, set) => s + set.reps, 0);
      const totalVolume = sets.reduce((s, set) => s + set.reps * set.weight, 0);
      const totalDuration = sets.reduce((s, set) => s + set.duration, 0);

      const bestSet = sets.reduce<{ weight: number; reps: number } | null>(
        (best, set) =>
          !best || set.weight > best.weight
            ? { weight: set.weight, reps: set.reps }
            : best,
        null,
      );

      return {
        id: exerciseId,
        name: store.getCell("exercises", exerciseId, "name") as string,
        type: store.getCell("exercises", exerciseId, "type") as string,
        order: (store.getCell("exercises", exerciseId, "order") as number) ?? 0,
        sets,
        setCount: sets.length,
        totalReps,
        totalVolume,
        totalDuration,
        bestSet,
      };
    })
    .sort((a, b) => a.order - b.order);

  return {
    id: workoutId,
    scheduleId,
    scheduleName: store.getCell("schedules", scheduleId, "name") as string,
    scheduleDay: store.getCell("schedules", scheduleId, "day") as string,
    startedAt: workout.startedAt as number,
    finishedAt: workout.finishedAt as number,
    durationSeconds: workout.durationSeconds as number,
    exerciseCount: exercises.length,
    numberOfSets: setIds.length,
    totalReps: exercises.reduce((s, e) => s + e.totalReps, 0),
    totalVolume: exercises.reduce((s, e) => s + e.totalVolume, 0),
    totalDuration: exercises.reduce((s, e) => s + e.totalDuration, 0),
    exercises,
  };
};
