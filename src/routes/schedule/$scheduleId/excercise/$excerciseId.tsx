import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  useDeleteExercise,
  useExerciseById,
  useUpdateExercise,
  type ExerciseType,
} from "@/hooks/store/excercise";
import { useScheduleById } from "@/hooks/store/schedules";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Minus, Plus, Trash } from "lucide-react";
import React from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute(
  "/schedule/$scheduleId/excercise/$excerciseId",
)({
  component: RouteComponent,
});

type Set = {
  id?: string;
  reps: string;
  weight: string;
  duration: string;
};

const emptySet = (): Set => ({ reps: "", weight: "", duration: "" });

function RouteComponent() {
  const router = useRouter();

  const scheduleId = Route.useParams().scheduleId;
  const excerciseId = Route.useParams().excerciseId;

  const scheduleData = useScheduleById(scheduleId);
  const excerciseData = useExerciseById(excerciseId);

  const deleteWorkout = useDeleteExercise();
  const updateExercise = useUpdateExercise();

  const exerciseType = (excerciseData?.type ?? "weighted") as ExerciseType;

  const [sets, setSets] = React.useState<Set[]>(
    () =>
      excerciseData?.sets.map((s) => ({
        id: s.id,
        reps: String(s.reps),
        weight: String(s.weight),
        duration: String(s.duration ?? 0),
      })) ?? [emptySet()],
  );

  if (!excerciseData) return null;

  const updateSet = (index: number, field: keyof Set, value: string) => {
    setSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set)),
    );
  };

  const addSet = () => setSets((prev) => [...prev, emptySet()]);

  const removeSet = (index: number) =>
    setSets((prev) => prev.filter((_, i) => i !== index));

  const handleUpdate = () => {
    updateExercise(
      excerciseId,
      excerciseData.name,
      sets.map((s) => ({
        id: s.id,
        reps: Number(s.reps) || 0,
        weight: Number(s.weight) || 0,
        duration: Number(s.duration) || 0,
      })),
    );
    router.history.back();
  };

  return (
    <>
      <Header
        showBack
        title={excerciseData.name}
        subtitle={scheduleData?.name}
        right={
          <Button
            onClick={() => {
              deleteWorkout(excerciseId);
              router.history.back();
            }}
            variant="destructive"
            size="icon"
          >
            <Trash />
          </Button>
        }
      />

      <div className="space-y-4 p-4 pt-20">
        <Card>
          <CardContent className="space-y-4">
            {/* <div className="flex gap-2">
              {(["weighted", "duration", "bodyweight"] as ExerciseType[]).map(
                (t) => (
                  <Button
                    key={t}
                    size="sm"
                    disabled
                    variant={exerciseType === t ? "default" : "outline"}
                  >
                    {capitalize(t)}
                  </Button>
                ),
              )}
            </div> */}

            <div className="space-y-2">
              {sets.map((set, index) => (
                <div key={index} className="flex w-full items-center gap-2">
                  {exerciseType === "weighted" && (
                    <>
                      <Input
                        placeholder="Reps"
                        type="number"
                        value={set.reps}
                        onChange={(e) =>
                          updateSet(index, "reps", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Weight (kg)"
                        type="number"
                        value={set.weight}
                        onChange={(e) =>
                          updateSet(index, "weight", e.target.value)
                        }
                      />
                    </>
                  )}
                  {exerciseType === "duration" && (
                    <Input
                      placeholder="Duration (sec)"
                      type="number"
                      value={set.duration}
                      onChange={(e) =>
                        updateSet(index, "duration", e.target.value)
                      }
                    />
                  )}
                  {exerciseType === "bodyweight" && (
                    <Input
                      placeholder="Reps"
                      type="number"
                      value={set.reps}
                      onChange={(e) => updateSet(index, "reps", e.target.value)}
                    />
                  )}
                  <Button
                    disabled={sets.length === 1}
                    onClick={() => removeSet(index)}
                    variant="outline"
                    size="icon"
                  >
                    <Minus className="text-muted-foreground" size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>

          <Separator />

          <CardContent>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={addSet}
            >
              <Plus size={16} />
              <p>Add Set</p>
            </Button>
          </CardContent>

          <CardFooter>
            <Button onClick={handleUpdate} size="lg" className="w-full">
              <p>Update</p>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
