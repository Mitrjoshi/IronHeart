import { Header } from "@/components/Header";
import {
  useDeleteExercise,
  useExercisesBySchedule,
} from "@/hooks/store/excercise";
import { useScheduleById } from "@/hooks/store/schedules";
import { useFinishWorkout, useStartWorkout } from "@/hooks/store/workouts";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { Check, Minus, Plus, SquareArrowRightExit, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  useClearSession,
  useLoadSession,
  useSaveSession,
} from "@/hooks/store/activeSession";
import { useAllSuggestedSets } from "@/hooks/store/suggestedSets";
import { useBlocker } from "@tanstack/react-router";

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
  amberSoft: "rgba(245, 158, 11, 0.1)",
  amberBorder: "rgba(245, 158, 11, 0.35)",
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
      className="w-full min-w-0 px-3 py-2 text-center text-sm transition-colors outline-none placeholder:text-[#404040] focus:border-amber-500"
      style={S.input}
    />
  );
}

// Small column labels shown above the set rows, varies by exercise type
function SetHeader({ type }: { type: string }) {
  const Label = ({ children }: { children: React.ReactNode }) => (
    <p
      className="w-full text-center text-[10px] font-semibold tracking-wider uppercase"
      style={{ color: S.mutedDark }}
    >
      {children}
    </p>
  );

  return (
    <div className="flex items-center gap-2 px-1">
      <span className="w-6 shrink-0" />
      {type === "weighted" && (
        <>
          <Label>Reps</Label>
          <Label>Kg</Label>
        </>
      )}
      {type === "duration" && <Label>Seconds</Label>}
      {type === "bodyweight" && <Label>Reps</Label>}
      <span className="w-8 shrink-0" />
    </div>
  );
}

function Countdown({ onComplete }: { onComplete: () => void }) {
  // 3 → 2 → 1 → 0(GO) → done
  const [count, setCount] = useState(3);
  const isGo = count === 0;

  useEffect(() => {
    if (count < 0) {
      onComplete();
      return;
    }
    // numbers hold for 1s, the GO flash is a touch quicker
    const t = setTimeout(() => setCount((c) => c - 1), isGo ? 650 : 1000);
    return () => clearTimeout(t);
  }, [count]);

  const R = 140; // ring radius
  const C = 2 * Math.PI * R;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "#0e0e0e" }}
    >
      <style>{`
        @keyframes cd-pop {
          0%   { transform: scale(0.25); opacity: 0; filter: blur(26px); }
          45%  { transform: scale(1.14); opacity: 1; filter: blur(0); }
          62%  { transform: scale(0.95); }
          78%  { transform: scale(1.03); }
          100% { transform: scale(1);   opacity: 1; filter: blur(0); }
        }
        @keyframes cd-shock {
          0%   { transform: scale(0.45); opacity: 0.55; }
          100% { transform: scale(2.6);  opacity: 0; }
        }
        @keyframes cd-ring {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: ${C}; }
        }
        @keyframes cd-spin { to { transform: rotate(360deg); } }
        @keyframes cd-go {
          0%   { transform: scale(0.4);  opacity: 0; letter-spacing: -0.08em; }
          45%  { transform: scale(1.18); opacity: 1; letter-spacing: 0.06em; }
          100% { transform: scale(1.05); opacity: 1; letter-spacing: 0.04em; }
        }
        @keyframes cd-flash {
          0%   { opacity: 0; }
          30%  { opacity: 0.18; }
          100% { opacity: 0; }
        }
        @keyframes cd-label {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* soft radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(245,158,11,0.14), transparent 55%)",
        }}
      />

      {/* GO flash overlay */}
      {isGo && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "#f59e0b",
            animation: "cd-flash 0.65s ease-out",
          }}
        />
      )}

      <div className="relative flex items-center justify-center">
        {/* slow-spinning dashed outer ring */}
        <svg
          width="340"
          height="340"
          viewBox="0 0 340 340"
          className="absolute"
          style={{ animation: "cd-spin 8s linear infinite" }}
        >
          <circle
            cx="170"
            cy="170"
            r="166"
            fill="none"
            stroke="#1f1f1f"
            strokeWidth="2"
            strokeDasharray="2 14"
            strokeLinecap="round"
          />
        </svg>

        {/* per-second depleting progress ring (hidden during GO) */}
        {!isGo && (
          <svg
            width="320"
            height="320"
            viewBox="0 0 320 320"
            className="absolute -rotate-90"
          >
            <circle
              cx="160"
              cy="160"
              r={R}
              fill="none"
              stroke="#1f1f1f"
              strokeWidth="4"
            />
            <circle
              key={count}
              cx="160"
              cy="160"
              r={R}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={C}
              style={{ animation: "cd-ring 1s linear forwards" }}
            />
          </svg>
        )}

        {/* shockwave pulse behind each digit */}
        <div
          key={`shock-${count}`}
          className="absolute h-48 w-48 rounded-full"
          style={{
            border: "2px solid #f59e0b",
            animation: "cd-shock 1s ease-out forwards",
          }}
        />

        {/* the digit / GO */}
        {isGo ? (
          <p
            className="leading-none font-black"
            style={{
              fontSize: "26vw",
              color: "#f59e0b",
              animation: "cd-go 0.5s cubic-bezier(0.22,1,0.36,1) forwards",
            }}
          >
            GO
          </p>
        ) : (
          <p
            key={count}
            className="leading-none font-black tabular-nums"
            style={{
              fontSize: "34vw",
              color: "#f59e0b",
              animation: "cd-pop 1s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}
          >
            {count}
          </p>
        )}
      </div>

      {/* label */}
      <p
        className="absolute bottom-[18%] text-sm font-semibold tracking-[0.3em] uppercase"
        style={{
          color: isGo ? S.amber : S.muted,
          animation: "cd-label 0.5s ease-out",
        }}
      >
        {isGo ? "Let's Go" : "Get Ready"}
      </p>
    </div>
  );
}

function ExitDialog({
  open,
  onSave,
  onDiscard,
  onCancel,
}: {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onCancel}
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
            onClick={onSave}
            className="w-full rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: S.surface, color: "#f5f5f5" }}
          >
            Save & Exit
          </button>
          <button
            onClick={onDiscard}
            className="w-full rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: S.redSurface, color: S.red }}
          >
            Discard Workout
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-xl py-2.5 text-sm"
            style={{ color: S.muted }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  const router = useRouter();
  const navigate = useNavigate();
  const scheduleId = Route.useParams().scheduleId;
  const scheduleData = useScheduleById(scheduleId);
  const exercises = useExercisesBySchedule(scheduleId);

  const startWorkout = useStartWorkout();
  const finishWorkout = useFinishWorkout();
  const saveSession = useSaveSession();
  const clearSession = useClearSession();
  const savedSession = useLoadSession(scheduleId);
  const isResuming = !!savedSession;
  const deleteExercise = useDeleteExercise();

  const [countdown, setCountdown] = useState(!isResuming);
  const [time, setTime] = useState(savedSession?.elapsedTime ?? 0);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const workoutIdRef = useRef<string | null>(savedSession?.workoutId ?? null);
  const hasInitialized = useRef(false);

  const [exerciseSets, setExerciseSets] = useState<ExerciseSets>(
    savedSession?.exerciseSets ?? {},
  );

  const skipBlockerRef = useRef(false);

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => !skipBlockerRef.current,
    enableBeforeUnload: true,
    withResolver: true,
  });

  // suggestions are used only for hints — prefill comes from lastWorkoutSets
  const suggestions = useAllSuggestedSets(exercises);

  useEffect(() => {
    if (status === "blocked") setShowExitDialog(true);
  }, [status]);

  // Block reload / tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!exercises.length) return;

    // Resuming: patch in any new exercises that weren't in the saved session
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
      hasInitialized.current = true;
      return;
    }

    // Already initialized — don't overwrite user edits
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    setExerciseSets(
      Object.fromEntries(
        exercises.map((ex) => {
          // ✅ Use lastWorkoutSets from the exercise directly — same reactive
          // query as useExercisesBySchedule, always in sync, no timing issues
          const lastSets = ex.lastWorkoutSets;

          if (lastSets?.length) {
            return [
              ex.id,
              lastSets.map((s) => ({
                reps: s.reps ? String(s.reps) : "",
                weight: s.weight ? String(s.weight) : "",
                duration: s.duration ? String(s.duration) : "",
              })),
            ];
          }

          // No history — start with empty sets
          return [
            ex.id,
            Array.from({ length: ex.numberOfSets || 1 }, emptySet),
          ];
        }),
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
    skipBlockerRef.current = true;
    router.history.back();
  };

  const handleSaveAndExit = (callback?: () => void) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (workoutIdRef.current)
      saveSession(scheduleId, workoutIdRef.current, time, exerciseSets);
    setShowExitDialog(false);
    proceed?.();
    callback?.();
  };

  // ✅ Add Exercise: save the session and navigate WITHOUT tripping the
  // blocker — skipBlockerRef bypasses shouldBlockFn so no exit dialog appears.
  const handleAddExercise = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (workoutIdRef.current)
      saveSession(scheduleId, workoutIdRef.current, time, exerciseSets);
    skipBlockerRef.current = true;
    navigate({
      to: "/schedule/$scheduleId/excercise",
      params: { scheduleId },
    });
  };

  const handleDiscard = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    clearSession(scheduleId);
    setShowExitDialog(false);
    proceed?.();
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
    reset?.();
  };

  const pad = (n: number) => n.toString().padStart(2, "0");
  const sec = Math.floor((time / 1000) % 60);
  const min = Math.floor((time / (1000 * 60)) % 60);
  const hr = Math.floor(time / (1000 * 60 * 60));

  const totalSets = exercises.reduce(
    (sum, ex) => sum + (exerciseSets[ex.id]?.length ?? 0),
    0,
  );

  return (
    <div style={S.page} className="min-h-screen">
      {countdown && <Countdown onComplete={handleCountdownComplete} />}

      <ExitDialog
        open={showExitDialog}
        onSave={handleSaveAndExit}
        onDiscard={handleDiscard}
        onCancel={handleCancelExit}
      />

      <Header
        showBack
        title={scheduleData?.name}
        subtitle={isResuming ? "Resuming Workout" : "Start your Workout"}
        right={
          <button
            onClick={() => setShowExitDialog(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors"
            style={{ background: S.redSurface, color: S.red }}
          >
            <SquareArrowRightExit size={15} /> Exit
          </button>
        }
      />

      {/* Sticky timer — hero with live pulse + accent rule */}
      <div className="sticky top-[61px] z-9 px-4 py-3" style={S.sticky}>
        <div
          style={{
            ...S.card,
            borderColor: S.amberBorder,
            background:
              "linear-gradient(180deg, rgba(245,158,11,0.05) 0%, #161616 60%)",
          }}
          className="overflow-hidden p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ background: S.amber }}
              />
              <p
                className="text-[11px] font-semibold tracking-widest uppercase"
                style={{ color: S.muted }}
              >
                {isResuming ? "Resumed · Recording" : "Recording"}
              </p>
            </div>
            <p
              className="text-[11px] font-medium"
              style={{ color: S.mutedDark }}
            >
              {exercises.length} exercises · {totalSets} sets
            </p>
          </div>

          <p
            className="mt-1 leading-none font-black tabular-nums"
            style={{ fontSize: "17vw", color: S.amber }}
          >
            {pad(hr)}:{pad(min)}:{pad(sec)}
          </p>

          <button
            onClick={handleFinish}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-opacity active:opacity-80"
            style={{ background: S.amber, color: "#0e0e0e" }}
          >
            <Check size={16} strokeWidth={3} />
            Finish Workout
          </button>
        </div>
      </div>

      {/* Exercise cards */}
      <div className="space-y-3 px-4 pt-20 pb-4">
        {exercises.map((exercise) => (
          <div key={exercise.id} style={S.card} className="space-y-3 p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="truncate font-semibold">{exercise.name}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                    style={{ background: S.amberSoft, color: S.amber }}
                  >
                    {exercise.type}
                  </span>
                  <span className="text-xs" style={{ color: S.muted }}>
                    {exerciseSets[exercise.id]?.length ?? 0} sets
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteExercise(exercise.id)}
                style={{ background: S.redSurface, color: S.red }}
                className="shrink-0 rounded-lg p-2 transition-colors disabled:opacity-30"
              >
                <Trash size={15} />
              </button>
            </div>

            {(exerciseSets[exercise.id]?.length ?? 0) > 0 && (
              <SetHeader type={exercise.type} />
            )}

            <div className="space-y-2">
              {(exerciseSets[exercise.id] ?? []).map((set, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex w-full min-w-0 items-center gap-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      style={{ background: S.surface, color: S.muted }}
                    >
                      {i + 1}
                    </span>
                    {exercise.type === "weighted" && (
                      <>
                        <SmallInput
                          placeholder="0"
                          value={set.reps}
                          onChange={(v) => updateSet(exercise.id, i, "reps", v)}
                        />
                        <SmallInput
                          placeholder="0"
                          value={set.weight}
                          onChange={(v) =>
                            updateSet(exercise.id, i, "weight", v)
                          }
                        />
                      </>
                    )}
                    {exercise.type === "duration" && (
                      <SmallInput
                        placeholder="0"
                        value={set.duration}
                        onChange={(v) =>
                          updateSet(exercise.id, i, "duration", v)
                        }
                      />
                    )}
                    {exercise.type === "bodyweight" && (
                      <SmallInput
                        placeholder="0"
                        value={set.reps}
                        onChange={(v) => updateSet(exercise.id, i, "reps", v)}
                      />
                    )}
                    <button
                      disabled={(exerciseSets[exercise.id]?.length ?? 0) === 1}
                      onClick={() => removeSet(exercise.id, i)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                      style={{ background: S.surface, color: S.muted }}
                    >
                      <Minus size={14} />
                    </button>
                  </div>

                  {/* ✅ Hints come from suggestions, inputs come from lastWorkoutSets */}
                  {!isResuming && suggestions[exercise.id]?.[i]?.hint && (
                    <p className="ml-8 text-xs" style={{ color: S.amber }}>
                      {suggestions[exercise.id][i].hint}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => addSet(exercise.id)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-sm transition-colors"
              style={{
                background: "transparent",
                border: `1px solid ${S.surface}`,
                color: S.muted,
              }}
            >
              <Plus size={14} /> Add Set
            </button>
          </div>
        ))}

        {/* Add Exercise — amber-tinted dashed, distinct from Finish */}
        <button
          onClick={handleAddExercise}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-colors active:opacity-70"
          style={{
            background: S.amberSoft,
            border: `1px dashed ${S.amberBorder}`,
            color: S.amber,
          }}
        >
          <Plus size={18} />
          Add Exercise
        </button>
      </div>
    </div>
  );
}
