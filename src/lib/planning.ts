import { MealSlot } from '../types/recipe';
import { localStorageHelper } from './supabase';
import { WeekPlanEntry, SuggestedRecipe, findRecipeByTitleLoose } from './chatRecipes';
import { Recipe } from '../types/recipe';
import { normalizeText } from './recipeSearch';

const MEALS = ['breakfast', 'lunch', 'dinner'] as const;

export const DAY_MAP: Record<string, number> = {
  lun: 0,
  mar: 1,
  mer: 2,
  jeu: 3,
  ven: 4,
  sam: 5,
  dim: 6,
};

export const MEAL_MAP: Record<string, MealSlot['meal']> = {
  'petit-dejeuner': 'breakfast',
  dejeuner: 'lunch',
  diner: 'dinner',
};

export const DAY_LABELS: Record<string, string> = {
  lun: 'Lundi',
  mar: 'Mardi',
  mer: 'Mercredi',
  jeu: 'Jeudi',
  ven: 'Vendredi',
  sam: 'Samedi',
  dim: 'Dimanche',
};

export const MEAL_LABELS: Record<MealSlot['meal'], string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
};

export interface PlanSlot {
  day: number;
  meal: MealSlot['meal'];
  recipeId: string;
}

export interface ApplyWeekPlanResult {
  applied: number;
  skipped: PlanSlot[];
}

export function weekPlanEntryToSlot(
  entry: WeekPlanEntry
): { day: number; meal: MealSlot['meal']; title: string } | null {
  const dayKey = normalizeText(entry.day).slice(0, 3);
  const dayAliases: Record<string, number> = {
    lun: 0,
    mar: 1,
    mer: 2,
    jeu: 3,
    ven: 4,
    sam: 5,
    dim: 6,
  };
  const mealKey = normalizeText(entry.meal)
    .replace(/\s+/g, '')
    .replace('petitdejeuner', 'petit-dejeuner');
  const mealAliases: Record<string, MealSlot['meal']> = {
    'petit-dejeuner': 'breakfast',
    petitdejeuner: 'breakfast',
    breakfast: 'breakfast',
    dejeuner: 'lunch',
    lunch: 'lunch',
    diner: 'dinner',
    dinner: 'dinner',
  };

  const day = dayAliases[dayKey];
  const meal = mealAliases[mealKey] ?? MEAL_MAP[mealKey];
  if (day === undefined || !meal || !entry.title.trim()) return null;
  return { day, meal, title: entry.title.trim() };
}

export function resolveTitleToRecipeId(
  title: string,
  recipes: Recipe[],
  savedTitles: Map<string, string>
): string | null {
  const norm = title.toLowerCase().trim();
  const fromSaved = savedTitles.get(norm);
  if (fromSaved) return fromSaved;

  const recipe = findRecipeByTitleLoose(title, recipes);
  return recipe?.id ?? null;
}

export function findSuggestedByTitle(
  title: string,
  suggested: SuggestedRecipe[]
): SuggestedRecipe | undefined {
  const norm = normalizeText(title);
  const exact = suggested.find((item) => normalizeText(item.title) === norm);
  if (exact) return exact;

  return suggested.find((item) => {
    const itemNorm = normalizeText(item.title);
    return itemNorm.includes(norm) || norm.includes(itemNorm);
  });
}

export function applyWeekPlan(slots: PlanSlot[]): ApplyWeekPlanResult {
  const mealPlan = [...localStorageHelper.getMealPlan()];
  let applied = 0;
  const skipped: PlanSlot[] = [];

  for (const slot of slots) {
    if (!slot.recipeId) {
      skipped.push(slot);
      continue;
    }

    const idx = mealPlan.findIndex((s) => s.day === slot.day && s.meal === slot.meal);
    if (idx >= 0) {
      mealPlan[idx] = { ...mealPlan[idx], recipeId: slot.recipeId };
    } else {
      mealPlan.push({ day: slot.day, meal: slot.meal, recipeId: slot.recipeId });
    }
    applied++;
  }

  localStorageHelper.saveMealPlan(mealPlan);
  return { applied, skipped };
}

export function addRecipeToFirstEmptySlot(recipeId: string): boolean {
  const mealPlan = localStorageHelper.getMealPlan();
  for (let day = 0; day < 7; day++) {
    for (const meal of MEALS) {
      const idx = mealPlan.findIndex((s) => s.day === day && s.meal === meal);
      if (idx < 0 || !mealPlan[idx].recipeId) {
        let updated: MealSlot[];
        if (idx >= 0) {
          updated = [...mealPlan];
          updated[idx] = { ...updated[idx], recipeId };
        } else {
          updated = [...mealPlan, { day, meal, recipeId }];
        }
        localStorageHelper.saveMealPlan(updated);
        return true;
      }
    }
  }
  return false;
}
