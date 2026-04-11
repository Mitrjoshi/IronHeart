import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { Minus, Play, Plus } from "lucide-react";

export const Route = createFileRoute("/schedule/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  return (
    <>
      <Header
        right={
          <Button>
            <Play size={16} />
            <p>Start</p>
          </Button>
        }
        showBack
        title="Chest"
        subtitle="Workout Tracker"
      />

      <div className="space-y-4 pt-20 pb-18">
        <div className="space-y-2 p-4 py-0">
          <div className="flex flex-col space-y-2">
            {[
              "Barbell Bench Press",
              "Incline Dumbbell Press",
              "Cable Flyes",
              "Push-ups",
              "Tricep Dips",
            ].map((split) => (
              <Card>
                <CardHeader className="flex items-center justify-between">
                  <div>
                    <p>{split}</p>
                    <CardDescription>
                      <p className="text-sm">4 sets</p>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-col space-y-2">
                  <div className="flex w-full items-center gap-2">
                    <Input placeholder="Reps" />
                    <Input placeholder="Weight (kg)" />
                    <Button variant="outline" size="icon">
                      <Minus className="text-muted-foreground" size={16} />
                    </Button>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Input placeholder="Reps" />
                    <Input placeholder="Weight (kg)" />
                    <Button variant="outline" size="icon">
                      <Minus className="text-muted-foreground" size={16} />
                    </Button>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Input placeholder="Reps" />
                    <Input placeholder="Weight (kg)" />
                    <Button variant="outline" size="icon">
                      <Minus className="text-muted-foreground" size={16} />
                    </Button>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <Input placeholder="Reps" />
                    <Input placeholder="Weight (kg)" />
                    <Button variant="outline" size="icon">
                      <Minus className="text-muted-foreground" size={16} />
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="lg" className="w-full">
                    <Plus size={16} />
                    <p>Add Set</p>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <Button
          onClick={() => {
            navigate({
              to: "/schedule/$id/excercise",
              params: {
                id: "chest",
              },
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
