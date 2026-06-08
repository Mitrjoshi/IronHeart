import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { useAllSchedules } from "@/hooks/store/schedules";
import { capitalize, formatDuration } from "@/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";

export const Route = createFileRoute("/schedule/")({
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
  surface: "#1f1f1f",
};

function RouteComponent() {
  const navigate = Route.useNavigate();
  const schedules = useAllSchedules();

  const hasAnySchedule = schedules.some((split) => split.schedules.length > 0);

  return (
    <AppLayout>
      <Header title="Schedule" subtitle="Workout Tracker" />

      <div style={S.page} className="min-h-screen space-y-5 px-4 pt-20 pb-28">
        {!hasAnySchedule ? (
          <div
            style={S.card}
            className="flex flex-col items-center justify-center space-y-2 py-16 text-center"
          >
            <p className="text-sm" style={{ color: S.muted }}>
              No schedules yet.
            </p>
            <p className="text-xs" style={{ color: S.mutedDark }}>
              Tap + to create your first workout.
            </p>
          </div>
        ) : (
          schedules.map((split) => (
            <div key={split.day} className="space-y-2">
              {/* Day group header */}
              <div className="flex items-center gap-3">
                <p
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: S.muted }}
                >
                  {capitalize(split.day)}
                </p>
                <div
                  className="h-px flex-1"
                  style={{ background: S.surface }}
                />
              </div>

              {split.schedules.length > 0 ? (
                <div className="space-y-2">
                  {split.schedules.map((schedule) => (
                    <Link
                      key={schedule.id}
                      to="/schedule/$scheduleId"
                      params={{ scheduleId: schedule.id }}
                      className="block"
                    >
                      <div
                        style={S.card}
                        className="flex items-start justify-between px-4 py-3"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-medium">{schedule.name}</p>
                          <p
                            className="truncate text-xs"
                            style={{ color: S.muted }}
                          >
                            {schedule.exercises || "No exercises yet"}
                          </p>
                        </div>
                        <div className="ml-3 flex shrink-0 items-center gap-2">
                          <p
                            className="font-mono text-xs"
                            style={{ color: S.amber }}
                          >
                            {schedule.durationSeconds !== 0 &&
                              formatDuration(schedule.durationSeconds)}
                          </p>
                          <ChevronRight
                            size={16}
                            style={{ color: S.mutedDark }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="px-1 text-xs" style={{ color: S.mutedDark }}>
                  Rest day
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate({ to: "/schedule/create" })}
        className="fixed right-4 bottom-22 z-10 flex size-14 items-center justify-center rounded-full shadow-2xl transition-opacity active:opacity-80"
        style={{ background: S.amber }}
      >
        <Plus size={24} color="#0e0e0e" />
      </button>
    </AppLayout>
  );
}
