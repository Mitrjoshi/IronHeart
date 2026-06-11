import type { FoodItem } from "./constants/foods";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { store } from "@/store/schema";

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

// utils/index.ts
export const formatElapsedTime = (ms: number) => {
  const sec = Math.floor((ms / 1000) % 60);
  const min = Math.floor((ms / (1000 * 60)) % 60);
  const hr = Math.floor(ms / (1000 * 60 * 60));

  if (hr > 0) return `${hr}h ${min}m ${sec}s`;
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
};

export const formatDuration = (seconds: number) => {
  const hr = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;

  if (hr > 0) return `${hr}h ${min}m ${sec}s`;
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
};

export const formatVolume = (volume: number) => {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}t`;
  return `${volume}kg`;
};

export const formatWeight = (kg: number) => {
  if (kg === 0) return "0kg";
  return `${kg}kg`;
};

const VOLUME_UNITS = ["cup", "glass", "ml", "l"];
const WEIGHT_UNITS = ["g", "gram", "kg"];
const COUNT_UNITS = ["piece", "roti", "chapati", "egg", "bowl"];

function getMeasurement(unit: string) {
  const u = unit?.toLowerCase() || "";

  if (VOLUME_UNITS.some((x) => u.includes(x))) return "ml";
  if (WEIGHT_UNITS.some((x) => u.includes(x))) return "g";
  if (COUNT_UNITS.some((x) => u.includes(x))) return null;

  return null; // fallback
}

export function normalizeFood(food: FoodItem) {
  const baseQuantity = 100;

  const energy = food.energy_kcal ?? 0;

  const isCustom = food.food_code?.startsWith("CUSTOM");

  const ratio =
    !isCustom && food.unit_serving_energy_kcal && energy > 0
      ? food.unit_serving_energy_kcal / energy
      : 1;

  const servingSize = Math.round(ratio * baseQuantity);

  const unit = food.servings_unit || "g";
  const measurement = getMeasurement(unit);

  return {
    name: food.food_name,
    food_code: food.food_code,

    base: {
      quantity: baseQuantity,
      calories: energy,
      protein: food.protein_g ?? 0,
      carbs: food.carb_g ?? 0,
      fats: food.fat_g ?? 0,
    },

    serving: {
      unit,
      quantity: servingSize,
      measurement,

      calories: food.unit_serving_energy_kcal ?? energy * ratio,

      protein: food.unit_serving_protein_g ?? (food.protein_g ?? 0) * ratio,

      carbs: food.unit_serving_carb_g ?? (food.carb_g ?? 0) * ratio,

      fats: food.unit_serving_fat_g ?? (food.fat_g ?? 0) * ratio,

      ...food,
    },
  };
}

export const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// vfs export shape has moved across pdfmake versions — handle all of them
const fonts = pdfFonts as any;
(pdfMake as any).vfs = fonts.vfs ?? fonts.pdfMake?.vfs ?? fonts.default?.vfs;

// Friendly section titles + ordering
const TABLE_LABELS: Record<string, string> = {
  settings: "Profile & Settings",
  schedules: "Schedules",
  exercises: "Exercises",
  sets: "Template Sets",
  workouts: "Workouts",
  workoutSets: "Workout Sets",
  activeSessions: "Active Sessions",
  weights: "Body Weight Log",
  measurements: "Measurements",
  meals: "Meals",
  foodEntries: "Food Entries",
  customFoods: "Custom Foods",
};

const isTimestampKey = (k: string) => k.endsWith("At") || k === "loggedAt";

const prettyCol = (c: string) =>
  c
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (m) => m.toUpperCase())
    .trim();

const fmt = (key: string, val: unknown): string => {
  if (val === undefined || val === null || val === "") return "—";
  if (isTimestampKey(key) && typeof val === "number") {
    return new Date(val).toLocaleString();
  }
  if (typeof val === "object") val = JSON.stringify(val);
  const s = String(val);
  return s.length > 120 ? s.slice(0, 117) + "…" : s;
};

function buildTableSection(tableId: string): Content[] {
  const table = store.getTable(tableId) as Record<
    string,
    Record<string, unknown>
  >;
  const rowIds = Object.keys(table);
  const label = TABLE_LABELS[tableId] ?? prettyCol(tableId);

  // union of all columns across rows (rows can be sparse)
  const cols = Array.from(
    rowIds.reduce((set, id) => {
      Object.keys(table[id]).forEach((c) => set.add(c));
      return set;
    }, new Set<string>()),
  );

  const headerCells = cols.map((c) => ({
    text: prettyCol(c),
    bold: true,
    color: "#ffffff",
    fontSize: 7.5,
  }));

  const bodyRows = rowIds.map((id) =>
    cols.map((c) => ({ text: fmt(c, table[id][c]), fontSize: 7 })),
  );

  return [
    {
      text: `${label}  ·  ${rowIds.length}`,
      bold: true,
      fontSize: 11,
      color: "#0e0e0e",
      margin: [0, 10, 0, 5],
    },
    {
      table: {
        headerRows: 1,
        dontBreakRows: true,
        widths: cols.map(() => "auto"),
        body: [headerCells, ...bodyRows],
      },
      layout: {
        fillColor: (rowIndex: number) =>
          rowIndex === 0 ? "#f59e0b" : rowIndex % 2 === 0 ? "#fafafa" : null,
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => "#e5e7eb",
        vLineColor: () => "#e5e7eb",
        paddingTop: () => 3,
        paddingBottom: () => 3,
        paddingLeft: () => 5,
        paddingRight: () => 5,
      },
      margin: [0, 0, 0, 16],
    },
  ];
}

export function exportDataToPdf() {
  const tableIds = store.getTableIds(); // only non-empty tables
  const ordered = [
    ...Object.keys(TABLE_LABELS).filter((id) => tableIds.includes(id)),
    ...tableIds.filter((id) => !(id in TABLE_LABELS)),
  ];

  const content: Content[] = ordered.length
    ? ordered.flatMap(buildTableSection)
    : [{ text: "No data to export yet.", italics: true, color: "#9ca3af" }];

  const docDefinition: TDocumentDefinitions = {
    pageOrientation: "landscape",
    pageSize: "A4",
    pageMargins: [28, 58, 28, 36],
    defaultStyle: { fontSize: 8, color: "#1f2937" },
    header: {
      margin: [28, 22, 28, 0],
      columns: [
        {
          text: "Fitness Data Export",
          bold: true,
          fontSize: 13,
          color: "#f59e0b",
        },
        {
          text: new Date().toLocaleString(),
          alignment: "right",
          fontSize: 8,
          color: "#9ca3af",
          margin: [0, 4, 0, 0],
        },
      ],
    },
    footer: (current, total) => ({
      text: `${current} / ${total}`,
      alignment: "center",
      fontSize: 7,
      color: "#9ca3af",
      margin: [0, 10, 0, 0],
    }),
    content,
  };

  const date = new Date().toISOString().split("T")[0];
  pdfMake.createPdf(docDefinition).download(`fitness-data-${date}.pdf`);
}
