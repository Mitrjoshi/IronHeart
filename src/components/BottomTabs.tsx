import { Link, useRouterState } from "@tanstack/react-router";
import { Apple, Dumbbell, House, Ruler, User2Icon } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: House },
  { to: "/schedule", label: "Schedule", icon: Dumbbell },
  { to: "/food", label: "Food", icon: Apple },
  { to: "/measurements", label: "Measure", icon: Ruler },
  { to: "/profile", label: "Profile", icon: User2Icon },
];

export const BottomTabs = () => {
  const { location } = useRouterState();

  return (
    <div className="bg-background sticky bottom-0 w-full border-t">
      <div className="flex items-center justify-around p-2">
        {tabs.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to);

          return (
            <Link
              key={to}
              to={to}
              className="flex flex-1 flex-col items-center gap-1 px-3 py-2"
            >
              <Icon
                size={18}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <p
                className={`text-xs ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                {label}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
