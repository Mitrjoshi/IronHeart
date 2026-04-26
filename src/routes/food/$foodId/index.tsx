import { Header } from "@/components/Header";
import { FOODS } from "@/constants/foods";
import { normalizeFood } from "@/utils";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import React from "react";
import { useAddFoodEntry, useGetOrCreateMeal } from "@/hooks/store/food";
import {
  useCustomFoods,
  useDeleteCustomFood,
} from "@/hooks/store/useCustomFoods";
import { Trash } from "lucide-react";

export const Route = createFileRoute("/food/$foodId/")({
  component: RouteComponent,
});

const MEAL_OPTIONS = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealType = (typeof MEAL_OPTIONS)[number];

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5" },
  card: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 16,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  red: "#ef4444",
  redSurface: "#2a1515",
  surface: "#1f1f1f",
  divider: { background: "#1f1f1f" },
};

const MACRO_CONFIG = [
  {
    key: "calories" as const,
    label: "Calories",
    unit: "kcal",
    color: S.amber,
    bar: S.amber,
  },
  {
    key: "protein" as const,
    label: "Protein",
    unit: "g",
    color: "#818cf8",
    bar: "#818cf8",
  },
  {
    key: "carbs" as const,
    label: "Carbs",
    unit: "g",
    color: "#34d399",
    bar: "#34d399",
  },
  {
    key: "fats" as const,
    label: "Fats",
    unit: "g",
    color: "#fb923c",
    bar: "#fb923c",
  },
];

function RouteComponent() {
  const foodId = Route.useParams().foodId;
  const router = useRouter();

  const [microTab, setMicroTab] = React.useState<
    "fats" | "minerals" | "vitamins"
  >("fats");
  const [selectedMeal, setSelectedMeal] = React.useState<MealType>("breakfast");
  const [quantity, setQuantity] = React.useState(1);
  const [adding, setAdding] = React.useState(false);

  const addFoodEntry = useAddFoodEntry();
  const getOrCreateMeal = useGetOrCreateMeal();

  const customFoods = useCustomFoods();

  const food = React.useMemo(() => {
    const allFoods = [...customFoods, ...FOODS];
    return allFoods.filter((f) => f.food_code === foodId).map(normalizeFood)[0];
  }, [foodId, customFoods]);

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
      ...scaled,
    });
    setAdding(false);
    router.history.back();
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

  const deleteFood = useDeleteCustomFood();

  return (
    <div style={S.page} className="min-h-screen">
      <Header
        showBack
        title={food.name}
        right={
          foodId.includes("CUSTOM_") && (
            <button
              onClick={() => {
                deleteFood(foodId);
                router.history.back();
              }}
              className="rounded-xl p-2 transition-colors"
              style={{ background: S.redSurface, color: S.red }}
            >
              <Trash size={16} />
            </button>
          )
        }
        subtitle={`${food.food_code} · per ${food.base.quantity}${food.serving.measurement}`}
      />

      <div className="space-y-3 px-4 pt-20 pb-8">
        {/* Summary strip */}
        <div
          style={S.card}
          className="flex items-center justify-around px-4 py-3"
        >
          {[
            {
              label: "Calories",
              value: `${food.serving.calories.toFixed(0)}`,
              unit: "kcal",
              color: S.amber,
            },
            {
              label: "Protein",
              value: `${food.serving.protein.toFixed(1)}`,
              unit: "g",
              color: "#818cf8",
            },
            {
              label: "Carbs",
              value: `${food.serving.carbs.toFixed(1)}`,
              unit: "g",
              color: "#34d399",
            },
            {
              label: "Fats",
              value: `${food.serving.fats.toFixed(1)}`,
              unit: "g",
              color: "#fb923c",
            },
          ].map(({ label, value, unit, color }, i, arr) => (
            <React.Fragment key={label}>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color }}>
                  {value}
                  <span
                    className="ml-0.5 text-xs font-normal"
                    style={{ color: S.mutedDark }}
                  >
                    {unit}
                  </span>
                </p>
                <p
                  className="mt-0.5 text-[10px]"
                  style={{ color: S.mutedDark }}
                >
                  {label}
                </p>
              </div>
              {i < arr.length - 1 && (
                <div className="h-6 w-px" style={S.divider} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Add to meal */}
        <div style={S.card} className="space-y-4 p-4">
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: S.muted }}
          >
            Add to Meal
          </p>

          {/* Meal pills */}
          <div className="flex flex-wrap gap-2">
            {MEAL_OPTIONS.map((meal) => (
              <button
                key={meal}
                onClick={() => setSelectedMeal(meal)}
                className="rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                style={
                  selectedMeal === meal
                    ? { background: S.amber, color: "#0e0e0e" }
                    : {
                        background: S.surface,
                        color: S.muted,
                        border: "1px solid #262626",
                      }
                }
              >
                {meal}
              </button>
            ))}
          </div>

          {/* Servings stepper */}
          <div className="flex items-center gap-3">
            <p className="flex-1 text-xs" style={{ color: S.muted }}>
              Servings{" "}
              <span style={{ color: S.mutedDark }}>× {food.serving.unit}</span>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(0.5, q - 0.5))}
                className="flex size-8 items-center justify-center rounded-full text-lg font-medium transition-colors"
                style={{ background: S.surface, color: "#f5f5f5" }}
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 0.5)}
                className="flex size-8 items-center justify-center rounded-full text-lg font-medium transition-colors"
                style={{ background: S.surface, color: "#f5f5f5" }}
              >
                +
              </button>
            </div>
          </div>

          {/* Scaled macro bars */}
          <div className="space-y-2.5">
            {MACRO_CONFIG.map(({ key, label, unit, color, bar }) => {
              const val = scaled[key];
              const pct =
                key === "calories"
                  ? Math.min((val / 2000) * 100, 100)
                  : Math.min((val / 50) * 100, 100);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span style={{ color }}>{label}</span>
                    <span style={{ color: S.muted }}>
                      {val.toFixed(1)} {unit}
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: "#1f1f1f" }}
                  >
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: bar }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <button
            onClick={handleAdd}
            disabled={adding}
            className="w-full rounded-xl py-2.5 text-sm font-semibold capitalize transition-opacity active:opacity-80 disabled:opacity-50"
            style={{ background: S.amber, color: "#0e0e0e" }}
          >
            {adding ? "Adding..." : `Add to ${selectedMeal}`}
          </button>
        </div>

        {/* Micros */}
        <div style={S.card} className="space-y-3 p-4">
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: S.muted }}
          >
            Micronutrients
          </p>

          {/* Micro tabs */}
          <div className="flex gap-2">
            {(["fats", "minerals", "vitamins"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setMicroTab(tab)}
                className="rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                style={
                  microTab === tab
                    ? {
                        background: S.surface,
                        color: "#f5f5f5",
                        border: "1px solid #404040",
                      }
                    : {
                        background: "transparent",
                        color: S.mutedDark,
                        border: "1px solid #1f1f1f",
                      }
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Micro rows */}
          <div>
            {microTabs[microTab].map(({ label, value, unit }, i, arr) => (
              <div
                key={label}
                className="flex items-center justify-between py-2"
                style={
                  i < arr.length - 1
                    ? { borderBottom: "1px solid #1a1a1a" }
                    : {}
                }
              >
                <span className="text-sm" style={{ color: S.muted }}>
                  {label}
                </span>
                <span className="text-sm font-medium">
                  {value ?? "—"}{" "}
                  <span style={{ color: S.mutedDark }}>{unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
