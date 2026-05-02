import { Header } from "@/components/Header";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { useMealEntriesByType, useMealTotals } from "@/hooks/store/food";
import { ChevronRight, Pen, Trash2 } from "lucide-react";
import { useDeleteFoodEntry } from "@/hooks/store/food";
import { DaySelector } from "@/components/DaySelector";
import { Button } from "@/components/ui/button";
import { capitalize } from "@/utils";

export const Route = createFileRoute("/food/logged")({
  component: RouteComponent,
});

const MEAL_OPTIONS = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = (typeof MEAL_OPTIONS)[number];

const macroColors: Record<string, string> = {
  Calories: "text-amber-400",
  Protein: "text-indigo-400",
  Carbs: "text-emerald-400",
  Fats: "text-rose-400",
};

function RouteComponent() {
  const navigate = useNavigate();
  const [selectedMeal, setSelectedMeal] = React.useState<MealType>("breakfast");
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const entries = useMealEntriesByType(selectedMeal, selectedDate.getTime());
  const totals = useMealTotals(selectedMeal, selectedDate.getTime());
  const deleteEntry = useDeleteFoodEntry();

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0e0e0e", color: "#f5f5f5" }}
    >
      <Header
        showBack
        title="Nutrition Log"
        subtitle="Your meals and macros for today"
        right={
          <Button
            onClick={() => navigate({ to: "/food", search: { search: "" } })}
            size="lg"
            variant="link"
            className="text-[#737373] underline transition-colors hover:text-amber-400"
          >
            Add food <ChevronRight size={16} />
          </Button>
        }
      />

      <div className="space-y-5 pt-20 pb-8">
        {/* Day selector */}
        <DaySelector onChange={setSelectedDate} selectedDate={selectedDate} />

        {/* Meal pills */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4">
          {MEAL_OPTIONS.map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className="shrink-0 rounded-full px-4 py-1.5 text-sm capitalize transition-all"
              style={
                selectedMeal === meal
                  ? {
                      background: "#f59e0b",
                      color: "#0e0e0e",
                      fontWeight: 600,
                      border: "1px solid #f59e0b",
                    }
                  : {
                      background: "transparent",
                      color: "#737373",
                      border: "1px solid #262626",
                    }
              }
            >
              {meal}
            </button>
          ))}
        </div>

        {/* Macro tiles */}
        <div className="grid grid-cols-2 gap-3 px-4">
          {[
            {
              label: "Calories",
              value: `${totals.calories.toFixed(1)}`,
              unit: "kcal",
            },
            {
              label: "Protein",
              value: `${totals.protein.toFixed(1)}`,
              unit: "g",
            },
            { label: "Carbs", value: `${totals.carbs.toFixed(1)}`, unit: "g" },
            { label: "Fats", value: `${totals.fats.toFixed(1)}`, unit: "g" },
          ].map(({ label, value, unit }) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded-2xl p-4"
              style={{ background: "#161616", border: "1px solid #1f1f1f" }}
            >
              <p className="text-xs" style={{ color: "#737373" }}>
                {label}
              </p>
              <p
                className={`text-2xl leading-tight font-semibold ${macroColors[label]}`}
              >
                {value}
                <span
                  className="ml-1 text-sm font-normal"
                  style={{ color: "#525252" }}
                >
                  {unit}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* Entries */}
        <div className="px-4">
          <div
            className="overflow-hidden rounded-2xl"
            style={{ background: "#161616", border: "1px solid #1f1f1f" }}
          >
            {/* Header row */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid #1f1f1f" }}
            >
              <p className="font-semibold">{capitalize(selectedMeal)}</p>
              <p className="text-xs" style={{ color: "#525252" }}>
                {entries.length} item{entries.length !== 1 ? "s" : ""}
              </p>
            </div>

            {entries.length === 0 ? (
              <div
                className="py-12 text-center text-sm"
                style={{ color: "#404040" }}
              >
                No food logged for {selectedMeal}
              </div>
            ) : (
              <div>
                {entries.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                    style={{
                      borderBottom:
                        i < entries.length - 1 ? "1px solid #1a1a1a" : "none",
                    }}
                  >
                    {/* Left */}
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium">
                        {item.foodName}
                      </p>
                      <p className="text-xs" style={{ color: "#525252" }}>
                        <span className="text-amber-400/80">
                          {item.calories.toFixed(0)} kcal
                        </span>
                        {" · "}
                        {item.protein.toFixed(1)}g P{" · "}
                        {item.carbs.toFixed(1)}g C{" · "}
                        {item.fats.toFixed(1)}g F
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        className="rounded-xl p-2 transition-colors"
                        style={{ background: "#1f1f1f", color: "#737373" }}
                      >
                        <Pen size={14} />
                      </button>
                      <button
                        className="rounded-xl p-2 transition-colors"
                        style={{ background: "#2a1515", color: "#ef4444" }}
                        onClick={() => deleteEntry(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
