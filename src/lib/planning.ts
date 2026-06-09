import { MealSlot } from '../types/recipe';
import { localStorageHelper } from './supabase';

const MEALS = ['breakfast', 'lunch', 'dinner'] as const;

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
