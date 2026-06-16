import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  MEASUREMENT_GROUPS,
  type MeasurementGroup,
  useDeleteMeasurement,
  useLogMeasurement,
  useMeasurementsByGroup,
} from "@/hooks/store/measurements";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image, Trash2 } from "lucide-react";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { useSettings } from "@/hooks/store/settings";
import { useWeightInsights } from "@/hooks/store/weight";

export const Route = createFileRoute("/measurements/")({
  component: RouteComponent,
});

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5" },
  card: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 16,
  },
  input: {
    background: "#111111",
    border: "1px solid #262626",
    color: "#f5f5f5",
    borderRadius: 10,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  surface: "#1f1f1f",
  green: "#22c55e",
  red: "#ef4444",
};

const chartConfig = {
  value: { label: "cm", color: "#f59e0b" },
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

  const diffColor =
    diff === null || diff === 0
      ? S.muted
      : goalDirection === "lose"
        ? diff < 0
          ? S.green
          : S.red
        : goalDirection === "gain"
          ? diff > 0
            ? S.green
            : S.red
          : S.muted;

  const chartData = entries.map((e) => ({
    date: new Date(e.loggedAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),
    value: e.value,
  }));

  return (
    <div style={S.card} className="space-y-3 p-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="font-semibold">{group}</p>
        {latest && (
          <div className="text-right">
            <p
              className="text-base leading-tight font-semibold"
              style={{ color: S.amber }}
            >
              {latest.value} cm
            </p>
            {diff !== null && (
              <p className="text-xs" style={{ color: diffColor }}>
                {diff > 0 ? "+" : ""}
                {diff} from last
              </p>
            )}
          </div>
        )}
      </div>

      {/* Log input */}
      <div className="flex gap-2">
        <input
          placeholder="cm"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full min-w-0 px-3 py-2 text-sm transition-colors outline-none placeholder:text-[#404040] focus:border-amber-500"
          style={S.input}
        />
        <button
          onClick={handleLog}
          className="shrink-0 rounded-xl px-4 text-sm font-semibold transition-opacity active:opacity-80"
          style={{ background: S.amber, color: "#0e0e0e" }}
        >
          Log
        </button>
      </div>

      {/* Chart */}
      {chartData.length >= 2 && (
        <ChartContainer config={chartConfig} className="h-[140px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} stroke="#1f1f1f" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tick={{ fontSize: 11, fill: S.mutedDark }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `${v}`}
              tick={{ fontSize: 11, fill: S.mutedDark }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="value"
              type="monotone"
              stroke={S.amber}
              strokeWidth={2}
              dot={{ r: 3, fill: S.amber }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      )}

      {/* History */}
      {entries.length > 0 && (
        <div>
          {[...entries].reverse().map((entry, i, arr) => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-2"
              style={
                i < arr.length - 1 ? { borderBottom: "1px solid #1a1a1a" } : {}
              }
            >
              <p className="text-sm font-medium">{entry.value} cm</p>
              <div className="flex items-center gap-3">
                <p className="text-xs" style={{ color: S.muted }}>
                  {new Date(entry.loggedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <button
                  onClick={() => deleteMeasurement(entry.id)}
                  className="rounded-lg p-1.5 transition-colors"
                  style={{ color: S.mutedDark }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <p className="py-2 text-center text-sm" style={{ color: S.mutedDark }}>
          No entries yet
        </p>
      )}
    </div>
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
      <Header
        title="Measurements"
        subtitle="Track your body measurements"
        right={
          <Link to="/measurements/gallery">
            <button
              className="rounded-xl p-2 transition-colors"
              style={{ background: S.surface, color: S.muted }}
            >
              <Image size={14} />
            </button>
          </Link>
        }
      />
      <div style={S.page} className="min-h-screen space-y-3 px-4 pt-20 pb-8">
        {MEASUREMENT_GROUPS.map((group) => (
          <GroupSection
            key={group}
            group={group}
            goalDirection={goalDirection}
          />
        ))}
      </div>
    </AppLayout>
  );
}
