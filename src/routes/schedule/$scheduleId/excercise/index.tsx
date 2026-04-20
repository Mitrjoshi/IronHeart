import { Header } from "@/components/Header";
import { Exercises } from "@/constants/excercises";
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
type Set = { reps: string; weight: string; duration: string };

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5" },
  sticky: { background: "#0e0e0e", borderBottom: "1px solid #1f1f1f" },
  card: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 16,
  },
  input: {
    background: "#111111",
    border: "1px solid #262626",
    color: "#f5f5f5",
    borderRadius: 10,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  surface: "#1f1f1f",
};

function SmallInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-w-0 px-3 py-2 text-sm transition-colors outline-none placeholder:text-[#404040] focus:border-amber-500"
      style={S.input}
    />
  );
}

function RouteComponent() {
  const scheduleId = Route.useParams().scheduleId;
  const scheduleData = useScheduleById(scheduleId);
  const addExercise = useAddExercise();
  const router = useRouter();

  const [muscleGroup, setMuscleGroup] =
    React.useState<keyof typeof Exercises>("chest");
  const [exerciseName, setExerciseName] = React.useState("");
  const [exerciseType, setExerciseType] =
    React.useState<ExerciseType>("weighted");
  const [sets, setSets] = React.useState<Set[]>([
    { reps: "", weight: "", duration: "" },
  ]);

  const updateSet = (i: number, field: keyof Set, value: string) =>
    setSets((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    );

  const addSet = () =>
    setSets((prev) => [...prev, { reps: "", weight: "", duration: "" }]);
  const removeSet = (i: number) =>
    setSets((prev) => prev.filter((_, idx) => idx !== i));

  const handleTypeChange = (type: ExerciseType) => {
    setExerciseType(type);
    setSets([{ reps: "", weight: "", duration: "" }]);
  };

  const handleCreate = () => {
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
    <div style={S.page} className="min-h-screen">
      <Header showBack title="Add Exercise" subtitle={scheduleData?.name} />

      {/* Sticky form */}
      <div className="z-10 mt-20 space-y-3 px-4 pb-4" style={S.sticky}>
        <div style={S.card} className="space-y-3 p-4">
          {/* Name */}
          <input
            placeholder="Exercise name"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm transition-colors outline-none placeholder:text-[#404040] focus:border-amber-500"
            style={S.input}
          />

          {/* Type pills */}
          <div className="flex gap-2">
            {(["weighted", "duration", "bodyweight"] as ExerciseType[]).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                  style={
                    exerciseType === t
                      ? { background: S.amber, color: "#0e0e0e" }
                      : {
                          background: S.surface,
                          color: S.muted,
                          border: "1px solid #262626",
                        }
                  }
                >
                  {capitalize(t)}
                </button>
              ),
            )}
          </div>

          {/* Sets */}
          <div className="space-y-2">
            {sets.map((set, i) => (
              <div key={i} className="flex w-full min-w-0 items-center gap-2">
                <p
                  className="w-6 shrink-0 text-center text-xs"
                  style={{ color: S.mutedDark }}
                >
                  {i + 1}
                </p>
                {exerciseType === "weighted" && (
                  <>
                    <SmallInput
                      placeholder="Reps"
                      value={set.reps}
                      onChange={(v) => updateSet(i, "reps", v)}
                    />
                    <SmallInput
                      placeholder="kg"
                      value={set.weight}
                      onChange={(v) => updateSet(i, "weight", v)}
                    />
                  </>
                )}
                {exerciseType === "duration" && (
                  <SmallInput
                    placeholder="Duration (sec)"
                    value={set.duration}
                    onChange={(v) => updateSet(i, "duration", v)}
                  />
                )}
                {exerciseType === "bodyweight" && (
                  <SmallInput
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(v) => updateSet(i, "reps", v)}
                  />
                )}
                <button
                  disabled={sets.length === 1}
                  onClick={() => removeSet(i)}
                  className="shrink-0 rounded-lg p-2 transition-colors disabled:opacity-30"
                  style={{ background: S.surface, color: S.muted }}
                >
                  <Minus size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add set + Save */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={addSet}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm transition-colors"
              style={{ background: S.surface, color: S.muted }}
            >
              <Plus size={14} /> Add Set
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity active:opacity-80"
              style={{ background: S.amber, color: "#0e0e0e" }}
            >
              Create & Save
            </button>
          </div>
        </div>
      </div>

      {/* Exercise library */}
      <div className="space-y-3 px-4 pt-3 pb-8">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: S.muted }}
        >
          Exercise Library
        </p>

        {/* Muscle group pills */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(Exercises).map((group) => (
            <button
              key={group}
              onClick={() => setMuscleGroup(group as keyof typeof Exercises)}
              className="rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors"
              style={
                muscleGroup === group
                  ? { background: S.amber, color: "#0e0e0e" }
                  : {
                      background: S.surface,
                      color: S.muted,
                      border: "1px solid #262626",
                    }
              }
            >
              {group}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="space-y-2">
          {Exercises[muscleGroup].map((exercise) => (
            <div
              key={exercise.name}
              style={S.card}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{exercise.name}</p>
                <p
                  className="mt-0.5 text-xs capitalize"
                  style={{ color: S.muted }}
                >
                  {exercise.type}
                </p>
              </div>
              <button
                onClick={() => {
                  setExerciseName(exercise.name);
                  setExerciseType(exercise.type as ExerciseType);
                }}
                className="rounded-xl p-2 transition-colors"
                style={{ background: S.surface, color: S.amber }}
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
