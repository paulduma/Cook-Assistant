export interface Recipe {
  id: string;
  title: string;
  image?: string;
  ingredients: string[];
  steps: string[];
  cookingTime: number; // in minutes
  servings: number;
  tags: string[];
  createdAt: string;
}
export interface MealSlot {
  day: number; // 0-6 for days of week
  meal: 'breakfast' | 'lunch' | 'dinner';
  recipeId: string | null;
}
export interface GroceryItem {
  ingredient: string;
  recipes: string[]; // recipe titles using this ingredient
}