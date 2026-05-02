import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useWeeklyStats } from "@/hooks/store/useWeeklyStats";
import { capitalize } from "@/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const S = {
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  indigo: "#818cf8",
  surface: "#1f1f1f",
};

const chartConfig = {
  totalReps: { label: "Reps", color: S.amber },
  totalWeight: { label: "Volume (kg)", color: S.indigo },
} satisfies ChartConfig;

export const WeeklyGraph = () => {
  const weeklyStats = useWeeklyStats();

  const isEmpty = weeklyStats.every(
    (d) => d.totalReps === 0 && d.totalWeight === 0,
  );

  if (isEmpty) {
    return (
      <p className="py-6 text-center text-sm" style={{ color: S.mutedDark }}>
        No workout data yet. Complete a workout to see your weekly progress.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: S.amber }}
          />
          <span className="text-xs" style={{ color: S.muted }}>
            Reps
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: S.indigo }}
          />
          <span className="text-xs" style={{ color: S.muted }}>
            Volume (kg)
          </span>
        </div>
      </div>
      <ChartContainer className="outline-none!" config={chartConfig}>
        <BarChart data={weeklyStats}>
          <CartesianGrid vertical={false} stroke="#1f1f1f" />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={8}
            axisLine={false}
            tick={{ fontSize: 11, fill: S.mutedDark }}
            tickFormatter={(value) => capitalize(value).slice(0, 3)}
          />
          <YAxis
            yAxisId="reps"
            orientation="left"
            tickLine={false}
            axisLine={false}
            width={30}
            tick={{ fontSize: 11, fill: S.mutedDark }}
          />
          <YAxis
            yAxisId="volume"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={45}
            tick={{ fontSize: 11, fill: S.mutedDark }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}t`}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar yAxisId="reps" dataKey="totalReps" fill={S.amber} radius={8} />
          <Bar
            yAxisId="volume"
            dataKey="totalWeight"
            fill={S.indigo}
            radius={8}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
};
