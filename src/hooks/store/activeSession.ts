import { store } from "@/store/schema";
import { useRow, useRowIds } from "tinybase/ui-react";

type SetEntry = { reps: string; weight: string; duration: string };

export const useSaveSession = () => {
  return (
    scheduleId: string,
    workoutId: string,
    elapsedTime: number,
    exerciseSets: Record<string, SetEntry[]>,
  ) => {
    store.setRow("activeSessions", scheduleId, {
      scheduleId,
      workoutId,
      elapsedTime,
      exerciseSets: JSON.stringify(exerciseSets),
      savedAt: Date.now(),
    });
  };
};

export const useLoadSession = (scheduleId: string) => {
  const row = useRow("activeSessions", scheduleId, store);

  const workoutId = row.workoutId as string | undefined;
  const elapsedTime = row.elapsedTime as number | undefined;
  const exerciseSets = row.exerciseSets as string | undefined;
  const savedAt = row.savedAt as number | undefined;

  if (!workoutId || !exerciseSets) return null;

  return {
    workoutId,
    elapsedTime: elapsedTime ?? 0,
    exerciseSets: JSON.parse(exerciseSets) as Record<string, SetEntry[]>,
    savedAt: savedAt ?? 0,
  };
};

export const useClearSession = () => {
  return (scheduleId: string) => {
    store.delRow("activeSessions", scheduleId);
  };
};

export const useActiveSessions = () => {
  const ids = useRowIds("activeSessions", store);

  return ids.map((id) => {
    const scheduleId = store.getCell(
      "activeSessions",
      id,
      "scheduleId",
    ) as string;
    const scheduleDay = store.getCell("schedules", scheduleId, "day") as string;
    const scheduleName = store.getCell(
      "schedules",
      scheduleId,
      "name",
    ) as string;

    return {
      id,
      scheduleId,
      scheduleName,
      scheduleDay,
      workoutId: store.getCell("activeSessions", id, "workoutId") as string,
      elapsedTime: store.getCell("activeSessions", id, "elapsedTime") as number,
      savedAt: store.getCell("activeSessions", id, "savedAt") as number,
    };
  });
};
