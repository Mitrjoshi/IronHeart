import React from "react";

interface DaySelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export function DaySelector({ selectedDate, onChange }: DaySelectorProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const selectedRef = React.useRef<HTMLButtonElement | null>(null);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // Anchor to a stable date at render time so the array never shifts
  const today = React.useMemo(() => new Date(), []);

  const days = React.useMemo(() => {
    const PAST = 180;
    const FUTURE = 30;
    return Array.from({ length: PAST + FUTURE }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - PAST + i);
      return d;
    });
  }, [today]);

  // Scroll selected day into view — only when the selected date changes
  const hasMountedRef = React.useRef(false);

  React.useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: hasMountedRef.current ? "smooth" : "auto", // 👈 key fix
        inline: "center",
        block: "nearest",
      });

      hasMountedRef.current = true;
    }
  }, [selectedDate]);

  return (
    <div
      ref={containerRef}
      className="no-scrollbar overflow-x-auto"
      role="group"
      aria-label="Select a date"
    >
      <div className="flex w-max gap-1.5 px-4 py-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const isFuture = day > today && !isToday;

          const dateLabel = day.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <button
              key={day.toISOString()}
              ref={isSelected ? selectedRef : null}
              onClick={() => onChange(day)}
              aria-label={dateLabel}
              aria-pressed={isSelected}
              className={[
                "relative flex min-w-[52px] flex-col items-center justify-center rounded-xl px-2.5 py-2 text-xs transition-all duration-150 select-none",
                isSelected
                  ? "bg-foreground text-background scale-[1.06] shadow-sm"
                  : isFuture
                    ? "text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground active:scale-95"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95",
              ].join(" ")}
            >
              {/* Weekday */}
              <span className="text-[9px] tracking-wide uppercase opacity-70">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </span>

              {/* Date number */}
              <span className="mt-0.5 text-sm leading-none font-semibold">
                {day.getDate()}
              </span>

              {/* Month — only shown when it's the 1st or the selected day */}
              {(day.getDate() === 1 || isSelected) && (
                <span className="mt-0.5 text-[9px] tracking-wide uppercase opacity-60">
                  {day.toLocaleDateString("en-US", { month: "short" })}
                </span>
              )}

              {/* Today dot */}
              {isToday && !isSelected && (
                <span className="bg-foreground/40 mt-1 block h-1 w-1 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
