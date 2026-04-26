import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { useAddCustomFood } from "@/hooks/store/useCustomFoods";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/food/add")({
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
    borderRadius: 10,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  amberSurface: "#2a1f00",
  surface: "#1f1f1f",
};

const UNITS = ["g", "ml", "piece", "cup", "tbsp", "tsp", "slice"];

function MacroInput({
  label,
  unit,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <p className="mb-1 text-xs" style={{ color: S.muted }}>
          {label}
        </p>
        <input
          type="number"
          placeholder={placeholder ?? "0"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm outline-none"
          style={S.input}
        />
      </div>
      <p className="mt-4 shrink-0 text-xs" style={{ color: S.mutedDark }}>
        {unit}
      </p>
    </div>
  );
}

function RouteComponent() {
  const navigate = useNavigate();
  const addCustomFood = useAddCustomFood();

  const [food_name, setFoodName] = React.useState("");
  const [energy_kcal, setCalories] = React.useState("");
  const [protein_g, setProtein] = React.useState("");
  const [carb_g, setCarbs] = React.useState("");
  const [fat_g, setFats] = React.useState("");
  const [fibre_g, setFibre] = React.useState("");
  const [servings_unit, setUnit] = React.useState("g");
  const [per_amount, setPerAmount] = React.useState("100");
  const [caloriesManuallySet, setCaloriesManuallySet] = React.useState(false);

  React.useEffect(() => {
    if (caloriesManuallySet) return;
    if (!protein_g && !carb_g && !fat_g) return;
    const calculated =
      (Number(protein_g) || 0) * 4 +
      (Number(carb_g) || 0) * 4 +
      (Number(fat_g) || 0) * 9;
    setCalories(calculated > 0 ? String(Math.round(calculated)) : "");
  }, [protein_g, carb_g, fat_g, caloriesManuallySet]);

  const isValid =
    food_name.trim() &&
    energy_kcal !== "" &&
    protein_g !== "" &&
    carb_g !== "" &&
    fat_g !== "" &&
    Number(per_amount) > 0;

  const handleSave = () => {
    if (!isValid) return;

    const amount = Number(per_amount) || 100;
    const factor = 100 / amount;

    addCustomFood({
      food_name,
      energy_kcal: Math.round(Number(energy_kcal) * factor),
      protein_g: Number(protein_g) * factor,
      carb_g: Number(carb_g) * factor,
      fat_g: Number(fat_g) * factor,
      fibre_g: Number(fibre_g || 0) * factor,
      servings_unit,
      per_amount: amount,
    });

    navigate({ to: "/food" });
  };

  const isCustomUnit = servings_unit && !UNITS.includes(servings_unit);

  return (
    <AppLayout>
      <div style={S.page} className="min-h-screen">
        <Header
          showBack
          title="Create Food"
          subtitle="Add your own food"
          right={
            <button
              onClick={handleSave}
              disabled={!isValid}
              className="rounded-xl px-3 py-2 text-sm font-semibold transition-opacity"
              style={{
                background: isValid ? S.amber : S.surface,
                color: isValid ? "#0e0e0e" : S.muted,
              }}
            >
              Save
            </button>
          }
        />

        <div className="space-y-3 px-4 pt-20 pb-8">
          {/* Name */}
          <div style={S.card} className="p-4">
            <p className="mb-2 text-xs" style={{ color: S.muted }}>
              Food name
            </p>
            <input
              autoFocus
              placeholder="e.g. Chicken Breast"
              value={food_name}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full px-3 py-2 text-sm outline-none"
              style={S.input}
            />
          </div>

          {/* Serving unit */}
          <div style={S.card} className="p-4">
            <p className="mb-3 text-xs" style={{ color: S.muted }}>
              Serving unit
            </p>
            <div className="flex flex-wrap gap-2">
              {UNITS.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className="rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
                  style={
                    servings_unit === u
                      ? { background: S.amber, color: "#0e0e0e" }
                      : { background: S.surface, color: S.muted }
                  }
                >
                  {u}
                </button>
              ))}
              {isCustomUnit && (
                <span
                  className="rounded-xl px-3 py-1.5 text-xs font-medium"
                  style={{ background: S.amber, color: "#0e0e0e" }}
                >
                  {servings_unit}
                </span>
              )}
            </div>
            <input
              placeholder="or type custom unit..."
              value={isCustomUnit ? servings_unit : ""}
              onChange={(e) => setUnit(e.target.value || "g")}
              className="mt-3 w-full px-3 py-2 text-sm outline-none"
              style={S.input}
            />
          </div>

          {/* Per amount row */}
          <div style={S.card} className="p-4">
            <div
              className="flex items-center gap-1 rounded-xl px-3 py-2.5"
              style={{ background: S.surface }}
            >
              <p className="flex-1 text-xs" style={{ color: S.muted }}>
                Values below are per
              </p>
              <input
                type="number"
                value={per_amount}
                onChange={(e) => setPerAmount(e.target.value)}
                className="w-16 rounded-lg px-2 py-1 text-center text-sm outline-none"
                style={S.input}
              />
              <p className="shrink-0 text-xs" style={{ color: S.muted }}>
                {servings_unit}
              </p>
            </div>
          </div>

          {/* Calories */}
          <div style={S.card} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs" style={{ color: S.muted }}>
                Calories
              </p>
              {!caloriesManuallySet && (protein_g || carb_g || fat_g) ? (
                <p className="text-xs" style={{ color: S.amber }}>
                  auto-calculated
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <input
                placeholder="0"
                type="number"
                value={energy_kcal}
                onChange={(e) => {
                  setCaloriesManuallySet(true);
                  setCalories(e.target.value);
                }}
                className="w-full px-3 py-2 text-sm outline-none"
                style={S.input}
              />
              <p className="shrink-0 text-xs" style={{ color: S.mutedDark }}>
                kcal
              </p>
            </div>
            {caloriesManuallySet && (
              <button
                onClick={() => setCaloriesManuallySet(false)}
                className="mt-2 text-xs"
                style={{ color: S.muted }}
              >
                Reset to auto-calculate
              </button>
            )}
          </div>

          {/* Macros */}
          <div style={S.card} className="space-y-4 p-4">
            <p className="text-xs" style={{ color: S.muted }}>
              Macros
            </p>

            <MacroInput
              label="Protein"
              unit="g"
              value={protein_g}
              onChange={setProtein}
            />
            <MacroInput
              label="Carbohydrates"
              unit="g"
              value={carb_g}
              onChange={setCarbs}
            />
            <MacroInput
              label="Fats"
              unit="g"
              value={fat_g}
              onChange={setFats}
            />
            <MacroInput
              label="Fibre"
              unit="g"
              value={fibre_g}
              onChange={setFibre}
              placeholder="optional"
            />
          </div>

          {/* Preview */}
          {isValid && (
            <div
              style={{ ...S.card, border: "1px solid #2a1f00" }}
              className="p-4"
            >
              <p className="mb-3 text-xs" style={{ color: S.muted }}>
                Preview
              </p>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{food_name}</p>
                  <p className="mt-0.5 text-xs" style={{ color: S.muted }}>
                    per {per_amount} {servings_unit}
                  </p>
                </div>
                <p className="text-sm font-semibold" style={{ color: S.amber }}>
                  {energy_kcal} kcal
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                {[
                  { label: "Protein", value: protein_g },
                  { label: "Carbs", value: carb_g },
                  { label: "Fats", value: fat_g },
                  ...(fibre_g ? [{ label: "Fibre", value: fibre_g }] : []),
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex-1 rounded-xl py-2 text-center"
                    style={{ background: S.surface }}
                  >
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "#f5f5f5" }}
                    >
                      {value}g
                    </p>
                    <p className="text-xs" style={{ color: S.mutedDark }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
