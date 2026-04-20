import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { FOODS } from "@/constants/foods";
import { normalizeFood } from "@/utils";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Search } from "lucide-react";
import React from "react";
import { z } from "zod";

export const Route = createFileRoute("/food/")({
  component: RouteComponent,
  validateSearch: z.object({
    search: z.string().catch(""),
  }),
});

const PAGE_SIZE = 20;

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
    borderRadius: 12,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  surface: "#1f1f1f",
  divider: { borderColor: "#1f1f1f" },
};

function RouteComponent() {
  const navigate = Route.useNavigate();
  const searchTerm = Route.useSearch().search;

  const [inputValue, setInputValue] = React.useState(searchTerm);
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const t = setTimeout(
      () => navigate({ search: { search: inputValue } }),
      300,
    );
    return () => clearTimeout(t);
  }, [inputValue]);

  React.useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm]);

  const normalizedFoods = React.useMemo(
    () =>
      FOODS.filter((f) =>
        f.food_name.toLowerCase().includes(searchTerm.toLowerCase()),
      ).map(normalizeFood),
    [searchTerm],
  );

  const visibleFoods = normalizedFoods.slice(0, visibleCount);
  const hasMore = visibleCount < normalizedFoods.length;

  React.useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((c) => c + PAGE_SIZE);
      },
      { threshold: 0.1 },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  return (
    <AppLayout>
      <Header title="Food" subtitle="Track your meals" />

      <div style={S.page} className="min-h-screen pt-20 pb-8">
        {/* Search */}
        <div
          className="px-4 pb-3"
          style={{ borderBottom: "1px solid #1f1f1f" }}
        >
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              style={{ color: S.mutedDark }}
            />
            <input
              placeholder="Search food..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full py-2.5 pr-3 pl-9 text-sm transition-colors outline-none placeholder:text-[#404040] focus:border-amber-500"
              style={S.input}
            />
          </div>
        </div>

        {/* Results count */}
        {searchTerm && (
          <div className="px-4 py-2">
            <p className="text-xs" style={{ color: S.mutedDark }}>
              {normalizedFoods.length} result
              {normalizedFoods.length !== 1 ? "s" : ""} for "{searchTerm}"
            </p>
          </div>
        )}

        {/* Food list */}
        <div className="space-y-2 px-4 pt-2">
          {visibleFoods.map((food) => (
            <div
              key={food.name}
              style={S.card}
              className="cursor-pointer transition-opacity active:opacity-80"
              onClick={() =>
                navigate({
                  to: "/food/$foodId",
                  params: { foodId: food.food_code },
                })
              }
            >
              {/* Top row */}
              <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
                <p className="min-w-0 flex-1 truncate text-sm leading-snug font-medium">
                  {food.name}
                </p>
                <ChevronRight
                  size={15}
                  className="shrink-0"
                  style={{ color: S.mutedDark }}
                />
              </div>

              {/* Calorie line */}
              <div className="px-4 pb-2">
                <p className="text-xs" style={{ color: S.muted }}>
                  <span style={{ color: S.amber }}>
                    {food.serving.calories.toFixed(0)} kcal
                  </span>
                  {" per "}
                  {food.serving.unit}
                  {food.serving.measurement && (
                    <>
                      {" "}
                      ({Math.round(food.serving.quantity)}{" "}
                      {food.serving.measurement})
                    </>
                  )}
                </p>
              </div>

              {/* Macro row */}
              <div
                className="flex items-center justify-around px-4 py-2"
                style={{ borderTop: "1px solid #1a1a1a" }}
              >
                <div className="text-center">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#818cf8" }}
                  >
                    {food.serving.protein.toFixed(1)}g
                  </p>
                  <p className="text-[10px]" style={{ color: S.mutedDark }}>
                    Protein
                  </p>
                </div>
                <div className="h-6 w-px" style={{ background: "#1f1f1f" }} />
                <div className="text-center">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#34d399" }}
                  >
                    {food.serving.carbs.toFixed(1)}g
                  </p>
                  <p className="text-[10px]" style={{ color: S.mutedDark }}>
                    Carbs
                  </p>
                </div>
                <div className="h-6 w-px" style={{ background: "#1f1f1f" }} />
                <div className="text-center">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#fb923c" }}
                  >
                    {food.serving.fats.toFixed(1)}g
                  </p>
                  <p className="text-[10px]" style={{ color: S.mutedDark }}>
                    Fat
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="py-4 text-center">
              <p className="text-xs" style={{ color: S.mutedDark }}>
                Loading more...
              </p>
            </div>
          )}

          {!hasMore && normalizedFoods.length > PAGE_SIZE && (
            <p
              className="py-2 text-center text-xs"
              style={{ color: S.mutedDark }}
            >
              All {normalizedFoods.length} results shown
            </p>
          )}

          {normalizedFoods.length === 0 && searchTerm && (
            <div
              style={S.card}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <p className="text-sm" style={{ color: S.muted }}>
                No results for "{searchTerm}"
              </p>
              <p className="mt-1 text-xs" style={{ color: S.mutedDark }}>
                Try a different search term
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
