import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAllSchedules } from "@/hooks/store/schedules";
import { capitalize } from "@/utils";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";

export const Route = createFileRoute("/schedule/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  const schedules = useAllSchedules();

  return (
    <AppLayout>
      <Header title="Schedule" subtitle="Workout Tracker" />

      <div className="space-y-4 pt-20 pb-18">
        <div className="space-y-2 p-4 py-0">
          <div className="flex flex-col space-y-2">
            {schedules.map((split) => (
              <Link
                key={split.id}
                to="/schedule/$scheduleId"
                className="cursor-pointer"
                params={{ scheduleId: split.id }}
              >
                <Card>
                  <CardHeader className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {capitalize(split.day)} - {split.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {split.exercises}
                      </CardDescription>
                    </div>
                    <ChevronRight className="text-muted-foreground" />
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Button
          onClick={() => {
            navigate({
              to: "/schedule/create",
            });
          }}
          className="fixed right-4 bottom-22 z-10 size-14 cursor-pointer rounded-full shadow-2xl shadow-black"
          size="icon-lg"
        >
          <Plus className="size-8" />
        </Button>
      </div>
    </AppLayout>
  );
}
