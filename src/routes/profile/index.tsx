// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  useLogWeight,
  useWeightHistory,
  useWeightInsights,
  useDeleteWeight,
} from "@/hooks/store/weight";
import { useSettings, useUpdateSettings } from "@/hooks/store/settings";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/profile/")({
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
  tile: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 12,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  surface: "#1f1f1f",
  green: "#22c55e",
  red: "#ef4444",
  indigo: "#818cf8",
};

const chartConfig = {
  value: { label: "Weight (kg)", color: "#f59e0b" },
  movingAverage: { label: "7d Average", color: "#818cf8" },
} satisfies ChartConfig;

const trendLabel = {
  up: "Trending up",
  down: "Trending down",
  flat: "Holding steady",
};

function SmallInput({
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-w-0 px-3 py-2 text-sm transition-colors outline-none placeholder:text-[#404040] focus:border-amber-500"
      style={S.input}
    />
  );
}

function MetricTile({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div style={S.tile} className="flex flex-col gap-0.5 px-4 py-3">
      <p className="text-xs" style={{ color: S.muted }}>
        {label}
      </p>
      <p
        className="text-lg leading-tight font-semibold"
        style={{ color: valueColor ?? "#f5f5f5" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs" style={{ color: S.muted }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function RouteComponent() {
  const logWeight = useLogWeight();
  const deleteWeight = useDeleteWeight();
  const history = useWeightHistory();
  const insights = useWeightInsights();
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [height, setHeight] = useState(String(settings.height || ""));
  const [age, setAge] = useState(String(settings.age || ""));
  const [targetWeight, setTargetWeight] = useState(
    String(settings.targetWeight || ""),
  );
  const [startWeight, setStartWeight] = useState(
    String(settings.startWeight || ""),
  );

  const handleLog = () => {
    const num = parseFloat(value);
    if (!num || num <= 0) return;
    logWeight(num, note);
    setValue("");
    setNote("");
    toast.success("Weight logged");
  };

  const handleSaveProfile = () => {
    updateSettings({
      height: Number(height) || 0,
      age: Number(age) || 0,
      targetWeight: Number(targetWeight) || 0,
      startWeight: Number(startWeight) || 0,
    });
    toast.success("Profile updated");
  };

  const chartData = history.map((entry, i) => {
    const win = history.slice(Math.max(0, i - 6), i + 1);
    const avg = win.reduce((s, e) => s + e.value, 0) / win.length;
    return {
      date: new Date(entry.loggedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      value: entry.value,
      movingAverage: Math.round(avg * 10) / 10,
    };
  });

  const bmiCategory = insights?.bmi
    ? insights.bmi < 18.5
      ? "Underweight"
      : insights.bmi < 25
        ? "Normal"
        : insights.bmi < 30
          ? "Overweight"
          : "Obese"
    : null;

  const trendColorMap = {
    up:
      insights?.goalDirection === "lose"
        ? S.red
        : insights?.goalDirection === "gain"
          ? S.green
          : S.muted,
    down:
      insights?.goalDirection === "lose"
        ? S.green
        : insights?.goalDirection === "gain"
          ? S.red
          : S.muted,
    flat: S.muted,
  };

  const weeklyChangeColor =
    !insights || insights.weeklyChange === null || insights.weeklyChange === 0
      ? undefined
      : insights.weeklyChange > 0
        ? insights.goalDirection === "gain"
          ? S.green
          : S.red
        : insights.goalDirection === "lose"
          ? S.green
          : S.red;

  return (
    <AppLayout>
      <Header title="Profile" subtitle="Track your weight over time" />

      <div style={S.page} className="min-h-screen space-y-3 px-4 pt-20 pb-8">
        {/* Profile settings */}
        <div style={S.card} className="space-y-3 p-4">
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: S.muted }}
          >
            Profile
          </p>
          <div className="flex flex-row items-center gap-2">
            {[
              {
                label: "Height (cm)",
                placeholder: "175",
                value: height,
                onChange: setHeight,
              },
              { label: "Age", placeholder: "25", value: age, onChange: setAge },
              {
                label: "Target (kg)",
                placeholder: "75",
                value: targetWeight,
                onChange: setTargetWeight,
              },
            ].map(({ label, placeholder, value, onChange }) => (
              <div key={label} className="space-y-1">
                <p className="text-xs" style={{ color: S.muted }}>
                  {label}
                </p>
                <SmallInput
                  placeholder={placeholder}
                  type="number"
                  value={value}
                  onChange={onChange}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSaveProfile}
            className="w-full rounded-xl py-2.5 text-sm font-semibold transition-colors"
            style={{
              background: S.surface,
              color: "#f5f5f5",
              border: "1px solid #262626",
            }}
          >
            Save Profile
          </button>
        </div>

        {/* Log weight */}
        <div style={S.card} className="space-y-3 p-4">
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: S.muted }}
          >
            Log Weight
          </p>
          <div className="flex gap-2">
            <SmallInput
              placeholder="Weight (kg)"
              type="number"
              value={value}
              onChange={setValue}
            />
            <SmallInput
              placeholder="Note (optional)"
              value={note}
              onChange={setNote}
            />
          </div>
          <button
            onClick={handleLog}
            className="w-full rounded-xl py-2.5 text-sm font-semibold transition-opacity active:opacity-80"
            style={{ background: S.amber, color: "#0e0e0e" }}
          >
            Log
          </button>
        </div>

        {/* Insights tiles */}
        {insights && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <MetricTile
                label="Current"
                value={`${insights.latest.value} kg`}
                valueColor={S.amber}
              />
              <MetricTile
                label="7d Average"
                value={
                  insights.movingAverage !== null
                    ? `${insights.movingAverage} kg`
                    : "—"
                }
              />
              <MetricTile
                label="Weekly Change"
                value={
                  insights.weeklyChange === null
                    ? "—"
                    : `${insights.weeklyChange > 0 ? "+" : ""}${insights.weeklyChange} kg`
                }
                valueColor={weeklyChangeColor}
              />
              <MetricTile label="Streak" value={`${insights.streak} days`} />
              {insights.bmi && (
                <MetricTile
                  label="BMI"
                  value={String(insights.bmi)}
                  sub={bmiCategory ?? undefined}
                />
              )}
              {insights.trend && (
                <MetricTile
                  label="30d Trend"
                  value={trendLabel[insights.trend]}
                  valueColor={trendColorMap[insights.trend]}
                />
              )}
            </div>

            {/* Target progress */}
            {insights.targetProgress && (
              <div style={S.card} className="space-y-3 p-4">
                <p
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: S.muted }}
                >
                  Target Progress
                </p>
                {insights.targetProgress.percentage >= 100 ? (
                  <div className="space-y-1 py-4 text-center">
                    <p className="text-3xl">🎯</p>
                    <p className="font-semibold">Target reached!</p>
                    <p className="text-sm" style={{ color: S.muted }}>
                      You hit your goal of {insights.targetProgress.target} kg
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      className="flex justify-between text-xs"
                      style={{ color: S.muted }}
                    >
                      <span>{insights.targetProgress.start} kg</span>
                      <span style={{ color: S.amber }}>
                        {Math.abs(insights.targetProgress.remaining).toFixed(1)}{" "}
                        kg to go
                      </span>
                      <span>{insights.targetProgress.target} kg</span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full"
                      style={{ background: S.surface }}
                    >
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${insights.targetProgress.percentage}%`,
                          background: S.amber,
                        }}
                      />
                    </div>
                    <p
                      className="text-center text-xs"
                      style={{ color: S.muted }}
                    >
                      {insights.targetProgress.percentage}% complete
                    </p>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Chart */}
        <div style={S.card} className="p-4">
          <p
            className="mb-3 text-xs font-semibold tracking-widest uppercase"
            style={{ color: S.muted }}
          >
            Progress
          </p>
          {history.length >= 2 ? (
            <ChartContainer config={chartConfig}>
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} stroke="#1f1f1f" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: S.mutedDark }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={["auto", "auto"]}
                  tickFormatter={(v) => `${v}kg`}
                  tick={{ fontSize: 11, fill: S.mutedDark }}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                {insights?.targetProgress && (
                  <ReferenceLine
                    y={insights.targetProgress.target}
                    stroke={S.green}
                    strokeDasharray="4 4"
                    label={{
                      value: "Target",
                      position: "insideTopRight",
                      fontSize: 11,
                      fill: S.green,
                    }}
                  />
                )}
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke={S.amber}
                  strokeWidth={2}
                  dot={{ r: 3, fill: S.amber }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  dataKey="movingAverage"
                  type="monotone"
                  stroke={S.indigo}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <p
              className="py-6 text-center text-sm"
              style={{ color: S.mutedDark }}
            >
              Log at least 2 entries to see your progress chart.
            </p>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={S.card} className="p-4">
            <p
              className="mb-3 text-xs font-semibold tracking-widest uppercase"
              style={{ color: S.muted }}
            >
              History
            </p>
            <div>
              {[...history].reverse().map((entry, i, arr) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-2.5"
                  style={
                    i < arr.length - 1
                      ? { borderBottom: "1px solid #1a1a1a" }
                      : {}
                  }
                >
                  <div className="space-y-0.5">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: S.amber }}
                    >
                      {entry.value} kg
                    </p>
                    {entry.note && (
                      <p className="text-xs" style={{ color: S.muted }}>
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs" style={{ color: S.muted }}>
                      {new Date(entry.loggedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <button
                      onClick={() => deleteWeight(entry.id)}
                      className="rounded-lg p-1.5 transition-colors"
                      style={{ color: S.mutedDark }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
