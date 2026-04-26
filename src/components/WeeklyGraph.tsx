import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useWeeklyStats } from "@/hooks/store/useWeeklyStats";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const S = {
  card: {
    background: "#161616",
    borderRadius: 16,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  indigo: "#818cf8",
};

const chartConfig = {
  totalReps: { label: "Reps", color: S.amber },
  totalWeight: { label: "Volume (kg)", color: S.indigo },
} satisfies ChartConfig;

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: "#404040" },
} as const;

export const WeeklyGraph = () => {
  const weeklyStats = useWeeklyStats();

  const isEmpty = weeklyStats.every(
    (d) => d.totalReps === 0 && d.totalWeight === 0,
  );

  return (
    <div style={S.card} className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-sm font-medium">Weekly Progress</p>

        {/* 🔥 Legend */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: S.amber }}
            />
            <span style={{ color: S.muted }}>Reps</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: S.indigo }}
            />
            <span style={{ color: S.muted }}>Volume</span>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="py-8 text-center">
          <p className="text-sm" style={{ color: S.muted }}>
            No workout data yet.
          </p>
          <p className="mt-1 text-xs" style={{ color: S.mutedDark }}>
            Complete workouts to see your weekly trend.
          </p>
        </div>
      ) : (
        <ChartContainer config={chartConfig}>
          <BarChart data={weeklyStats} barGap={6}>
            <CartesianGrid vertical={false} stroke="#1f1f1f" />

            {/* ✅ Schedule names instead of weekday */}
            <XAxis
              dataKey="scheduleName"
              tickMargin={8}
              tickFormatter={(value) => {
                if (!value) return ""; // handles undefined/null

                const str = String(value);
                return str.length > 8 ? str.slice(0, 8) + "…" : str;
              }}
              {...axisProps}
            />

            <YAxis
              yAxisId="reps"
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

            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Bar
              yAxisId="reps"
              dataKey="totalReps"
              fill={S.amber}
              radius={[6, 6, 0, 0]}
            />

            <Bar
              yAxisId="volume"
              dataKey="totalWeight"
              fill={S.indigo}
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
};
