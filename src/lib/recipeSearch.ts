import { Recipe } from '../types/recipe';
import { ChatMessage } from './openai';

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  const stopWords = new Set([
    'avec',
    'pour',
    'une',
    'des',
    'les',
    'dans',
    'mon',
    'mes',
    'cette',
    'semaine',
    'repas',
    'diner',
    'dejeuner',
    'soir',
    'soirs',
    'idees',
    'idee',
    'plan',
    'menu',
    'rapide',
    'veggie',
    'vegetarien',
  ]);

  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function scoreRecipe(recipe: Recipe, query: string, queryTokens: string[]): number {
  const normTitle = normalizeText(recipe.title);
  const normQuery = normalizeText(query);

  if (!normQuery) return 0;
  if (normTitle === normQuery) return 100;
  if (normTitle.includes(normQuery) || normQuery.includes(normTitle)) return 85;

  const titleTokens = normTitle.split(' ');
  let overlap = 0;
  for (const token of queryTokens) {
    if (titleTokens.some((titleToken) => titleToken.includes(token) || token.includes(titleToken))) {
      overlap += 1;
    }
  }

  let score = overlap * 18;

  for (const tag of recipe.tags) {
    const normTag = normalizeText(tag);
    if (normQuery.includes(normTag) || queryTokens.includes(normTag)) {
      score += 12;
    }
  }

  for (const ingredient of recipe.ingredients) {
    const normIngredient = normalizeText(ingredient);
    if (normQuery.includes(normIngredient) || queryTokens.some((t) => normIngredient.includes(t))) {
      score += 8;
    }
  }

  return score;
}

export function searchRecipes(query: string, recipes: Recipe[], limit = 6): Recipe[] {
  const queryTokens = tokenize(query);
  if (!query.trim() && queryTokens.length === 0) return [];

  return recipes
    .map((recipe) => ({ recipe, score: scoreRecipe(recipe, query, queryTokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.recipe);
}

const PLANNING_KEYWORDS: Record<string, string[]> = {
  veggie: ['vegetarien', 'veggie', 'legumes'],
  vegetarien: ['vegetarien', 'veggie', 'legumes'],
  rapide: ['rapide', 'express'],
  poisson: ['poisson', 'saumon', 'cabillaud', 'thon'],
  viande: ['viande', 'poulet', 'boeuf', 'porc', 'agneau'],
  pates: ['pates', 'pate'],
  salade: ['salade'],
};

export function searchRecipesForPlanning(
  userMessage: string,
  recipes: Recipe[],
  history: ChatMessage[] = []
): Recipe[] {
  const context = [
    userMessage,
    ...history
      .filter((message) => message.role === 'user')
      .slice(-4)
      .map((message) => message.content),
  ].join(' ');

  const boostedTerms = new Set<string>(tokenize(context));
  for (const [keyword, aliases] of Object.entries(PLANNING_KEYWORDS)) {
    if (normalizeText(context).includes(keyword)) {
      aliases.forEach((alias) => boostedTerms.add(alias));
    }
  }

  const query = [...boostedTerms].join(' ');
  const matches = searchRecipes(query || userMessage, recipes, 8);

  if (matches.length > 0) return matches.slice(0, 6);
  if (recipes.length <= 6) return recipes;
  return recipes.slice(0, 6);
}

export function findBestRecipeMatch(title: string, recipes: Recipe[]): Recipe | undefined {
  const matches = searchRecipes(title, recipes, 1);
  return matches[0];
}
