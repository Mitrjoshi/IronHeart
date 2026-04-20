import { Header } from "@/components/Header";
import { useExercisesBySchedule } from "@/hooks/store/excercise";
import { useScheduleById } from "@/hooks/store/schedules";
import { useFinishWorkout, useStartWorkout } from "@/hooks/store/workouts";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Minus, Plus, SquareArrowRightExit } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  useClearSession,
  useLoadSession,
  useSaveSession,
} from "@/hooks/store/activeSession";

export const Route = createFileRoute("/schedule/$scheduleId/start")({
  component: RouteComponent,
});

type SetEntry = { reps: string; weight: string; duration: string };
type ExerciseSets = Record<string, SetEntry[]>;
const emptySet = (): SetEntry => ({ reps: "", weight: "", duration: "" });

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

function Countdown({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "#0e0e0e" }}
    >
      <p
        className="mb-4 text-sm font-semibold tracking-widest uppercase"
        style={{ color: S.muted }}
      >
        Get Ready
      </p>
      <p
        key={count}
        className="animate-ping-once leading-none font-black"
        style={{ fontSize: "50vw", color: S.amber, animationDuration: "0.8s" }}
      >
        {count}
      </p>
    </div>
  );
}

/* Exit dialog — no shadcn */
function ExitDialog({
  onSave,
  onDiscard,
}: {
  onSave: () => void;
  onDiscard: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
        style={{ background: S.redSurface, color: S.red }}
      >
        <SquareArrowRightExit size={15} /> Exit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setOpen(false)}
          />
          <div
            className="relative z-10 w-full space-y-3 p-5"
            style={{ ...S.card, borderRadius: 20 }}
          >
            <p className="text-base font-semibold">Exit Workout?</p>
            <p className="text-sm" style={{ color: S.muted }}>
              Your progress will be saved and you can continue later.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setOpen(false);
                  onSave();
                }}
                className="w-full rounded-xl py-2.5 text-sm font-semibold"
                style={{ background: S.surface, color: "#f5f5f5" }}
              >
                Save & Exit
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDiscard();
                }}
                className="w-full rounded-xl py-2.5 text-sm font-semibold"
                style={{ background: S.redSurface, color: S.red }}
              >
                Discard Workout
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-xl py-2.5 text-sm"
                style={{ color: S.muted }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RouteComponent() {
  const router = useRouter();
  const scheduleId = Route.useParams().scheduleId;
  const scheduleData = useScheduleById(scheduleId);
  const exercises = useExercisesBySchedule(scheduleId);

  const startWorkout = useStartWorkout();
  const finishWorkout = useFinishWorkout();
  const saveSession = useSaveSession();
  const clearSession = useClearSession();
  const savedSession = useLoadSession(scheduleId);
  const isResuming = !!savedSession;

  const [countdown, setCountdown] = useState(!isResuming);
  const [time, setTime] = useState(savedSession?.elapsedTime ?? 0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const workoutIdRef = useRef<string | null>(savedSession?.workoutId ?? null);
  const [exerciseSets, setExerciseSets] = useState<ExerciseSets>(
    savedSession?.exerciseSets ?? {},
  );

  useEffect(() => {
    if (!exercises.length) return;
    if (isResuming) {
      setExerciseSets((prev) => {
        const patch: ExerciseSets = {};
        for (const ex of exercises) {
          if (!prev[ex.id])
            patch[ex.id] = Array.from(
              { length: ex.numberOfSets || 1 },
              emptySet,
            );
        }
        return Object.keys(patch).length ? { ...prev, ...patch } : prev;
      });
      return;
    }
    setExerciseSets(
      Object.fromEntries(
        exercises.map((ex) => [
          ex.id,
          ex.lastWorkoutSets?.length
            ? ex.lastWorkoutSets.map((s) => ({
                reps: String(s.reps),
                weight: String(s.weight),
                duration: String(s.duration ?? 0),
              }))
            : Array.from({ length: ex.numberOfSets || 1 }, emptySet),
        ]),
      ),
    );
  }, [exercises.length]);

  const tick = () => {
    if (startRef.current !== null) {
      setTime(performance.now() - startRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  const start = (fromTime = 0) => {
    startRef.current = performance.now() - fromTime;
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (isResuming) start(savedSession.elapsedTime);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const updateSet = (
    exerciseId: string,
    i: number,
    field: keyof SetEntry,
    value: string,
  ) =>
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] ?? []).map((s, idx) =>
        idx === i ? { ...s, [field]: value } : s,
      ),
    }));

  const addSet = (exerciseId: string) =>
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] ?? []), emptySet()],
    }));

  const removeSet = (exerciseId: string, i: number) =>
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] ?? []).filter((_, idx) => idx !== i),
    }));

  const handleCountdownComplete = () => {
    setCountdown(false);
    workoutIdRef.current = startWorkout(scheduleId);
    start();
  };

  const handleFinish = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!workoutIdRef.current) return;
    finishWorkout(
      workoutIdRef.current,
      Math.floor(time / 1000),
      exercises.flatMap((ex) =>
        (exerciseSets[ex.id] ?? []).map((s, i) => ({
          exerciseId: ex.id,
          reps: Number(s.reps) || 0,
          weight: Number(s.weight) || 0,
          duration: Number(s.duration) || 0,
          order: i + 1,
        })),
      ),
    );
    clearSession(scheduleId);
    router.history.back();
  };

  const handleExit = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (workoutIdRef.current)
      saveSession(scheduleId, workoutIdRef.current, time, exerciseSets);
    router.history.back();
  };

  const handleDiscard = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    clearSession(scheduleId);
    router.history.back();
  };

  const pad = (n: number) => n.toString().padStart(2, "0");
  const sec = Math.floor((time / 1000) % 60);
  const min = Math.floor((time / (1000 * 60)) % 60);
  const hr = Math.floor(time / (1000 * 60 * 60));

  return (
    <div style={S.page} className="min-h-screen">
      {countdown && <Countdown onComplete={handleCountdownComplete} />}

      <Header
        showBack
        title={scheduleData?.name}
        subtitle={isResuming ? "Resuming Workout" : "Start your Workout"}
        right={<ExitDialog onSave={handleExit} onDiscard={handleDiscard} />}
      />

      {/* Sticky timer */}
      <div className="sticky top-[61px] z-9 px-4 py-3" style={S.sticky}>
        <div style={S.card} className="space-y-3 p-4">
          <p
            className="leading-none font-black tabular-nums"
            style={{ fontSize: "18vw", color: S.amber }}
          >
            {pad(hr)}:{pad(min)}:{pad(sec)}
          </p>
          <button
            onClick={handleFinish}
            className="w-full rounded-xl py-2.5 text-sm font-semibold transition-opacity active:opacity-80"
            style={{ background: S.amber, color: "#0e0e0e" }}
          >
            Finish Workout
          </button>
        </div>
      </div>

      {/* Exercise cards */}
      <div className="space-y-3 px-4 pt-18 pb-4">
        {exercises.map((exercise) => (
          <div key={exercise.id} style={S.card} className="space-y-3 p-4">
            {/* Exercise header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{exercise.name}</p>
                <p className="mt-0.5 text-xs" style={{ color: S.muted }}>
                  {exerciseSets[exercise.id]?.length ?? 0} sets
                  <span style={{ color: S.mutedDark }}> · </span>
                  <span className="capitalize">{exercise.type}</span>
                </p>
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-2">
              {(exerciseSets[exercise.id] ?? []).map((set, i) => (
                <div key={i} className="flex w-full min-w-0 items-center gap-2">
                  <p
                    className="w-6 shrink-0 text-center text-xs"
                    style={{ color: S.mutedDark }}
                  >
                    {i + 1}
                  </p>
                  {exercise.type === "weighted" && (
                    <>
                      <SmallInput
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(v) => updateSet(exercise.id, i, "reps", v)}
                      />
                      <SmallInput
                        placeholder="kg"
                        value={set.weight}
                        onChange={(v) => updateSet(exercise.id, i, "weight", v)}
                      />
                    </>
                  )}
                  {exercise.type === "duration" && (
                    <SmallInput
                      placeholder="Duration (sec)"
                      value={set.duration}
                      onChange={(v) => updateSet(exercise.id, i, "duration", v)}
                    />
                  )}
                  {exercise.type === "bodyweight" && (
                    <SmallInput
                      placeholder="Reps"
                      value={set.reps}
                      onChange={(v) => updateSet(exercise.id, i, "reps", v)}
                    />
                  )}
                  <button
                    disabled={(exerciseSets[exercise.id]?.length ?? 0) === 1}
                    onClick={() => removeSet(exercise.id, i)}
                    className="shrink-0 rounded-lg p-2 transition-colors disabled:opacity-30"
                    style={{ background: S.surface, color: S.muted }}
                  >
                    <Minus size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add set */}
            <button
              onClick={() => addSet(exercise.id)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-sm transition-colors"
              style={{ background: S.surface, color: S.muted }}
            >
              <Plus size={14} /> Add Set
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
