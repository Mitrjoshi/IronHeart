import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { useAllSchedules, useSchedulesToday } from "@/hooks/store/schedules";
import {
  capitalize,
  formatDuration,
  formatElapsedTime,
  formatVolume,
} from "@/utils";
import { WeeklyGraph } from "@/components/WeeklyGraph";
import { useActiveSessions } from "@/hooks/store/activeSession";
import { useWorkoutHistory } from "@/hooks/store/workouts";
import { useDailyTotals, useMealsForDay } from "@/hooks/store/food";
import { ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { store } from "@/store/schema";
import { useNutritionTargets } from "@/hooks/store/weight";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: () => {
    const calories = store.getCell("settings", "user", "targetCalories");
    if (!calories) throw redirect({ to: "/onboarding" });
  },
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

function SectionLabel({
  label,
  linkLabel,
  onLink,
}: {
  label: string;
  linkLabel?: string;
  onLink?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <p
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: S.muted }}
      >
        {label}
      </p>
      {linkLabel && (
        <button
          onClick={onLink}
          className="flex items-center gap-0.5 text-xs transition-colors"
          style={{ color: S.muted }}
        >
          {linkLabel} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

function MacroBar({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min((value / target) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span style={{ color }}>{label}</span>
        <span style={{ color: S.muted }}>
          {value.toFixed(1)}
          {unit} / {target}
          {unit}
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "#262626" }}
      >
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function RouteComponent() {
  const navigate = Route.useNavigate();
  const schedules = useAllSchedules();
  const todaySchedules = useSchedulesToday();
  const workoutHistory = useWorkoutHistory();
  const activeSessions = useActiveSessions();
  const TARGETS = useNutritionTargets();
  const totals = useDailyTotals();
  const meals = useMealsForDay();

  const remaining = (TARGETS.calories - totals.calories).toFixed(0);

  return (
    <AppLayout>
      <Header title="Iron Heart" subtitle="Workout Tracker" />

      <div style={S.page} className="space-y-6 px-4 pt-20 pb-8">
        {/* Weekly progress */}
        <div className="space-y-3">
          <SectionLabel
            label="Weekly Progress"
            linkLabel="Full report"
            onLink={() => navigate({ to: "/report" })}
          />
          <div style={S.card} className="p-4">
            <WeeklyGraph />
            <button
              onClick={() => navigate({ to: "/report" })}
              className="mt-3 w-full rounded-xl py-2.5 text-sm font-semibold transition-colors"
              style={{ background: S.surface, color: "#f5f5f5" }}
            >
              View Detailed Report
            </button>
          </div>
        </div>

        {/* Divider */}
        <hr style={S.divider} />

        {/* Nutrition */}
        <div className="space-y-3">
          <SectionLabel
            label="Today's Nutrition"
            linkLabel="View logs"
            onLink={() => navigate({ to: "/food/logged" })}
          />

          <div style={S.card} className="space-y-4 p-4">
            {/* Calorie headline */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold" style={{ color: S.amber }}>
                  {totals.calories.toFixed(0)}
                  <span
                    className="ml-1 text-base font-normal"
                    style={{ color: S.muted }}
                  >
                    kcal
                  </span>
                </p>
                <p className="mt-0.5 text-xs" style={{ color: S.mutedDark }}>
                  {Number(remaining) >= 0
                    ? `${remaining} kcal remaining`
                    : `${Math.abs(Number(remaining))} kcal over`}
                </p>
              </div>
              <p className="text-sm" style={{ color: S.muted }}>
                / {TARGETS.calories} kcal
              </p>
            </div>

            {/* Macro bars */}
            <div className="space-y-2.5">
              <MacroBar
                label="Protein"
                value={totals.protein}
                target={TARGETS.protein}
                unit="g"
                color="#818cf8"
              />
              <MacroBar
                label="Carbs"
                value={totals.carbs}
                target={TARGETS.carbs}
                unit="g"
                color="#34d399"
              />
              <MacroBar
                label="Fats"
                value={totals.fats}
                target={TARGETS.fats}
                unit="g"
                color="#fb923c"
              />
            </div>
          </div>

          {/* Meal breakdown */}
          {meals
            .filter((m) => m.entries.length > 0)
            .map((meal) => (
              <div
                key={meal.id}
                style={S.card}
                className="flex items-start justify-between px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize">{meal.name}</p>
                  <p className="mt-0.5 text-xs" style={{ color: S.muted }}>
                    {meal.entries.map((e) => e.foodName).join(", ")}
                  </p>
                </div>
                <p
                  className="ml-3 shrink-0 text-sm font-semibold"
                  style={{ color: S.amber }}
                >
                  {meal.entries.reduce((s, e) => s + e.calories, 0).toFixed(0)}{" "}
                  kcal
                </p>
              </div>
            ))}
        </div>

        <hr style={S.divider} />

        {/* Active sessions */}
        {activeSessions.map((session) => (
          <div key={session.id} style={S.card} className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Resume {session.scheduleName}</p>
                <p className="mt-0.5 text-xs" style={{ color: S.muted }}>
                  {capitalize(session.scheduleDay)}
                </p>
              </div>
              <p className="font-mono text-sm" style={{ color: S.amber }}>
                {formatElapsedTime(session.elapsedTime)}
              </p>
            </div>
            <button
              className="w-full rounded-xl py-2.5 text-sm font-semibold transition-colors"
              style={{ background: S.amber, color: "#0e0e0e" }}
              onClick={() =>
                navigate({
                  to: "/schedule/$scheduleId/start",
                  params: { scheduleId: session.scheduleId },
                })
              }
            >
              Continue Workout
            </button>
          </div>
        ))}

        {/* Today's workout */}
        <div className="space-y-3">
          <SectionLabel label="Today's Workout" />
          <div style={S.card} className="p-4">
            {todaySchedules.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">{todaySchedules[0]?.name}</p>
                  {!todaySchedules[0].isDone && (
                    <p
                      className="mt-1 flex items-center gap-1.5 text-xs"
                      style={{ color: S.muted }}
                    >
                      <span>{todaySchedules[0].exerciseCount} exercises</span>
                      <span style={{ color: S.mutedDark }}>·</span>
                      <span>{todaySchedules[0].totalSets} sets</span>
                      {todaySchedules[0].totalReps > 0 && (
                        <>
                          <span style={{ color: S.mutedDark }}>·</span>
                          <span>{todaySchedules[0].totalReps} reps</span>
                        </>
                      )}
                      {todaySchedules[0].totalDuration > 0 && (
                        <>
                          <span style={{ color: S.mutedDark }}>·</span>
                          <span>
                            {formatDuration(todaySchedules[0].totalDuration)}
                          </span>
                        </>
                      )}
                    </p>
                  )}
                </div>

                {todaySchedules[0].isDone ? (
                  <div className="space-y-1 py-4 text-center">
                    <p className="text-4xl">🏆</p>
                    <p className="font-semibold">Crushed it!</p>
                    <p className="text-sm" style={{ color: S.muted }}>
                      You've completed today's workout. Rest up and come back
                      stronger.
                    </p>
                  </div>
                ) : (
                  <button
                    className="w-full rounded-xl py-2.5 text-sm font-semibold transition-colors"
                    style={{ background: S.amber, color: "#0e0e0e" }}
                    onClick={() =>
                      navigate({
                        to: "/schedule/$scheduleId/start",
                        params: { scheduleId: todaySchedules[0].id },
                      })
                    }
                  >
                    Start Workout
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <p className="text-sm" style={{ color: S.muted }}>
                  No workout scheduled for today.
                </p>
                <button
                  className="w-full rounded-xl py-2.5 text-sm font-semibold"
                  style={{ background: S.surface, color: "#f5f5f5" }}
                  onClick={() => navigate({ to: "/schedule/create" })}
                >
                  Create Schedule
                </button>
              </div>
            )}
          </div>
        </div>

        <hr style={S.divider} />

        {/* Schedule list */}
        <div className="space-y-3">
          <SectionLabel
            label="Workout Schedule"
            linkLabel="View all"
            onLink={() => navigate({ to: "/schedule" })}
          />
          {schedules.length > 0 ? (
            <div className="flex flex-col gap-1 space-y-2">
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
                    <div>
                      <p className="text-sm font-medium">
                        {capitalize(split.day)} — {split.name}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: S.muted }}>
                        {split.exercises}
                      </p>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <p className="text-xs" style={{ color: S.mutedDark }}>
                        {formatDuration(split.durationMinutes)}
                      </p>
                      <ChevronRight size={15} style={{ color: S.mutedDark }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={S.card} className="space-y-3 p-4 text-center">
              <p className="text-sm" style={{ color: S.muted }}>
                No schedules yet.
              </p>
              <button
                className="w-full rounded-xl py-2.5 text-sm font-semibold"
                style={{ background: S.surface, color: "#f5f5f5" }}
                onClick={() => navigate({ to: "/schedule/create" })}
              >
                Create Schedule
              </button>
            </div>
          )}
        </div>

        <hr style={S.divider} />

        {/* Workout history */}
        <div className="space-y-3">
          <SectionLabel
            label="Workout History"
            linkLabel="View all"
            onLink={() => navigate({ to: "/history" })}
          />
          {workoutHistory.length > 0 ? (
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
                  <p className="text-xs" style={{ color: S.muted }}>
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
          ) : (
            <div style={S.card} className="p-4">
              <p className="text-center text-sm" style={{ color: S.muted }}>
                No workout history yet. Start your first session.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
