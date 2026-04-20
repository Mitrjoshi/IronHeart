import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { useAllSchedules } from "@/hooks/store/schedules";
import { capitalize } from "@/utils";
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
};

function RouteComponent() {
  const navigate = Route.useNavigate();
  const schedules = useAllSchedules();

  return (
    <AppLayout>
      <Header title="Schedule" subtitle="Workout Tracker" />

      <div style={S.page} className="min-h-screen space-y-2 px-4 pt-20 pb-28">
        {schedules.length === 0 && (
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
        )}

        <div className="flex flex-col gap-2">
          {schedules.map((split) => (
            <Link
              key={split.id}
              to="/schedule/$scheduleId"
              params={{ scheduleId: split.id }}
            >
              <div
                style={S.card}
                className="flex items-start justify-between px-4 py-3"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium">
                    <span style={{ color: S.amber }}>
                      {capitalize(split.day)}
                    </span>
                    <span style={{ color: S.muted }}> — </span>
                    {split.name}
                  </p>
                  <p className="text-xs" style={{ color: S.muted }}>
                    {split.exercises || "No exercises yet"}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="ml-3 shrink-0"
                  style={{ color: S.mutedDark }}
                />
              </div>
            </Link>
          ))}
        </div>
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
