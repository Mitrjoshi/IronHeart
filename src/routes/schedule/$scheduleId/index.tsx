import { Header } from "@/components/Header";
import { useExercisesBySchedule } from "@/hooks/store/excercise";
import { useDeleteSchedule, useScheduleById } from "@/hooks/store/schedules";
import { formatDuration, formatWeight } from "@/utils";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { store } from "@/store/schema";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { GripVertical, Play, Plus, Trash } from "lucide-react";
import { useRef } from "react";

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
};

type Exercise = ReturnType<typeof useExercisesBySchedule>[0];

function SortableExerciseCard({
  exercise,
  scheduleId,
}: {
  exercise: Exercise;
  scheduleId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const wasDragging = useRef(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

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
      ref={setNodeRef}
      style={style}
      onMouseDown={() => {
        wasDragging.current = false;
      }}
      onMouseMove={() => {
        wasDragging.current = true;
      }}
    >
      <Link
        to="/schedule/$scheduleId/excercise/$excerciseId"
        params={{ scheduleId, excerciseId: exercise.id }}
        onClick={(e) => {
          if (wasDragging.current) {
            e.preventDefault();
            wasDragging.current = false;
          }
        }}
      >
        <div
          style={S.card}
          className="flex items-center justify-between px-4 py-3"
        >
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-medium">{exercise.name}</p>
            <p className="text-xs" style={{ color: S.muted }}>
              {meta.map((m, i) => (
                <span key={i}>
                  {i > 0 && <span style={{ color: S.mutedDark }}> · </span>}
                  {m}
                </span>
              ))}
            </p>
          </div>

          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.preventDefault()}
            className="ml-3 cursor-grab p-2 active:cursor-grabbing"
            style={{ color: S.mutedDark }}
          >
            <GripVertical size={17} />
          </div>
        </div>
      </Link>
    </div>
  );
}

function RouteComponent() {
  const navigate = Route.useNavigate();
  const router = useRouter();
  const scheduleId = Route.useParams().scheduleId;
  const scheduleData = useScheduleById(scheduleId);
  const deleteSchedule = useDeleteSchedule();
  const exercises = useExercisesBySchedule(scheduleId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = exercises.map((e) => e.id);
    const newOrder = arrayMove(
      ids,
      ids.indexOf(active.id as string),
      ids.indexOf(over.id as string),
    );
    newOrder.forEach((id, index) =>
      store.setCell("exercises", id, "order", index + 1),
    );
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
            <button
              onClick={() => {
                deleteSchedule(scheduleId);
                router.history.back();
              }}
              className="rounded-xl p-2 transition-colors"
              style={{ background: S.redSurface, color: S.red }}
            >
              <Trash size={16} />
            </button>
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={exercises.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <SortableExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  scheduleId={scheduleId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* FAB */}
      <button
        onClick={() =>
          navigate({
            to: "/schedule/$scheduleId/excercise",
            params: { scheduleId },
          })
        }
        className="fixed right-4 bottom-4 z-10 flex size-14 items-center justify-center rounded-full shadow-2xl transition-opacity active:opacity-80"
        style={{ background: S.amber }}
      >
        <Plus size={24} color="#0e0e0e" />
      </button>
    </div>
  );
}
