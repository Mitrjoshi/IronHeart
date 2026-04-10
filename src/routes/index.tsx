import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Separator } from "@/components/ui/separator";
export const description = "A bar chart";
const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header title="Home" subtitle="Workout Tracker" />

      <div className="space-y-4 pt-25">
        <div className="space-y-2 p-4 py-0">
          <p>Weekly Progress</p>
          <Card>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar
                    dataKey="desktop"
                    fill="var(--color-desktop)"
                    radius={8}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="space-y-2 p-4 py-0">
          <p>Start Today's Workout</p>
          <Card>
            <CardHeader>Chest</CardHeader>
            <CardContent>
              <CardDescription>
                Bench Press, Incline Dumbbell Press, Chest Flyes, Push-ups.
              </CardDescription>
              <CardDescription>
                4 exercises - 20 sets - 200 reps)
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size={"lg"}>
                Start Workout
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Separator />

        <div className="space-y-2 p-4 py-0">
          <p>Workout Schedule</p>
          {[
            "Monday - Chest",
            "Tuesday - Back",
            "Wednesday - Legs",
            "Thursday - Shoulders",
            "Friday - Arms",
          ].map((split) => (
            <Card key={split}>
              <CardContent className="flex items-center justify-between">
                <p>{split}</p>
                <Button size="icon-sm" className="rounded-full">
                  <Play fill="black" />
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button size="lg" className="w-full">
            Edit Schedule
          </Button>
        </div>

        <Separator />

        <div className="space-y-2 p-4 py-0">
          <p>Weight Progress</p>
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p>71kg</p>
              </div>
              <div>
                <p>80kgs</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size={"lg"}>
                Update Weight
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
