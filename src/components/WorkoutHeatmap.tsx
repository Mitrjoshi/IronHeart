// components/WorkoutHeatmap.tsx
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { store } from "@/store/schema";
import { useRowIds } from "tinybase/ui-react";
import { Link } from "@tanstack/react-router";

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
  panel: "#161616",
  border: "#2a2a2a",
};

type Status = "done" | "skipped" | "rest" | "future";

const STATUS_LABEL: Record<Status, string> = {
  done: "Done",
  skipped: "Skipped",
  rest: "Rest day",
  future: "Upcoming",
};

const STATUS_DOT: Record<Status, string> = {
  done: C.done,
  skipped: C.skipped,
  rest: C.muted,
  future: C.amber,
};

const startOfDay = (ts: number) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export type WorkoutHeatmapMoreInfo = {
  date: number;
  status: Status;
  scheduleId?: string;
  workoutId?: string;
};

type Selection = {
  ts: number;
  status: Status;
  left: number;
  top: number;
  width: number;
  above: boolean;
};

export function WorkoutHeatmap() {
  const scheduleIds = useRowIds("schedules", store);
  const workoutIds = useRowIds("workouts", store);

  const [sel, setSel] = useState<Selection | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // close popover on outside click / escape / scroll / resize
  useEffect(() => {
    if (!sel) return;
    const close = () => setSel(null);
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setSel(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSel(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [sel]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();

  // oldest column starts on the Sunday WEEKS-1 weeks ago
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const gridStart = startOfWeek.getTime() - (WEEKS - 1) * 7 * DAY_MS;

  // schedules grouped by weekday (0=Sun..6=Sat) + earliest createdAt per weekday
  const scheduleByWeekday: string[][] = Array.from({ length: 7 }, () => []);
  const earliestByWeekday = Array<number>(7).fill(Infinity);
  scheduleIds.forEach((id) => {
    const w = DAY_NAMES.indexOf(
      store.getCell("schedules", id, "day") as string,
    );
    if (w < 0) return;
    scheduleByWeekday[w].push(id);
    const createdAt =
      (store.getCell("schedules", id, "createdAt") as number) ?? 0;
    if (createdAt < earliestByWeekday[w]) earliestByWeekday[w] = createdAt;
  });

  // completed workouts grouped by day-start (so we can resolve the session per cell)
  const workoutByDay = new Map<number, string[]>();
  workoutIds.forEach((id) => {
    const finishedAt = store.getCell("workouts", id, "finishedAt") as number;
    if (finishedAt > 0) {
      const day = startOfDay(finishedAt);
      const arr = workoutByDay.get(day);
      if (arr) arr.push(id);
      else workoutByDay.set(day, [id]);
    }
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
    } else if (workoutByDay.has(ts)) {
      status = "done";
      doneCount++;
    } else if (earliestByWeekday[weekday] <= ts + DAY_MS - 1 && ts < todayTs) {
      // skipped = a schedule for this weekday already existed and wasn't done.
      // (To anchor on the first completed workout instead, replace this branch.)
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

  // best-effort name resolution — adjust the cell keys if your fields differ
  const scheduleName = (id: string): string => {
    const name =
      (store.getCell("schedules", id, "name") as string) ||
      (store.getCell("schedules", id, "title") as string);
    if (name) return name;
    const wId = store.getCell("schedules", id, "workoutId") as string;
    if (wId) {
      const wn = store.getCell("workouts", wId, "name") as string;
      if (wn) return wn;
    }
    return "Workout";
  };

  const workoutName = (id: string): string =>
    (store.getCell("workouts", id, "name") as string) || "Workout";

  const openCell = (
    e: ReactMouseEvent<HTMLDivElement>,
    cell: { ts: number; status: Status },
  ) => {
    const r = e.currentTarget.getBoundingClientRect();
    const vw = window.innerWidth;
    const width = Math.min(240, vw - 16);
    const cx = r.left + r.width / 2;
    const left = Math.max(8, Math.min(cx - width / 2, vw - width - 8));
    const above = r.top > 180; // enough room above → render above the cell
    const top = above ? r.top - 8 : r.bottom + 8;
    setSel({ ts: cell.ts, status: cell.status, left, top, width, above });
  };

  // derive popover contents from current selection
  let pop: { dateLabel: string; status: Status; title: string | null } | null =
    null;
  let moreInfo: WorkoutHeatmapMoreInfo | null = null;

  if (sel) {
    const weekday = new Date(sel.ts).getDay();
    const dayEnd = sel.ts + DAY_MS - 1;
    // only schedules that already existed on that day
    const activeSIds = scheduleByWeekday[weekday].filter((id) => {
      const c = (store.getCell("schedules", id, "createdAt") as number) ?? 0;
      return c <= dayEnd;
    });
    const wIds = workoutByDay.get(sel.ts) ?? [];
    const scheduleId = activeSIds[0];
    const workoutId = wIds[0];

    const title = activeSIds.length
      ? scheduleName(activeSIds[0])
      : wIds.length
        ? workoutName(wIds[0])
        : null;

    pop = {
      dateLabel: new Date(sel.ts).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      status: sel.status,
      title,
    };

    if (scheduleId || workoutId) {
      moreInfo = { date: sel.ts, status: sel.status, scheduleId, workoutId };
    }
  }

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
                role="button"
                aria-label={`${new Date(cell.ts).toLocaleDateString()} · ${STATUS_LABEL[cell.status]}`}
                title={`${new Date(cell.ts).toLocaleDateString()} · ${STATUS_LABEL[cell.status]}`}
                onClick={(e) => openCell(e, cell)}
                className="aspect-square cursor-pointer rounded-sm transition-transform active:scale-90"
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

      {/* popover */}
      {sel && pop && (
        <div
          ref={popRef}
          role="dialog"
          className="rounded-xl p-3 shadow-xl"
          style={{
            position: "fixed",
            left: sel.left,
            top: sel.top,
            width: sel.width,
            transform: sel.above ? "translateY(-100%)" : "none",
            background: C.panel,
            border: `1px solid ${C.border}`,
            zIndex: 50,
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold">{pop.dateLabel}</span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: STATUS_DOT[pop.status] }}
              />
              <span className="text-xs" style={{ color: C.muted }}>
                {STATUS_LABEL[pop.status]}
              </span>
            </span>
          </div>

          <p
            className="mt-1.5 text-sm"
            style={{ color: pop.title ? "#fff" : C.muted }}
          >
            {pop.title ?? "No workout scheduled"}
          </p>

          {moreInfo && (
            <Link
              to="/history/$id"
              params={{ id: moreInfo.workoutId as string }}
            >
              <button
                type="button"
                onClick={() => {
                  setSel(null);
                }}
                className="mt-3 w-full rounded-lg py-1.5 text-xs font-semibold"
                style={{ background: C.amber, color: "#0e0e0e" }}
              >
                More info
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
