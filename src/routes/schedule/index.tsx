import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { Pen, Play, Plus, Timer } from "lucide-react";

export const Route = createFileRoute("/schedule/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  return (
    <>
      <Header showBack title="Schedule" subtitle="Workout Tracker" />

      <div className="space-y-4 pt-20 pb-18">
        <div className="space-y-2 p-4 py-0">
          <p>Workout Schedule</p>
          <div className="flex flex-col space-y-2">
            {[
              "Monday - Chest",
              "Tuesday - Back",
              "Wednesday - Legs",
              "Thursday - Shoulders",
              "Friday - Arms",
            ].map((split) => (
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <p>{split}</p>
                    <CardDescription>
                      <p className="text-sm">
                        5 exercises - 20 sets - 200 reps
                      </p>
                    </CardDescription>
                  </div>

                  <div className="text-muted-foreground flex items-center gap-1">
                    <p className="text-xs">30m</p>
                    <Timer size={16} />
                  </div>
                </CardHeader>
                <CardFooter className="flex-col space-y-2">
                  <Button
                    onClick={() => {
                      navigate({
                        to: "/schedule/$id/start",
                        params: { id: split.toLowerCase().split(" ")[2] },
                      });
                    }}
                    className="w-full cursor-pointer"
                    size="lg"
                  >
                    <Play size={16} />
                    <p>Start Workout</p>
                  </Button>

                  <Button
                    onClick={() => {
                      navigate({
                        to: "/schedule/$id",
                        params: { id: split.toLowerCase().split(" ")[2] },
                      });
                    }}
                    className="w-full cursor-pointer"
                    size="lg"
                    variant="outline"
                  >
                    <Pen size={16} />
                    <p>Edit Exercises</p>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <Button
          onClick={() => {
            navigate({
              to: "/schedule/create",
            });
          }}
          className="fixed right-4 bottom-4 z-10 size-12 cursor-pointer rounded-full shadow-2xl shadow-black"
          size="icon-lg"
        >
          <Plus className="size-6" />
        </Button>
      </div>
    </>
  );
}
