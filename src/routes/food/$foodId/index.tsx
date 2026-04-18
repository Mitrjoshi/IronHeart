import { Header } from "@/components/Header";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FOODS } from "@/constants/foods";
import { normalizeFood } from "@/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";
import { Progress } from "@/components/ui/progress";
import { useAddFoodEntry, useGetOrCreateMeal } from "@/hooks/store/food";

export const Route = createFileRoute("/food/$foodId/")({
  component: RouteComponent,
});

const MEAL_OPTIONS = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = (typeof MEAL_OPTIONS)[number];

function RouteComponent() {
  const foodId = Route.useParams().foodId;
  const navigate = useNavigate();

  const [microTab, setMicroTab] = React.useState<
    "fats" | "minerals" | "vitamins"
  >("fats");
  const [selectedMeal, setSelectedMeal] = React.useState<MealType>("breakfast");
  const [quantity, setQuantity] = React.useState<number>(1);
  const [adding, setAdding] = React.useState(false);
  const addFoodEntry = useAddFoodEntry();
  const getOrCreateMeal = useGetOrCreateMeal();

  const NORMALIZED_FOODS = React.useMemo(
    () => FOODS.filter((f) => f.food_code === foodId).map(normalizeFood),
    [FOODS, foodId],
  );

  const food = NORMALIZED_FOODS[0];

  // Scale nutrients by quantity (quantity = number of servings)
  const scaled = React.useMemo(
    () => ({
      calories: food.serving.calories * quantity,
      protein: food.serving.protein * quantity,
      carbs: food.serving.carbs * quantity,
      fats: food.serving.fats * quantity,
    }),
    [food, quantity],
  );

  const handleAdd = () => {
    setAdding(true);
    const mealId = getOrCreateMeal(selectedMeal);
    addFoodEntry({
      mealId,
      foodCode: food.food_code,
      foodName: food.name,
      quantity: food.serving.quantity * quantity,
      unit: food.serving.unit,
      calories: scaled.calories,
      protein: scaled.protein,
      carbs: scaled.carbs,
      fats: scaled.fats,
    });
    setAdding(false);
    navigate({ to: "/", replace: true });
  };

  const microFats = [
    {
      label: "SFA",
      value: food.serving.unit_serving_sfa_mg?.toFixed(1),
      unit: "mg",
    },
    {
      label: "MUFA",
      value: food.serving.unit_serving_mufa_mg?.toFixed(1),
      unit: "mg",
    },
    {
      label: "PUFA",
      value: food.serving.unit_serving_pufa_mg?.toFixed(1),
      unit: "mg",
    },
    {
      label: "Cholesterol",
      value: food.serving.unit_serving_cholesterol_mg?.toFixed(1),
      unit: "mg",
    },
    {
      label: "Fibre",
      value: food.serving.unit_serving_fibre_g?.toFixed(1),
      unit: "g",
    },
  ];

  const microMinerals = [
    {
      label: "Calcium",
      value: food.serving.unit_serving_calcium_mg?.toFixed(1),
      unit: "mg",
    },
    {
      label: "Phosphorus",
      value: food.serving.unit_serving_phosphorus_mg?.toFixed(1),
      unit: "mg",
    },
    {
      label: "Magnesium",
      value: food.serving.unit_serving_magnesium_mg?.toFixed(2),
      unit: "mg",
    },
    {
      label: "Sodium",
      value: food.serving.unit_serving_sodium_mg?.toFixed(2),
      unit: "mg",
    },
    {
      label: "Potassium",
      value: food.serving.unit_serving_potassium_mg?.toFixed(1),
      unit: "mg",
    },
    {
      label: "Iron",
      value: food.serving.unit_serving_iron_mg?.toFixed(3),
      unit: "mg",
    },
    {
      label: "Zinc",
      value: food.serving.unit_serving_zinc_mg?.toFixed(3),
      unit: "mg",
    },
    {
      label: "Copper",
      value: food.serving.unit_serving_copper_mg?.toFixed(3),
      unit: "mg",
    },
    {
      label: "Selenium",
      value: food.serving.unit_serving_selenium_ug?.toFixed(3),
      unit: "µg",
    },
  ];

  const microVitamins = [
    {
      label: "Vitamin C",
      value: food.serving.unit_serving_vitc_mg?.toFixed(3),
      unit: "mg",
    },
    {
      label: "Vitamin E",
      value: food.serving.unit_serving_vite_mg?.toFixed(3),
      unit: "mg",
    },
    {
      label: "Vitamin K1",
      value: food.serving.unit_serving_vitk1_ug?.toFixed(4),
      unit: "µg",
    },
    {
      label: "Folate (B9)",
      value: food.serving.unit_serving_folate_ug?.toFixed(2),
      unit: "µg",
    },
    {
      label: "Vitamin B1",
      value: food.serving.unit_serving_vitb1_mg?.toFixed(4),
      unit: "mg",
    },
    {
      label: "Vitamin B2",
      value: food.serving.unit_serving_vitb2_mg?.toFixed(4),
      unit: "mg",
    },
    {
      label: "Vitamin B6",
      value: food.serving.unit_serving_vitb6_mg?.toFixed(3),
      unit: "mg",
    },
    {
      label: "Biotin (B7)",
      value: food.serving.unit_serving_vitb7_ug?.toFixed(3),
      unit: "µg",
    },
    {
      label: "Carotenoids",
      value: food.serving.unit_serving_carotenoids_ug?.toFixed(1),
      unit: "µg",
    },
  ];

  const microTabs = {
    fats: microFats,
    minerals: microMinerals,
    vitamins: microVitamins,
  };

  return (
    <>
      <Header
        showBack
        title={food.name}
        subtitle={`${food.food_code} · per ${food.base.quantity}${food.serving.measurement} · ${food.serving.primarysource}`}
      />

      <div className="space-y-4 pt-20 pb-8">
        {/* Summary card */}
        <div className="px-4">
          <Card>
            <CardHeader>
              <CardTitle>{food.name}</CardTitle>
              <CardDescription>
                {food.serving.calories.toFixed(1)} kcal per {food.serving.unit}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-around">
              <p>{food.serving.calories.toFixed(1)} kcal</p>
              <Separator orientation="vertical" />
              <p>{food.serving.protein.toFixed(1)}g protein</p>
              <Separator orientation="vertical" />
              <p>{food.serving.carbs.toFixed(1)}g carbs</p>
              <Separator orientation="vertical" />
              <p>{food.serving.fats.toFixed(1)}g fat</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Add meal card */}
        <div className="px-4">
          <Card>
            <CardHeader>
              <CardTitle>Add meal</CardTitle>
              <CardDescription>
                Add this food to your meal to count your calories and macros
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Meal selector */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Meal</p>
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
              </div>

              {/* Quantity selector */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Servings</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(0.5, q - 0.5))}
                    className="border-border text-muted-foreground hover:bg-muted flex h-8 w-8 items-center justify-center rounded-full border text-lg transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 0.5)}
                    className="border-border text-muted-foreground hover:bg-muted flex h-8 w-8 items-center justify-center rounded-full border text-lg transition-colors"
                  >
                    +
                  </button>
                  <span className="text-muted-foreground text-xs">
                    × {food.serving.unit}
                  </span>
                </div>
              </div>

              {/* Scaled macros */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Macros</p>
                {[
                  {
                    id: "calories",
                    label: "Calories",
                    value: scaled.calories,
                    display: `${scaled.calories.toFixed(1)} kcal`,
                    color: "text-red-400",
                    bar: "[&>div]:bg-red-400",
                  },
                  {
                    id: "protein",
                    label: "Protein",
                    value: scaled.protein,
                    display: `${scaled.protein.toFixed(1)}g`,
                    color: "text-blue-400",
                    bar: "[&>div]:bg-blue-400",
                  },
                  {
                    id: "carbs",
                    label: "Carbs",
                    value: scaled.carbs,
                    display: `${scaled.carbs.toFixed(1)}g`,
                    color: "text-green-400",
                    bar: "[&>div]:bg-green-400",
                  },
                  {
                    id: "fats",
                    label: "Fats",
                    value: scaled.fats,
                    display: `${scaled.fats.toFixed(1)}g`,
                    color: "text-orange-400",
                    bar: "[&>div]:bg-orange-400",
                  },
                ].map(({ id, label, value, display, color, bar }) => (
                  <Field key={id} className={`w-full ${color}`}>
                    <FieldLabel htmlFor={id}>
                      <span>{label}</span>
                      <span className="ml-auto">{display}</span>
                    </FieldLabel>
                    <Progress className={bar} value={value} id={id} />
                  </Field>
                ))}
              </div>

              <Separator />

              {/* Micros */}
              <div className="space-y-3">
                <p className="text-sm font-medium">Micros</p>
                <div className="flex gap-2">
                  {(["fats", "minerals", "vitamins"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setMicroTab(tab)}
                      className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                        microTab === tab
                          ? "bg-muted text-foreground border-border font-medium"
                          : "text-muted-foreground border-border/50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="divide-border divide-y">
                  {microTabs[microTab].map(({ label, value, unit }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-muted-foreground text-sm">
                        {label}
                      </span>
                      <span className="text-sm font-medium">
                        {value} {unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleAdd}
                disabled={adding}
                className="bg-foreground text-background w-full cursor-pointer rounded-xl py-3 text-sm font-medium transition-opacity disabled:opacity-50"
              >
                {adding ? "Adding..." : `Add to ${selectedMeal}`}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
