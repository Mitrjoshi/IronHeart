import React from "react";
import { BottomTabs } from "./BottomTabs";

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1">{children}</div>
      <BottomTabs />
    </div>
  );
};
