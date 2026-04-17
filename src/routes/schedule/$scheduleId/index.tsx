import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const wasDragging = useRef(false);

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
        className="cursor-pointer"
        to="/schedule/$scheduleId/excercise/$excerciseId"
        params={{ scheduleId, excerciseId: exercise.id }}
        onClick={(e) => {
          if (wasDragging.current) {
            e.preventDefault();
            wasDragging.current = false;
          }
        }}
      >
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle>{exercise.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <p className="text-sm">{exercise.numberOfSets} Sets</p>

                {exercise.type === "weighted" && (
                  <>
                    <span className="bg-muted-foreground aspect-square h-1 rounded-full" />
                    <p>{exercise.totalReps} Reps</p>
                    <span className="bg-muted-foreground aspect-square h-1 rounded-full" />
                    <p>{formatWeight(exercise.maxWeight)}</p>
                  </>
                )}
                {exercise.type === "bodyweight" && (
                  <>
                    <span className="bg-muted-foreground aspect-square h-1 rounded-full" />
                    <p>{exercise.totalReps} Reps</p>
                  </>
                )}
                {exercise.type === "duration" && (
                  <>
                    <span className="bg-muted-foreground aspect-square h-1 rounded-full" />
                    <p>
                      {formatDuration(
                        exercise.lastWorkoutSets?.reduce(
                          (sum, s) => sum + (s.duration ?? 0),
                          0,
                        ) ?? 0,
                      )}
                    </p>
                  </>
                )}
              </CardDescription>
            </div>

            <div
              {...attributes}
              {...listeners}
              onClick={(e) => e.preventDefault()}
              className="text-muted-foreground cursor-grab p-2 active:cursor-grabbing"
            >
              <GripVertical size={18} />
            </div>
          </CardHeader>
        </Card>
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
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    const newOrder = arrayMove(ids, oldIndex, newIndex);

    newOrder.forEach((id, index) => {
      store.setCell("exercises", id, "order", index + 1);
    });
  };

  const ids = exercises.map((e) => e.id);

  return (
    <>
      <Header
        right={
          <div className="flex items-center gap-2">
            <Link to="/schedule/$scheduleId/start" params={{ scheduleId }}>
              <Button>
                <Play size={16} />
                <p>Start</p>
              </Button>
            </Link>
            <Button
              onClick={() => {
                deleteSchedule(scheduleId);
                router.history.back();
              }}
              variant="destructive"
              size="icon"
            >
              <Trash size={16} />
            </Button>
          </div>
        }
        showBack
        title={scheduleData?.name}
        subtitle="Workout Tracker"
      />

      <div className="space-y-4 pt-20 pb-18">
        <div className="space-y-2 p-4 py-0">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col space-y-2">
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

        <Button
          onClick={() =>
            navigate({
              to: "/schedule/$scheduleId/excercise",
              params: { scheduleId },
            })
          }
          className="fixed right-4 bottom-4 z-10 size-14 cursor-pointer rounded-full shadow-2xl shadow-black"
          size="icon-lg"
        >
          <Plus className="size-8" />
        </Button>
      </div>
    </>
  );
}
