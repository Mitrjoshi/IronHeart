import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAddExercise } from "@/hooks/store/excercise";
import { useScheduleById } from "@/hooks/store/schedules";
import { capitalize } from "@/utils";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Minus, Plus } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/schedule/$scheduleId/excercise/")({
  component: RouteComponent,
});

type ExerciseType = "weighted" | "duration" | "bodyweight";

type Set = {
  reps: string;
  weight: string;
  duration: string;
};

function RouteComponent() {
  const scheduleId = Route.useParams().scheduleId;
  const scheduleData = useScheduleById(scheduleId);

  const addExercise = useAddExercise();
  const router = useRouter();

  const [exerciseName, setExerciseName] = React.useState("");
  const [exerciseType, setExerciseType] =
    React.useState<ExerciseType>("weighted");
  const [sets, setSets] = React.useState<Set[]>([
    { reps: "", weight: "", duration: "" },
  ]);

  const updateSet = (index: number, field: keyof Set, value: string) => {
    setSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set)),
    );
  };

  const addSet = () =>
    setSets((prev) => [...prev, { reps: "", weight: "", duration: "" }]);

  const removeSet = (index: number) =>
    setSets((prev) => prev.filter((_, i) => i !== index));

  const handleTypeChange = (type: ExerciseType) => {
    setExerciseType(type);
    setSets([{ reps: "", weight: "", duration: "" }]);
  };

  const handleCreateExercise = () => {
    if (!exerciseName.trim()) {
      toast("Exercise name cannot be empty");
      return;
    }

    addExercise(
      exerciseName,
      scheduleId,
      exerciseType,
      sets.map((s) => ({
        reps: Number(s.reps) || 0,
        weight: Number(s.weight) || 0,
        duration: Number(s.duration) || 0,
      })),
    );
    router.history.back();
  };

  return (
    <>
      <Header showBack title="Add Exercise" subtitle={scheduleData?.name} />

      <div className="space-y-4 p-4 pt-20 pb-4">
        <Card>
          <CardHeader>
            <Input
              placeholder="Exercise Name"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
          </CardHeader>

          <Separator />

          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {(["weighted", "duration", "bodyweight"] as ExerciseType[]).map(
                (t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={exerciseType === t ? "default" : "outline"}
                    onClick={() => handleTypeChange(t)}
                  >
                    {capitalize(t)}
                  </Button>
                ),
              )}
            </div>

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
            <Button onClick={handleCreateExercise} size="lg" className="w-full">
              <p>Create & Save</p>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
