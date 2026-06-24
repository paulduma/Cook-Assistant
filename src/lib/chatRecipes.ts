import { Recipe } from '../types/recipe';

const RECETTES_LINE = /^RECETTES:\s*(.+)$/im;
const NOUVELLES_LINE = /^NOUVELLES_RECETTES_JSON:\s*(.+)$/im;
const PLAN_LINE = /^PLAN_SEMAINE:\s*(.+)$/im;
const RECETTE_ACTIVE_LINE = /^RECETTE_ACTIVE:\s*(.+)$/im;
const ETAPE_CUISSON_LINE = /^ETAPE_CUISSON:\s*(.+)$/im;
const MAJ_RECETTE_LINE = /^MAJ_RECETTE_JSON:\s*(.+)$/im;

export interface SuggestedRecipe {
  title: string;
  ingredients: string[];
  steps: string[];
  cookingTime: number;
  servings: number;
  tags: string[];
}

export interface WeekPlanEntry {
  day: string;
  meal: string;
  title: string;
}

export interface ActiveCookingSession {
  recipeId: string | null;
  title: string;
}

export interface CookingStepProgress {
  current: number;
  total: number;
}

export interface RecipeUpdatePayload extends SuggestedRecipe {
  id?: string;
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function stripStructuredLines(content: string): string {
  return content
    .replace(RECETTES_LINE, '')
    .replace(NOUVELLES_LINE, '')
    .replace(PLAN_LINE, '')
    .replace(RECETTE_ACTIVE_LINE, '')
    .replace(ETAPE_CUISSON_LINE, '')
    .replace(MAJ_RECETTE_LINE, '')
    .trim();
}

export function matchRecipeByTitle(title: string, recipes: Recipe[]): Recipe | undefined {
  const norm = title.toLowerCase().trim();
  return recipes.find((r) => r.title.toLowerCase().trim() === norm);
}

export function findRecipeByTitleLoose(query: string, recipes: Recipe[]): Recipe | undefined {
  const norm = query.toLowerCase().trim();
  if (!norm) return undefined;

  const exact = matchRecipeByTitle(query, recipes);
  if (exact) return exact;

  return recipes.find((r) => {
    const title = r.title.toLowerCase().trim();
    return title.includes(norm) || norm.includes(title);
  });
}

export function findMentionedRecipes(content: string, recipes: Recipe[]): Recipe[] {
  const stripped = stripMarkdown(stripStructuredLines(content));
  const lower = stripped.toLowerCase();
  return recipes
    .filter((r) => {
      const title = r.title.toLowerCase().trim();
      return title.length > 2 && lower.includes(title);
    })
    .slice(0, 7);
}

function parseSuggestedRecipes(content: string): SuggestedRecipe[] {
  const match = content.match(NOUVELLES_LINE);
  if (!match) return [];

  try {
    const parsed = JSON.parse(match[1].trim());
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is SuggestedRecipe =>
          typeof item?.title === 'string' &&
          Array.isArray(item.ingredients) &&
          Array.isArray(item.steps) &&
          typeof item.cookingTime === 'number' &&
          typeof item.servings === 'number' &&
          Array.isArray(item.tags)
      )
      .slice(0, 7);
  } catch {
    return [];
  }
}

function parseWeekPlan(content: string): WeekPlanEntry[] {
  const match = content.match(PLAN_LINE);
  if (!match) return [];

  return match[1]
    .split('|')
    .map((slot) => slot.trim())
    .filter(Boolean)
    .map((slot) => {
      const [key, ...titleParts] = slot.split(':');
      const title = titleParts.join(':').trim();
      const [day = '', meal = ''] = key.split('-');
      return { day: day.trim(), meal: meal.trim(), title };
    })
    .filter((entry) => entry.day && entry.meal && entry.title);
}

function parseActiveCookingSession(content: string): ActiveCookingSession | null {
  const match = content.match(RECETTE_ACTIVE_LINE);
  if (!match) return null;

  const [idPart, ...titleParts] = match[1].split('|');
  const title = titleParts.join('|').trim();
  if (!title) return null;

  const id = idPart.trim();
  return {
    recipeId: id === 'new' ? null : id,
    title,
  };
}

function parseCookingStepProgress(content: string): CookingStepProgress | null {
  const match = content.match(ETAPE_CUISSON_LINE);
  if (!match) return null;

  const [currentRaw, totalRaw] = match[1].split('/').map((v) => v.trim());
  const current = Number(currentRaw);
  const total = Number(totalRaw);

  if (!Number.isFinite(current) || !Number.isFinite(total) || current < 1 || total < 1) {
    return null;
  }

  return { current, total };
}

function parseRecipeUpdate(content: string): RecipeUpdatePayload | null {
  const match = content.match(MAJ_RECETTE_LINE);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1].trim());
    if (
      typeof parsed?.title !== 'string' ||
      !Array.isArray(parsed.ingredients) ||
      !Array.isArray(parsed.steps) ||
      typeof parsed.cookingTime !== 'number' ||
      typeof parsed.servings !== 'number' ||
      !Array.isArray(parsed.tags)
    ) {
      return null;
    }

    return {
      id: typeof parsed.id === 'string' ? parsed.id : undefined,
      title: parsed.title,
      ingredients: parsed.ingredients,
      steps: parsed.steps,
      cookingTime: parsed.cookingTime,
      servings: parsed.servings,
      tags: parsed.tags,
    };
  } catch {
    return null;
  }
}

export function parseAssistantMessage(
  content: string,
  recipes: Recipe[]
): {
  text: string;
  mentioned: Recipe[];
  suggested: SuggestedRecipe[];
  weekPlan: WeekPlanEntry[];
  activeCooking: ActiveCookingSession | null;
  cookingStep: CookingStepProgress | null;
  recipeUpdate: RecipeUpdatePayload | null;
} {
  const suggested = parseSuggestedRecipes(content);
  const weekPlan = parseWeekPlan(content);
  const activeCooking = parseActiveCookingSession(content);
  const cookingStep = parseCookingStepProgress(content);
  const recipeUpdate = parseRecipeUpdate(content);
  const match = content.match(RECETTES_LINE);

  if (match) {
    const text = stripMarkdown(stripStructuredLines(content.slice(0, match.index).trim()));
    const titles = match[1]
      .split('|')
      .map((t) => t.trim())
      .filter(Boolean);
    const mentioned: Recipe[] = [];

    for (const title of titles) {
      const recipe = matchRecipeByTitle(title, recipes);
      if (recipe && !mentioned.some((m) => m.id === recipe.id)) {
        mentioned.push(recipe);
      }
    }

    return {
      text,
      mentioned: mentioned.slice(0, 7),
      suggested,
      weekPlan,
      activeCooking,
      cookingStep,
      recipeUpdate,
    };
  }

  const text = stripMarkdown(stripStructuredLines(content));
  return {
    text,
    mentioned: findMentionedRecipes(text, recipes),
    suggested,
    weekPlan,
    activeCooking,
    cookingStep,
    recipeUpdate,
  };
}
