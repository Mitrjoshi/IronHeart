import { Header } from "@/components/Header";
import { useScheduleById, useUpdateSchedule } from "@/hooks/store/schedules";
import { capitalize, DAYS } from "@/utils";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import React from "react";

export const Route = createFileRoute("/schedule/$scheduleId/edit")({
  component: RouteComponent,
});

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
    borderRadius: 12,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  red: "#ef4444",
  redSurface: "#2a1515",
  surface: "#1f1f1f",
};

function RouteComponent() {
  const scheduleId = Route.useParams().scheduleId;
  const scheduleData = useScheduleById(scheduleId);
  const handleUpdateSchedule = useUpdateSchedule();
  const router = useRouter();

  const [scheduleName, setScheduleName] = React.useState(scheduleData?.name);
  const [scheduleDay, setScheduleDay] = React.useState(
    capitalize(scheduleData?.day as string),
  );
  const [dayOpen, setDayOpen] = React.useState(false);

  return (
    <div style={S.page} className="min-h-screen">
      <Header
        showBack
        title={scheduleData?.name}
        subtitle="Edit your schedule"
      />

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
          onClick={() => {
            handleUpdateSchedule(scheduleId, {
              name: scheduleName,
              day: scheduleDay,
            });
            router.history.back();
          }}
          className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity active:opacity-80"
          style={{ background: S.amber, color: "#0e0e0e" }}
        >
          Save Schedule
        </button>
      </div>
    </div>
  );
}
