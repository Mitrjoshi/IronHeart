import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogMeasurement, useMeasurements } from "@/hooks/store/measurements";

export const Route = createFileRoute("/body/")({
  component: RouteComponent,
});

const MEASUREMENT_TYPES = [
  "Weight",
  "Chest",
  "Waist",
  "Arms",
  "Thigh",
  "Shoulders",
];

function RouteComponent() {
  const measurements = useMeasurements();
  const logMeasurement = useLogMeasurement();

  const [group, setGroup] = useState("Weight");
  const [value, setValue] = useState("");

  const handleAdd = () => {
    if (!value) return;
    logMeasurement(group, Number(value));
    setValue("");
  };

  return (
    <AppLayout>
      <Header
        title="Body Measurement"
        subtitle="Track your body measurements"
      />

      <div className="space-y-4 p-4">
        {/* Add Measurement */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Add Measurement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {MEASUREMENT_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={group === type ? "default" : "outline"}
                  onClick={() => setGroup(type)}
                  className="rounded-full whitespace-nowrap"
                >
                  {type}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={`Enter ${group}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type="number"
              />
              <Button onClick={handleAdd}>Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Measurements List */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {measurements.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No measurements logged yet.
              </p>
            )}

            {measurements
              .sort((a, b) => b.loggedAt - a.loggedAt)
              .map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="font-medium">{m.group}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(m.loggedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="text-lg font-semibold">{m.value}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
