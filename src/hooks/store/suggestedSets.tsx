// hooks/store/useSuggestedSets.ts
import { store } from "@/store/schema";
import { useRowIds } from "tinybase/ui-react";

type SetSuggestion = {
  reps: string;
  weight: string;
  duration: string;
  hint: string;
};

export const useAllSuggestedSets = (
  exercises: { id: string }[],
): Record<string, SetSuggestion[]> => {
  const workoutSetIds = useRowIds("workoutSets", store);

  return Object.fromEntries(
    exercises.map(({ id: exerciseId }) => {
      const exerciseType = store.getCell(
        "exercises",
        exerciseId,
        "type",
      ) as string;
      const targetRepsMin = store.getCell(
        "exercises",
        exerciseId,
        "targetRepsMin",
      ) as number | undefined;
      const targetRepsMax = store.getCell(
        "exercises",
        exerciseId,
        "targetRepsMax",
      ) as number | undefined;

      const history = workoutSetIds
        .filter(
          (id) => store.getCell("workoutSets", id, "exerciseId") === exerciseId,
        )
        .map((id) => {
          const workoutId = store.getCell(
            "workoutSets",
            id,
            "workoutId",
          ) as string;
          const startedAt = store.getCell(
            "workouts",
            workoutId,
            "startedAt",
          ) as number;
          return {
            reps: store.getCell("workoutSets", id, "reps") as number,
            weight: store.getCell("workoutSets", id, "weight") as number,
            duration: store.getCell("workoutSets", id, "duration") as number,
            order: store.getCell("workoutSets", id, "order") as number,
            workoutId,
            startedAt,
          };
        })
        .sort((a, b) => b.startedAt - a.startedAt);

      if (!history.length) return [exerciseId, []];

      const sessions = new Map<string, typeof history>();
      for (const entry of history) {
        if (!sessions.has(entry.workoutId)) sessions.set(entry.workoutId, []);
        sessions.get(entry.workoutId)!.push(entry);
      }

      const sessionList = [...sessions.values()]
        .sort((a, b) => b[0].startedAt - a[0].startedAt)
        .slice(0, 2);

      const lastSession = sessionList[0].sort((a, b) => a.order - b.order);
      const prevSession = sessionList[1]?.sort((a, b) => a.order - b.order);

      const suggestions = lastSession.map((set, i) => {
        const prevSet = prevSession?.[i];

        if (exerciseType === "weighted") {
          const repsHitMax = targetRepsMax != null && set.reps >= targetRepsMax;
          const sameWeightBothSessions =
            prevSet &&
            prevSet.weight === set.weight &&
            prevSet.reps === set.reps;

          let suggestedWeight = set.weight;
          let suggestedReps = set.reps;
          let hint = "Same as last session";

          if (repsHitMax) {
            const increment = set.weight >= 60 ? 5 : 2.5;
            suggestedWeight = set.weight + increment;
            suggestedReps = targetRepsMin ?? set.reps;
            hint = `↑ Hit rep target — +${increment}kg, reset reps`;
          } else if (sameWeightBothSessions) {
            const increment = set.weight >= 60 ? 5 : 2.5;
            suggestedWeight = set.weight + increment;
            hint = `↑ Plateau — try +${increment}kg`;
          } else if (prevSet && set.weight > prevSet.weight) {
            suggestedReps = set.reps + 1;
            hint = "Hold weight, add 1 rep";
          } else if (prevSet && set.reps > prevSet.reps) {
            hint = "↑ Good progress";
          }

          return {
            reps: String(suggestedReps),
            weight: String(suggestedWeight),
            duration: "",
            hint,
          };
        }

        if (exerciseType === "bodyweight") {
          const sameRepsBothSessions = prevSet && prevSet.reps === set.reps;
          return {
            reps: String(sameRepsBothSessions ? set.reps + 2 : set.reps),
            weight: "",
            duration: "",
            hint: sameRepsBothSessions ? "↑ Add 2 reps" : "↑ Good progress",
          };
        }

        if (exerciseType === "duration") {
          const sameDurationBothSessions =
            prevSet && prevSet.duration === set.duration;
          return {
            reps: "",
            weight: "",
            duration: String(
              sameDurationBothSessions ? set.duration + 15 : set.duration,
            ),
            hint: sameDurationBothSessions ? "↑ Add 15 sec" : "↑ Good progress",
          };
        }

        return { reps: "", weight: "", duration: "", hint: "" };
      });

      return [exerciseId, suggestions];
    }),
  );
};
