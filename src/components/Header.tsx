import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type HeaderProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode; // actions (icons/buttons)
  className?: string;
};

export function Header({
  title,
  subtitle,
  showBack = false,
  right,
  className,
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "flex items-center p-4 py-2 justify-between border-b fixed top-0 left-0 right-0 bg-background z-10",
        className,
      )}
    >
      {/* LEFT */}
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            onClick={() => navigate({ to: ".." })}
            className="p-2 rounded-lg hover:bg-muted transition"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="flex flex-col min-w-0">
          {title && <div className="text-2xl font-bold truncate">{title}</div>}
          {subtitle && (
            <div className="text-xs text-muted-foreground truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  );
}
