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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/profile/")({
  component: RouteComponent,
});

const chartConfig = {
  value: { label: "Weight (kg)", color: "var(--chart-1)" },
  movingAverage: { label: "7d Average", color: "var(--chart-2)" },
} satisfies ChartConfig;

const trendLabel = {
  up: "Trending up",
  down: "Trending down",
  flat: "Holding steady",
};

function MetricTile({
  label,
  value,
  sub,
  valueClass,
}: {
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-muted/40 flex flex-col gap-0.5 rounded-xl px-4 py-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={`text-lg leading-tight font-medium ${valueClass ?? ""}`}>
        {value}
      </p>
      {sub && <p className="text-muted-foreground text-xs">{sub}</p>}
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
    });
    toast.success("Profile updated");
  };

  const chartData = history.map((entry, i) => {
    const window = history.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((sum, e) => sum + e.value, 0) / window.length;
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

  const trendColor = {
    up:
      insights?.goalDirection === "lose"
        ? "text-red-500"
        : insights?.goalDirection === "gain"
          ? "text-green-500"
          : "text-muted-foreground",
    down:
      insights?.goalDirection === "lose"
        ? "text-green-500"
        : insights?.goalDirection === "gain"
          ? "text-red-500"
          : "text-muted-foreground",
    flat: "text-muted-foreground",
  };

  const weeklyChangeColor =
    !insights || insights.weeklyChange === null || insights.weeklyChange === 0
      ? ""
      : insights.weeklyChange > 0
        ? insights.goalDirection === "gain"
          ? "text-green-500"
          : "text-red-500"
        : insights.goalDirection === "lose"
          ? "text-green-500"
          : "text-red-500";

  return (
    <AppLayout>
      <Header showBack title="Weight" subtitle="Track your weight over time" />

      <div className="space-y-4 p-4 pt-20 pb-8">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-muted-foreground mb-1 text-xs">
                  Height (cm)
                </p>
                <Input
                  placeholder="175"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground mb-1 text-xs">Age</p>
                <Input
                  placeholder="25"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground mb-1 text-xs">
                  Target (kg)
                </p>
                <Input
                  placeholder="75"
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              variant="outline"
              onClick={handleSaveProfile}
            >
              Save profile
            </Button>
          </CardContent>
        </Card>

        {/* Log weight */}
        <Card>
          <CardHeader>
            <CardTitle>Log weight</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Weight (kg)"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <Input
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <Button className="w-full" size="lg" onClick={handleLog}>
              Log
            </Button>
          </CardContent>
        </Card>

        {/* Insights */}
        {insights && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <MetricTile
                label="Current"
                value={`${insights.latest.value} kg`}
              />
              <MetricTile
                label="7d average"
                value={
                  insights.movingAverage !== null
                    ? `${insights.movingAverage} kg`
                    : "—"
                }
              />
              <MetricTile
                label="Weekly change"
                value={
                  insights.weeklyChange === null
                    ? "—"
                    : `${insights.weeklyChange > 0 ? "+" : ""}${insights.weeklyChange} kg`
                }
                valueClass={weeklyChangeColor}
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
                  label="30d trend"
                  value={trendLabel[insights.trend]}
                  valueClass={trendColor[insights.trend]}
                />
              )}
            </div>

            {insights.targetProgress && (
              <Card>
                <CardHeader>
                  <CardTitle>Target progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {insights.targetProgress.percentage >= 100 ? (
                    <div className="space-y-1 py-2 text-center">
                      <p className="text-2xl">🎯</p>
                      <p className="font-medium">Target reached!</p>
                      <p className="text-muted-foreground text-sm">
                        You hit your goal of {insights.targetProgress.target} kg
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>{insights.targetProgress.start} kg</span>
                        <span className="text-muted-foreground">
                          {Math.abs(insights.targetProgress.remaining).toFixed(
                            1,
                          )}{" "}
                          kg to go
                        </span>
                        <span>{insights.targetProgress.target} kg</span>
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${insights.targetProgress.percentage}%`,
                          }}
                        />
                      </div>
                      <p className="text-muted-foreground text-center text-sm">
                        {insights.targetProgress.percentage}% complete
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Chart */}
        {history.length >= 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    domain={["auto", "auto"]}
                    tickFormatter={(v) => `${v}kg`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  {insights?.targetProgress && (
                    <ReferenceLine
                      y={insights.targetProgress.target}
                      stroke="var(--chart-3)"
                      strokeDasharray="4 4"
                      label={{
                        value: "Target",
                        position: "insideTopRight",
                        fontSize: 11,
                      }}
                    />
                  )}
                  <Line
                    dataKey="value"
                    type="monotone"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    dataKey="movingAverage"
                    type="monotone"
                    stroke="var(--color-movingAverage)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-muted-foreground text-center text-sm">
                Log at least 2 entries to see your progress chart.
              </p>
            </CardContent>
          </Card>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {[...history].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium">{entry.value} kg</p>
                    {entry.note && (
                      <p className="text-muted-foreground text-xs">
                        {entry.note}
                      </p>
                    )}
                  </div>
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
                      onClick={() => deleteWeight(entry.id)}
                    >
                      <Trash2 size={15} className="text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
