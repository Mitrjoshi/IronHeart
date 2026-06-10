import { store } from "@/store/schema";
import { DAYS } from "@/utils";
import { useRow, useRowIds } from "tinybase/ui-react";
import { v4 as uuid } from "uuid";

// Start of the current week (Sunday 00:00 — DAYS is Sunday-indexed).
// Change to Monday-start by using `((day + 6) % 7)` instead of `day` below.
const getWeekStartMs = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.getTime();
};

export const useAllSchedules = () => {
  const ids = useRowIds("schedules", store);
  const exerciseIds = useRowIds("exercises", store);
  const setIds = useRowIds("sets", store);
  const workoutIds = useRowIds("workouts", store);

  const weekStartMs = getWeekStartMs();

  const schedules = ids.map((id) => {
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

    const scheduleWorkouts = workoutIds
      .filter(
        (workoutId) =>
          store.getCell("workouts", workoutId, "scheduleId") === id &&
          (store.getCell("workouts", workoutId, "finishedAt") as number) > 0,
      )
      .map((workoutId) => ({
        duration:
          (store.getCell("workouts", workoutId, "durationSeconds") as number) ||
          0,
        finishedAt: store.getCell(
          "workouts",
          workoutId,
          "finishedAt",
        ) as number,
      }))
      .sort((a, b) => b.finishedAt - a.finishedAt);

    const lastDurationSeconds = scheduleWorkouts[0]?.duration ?? 0;

    // most recent completion of THIS exact schedule (0 if never finished)
    const lastFinishedAt = scheduleWorkouts[0]?.finishedAt ?? 0;

    const finalSeconds = lastDurationSeconds;

    return {
      id,
      name: store.getCell("schedules", id, "name") as string,
      day: store.getCell("schedules", id, "day") as string,
      totalSets,
      totalReps,
      durationSeconds: finalSeconds,
      lastFinishedAt,
      exercises: scheduleExercises
        .map(
          (exerciseId) =>
            store.getCell("exercises", exerciseId, "name") as string,
        )
        .join(", "),
    };
  });

  const todayIndex = new Date().getDay(); // 0 = Sunday … 6 = Saturday

  // group by day (Sunday → Saturday)
  return DAYS.map((day, dayIndex) => {
    const daySchedules = schedules.filter((s) => s.day === day);

    // this day already passed this week → next occurrence is next week
    const isNextWeek = dayIndex < todayIndex;

    // Which schedule is "done" for this day?
    let doneId: string | undefined;
    if (daySchedules.length > 1) {
      // Multiple schedules → rotation: the most recently completed one stays
      // "done" (carrying across the week) until a *different* one is completed.
      // Everything else is pending / up next.
      doneId = daySchedules
        .filter((s) => s.lastFinishedAt > 0)
        .sort((a, b) => b.lastFinishedAt - a.lastFinishedAt)[0]?.id;
    } else {
      // Single schedule → "done" only for the current week, then resets.
      doneId = daySchedules.find((s) => s.lastFinishedAt >= weekStartMs)?.id;
    }

    return {
      day,
      isNextWeek,
      schedules: daySchedules.map((s) => ({
        ...s,
        isDone: s.id === doneId,
        isNextWeek,
      })),
    };
  });
};

export const useSchedulesToday = () => {
  const today = DAYS[new Date().getDay()];
  const ids = useRowIds("schedules", store);
  const exerciseIds = useRowIds("exercises", store);
  const workoutIds = useRowIds("workouts", store);
  const setIds = useRowIds("sets", store);

  const weekStartMs = getWeekStartMs();

  const todays = ids
    .reduce(
      (acc, id) => {
        const day = store.getCell("schedules", id, "day") as string;

        if (day === today) {
          const scheduleExercises = exerciseIds.filter(
            (exerciseId) =>
              store.getCell("exercises", exerciseId, "scheduleId") === id,
          );

          const exercises = scheduleExercises
            .map(
              (exerciseId) =>
                store.getCell("exercises", exerciseId, "name") as string,
            )
            .join(", ");

          const exerciseCount = scheduleExercises.length;

          const scheduleSets = setIds.filter((setId) =>
            scheduleExercises.includes(
              store.getCell("sets", setId, "exerciseId") as string,
            ),
          );

          const totalSets = scheduleSets.length;

          const repSets = scheduleSets.filter((setId) => {
            const exerciseId = store.getCell(
              "sets",
              setId,
              "exerciseId",
            ) as string;
            const type = store.getCell(
              "exercises",
              exerciseId,
              "type",
            ) as string;
            return type === "weighted" || type === "bodyweight";
          });

          const durationSets = scheduleSets.filter((setId) => {
            const exerciseId = store.getCell(
              "sets",
              setId,
              "exerciseId",
            ) as string;
            const type = store.getCell(
              "exercises",
              exerciseId,
              "type",
            ) as string;
            return type === "duration";
          });

          const totalReps = repSets.reduce(
            (sum, setId) =>
              sum + (store.getCell("sets", setId, "reps") as number),
            0,
          );

          const totalDuration = durationSets.reduce(
            (sum, setId) =>
              sum + (store.getCell("sets", setId, "duration") as number),
            0,
          );

          // most recent completion of THIS schedule (0 if never finished)
          const lastFinishedAt = workoutIds
            .filter(
              (workoutId) =>
                store.getCell("workouts", workoutId, "scheduleId") === id &&
                (store.getCell("workouts", workoutId, "finishedAt") as number) >
                  0,
            )
            .reduce(
              (max, workoutId) =>
                Math.max(
                  max,
                  store.getCell("workouts", workoutId, "finishedAt") as number,
                ),
              0,
            );

          const isDone = lastFinishedAt >= weekStartMs;

          acc.push({
            id,
            day,
            name: store.getCell("schedules", id, "name") as string,
            createdAt:
              (store.getCell("schedules", id, "createdAt") as number) ?? 0,
            exercises,
            exerciseCount,
            totalSets,
            totalReps,
            totalDuration,
            lastFinishedAt,
            isDone,
          });
        }

        return acc;
      },
      [] as {
        id: string;
        name: string;
        day: string;
        createdAt: number;
        exercises: string;
        exerciseCount: number;
        totalSets: number;
        totalReps: number;
        totalDuration: number;
        lastFinishedAt: number;
        isDone: boolean;
      }[],
    )
    // earliest-created first
    .sort((a, b) => a.createdAt - b.createdAt);

  // If any of today's schedules was already completed this week, the day is
  // satisfied → nothing pending.
  if (todays.some((s) => s.lastFinishedAt >= weekStartMs)) return null;

  // Otherwise the rotation pick: the one completed least recently (0 = never),
  // tie-broken by creation order.
  return (
    [...todays].sort(
      (a, b) =>
        a.lastFinishedAt - b.lastFinishedAt || a.createdAt - b.createdAt,
    )[0] ?? null
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
    store.transaction(() => {
      // exercises belonging to this schedule
      const exerciseIds = store
        .getRowIds("exercises")
        .filter(
          (exerciseId) =>
            store.getCell("exercises", exerciseId, "scheduleId") === id,
        );

      // workouts belonging to this schedule
      const workoutIds = store
        .getRowIds("workouts")
        .filter(
          (workoutId) =>
            store.getCell("workouts", workoutId, "scheduleId") === id,
        );

      // sets under those exercises
      store
        .getRowIds("sets")
        .filter((setId) =>
          exerciseIds.includes(
            store.getCell("sets", setId, "exerciseId") as string,
          ),
        )
        .forEach((setId) => store.delRow("sets", setId));

      // workoutSets under those workouts or exercises (avoids orphans)
      store
        .getRowIds("workoutSets")
        .filter((workoutSetId) => {
          const workoutId = store.getCell(
            "workoutSets",
            workoutSetId,
            "workoutId",
          ) as string;
          const exerciseId = store.getCell(
            "workoutSets",
            workoutSetId,
            "exerciseId",
          ) as string;
          return (
            workoutIds.includes(workoutId) || exerciseIds.includes(exerciseId)
          );
        })
        .forEach((workoutSetId) => store.delRow("workoutSets", workoutSetId));

      // active sessions for this schedule
      store
        .getRowIds("activeSessions")
        .filter(
          (sessionId) =>
            store.getCell("activeSessions", sessionId, "scheduleId") === id,
        )
        .forEach((sessionId) => store.delRow("activeSessions", sessionId));

      // the exercises and workouts themselves
      exerciseIds.forEach((exerciseId) =>
        store.delRow("exercises", exerciseId),
      );
      workoutIds.forEach((workoutId) => store.delRow("workouts", workoutId));

      // finally, the schedule
      store.delRow("schedules", id);
    });
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

export const useUpdateSchedule = () => {
  return (id: string, updates: { name?: string; day?: string }) => {
    if (updates.name !== undefined) {
      store.setCell("schedules", id, "name", updates.name);
    }

    if (updates.day !== undefined) {
      store.setCell("schedules", id, "day", updates.day.toLowerCase());
    }
  };
};
