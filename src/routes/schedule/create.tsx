import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAddSchedule } from "@/hooks/store/schedules";

export const Route = createFileRoute("/schedule/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();

  const [scheduleName, setScheduleName] = React.useState("");
  const [scheduleDay, setScheduleDay] = React.useState("");

  const addSchedule = useAddSchedule();

  const handleCreateSchedule = () => {
    if (!scheduleName || !scheduleDay) {
      toast("Please enter a name and select a day for your workout.");
      return;
    }

    const scheduleId = addSchedule(scheduleName, scheduleDay);
    navigate({
      to: "/schedule/$scheduleId",
      params: { scheduleId: scheduleId },
      replace: true,
    });
  };

  return (
    <>
      <Header showBack title="Add Workout" subtitle="Workout Tracker" />

      <div className="h-screen space-y-4 pt-20">
        <div className="space-y-2 p-4 py-0">
          <div className="flex flex-col space-y-2">
            <Card>
              <CardContent className="space-y-2">
                <Input
                  onChange={(e) => setScheduleName(e.target.value)}
                  className="h-[36px] w-full"
                  placeholder="Workout Name"
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full" size="lg" variant="outline">
                      {scheduleDay ? scheduleDay : "Select Day of the Week"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ].map((day) => (
                        <DropdownMenuItem
                          key={day}
                          onClick={() => setScheduleDay(day)}
                        >
                          {day}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <p className="text-muted-foreground text-sm">
                  Select day of the week for this workout. This will help you
                  organize your workouts and track your progress over time. You
                  can always change
                </p>
              </CardContent>

              <CardFooter className="flex-col space-y-2">
                <Button
                  onClick={handleCreateSchedule}
                  className="w-full cursor-pointer"
                  size="lg"
                >
                  <p>Create & Add Exercise</p>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
