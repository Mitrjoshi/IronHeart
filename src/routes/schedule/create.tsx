import { Header } from "@/components/Header";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { toast } from "sonner";
import { useAddSchedule } from "@/hooks/store/schedules";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/schedule/create")({
  component: RouteComponent,
});

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5", minHeight: "100vh" },
  card: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 16,
  },
  input: {
    background: "#111111",
    border: "1px solid #262626",
    color: "#f5f5f5",
    borderRadius: 12,
  },
  muted: "#737373",
  surface: "#1f1f1f",
  amber: "#f59e0b",
};

function RouteComponent() {
  const navigate = Route.useNavigate();
  const [scheduleName, setScheduleName] = React.useState("");
  const [scheduleDay, setScheduleDay] = React.useState("");
  const [dayOpen, setDayOpen] = React.useState(false);
  const addSchedule = useAddSchedule();

  const handleCreate = () => {
    if (!scheduleName || !scheduleDay) {
      toast.error("Please enter a name and select a day.");
      return;
    }
    const scheduleId = addSchedule(scheduleName, scheduleDay);
    navigate({
      to: "/schedule/$scheduleId",
      params: { scheduleId },
      replace: true,
    });
  };

  return (
    <div style={S.page}>
      <Header showBack title="Add Workout" subtitle="Workout Tracker" />

      <div className="space-y-3 px-4 pt-24">
        <div style={S.card} className="space-y-3 p-4">
          {/* Name input */}
          <div className="space-y-1.5">
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: S.muted }}
            >
              Workout Name
            </p>
            <input
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="e.g. Push Day"
              className="w-full px-3 py-2.5 text-sm transition-colors outline-none placeholder:text-[#404040] focus:border-amber-500"
              style={S.input}
            />
          </div>

          {/* Day picker */}
          <div className="space-y-1.5">
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: S.muted }}
            >
              Day of the Week
            </p>
            <div className="relative">
              <button
                onClick={() => setDayOpen((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors"
                style={{
                  ...S.input,
                  color: scheduleDay ? "#f5f5f5" : "#404040",
                  borderColor: dayOpen ? S.amber : "#262626",
                }}
              >
                {scheduleDay || "Select day"}
                <ChevronDown
                  size={15}
                  style={{
                    color: S.muted,
                    transform: dayOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {dayOpen && (
                <div
                  className="absolute z-10 mt-1 w-full overflow-hidden"
                  style={{
                    background: "#1a1a1a",
                    border: "1px solid #262626",
                    borderRadius: 12,
                  }}
                >
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => {
                        setScheduleDay(day);
                        setDayOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#222]"
                      style={{
                        color: scheduleDay === day ? S.amber : "#f5f5f5",
                        background:
                          scheduleDay === day ? "#1f1a0f" : "transparent",
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "#404040" }}>
            You can always change the name and day later from the schedule page.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleCreate}
          className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity active:opacity-80"
          style={{ background: S.amber, color: "#0e0e0e" }}
        >
          Create & Add Exercises
        </button>
      </div>
    </div>
  );
}
