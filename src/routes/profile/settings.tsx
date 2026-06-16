import { Header } from "@/components/Header";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Download,
  FileText,
  Copy,
  ClipboardPaste,
  Upload,
  FileUp,
} from "lucide-react";
import { store } from "@/store/schema";
import { exportDataToPdf } from "@/utils";

export const Route = createFileRoute("/profile/settings")({
  component: RouteComponent,
});

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5" },
  card: {
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 16,
  },
  dangerCard: {
    background: "#161616",
    border: "1px solid #3f1d1d",
    borderRadius: 16,
  },
  muted: "#737373",
  surface: "#1f1f1f",
  red: "#ef4444",
  amber: "#f59e0b",
};

function RouteComponent() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [importText, setImportText] = useState("");
  const [importConfirming, setImportConfirming] = useState(false);

  const handleDownloadJson = () => {
    const json = store.getJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitness-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data downloaded");
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(store.getJson());
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const handleDownloadPdf = () => {
    try {
      exportDataToPdf();
      toast.success("PDF generated");
    } catch {
      toast.error("Couldn't generate PDF");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error("Clipboard is empty");
        return;
      }
      setImportText(text);
      toast.success("Pasted from clipboard");
    } catch {
      toast.error("Couldn't read clipboard — paste manually");
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      try {
        JSON.parse(text);
      } catch {
        toast.error("That file isn't valid JSON");
        return;
      }
      setImportText(text);
      toast.success(`Loaded ${file.name}`);
    };
    reader.onerror = () => toast.error("Couldn't read that file");
    reader.readAsText(file);

    // reset so picking the same file again still fires onChange
    e.target.value = "";
  };

  const handleImport = () => {
    const text = importText.trim();
    if (!text) {
      toast.error("Choose a file or paste your backup first");
      return;
    }
    try {
      JSON.parse(text);
    } catch {
      toast.error("That doesn't look like valid JSON");
      return;
    }
    setImportConfirming(true);
  };

  const confirmImport = () => {
    try {
      store.setJson(importText.trim());
      setImportConfirming(false);
      setImportText("");
      toast.success("Data imported");
    } catch {
      toast.error("Couldn't import — wrong format");
    }
  };

  const handleDeleteAll = () => {
    store.delTables();
    setConfirming(false);
    toast.success("All data deleted");
    navigate({ to: "/onboarding" });
  };

  const btn = {
    base: "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors",
    style: {
      background: S.surface,
      color: "#f5f5f5",
      border: "1px solid #262626",
    },
  };

  return (
    <>
      <Header showBack title="Settings" subtitle="Manage your profile" />

      <div style={S.page} className="min-h-screen space-y-3 px-4 pt-20 pb-8">
        {/* Download / Copy Data */}
        <div style={S.card} className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Download size={14} style={{ color: S.amber }} />
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: S.amber }}
            >
              Your Data
            </p>
          </div>

          <p className="text-sm" style={{ color: S.muted }}>
            Export everything — workouts, schedules, weight log, nutrition and
            measurements. Download or copy the JSON for a backup you can
            re-import, or save a readable PDF.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadJson}
              className={btn.base}
              style={btn.style}
            >
              <Download size={15} />
              JSON
            </button>
            <button
              onClick={handleCopyJson}
              className={btn.base}
              style={btn.style}
            >
              <Copy size={15} />
              Copy
            </button>
            <button
              onClick={handleDownloadPdf}
              className={btn.base}
              style={btn.style}
            >
              <FileText size={15} />
              PDF
            </button>
          </div>
        </div>

        {/* Import Data */}
        <div style={S.card} className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Upload size={14} style={{ color: S.amber }} />
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: S.amber }}
            >
              Import Data
            </p>
          </div>

          <p className="text-sm" style={{ color: S.muted }}>
            Restore from a previously exported JSON backup — pick a file, paste
            from your clipboard, or drop the text in below. This replaces
            everything currently saved.
          </p>

          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste your JSON backup here, or load a file…"
            rows={4}
            spellCheck={false}
            className="w-full resize-none rounded-xl p-3 text-xs leading-relaxed outline-none"
            style={{
              background: S.surface,
              color: "#f5f5f5",
              border: "1px solid #262626",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
            }}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={btn.base}
              style={btn.style}
            >
              <FileUp size={15} />
              File
            </button>
            <button
              onClick={handlePasteFromClipboard}
              className={btn.base}
              style={btn.style}
            >
              <ClipboardPaste size={15} />
              Paste
            </button>
          </div>

          <button
            onClick={handleImport}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-opacity active:opacity-80"
            style={{ background: S.amber, color: "#0e0e0e" }}
          >
            <Upload size={15} />
            Import
          </button>
        </div>

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

      {/* Delete confirmation modal */}
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

      {/* Import confirmation modal */}
      {importConfirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setImportConfirming(false)}
        >
          <div
            className="w-full max-w-sm space-y-4 p-6"
            style={{
              background: "#161616",
              border: "1px solid #262626",
              borderRadius: 20,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "rgba(245,158,11,0.12)" }}
            >
              <AlertTriangle size={22} style={{ color: S.amber }} />
            </div>

            <div className="space-y-1.5 text-center">
              <p
                className="text-base font-semibold"
                style={{ color: "#f5f5f5" }}
              >
                Replace all data?
              </p>
              <p className="text-sm leading-relaxed" style={{ color: S.muted }}>
                Importing will overwrite everything currently saved with the
                pasted backup. This cannot be undone.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setImportConfirming(false)}
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
                onClick={confirmImport}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-opacity active:opacity-80"
                style={{ background: S.amber, color: "#0e0e0e" }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
