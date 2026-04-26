import { Header } from "@/components/Header";
import {
  useDeleteExercise,
  useExerciseById,
  useUpdateExercise,
  type ExerciseType,
} from "@/hooks/store/excercise";
import { useScheduleById } from "@/hooks/store/schedules";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Minus, Plus, Trash, Pencil, Check, X } from "lucide-react";
import React from "react";

export const Route = createFileRoute(
  "/schedule/$scheduleId/excercise/$excerciseId",
)({
  component: RouteComponent,
});

type Set = { id?: string; reps: string; weight: string; duration: string };
const emptySet = (): Set => ({ reps: "", weight: "", duration: "" });

const EXERCISE_TYPES: ExerciseType[] = ["weighted", "bodyweight", "duration"];

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
  amberSurface: "#2a1f00",
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
  const deleteExercise = useDeleteExercise();
  const updateExercise = useUpdateExercise();

  const [isEditingMeta, setIsEditingMeta] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editType, setEditType] = React.useState<ExerciseType>("weighted");

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

  const exerciseType = isEditingMeta
    ? editType
    : ((excerciseData?.type ?? "weighted") as ExerciseType);

  const handleStartEdit = () => {
    setEditName(excerciseData.name);
    setEditType((excerciseData.type ?? "weighted") as ExerciseType);
    setIsEditingMeta(true);
  };

  const handleCancelEdit = () => {
    setIsEditingMeta(false);
  };

  const handleConfirmEdit = () => {
    setIsEditingMeta(false);
    // if type changed, reset sets to a single empty set
    if (editType !== excerciseData.type) {
      setSets([emptySet()]);
    }
  };

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
      isEditingMeta ? editName : excerciseData.name,
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
              deleteExercise(excerciseId);
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
        {/* Name + Type card */}
        <div style={S.card} className="p-4">
          {isEditingMeta ? (
            <div className="space-y-3">
              {/* Name input */}
              <div className="space-y-1">
                <p className="text-xs" style={{ color: S.muted }}>
                  Exercise name
                </p>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{ ...S.input, borderRadius: 10 }}
                  placeholder="e.g. Bench Press"
                />
              </div>

              {/* Type selector */}
              <div className="space-y-1">
                <p className="text-xs" style={{ color: S.muted }}>
                  Type
                </p>
                <div className="flex gap-2">
                  {EXERCISE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setEditType(t)}
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
                      {t}
                    </button>
                  ))}
                </div>
                {editType !== excerciseData.type && (
                  <p className="pt-1 text-xs" style={{ color: S.red }}>
                    Changing type will reset current sets
                  </p>
                )}
              </div>

              {/* Confirm / Cancel */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCancelEdit}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm transition-colors"
                  style={{ background: S.surface, color: S.muted }}
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  disabled={!editName.trim()}
                  onClick={handleConfirmEdit}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition-opacity disabled:opacity-40"
                  style={{ background: S.amberSurface, color: S.amber }}
                >
                  <Check size={14} /> Done
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="font-semibold">{excerciseData.name}</p>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                  style={{ background: S.surface, color: S.muted }}
                >
                  {excerciseData.type}
                </span>
              </div>
              <button
                onClick={handleStartEdit}
                className="rounded-xl p-2 transition-colors"
                style={{ background: S.surface, color: S.muted }}
              >
                <Pencil size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Sets card */}
        <div style={S.card} className="space-y-3 p-4">
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
