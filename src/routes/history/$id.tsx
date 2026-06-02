import { Header } from "@/components/Header";
import { useWorkoutById } from "@/hooks/store/workouts";
import { capitalize, formatDuration, formatVolume } from "@/utils";
import { createFileRoute } from "@tanstack/react-router";

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
  surface: "#1f1f1f",
};

function RouteComponent() {
  const { id } = Route.useParams();
  const workout = useWorkoutById(id);

  if (!workout) {
    return (
      <>
        <Header showBack title="Workout History" subtitle="Detailed view" />
        <div style={S.page} className="px-4 pt-20 pb-8">
          <div style={S.card} className="p-4">
            <p className="text-center text-sm" style={{ color: S.muted }}>
              Workout not found.
            </p>
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

  return (
    <>
      <Header
        showBack
        title="Workout History"
        subtitle="Detailed view of your workout session"
      />

      <div style={S.page} className="space-y-6 px-4 pt-20 pb-8">
        {/* Summary */}
        <div style={S.card} className="space-y-4 p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-lg font-semibold">{workout.scheduleName}</p>
              <p className="mt-0.5 text-xs" style={{ color: S.muted }}>
                {capitalize(workout.scheduleDay)} · {dateLabel} · {timeLabel}
              </p>
            </div>
            <p
              className="ml-3 shrink-0 font-mono text-sm"
              style={{ color: S.amber }}
            >
              {formatDuration(workout.durationSeconds)}
            </p>
          </div>

          <div
            className="flex items-center justify-around pt-3"
            style={{ borderTop: "1px solid #1f1f1f" }}
          >
            {[
              { label: "Exercises", value: workout.exerciseCount },
              { label: "Sets", value: workout.numberOfSets },
              { label: "Reps", value: workout.totalReps },
              { label: "Volume", value: formatVolume(workout.totalVolume) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-base font-semibold">{value}</p>
                <p className="text-xs" style={{ color: S.muted }}>
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
            <div className="space-y-2">
              {workout.exercises.map((ex) => (
                <div key={ex.id} style={S.card} className="p-4">
                  {/* header */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{ex.name}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                      style={{ background: S.surface, color: S.muted }}
                    >
                      {ex.type}
                    </span>
                  </div>

                  {/* sets */}
                  <div className="mt-3 space-y-1.5">
                    {ex.sets.map((set) => (
                      <div
                        key={set.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span style={{ color: S.muted }}>
                          Set {set.setNumber}
                        </span>
                        <span className="font-mono">
                          {ex.type === "duration"
                            ? formatDuration(set.duration)
                            : set.weight > 0
                              ? `${set.reps} × ${set.weight} kg`
                              : `${set.reps} reps`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* footer */}
                  <div
                    className="mt-3 flex items-center justify-between pt-3 text-xs"
                    style={{ borderTop: "1px solid #1f1f1f", color: S.muted }}
                  >
                    {ex.type === "duration" ? (
                      <span>Total {formatDuration(ex.totalDuration)}</span>
                    ) : (
                      <>
                        <span>
                          {ex.bestSet
                            ? `Best ${ex.bestSet.reps} × ${ex.bestSet.weight} kg`
                            : "—"}
                        </span>
                        <span>Volume {formatVolume(ex.totalVolume)}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={S.card} className="p-4">
              <p className="text-center text-sm" style={{ color: S.muted }}>
                No exercises recorded for this session.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
