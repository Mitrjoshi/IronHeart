// hooks/store/useCustomFoods.ts
import { store } from "@/store/schema";
import { useRowIds } from "tinybase/ui-react";
import type { FoodItem } from "@/constants/foods";

export const useAddCustomFood = () => {
  return (data: {
    food_name: string;
    energy_kcal: number;
    carb_g: number;
    protein_g: number;
    fat_g: number;
    fibre_g: number;
    servings_unit: string;
    per_amount: number;
  }) => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase(); // e.g. "A3F9KQ"
    const food_code = `CUSTOM_${id}`;
    store.setRow("customFoods", id, {
      food_code,
      food_name: data.food_name,
      energy_kcal: data.energy_kcal,
      carb_g: data.carb_g,
      protein_g: data.protein_g,
      fat_g: data.fat_g,
      fibre_g: data.fibre_g,
      servings_unit: data.servings_unit,
      createdAt: Date.now(),
      per_amount: data.per_amount,
    });
    return food_code;
  };
};

export const useCustomFoods = (): FoodItem[] => {
  const ids = useRowIds("customFoods", store);

  const sortedIds = [...ids].sort((a, b) => {
    const aTime = store.getCell("customFoods", a, "createdAt") as number;
    const bTime = store.getCell("customFoods", b, "createdAt") as number;
    return bTime - aTime;
  });

  return sortedIds.map((id) => {
    const kcal = store.getCell("customFoods", id, "energy_kcal") as number;
    const carb = store.getCell("customFoods", id, "carb_g") as number;
    const protein = store.getCell("customFoods", id, "protein_g") as number;
    const fat = store.getCell("customFoods", id, "fat_g") as number;
    const fibre = store.getCell("customFoods", id, "fibre_g") as number;

    // derive per-100g fields from what user entered (they enter per-serving)
    return {
      food_code: store.getCell("customFoods", id, "food_code") as string,
      food_name: store.getCell("customFoods", id, "food_name") as string,
      primarysource: "Custom",
      energy_kcal: kcal,
      energy_kj: Math.round(kcal * 4.184),
      carb_g: carb,
      protein_g: protein,
      fat_g: fat,
      fibre_g: fibre,
      freesugar_g: 0,
      servings_unit: store.getCell(
        "customFoods",
        id,
        "servings_unit",
      ) as string,
      // unit_serving = same as per-100g since user enters per serving directly
      unit_serving_energy_kcal: kcal,
      unit_serving_energy_kj: Math.round(kcal * 4.184),
      unit_serving_carb_g: carb,
      unit_serving_protein_g: protein,
      unit_serving_fat_g: fat,
      unit_serving_fibre_g: fibre,
      unit_serving_freesugar_g: 0,
      // zero-fill everything else
      sfa_mg: 0,
      mufa_mg: 0,
      pufa_mg: 0,
      cholesterol_mg: 0,
      calcium_mg: 0,
      phosphorus_mg: 0,
      magnesium_mg: 0,
      sodium_mg: 0,
      potassium_mg: 0,
      iron_mg: 0,
      copper_mg: 0,
      selenium_ug: 0,
      chromium_mg: 0,
      manganese_mg: 0,
      molybdenum_mg: 0,
      zinc_mg: 0,
      vita_ug: 0,
      vite_mg: 0,
      vitd2_ug: 0,
      vitd3_ug: 0,
      vitk1_ug: 0,
      vitk2_ug: 0,
      folate_ug: 0,
      vitb1_mg: 0,
      vitb2_mg: 0,
      vitb3_mg: 0,
      vitb5_mg: 0,
      vitb6_mg: 0,
      vitb7_ug: 0,
      vitb9_ug: 0,
      vitc_mg: 0,
      carotenoids_ug: 0,
      unit_serving_sfa_mg: 0,
      unit_serving_mufa_mg: 0,
      unit_serving_pufa_mg: 0,
      unit_serving_cholesterol_mg: 0,
      unit_serving_calcium_mg: 0,
      unit_serving_phosphorus_mg: 0,
      unit_serving_magnesium_mg: 0,
      unit_serving_sodium_mg: 0,
      unit_serving_potassium_mg: 0,
      unit_serving_iron_mg: 0,
      unit_serving_copper_mg: 0,
      unit_serving_selenium_ug: 0,
      unit_serving_chromium_mg: 0,
      unit_serving_manganese_mg: 0,
      unit_serving_molybdenum_mg: 0,
      unit_serving_zinc_mg: 0,
      unit_serving_vita_ug: 0,
      unit_serving_vite_mg: 0,
      unit_serving_vitd2_ug: 0,
      unit_serving_vitd3_ug: 0,
      unit_serving_vitk1_ug: 0,
      unit_serving_vitk2_ug: 0,
      unit_serving_folate_ug: 0,
      unit_serving_vitb1_mg: 0,
      unit_serving_vitb2_mg: 0,
      unit_serving_vitb3_mg: 0,
      unit_serving_vitb5_mg: 0,
      unit_serving_vitb6_mg: 0,
      unit_serving_vitb7_ug: 0,
      unit_serving_vitb9_ug: 0,
      unit_serving_vitc_mg: 0,
      unit_serving_carotenoids_ug: 0,
    } as FoodItem;
  });
};

export const useDeleteCustomFood = () => {
  return (id: string) => store.delRow("customFoods", id);
};
