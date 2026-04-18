import { store } from "@/store/schema";
import { useRow, useRowIds } from "tinybase/ui-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type MealName = "breakfast" | "lunch" | "dinner" | "snack";

interface FoodEntryInput {
  mealId: string;
  foodCode: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface FoodEntry extends FoodEntryInput {
  id: string;
  createdAt: number;
}

interface Meal {
  id: string;
  name: MealName;
  loggedAt: number;
  entries: FoodEntry[];
}

// ─── Meals ───────────────────────────────────────────────────────────────────

export const useAddMeal = () => {
  return (name: MealName): string => {
    const id = crypto.randomUUID();
    store.setRow("meals", id, { name, loggedAt: Date.now() });
    return id;
  };
};

export const useDeleteMeal = () => {
  return (mealId: string) => {
    // also wipe all entries belonging to this meal
    const entryIds = store.getRowIds("foodEntries");
    entryIds.forEach((id) => {
      if (store.getCell("foodEntries", id, "mealId") === mealId) {
        store.delRow("foodEntries", id);
      }
    });
    store.delRow("meals", mealId);
  };
};

/** All meals for a given calendar day (timestamp, defaults to today) */
export const useMealsForDay = (dayTs?: number): Meal[] => {
  const ts = dayTs ?? Date.now();
  const start = new Date(ts).setHours(0, 0, 0, 0);
  const end = new Date(ts).setHours(23, 59, 59, 999);

  const mealIds = useRowIds("meals", store);
  const entryIds = useRowIds("foodEntries", store);

  return mealIds
    .filter((id) => {
      const loggedAt = store.getCell("meals", id, "loggedAt") as number;
      return loggedAt >= start && loggedAt <= end;
    })
    .map((mealId) => {
      const entries: FoodEntry[] = entryIds
        .filter((eid) => store.getCell("foodEntries", eid, "mealId") === mealId)
        .map((eid) => ({
          id: eid,
          mealId: store.getCell("foodEntries", eid, "mealId") as string,
          foodCode: store.getCell("foodEntries", eid, "foodCode") as string,
          foodName: store.getCell("foodEntries", eid, "foodName") as string,
          quantity: store.getCell("foodEntries", eid, "quantity") as number,
          unit: store.getCell("foodEntries", eid, "unit") as string,
          calories: store.getCell("foodEntries", eid, "calories") as number,
          protein: store.getCell("foodEntries", eid, "protein") as number,
          carbs: store.getCell("foodEntries", eid, "carbs") as number,
          fats: store.getCell("foodEntries", eid, "fats") as number,
          createdAt: store.getCell("foodEntries", eid, "createdAt") as number,
        }));

      return {
        id: mealId,
        name: store.getCell("meals", mealId, "name") as MealName,
        loggedAt: store.getCell("meals", mealId, "loggedAt") as number,
        entries,
      };
    });
};

// ─── Food entries ─────────────────────────────────────────────────────────────

export const useAddFoodEntry = () => {
  return (input: FoodEntryInput) => {
    store.setRow("foodEntries", crypto.randomUUID(), {
      ...input,
      createdAt: Date.now(),
    });
  };
};

export const useDeleteFoodEntry = () => {
  return (entryId: string) => {
    store.delRow("foodEntries", entryId);
  };
};

export const useUpdateFoodEntry = () => {
  return (
    entryId: string,
    patch: Partial<Omit<FoodEntryInput, "mealId" | "foodCode" | "foodName">>,
  ) => {
    Object.entries(patch).forEach(([key, value]) => {
      store.setCell("foodEntries", entryId, key, value as number | string);
    });
  };
};

export const useFoodEntry = (entryId: string): FoodEntry | null => {
  const row = useRow("foodEntries", entryId, store);
  if (!row.foodCode) return null;

  return {
    id: entryId,
    mealId: row.mealId as string,
    foodCode: row.foodCode as string,
    foodName: row.foodName as string,
    quantity: row.quantity as number,
    unit: row.unit as string,
    calories: row.calories as number,
    protein: row.protein as number,
    carbs: row.carbs as number,
    fats: row.fats as number,
    createdAt: row.createdAt as number,
  };
};

// ─── Daily totals ─────────────────────────────────────────────────────────────

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export const useDailyTotals = (dayTs?: number): DailyTotals => {
  const meals = useMealsForDay(dayTs);
  const allEntries = meals.flatMap((m) => m.entries);

  return allEntries.reduce<DailyTotals>(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fats: acc.fats + e.fats,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
};

// ─── or-create helper (used in food detail page) ──────────────────────────────

/** Finds today's meal by name, or creates it. Returns the mealId. */
export const useGetOrCreateMeal = () => {
  return (name: MealName): string => {
    const start = new Date().setHours(0, 0, 0, 0);
    const mealIds = store.getRowIds("meals");

    const existing = mealIds.find(
      (id) =>
        store.getCell("meals", id, "name") === name &&
        (store.getCell("meals", id, "loggedAt") as number) >= start,
    );

    if (existing) return existing;

    const id = crypto.randomUUID();
    store.setRow("meals", id, { name, loggedAt: Date.now() });
    return id;
  };
};
