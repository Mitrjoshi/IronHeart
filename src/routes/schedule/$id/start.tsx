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
import { useScheduleById } from "@/hooks/store";
import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, SquareArrowRightExit } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/schedule/$id/start")({
  component: RouteComponent,
});

function RouteComponent() {
  const [time, setTime] = useState(0); // milliseconds
  const [running, setRunning] = useState(false);

  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const scheduleData = useScheduleById(Route.useParams().id);

  const update = () => {
    if (startRef.current !== null) {
      // eslint-disable-next-line react-hooks/purity
      const now = performance.now();
      setTime(now - startRef.current);
      rafRef.current = requestAnimationFrame(update);
    }
  };

  const start = () => {
    if (!running) {
      startRef.current = performance.now() - time;
      setRunning(true);
      rafRef.current = requestAnimationFrame(update);
    }
  };

  const pause = () => {
    setRunning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  // const reset = () => {
  //   pause();
  //   setTime(0);
  //   startRef.current = null;
  // };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // format time
  const sec = Math.floor((time / 1000) % 60);
  const min = Math.floor((time / (1000 * 60)) % 60);
  const hr = Math.floor(time / (1000 * 60 * 60));

  const pad = (n: number, z = 2) => n.toString().padStart(z, "0");

  useEffect(() => {
    start();
  }, []);

  return (
    <>
      <Header
        right={
          <Button variant={"destructive"}>
            <SquareArrowRightExit />
            Exit
          </Button>
        }
        title={scheduleData?.name}
        subtitle="Start your Workout"
        showBack
      />

      <div className="bg-background sticky top-0 z-5 p-4 pt-20">
        <Card className="">
          <CardContent>
            <p className="text-[18vw]">
              {pad(hr)}:{pad(min)}:{pad(sec)}
            </p>
          </CardContent>

          <CardFooter>
            <Button onClick={pause} size={"lg"} className="w-full">
              <p>Finish Workout</p>
            </Button>
          </CardFooter>
        </Card>
      </div>

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
    </>
  );
}
