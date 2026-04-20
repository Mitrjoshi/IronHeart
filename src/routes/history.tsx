import { Header } from "@/components/Header";
import { useWorkoutHistory } from "@/hooks/store/workouts";
import { formatDuration, formatVolume } from "@/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
  component: RouteComponent,
});

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5", minHeight: "100vh" },
  card: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 16,
  },
  divider: { borderColor: "#1f1f1f" },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  surface: "#1f1f1f",
};

function RouteComponent() {
  const workoutHistory = useWorkoutHistory();

  return (
    <>
      <Header
        showBack
        title="Workout History"
        subtitle="Your past workouts and progress"
      />

      <div className="space-y-4 pt-20 pb-4">
        <div className="space-y-2 p-4 py-0">
          {workoutHistory.map((workout, index) => (
            <div className="space-y-2">
              {workoutHistory.slice(0, 3).map((workout, i) => (
                <div key={i} style={S.card} className="space-y-2 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {workout.scheduleName}
                    </p>
                    <p className="font-mono text-xs" style={{ color: S.amber }}>
                      {formatDuration(workout.durationSeconds)}
                    </p>
                  </div>
                  <p className="truncate text-xs" style={{ color: S.muted }}>
                    {workout.exercisesDone.length > 0
                      ? workout.exercisesDone.map((e) => e.name).join(", ")
                      : "No exercises recorded"}
                  </p>
                  <div
                    className="flex items-center justify-around pt-1"
                    style={{ borderTop: "1px solid #1f1f1f" }}
                  >
                    {[
                      { label: "Sets", value: workout.numberOfSets },
                      { label: "Reps", value: workout.totalReps },
                      {
                        label: "Volume",
                        value: formatVolume(workout.totalVolume),
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <p className="text-sm font-semibold">{value}</p>
                        <p className="text-xs" style={{ color: S.muted }}>
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
