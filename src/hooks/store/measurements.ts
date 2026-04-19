import { v4 as uuid } from "uuid";
import { store } from "@/store/schema";
import { useRowIds } from "tinybase/ui-react";

export type MeasurementEntry = {
  id: string;
  group: string;
  value: number;
  loggedAt: number;
};

export const useMeasurements = (): MeasurementEntry[] => {
  const ids = useRowIds("measurements", store);
  return ids.map((id) => ({
    id,
    group: store.getCell("measurements", id, "group") as string,
    value: store.getCell("measurements", id, "value") as number,
    loggedAt: store.getCell("measurements", id, "loggedAt") as number,
  }));
};

export const useLogMeasurement = () => {
  return (group: string, value: number) => {
    store.setRow("measurements", uuid(), {
      group,
      value,
      loggedAt: Date.now(),
    });
  };
};
