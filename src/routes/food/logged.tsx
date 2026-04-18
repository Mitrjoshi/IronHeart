import { Header } from "@/components/Header";
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMealEntriesByType, useMealTotals } from "@/hooks/store/food";
import { Trash2 } from "lucide-react";
import { useDeleteFoodEntry } from "@/hooks/store/food";

export const Route = createFileRoute("/food/logged")({
  component: RouteComponent,
});

const MEAL_OPTIONS = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = (typeof MEAL_OPTIONS)[number];

function RouteComponent() {
  const [selectedMeal, setSelectedMeal] = React.useState<MealType>("breakfast");

  const entries = useMealEntriesByType(selectedMeal);
  const totals = useMealTotals(selectedMeal);
  const deleteEntry = useDeleteFoodEntry();

  return (
    <>
      <Header
        showBack
        title="Nutrition Log"
        subtitle="Your meals and macros for today"
      />

      <div className="space-y-4 pt-20 pb-8">
        {/* Meal selector */}
        <div className="px-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Meal</CardTitle>
              <CardDescription>
                Switch between meals to view entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {MEAL_OPTIONS.map((meal) => (
                  <button
                    key={meal}
                    onClick={() => setSelectedMeal(meal)}
                    className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                      selectedMeal === meal
                        ? "bg-foreground text-background border-foreground font-medium"
                        : "text-muted-foreground border-border/50"
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Totals */}
        <div className="px-4">
          <Card>
            <CardHeader>
              <CardTitle>{selectedMeal}</CardTitle>
              <CardDescription>Total nutrition for this meal</CardDescription>
            </CardHeader>

            <CardContent className="flex items-center justify-around text-sm">
              <p>{totals.calories} kcal</p>
              <Separator orientation="vertical" />
              <p>{totals.protein}g protein</p>
              <Separator orientation="vertical" />
              <p>{totals.carbs}g carbs</p>
              <Separator orientation="vertical" />
              <p>{totals.fats}g fats</p>
            </CardContent>
          </Card>
        </div>

        {/* Entries */}
        <div className="px-4">
          <Card>
            <CardHeader>
              <CardTitle>Foods</CardTitle>

              <CardDescription>Items added to this meal</CardDescription>
            </CardHeader>

            <CardContent>
              {entries.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-sm">
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
                      <div className="space-y-1">
                        <p className="font-medium">{item.foodName}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.quantity} {item.unit}
                        </p>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-3">
                        <div className="space-y-1 text-right">
                          <p className="text-sm font-medium">
                            {item.calories} kcal
                          </p>
                          <p className="text-muted-foreground text-xs">
                            P {item.protein} · C {item.carbs} · F {item.fats}
                          </p>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => deleteEntry(item.id)}
                          className="text-muted-foreground p-1 transition-colors hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
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
