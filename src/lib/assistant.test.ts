import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseAssistantMessage } from './chatRecipes';
import {
  applyWeekPlan,
  weekPlanEntryToSlot,
  DAY_MAP,
  MEAL_MAP,
  resolveTitleToRecipeId,
} from './planning';
import { localStorageHelper } from './supabase';
import { Recipe } from '../types/recipe';

const sampleRecipes: Recipe[] = [
  {
    id: 'r1',
    title: 'Risotto aux champignons',
    ingredients: ['riz', 'champignons'],
    steps: ['Cuire le riz'],
    cookingTime: 35,
    servings: 2,
    tags: ['végétarien'],
    createdAt: '2025-01-01',
  },
  {
    id: 'r2',
    title: 'Poulet rôti',
    ingredients: ['poulet'],
    steps: ['Enfourner'],
    cookingTime: 60,
    servings: 4,
    tags: ['classique'],
    createdAt: '2025-01-02',
  },
];

describe('parseAssistantMessage', () => {
  it('parses carnet recipes from RECETTES line', () => {
    const content = `Voici quelques idées.\nRECETTES: Risotto aux champignons | Poulet rôti`;
    const result = parseAssistantMessage(content, sampleRecipes);

    expect(result.text).toBe('Voici quelques idées.');
    expect(result.mentioned).toHaveLength(2);
    expect(result.mentioned[0].id).toBe('r1');
    expect(result.mentioned[1].id).toBe('r2');
  });

  it('parses suggested recipes JSON', () => {
    const json = JSON.stringify([
      {
        title: 'Tarte tomates',
        ingredients: ['pâte'],
        steps: ['Cuire'],
        cookingTime: 40,
        servings: 4,
        tags: ['végétarien'],
      },
    ]);
    const content = `Une nouvelle idée.\nNOUVELLES_RECETTES_JSON: ${json}`;
    const result = parseAssistantMessage(content, sampleRecipes);

    expect(result.suggested).toHaveLength(1);
    expect(result.suggested[0].title).toBe('Tarte tomates');
  });

  it('parses week plan entries', () => {
    const content = `C'est validé.\nPLAN_SEMAINE: lun-diner:Poulet rôti | mer-dejeuner:Risotto aux champignons`;
    const result = parseAssistantMessage(content, sampleRecipes);

    expect(result.weekPlan).toHaveLength(2);
    expect(result.weekPlan[0]).toEqual({
      day: 'lun',
      meal: 'diner',
      title: 'Poulet rôti',
    });
  });

  it('parses cooking session and step progress', () => {
    const content = `Étape 2 : remuez.\nRECETTE_ACTIVE: r1|Risotto aux champignons\nETAPE_CUISSON: 2/7`;
    const result = parseAssistantMessage(content, sampleRecipes);

    expect(result.activeCooking).toEqual({
      recipeId: 'r1',
      title: 'Risotto aux champignons',
    });
    expect(result.cookingStep).toEqual({ current: 2, total: 7 });
  });

  it('parses recipe update payload', () => {
    const payload = {
      id: 'r1',
      title: 'Risotto aux champignons',
      ingredients: ['riz', 'champignons', 'cidre'],
      steps: ['Cuire le riz', 'Ajouter le cidre'],
      cookingTime: 35,
      servings: 2,
      tags: ['végétarien'],
    };
    const content = `Je peux enregistrer.\nMAJ_RECETTE_JSON: ${JSON.stringify(payload)}`;
    const result = parseAssistantMessage(content, sampleRecipes);

    expect(result.recipeUpdate?.id).toBe('r1');
    expect(result.recipeUpdate?.ingredients).toContain('cidre');
  });

  it('strips structured lines from displayed text', () => {
    const content = `Bon menu.\nRECETTES: Poulet rôti\nPLAN_SEMAINE: lun-diner:Poulet rôti`;
    const result = parseAssistantMessage(content, sampleRecipes);

    expect(result.text).toBe('Bon menu.');
    expect(result.text).not.toContain('RECETTES');
    expect(result.text).not.toContain('PLAN_SEMAINE');
  });
});

describe('weekPlanEntryToSlot', () => {
  it('maps French day and meal abbreviations', () => {
    expect(weekPlanEntryToSlot({ day: 'lun', meal: 'diner', title: 'Poulet rôti' })).toEqual({
      day: 0,
      meal: 'dinner',
      title: 'Poulet rôti',
    });
    expect(weekPlanEntryToSlot({ day: 'mer', meal: 'dejeuner', title: 'Salade' })).toEqual({
      day: 2,
      meal: 'lunch',
      title: 'Salade',
    });
    expect(weekPlanEntryToSlot({ day: 'dim', meal: 'petit-dejeuner', title: 'Granola' })).toEqual({
      day: 6,
      meal: 'breakfast',
      title: 'Granola',
    });
  });

  it('returns null for invalid day or meal', () => {
    expect(weekPlanEntryToSlot({ day: 'foo', meal: 'diner', title: 'X' })).toBeNull();
    expect(weekPlanEntryToSlot({ day: 'lun', meal: 'gouter', title: 'X' })).toBeNull();
  });
});

describe('DAY_MAP and MEAL_MAP', () => {
  it('covers all week days', () => {
    expect(DAY_MAP.lun).toBe(0);
    expect(DAY_MAP.dim).toBe(6);
  });

  it('covers all meals', () => {
    expect(MEAL_MAP.diner).toBe('dinner');
    expect(MEAL_MAP['petit-dejeuner']).toBe('breakfast');
  });
});

describe('resolveTitleToRecipeId', () => {
  it('resolves from carnet by exact title', () => {
    const id = resolveTitleToRecipeId('Poulet rôti', sampleRecipes, new Map());
    expect(id).toBe('r2');
  });

  it('prefers saved title map', () => {
    const saved = new Map([['tarte tomates', 'new-id']]);
    const id = resolveTitleToRecipeId('Tarte tomates', sampleRecipes, saved);
    expect(id).toBe('new-id');
  });
});

describe('applyWeekPlan', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
    });
    localStorageHelper.saveMealPlan([]);
  });

  it('writes slots to meal plan and overwrites existing slots', () => {
    localStorageHelper.saveMealPlan([
      { day: 0, meal: 'dinner', recipeId: 'old-id' },
    ]);

    const result = applyWeekPlan([
      { day: 0, meal: 'dinner', recipeId: 'r1' },
      { day: 2, meal: 'lunch', recipeId: 'r2' },
    ]);

    expect(result.applied).toBe(2);
    expect(result.skipped).toHaveLength(0);

    const plan = localStorageHelper.getMealPlan();
    const mondayDinner = plan.find((s) => s.day === 0 && s.meal === 'dinner');
    const wednesdayLunch = plan.find((s) => s.day === 2 && s.meal === 'lunch');

    expect(mondayDinner?.recipeId).toBe('r1');
    expect(wednesdayLunch?.recipeId).toBe('r2');
  });

  it('skips slots without recipe id', () => {
    const result = applyWeekPlan([{ day: 1, meal: 'lunch', recipeId: '' }]);
    expect(result.applied).toBe(0);
    expect(result.skipped).toHaveLength(1);
  });
});
