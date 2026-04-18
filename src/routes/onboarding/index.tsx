import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { store } from "@/store/schema";
import React from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding/")({
  component: RouteComponent,
});

type Sex = "male" | "female";
type Goal = "lose" | "maintain" | "gain";
type Activity = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;

const ACTIVITY_OPTIONS: { label: string; sub: string; value: Activity }[] = [
  { label: "Sedentary", sub: "desk job, little exercise", value: 1.2 },
  { label: "Light", sub: "1–3 days/week", value: 1.375 },
  { label: "Moderate", sub: "3–5 days/week", value: 1.55 },
  { label: "Very active", sub: "6–7 days/week", value: 1.725 },
  { label: "Athlete", sub: "physical job + training", value: 1.9 },
];

const GOAL_OPTIONS: { label: string; value: Goal; delta: number }[] = [
  { label: "Lose weight", value: "lose", delta: -500 },
  { label: "Maintain", value: "maintain", delta: 0 },
  { label: "Build muscle", value: "gain", delta: 300 },
];

const STEPS = [
  "sex",
  "age",
  "height",
  "weight",
  "target",
  "activity",
  "goal",
  "result",
] as const;
type Step = (typeof STEPS)[number];

function calcBMR(sex: Sex, age: number, height: number, weight: number) {
  return sex === "female"
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;
}

function RouteComponent() {
  const navigate = useNavigate();

  const [step, setStep] = React.useState<Step>("sex");
  const [sex, setSex] = React.useState<Sex | null>(null);
  const [age, setAge] = React.useState(25);
  const [height, setHeight] = React.useState(170);
  const [weight, setWeight] = React.useState(70);
  const [target, setTarget] = React.useState(65);
  const [activity, setActivity] = React.useState<Activity | null>(null);
  const [goal, setGoal] = React.useState<Goal | null>(null);

  const stepIndex = STEPS.indexOf(step);
  const progress = Math.round((stepIndex / (STEPS.length - 1)) * 100);

  const results = React.useMemo(() => {
    if (!sex || !activity || !goal) return null;
    const delta = GOAL_OPTIONS.find((g) => g.value === goal)!.delta;
    const bmr = calcBMR(sex, age, height, weight);
    const tdee = Math.round(bmr * activity);
    const kcal = tdee + delta;
    const protein = Math.round(weight * 2);
    const fats = Math.round((kcal * 0.25) / 9);
    const carbs = Math.round((kcal - protein * 4 - fats * 9) / 4);
    const bmi = weight / Math.pow(height / 100, 2);
    const diff = target - weight;
    const weekly = delta / 7700;
    const weeks = weekly !== 0 ? Math.abs(diff / weekly) : 0;
    return { kcal, protein, fats, carbs, bmi, weeks, diff, tdee };
  }, [sex, age, height, weight, target, activity, goal]);

  const handleSave = () => {
    if (!results) return;
    store.setRow("settings", "user", {
      weightUnit: "kg",
      theme: "system",
      height,
      age,
      targetWeight: target,
      targetCalories: results.kcal,
      targetProtein: results.protein,
      targetCarbs: results.carbs,
      targetFats: results.fats,
    });
    navigate({ to: "/" });
  };

  const go = (s: Step) => setStep(s);

  const bmiCategory = (bmi: number) =>
    bmi < 18.5
      ? "Underweight"
      : bmi < 25
        ? "Healthy weight"
        : bmi < 30
          ? "Overweight"
          : "Obese";

  const Stepper = ({
    value,
    onChange,
    min,
    max,
    step: inc = 1,
  }: {
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step?: number;
  }) => (
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, +(value - inc).toFixed(1)))}
        className="border-border text-muted-foreground hover:bg-muted flex size-9 items-center justify-center rounded-full border text-lg transition-colors"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
        }}
        className="border-border text-foreground w-24 border-b-2 bg-transparent pb-1 text-center text-2xl font-medium outline-none focus:border-amber-400"
      />
      <button
        onClick={() => onChange(Math.min(max, +(value + inc).toFixed(1)))}
        className="border-border text-muted-foreground hover:bg-muted flex size-9 items-center justify-center rounded-full border text-lg transition-colors"
      >
        +
      </button>
    </div>
  );

  return (
    <>
      <Header
        title="Set up profile"
        subtitle="Just a few questions to get started"
      />

      <div className="mx-auto max-w-md px-4 pt-20 pb-10">
        {/* Progress bar */}
        <div className="bg-border mb-8 h-0.5 rounded-full">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step: sex */}
        {step === "sex" && (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
                Step 1 of 7
              </p>
              <h2 className="text-2xl font-medium">What's your sex?</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Used to calculate your metabolic rate accurately.
              </p>
            </div>
            <div className="flex gap-3">
              {(["male", "female"] as Sex[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className={cn(
                    "flex-1 rounded-full border py-3 text-sm capitalize transition-colors",
                    sex === s
                      ? "border-amber-500 bg-amber-50 font-medium text-amber-800"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={!sex}
              onClick={() => go("age")}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step: age */}
        {step === "age" && (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
                Step 2 of 7
              </p>
              <h2 className="text-2xl font-medium">How old are you?</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Age affects your metabolic rate and calorie targets.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Stepper value={age} onChange={setAge} min={10} max={100} />
              <span className="text-muted-foreground text-sm">years</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => go("height")}>
              Continue
            </Button>
            <button
              className="text-muted-foreground mt-2 w-full text-xs"
              onClick={() => go("sex")}
            >
              Back
            </button>
          </div>
        )}

        {/* Step: height */}
        {step === "height" && (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
                Step 3 of 7
              </p>
              <h2 className="text-2xl font-medium">How tall are you?</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Height is needed to estimate your body composition.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Stepper
                value={height}
                onChange={setHeight}
                min={100}
                max={250}
              />
              <span className="text-muted-foreground text-sm">cm</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => go("weight")}>
              Continue
            </Button>
            <button
              className="text-muted-foreground mt-2 w-full text-xs"
              onClick={() => go("age")}
            >
              Back
            </button>
          </div>
        )}

        {/* Step: weight */}
        {step === "weight" && (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
                Step 4 of 7
              </p>
              <h2 className="text-2xl font-medium">Current weight?</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                We'll use this to calculate your BMI and calorie needs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Stepper
                value={weight}
                onChange={setWeight}
                min={30}
                max={300}
                step={0.5}
              />
              <span className="text-muted-foreground text-sm">kg</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => go("target")}>
              Continue
            </Button>
            <button
              className="text-muted-foreground mt-2 w-full text-xs"
              onClick={() => go("height")}
            >
              Back
            </button>
          </div>
        )}

        {/* Step: target weight */}
        {step === "target" && (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
                Step 5 of 7
              </p>
              <h2 className="text-2xl font-medium">Target weight?</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                This helps us set a realistic calorie deficit or surplus.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Stepper
                value={target}
                onChange={setTarget}
                min={30}
                max={300}
                step={0.5}
              />
              <span className="text-muted-foreground text-sm">kg</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => go("activity")}>
              Continue
            </Button>
            <button
              className="text-muted-foreground mt-2 w-full text-xs"
              onClick={() => go("weight")}
            >
              Back
            </button>
          </div>
        )}

        {/* Step: activity */}
        {step === "activity" && (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
                Step 6 of 7
              </p>
              <h2 className="text-2xl font-medium">How active are you?</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Your activity level multiplies your base calorie needs.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActivity(opt.value)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                    activity === opt.value
                      ? "border-amber-500 bg-amber-50"
                      : "border-border text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "font-medium",
                      activity === opt.value
                        ? "text-amber-800"
                        : "text-foreground",
                    )}
                  >
                    {opt.label}
                  </span>
                  <span className="text-muted-foreground"> — {opt.sub}</span>
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={!activity}
              onClick={() => go("goal")}
            >
              Continue
            </Button>
            <button
              className="text-muted-foreground mt-2 w-full text-xs"
              onClick={() => go("target")}
            >
              Back
            </button>
          </div>
        )}

        {/* Step: goal */}
        {step === "goal" && (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2 text-xs tracking-widest uppercase">
                Step 7 of 7
              </p>
              <h2 className="text-2xl font-medium">What's your main goal?</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                This sets your calorie target relative to your maintenance.
              </p>
            </div>
            <div className="flex gap-3">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGoal(opt.value)}
                  className={cn(
                    "flex-1 rounded-xl border py-3 text-sm transition-colors",
                    goal === opt.value
                      ? "border-amber-500 bg-amber-50 font-medium text-amber-800"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={!goal}
              onClick={() => go("result")}
            >
              Calculate
            </Button>
            <button
              className="text-muted-foreground mt-2 w-full text-xs"
              onClick={() => go("activity")}
            >
              Back
            </button>
          </div>
        )}

        {/* Result */}
        {step === "result" && results && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-xs tracking-widest uppercase">
              Your daily target
            </p>
            <div className="bg-muted rounded-xl p-4">
              <p className="text-5xl font-medium">
                {results.kcal.toLocaleString()}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">kcal / day</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "protein",
                  value: results.protein,
                  unit: "g",
                  color: "text-blue-400",
                },
                {
                  label: "carbs",
                  value: results.carbs,
                  unit: "g",
                  color: "text-green-400",
                },
                {
                  label: "fats",
                  value: results.fats,
                  unit: "g",
                  color: "text-orange-400",
                },
              ].map(({ label, value, unit, color }) => (
                <div key={label} className="bg-muted rounded-xl p-3">
                  <p className="text-xl font-medium">
                    {value}
                    {unit}
                  </p>
                  <p className={`mt-1 text-xs ${color}`}>{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-muted space-y-2 rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">BMI</span>
                <span className="font-medium">
                  {results.bmi.toFixed(1)} — {bmiCategory(results.bmi)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Maintenance</span>
                <span className="font-medium">{results.tdee} kcal</span>
              </div>
              {results.diff !== 0 && results.weeks > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    To reach {target} kg
                  </span>
                  <span className="font-medium">
                    ~
                    {results.weeks < 8
                      ? `${Math.round(results.weeks)} weeks`
                      : `${(results.weeks / 4.33).toFixed(1)} months`}
                  </span>
                </div>
              )}
            </div>

            <Button className="w-full" size="lg" onClick={handleSave}>
              Save &amp; get started
            </Button>
            <button
              className="text-muted-foreground mt-2 w-full text-xs"
              onClick={() => go("goal")}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </>
  );
}
