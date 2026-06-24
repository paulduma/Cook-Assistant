import { describe, it, expect } from 'vitest';
import { searchRecipes, normalizeText } from './recipeSearch';
import { extractRecipeQuery, detectIntent } from './assistantContext';
import { enrichAssistantResponse } from './assistantEnrichment';
import { Recipe } from '../types/recipe';

const recipes: Recipe[] = [
  {
    id: '1',
    title: 'Risotto aux champignons',
    ingredients: ['riz arborio', 'champignons', 'bouillon'],
    steps: ['faire revenir', 'ajouter le riz', 'mouiller'],
    cookingTime: 35,
    servings: 2,
    tags: ['végétarien', 'réconfortant'],
    createdAt: '2025-01-01',
  },
  {
    id: '2',
    title: 'Poulet rôti au citron',
    ingredients: ['poulet', 'citron', 'herbes'],
    steps: ['préchauffer', 'enfourner'],
    cookingTime: 60,
    servings: 4,
    tags: ['classique'],
    createdAt: '2025-01-02',
  },
];

describe('recipeSearch', () => {
  it('finds recipe with partial title', () => {
    const matches = searchRecipes('risotto champignons', recipes);
    expect(matches[0]?.id).toBe('1');
  });

  it('normalizes accents', () => {
    expect(normalizeText('Poulet rôti')).toBe('poulet roti');
  });
});

describe('assistantContext', () => {
  it('extracts cooking query from user message', () => {
    expect(extractRecipeQuery('Je vais faire le risotto aux champignons')).toBe(
      'risotto aux champignons'
    );
  });

  it('detects cooking intent', () => {
    expect(detectIntent('Je vais cuisiner')).toBe('cooking');
    expect(detectIntent('Planifie la semaine')).toBe('planning');
  });
});

describe('assistantEnrichment', () => {
  it('adds RECETTE_ACTIVE when carnet match exists', () => {
    const enriched = enrichAssistantResponse(
      'On commence.',
      'Je vais faire le risotto',
      [{ role: 'user', content: 'Je vais faire le risotto' }],
      recipes
    );

    expect(enriched).toContain('RECETTE_ACTIVE: 1|Risotto aux champignons');
    expect(enriched).toContain('ETAPE_CUISSON: 1/3');
  });

  it('adds RECETTES line for planning', () => {
    const enriched = enrichAssistantResponse(
      'Voici des idées veggie.',
      'Idées veggie rapides',
      [{ role: 'user', content: 'Idées veggie rapides' }],
      recipes
    );

    expect(enriched).toContain('RECETTES:');
    expect(enriched).toContain('Risotto aux champignons');
  });
});
