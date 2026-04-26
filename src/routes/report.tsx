import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAllExercisesProgress } from "@/hooks/store/useWeeklyStats";
import {
  capitalize,
  formatDuration,
  formatVolume,
  formatWeight,
} from "@/utils";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/report")({
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
  indigo: "#818cf8",
  surface: "#1f1f1f",
};

const weightedConfig = {
  maxWeight: { label: "Max Weight (kg)", color: S.amber },
  totalVolume: { label: "Volume", color: S.indigo },
} satisfies ChartConfig;

const durationConfig = {
  totalDuration: { label: "Duration (s)", color: S.amber },
} satisfies ChartConfig;

const bodyweightConfig = {
  totalReps: { label: "Total Reps", color: S.amber },
} satisfies ChartConfig;

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: "#404040" },
} as const;

function ScheduleSection({
  schedule,
}: {
  schedule: ReturnType<typeof useAllExercisesProgress>[0];
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-2">
      {/* Section header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between py-1"
      >
        <p className="truncate text-sm font-semibold">
          <span style={{ color: S.amber }}>
            {capitalize(schedule.scheduleDay)}
          </span>
          <span style={{ color: S.muted }}> — </span>
          {schedule.scheduleName}
        </p>
        <ChevronDown
          size={16}
          style={{
            color: S.mutedDark,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div className="space-y-2">
          {schedule.exercises.length === 0 ? (
            <div style={S.card} className="px-4 py-8 text-center">
              <p className="text-sm" style={{ color: S.muted }}>
                No workout data yet for this schedule.
              </p>
            </div>
          ) : (
            schedule.exercises.map((exercise) => (
              <div
                key={exercise.exerciseId}
                style={S.card}
                className="space-y-3 p-4"
              >
                {/* Exercise header */}
                <div>
                  <p className="truncate font-medium">{exercise.name}</p>
                  <p
                    className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs"
                    style={{ color: S.muted }}
                  >
                    {exercise.type === "weighted" && (
                      <>
                        <span>
                          PR:{" "}
                          <span style={{ color: S.amber }}>
                            {formatWeight(exercise.allTimePR)}
                          </span>
                        </span>
                        <span style={{ color: S.mutedDark }}>·</span>
                        <span>{exercise.totalSessions} sessions</span>
                        {exercise.latestSession && (
                          <>
                            <span style={{ color: S.mutedDark }}>·</span>
                            <span>
                              Last:{" "}
                              {formatVolume(exercise.latestSession.totalVolume)}
                            </span>
                          </>
                        )}
                      </>
                    )}
                    {exercise.type === "bodyweight" && (
                      <>
                        <span>{exercise.totalSessions} sessions</span>
                        {exercise.latestSession && (
                          <>
                            <span style={{ color: S.mutedDark }}>·</span>
                            <span>
                              Last: {exercise.latestSession.totalReps} reps
                            </span>
                          </>
                        )}
                      </>
                    )}
                    {exercise.type === "duration" && (
                      <>
                        <span>{exercise.totalSessions} sessions</span>
                        {exercise.latestSession && (
                          <>
                            <span style={{ color: S.mutedDark }}>·</span>
                            <span>
                              Last:{" "}
                              {formatDuration(
                                exercise.latestSession.totalDuration,
                              )}
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </p>
                </div>

                {/* Chart */}
                {exercise.progress.length < 2 ? (
                  <p
                    className="py-4 text-center text-xs"
                    style={{ color: S.mutedDark }}
                  >
                    Complete at least 2 workouts to see progress.
                  </p>
                ) : exercise.type === "weighted" ? (
                  <ChartContainer config={weightedConfig}>
                    <LineChart
                      data={exercise.progress.map((p) => ({
                        date: new Date(p!.finishedAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short" },
                        ),
                        maxWeight: p!.maxWeight,
                        totalVolume: p!.totalVolume,
                      }))}
                    >
                      <CartesianGrid vertical={false} stroke="#1f1f1f" />
                      <XAxis dataKey="date" tickMargin={8} {...axisProps} />
                      <YAxis
                        yAxisId="weight"
                        orientation="left"
                        width={30}
                        {...axisProps}
                      />
                      <YAxis
                        yAxisId="volume"
                        orientation="right"
                        width={45}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`}
                        {...axisProps}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <Line
                        yAxisId="weight"
                        dataKey="maxWeight"
                        type="monotone"
                        stroke={S.amber}
                        strokeWidth={2}
                        dot={{ r: 3, fill: S.amber }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        yAxisId="volume"
                        dataKey="totalVolume"
                        type="monotone"
                        stroke={S.indigo}
                        strokeWidth={2}
                        dot={{ r: 3, fill: S.indigo }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : exercise.type === "duration" ? (
                  <ChartContainer config={durationConfig}>
                    <LineChart
                      data={exercise.progress.map((p) => ({
                        date: new Date(p!.finishedAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short" },
                        ),
                        totalDuration: p!.totalDuration,
                      }))}
                    >
                      <CartesianGrid vertical={false} stroke="#1f1f1f" />
                      <XAxis dataKey="date" tickMargin={8} {...axisProps} />
                      <YAxis
                        width={40}
                        tickFormatter={(v) => `${v}s`}
                        {...axisProps}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <Line
                        dataKey="totalDuration"
                        type="monotone"
                        stroke={S.amber}
                        strokeWidth={2}
                        dot={{ r: 3, fill: S.amber }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ChartContainer>
                ) : (
                  <ChartContainer config={bodyweightConfig}>
                    <LineChart
                      data={exercise.progress.map((p) => ({
                        date: new Date(p!.finishedAt).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short" },
                        ),
                        totalReps: p!.totalReps,
                      }))}
                    >
                      <CartesianGrid vertical={false} stroke="#1f1f1f" />
                      <XAxis dataKey="date" tickMargin={8} {...axisProps} />
                      <YAxis width={30} {...axisProps} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <Line
                        dataKey="totalReps"
                        type="monotone"
                        stroke={S.amber}
                        strokeWidth={2}
                        dot={{ r: 3, fill: S.amber }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ChartContainer>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function RouteComponent() {
  const schedules = useAllExercisesProgress();

  return (
    <AppLayout>
      <Header showBack subtitle="Detailed Report" title="Report" />

      <div style={S.page} className="min-h-screen space-y-6 px-4 pt-20 pb-8">
        {schedules.length === 0 ? (
          <div style={S.card} className="px-4 py-12 text-center">
            <p className="text-sm" style={{ color: S.muted }}>
              No data yet. Complete a workout to see your report.
            </p>
          </div>
        ) : (
          schedules.map((schedule) => (
            <ScheduleSection key={schedule.scheduleId} schedule={schedule} />
          ))
        )}
      </div>
    </AppLayout>
  );
}
