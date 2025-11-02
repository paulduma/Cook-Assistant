import { createClient } from '@supabase/supabase-js';
// Safely access import.meta.env with fallback
let supabaseUrl = 'https://your-project.supabase.co';
let supabaseKey = 'your-anon-key';
// Only try to access import.meta.env if it exists
if (typeof import.meta !== 'undefined' && import.meta.env) {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL || supabaseUrl;
  supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseKey;
}
export const supabase = createClient(supabaseUrl, supabaseKey);
// Helper functions for local storage fallback (for MVP without Supabase setup)
export const localStorageHelper = {
  getRecipes: (): any[] => {
    const recipes = localStorage.getItem('recipes');
    return recipes ? JSON.parse(recipes) : [];
  },
  saveRecipes: (recipes: any[]) => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  },
  getMealPlan: (): any[] => {
    const mealPlan = localStorage.getItem('mealPlan');
    return mealPlan ? JSON.parse(mealPlan) : [];
  },
  saveMealPlan: (mealPlan: any[]) => {
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
  }
};