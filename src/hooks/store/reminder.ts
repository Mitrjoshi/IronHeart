import { store } from "@/store/schema";
import { useMemo } from "react";
import { useTable } from "tinybase/ui-react";

const startOfToday = (): number => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// getDay(): 0 = Sunday, 1 = Monday
const isMondayNow = (): boolean => new Date().getDay() === 1;

export interface MondayLogReminder {
  isMonday: boolean;
  needsWeight: boolean;
  needsMeasurements: boolean;
  /** true when it's Monday and at least one thing is still unlogged */
  show: boolean;
}

export const useMondayLogReminder = (): MondayLogReminder => {
  const weights = useTable("weights", store);
  const measurements = useTable("measurements", store);

  return useMemo(() => {
    const monday = isMondayNow();
    const todayStart = startOfToday();

    const weightLoggedToday = Object.values(weights).some(
      (row) => (row.loggedAt as number) >= todayStart,
    );

    const measurementsLoggedToday = Object.values(measurements).some(
      (row) => (row.loggedAt as number) >= todayStart,
    );

    const needsWeight = monday && !weightLoggedToday;
    const needsMeasurements = monday && !measurementsLoggedToday;

    return {
      isMonday: monday,
      needsWeight,
      needsMeasurements,
      show: needsWeight || needsMeasurements,
    };
  }, [weights, measurements]);
};
