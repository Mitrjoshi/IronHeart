import { v4 as uuid } from "uuid";
import { store } from "@/store/schema";
import { useRowIds } from "tinybase/ui-react";

export type MeasurementGroup =
  | "Chest"
  | "Waist"
  | "Hips"
  | "Arms"
  | "Thighs"
  | "Neck"
  | "Shoulders"
  | "Calves";

export const MEASUREMENT_GROUPS: MeasurementGroup[] = [
  "Chest",
  "Waist",
  "Hips",
  "Arms",
  "Thighs",
  "Neck",
  "Shoulders",
  "Calves",
];

export type MeasurementEntry = {
  id: string;
  group: MeasurementGroup;
  value: number;
  loggedAt: number;
};

export const useLogMeasurement = () => {
  return (group: MeasurementGroup, value: number) => {
    store.setRow("measurements", uuid(), {
      group,
      value,
      loggedAt: Date.now(),
    });
  };
};

export const useDeleteMeasurement = () => {
  return (id: string) => store.delRow("measurements", id);
};

export const useMeasurementsByGroup = (
  group: MeasurementGroup,
): MeasurementEntry[] => {
  const ids = useRowIds("measurements", store);
  return ids
    .map((id) => ({
      id,
      group: store.getCell("measurements", id, "group") as MeasurementGroup,
      value: store.getCell("measurements", id, "value") as number,
      loggedAt: store.getCell("measurements", id, "loggedAt") as number,
    }))
    .filter((e) => e.group === group)
    .sort((a, b) => a.loggedAt - b.loggedAt);
};
