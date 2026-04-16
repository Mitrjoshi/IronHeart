import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FOODS } from "@/constants/foods";
import { normalizeFood } from "@/utils";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp } from "lucide-react";
import React from "react";

export const Route = createFileRoute("/food/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchTerm, setSearchTerm] = React.useState("");

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Separator />

        <div className="space-y-2 px-4 pb-4">
          {NORMALIZED_FOODS.map((food) => (
            <Card key={food.name}>
              <CardHeader>
                {food.name}
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
