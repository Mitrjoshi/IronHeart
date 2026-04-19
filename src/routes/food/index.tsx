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

const PAGE_SIZE = 20;

function RouteComponent() {
  const navigate = Route.useNavigate();
  const searchTerm = Route.useSearch().search;

  const [inputValue, setInputValue] = React.useState(searchTerm);
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ search: { search: inputValue } });
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Reset visible count when search changes
  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm]);

  const NORMALIZED_FOODS = React.useMemo(
    () =>
      FOODS.filter((f) =>
        f.food_name.toLowerCase().includes(searchTerm.toLowerCase()),
      ).map(normalizeFood),
    [searchTerm],
  );

  const visibleFoods = NORMALIZED_FOODS.slice(0, visibleCount);
  const hasMore = visibleCount < NORMALIZED_FOODS.length;

  React.useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => c + PAGE_SIZE);
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  return (
    <AppLayout>
      <Header title="Food" subtitle="Track your meals" />

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
          {visibleFoods.map((food) => (
            <Card
              onClick={() =>
                navigate({
                  to: "/food/$foodId",
                  params: { foodId: food.food_code },
                })
              }
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

          {/* Sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="py-4 text-center">
              <p className="text-muted-foreground text-sm">Loading more...</p>
            </div>
          )}

          {!hasMore && NORMALIZED_FOODS.length > PAGE_SIZE && (
            <p className="text-muted-foreground pb-2 text-center text-sm">
              All {NORMALIZED_FOODS.length} results shown
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
