import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FOODS } from "@/constants/foods";
import { normalizeFood } from "@/utils";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import React from "react";
import { z } from "zod";

export const Route = createFileRoute("/food/")({
  component: RouteComponent,
  validateSearch: z.object({
    search: z.string().catch(""),
  }),
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const searchTerm = Route.useSearch().search;

  const [inputValue, setInputValue] = React.useState(searchTerm);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ search: { search: inputValue } });
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const NORMALIZED_FOODS = React.useMemo(
    () =>
      FOODS.filter((f) =>
        f.food_name.toLowerCase().includes(searchTerm.toLowerCase()),
      ).map(normalizeFood),
    [FOODS, searchTerm],
  );

  return (
    <AppLayout>
      <Header title="Food" subtitle="Track your meals" showBack />

      <div className="space-y-4 pt-20">
        <div className="px-4">
          <Input
            placeholder="Search for food..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <Separator />

        <div className="space-y-2 px-4 pb-4">
          {NORMALIZED_FOODS.map((food) => (
            <Card
              onClick={() => {
                navigate({
                  to: "/food/$foodId",
                  params: {
                    foodId: food.food_code,
                  },
                });
              }}
              key={food.name}
              className="cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>{food.name}</CardTitle>
                  <ChevronRight className="text-muted-foreground" size={18} />
                </div>
                <CardDescription>
                  {food.serving.calories.toFixed(0)} kcal per{" "}
                  {food.serving.unit}
                  {food.serving.measurement && (
                    <>
                      {" "}
                      ({Math.round(food.serving.quantity)}{" "}
                      {food.serving.measurement})
                    </>
                  )}
                </CardDescription>
              </CardHeader>

              <CardFooter className="flex items-center justify-around gap-2">
                {food.serving.protein.toFixed(1)} g Protein
                <Separator orientation="vertical" />
                {food.serving.carbs.toFixed(1)} g Carbs
                <Separator orientation="vertical" />
                {food.serving.fats.toFixed(1)} g Fat
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
