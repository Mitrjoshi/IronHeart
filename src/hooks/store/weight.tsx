import { v4 as uuid } from "uuid";
import { store } from "@/store/schema";
import { useRow, useRowIds } from "tinybase/ui-react";

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
  goalDirection: "lose" | "gain" | null;
  targetProgress: {
    target: number;
    start: number;
    current: number;
    remaining: number;
    percentage: number;
  } | null;
};

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
  return (id: string) => store.delRow("weights", id);
};

export const useWeightHistory = (): WeightEntry[] => {
  const ids = useRowIds("weights", store);
  return ids
    .map((id) => ({
      id,
      value: store.getCell("weights", id, "value") as number,
      note: (store.getCell("weights", id, "note") as string) ?? "",
      loggedAt: store.getCell("weights", id, "loggedAt") as number,
    }))
    .sort((a, b) => a.loggedAt - b.loggedAt);
};

export const useWeightInsights = (): WeightInsights | null => {
  const ids = useRowIds("weights", store);
  const settingsRow = useRow("settings", "user", store);

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

  // weekly change
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
    trend = diff > 0.5 ? "up" : diff < -0.5 ? "down" : "flat";
  }

  // Streak — skip today if not yet logged
  let streak = 0;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const dayStart = new Date(todayStart);
    dayStart.setDate(todayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const hasEntry = entries.some(
      (e) => e.loggedAt >= dayStart.getTime() && e.loggedAt <= dayEnd.getTime(),
    );

    if (hasEntry) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }

  const daysSinceLastLog = Math.floor(
    (now - latest.loggedAt) / (1000 * 60 * 60 * 24),
  );

  // BMI
  const height =
    settingsRow.height && (settingsRow.height as number) > 0
      ? (settingsRow.height as number)
      : null;
  const bmi =
    height && latest.value
      ? Math.round((latest.value / Math.pow(height / 100, 2)) * 10) / 10
      : null;

  // Target
  const targetWeight =
    settingsRow.targetWeight && (settingsRow.targetWeight as number) > 0
      ? (settingsRow.targetWeight as number)
      : null;

  // Goal direction based on current weight vs target
  const goalDirection: WeightInsights["goalDirection"] = targetWeight
    ? latest.value > targetWeight
      ? "lose"
      : latest.value < targetWeight
        ? "gain"
        : null
    : null;

  // Target progress
  let targetProgress: WeightInsights["targetProgress"] = null;
  if (targetWeight && earliest.value !== targetWeight) {
    const totalToChange = Math.abs(earliest.value - targetWeight);
    const progressMade = Math.abs(earliest.value - latest.value);
    const remaining = Math.round((latest.value - targetWeight) * 10) / 10;
    const percentage = Math.min(
      100,
      Math.max(0, Math.round((progressMade / totalToChange) * 100)),
    );
    targetProgress = {
      target: targetWeight,
      start: earliest.value,
      current: latest.value,
      remaining,
      percentage,
    };
  }

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
    goalDirection,
    targetProgress,
  };
};

export const useNutritionTargets = () => {
  const row = useRow("settings", "user", store);
  return {
    calories: (row.targetCalories as number) || 2000,
    protein: (row.targetProtein as number) || 150,
    carbs: (row.targetCarbs as number) || 250,
    fats: (row.targetFats as number) || 65,
  };
};
