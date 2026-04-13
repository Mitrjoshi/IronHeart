import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

export const Route = createFileRoute("/weight/")({
  component: RouteComponent,
});

const chartConfig = {
  value: { label: "Weight (kg)", color: "var(--chart-1)" },
  movingAverage: { label: "7d Average", color: "var(--chart-2)" },
} satisfies ChartConfig;

const trendLabel = {
  up: "📈 Trending Up",
  down: "📉 Trending Down",
  flat: "➡️ Holding Steady",
};

function RouteComponent() {
  const logWeight = useLogWeight();
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

  const profileComplete = settings.height > 0 && settings.age > 0;

  return (
    <AppLayout>
      <Header showBack title="Weight" subtitle="Track your weight over time" />

      <div className="space-y-4 p-4 pt-20 pb-4">
        {/* profile setup */}
        <Card>
          <CardHeader>
            <p className="font-semibold">Profile</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="text-muted-foreground mb-1 text-xs">
                  Height (cm)
                </p>
                <Input
                  placeholder="e.g. 175"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground mb-1 text-xs">Age</p>
                <Input
                  placeholder="e.g. 25"
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
                  placeholder="e.g. 75"
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
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* log weight */}
        <Card>
          <CardHeader>
            <p className="font-semibold">Log Weight</p>
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

        {/* insights */}
        {insights && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground text-xs">Current</p>
                  <p className="text-2xl font-bold">
                    {insights.latest.value}kg
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground text-xs">7d Average</p>
                  <p className="text-2xl font-bold">
                    {insights.movingAverage?.toFixed(1)}kg
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground text-xs">Weekly Change</p>
                  <p
                    className={`text-2xl font-bold ${
                      insights.weeklyChange === null
                        ? ""
                        : insights.weeklyChange > 0
                          ? "text-red-500"
                          : insights.weeklyChange < 0
                            ? "text-green-500"
                            : ""
                    }`}
                  >
                    {insights.weeklyChange === null
                      ? "—"
                      : `${insights.weeklyChange > 0 ? "+" : ""}${insights.weeklyChange.toFixed(1)}kg`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground text-xs">Streak</p>
                  <p className="text-2xl font-bold">{insights.streak} days</p>
                </CardContent>
              </Card>

              {insights.bmi && (
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-muted-foreground text-xs">BMI</p>
                    <p className="text-2xl font-bold">{insights.bmi}</p>
                    <p className="text-muted-foreground text-xs">
                      {insights.bmi < 18.5
                        ? "Underweight"
                        : insights.bmi < 25
                          ? "Normal"
                          : insights.bmi < 30
                            ? "Overweight"
                            : "Obese"}
                    </p>
                  </CardContent>
                </Card>
              )}

              {profileComplete && insights.bmi && settings.age > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-muted-foreground text-xs">Age</p>
                    <p className="text-2xl font-bold">{settings.age} yrs</p>
                    <p className="text-muted-foreground text-xs">
                      Height: {settings.height}cm
                    </p>
                  </CardContent>
                </Card>
              )}

              {insights.trend && (
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-muted-foreground text-xs">30d Trend</p>
                    <p className="text-sm font-medium">
                      {trendLabel[insights.trend]}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {insights.targetProgress && (
              <Card>
                <CardHeader>
                  <p className="font-semibold">Target Progress</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{insights.targetProgress.start}kg</span>
                    <span className="text-muted-foreground">
                      {Math.abs(insights.targetProgress.remaining).toFixed(1)}kg
                      to go
                    </span>
                    <span>{insights.targetProgress.target}kg</span>
                  </div>
                  <div className="bg-muted h-2 w-full rounded-full">
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
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* chart */}
        {history.length >= 2 ? (
          <Card>
            <CardHeader>
              <p className="font-semibold">Progress</p>
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
                    width={35}
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
            <CardContent>
              <p className="text-muted-foreground text-center">
                Log at least 2 entries to see your progress chart.
              </p>
            </CardContent>
          </Card>
        )}

        {/* history list */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <p className="font-semibold">History</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {[...history].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{entry.value}kg</p>
                    {entry.note && (
                      <p className="text-muted-foreground text-xs">
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {new Date(entry.loggedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
