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

export function normalizeFood(food) {
  const baseQuantity = 100;

  const energy = food.energy_kcal ?? 0;

  const ratio = energy > 0 ? (food.unit_serving_energy_kcal ?? 0) / energy : 1;

  const servingSize = ratio * baseQuantity;

  const measurement = getMeasurement(food.servings_unit);

  return {
    name: food.food_name,

    base: {
      quantity: 100,
      calories: energy,
      protein: food.protein_g ?? 0,
      carbs: food.carb_g ?? 0,
      fats: food.fat_g ?? 0,
    },

    serving: {
      unit: food.servings_unit || "serving",
      quantity: servingSize,
      measurement, // 🔥 important
      calories: food.unit_serving_energy_kcal ?? energy * ratio,
      protein: food.unit_serving_protein_g ?? (food.protein_g ?? 0) * ratio,
      carbs: food.unit_serving_carb_g ?? (food.carb_g ?? 0) * ratio,
      fats: food.unit_serving_fat_g ?? (food.fat_g ?? 0) * ratio,
    },
  };
}
