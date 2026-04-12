// hooks/useExercises.ts
import { v4 as uuid } from "uuid";
import { useRow, useRowIds } from "tinybase/ui-react";
import { store } from "@/store/schema";

export type ExerciseType = "weighted" | "duration" | "bodyweight";

export const useAddExercise = () => {
  return (
    name: string,
    scheduleId: string,
    type: ExerciseType,
    sets: { reps?: number; weight?: number; duration?: number }[],
  ) => {
    const exerciseId = uuid();

    store.setRow("exercises", exerciseId, {
      name,
      scheduleId,
      type,
      createdAt: Date.now(),
    });

    sets.forEach((set, index) => {
      store.setRow("sets", uuid(), {
        exerciseId,
        reps: set.reps ?? 0,
        weight: set.weight ?? 0,
        duration: set.duration ?? 0,
        order: index + 1,
      });
    });

    return exerciseId;
  };
};

export const useAllExercises = () => {
  const ids = useRowIds("exercises", store);

  return ids.map((id) => ({
    id,
    name: store.getCell("exercises", id, "name") as string,
    type:
      (store.getCell("exercises", id, "type") as ExerciseType) ?? "weighted",
    scheduleId: store.getCell("exercises", id, "scheduleId") as string,
  }));
};

const getLastWorkout = (scheduleId: string, workoutIds: string[]) =>
  workoutIds
    .filter(
      (workoutId) =>
        store.getCell("workouts", workoutId, "scheduleId") === scheduleId &&
        (store.getCell("workouts", workoutId, "finishedAt") as number) > 0,
    )
    .sort(
      (a, b) =>
        (store.getCell("workouts", b, "finishedAt") as number) -
        (store.getCell("workouts", a, "finishedAt") as number),
    )[0] ?? null;

const getLastWorkoutSets = (
  exerciseId: string,
  lastWorkout: string | null,
  workoutSetIds: string[],
) => {
  if (!lastWorkout) return null;

  const sets = workoutSetIds
    .filter(
      (setId) =>
        store.getCell("workoutSets", setId, "workoutId") === lastWorkout &&
        store.getCell("workoutSets", setId, "exerciseId") === exerciseId,
    )
    .sort(
      (a, b) =>
        (store.getCell("workoutSets", a, "order") as number) -
        (store.getCell("workoutSets", b, "order") as number),
    )
    .map((setId) => ({
      id: setId,
      reps: store.getCell("workoutSets", setId, "reps") as number,
      weight: store.getCell("workoutSets", setId, "weight") as number,
      duration: store.getCell("workoutSets", setId, "duration") as number,
      order: store.getCell("workoutSets", setId, "order") as number,
    }));

  return sets.length > 0 ? sets : null;
};

export const useExercisesBySchedule = (scheduleId: string) => {
  const exerciseIds = useRowIds("exercises", store);
  const setIds = useRowIds("sets", store);
  const workoutIds = useRowIds("workouts", store);
  const workoutSetIds = useRowIds("workoutSets", store);

  const lastWorkout = getLastWorkout(scheduleId, workoutIds);

  return exerciseIds
    .reduce(
      (acc, id) => {
        const rowScheduleId = store.getCell(
          "exercises",
          id,
          "scheduleId",
        ) as string;

        if (rowScheduleId === scheduleId) {
          const lastWorkoutSets = getLastWorkoutSets(
            id,
            lastWorkout,
            workoutSetIds,
          );

          const templateSets = setIds.filter(
            (setId) => store.getCell("sets", setId, "exerciseId") === id,
          );

          const numberOfSets = lastWorkoutSets?.length ?? templateSets.length;

          const totalReps =
            lastWorkoutSets?.reduce((sum, s) => sum + s.reps, 0) ??
            templateSets.reduce(
              (sum, setId) =>
                sum + (store.getCell("sets", setId, "reps") as number),
              0,
            );

          const maxWeight =
            lastWorkoutSets && lastWorkoutSets.length > 0
              ? Math.max(...lastWorkoutSets.map((s) => s.weight))
              : templateSets.length > 0
                ? Math.max(
                    ...templateSets.map(
                      (setId) =>
                        store.getCell("sets", setId, "weight") as number,
                    ),
                  )
                : 0;

          acc.push({
            id,
            scheduleId,
            name: store.getCell("exercises", id, "name") as string,
            type:
              (store.getCell("exercises", id, "type") as ExerciseType) ??
              "weighted",
            order: (store.getCell("exercises", id, "order") as number) ?? 0,
            numberOfSets,
            totalReps,
            maxWeight,
            lastWorkoutSets,
            lastWorkedOutAt: lastWorkout
              ? (store.getCell("workouts", lastWorkout, "finishedAt") as number)
              : null,
          });
        }

        return acc;
      },
      [] as {
        id: string;
        name: string;
        type: ExerciseType;
        order: number;
        scheduleId: string;
        numberOfSets: number;
        totalReps: number;
        maxWeight: number;
        lastWorkoutSets:
          | {
              id: string;
              reps: number;
              weight: number;
              duration: number;
              order: number;
            }[]
          | null;
        lastWorkedOutAt: number | null;
      }[],
    )
    .sort((a, b) => a.order - b.order);
};

export const useExerciseById = (id: string) => {
  const row = useRow("exercises", id, store);
  const setIds = useRowIds("sets", store);
  const workoutIds = useRowIds("workouts", store);
  const workoutSetIds = useRowIds("workoutSets", store);

  if (!row.name) return null;

  const scheduleId = row.scheduleId as string;
  const lastWorkout = getLastWorkout(scheduleId, workoutIds);
  const lastWorkoutSets = getLastWorkoutSets(id, lastWorkout, workoutSetIds);

  const sets = lastWorkoutSets
    ? lastWorkoutSets
    : setIds
        .filter((setId) => store.getCell("sets", setId, "exerciseId") === id)
        .sort(
          (a, b) =>
            (store.getCell("sets", a, "order") as number) -
            (store.getCell("sets", b, "order") as number),
        )
        .map((setId) => ({
          id: setId,
          reps: store.getCell("sets", setId, "reps") as number,
          weight: store.getCell("sets", setId, "weight") as number,
          duration: store.getCell("sets", setId, "duration") as number,
          order: store.getCell("sets", setId, "order") as number,
        }));

  return {
    id,
    name: row.name as string,
    type: (row.type as ExerciseType) ?? "weighted",
    scheduleId,
    sets,
  };
};

export const useDeleteExercise = () => {
  return (id: string) => {
    store.delRow("exercises", id);
  };
};

export const useUpdateExercise = () => {
  return (
    id: string,
    name: string,
    sets: { id?: string; reps: number; weight: number; duration: number }[],
  ) => {
    store.setCell("exercises", id, "name", name);

    const existingSetIds = store
      .getRowIds("sets")
      .filter((setId) => store.getCell("sets", setId, "exerciseId") === id);

    existingSetIds.forEach((setId) => {
      if (!sets.find((s) => s.id === setId)) {
        store.delRow("sets", setId);
      }
    });

    sets.forEach((set, index) => {
      if (set.id) {
        store.setRow("sets", set.id, {
          exerciseId: id,
          reps: set.reps,
          weight: set.weight,
          duration: set.duration,
          order: index + 1,
        });
      } else {
        store.setRow("sets", uuid(), {
          exerciseId: id,
          reps: set.reps,
          weight: set.weight,
          duration: set.duration,
          order: index + 1,
        });
      }
    });
  };
};
