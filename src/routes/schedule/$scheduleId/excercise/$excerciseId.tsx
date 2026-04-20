import { Header } from "@/components/Header";
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

export const Route = createFileRoute(
  "/schedule/$scheduleId/excercise/$excerciseId",
)({
  component: RouteComponent,
});

type Set = { id?: string; reps: string; weight: string; duration: string };
const emptySet = (): Set => ({ reps: "", weight: "", duration: "" });

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5" },
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
  red: "#ef4444",
  redSurface: "#2a1515",
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

  const updateSet = (i: number, field: keyof Set, value: string) =>
    setSets((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    );

  const addSet = () => setSets((prev) => [...prev, emptySet()]);
  const removeSet = (i: number) =>
    setSets((prev) => prev.filter((_, idx) => idx !== i));

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
    <div style={S.page} className="min-h-screen">
      <Header
        showBack
        title={excerciseData.name}
        subtitle={scheduleData?.name}
        right={
          <button
            onClick={() => {
              deleteWorkout(excerciseId);
              router.history.back();
            }}
            className="rounded-xl p-2 transition-colors"
            style={{ background: S.redSurface, color: S.red }}
          >
            <Trash size={16} />
          </button>
        }
      />

      <div className="space-y-3 px-4 pt-20 pb-8">
        <div style={S.card} className="space-y-3 p-4">
          {/* Type badge (read-only) */}
          <div>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-medium capitalize"
              style={{ background: S.surface, color: S.muted }}
            >
              {exerciseType}
            </span>
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

          {/* Add set + Update */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={addSet}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm transition-colors"
              style={{ background: S.surface, color: S.muted }}
            >
              <Plus size={14} /> Add Set
            </button>
            <button
              onClick={handleUpdate}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity active:opacity-80"
              style={{ background: S.amber, color: "#0e0e0e" }}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
