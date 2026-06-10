import { Recipe } from '../types/recipe';
import { localStorageHelper, supabase } from './supabase';

const RECIPE_IMAGES_BUCKET = 'recipe-images';
const MIGRATED_FLAG = 'recipesMigrated';

export interface RecipeRow {
  id: string;
  title: string;
  image_url: string | null;
  ingredients: string[];
  steps: string[];
  cooking_time: number;
  servings: number;
  tags: string[];
  created_at: string;
}

type RecipeInput = Omit<Recipe, 'id' | 'createdAt'>;
type RecipeUpdate = Partial<RecipeInput>;

export function toRecipe(row: RecipeRow): Recipe {
  return {
    id: row.id,
    title: row.title,
    image: row.image_url ?? undefined,
    ingredients: row.ingredients,
    steps: row.steps,
    cookingTime: row.cooking_time,
    servings: row.servings,
    tags: row.tags,
    createdAt: row.created_at,
  };
}

export function toRecipeRow(data: RecipeInput | RecipeUpdate): Partial<RecipeRow> {
  const row: Partial<RecipeRow> = {};

  if (data.title !== undefined) row.title = data.title;
  if (data.image !== undefined) row.image_url = data.image ?? null;
  if (data.ingredients !== undefined) row.ingredients = data.ingredients;
  if (data.steps !== undefined) row.steps = data.steps;
  if (data.cookingTime !== undefined) row.cooking_time = data.cookingTime;
  if (data.servings !== undefined) row.servings = data.servings;
  if (data.tags !== undefined) row.tags = data.tags;

  return row;
}

function throwOnError(error: { message: string } | null, context: string): void {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

function getFileExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && fromName !== file.name.toLowerCase()) {
    return fromName;
  }

  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  return mimeMap[file.type] ?? 'jpg';
}

function getStoragePathFromImageUrl(imageUrl: string): string | null {
  const marker = `/storage/v1/object/public/${RECIPE_IMAGES_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return null;
  return imageUrl.slice(index + marker.length);
}

export async function fetchRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false });

  throwOnError(error, 'Failed to fetch recipes');
  return (data as RecipeRow[]).map(toRecipe);
}

export async function createRecipe(data: RecipeInput): Promise<Recipe> {
  const { data: row, error } = await supabase
    .from('recipes')
    .insert(toRecipeRow(data))
    .select()
    .single();

  throwOnError(error, 'Failed to create recipe');
  return toRecipe(row as RecipeRow);
}

export async function updateRecipe(id: string, data: RecipeUpdate): Promise<Recipe> {
  const { data: row, error } = await supabase
    .from('recipes')
    .update(toRecipeRow(data))
    .eq('id', id)
    .select()
    .single();

  throwOnError(error, 'Failed to update recipe');
  return toRecipe(row as RecipeRow);
}

export async function deleteRecipe(id: string): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from('recipes')
    .select('image_url')
    .eq('id', id)
    .maybeSingle();

  throwOnError(fetchError, 'Failed to load recipe for deletion');

  if (existing?.image_url) {
    const storagePath = getStoragePathFromImageUrl(existing.image_url);
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from(RECIPE_IMAGES_BUCKET)
        .remove([storagePath]);

      if (storageError) {
        console.warn('Failed to delete recipe image from storage:', storageError.message);
      }
    }
  }

  const { error } = await supabase.from('recipes').delete().eq('id', id);
  throwOnError(error, 'Failed to delete recipe');
}

export async function uploadRecipeImage(recipeId: string, file: File): Promise<string> {
  const ext = getFileExtension(file);
  const path = `${recipeId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .upload(path, file, { upsert: false });

  throwOnError(error, 'Failed to upload recipe image');

  const { data } = supabase.storage.from(RECIPE_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function migrateFromLocalStorage(): Promise<void> {
  if (localStorage.getItem(MIGRATED_FLAG) === 'true') {
    return;
  }

  const localRecipes = localStorageHelper.getRecipes();
  if (localRecipes.length === 0) {
    localStorage.setItem(MIGRATED_FLAG, 'true');
    return;
  }

  const idMap = new Map<string, string>();

  for (const recipe of localRecipes) {
    const { id: oldId, title, image, ingredients, steps, cookingTime, servings, tags } =
      recipe;
    const created = await createRecipe({
      title,
      image,
      ingredients,
      steps,
      cookingTime,
      servings,
      tags,
    });
    idMap.set(oldId, created.id);
  }

  const mealPlan = localStorageHelper.getMealPlan();
  const updatedMealPlan = mealPlan.map((slot) => {
    if (!slot.recipeId) return slot;

    const newId = idMap.get(slot.recipeId);
    if (!newId) {
      console.warn(`Meal plan slot references unknown recipe id: ${slot.recipeId}`);
      return { ...slot, recipeId: null };
    }

    return { ...slot, recipeId: newId };
  });

  localStorageHelper.saveMealPlan(updatedMealPlan);
  localStorage.removeItem('recipes');
  localStorage.setItem(MIGRATED_FLAG, 'true');
}
