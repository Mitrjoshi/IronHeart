import { Header } from "@/components/Header";
import { useDeleteWorkout, useWorkoutById } from "@/hooks/store/workouts";
import { capitalize, formatDuration, formatVolume } from "@/utils";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Award, Calendar, Clock, Trash } from "lucide-react";

export const Route = createFileRoute("/history/$id")({
  component: RouteComponent,
});

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5", minHeight: "100vh" },
  card: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 16,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  amberSoft: "rgba(245, 158, 11, 0.12)",
  surface: "#1f1f1f",
  red: "#ef4444",
  redSurface: "#2a1515",
};

// Animation + bar styling kept inline & dependency-free, with reduced-motion respected.
const styleSheet = `
@keyframes ihRise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ih-rise { animation: ihRise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
@keyframes ihGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.ih-bar-fill { transform-origin: left; animation: ihGrow 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .ih-rise, .ih-bar-fill { animation: none !important; }
}
`;

function RouteComponent() {
  const { id } = Route.useParams();
  const workout = useWorkoutById(id);
  const deleteWorkout = useDeleteWorkout();
  const router = useRouter();

  if (!workout) {
    return (
      <>
        <Header showBack title="Workout History" subtitle="Detailed view" />
        <div style={S.page} className="px-4 pt-20 pb-8">
          <div style={S.card} className="p-6 text-center">
            <p className="text-sm font-medium">We couldn't find that workout</p>
            <p className="mt-1 text-xs" style={{ color: S.muted }}>
              It may have been deleted. Head back to your history to pick
              another.
            </p>
            <button
              onClick={() => router.history.back()}
              className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              style={{ background: S.surface, color: S.amber }}
            >
              Back to history
            </button>
          </div>
        </div>
      </>
    );
  }

  const date = new Date(workout.finishedAt);
  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const stats = [
    { label: "Exercises", value: workout.exerciseCount },
    { label: "Sets", value: workout.numberOfSets },
    { label: "Reps", value: workout.totalReps },
    { label: "Volume", value: formatVolume(workout.totalVolume) },
  ];

  return (
    <>
      <style>{styleSheet}</style>
      <Header
        showBack
        title="Workout History"
        subtitle="Detailed view of your workout session"
        right={
          <button
            onClick={() => {
              deleteWorkout(workout.id);
              router.history.back();
            }}
            aria-label="Delete workout"
            className="flex items-center gap-1.5 rounded-xl p-3 text-sm font-semibold transition-colors"
            style={{ background: S.redSurface, color: S.red }}
          >
            <Trash size={15} />
          </button>
        }
      />

      <div style={S.page} className="space-y-6 px-4 pt-20 pb-8">
        {/* Summary hero */}
        <div className="ih-rise relative overflow-hidden p-5" style={S.card}>
          {/* amber top accent */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #f59e0b, transparent)",
            }}
          />

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className="inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase"
                style={{ background: S.amberSoft, color: S.amber }}
              >
                {capitalize(workout.scheduleDay)}
              </span>
              <p className="mt-2 truncate text-xl font-semibold tracking-tight">
                {workout.scheduleName}
              </p>
              <div
                className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs"
                style={{ color: S.muted }}
              >
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {dateLabel}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  {timeLabel}
                </span>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p
                className="font-mono text-2xl leading-none font-semibold"
                style={{ color: S.amber }}
              >
                {formatDuration(workout.durationSeconds)}
              </p>
              <p
                className="mt-1 text-[10px] tracking-widest uppercase"
                style={{ color: S.mutedDark }}
              >
                Duration
              </p>
            </div>
          </div>

          <div
            className="mt-5 grid grid-cols-4 gap-px overflow-hidden rounded-xl"
            style={{ background: S.surface }}
          >
            {stats.map(({ label, value }) => (
              <div
                key={label}
                className="px-2 py-3 text-center"
                style={{ background: "#161616" }}
              >
                <p className="text-lg font-semibold tabular-nums">{value}</p>
                <p
                  className="mt-0.5 text-[10px] tracking-wide uppercase"
                  style={{ color: S.muted }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: S.muted }}
          >
            Exercises
          </p>

          {workout.exercises.length > 0 ? (
            <div className="space-y-2.5">
              {workout.exercises.map((ex, exIndex) => {
                const isDuration = ex.type === "duration";

                // intensity metric per set: volume for weighted, reps for
                // bodyweight, time for duration exercises.
                const metric = (set: (typeof ex.sets)[number]) =>
                  isDuration
                    ? set.duration
                    : set.weight > 0
                      ? set.reps * set.weight
                      : set.reps;

                const maxMetric = Math.max(1, ...ex.sets.map((s) => metric(s)));

                // best set = highest weighted volume (matches footer "Best").
                let bestSetId: string | null = null;
                if (!isDuration) {
                  let bestVol = 0;
                  for (const s of ex.sets) {
                    const vol = s.reps * s.weight;
                    if (vol > bestVol) {
                      bestVol = vol;
                      bestSetId = s.id;
                    }
                  }
                }

                return (
                  <div
                    key={ex.id}
                    className="ih-rise p-4"
                    style={{ ...S.card, animationDelay: `${exIndex * 60}ms` }}
                  >
                    {/* header */}
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium">{ex.name}</p>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                        style={{ background: S.surface, color: S.muted }}
                      >
                        {ex.type || "Weighted"}
                      </span>
                    </div>

                    {/* sets */}
                    <div className="mt-3.5 space-y-2.5">
                      {ex.sets.map((set) => {
                        const isBest = set.id === bestSetId;
                        const ratio = Math.max(0.06, metric(set) / maxMetric);
                        const value = isDuration
                          ? formatDuration(set.duration)
                          : set.weight > 0
                            ? `${set.reps} × ${set.weight} kg`
                            : `${set.reps} reps`;

                        return (
                          <div key={set.id} className="flex items-center gap-3">
                            {/* set index */}
                            <span
                              className="grid h-5 w-5 shrink-0 place-items-center rounded-md text-[10px] font-semibold tabular-nums"
                              style={{
                                background: isBest ? S.amberSoft : S.surface,
                                color: isBest ? S.amber : S.muted,
                              }}
                            >
                              {set.setNumber}
                            </span>

                            {/* intensity bar */}
                            <div
                              className="h-1.5 flex-1 overflow-hidden rounded-full"
                              style={{ background: S.surface }}
                            >
                              <div
                                className="ih-bar-fill h-full rounded-full"
                                style={{
                                  width: `${ratio * 100}%`,
                                  background: isBest
                                    ? S.amber
                                    : "rgba(245, 158, 11, 0.35)",
                                }}
                              />
                            </div>

                            {/* value */}
                            <span
                              className="shrink-0 font-mono text-xs tabular-nums"
                              style={{ color: isBest ? S.amber : "#f5f5f5" }}
                            >
                              {value}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* footer */}
                    <div
                      className="mt-3.5 flex items-center justify-between pt-3 text-xs"
                      style={{ borderTop: "1px solid #1f1f1f", color: S.muted }}
                    >
                      {isDuration ? (
                        <span>Total {formatDuration(ex.totalDuration)}</span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5">
                            {ex.bestSet ? (
                              <>
                                <Award size={12} style={{ color: S.amber }} />
                                Best {ex.bestSet.reps} × {ex.bestSet.weight} kg
                              </>
                            ) : (
                              "—"
                            )}
                          </span>
                          <span>Volume {formatVolume(ex.totalVolume)}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={S.card} className="p-6 text-center">
              <p className="text-sm font-medium">No exercises logged</p>
              <p className="mt-1 text-xs" style={{ color: S.muted }}>
                This session finished without any recorded sets.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
