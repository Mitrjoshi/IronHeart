/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Header } from "@/components/Header";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ImagePlus,
  Camera,
  SwitchCamera,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Images,
  GitCompare,
  Check,
  Share2,
  Film,
  MoveHorizontal,
  Loader2,
} from "lucide-react";
import { useTable } from "tinybase/ui-react";
import { store } from "@/store/schema";
// @ts-ignore
import { GIFEncoder, quantize, applyPalette } from "gifenc";

export const Route = createFileRoute("/measurements/gallery")({
  component: RouteComponent,
});

const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5" },
  card: {
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 16,
  },
  muted: "#737373",
  surface: "#1f1f1f",
  amber: "#f59e0b",
  red: "#ef4444",
};

// ---- IndexedDB blob store (images live here, not in TinyBase) ----
const DB_NAME = "progress-photos";
const STORE = "photos";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbPut(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function idbGet(id: string): Promise<Blob | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
}
async function idbDelete(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// id that works on non-secure origins too (randomUUID is secure-context only)
function newId(): string {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch {
    /* needs secure context */
  }
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function compressImage(
  file: File,
  maxDim = 1280,
  quality = 0.82,
): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    } as ImageBitmapOptions);
  } catch {
    bitmap = await createImageBitmap(file);
  }
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    throw new Error("no canvas context");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob: Blob | null = await new Promise((res) =>
    canvas.toBlob((b) => res(b), "image/jpeg", quality),
  );
  if (!blob) throw new Error("toBlob failed");
  return blob;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function shareOrDownload(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type });
  const nav = navigator as Navigator & {
    canShare?: (d: { files: File[] }) => boolean;
  };
  if (nav.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  if ((ctx as any).roundRect) (ctx as any).roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  bottom: number,
  align: "left" | "right",
  canvasW: number,
) {
  const fs = 24;
  ctx.font = `600 ${fs}px system-ui, -apple-system, sans-serif`;
  const tw = ctx.measureText(text).width;
  const padX = 10;
  const padY = 6;
  const boxW = tw + padX * 2;
  const boxH = fs + padY * 2;
  let bx = align === "left" ? x : x - boxW;
  bx = Math.max(4, Math.min(bx, canvasW - boxW - 4));
  const by = bottom - boxH;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  roundRect(ctx, bx, by, boxW, boxH, 6);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(text, bx + padX, by + boxH / 2 + 1);
}

const fmtDate = (t: number) =>
  new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(t);

function RouteComponent() {
  const photosTable = useTable("photos", store) as Record<
    string,
    { loggedAt: number; note?: string }
  >;

  const ids = useMemo(
    () =>
      Object.keys(photosTable).sort(
        (a, b) =>
          (photosTable[b].loggedAt ?? 0) - (photosTable[a].loggedAt ?? 0),
      ),
    [photosTable],
  );

  const [urls, setUrls] = useState<Record<string, string>>({});
  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const [adding, setAdding] = useState(false);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [sel, setSel] = useState<string[]>([]);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [ghostOpacity, setGhostOpacity] = useState(0.35);
  const [sliderPos, setSliderPos] = useState(50);
  const [exporting, setExporting] = useState(false);

  const viewerIndex = viewerId ? ids.indexOf(viewerId) : -1;

  // before (older) / after (newer)
  const pair = useMemo(() => {
    if (sel.length !== 2) return null;
    return [...sel].sort(
      (x, y) =>
        (photosTable[x]?.loggedAt ?? 0) - (photosTable[y]?.loggedAt ?? 0),
    ) as [string, string];
  }, [sel, photosTable]);

  const ghostId = ids[0]; // newest existing photo = pose guide

  // create/revoke object URLs as the photo set changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = { ...urlsRef.current };
      let changed = false;
      for (const id of Object.keys(photosTable)) {
        if (!next[id]) {
          try {
            const blob = await idbGet(id);
            if (cancelled) return;
            if (blob) {
              next[id] = URL.createObjectURL(blob);
              changed = true;
            }
          } catch {
            /* ignore a single bad read */
          }
        }
      }
      for (const id of Object.keys(next)) {
        if (!photosTable[id]) {
          URL.revokeObjectURL(next[id]);
          delete next[id];
          changed = true;
        }
      }
      if (changed && !cancelled) setUrls(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [photosTable]);

  useEffect(
    () => () => {
      Object.values(urlsRef.current).forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  // camera lifecycle
  useEffect(() => {
    if (!captureOpen) return;
    let active = true;
    let local: MediaStream | null = null;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error("Camera needs HTTPS — use Upload instead");
        setCaptureOpen(false);
        return;
      }
      try {
        local = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        if (!active) {
          local.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = local;
        if (videoRef.current) {
          videoRef.current.srcObject = local;
          videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        console.error("camera error", err);
        toast.error(
          window.isSecureContext
            ? "Couldn't access the camera"
            : "Camera needs HTTPS — use Upload instead",
        );
        if (active) setCaptureOpen(false);
      }
    })();
    return () => {
      active = false;
      local?.getTracks().forEach((t) => t.stop());
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [captureOpen, facing]);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/"),
    );
    e.target.value = "";
    if (!files.length) return;
    setAdding(true);
    try {
      for (const file of files) {
        const blob = await compressImage(file);
        const id = newId();
        await idbPut(id, blob);
        store.setRow("photos", id, { loggedAt: Date.now(), note: "" });
      }
    } catch (err) {
      console.error("save photo failed:", err);
      toast.error(
        err instanceof Error
          ? `Couldn't save: ${err.message}`
          : "Couldn't save photo",
      );
    } finally {
      setAdding(false);
    }
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    try {
      const maxDim = 1280;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const scale = Math.min(1, maxDim / Math.max(vw, vh));
      const w = Math.round(vw * scale);
      const h = Math.round(vh * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas context");

      if (facing === "user") {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, w, h);
      const blob: Blob | null = await new Promise((res) =>
        canvas.toBlob((b) => res(b), "image/jpeg", 0.82),
      );
      if (!blob) throw new Error("capture failed");
      const id = newId();
      await idbPut(id, blob);
      store.setRow("photos", id, { loggedAt: Date.now(), note: "" });
      setCaptureOpen(false);
      toast.success("Photo saved");
    } catch (err) {
      console.error("capture failed:", err);
      toast.error("Couldn't capture photo");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await idbDelete(id);
      store.delRow("photos", id);
    } catch {
      toast.error("Couldn't delete photo");
    }
    setConfirmId(null);
    setViewerId(null);
    setSel((s) => s.filter((x) => x !== id));
  };

  const onTileClick = (id: string) => {
    if (compareMode) {
      setSliderPos(50);
      setSel((s) =>
        s.includes(id)
          ? s.filter((x) => x !== id)
          : s.length < 2
            ? [...s, id]
            : [s[1], id],
      );
    } else {
      openViewer(id);
    }
  };

  // before/after slider drag
  const updatePos = (clientX: number) => {
    const el = sliderRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pct)));
  };

  const exportImage = async () => {
    if (!pair) return;
    const [bId, aId] = pair;
    try {
      const [bImg, aImg] = await Promise.all([
        loadImg(urls[bId]),
        loadImg(urls[aId]),
      ]);
      const w = Math.min(aImg.naturalWidth || 1080, 1080);
      const h = Math.round(
        w * ((aImg.naturalHeight || 1) / (aImg.naturalWidth || 1)),
      );
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no ctx");
      ctx.drawImage(aImg, 0, 0, w, h);
      const splitX = Math.round((sliderPos / 100) * w);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();
      ctx.drawImage(bImg, 0, 0, w, h);
      ctx.restore();
      ctx.fillStyle = "#fff";
      ctx.fillRect(Math.max(0, Math.min(splitX - 1, w - 2)), 0, 2, h);
      drawLabel(ctx, fmtDate(photosTable[bId].loggedAt), 12, h - 12, "left", w);
      drawLabel(
        ctx,
        fmtDate(photosTable[aId].loggedAt),
        w - 12,
        h - 12,
        "right",
        w,
      );
      const blob: Blob | null = await new Promise((res) =>
        canvas.toBlob((b) => res(b), "image/jpeg", 0.9),
      );
      if (!blob) throw new Error("export failed");
      await shareOrDownload(blob, "before-after.jpg");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't export image");
    }
  };

  const exportGif = async () => {
    if (!pair) return;
    setExporting(true);
    try {
      const [bId, aId] = pair;
      const [bImg, aImg] = await Promise.all([
        loadImg(urls[bId]),
        loadImg(urls[aId]),
      ]);
      const w = 360;
      const h = Math.round(
        w * ((aImg.naturalHeight || 1) / (aImg.naturalWidth || 1)),
      );
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("no ctx");
      const gif = GIFEncoder();
      const frames = 16;
      for (let i = 0; i < frames; i++) {
        const split = Math.round((i / (frames - 1)) * w);
        ctx.drawImage(aImg, 0, 0, w, h);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, split, h);
        ctx.clip();
        ctx.drawImage(bImg, 0, 0, w, h);
        ctx.restore();
        ctx.fillStyle = "#fff";
        ctx.fillRect(Math.max(0, Math.min(split - 1, w - 2)), 0, 2, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        gif.writeFrame(index, w, h, {
          palette,
          delay: i === frames - 1 ? 800 : 70,
        });
      }
      gif.finish();
      const blob = new Blob([gif.bytes()], { type: "image/gif" });
      await shareOrDownload(blob, "before-after.gif");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't export GIF");
    } finally {
      setExporting(false);
    }
  };

  const openViewer = (id: string) => {
    window.history.pushState({ galleryViewer: true }, "", window.location.href);

    setViewerId(id);
  };

  const closeViewer = () => {
    setViewerId(null);
  };

  const showOlder = () => {
    if (viewerIndex < ids.length - 1) {
      setViewerId(ids[viewerIndex + 1]);
    }
  };

  const showNewer = () => {
    if (viewerIndex > 0) {
      setViewerId(ids[viewerIndex - 1]);
    }
  };

  const openCamera = () => {
    history.pushState({ camera: true }, "");
    setCaptureOpen(true);
  };

  useEffect(() => {
    const onPopState = () => {
      if (viewerId) {
        setViewerId(null);
        return;
      }

      if (captureOpen) {
        setCaptureOpen(false);
        return;
      }

      if (confirmId) {
        setConfirmId(null);
        return;
      }

      if (sel.length === 2) {
        setSel([]);
        return;
      }
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [viewerId, captureOpen, confirmId, sel]);

  return (
    <>
      <Header showBack title="Gallery" subtitle="Progress photos" />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      <div style={S.page} className="min-h-screen space-y-3 px-4 pt-20 pb-8">
        {ids.length === 0 ? (
          <div
            style={S.card}
            className="flex flex-col items-center gap-3 px-6 py-16 text-center"
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: S.surface }}
            >
              <Images size={24} style={{ color: S.muted }} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold" style={{ color: "#f5f5f5" }}>
                No photos yet
              </p>
              <p className="text-sm" style={{ color: S.muted }}>
                Take or upload your first progress photo to start tracking
                change over time.
              </p>
            </div>
            <div className="mt-1 flex w-full gap-2">
              <button
                onClick={openCamera}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold active:opacity-80"
                style={{ background: S.amber, color: "#0e0e0e" }}
              >
                <Camera size={15} />
                Take photo
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
                style={{
                  background: S.surface,
                  color: "#f5f5f5",
                  border: "1px solid #262626",
                }}
              >
                <ImagePlus size={15} />
                Upload
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {ids.length >= 2 && (
                <button
                  onClick={() => {
                    setCompareMode((m) => !m);
                    setSel([]);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    background: compareMode ? S.amber : S.surface,
                    color: compareMode ? "#0e0e0e" : "#f5f5f5",
                    border: `1px solid ${compareMode ? S.amber : "#262626"}`,
                  }}
                >
                  <GitCompare size={15} />
                  Compare
                </button>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={adding}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-opacity active:opacity-80 disabled:opacity-60"
                style={{
                  background: S.surface,
                  color: "#f5f5f5",
                  border: "1px solid #262626",
                }}
              >
                <ImagePlus size={15} />
                {adding ? "…" : "Upload"}
              </button>
              <button
                onClick={() => setCaptureOpen(true)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-opacity active:opacity-80"
                style={{ background: S.amber, color: "#0e0e0e" }}
              >
                <Camera size={15} />
                Camera
              </button>
            </div>

            {compareMode && (
              <p className="text-xs" style={{ color: S.muted }}>
                Select two photos to compare ({sel.length}/2)
              </p>
            )}

            <div className="grid grid-cols-3 gap-1.5">
              {ids.map((id) => {
                const url = urls[id];
                const selected = sel.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => onTileClick(id)}
                    className="relative aspect-square overflow-hidden rounded-lg"
                    style={{
                      border: selected
                        ? `2px solid ${S.amber}`
                        : "1px solid #262626",
                      background: S.surface,
                    }}
                  >
                    {url ? (
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full animate-pulse"
                        style={{ background: "#1a1a1a" }}
                      />
                    )}
                    <div
                      className="absolute inset-x-0 bottom-0 px-1.5 py-1"
                      style={{
                        background:
                          "linear-gradient(transparent, rgba(0,0,0,0.75))",
                      }}
                    >
                      <span className="text-[9px] font-medium text-white">
                        {fmtDate(photosTable[id].loggedAt)}
                      </span>
                    </div>
                    {compareMode && selected && (
                      <div
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full"
                        style={{ background: S.amber }}
                      >
                        <Check size={12} color="#0e0e0e" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Single-photo viewer */}
      {viewerId &&
        photosTable[viewerId] &&
        (() => {
          const vid = viewerId;
          return (
            <div
              className="fixed inset-0 z-50 flex flex-col"
              style={{ background: "rgba(0,0,0,0.96)" }}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-white">
                  {fmtDate(photosTable[vid].loggedAt)}
                </span>
                <button onClick={() => setViewerId(null)}>
                  <X size={22} color="#f5f5f5" />
                </button>
              </div>
              <div
                className="relative flex flex-1 items-center justify-center overflow-hidden px-2"
                onClick={closeViewer}
                onTouchStart={(e) => {
                  touchStartX.current = e.touches[0].clientX;
                  touchStartY.current = e.touches[0].clientY;
                }}
                onTouchEnd={(e) => {
                  if (
                    touchStartX.current === null ||
                    touchStartY.current === null
                  ) {
                    return;
                  }

                  const dx = e.changedTouches[0].clientX - touchStartX.current;

                  const dy = e.changedTouches[0].clientY - touchStartY.current;

                  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
                    if (dx < 0) {
                      // swipe LEFT -> OLDER photo
                      showOlder();
                    } else {
                      // swipe RIGHT -> NEWER photo
                      showNewer();
                    }
                  }

                  touchStartX.current = null;
                  touchStartY.current = null;
                }}
              >
                {urls[vid] && (
                  <img
                    src={urls[vid]}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                {viewerIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showNewer();
                    }}
                    className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full p-2"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <ChevronLeft size={22} color="#f5f5f5" />
                  </button>
                )}
                {viewerIndex < ids.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showOlder();
                    }}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-2"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <ChevronRight size={22} color="#f5f5f5" />
                  </button>
                )}
              </div>
              <div
                className="space-y-2 px-4 py-3"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <input
                  value={photosTable[vid].note ?? ""}
                  onChange={(e) =>
                    store.setCell("photos", vid, "note", e.target.value)
                  }
                  placeholder="Add a note…"
                  className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                  style={{
                    background: S.surface,
                    color: "#f5f5f5",
                    border: "1px solid #262626",
                  }}
                />
                <button
                  onClick={() => setConfirmId(vid)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
                  style={{
                    background: "transparent",
                    color: S.red,
                    border: "1px solid #3f1d1d",
                  }}
                >
                  <Trash2 size={15} />
                  Delete photo
                </button>
              </div>
            </div>
          );
        })()}

      {/* Before / after slider */}
      {pair &&
        (() => {
          const [bId, aId] = pair;
          return (
            <div
              className="fixed inset-0 z-50 flex flex-col"
              style={{ background: "#000" }}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-medium text-white">
                  Before / After
                </span>
                <button onClick={() => setSel([])}>
                  <X size={22} color="#f5f5f5" />
                </button>
              </div>

              <div
                ref={sliderRef}
                onPointerDown={(e) => {
                  dragging.current = true;
                  (e.currentTarget as HTMLElement).setPointerCapture?.(
                    e.pointerId,
                  );
                  updatePos(e.clientX);
                }}
                onPointerMove={(e) => dragging.current && updatePos(e.clientX)}
                onPointerUp={() => (dragging.current = false)}
                onPointerCancel={() => (dragging.current = false)}
                className="relative flex-1 overflow-hidden select-none"
                style={{ touchAction: "none" }}
              >
                {urls[aId] && (
                  <img
                    src={urls[aId]}
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                  />
                )}
                {urls[bId] && (
                  <img
                    src={urls[bId]}
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  />
                )}
                <div
                  className="pointer-events-none absolute inset-y-0"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div
                    className="absolute inset-y-0"
                    style={{ left: -1, width: 2, background: "#fff" }}
                  />
                  <div
                    className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                    style={{ background: "#fff" }}
                  >
                    <MoveHorizontal size={16} color="#0e0e0e" />
                  </div>
                </div>
                <span
                  className="absolute bottom-2 left-2 rounded-md px-2 py-0.5 text-[11px] font-medium text-white"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  {fmtDate(photosTable[bId].loggedAt)}
                </span>
                <span
                  className="absolute right-2 bottom-2 rounded-md px-2 py-0.5 text-[11px] font-medium text-white"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  {fmtDate(photosTable[aId].loggedAt)}
                </span>
              </div>

              <div
                className="flex gap-2 px-4 py-3"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <button
                  onClick={exportImage}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold active:opacity-80"
                  style={{ background: S.amber, color: "#0e0e0e" }}
                >
                  <Share2 size={15} />
                  Image
                </button>
                <button
                  onClick={exportGif}
                  disabled={exporting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60"
                  style={{
                    background: S.surface,
                    color: "#f5f5f5",
                    border: "1px solid #262626",
                  }}
                >
                  {exporting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Film size={15} />
                  )}
                  {exporting ? "Building…" : "GIF"}
                </button>
              </div>
            </div>
          );
        })()}

      {/* Camera capture with pose ghost */}
      {captureOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "#000" }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setCaptureOpen(false)}>
              <X size={22} color="#f5f5f5" />
            </button>
            <span className="text-sm font-medium text-white">New photo</span>
            <button
              onClick={() =>
                setFacing((f) => (f === "user" ? "environment" : "user"))
              }
            >
              <SwitchCamera size={20} color="#f5f5f5" />
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              style={{
                transform: facing === "user" ? "scaleX(-1)" : "none",
              }}
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />
            {ghostId && urls[ghostId] && (
              <img
                src={urls[ghostId]}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                style={{ opacity: ghostOpacity }}
              />
            )}
            {ghostId && (
              <div className="absolute inset-x-0 bottom-3 flex items-center gap-3 px-6">
                <span className="text-[11px] font-medium whitespace-nowrap text-white/80">
                  Pose guide
                </span>
                <input
                  type="range"
                  min={0}
                  max={70}
                  value={Math.round(ghostOpacity * 100)}
                  onChange={(e) =>
                    setGhostOpacity(Number(e.target.value) / 100)
                  }
                  className="flex-1"
                  style={{ accentColor: S.amber }}
                />
              </div>
            )}
          </div>

          <div
            className="flex items-center justify-center py-6"
            style={{ background: "#000" }}
          >
            <button
              onClick={takePhoto}
              aria-label="Capture"
              className="h-16 w-16 rounded-full active:scale-95"
              style={{
                background: "#fff",
                border: "4px solid rgba(255,255,255,0.35)",
              }}
            />
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmId &&
        (() => {
          const cid = confirmId;
          return (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center p-6"
              style={{
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(4px)",
              }}
              onClick={() => setConfirmId(null)}
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
                  <Trash2 size={22} style={{ color: S.red }} />
                </div>
                <div className="space-y-1.5 text-center">
                  <p
                    className="text-base font-semibold"
                    style={{ color: "#f5f5f5" }}
                  >
                    Delete this photo?
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: S.muted }}
                  >
                    This permanently removes the photo. This action cannot be
                    undone.
                  </p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setConfirmId(null)}
                    className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
                    style={{
                      background: S.surface,
                      color: "#f5f5f5",
                      border: "1px solid #262626",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(cid)}
                    className="flex-1 rounded-xl py-2.5 text-sm font-semibold active:opacity-80"
                    style={{ background: S.red, color: "#0e0e0e" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
}
