import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAllExercisesProgress } from "@/hooks/store/useWeeklyStats";
import { capitalize, formatVolume } from "@/utils";
import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/report")({
  component: RouteComponent,
});

const chartConfig = {
  maxWeight: { label: "Max Weight (kg)", color: "var(--chart-1)" },
  totalVolume: { label: "Volume", color: "var(--chart-2)" },
} satisfies ChartConfig;

function RouteComponent() {
  const schedules = useAllExercisesProgress();

  return (
    <>
      <Header showBack subtitle="Detailed Report" title="Report" />

      <div className="space-y-6 px-4 pt-20 pb-4">
        {schedules.map((schedule) => (
          <div key={schedule.scheduleId} className="space-y-3">
            <p className="font-semibold">
              {capitalize(schedule.scheduleDay)} — {schedule.scheduleName}
            </p>

            {schedule.exercises.length === 0 ? (
              <Card>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    No workout data yet for this schedule.
                  </p>
                </CardContent>
              </Card>
            ) : (
              schedule.exercises.map((exercise) => (
                <Card key={exercise.exerciseId}>
                  <CardHeader>
                    <p className="font-medium">{exercise.name}</p>
                    <CardDescription className="flex items-center gap-2">
                      <span>PR: {exercise.allTimePR}kg</span>
                      <span className="bg-muted-foreground size-1 rounded-full" />
                      <span>{exercise.totalSessions} sessions</span>
                      {exercise.latestSession && (
                        <>
                          <span className="bg-muted-foreground size-1 rounded-full" />
                          <span>
                            Last:{" "}
                            {formatVolume(exercise.latestSession.totalVolume)}
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {exercise.progress.length < 2 ? (
                      <p className="text-muted-foreground text-center text-sm">
                        Complete at least 2 workouts to see progress.
                      </p>
                    ) : (
                      <ChartContainer config={chartConfig}>
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
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                          />
                          <YAxis
                            yAxisId="weight"
                            orientation="left"
                            tickLine={false}
                            axisLine={false}
                            width={30}
                          />
                          <YAxis
                            yAxisId="volume"
                            orientation="right"
                            tickLine={false}
                            axisLine={false}
                            width={45}
                            tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                          />
                          <Line
                            yAxisId="weight"
                            dataKey="maxWeight"
                            type="monotone"
                            stroke="var(--color-maxWeight)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            yAxisId="volume"
                            dataKey="totalVolume"
                            type="monotone"
                            stroke="var(--color-totalVolume)"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ))}

        {schedules.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-muted-foreground text-center">
                No data yet. Complete a workout to see your report.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
