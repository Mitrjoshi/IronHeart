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
import { useExercisesBySchedule } from "@/hooks/store/excercise";
import { useScheduleById } from "@/hooks/store/schedules";
import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, SquareArrowRightExit } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/schedule/$scheduleId/start")({
  component: RouteComponent,
});

type SetEntry = { reps: string; weight: string };
type ExerciseSets = Record<string, SetEntry[]>;

function Countdown({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    const timeout = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timeout);
  }, [count]);

  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col items-center justify-center">
      <p className="text-muted-foreground mb-4 text-xl font-medium tracking-widest uppercase">
        Get Ready
      </p>
      <p
        key={count}
        className="animate-ping-once text-[50vw] leading-none font-black"
        style={{ animationDuration: "0.8s" }}
      >
        {count}
      </p>
    </div>
  );
}

function RouteComponent() {
  const scheduleId = Route.useParams().scheduleId;
  const scheduleData = useScheduleById(scheduleId);
  const exercises = useExercisesBySchedule(scheduleId);

  const [countdown, setCountdown] = useState(true);
  const [time, setTime] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const [exerciseSets, setExerciseSets] = useState<ExerciseSets>({});

  useEffect(() => {
    if (!exercises.length) return;
    setExerciseSets(
      Object.fromEntries(
        exercises.map((ex) => [
          ex.id,
          Array.from({ length: ex.numberOfSets }, () => ({
            reps: "",
            weight: "",
          })),
        ]),
      ),
    );
  }, [exercises.length]);

  const updateSet = (
    exerciseId: string,
    index: number,
    field: keyof SetEntry,
    value: string,
  ) => {
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, i) =>
        i === index ? { ...set, [field]: value } : set,
      ),
    }));
  };

  const addSet = (exerciseId: string) => {
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: [...prev[exerciseId], { reps: "", weight: "" }],
    }));
  };

  const removeSet = (exerciseId: string, index: number) => {
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].filter((_, i) => i !== index),
    }));
  };

  const update = () => {
    if (startRef.current !== null) {
      setTime(performance.now() - startRef.current);
      rafRef.current = requestAnimationFrame(update);
    }
  };

  const start = () => {
    startRef.current = performance.now() - time;
    rafRef.current = requestAnimationFrame(update);
  };

  const pause = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  const handleCountdownComplete = () => {
    setCountdown(false);
    start();
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const sec = Math.floor((time / 1000) % 60);
  const min = Math.floor((time / (1000 * 60)) % 60);
  const hr = Math.floor(time / (1000 * 60 * 60));
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <>
      {countdown && <Countdown onComplete={handleCountdownComplete} />}

      <Header
        right={
          <Button variant="destructive">
            <SquareArrowRightExit />
            Exit
          </Button>
        }
        title={scheduleData?.name}
        subtitle="Start your Workout"
        showBack
      />

      <div className="bg-background sticky top-0 z-5 p-4 pt-20">
        <Card>
          <CardContent>
            <p className="text-[18vw]">
              {pad(hr)}:{pad(min)}:{pad(sec)}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={pause} size="lg" className="w-full">
              <p>Finish Workout</p>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-2 p-4 py-0 pb-4">
        <div className="flex flex-col space-y-2">
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <p>{exercise.name}</p>
                  <CardDescription>
                    <p className="text-sm">
                      {exerciseSets[exercise.id]?.length ?? 0} sets
                    </p>
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex-col space-y-2">
                {(exerciseSets[exercise.id] ?? []).map((set, index) => (
                  <div key={index} className="flex w-full items-center gap-2">
                    <Input
                      placeholder="Reps"
                      type="number"
                      value={set.reps}
                      onChange={(e) =>
                        updateSet(exercise.id, index, "reps", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Weight (kg)"
                      type="number"
                      value={set.weight}
                      onChange={(e) =>
                        updateSet(exercise.id, index, "weight", e.target.value)
                      }
                    />
                    <Button
                      disabled={(exerciseSets[exercise.id]?.length ?? 0) === 1}
                      onClick={() => removeSet(exercise.id, index)}
                      variant="outline"
                      size="icon"
                    >
                      <Minus className="text-muted-foreground" size={16} />
                    </Button>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => addSet(exercise.id)}
                >
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
