// hooks/useExercises.ts
import { v4 as uuid } from "uuid";
import { useRow, useRowIds } from "tinybase/ui-react";
import { store } from "@/store/schema";

export const useAddExercise = () => {
  return (
    name: string,
    scheduleId: string,
    sets: { reps: number; weight: number }[],
  ) => {
    const exerciseId = uuid();

    store.setRow("exercises", exerciseId, {
      name,
      scheduleId,
      createdAt: Date.now(),
    });

    sets.forEach((set, index) => {
      store.setRow("sets", uuid(), {
        exerciseId,
        reps: set.reps,
        weight: set.weight,
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
    scheduleId: store.getCell("exercises", id, "scheduleId") as string,
  }));
};

export const useExercisesBySchedule = (scheduleId: string) => {
  const exerciseIds = useRowIds("exercises", store);
  const setIds = useRowIds("sets", store);

  return exerciseIds.reduce(
    (acc, id) => {
      const rowScheduleId = store.getCell(
        "exercises",
        id,
        "scheduleId",
      ) as string;

      if (rowScheduleId === scheduleId) {
        const exerciseSets = setIds.filter(
          (setId) => store.getCell("sets", setId, "exerciseId") === id,
        );

        const numberOfSets = exerciseSets.length;

        const totalReps = exerciseSets.reduce(
          (sum, setId) =>
            sum + (store.getCell("sets", setId, "reps") as number),
          0,
        );

        const maxWeight = Math.max(
          ...exerciseSets.map(
            (setId) => store.getCell("sets", setId, "weight") as number,
          ),
        );

        acc.push({
          id,
          scheduleId,
          name: store.getCell("exercises", id, "name") as string,
          numberOfSets,
          totalReps,
          maxWeight,
        });
      }

      return acc;
    },
    [] as {
      id: string;
      name: string;
      scheduleId: string;
      numberOfSets: number;
      totalReps: number;
      maxWeight: number;
    }[],
  );
};

export const useExerciseById = (id: string) => {
  const row = useRow("exercises", id, store);
  const setIds = useRowIds("sets", store);

  if (!row.name) return null;

  const sets = setIds
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
      order: store.getCell("sets", setId, "order") as number,
    }));

  return {
    id,
    name: row.name as string,
    scheduleId: row.scheduleId as string,
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
    sets: { id?: string; reps: number; weight: number }[],
  ) => {
    store.setCell("exercises", id, "name", name);

    const existingSetIds = store
      .getRowIds("sets")
      .filter((setId) => store.getCell("sets", setId, "exerciseId") === id);

    // delete removed sets
    existingSetIds.forEach((setId) => {
      if (!sets.find((s) => s.id === setId)) {
        store.delRow("sets", setId);
      }
    });

    // update existing or add new sets
    sets.forEach((set, index) => {
      if (set.id) {
        store.setRow("sets", set.id, {
          exerciseId: id,
          reps: set.reps,
          weight: set.weight,
          order: index + 1,
        });
      } else {
        store.setRow("sets", uuid(), {
          exerciseId: id,
          reps: set.reps,
          weight: set.weight,
          order: index + 1,
        });
      }
    });
  };
};
