import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
  MEASUREMENT_GROUPS,
  type MeasurementGroup,
  useDeleteMeasurement,
  useLogMeasurement,
  useMeasurementsByGroup,
} from "@/hooks/store/measurements";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { useSettings } from "@/hooks/store/settings";
import { useWeightInsights } from "@/hooks/store/weight";

export const Route = createFileRoute("/measurements/")({
  component: RouteComponent,
});

const chartConfig = {
  value: { label: "cm", color: "var(--chart-1)" },
} satisfies ChartConfig;

function GroupSection({
  group,
  goalDirection,
}: {
  group: MeasurementGroup;
  goalDirection: "lose" | "gain" | null;
}) {
  const entries = useMeasurementsByGroup(group);
  const logMeasurement = useLogMeasurement();
  const deleteMeasurement = useDeleteMeasurement();
  const [value, setValue] = useState("");

  const handleLog = () => {
    const num = parseFloat(value);
    if (!num || num <= 0) return;
    logMeasurement(group, num);
    setValue("");
    toast.success(`${group} logged`);
  };

  const latest = entries.at(-1);
  const previous = entries.at(-2);
  const diff =
    latest && previous
      ? Math.round((latest.value - previous.value) * 10) / 10
      : null;

  const chartData = entries.map((e) => ({
    date: new Date(e.loggedAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    value: e.value,
  }));

  const diffColor =
    diff === null || diff === 0
      ? "text-muted-foreground"
      : goalDirection === "lose"
        ? diff < 0
          ? "text-green-500" // losing size = good
          : "text-red-500" // gaining size = bad
        : goalDirection === "gain"
          ? diff > 0
            ? "text-green-500" // gaining size = good
            : "text-red-500" // losing size = bad
          : "text-muted-foreground"; // no goal set

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{group}</CardTitle>
          {latest && (
            <div className="text-right">
              <p className="text-lg leading-tight font-semibold">
                {latest.value} cm
              </p>
              {diff !== null && (
                <p
                  className={`text-xs ${
                    diff === 0
                      ? "text-muted-foreground"
                      : diff > 0
                        ? "text-red-500"
                        : "text-green-500"
                  }`}
                >
                  <p className={`text-xs ${diffColor}`}>
                    {diff > 0 ? "+" : ""}
                    {diff} from last
                  </p>
                </p>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Log input */}
        <div className="flex gap-2">
          <Input
            placeholder="cm"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button onClick={handleLog} className="shrink-0">
            Log
          </Button>
        </div>

        {/* Chart */}
        {chartData.length >= 2 && (
          <ChartContainer config={chartConfig} className="h-[140px] w-full">
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={36}
                domain={["auto", "auto"]}
                tickFormatter={(v) => `${v}`}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        )}

        {/* History */}
        {entries.length > 0 && (
          <div className="divide-y">
            {[...entries].reverse().map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
              >
                <p className="font-medium">{entry.value} cm</p>
                <div className="flex items-center gap-3">
                  <p className="text-muted-foreground text-sm">
                    {new Date(entry.loggedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMeasurement(entry.id)}
                  >
                    <Trash2 size={15} className="text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {entries.length === 0 && (
          <p className="text-muted-foreground py-2 text-center text-sm">
            No entries yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const settings = useSettings();
  const insights = useWeightInsights();

  const targetWeight = settings.targetWeight ?? 0;
  const currentWeight = insights?.latest.value ?? 0;

  const goalDirection: "lose" | "gain" | null = targetWeight
    ? currentWeight > targetWeight
      ? "lose"
      : currentWeight < targetWeight
        ? "gain"
        : null
    : null;

  return (
    <AppLayout>
      <Header title="Measurements" subtitle="Track your body measurements" />
      <div className="space-y-4 p-4 pt-20 pb-8">
        {MEASUREMENT_GROUPS.map((group) => (
          <GroupSection
            goalDirection={goalDirection}
            key={group}
            group={group}
          />
        ))}
      </div>
    </AppLayout>
  );
}
