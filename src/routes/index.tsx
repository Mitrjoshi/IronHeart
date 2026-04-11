import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAllSchedules, useSchedulesToday } from "@/hooks/store/schedules";
import { capitalize } from "@/utils";
import { WeeklyGraph } from "@/components/WeeklyGraph";
export const description = "A bar chart";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  const schedules = useAllSchedules();
  const todaySchedules = useSchedulesToday();

  return (
    <>
      <Header title="Home" subtitle="Workout Tracker" />

      <div className="space-y-4 pt-20 pb-4">
        <div className="space-y-2 p-4 py-0">
          <p className="text-muted-foreground">Weekly Progress</p>
          <Card>
            <CardContent>
              <WeeklyGraph />

              {/* <p className="text-muted-foreground text-center">
                Track your weekly progress to see how you're progressing towards
                your fitness goals. Check your workout history, see how many
                workouts you've completed, and track your progress over time.
              </p> */}
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="space-y-2 p-4 py-0">
          <p className="text-muted-foreground">Start Today's Workout</p>
          <Card>
            {todaySchedules.length > 0 ? (
              <>
                <CardHeader>
                  <p className="text-lg font-bold">{todaySchedules[0]?.name}</p>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Bench Press, Incline Dumbbell Press, Chest Flyes, Push-ups.
                  </CardDescription>
                  <CardDescription>
                    4 exercises - 20 sets - 200 reps)
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => {
                      navigate({
                        to: "/schedule/$scheduleId/start",
                        params: {
                          scheduleId: todaySchedules[0].id,
                        },
                      });
                    }}
                    className="w-full"
                    size={"lg"}
                  >
                    Start Workout
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-center">
                    No workout scheduled for today. Please check your workout
                    schedule and add a workout for today.
                  </p>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => navigate({ to: "/schedule/create" })}
                  >
                    <p>Create Schedule</p>
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        <Separator />

        <div className="space-y-2 p-4 py-0">
          <p className="text-muted-foreground">Workout Schedule</p>
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
                      <p>
                        {capitalize(split.day)} - {split.name}
                      </p>
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

          {schedules.length === 0 ? (
            <Card>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center">
                  You don't have any workout schedules yet. Click the button
                  below
                </p>

                <Button
                  onClick={() => {
                    navigate({
                      to: "/schedule/create",
                    });
                  }}
                  size="lg"
                  className="w-full cursor-pointer"
                >
                  Create Schedule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={() => {
                navigate({
                  to: "/schedule",
                });
              }}
              size="lg"
              className="w-full cursor-pointer"
            >
              Edit Schedule
            </Button>
          )}
        </div>

        <Separator />

        <div className="space-y-2 p-4 py-0">
          <p className="text-muted-foreground">Weight Progress</p>
          {/* <Card>
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
          </Card> */}

          <Card>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                Track your weight progress to see how you're progressing towards
                your
              </p>

              <Button className="w-full" size="lg">
                <p>Add Weight</p>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
