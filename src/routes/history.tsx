import { Header } from "@/components/Header";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useWorkoutHistory } from "@/hooks/store/workouts";
import { formatDuration, formatVolume } from "@/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
  component: RouteComponent,
});

function RouteComponent() {
  const workoutHistory = useWorkoutHistory();

  return (
    <>
      <Header
        showBack
        title="Workout History"
        subtitle="Your past workouts and progress"
      />

      <div className="space-y-4 pt-20 pb-4">
        <div className="space-y-2 p-4 py-0">
          {workoutHistory.map((workout, index) => (
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
          ))}
        </div>
      </div>
    </>
  );
}
