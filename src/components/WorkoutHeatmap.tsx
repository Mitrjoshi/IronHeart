// components/WorkoutHeatmap.tsx
import { store } from "@/store/schema";
import { useRowIds } from "tinybase/ui-react";

const WEEKS = 17; // ~4 months
const DAY_MS = 86_400_000;
const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const C = {
  done: "#22c55e",
  skipped: "#ef4444",
  rest: "#262626",
  muted: "#737373",
  amber: "#f59e0b",
};

type Status = "done" | "skipped" | "rest" | "future";

const STATUS_LABEL: Record<Status, string> = {
  done: "Done",
  skipped: "Skipped",
  rest: "Rest day",
  future: "Upcoming",
};

const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export function WorkoutHeatmap() {
  const scheduleIds = useRowIds("schedules", store);
  const workoutIds = useRowIds("workouts", store);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();

  // oldest column starts on the Sunday WEEKS-1 weeks ago
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const gridStart = startOfWeek.getTime() - (WEEKS - 1) * 7 * DAY_MS;

  // earliest schedule createdAt per weekday → days before a schedule existed aren't "skipped"
  const earliestByWeekday = Array<number>(7).fill(Infinity);
  scheduleIds.forEach((id) => {
    const w = DAY_NAMES.indexOf(
      store.getCell("schedules", id, "day") as string,
    );
    const createdAt =
      (store.getCell("schedules", id, "createdAt") as number) ?? 0;
    if (w >= 0 && createdAt < earliestByWeekday[w])
      earliestByWeekday[w] = createdAt;
  });

  // days with at least one completed workout
  const completedDays = new Set<number>();
  workoutIds.forEach((id) => {
    const finishedAt = store.getCell("workouts", id, "finishedAt") as number;
    if (finishedAt > 0) completedDays.add(startOfDay(finishedAt));
  });

  let doneCount = 0;
  let skippedCount = 0;

  const cells: { ts: number; status: Status }[] = [];
  for (let i = 0; i < WEEKS * 7; i++) {
    const ts = gridStart + i * DAY_MS;
    const weekday = new Date(ts).getDay();

    let status: Status;
    if (ts > todayTs) {
      status = "future";
    } else if (completedDays.has(ts)) {
      status = "done";
      doneCount++;
    } else if (earliestByWeekday[weekday] <= ts + DAY_MS - 1 && ts < todayTs) {
      status = "skipped";
      skippedCount++;
    } else {
      status = "rest";
    }

    cells.push({ ts, status });
  }

  const weeks = Array.from({ length: WEEKS }, (_, w) =>
    cells.slice(w * 7, w * 7 + 7),
  );

  const total = doneCount + skippedCount;
  const rate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const cellColor = (s: Status) =>
    s === "done" ? C.done : s === "skipped" ? C.skipped : C.rest;

  return (
    <div>
      {/* counts */}
      <div className="mb-4 flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-[3px]"
            style={{ background: C.done }}
          />
          <span className="text-sm font-semibold">{doneCount}</span>
          <span className="text-xs" style={{ color: C.muted }}>
            Done
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-[3px]"
            style={{ background: C.skipped }}
          />
          <span className="text-sm font-semibold">{skippedCount}</span>
          <span className="text-xs" style={{ color: C.muted }}>
            Skipped
          </span>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm font-semibold">{rate}%</p>
          <p className="text-[10px]" style={{ color: C.muted }}>
            Completion
          </p>
        </div>
      </div>

      {/* grid: columns = weeks, rows = Sun→Sat */}
      <div className="flex w-full gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-1 flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.ts}
                title={`${new Date(cell.ts).toLocaleDateString()} · ${STATUS_LABEL[cell.status]}`}
                className="aspect-square rounded-sm"
                style={{
                  background: cellColor(cell.status),
                  opacity: cell.status === "future" ? 0.35 : 1,
                  boxShadow:
                    cell.ts === todayTs
                      ? `inset 0 0 0 1.5px ${C.amber}`
                      : undefined,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* legend */}
      <div
        className="mt-4 flex items-center gap-4 text-xs"
        style={{ color: C.muted }}
      >
        {[
          { c: C.done, l: "Done" },
          { c: C.skipped, l: "Skipped" },
          { c: C.rest, l: "Rest" },
        ].map(({ c, l }) => (
          <div key={l} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-[3px]"
              style={{ background: c }}
            />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
