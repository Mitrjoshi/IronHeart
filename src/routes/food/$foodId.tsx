import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/food/$foodId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/food/$foodId"!</div>;
}
