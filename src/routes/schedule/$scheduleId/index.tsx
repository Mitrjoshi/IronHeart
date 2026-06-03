import { Header } from "@/components/Header";
import { useExercisesBySchedule } from "@/hooks/store/excercise";
import { useDeleteSchedule, useScheduleById } from "@/hooks/store/schedules";
import { formatDuration, formatWeight } from "@/utils";
import { store } from "@/store/schema";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  Play,
  Plus,
  Trash,
  ChevronUp,
  ChevronDown,
  Pen,
  Sparkles,
  EllipsisVertical,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/schedule/$scheduleId/")({
  component: RouteComponent,
});

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5" },
  card: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 16,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  red: "#ef4444",
  redSurface: "#2a1515",
  surface: "#1f1f1f",
};

type Exercise = ReturnType<typeof useExercisesBySchedule>[0];

function ExerciseCard({
  exercise,
  scheduleId,
  isFirst,
  isLast,
  animatingDirection,
  onMoveUp,
  onMoveDown,
}: {
  exercise: Exercise;
  scheduleId: string;
  isFirst: boolean;
  isLast: boolean;
  animatingDirection: "up" | "down" | null;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const meta: string[] = [];
  if (exercise.type === "weighted") {
    meta.push(`${exercise.numberOfSets} sets`);
    meta.push(`${exercise.totalReps} reps`);
    meta.push(formatWeight(exercise.maxWeight));
  } else if (exercise.type === "bodyweight") {
    meta.push(`${exercise.numberOfSets} sets`);
    meta.push(`${exercise.totalReps} reps`);
  } else if (exercise.type === "duration") {
    meta.push(`${exercise.numberOfSets} sets`);
    meta.push(
      formatDuration(
        exercise.lastWorkoutSets?.reduce((s, x) => s + (x.duration ?? 0), 0) ??
          0,
      ),
    );
  }

  return (
    <div
      style={{
        ...S.card,
        transform:
          animatingDirection === "up"
            ? "translateY(-4px)"
            : animatingDirection === "down"
              ? "translateY(4px)"
              : "translateY(0)",
        transition: "transform 0.18s ease, opacity 0.18s ease",
        opacity: animatingDirection ? 0.7 : 1,
      }}
      className="flex items-center gap-2 px-3 py-3"
    >
      <Link
        to="/schedule/$scheduleId/excercise/$excerciseId"
        params={{ scheduleId, excerciseId: exercise.id }}
        className="min-w-0 flex-1 space-y-0.5"
      >
        <p className="text-sm font-medium">{exercise.name}</p>
        <p className="text-xs" style={{ color: S.muted }}>
          {meta.map((m, i) => (
            <span key={i}>
              {i > 0 && <span style={{ color: S.mutedDark }}> · </span>}
              {m}
            </span>
          ))}
        </p>
      </Link>

      {/* Up / Down buttons */}
      <div className="flex flex-col gap-0.5">
        <button
          disabled={isFirst}
          onClick={onMoveUp}
          className="rounded-lg p-1 transition-colors disabled:opacity-20"
          style={{ background: S.surface, color: S.muted }}
        >
          <ChevronUp size={14} />
        </button>
        <button
          disabled={isLast}
          onClick={onMoveDown}
          className="rounded-lg p-1 transition-colors disabled:opacity-20"
          style={{ background: S.surface, color: S.muted }}
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}

function RouteComponent() {
  const navigate = Route.useNavigate();
  const router = useRouter();
  const scheduleId = Route.useParams().scheduleId;
  const scheduleData = useScheduleById(scheduleId);
  const deleteSchedule = useDeleteSchedule();
  const rawExercises = useExercisesBySchedule(scheduleId);

  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  // { id: string, direction: "up" | "down" }[]
  const [animating, setAnimating] = useState<
    { id: string; direction: "up" | "down" }[]
  >([]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setOrderedIds(rawExercises.map((e) => e.id));
  }, [rawExercises.length]);

  const exercises = orderedIds
    .map((id) => rawExercises.find((e) => e.id === id))
    .filter(Boolean) as typeof rawExercises;

  const move = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= exercises.length) return;

    const movingId = orderedIds[fromIndex];
    const displacedId = orderedIds[toIndex];
    const direction = toIndex < fromIndex ? "up" : "down";

    // trigger animation
    setAnimating([
      { id: movingId, direction },
      { id: displacedId, direction: direction === "up" ? "down" : "up" },
    ]);

    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => {
      setAnimating([]);
      const next = [...orderedIds];
      const [item] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, item);
      setOrderedIds(next);
      next.forEach((id, i) => store.setCell("exercises", id, "order", i + 1));
    }, 180);
  };

  return (
    <div style={S.page} className="min-h-screen">
      <Header
        showBack
        title={scheduleData?.name}
        subtitle="Workout Tracker"
        right={
          <div className="flex items-center gap-2">
            <Link to="/schedule/$scheduleId/start" params={{ scheduleId }}>
              <button
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-opacity active:opacity-80"
                style={{ background: S.amber, color: "#0e0e0e" }}
              >
                <Play size={14} />
                Start
              </button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded-xl p-2 transition-colors"
                style={{ background: S.surface, color: S.muted }}
              >
                <EllipsisVertical size={16} />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="bottom"
                align="end"
                className="mt-2 w-auto space-y-1"
              >
                <DropdownMenuItem asChild className="gap-4 px-4 py-2">
                  <button
                    onClick={() =>
                      navigate({
                        to: "/schedule/$scheduleId/ai",
                        params: { scheduleId },
                      })
                    }
                    className="flex w-full items-center gap-0 transition-colors"
                    style={{ background: S.surface }}
                  >
                    <Sparkles size={16} />
                    <span className="text-sm text-nowrap">
                      Generate with AI
                    </span>
                  </button>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="gap-4 px-4 py-2">
                  <button
                    onClick={() =>
                      navigate({
                        to: "/schedule/$scheduleId/edit",
                        params: { scheduleId },
                      })
                    }
                    className="flex w-full items-center gap-0 transition-colors"
                    style={{ background: S.surface }}
                  >
                    <Pen size={16} />
                    <span className="text-sm text-nowrap">Edit Schedule</span>
                  </button>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => {
                    setDeleteOpen(true);
                  }}
                  asChild
                  className="gap-4 px-4 py-2"
                >
                  <button
                    className="flex w-full items-center gap-0 transition-colors"
                    style={{ background: S.surface, color: S.red }}
                  >
                    <Trash size={16} />
                    <span className="text-sm text-nowrap">Delete Schedule</span>
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* lives outside the dropdown, controlled by state */}
            <ExitDialog
              open={deleteOpen}
              onCancel={() => {
                setDeleteOpen(false);
              }}
              onDelete={() => {
                deleteSchedule(scheduleId);
                router.history.back();
              }}
            />
          </div>
        }
      />

      <div className="space-y-2 px-4 pt-20 pb-28">
        {exercises.length === 0 && (
          <div
            style={S.card}
            className="flex flex-col items-center justify-center space-y-1 py-16 text-center"
          >
            <p className="text-sm" style={{ color: S.muted }}>
              No exercises yet.
            </p>
            <p className="text-xs" style={{ color: S.mutedDark }}>
              Tap + to add your first exercise.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {exercises.map((exercise, index) => {
            const anim =
              animating.find((a) => a.id === exercise.id)?.direction ?? null;
            return (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                scheduleId={scheduleId}
                isFirst={index === 0}
                isLast={index === exercises.length - 1}
                animatingDirection={anim}
                onMoveUp={() => move(index, index - 1)}
                onMoveDown={() => move(index, index + 1)}
              />
            );
          })}
        </div>
      </div>

      <button
        onClick={() =>
          navigate({
            to: "/schedule/$scheduleId/excercise",
            params: { scheduleId },
          })
        }
        className="fixed right-4 bottom-4 z-1 flex size-14 items-center justify-center rounded-full shadow-2xl transition-opacity active:opacity-80"
        style={{ background: S.amber }}
      >
        <Plus size={24} color="#0e0e0e" />
      </button>
    </div>
  );
}

function ExitDialog({
  open,
  onDelete,
  onCancel,
}: {
  open: boolean;
  onDelete: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onCancel}
      />
      <div
        className="relative z-10 w-full space-y-3 p-5"
        style={{ ...S.card, borderRadius: 20 }}
      >
        <p className="text-base font-semibold">Delete Schedule?</p>
        <p className="text-sm" style={{ color: S.muted }}>
          This action can't be undone.
        </p>
        <div className="space-y-2 pt-1">
          <button
            onClick={onDelete}
            className="w-full rounded-xl py-2.5 text-sm font-semibold"
            style={{ background: S.surface, color: S.red }}
          >
            Delete
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
