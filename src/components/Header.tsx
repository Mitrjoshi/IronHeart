import { ArrowLeft } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
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
  const router = useRouter();

  return (
    <div
      className={cn(
        "bg-background fixed top-0 right-0 left-0 z-10 flex items-center justify-between border-b p-4 py-2",
        className,
      )}
    >
      {/* LEFT */}
      <div className="flex min-w-0 items-center gap-3">
        {showBack && (
          <button
            onClick={() => router.history.back()}
            className="hover:bg-muted rounded-lg p-2 transition"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="flex min-w-0 flex-col">
          {title && <div className="truncate text-2xl font-bold">{title}</div>}
          {subtitle && (
            <div className="text-muted-foreground truncate text-xs">
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
