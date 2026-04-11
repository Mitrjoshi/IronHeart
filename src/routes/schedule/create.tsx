import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/schedule/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const router = useRouter();

  return (
    <>
      <Header showBack title="Add Workout" subtitle="Workout Tracker" />

      <div className="space-y-4 pt-20">
        <div className="space-y-2 p-4 py-0">
          <div className="flex flex-col space-y-2">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div className="w-full">
                  <Input className="w-full" placeholder="Workout Name" />
                </div>
              </CardHeader>

              <Separator />

              <CardContent>
                <Button
                  onClick={() => {
                    navigate({
                      to: "/schedule/$id/excercise",
                      params: {
                        id: "chest",
                      },
                    });
                  }}
                  variant={"outline"}
                  className="w-full cursor-pointer"
                  size="lg"
                >
                  <Plus />
                  <p>Add Exercise</p>
                </Button>
              </CardContent>
              <CardFooter className="flex-col space-y-2">
                <Button
                  onClick={() => {
                    router.history.back();
                  }}
                  className="w-full cursor-pointer"
                  size="lg"
                >
                  <p>Save</p>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
