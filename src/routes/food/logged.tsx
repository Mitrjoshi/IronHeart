import { Header } from "@/components/Header";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

function RouteComponent() {
  const navigate = useNavigate();
  const [selectedMeal, setSelectedMeal] = React.useState<MealType>("breakfast");
  const [selectedDate, setSelectedData] = React.useState(new Date());

  const entries = useMealEntriesByType(selectedMeal);
  const totals = useMealTotals(selectedMeal);
  const deleteEntry = useDeleteFoodEntry();

  return (
    <>
      <Header
        showBack
        title="Nutrition Log"
        subtitle="Your meals and macros for today"
        right={
          <Button
            onClick={() =>
              navigate({
                to: "/food",
                search: { search: "" },
              })
            }
            size="lg"
            variant="link"
            className="text-muted-foreground underline"
          >
            Add food <ChevronRight />
          </Button>
        }
      />

      <div className="space-y-4 pt-20 pb-4">
        {/* Day selector */}
        <DaySelector onChange={setSelectedData} selectedDate={selectedDate} />

        {/* Meal type pills — no card wrapper, sits flush */}
        <div className="flex flex-wrap gap-2 px-4">
          {MEAL_OPTIONS.map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-colors ${
                selectedMeal === meal
                  ? "bg-foreground text-background border-foreground font-medium"
                  : "text-muted-foreground border-border/50"
              }`}
            >
              {meal}
            </button>
          ))}
        </div>

        {/* Macro totals — 2×2 grid */}
        <div className="grid grid-cols-2 gap-3 px-4">
          {[
            { label: "Calories", value: `${totals.calories.toFixed(1)} kcal` },
            { label: "Protein", value: `${totals.protein.toFixed(1)}g` },
            { label: "Carbs", value: `${totals.carbs.toFixed(1)}g` },
            { label: "Fats", value: `${totals.fats.toFixed(1)}g` },
          ].map(({ label, value }) => (
            <Card key={label}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
                <CardDescription>{value}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Food entries */}
        <div className="px-4">
          <Card>
            <CardHeader>
              <CardTitle>{capitalize(selectedMeal)}</CardTitle>
              <CardDescription>Items logged for this meal</CardDescription>
            </CardHeader>

            <CardContent>
              {entries.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center text-sm">
                  No food logged for {selectedMeal}
                </div>
              ) : (
                <div className="divide-y">
                  {entries.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      {/* Left */}
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate font-medium">{item.foodName}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.calories.toFixed(1)} kcal ·{" "}
                          {item.protein.toFixed(1)}g P · {item.carbs.toFixed(1)}
                          g C · {item.fats.toFixed(1)}g F
                        </p>
                      </div>

                      {/* Right */}
                      <div className="flex shrink-0 items-center gap-2">
                        <Button size="icon" variant="outline">
                          <Pen size={15} />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deleteEntry(item.id)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
