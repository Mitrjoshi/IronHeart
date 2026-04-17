import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
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
import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/food/$foodId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const foodId = Route.useParams().foodId;

  const NORMALIZED_FOODS = React.useMemo(
    () => FOODS.filter((f) => f.food_code === foodId).map(normalizeFood),
    [FOODS, foodId],
  );

  return (
    <>
      <Sheet>
        <Header
          showBack
          title={NORMALIZED_FOODS[0].name}
          subtitle="Add food to count your calories"
          right={
            <>
              <SheetTrigger>
                <Button variant="outline" size="lg">
                  Add Meal
                </Button>
              </SheetTrigger>
              <SheetContent side={"bottom"}>
                <SheetHeader>
                  <SheetTitle>Add {NORMALIZED_FOODS[0].name}</SheetTitle>
                  <SheetDescription>
                    Add this food to your daily meal log.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 pb-4">
                  <Input placeholder="Notes (optional)" />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder={`Quantity ${NORMALIZED_FOODS[0].serving.measurement}`}
                    />

                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Meal Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />
                  <Button size="lg" className="w-full">
                    Add to Meal Log
                  </Button>
                </div>
              </SheetContent>
            </>
          }
        />

        <div className="space-y-4 pt-20">
          <div className="px-4">
            <Card>
              <CardHeader>
                <CardTitle>{NORMALIZED_FOODS[0].name}</CardTitle>
                <CardDescription>
                  {NORMALIZED_FOODS[0].serving.calories.toFixed(0)} kcal per{" "}
                  {NORMALIZED_FOODS[0].serving.unit}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-around">
                <p>{NORMALIZED_FOODS[0].serving.calories.toFixed(0)} kcal</p>
                <Separator orientation="vertical" />
                <p>{NORMALIZED_FOODS[0].serving.protein.toFixed(1)}g protein</p>
                <Separator orientation="vertical" />
                <p>{NORMALIZED_FOODS[0].serving.carbs.toFixed(1)}g carbs</p>
                <Separator orientation="vertical" />
                <p>{NORMALIZED_FOODS[0].serving.fats.toFixed(1)}g fat</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Sheet>
    </>
  );
}
