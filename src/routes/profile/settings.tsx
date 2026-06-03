import { Header } from "@/components/Header";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { store } from "@/store/schema";

export const Route = createFileRoute("/profile/settings")({
  component: RouteComponent,
});

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5" },
  dangerCard: {
    background: "#161616",
    border: "1px solid #3f1d1d",
    borderRadius: 16,
  },
  muted: "#737373",
  surface: "#1f1f1f",
  red: "#ef4444",
};

function RouteComponent() {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const handleDeleteAll = () => {
    store.delTables();
    setConfirming(false);
    toast.success("All data deleted");
    navigate({ to: "/onboarding" });
  };

  return (
    <>
      <Header showBack title="Settings" subtitle="Manage your profile" />

      <div style={S.page} className="min-h-screen space-y-3 px-4 pt-20 pb-8">
        {/* Danger zone */}
        <div style={S.dangerCard} className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} style={{ color: S.red }} />
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: S.red }}
            >
              Danger Zone
            </p>
          </div>

          <p className="text-sm" style={{ color: S.muted }}>
            This permanently deletes all your logged weight entries and resets
            your profile. This action cannot be undone.
          </p>

          <button
            onClick={() => setConfirming(true)}
            className="w-full rounded-xl py-2.5 text-sm font-semibold transition-colors"
            style={{
              background: "transparent",
              color: S.red,
              border: "1px solid #3f1d1d",
            }}
          >
            Delete All Data
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setConfirming(false)}
        >
          <div
            className="w-full max-w-sm space-y-4 p-6"
            style={{
              background: "#161616",
              border: "1px solid #3f1d1d",
              borderRadius: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(239,68,68,0.12)" }}
            >
              <AlertTriangle size={22} style={{ color: S.red }} />
            </div>

            <div className="space-y-1.5 text-center">
              <p
                className="text-base font-semibold"
                style={{ color: "#f5f5f5" }}
              >
                Delete all data?
              </p>
              <p className="text-sm leading-relaxed" style={{ color: S.muted }}>
                This will erase every weight entry and reset your profile. This
                action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors"
                style={{
                  background: S.surface,
                  color: "#f5f5f5",
                  border: "1px solid #262626",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity active:opacity-80"
                style={{ background: S.red, color: "#0e0e0e" }}
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
