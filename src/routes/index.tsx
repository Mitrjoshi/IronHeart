import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAllSchedules, useSchedulesToday } from "@/hooks/store/schedules";
import {
  capitalize,
  formatDuration,
  formatElapsedTime,
  formatVolume,
} from "@/utils";
import { WeeklyGraph } from "@/components/WeeklyGraph";
import { useActiveSessions } from "@/hooks/store/activeSession";
import { useWorkoutHistory } from "@/hooks/store/workouts";
import { useDailyTotals, useMealsForDay } from "@/hooks/store/food";
import { ChevronRight, Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import { store } from "@/store/schema";
import { useNutritionTargets } from "@/hooks/store/weight";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: () => {
    const calories = store.getCell("settings", "user", "targetCalories");
    if (!calories) throw redirect({ to: "/onboarding" });
  },
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  const schedules = useAllSchedules();
  const todaySchedules = useSchedulesToday();
  const workoutHistory = useWorkoutHistory();
  const activeSessions = useActiveSessions();
  const TARGETS = useNutritionTargets();

  const totals = useDailyTotals();
  const meals = useMealsForDay();

  return (
    <AppLayout>
      <Header title="Home" subtitle="Workout Tracker" />

      <div className="space-y-4 pt-20 pb-4">
        <div className="space-y-2 p-4 py-0">
          <p className="text-muted-foreground">Weekly Progress</p>
          <Card>
            <CardContent>
              <WeeklyGraph />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate({ to: "/report" })}
                className="w-full"
                size="lg"
              >
                View Detailed Report
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Separator />

        {/* ── Daily nutrition summary ── */}
        <div className="space-y-2 p-4 py-0">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Today's Nutrition</p>
            <Button
              onClick={() =>
                navigate({
                  to: "/food",
                  search: {
                    search: "",
                  },
                })
              }
              variant="link"
              className="text-muted-foreground underline"
              size="sm"
            >
              Add Food
              <Plus size={14} className="ml-1" />
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{totals.calories.toFixed(0)} kcal</CardTitle>
                <p className="text-muted-foreground text-sm">
                  / {TARGETS.calories} kcal
                </p>
              </div>
              <CardDescription>
                {(TARGETS.calories - totals.calories).toFixed(0)} kcal remaining
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {[
                {
                  label: "Protein",
                  value: totals.protein,
                  target: TARGETS.protein,
                  unit: "g",
                  bar: "[&>div]:bg-blue-400",
                  color: "text-blue-400",
                },
                {
                  label: "Carbs",
                  value: totals.carbs,
                  target: TARGETS.carbs,
                  unit: "g",
                  bar: "[&>div]:bg-green-400",
                  color: "text-green-400",
                },
                {
                  label: "Fats",
                  value: totals.fats,
                  target: TARGETS.fats,
                  unit: "g",
                  bar: "[&>div]:bg-orange-400",
                  color: "text-orange-400",
                },
              ].map(({ label, value, target, unit, bar, color }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${color}`}>{label}</span>
                    <span className="text-muted-foreground text-xs">
                      {value.toFixed(1)}
                      {unit} / {target}
                      {unit}
                    </span>
                  </div>
                  <Progress
                    value={Math.min((value / target) * 100, 100)}
                    className={bar}
                  />
                </div>
              ))}
            </CardContent>

            {meals.length > 0 && (
              <CardFooter className="flex flex-col items-start gap-2">
                {meals.map((meal) => (
                  <div key={meal.id} className="w-full">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium capitalize">
                        {meal.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {meal.entries
                          .reduce((sum, e) => sum + e.calories, 0)
                          .toFixed(0)}{" "}
                        kcal
                      </p>
                    </div>
                    {meal.entries.length > 0 && (
                      <p className="text-muted-foreground text-xs">
                        {meal.entries.map((e) => e.foodName).join(", ")}
                      </p>
                    )}
                  </div>
                ))}

                <Separator />

                <Button
                  onClick={() => {
                    navigate({
                      to: "/food/logged",
                    });
                  }}
                  className="w-full"
                  size="lg"
                >
                  View all foods logged
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <Separator />

        {activeSessions.map((session) => (
          <>
            <div className="px-4">
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <p className="font-bold">Resume {session.scheduleName}</p>
                    <p className="text-muted-foreground">
                      {formatElapsedTime(session.elapsedTime)}
                    </p>
                  </div>
                  <CardDescription>
                    {capitalize(session.scheduleDay)}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() =>
                      navigate({
                        to: "/schedule/$scheduleId/start",
                        params: { scheduleId: session.scheduleId },
                      })
                    }
                  >
                    Continue Workout
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <Separator />
          </>
        ))}

        <div className="space-y-2 p-4 py-0">
          <p className="text-muted-foreground">Start Today's Workout</p>
          <Card>
            {todaySchedules.length > 0 ? (
              <>
                <CardHeader>
                  <CardTitle>{todaySchedules[0]?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!todaySchedules[0].isDone && (
                    <CardDescription className="flex items-center gap-1">
                      <span>{todaySchedules[0].exerciseCount} exercises</span>
                      <span className="bg-muted-foreground size-1 rounded-full" />
                      <span>{todaySchedules[0].totalSets} sets</span>
                      {todaySchedules[0].totalReps > 0 && (
                        <>
                          <span className="bg-muted-foreground size-1 rounded-full" />
                          <span>{todaySchedules[0].totalReps} reps</span>
                        </>
                      )}
                      {todaySchedules[0].totalDuration > 0 && (
                        <>
                          <span className="bg-muted-foreground size-1 rounded-full" />
                          <span>
                            {formatDuration(todaySchedules[0].totalDuration)}
                          </span>
                        </>
                      )}
                    </CardDescription>
                  )}
                </CardContent>

                {todaySchedules[0].isDone ? (
                  <CardContent className="flex flex-col items-center gap-1 py-2">
                    <p className="text-4xl">🏆</p>
                    <p className="font-semibold">Crushed it!</p>
                    <p className="text-muted-foreground text-center text-sm">
                      You've completed today's workout. Rest up and come back
                      stronger.
                    </p>
                  </CardContent>
                ) : (
                  <CardFooter>
                    <Button
                      onClick={() =>
                        navigate({
                          to: "/schedule/$scheduleId/start",
                          params: { scheduleId: todaySchedules[0].id },
                        })
                      }
                      className="w-full"
                      size="lg"
                    >
                      Start Workout
                    </Button>
                  </CardFooter>
                )}
              </>
            ) : (
              <>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-center">
                    No workout scheduled for today. Please check your workout
                    schedule and add a workout for today.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => navigate({ to: "/schedule/create" })}
                  >
                    Create Schedule
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        </div>

        <Separator />

        <div className="space-y-2 p-4 py-0">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Workout Schedule</p>
            <Button
              onClick={() => navigate({ to: "/schedule" })}
              variant="link"
              className="text-muted-foreground underline"
              size="sm"
            >
              View All
              <ChevronRight />
            </Button>
          </div>
          <div className="flex flex-col space-y-2">
            {schedules.map((split) => (
              <Link
                key={split.id}
                to="/schedule/$scheduleId"
                className="cursor-pointer"
                params={{ scheduleId: split.id }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {capitalize(split.day)} - {split.name}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        ({split.estimatedMinutes} mins)
                      </p>
                    </div>
                    <CardDescription>{split.exercises}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          {schedules.length === 0 && (
            <Card>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center">
                  You don't have any workout schedules yet. Click the button
                  below
                </p>
                <Button
                  onClick={() => navigate({ to: "/schedule/create" })}
                  size="lg"
                  className="w-full cursor-pointer"
                >
                  Create Schedule
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator />

        <div className="space-y-2 p-4 py-0">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Workout History</p>
            <Button
              onClick={() => navigate({ to: "/history" })}
              variant="link"
              className="text-muted-foreground underline"
              size="sm"
            >
              View All
              <ChevronRight />
            </Button>
          </div>
          <div className="space-y-2">
            {workoutHistory.length > 0 ? (
              workoutHistory.slice(0, 3).map((workout, index) => (
                <Card key={index}>
                  <CardHeader>
                    <p className="flex items-center justify-between">
                      <span>{workout.scheduleName}</span>
                      <span className="text-muted-foreground">
                        {formatDuration(workout.durationSeconds)}
                      </span>
                    </p>
                    <CardDescription>
                      {workout.exercisesDone.length > 0
                        ? workout.exercisesDone
                            .map((exercise) => exercise.name)
                            .join(", ")
                        : "No exercises recorded"}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-around">
                    <p className="text-muted-foreground text-center">
                      {workout.numberOfSets} sets
                    </p>
                    <Separator orientation="vertical" />
                    <p className="text-muted-foreground text-center">
                      {workout.totalReps} reps
                    </p>
                    <Separator orientation="vertical" />
                    <p className="text-muted-foreground text-center">
                      {formatVolume(workout.totalVolume)}
                    </p>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-center">
                    You don't have any workout history yet. Start working out
                    and your workout logs will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
