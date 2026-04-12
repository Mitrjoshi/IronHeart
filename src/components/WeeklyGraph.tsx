import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useWeeklyStats } from "@/hooks/store/useWeeklyStats";
import { capitalize } from "@/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  totalReps: { label: "Reps", color: "var(--chart-1)" },
  totalWeight: { label: "Volume (kg)", color: "var(--chart-2)" },
} satisfies ChartConfig;

export const WeeklyGraph = () => {
  const weeklyStats = useWeeklyStats();

  const isEmpty = weeklyStats.every(
    (d) => d.totalReps === 0 && d.totalWeight === 0,
  );

  if (isEmpty) {
    return (
      <p className="text-muted-foreground text-center">
        No workout data yet. Complete a workout to see your weekly progress.
      </p>
    );
  }

  return (
    <ChartContainer className="outline-none!" config={chartConfig}>
      <BarChart data={weeklyStats}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => capitalize(value).slice(0, 3)}
        />
        <YAxis
          yAxisId="reps"
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
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar
          yAxisId="reps"
          dataKey="totalReps"
          fill="var(--color-totalReps)"
          radius={8}
        />
        <Bar
          yAxisId="volume"
          dataKey="totalWeight"
          fill="var(--color-totalWeight)"
          radius={8}
        />
      </BarChart>
    </ChartContainer>
  );
};
