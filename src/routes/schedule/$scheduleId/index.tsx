import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { useExercisesBySchedule } from "@/hooks/store/excercise";
import { useDeleteSchedule, useScheduleById } from "@/hooks/store/schedules";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Play, Plus, Trash } from "lucide-react";

export const Route = createFileRoute("/schedule/$scheduleId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const router = useRouter();

  const scheduleId = Route.useParams().scheduleId;
  const scheduleData = useScheduleById(scheduleId);

  const deleteSchedule = useDeleteSchedule();
  const excercises = useExercisesBySchedule(scheduleId);

  return (
    <>
      <Header
        right={
          <div className="flex items-center gap-2">
            <Link to="/schedule/$scheduleId/start" params={{ scheduleId }}>
              <Button>
                <Play size={16} />
                <p>Start</p>
              </Button>
            </Link>

            <Button
              onClick={() => {
                deleteSchedule(scheduleId);
                router.history.back();
              }}
              variant="destructive"
              size="icon"
            >
              <Trash size={16} />
            </Button>
          </div>
        }
        showBack
        title={scheduleData?.name}
        subtitle="Workout Tracker"
      />

      <div className="space-y-4 pt-20 pb-18">
        <div className="space-y-2 p-4 py-0">
          <div className="flex flex-col space-y-2">
            {excercises.map((split) => (
              <Link
                className="cursor-pointer"
                key={split.id}
                to="/schedule/$scheduleId/excercise/$excerciseId"
                params={{
                  scheduleId: scheduleId,
                  excerciseId: split.id,
                }}
              >
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <div>
                      <p>{split.name}</p>
                      <CardDescription className="flex items-center gap-1">
                        <p className="text-sm">{split.numberOfSets} Sets</p>
                        <span className="bg-muted-foreground aspect-square h-1 rounded-full" />
                        <p>{split.totalReps} Reps</p>
                        <span className="bg-muted-foreground aspect-square h-1 rounded-full" />
                        <p>{split.maxWeight} kg</p>
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Button
          onClick={() => {
            navigate({
              to: "/schedule/$scheduleId/excercise",
              params: {
                scheduleId: scheduleId,
              },
            });
          }}
          className="fixed right-4 bottom-4 z-10 size-16 cursor-pointer rounded-full shadow-2xl shadow-black"
          size="icon-lg"
        >
          <Plus className="size-10" />
        </Button>
      </div>
    </>
  );
}
