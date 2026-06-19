import { Header } from "@/components/Header";
import { useScheduleById } from "@/hooks/store/schedules";
import { useWorkoutSummary } from "@/hooks/store/workoutSummary";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowUp, ArrowDown, Flame, TrendingUp, Check } from "lucide-react";

export const Route = createFileRoute("/schedule/$scheduleId/summary")({
  component: RouteComponent,
});

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5" },
  card: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 16,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  amberSoft: "rgba(245, 158, 11, 0.1)",
  amberBorder: "rgba(245, 158, 11, 0.35)",
  surface: "#1f1f1f",
  green: "#4ade80",
  red: "#ef4444",
};

/* ---------- formatting ---------- */
const fmt = (v: number) => Math.round(v).toLocaleString();
const fmtDuration = (sec: number) => {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  ``;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
};
const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }) +
  " · " +
  new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

function RouteComponent() {
  const navigate = useNavigate();
  const scheduleId = Route.useParams().scheduleId;
  const scheduleData = useScheduleById(scheduleId);
  const summary = useWorkoutSummary(scheduleId);

  if (!summary) {
    return (
      <div style={S.page} className="min-h-screen">
        <Header title={scheduleData?.name} subtitle="Summary" />
        <div className="flex flex-col items-center justify-center gap-2 px-6 pt-32 text-center">
          <p className="text-base font-semibold">No finished session yet</p>
          <p className="max-w-[260px] text-sm" style={{ color: S.muted }}>
            Complete a workout and your summary lands here.
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-3 rounded-xl px-5 py-2.5 text-sm font-semibold"
            style={{ background: S.surface }}
          >
            Back home
          </button>
        </div>
      </div>
    );
  }

  const metricFor = (e: (typeof summary.exercises)[number]) =>
    e.type === "duration"
      ? fmtDuration(e.totalDuration)
      : e.type === "bodyweight"
        ? `${fmt(e.totalReps)} reps`
        : `${fmt(e.volume)} ${summary.unit}`;

  const chipFor = (
    e: (typeof summary.exercises)[number],
    s: { weight: number; reps: number; duration: number },
  ) =>
    e.type === "duration"
      ? fmtDuration(s.duration)
      : e.type === "bodyweight"
        ? `${s.reps}`
        : `${fmt(s.weight)}×${s.reps}`;

  return (
    <div style={S.page} className="min-h-screen pt-20 pb-4">
      <Header title="Summary" subtitle={scheduleData?.name} />

      <div className="space-y-3 px-4">
        {/* Hero — total volume, mirrors the timer card */}
        <div
          style={{
            ...S.card,
            borderColor: S.amberBorder,
            background:
              "linear-gradient(180deg, rgba(245,158,11,0.05) 0%, #161616 60%)",
          }}
          className="overflow-hidden p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: S.amber }}
              />
              <p
                className="text-[11px] font-semibold tracking-widest uppercase"
                style={{ color: S.muted }}
              >
                Session Complete
              </p>
            </div>
            <p
              className="text-[11px] font-medium"
              style={{ color: S.mutedDark }}
            >
              {fmtDate(summary.finishedAt)}
            </p>
          </div>

          <div className="mt-1 flex items-baseline gap-2">
            <p
              className="leading-none font-black tabular-nums"
              style={{ fontSize: "15vw", color: S.amber }}
            >
              {fmt(summary.totalVolume)}
            </p>
            <span className="text-lg font-semibold" style={{ color: S.muted }}>
              {summary.unit}
            </span>
          </div>
          <p className="text-xs" style={{ color: S.mutedDark }}>
            total volume moved
          </p>

          {summary.volumeDelta != null && (
            <p
              className="mt-2 flex items-center gap-1 text-sm font-semibold"
              style={{ color: summary.volumeDelta >= 0 ? S.green : S.red }}
            >
              {summary.volumeDelta >= 0 ? (
                <ArrowUp size={15} strokeWidth={3} />
              ) : (
                <ArrowDown size={15} strokeWidth={3} />
              )}
              {fmt(Math.abs(summary.volumeDelta))} {summary.unit}
              {summary.volumePct != null && (
                <span>
                  ({summary.volumePct >= 0 ? "+" : ""}
                  {summary.volumePct.toFixed(0)}%)
                </span>
              )}
              <span style={{ color: S.mutedDark }} className="font-normal">
                vs last
              </span>
            </p>
          )}
          {summary.isFirst && (
            <p className="mt-2 text-xs" style={{ color: S.mutedDark }}>
              First session on record — baseline set.
            </p>
          )}

          {/* stat row */}
          <div
            className="mt-4 grid grid-cols-4 gap-1 border-t pt-4"
            style={{ borderColor: S.surface }}
          >
            <Stat label="Time" value={fmtDuration(summary.duration)} />
            <Stat label="Sets" value={String(summary.totalSets)} />
            <Stat label="Reps" value={String(summary.totalReps)} />
            <Stat label="Lifts" value={String(summary.exerciseCount)} />
          </div>
        </div>

        {/* PR moment — the one loud element */}
        {summary.prCount > 0 && (
          <div
            style={{
              ...S.card,
              borderColor: S.amberBorder,
              background: S.amberSoft,
            }}
            className="p-4"
          >
            <div className="flex items-center gap-2">
              <Flame size={18} style={{ color: S.amber }} />
              <p className="text-sm font-bold">
                <span style={{ color: S.amber }}>{summary.prCount}</span> new
                personal record{summary.prCount > 1 ? "s" : ""}
              </p>
            </div>
            <div className="mt-3 space-y-2">
              {summary.exercises
                .filter((e) => e.isPR)
                .map((e) => (
                  <div
                    key={e.id}
                    className="flex items-baseline justify-between"
                  >
                    <span className="text-sm font-semibold">{e.name}</span>
                    <span
                      className="text-xs tabular-nums"
                      style={{ color: S.amber }}
                    >
                      {e.prLabel}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* targets */}
        {summary.targetsTotal > 0 && (
          <div style={S.card} className="flex items-center gap-3 p-4">
            <span className="text-sm" style={{ color: S.muted }}>
              Targets hit
            </span>
            <span className="text-base font-bold tabular-nums">
              {summary.targetsHit}
              <span style={{ color: S.mutedDark }}>
                /{summary.targetsTotal}
              </span>
            </span>
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full"
              style={{ background: S.surface }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(summary.targetsHit / summary.targetsTotal) * 100}%`,
                  background: S.amber,
                }}
              />
            </div>
          </div>
        )}

        {/* breakdown */}
        <p
          className="px-1 pt-1 text-[11px] font-semibold tracking-widest uppercase"
          style={{ color: S.mutedDark }}
        >
          Breakdown
        </p>

        {summary.exercises.map((e) => (
          <div key={e.id} style={S.card} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold">{e.name}</p>
                  {e.isPR && (
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase"
                      style={{ background: S.amber, color: "#0e0e0e" }}
                    >
                      PR
                    </span>
                  )}
                  {e.hasTarget && e.hitTarget && (
                    <span
                      className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ border: `1px solid ${S.green}`, color: S.green }}
                    >
                      <Check size={10} strokeWidth={3} /> target
                    </span>
                  )}
                  {e.isBaseline && (
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        border: `1px solid ${S.surface}`,
                        color: S.muted,
                      }}
                    >
                      new
                    </span>
                  )}
                </div>
                <span
                  className="mt-1.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                  style={{ background: S.amberSoft, color: S.amber }}
                >
                  {e.type}
                </span>
              </div>
              <p
                className="shrink-0 text-sm font-bold tabular-nums"
                style={{ color: S.muted }}
              >
                {metricFor(e)}
              </p>
            </div>

            {/* set chips */}
            <div className="flex flex-wrap gap-1.5">
              {e.sets.map((s, i) => (
                <span
                  key={i}
                  className="rounded-lg px-2 py-1 text-xs font-semibold tabular-nums"
                  style={{ background: S.surface, color: "#f5f5f5" }}
                >
                  {chipFor(e, s)}
                </span>
              ))}
            </div>

            {/* footer: vs last + suggestion */}
            {(e.prevTop != null || e.suggestNext != null) && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                {e.prevTop != null &&
                  e.prevTop > 0 &&
                  e.type !== "duration" && (
                    <span
                      className="text-xs tabular-nums"
                      style={{ color: S.muted }}
                    >
                      {fmt(e.prevTop)} →{" "}
                      <b style={{ color: "#f5f5f5" }}>
                        {fmt(e.type === "bodyweight" ? e.topReps : e.topWeight)}
                      </b>{" "}
                      {e.type === "bodyweight" ? "reps" : summary.unit}
                    </span>
                  )}
                {e.suggestNext != null && (
                  <span
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold"
                    style={{
                      background: S.amberSoft,
                      border: `1px solid ${S.amberBorder}`,
                      color: S.amber,
                    }}
                  >
                    <TrendingUp size={12} /> next: {fmt(e.suggestNext)}{" "}
                    {summary.unit}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => navigate({ to: "/" })}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold active:opacity-80"
          style={{ background: S.amber, color: "#0e0e0e" }}
        >
          <Check size={16} strokeWidth={3} />
          Done
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-base font-bold tabular-nums">{value}</p>
      <p
        className="mt-0.5 text-[10px] font-semibold tracking-wider uppercase"
        style={{ color: S.mutedDark }}
      >
        {label}
      </p>
    </div>
  );
}
