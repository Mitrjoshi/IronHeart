// components/WorkoutHeatmap.tsx

import { useMemo, useState } from "react";
import { store } from "@/store/schema";
import { useRowIds } from "tinybase/ui-react";
import { DAYS } from "@/utils";
import { Link } from "@tanstack/react-router";

const WEEKS = 13;
const DAY_MS = 86_400_000;

const S = {
  colors: {
    done: "#22c55e",
    skipped: "#ef4444",
    rest: "#262626",

    muted: "#737373",
    mutedDark: "#404040",

    amber: "#f59e0b",

    page: "#0e0e0e",
    card: "#161616",
    surface: "#1f1f1f",
    border: "#1f1f1f",

    white: "#ffffff",
    black: "#000000",
  },

  page: {
    background: "#0e0e0e",
    color: "#f5f5f5",
    minHeight: "100vh",
  },

  card: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 16,
  },

  divider: {
    borderColor: "#1f1f1f",
  },
};

type Status = "done" | "skipped" | "rest" | "future";

type CellData = {
  ts: number;
  status: Status;
  schedules: {
    id: string;
    name: string;
    day: string;
    createdAt: number;
  }[];

  workout?: {
    id: string;
    name: string;
    finishedAt: number;
    startedAt?: number;
  };
};

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

  const [selectedCell, setSelectedCell] = useState<CellData | null>(null);

  const today = useMemo(() => {
    const d = new Date();

    d.setHours(0, 0, 0, 0);

    return d;
  }, []);

  const todayTs = today.getTime();

  // grid starts from sunday
  const startOfWeek = new Date(today);

  startOfWeek.setDate(today.getDate() - today.getDay());

  const gridStart = startOfWeek.getTime() - (WEEKS - 1) * 7 * DAY_MS;

  // schedules grouped by weekday
  const schedulesByWeekday = Array.from({ length: 7 }, () => []);

  scheduleIds.forEach((id) => {
    const day = store.getCell("schedules", id, "day") as string;

    const weekday = DAYS.indexOf(day);

    if (weekday < 0) return;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    schedulesByWeekday[weekday].push({
      id,

      name: (store.getCell("schedules", id, "name") as string) || "Workout",

      day,

      createdAt: (store.getCell("schedules", id, "createdAt") as number) || 0,
    });
  });

  // completed workout days
  const completedDays = new Map<
    number,
    {
      id: string;
      name: string;
      finishedAt: number;
      startedAt?: number;
    }
  >();

  workoutIds.forEach((id) => {
    const finishedAt = store.getCell("workouts", id, "finishedAt") as number;

    if (!finishedAt) return;

    const scheduleId = store.getCell("workouts", id, "scheduleId") as string;

    const scheduleName =
      (store.getCell("schedules", scheduleId, "name") as string) || "Workout";

    completedDays.set(startOfDay(finishedAt), {
      id,
      name: scheduleName,
      finishedAt,

      startedAt: store.getCell("workouts", id, "startedAt") as number,
    });
  });

  // first ever workout day
  // skip tracking starts only after this
  let firstWorkoutDay = Infinity;

  completedDays.forEach((_, ts) => {
    if (ts < firstWorkoutDay) {
      firstWorkoutDay = ts;
    }
  });

  let doneCount = 0;

  let skippedCount = 0;

  const cells: CellData[] = [];

  for (let i = 0; i < WEEKS * 7; i++) {
    const ts = gridStart + i * DAY_MS;

    const weekday = new Date(ts).getDay();

    const schedules = schedulesByWeekday[weekday];

    const hasSchedule = schedules.length > 0;

    const workout = completedDays.get(ts);

    let status: Status = "rest";

    if (ts > todayTs) {
      status = "future";
    } else if (workout) {
      status = "done";

      doneCount++;
    } else if (hasSchedule && ts >= firstWorkoutDay && ts < todayTs) {
      // only mark skipped AFTER user actually started working out
      status = "skipped";

      skippedCount++;
    }

    cells.push({
      ts,
      status,
      schedules,
      workout,
    });
  }

  const weeks = Array.from({ length: WEEKS }, (_, w) =>
    cells.slice(w * 7, w * 7 + 7),
  );

  const total = doneCount + skippedCount;

  const rate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const cellColor = (s: Status) =>
    s === "done"
      ? S.colors.done
      : s === "skipped"
        ? S.colors.skipped
        : S.colors.rest;

  return (
    <>
      <div>
        <p
          className="mb-3 text-sm leading-relaxed"
          style={{ color: S.colors.muted }}
        >
          Your consistency over the last 3 months.
        </p>

        <hr className="mb-4" style={S.divider} />

        {/* stats */}
        <div className="mb-4 flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-[3px]"
              style={{
                background: S.colors.done,
              }}
            />

            <span className="text-sm font-semibold">{doneCount}</span>

            <span className="text-xs" style={{ color: S.colors.muted }}>
              Done
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-[3px]"
              style={{
                background: S.colors.skipped,
              }}
            />

            <span className="text-sm font-semibold">{skippedCount}</span>

            <span className="text-xs" style={{ color: S.colors.muted }}>
              Skipped
            </span>
          </div>

          <div className="ml-auto text-right">
            <p className="text-sm font-semibold">{rate}%</p>

            <p className="text-[10px]" style={{ color: S.colors.muted }}>
              Completion
            </p>
          </div>
        </div>

        {/* heatmap */}
        <div className="flex w-full gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-1 flex-col gap-1">
              {week.map((cell) => (
                <button
                  key={cell.ts}
                  onClick={() => {
                    if (cell.status !== "future") {
                      setSelectedCell(cell);
                    }
                  }}
                  className="aspect-square rounded-md transition-transform active:scale-95"
                  style={{
                    background: cellColor(cell.status),
                    opacity: cell.status === "future" ? 0.35 : 1,
                    boxShadow:
                      cell.ts === todayTs
                        ? `inset 0 0 0 1.5px ${S.colors.amber}`
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
          style={{ color: S.colors.muted }}
        >
          {[
            {
              c: S.colors.done,
              l: "Done",
            },

            {
              c: S.colors.skipped,
              l: "Skipped",
            },

            {
              c: S.colors.rest,
              l: "Rest",
            },
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

      {/* popover */}
      {selectedCell && (
        <div
          onClick={() => setSelectedCell(null)}
          className="fixed inset-0 z-50 flex items-end bg-black/60 p-4 md:items-center md:justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border p-5"
            style={{
              background: S.colors.card,
              borderColor: S.colors.border,
            }}
          >
            <div className="mb-5">
              <p className="text-lg font-semibold">
                {new Date(selectedCell.ts).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <p
                className="mt-1 text-sm"
                style={{
                  color: S.colors.muted,
                }}
              >
                {STATUS_LABEL[selectedCell.status]}
              </p>
            </div>

            {selectedCell.workout ? (
              <>
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: S.colors.border,

                    background: S.colors.surface,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {selectedCell.workout.name}
                      </p>

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color: S.colors.muted,
                        }}
                      >
                        Finished at{" "}
                        {new Date(
                          selectedCell.workout.finishedAt,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div
                      className="rounded-full px-2 py-1 text-[10px] font-semibold"
                      style={{
                        background: "rgba(34,197,94,0.15)",

                        color: S.colors.done,
                      }}
                    >
                      DONE
                    </div>
                  </div>
                </div>

                {selectedCell.workout.finishedAt && (
                  <Link
                    to="/history/$id"
                    params={{
                      id: selectedCell.workout.id,
                    }}
                  >
                    <button
                      className="mt-5 w-full rounded-2xl px-4 py-3 text-sm font-semibold"
                      style={{
                        background: S.colors.white,

                        color: S.colors.black,
                      }}
                    >
                      More Info
                    </button>
                  </Link>
                )}
              </>
            ) : (
              <div
                className="rounded-2xl border p-5 text-center"
                style={{
                  borderColor: S.colors.border,

                  background: S.colors.surface,
                }}
              >
                <p className="text-sm font-medium">No workout completed</p>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: S.colors.muted,
                  }}
                >
                  Nothing was logged for this day.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
