import { store } from "@/store/schema";
import { useRow } from "tinybase/ui-react";

export const useSettings = () => {
  const row = useRow("settings", "user", store);

  return {
    weightUnit: (row.weightUnit as "kg" | "lbs") ?? "kg",
    theme: (row.theme as "light" | "dark" | "system") ?? "system",
    height: (row.height as number) ?? 0,
    age: (row.age as number) ?? 0,
    targetWeight: (row.targetWeight as number) ?? 0,
  };
};

export const useUpdateSettings = () => {
  return (
    settings: Partial<{
      weightUnit: "kg" | "lbs";
      theme: "light" | "dark" | "system";
      height: number;
      age: number;
      targetWeight: number;
    }>,
  ) => {
    Object.entries(settings).forEach(([key, value]) => {
      store.setCell("settings", "user", key, value as string | number);
    });
  };
};
