// @/hooks/store/workoutSummary.ts
// Reads finished-workout data from the store and shapes it for the summary
// screen. Rows are normalized to typed objects immediately, so the rest of the
// hook works on plain numbers/strings rather than TinyBase Cell unions.

import { store } from "@/store/schema";
import { useMemo } from "react";
import { useTable } from "tinybase/ui-react";

export type ExType = "weighted" | "bodyweight" | "duration";

export interface ExSummary {
  id: string;
  name: string;
  type: ExType;
  order: number;
  sets: { weight: number; reps: number; duration: number }[];
  setsDone: number;
  volume: number; // weighted only
  totalReps: number; // weighted + bodyweight
  totalDuration: number; // duration only
  topWeight: number;
  topReps: number;
  bestDuration: number;
  best1RM: number;
  prevTop: number | null; // type-appropriate top metric from the previous session
  isPR: boolean;
  prLabel: string | null;
  isBaseline: boolean;
  hasTarget: boolean;
  hitTarget: boolean;
  suggestNext: number | null; // weighted only
}

export interface WorkoutSummary {
  finishedAt: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  duration: number;
  exerciseCount: number;
  volumeDelta: number | null;
  volumePct: number | null;
  prCount: number;
  targetsHit: number;
  targetsTotal: number;
  exercises: ExSummary[];
  isFirst: boolean;
  unit: string;
}

/* ---------- coercion ---------- */
const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
const str = (v: unknown) => (v == null ? "" : String(v));
const epley = (w: number, r: number) => (w > 0 && r > 0 ? w * (1 + r / 30) : 0);

const EX_TYPES: ExType[] = ["weighted", "bodyweight", "duration"];
const asExType = (v: unknown): ExType =>
  (EX_TYPES as string[]).includes(str(v)) ? (str(v) as ExType) : "weighted";

/* ---------- normalized row shapes ---------- */
interface WRow {
  id: string;
  scheduleId: string;
  startedAt: number;
  finishedAt: number;
  durationSeconds: number;
}
interface SRow {
  id: string;
  workoutId: string;
  exerciseId: string;
  reps: number;
  weight: number;
  duration: number;
  order: number;
}
interface ERow {
  name: string;
  type: ExType;
  order: number;
  targetSets: number;
  repMin: number;
  repMax: number;
  increment: number;
}

export function useWorkoutSummary(scheduleId: string): WorkoutSummary | null {
  const workoutsTable = useTable("workouts", store);
  const workoutSetsTable = useTable("workoutSets", store);
  const exercisesTable = useTable("exercises", store);
  const settingsTable = useTable("settings", store);

  return useMemo(() => {
    const unit = str(Object.values(settingsTable)[0]?.weightUnit) || "kg";

    const allWorkouts: WRow[] = Object.entries(workoutsTable).map(
      ([id, w]) => ({
        id,
        scheduleId: str(w.scheduleId),
        startedAt: num(w.startedAt),
        finishedAt: num(w.finishedAt),
        durationSeconds: num(w.durationSeconds),
      }),
    );

    const allSets: SRow[] = Object.entries(workoutSetsTable).map(([id, s]) => ({
      id,
      workoutId: str(s.workoutId),
      exerciseId: str(s.exerciseId),
      reps: num(s.reps),
      weight: num(s.weight),
      duration: num(s.duration), // 0 until `duration` is added to the workoutSets schema
      order: num(s.order),
    }));

    const exerciseById = (exId: string): ERow => {
      const e = exercisesTable[exId];
      return {
        name: str(e?.name) || "Exercise",
        type: asExType(e?.type),
        order: num(e?.order),
        targetSets: num(e?.targetSets),
        repMin: num(e?.targetRepsMin),
        repMax: num(e?.targetRepsMax),
        increment: num(e?.incrementKg) || 2.5,
      };
    };

    const ts = (w: WRow) => w.finishedAt || w.startedAt;

    const mine = allWorkouts
      .filter((w) => w.scheduleId === scheduleId && ts(w) > 0)
      .sort((a, b) => ts(b) - ts(a));

    const current = mine[0];
    if (!current) return null;
    const previous = mine[1];
    const curFinish = ts(current);

    const curSets = allSets.filter((s) => s.workoutId === current.id);

    // best-before, per exerciseId, across every earlier workout (any schedule)
    const earlier = new Set(
      allWorkouts
        .filter((w) => w.id !== current.id && ts(w) < curFinish)
        .map((w) => w.id),
    );
    const prior: Record<
      string,
      { maxWeight: number; max1RM: number; maxReps: number; maxDur: number }
    > = {};
    for (const s of allSets) {
      if (!earlier.has(s.workoutId)) continue;
      const p =
        prior[s.exerciseId] ??
        (prior[s.exerciseId] = {
          maxWeight: 0,
          max1RM: 0,
          maxReps: 0,
          maxDur: 0,
        });
      p.maxWeight = Math.max(p.maxWeight, s.weight);
      p.max1RM = Math.max(p.max1RM, epley(s.weight, s.reps));
      p.maxReps = Math.max(p.maxReps, s.reps);
      p.maxDur = Math.max(p.maxDur, s.duration);
    }

    // previous-session top metric per exercise (for the "vs last" line)
    const prevTopW: Record<string, number> = {};
    const prevTopR: Record<string, number> = {};
    const prevTopD: Record<string, number> = {};
    if (previous) {
      for (const s of allSets) {
        if (s.workoutId !== previous.id) continue;
        prevTopW[s.exerciseId] = Math.max(
          prevTopW[s.exerciseId] ?? 0,
          s.weight,
        );
        prevTopR[s.exerciseId] = Math.max(prevTopR[s.exerciseId] ?? 0, s.reps);
        prevTopD[s.exerciseId] = Math.max(
          prevTopD[s.exerciseId] ?? 0,
          s.duration,
        );
      }
    }

    const grouped: Record<string, SRow[]> = {};
    for (const s of curSets) (grouped[s.exerciseId] ??= []).push(s);

    const exSummaries: ExSummary[] = Object.entries(grouped).map(
      ([exId, raw]) => {
        const ex = exerciseById(exId);
        const type = ex.type;
        const sets = raw
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((s) => ({
            weight: s.weight,
            reps: s.reps,
            duration: s.duration,
          }));

        const volume = sets.reduce((a, s) => a + s.weight * s.reps, 0);
        const totalReps = sets.reduce((a, s) => a + s.reps, 0);
        const totalDuration = sets.reduce((a, s) => a + s.duration, 0);
        const topWeight = sets.reduce((m, s) => Math.max(m, s.weight), 0);
        const topReps = sets.reduce((m, s) => Math.max(m, s.reps), 0);
        const bestDuration = sets.reduce((m, s) => Math.max(m, s.duration), 0);
        const best1RM = sets.reduce(
          (m, s) => Math.max(m, epley(s.weight, s.reps)),
          0,
        );

        const p = prior[exId];
        const isBaseline = !p;

        let isPR = false;
        let prLabel: string | null = null;
        let prevTop: number | null = null;
        if (p) {
          if (type === "weighted") {
            if (topWeight > p.maxWeight) {
              isPR = true;
              prLabel = "new top weight";
            } else if (best1RM > p.max1RM + 0.01) {
              isPR = true;
              prLabel = "new est. 1RM";
            }
            prevTop = previous ? (prevTopW[exId] ?? null) : null;
          } else if (type === "bodyweight") {
            if (topReps > p.maxReps) {
              isPR = true;
              prLabel = "new rep max";
            }
            prevTop = previous ? (prevTopR[exId] ?? null) : null;
          } else {
            if (bestDuration > p.maxDur) {
              isPR = true;
              prLabel = "new best time";
            }
            prevTop = previous ? (prevTopD[exId] ?? null) : null;
          }
        }

        const { targetSets, repMin, repMax, increment } = ex;
        const hasTarget = targetSets > 0 || repMin > 0 || repMax > 0;
        const enoughSets = targetSets === 0 || sets.length >= targetSets;
        const repsOk =
          type === "duration" ||
          repMin === 0 ||
          sets.every((s) => s.reps >= repMin);
        const hitTarget = hasTarget && enoughSets && repsOk;

        const clearedTop =
          type === "weighted" &&
          repMax > 0 &&
          enoughSets &&
          sets.length > 0 &&
          sets.every((s) => s.reps >= repMax);
        const suggestNext = clearedTop ? topWeight + increment : null;

        return {
          id: exId,
          name: ex.name,
          type,
          order: ex.order,
          sets,
          setsDone: sets.length,
          volume,
          totalReps,
          totalDuration,
          topWeight,
          topReps,
          bestDuration,
          best1RM,
          prevTop,
          isPR,
          prLabel,
          isBaseline,
          hasTarget,
          hitTarget,
          suggestNext,
        };
      },
    );

    exSummaries.sort((a, b) => a.order - b.order);

    const totalVolume = exSummaries.reduce((a, e) => a + e.volume, 0);
    const totalReps = exSummaries.reduce((a, e) => a + e.totalReps, 0);
    const duration =
      current.durationSeconds ||
      (current.finishedAt && current.startedAt
        ? (current.finishedAt - current.startedAt) / 1000
        : 0);

    let prevVolume: number | null = null;
    if (previous) {
      prevVolume = allSets
        .filter((s) => s.workoutId === previous.id)
        .reduce((a, s) => a + s.weight * s.reps, 0);
    }
    const volumeDelta = prevVolume == null ? null : totalVolume - prevVolume;
    const volumePct =
      prevVolume && volumeDelta != null
        ? (volumeDelta / prevVolume) * 100
        : null;

    const withTargets = exSummaries.filter((e) => e.hasTarget);

    return {
      finishedAt: curFinish,
      totalVolume,
      totalSets: curSets.length,
      totalReps,
      duration,
      exerciseCount: exSummaries.length,
      volumeDelta,
      volumePct,
      prCount: exSummaries.filter((e) => e.isPR).length,
      targetsHit: withTargets.filter((e) => e.hitTarget).length,
      targetsTotal: withTargets.length,
      exercises: exSummaries,
      isFirst: !previous,
      unit,
    };
  }, [
    workoutsTable,
    workoutSetsTable,
    exercisesTable,
    settingsTable,
    scheduleId,
  ]);
}
