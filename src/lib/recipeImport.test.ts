import { describe, it, expect } from 'vitest';
import {
  buildUncertainFields,
  isValidInstagramUrl,
  mapImportResponse,
  parseDurationToMinutes,
  parseServings,
} from './recipeImport';
import { RecipeImportResponse } from '../types/recipeImport';

const baseResponse = (overrides: Partial<RecipeImportResponse> = {}): RecipeImportResponse => ({
  title: 'Pâtes à la tomate',
  confidence: 'high',
  servings: '4 personnes',
  prep_time: '10 min',
  cook_time: '20 min',
  ingredients: [
    { quantity: '400 g', item: 'pâtes' },
    { quantity: null, item: 'tomates' },
  ],
  steps: ['Faire bouillir l’eau', 'Cuire les pâtes'],
  missing_info: [],
  source_url: 'https://www.instagram.com/reel/AbCdEf123/',
  source_caption_used: true,
  ...overrides,
});

describe('isValidInstagramUrl', () => {
  it('accepts reel and post URLs', () => {
    expect(isValidInstagramUrl('https://www.instagram.com/reel/AbCdEf123/')).toBe(true);
    expect(isValidInstagramUrl('https://instagram.com/p/XyZ789/')).toBe(true);
  });

  it('rejects non-Instagram URLs', () => {
    expect(isValidInstagramUrl('https://tiktok.com/@x/video/1')).toBe(false);
    expect(isValidInstagramUrl('not a url')).toBe(false);
    expect(isValidInstagramUrl('https://instagram.com/explore/')).toBe(false);
  });
});

describe('parseDurationToMinutes', () => {
  it('parses common formats', () => {
    expect(parseDurationToMinutes('30 min')).toBe(30);
    expect(parseDurationToMinutes('1h30')).toBe(90);
    expect(parseDurationToMinutes('2 heures')).toBe(120);
    expect(parseDurationToMinutes('45')).toBe(45);
  });

  it('returns null when unparsable', () => {
    expect(parseDurationToMinutes(null)).toBeNull();
    expect(parseDurationToMinutes('quelques minutes')).toBeNull();
  });
});

describe('parseServings', () => {
  it('extracts a number', () => {
    expect(parseServings('4 personnes')).toBe(4);
    expect(parseServings('pour 2')).toBe(2);
  });

  it('returns null when missing', () => {
    expect(parseServings(null)).toBeNull();
    expect(parseServings('selon appétit')).toBeNull();
  });
});

describe('mapImportResponse', () => {
  it('maps ingredients via formatIngredient and sums times', () => {
    const result = mapImportResponse(baseResponse());
    expect(result.draft.title).toBe('Pâtes à la tomate');
    expect(result.draft.cookingTime).toBe(30);
    expect(result.draft.servings).toBe(4);
    expect(result.draft.ingredients?.[0]).toBe('400 g de pâtes');
    expect(result.draft.sourceUrl).toContain('instagram.com');
  });

  it('defaults cooking time and servings when missing', () => {
    const result = mapImportResponse(
      baseResponse({ cook_time: null, prep_time: null, servings: null })
    );
    expect(result.draft.cookingTime).toBe(30);
    expect(result.draft.servings).toBe(4);
    expect(result.uncertainFields.cookingTime).toBe(true);
    expect(result.uncertainFields.servings).toBe(true);
  });
});

describe('buildUncertainFields', () => {
  it('marks fields from missing_info keywords', () => {
    const fields = buildUncertainFields(
      baseResponse({
        missing_info: ['portions inconnues', 'quantités approximatives'],
      }),
      { cookingTimeDefaulted: false, servingsDefaulted: false }
    );
    expect(fields.servings).toBe(true);
    expect(fields.ingredients?.every(Boolean)).toBe(true);
  });

  it('marks almost everything when confidence is low', () => {
    const fields = buildUncertainFields(
      baseResponse({ confidence: 'low', missing_info: [] }),
      { cookingTimeDefaulted: false, servingsDefaulted: false }
    );
    expect(fields.title).toBe(true);
    expect(fields.servings).toBe(true);
    expect(fields.cookingTime).toBe(true);
    expect(fields.ingredients?.every(Boolean)).toBe(true);
    expect(fields.steps?.every(Boolean)).toBe(true);
  });
});
