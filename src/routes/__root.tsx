import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      const reg = await navigator.serviceWorker.register("/sw.js");

      reg.addEventListener("updatefound", () => {
        const newSW = reg.installing;
        newSW?.addEventListener("statechange", () => {
          if (
            newSW.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New version available — reload to activate
            window.location.reload();
          }
        });
      });
    });
  }

  return (
    <React.Fragment>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Outlet />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
      {/* <TanStackRouterDevtools /> */}
    </React.Fragment>
  );
}
