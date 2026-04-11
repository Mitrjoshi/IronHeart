import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";

export const Route = createFileRoute("/schedule/$id/excercise")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header showBack title="Add Exercise" subtitle="Chest" />

      <div className="space-y-2 pt-20 pb-4">
        <div className="space-y-2 p-4 py-0">
          <div className="flex items-center gap-2">
            <Input type="search" placeholder="Search..." />
            <Button variant="outline" size="icon">
              <Search />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
