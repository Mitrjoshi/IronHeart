import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/schedule/$id/start")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/schedule/$id/start"!</div>;
}
