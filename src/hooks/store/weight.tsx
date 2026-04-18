import { v4 as uuid } from "uuid";
import { store } from "@/store/schema";
import { useRowIds } from "tinybase/ui-react";

type WeightEntry = {
  id: string;
  value: number;
  note: string;
  loggedAt: number;
};

type WeightInsights = {
  latest: { id: string; value: number; loggedAt: number };
  movingAverage: number | null;
  weeklyChange: number | null;
  trend: "up" | "down" | "flat" | null;
  streak: number;
  daysSinceLastLog: number;
  bmi: number | null;
  targetProgress: {
    target: number;
    start: number;
    current: number;
    remaining: number;
    percentage: number;
  } | null;
};

// ── settings helpers ────────────────────────────────────────────────────────

const getSettingsNum = (key: string): number | null => {
  const val = store.getCell("settings", "user", key) as number | undefined;
  return val && val > 0 ? val : null;
};

// ── weight hooks ────────────────────────────────────────────────────────────

export const useLogWeight = () => {
  return (value: number, note = "") => {
    store.setRow("weights", uuid(), {
      value,
      note,
      loggedAt: Date.now(),
    });
  };
};

export const useDeleteWeight = () => {
  return (id: string) => {
    store.delRow("weights", id);
  };
};

export const useWeightHistory = (): WeightEntry[] => {
  const ids = useRowIds("weights", store);

  return ids
    .map((id) => ({
      id,
      value: store.getCell("weights", id, "value") as number,
      note: store.getCell("weights", id, "note") as string,
      loggedAt: store.getCell("weights", id, "loggedAt") as number,
    }))
    .sort((a, b) => a.loggedAt - b.loggedAt);
};

export const useWeightInsights = (): WeightInsights | null => {
  const ids = useRowIds("weights", store);

  const entries = ids
    .map((id) => ({
      id,
      value: store.getCell("weights", id, "value") as number,
      loggedAt: store.getCell("weights", id, "loggedAt") as number,
    }))
    .sort((a, b) => a.loggedAt - b.loggedAt);

  if (entries.length === 0) return null;

  const latest = entries.at(-1)!;
  const earliest = entries[0];
  const now = Date.now();

  // 7-day moving average
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const last7 = entries.filter((e) => e.loggedAt >= sevenDaysAgo);
  const movingAverage =
    last7.length > 0
      ? last7.reduce((sum, e) => sum + e.value, 0) / last7.length
      : null;

  // weekly change (compare last 7 vs previous 7)
  const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;
  const prev7 = entries.filter(
    (e) => e.loggedAt >= fourteenDaysAgo && e.loggedAt < sevenDaysAgo,
  );
  const prevAvg =
    prev7.length > 0
      ? prev7.reduce((sum, e) => sum + e.value, 0) / prev7.length
      : null;
  const weeklyChange =
    movingAverage !== null && prevAvg !== null ? movingAverage - prevAvg : null;

  // 30-day trend
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const last30 = entries.filter((e) => e.loggedAt >= thirtyDaysAgo);
  let trend: "up" | "down" | "flat" | null = null;
  if (last30.length >= 2) {
    const diff = last30.at(-1)!.value - last30[0].value;
    if (diff > 0.5) trend = "up";
    else if (diff < -0.5) trend = "down";
    else trend = "flat";
  }

  // consecutive-day streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const dayStart = new Date(today);
    dayStart.setDate(today.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    if (
      entries.some(
        (e) =>
          e.loggedAt >= dayStart.getTime() && e.loggedAt <= dayEnd.getTime(),
      )
    ) {
      streak++;
    } else {
      break;
    }
  }

  // days since last log
  const daysSinceLastLog = Math.floor(
    (now - latest.loggedAt) / (1000 * 60 * 60 * 24),
  );

  // BMI — from settings
  const height = getSettingsNum("height");
  const bmi =
    height && latest.value
      ? Math.round((latest.value / Math.pow(height / 100, 2)) * 10) / 10
      : null;

  // target progress — from settings
  const targetWeight = getSettingsNum("targetWeight");
  const targetProgress =
    targetWeight && earliest.value && earliest.value !== targetWeight
      ? {
          target: targetWeight,
          start: earliest.value,
          current: latest.value,
          remaining: Math.round((latest.value - targetWeight) * 10) / 10,
          percentage: Math.min(
            100,
            Math.round(
              (Math.abs(earliest.value - latest.value) /
                Math.abs(earliest.value - targetWeight)) *
                100,
            ),
          ),
        }
      : null;

  return {
    latest,
    movingAverage:
      movingAverage !== null ? Math.round(movingAverage * 10) / 10 : null,
    weeklyChange:
      weeklyChange !== null ? Math.round(weeklyChange * 10) / 10 : null,
    trend,
    streak,
    daysSinceLastLog,
    bmi,
    targetProgress,
  };
};

// ── settings-derived hooks (use these wherever you need profile data) ────────

export const useUserSettings = () => {
  return {
    height: getSettingsNum("height"),
    age: getSettingsNum("age"),
    targetWeight: getSettingsNum("targetWeight"),
    targetCalories: getSettingsNum("targetCalories"),
    targetProtein: getSettingsNum("targetProtein"),
    targetCarbs: getSettingsNum("targetCarbs"),
    targetFats: getSettingsNum("targetFats"),
    weightUnit:
      (store.getCell("settings", "user", "weightUnit") as string) || "kg",
    theme: (store.getCell("settings", "user", "theme") as string) || "system",
  };
};

export const useNutritionTargets = () => {
  return {
    calories: getSettingsNum("targetCalories") ?? 2000,
    protein: getSettingsNum("targetProtein") ?? 150,
    carbs: getSettingsNum("targetCarbs") ?? 250,
    fats: getSettingsNum("targetFats") ?? 65,
  };
};
