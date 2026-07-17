import { formatIngredient } from './ingredients';
import { Recipe } from '../types/recipe';
import {
  RecipeImportError,
  RecipeImportErrorCode,
  RecipeImportResponse,
  RecipeImportResult,
  UncertainFields,
} from '../types/recipeImport';

export { RecipeImportError };
export type { RecipeImportErrorCode, RecipeImportResult, UncertainFields };

const INSTAGRAM_URL_RE =
  /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?/i;

const IMPORT_TIMEOUT_MS = 45_000;

const ERROR_MESSAGES: Record<RecipeImportErrorCode, string> = {
  invalid_url: 'Ce lien ne semble pas être une URL Instagram valide.',
  unauthorized: 'Erreur de configuration du service d’import.',
  content_unavailable: 'Impossible d’accéder à ce contenu (privé ou introuvable).',
  download_failed: 'Échec du téléchargement de la vidéo. Réessayez ou saisissez à la main.',
  extraction_failed: 'Impossible d’extraire la recette automatiquement.',
  timeout: 'Ça prend plus de temps que prévu. Réessayez ou passez en saisie manuelle.',
  internal_error: 'Une erreur est survenue pendant l’import.',
  network_error: 'Impossible de joindre le service d’import.',
  not_configured: 'Service d’import non configuré (URL ou secret manquant).',
};

export function isValidInstagramUrl(url: string): boolean {
  try {
    const trimmed = url.trim();
    if (!INSTAGRAM_URL_RE.test(trimmed)) return false;
    // Reject obviously malformed hosts caught by loose regex edge cases
    const parsed = new URL(trimmed);
    return /instagram\.com$|instagr\.am$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

/** Parse strings like "30 min", "1h30", "45 minutes", "1 hour" → minutes. */
export function parseDurationToMinutes(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const raw = value.trim().toLowerCase().replace(/,/g, '.');

  const hourMin = raw.match(/(\d+)\s*h(?:eurs?)?\s*(\d+)?/);
  if (hourMin) {
    const hours = Number(hourMin[1]);
    const mins = Number(hourMin[2] ?? 0);
    return hours * 60 + mins;
  }

  const minutesOnly = raw.match(/(\d+(?:\.\d+)?)\s*(min|minutes?|m)\b/);
  if (minutesOnly) return Math.round(Number(minutesOnly[1]));

  const hoursOnly = raw.match(/(\d+(?:\.\d+)?)\s*(h|heures?|hours?)\b/);
  if (hoursOnly) return Math.round(Number(hoursOnly[1]) * 60);

  const bareNumber = raw.match(/^(\d+)$/);
  if (bareNumber) return Number(bareNumber[1]);

  return null;
}

/** Parse strings like "4", "4 personnes", "pour 2" → number. */
export function parseServings(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const match = value.trim().match(/(\d+)/);
  if (!match) return null;
  const n = Number(match[1]);
  return n > 0 ? n : null;
}

export function buildUncertainFields(
  response: RecipeImportResponse,
  opts: {
    cookingTimeDefaulted: boolean;
    servingsDefaulted: boolean;
  }
): UncertainFields {
  const fields: UncertainFields = {};
  const infos = response.missing_info.map((s) => s.toLowerCase());
  const mentions = (keywords: string[]) =>
    infos.some((info) => keywords.some((kw) => info.includes(kw)));

  if (
    response.confidence === 'low' ||
    mentions(['title', 'titre', 'nom'])
  ) {
    fields.title = true;
  }

  if (opts.servingsDefaulted || mentions(['serving', 'portion', 'pers'])) {
    fields.servings = true;
  }

  if (
    opts.cookingTimeDefaulted ||
    mentions(['time', 'temps', 'durée', 'cuisson', 'prep', 'préparation'])
  ) {
    fields.cookingTime = true;
  }

  if (mentions(['ingredient', 'ingrédient', 'quantit'])) {
    fields.ingredients = response.ingredients.map(() => true);
  } else {
    fields.ingredients = response.ingredients.map(
      (ing) => !ing.quantity?.trim() || !ing.item?.trim()
    );
  }

  if (mentions(['step', 'étape', 'etape', 'instruction'])) {
    fields.steps = response.steps.map(() => true);
  } else {
    fields.steps = response.steps.map((step) => !step.trim());
  }

  if (response.confidence === 'low') {
    fields.title = true;
    fields.servings = true;
    fields.cookingTime = true;
    fields.ingredients = response.ingredients.map(() => true);
    fields.steps = response.steps.map(() => true);
  }

  return fields;
}

export function mapImportResponse(response: RecipeImportResponse): RecipeImportResult {
  const ingredients = response.ingredients.map((ing) =>
    formatIngredient({
      quantity: ing.quantity ?? '',
      name: ing.item,
    })
  );

  const cookMins = parseDurationToMinutes(response.cook_time);
  const prepMins = parseDurationToMinutes(response.prep_time);
  let cookingTime: number;
  let cookingTimeDefaulted = false;
  if (cookMins != null || prepMins != null) {
    cookingTime = (cookMins ?? 0) + (prepMins ?? 0) || 30;
    if (cookMins == null && prepMins == null) cookingTimeDefaulted = true;
  } else {
    cookingTime = 30;
    cookingTimeDefaulted = true;
  }

  const parsedServings = parseServings(response.servings);
  const servingsDefaulted = parsedServings == null;
  const servings = parsedServings ?? 4;

  const draft: Partial<Recipe> = {
    title: response.title?.trim() || 'Recette importée',
    ingredients: ingredients.length > 0 ? ingredients : [''],
    steps: response.steps.length > 0 ? response.steps : [''],
    cookingTime,
    servings,
    tags: [],
    sourceUrl: response.source_url,
  };

  return {
    draft,
    uncertainFields: buildUncertainFields(response, {
      cookingTimeDefaulted,
      servingsDefaulted,
    }),
  };
}

function parseErrorPayload(data: unknown): {
  code: RecipeImportErrorCode;
  message?: string;
  rawCaption?: string;
} {
  if (!data || typeof data !== 'object') {
    return { code: 'internal_error' };
  }
  const err = (data as { error?: { code?: string; message?: string; raw_caption?: string } })
    .error;
  const code = (err?.code as RecipeImportErrorCode) || 'internal_error';
  return {
    code: code in ERROR_MESSAGES ? code : 'internal_error',
    message: err?.message,
    rawCaption: err?.raw_caption,
  };
}

export function getImportErrorMessage(code: RecipeImportErrorCode): string {
  return ERROR_MESSAGES[code];
}

export async function importFromUrl(
  url: string,
  options?: { signal?: AbortSignal }
): Promise<RecipeImportResult> {
  const trimmed = url.trim();
  if (!isValidInstagramUrl(trimmed)) {
    throw new RecipeImportError('invalid_url', ERROR_MESSAGES.invalid_url);
  }

  const apiUrl = import.meta.env.VITE_IMPORT_API_URL as string | undefined;
  const secret = import.meta.env.VITE_IMPORT_SHARED_SECRET as string | undefined;
  if (!apiUrl?.trim() || !secret?.trim()) {
    throw new RecipeImportError('not_configured', ERROR_MESSAGES.not_configured);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), IMPORT_TIMEOUT_MS);

  const onAbort = () => controller.abort();
  options?.signal?.addEventListener('abort', onAbort);

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Import-Secret': secret,
      },
      body: JSON.stringify({ url: trimmed }),
      signal: controller.signal,
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const parsed = parseErrorPayload(data);
      if (response.status === 401) {
        throw new RecipeImportError('unauthorized', ERROR_MESSAGES.unauthorized);
      }
      if (response.status === 504) {
        throw new RecipeImportError('timeout', ERROR_MESSAGES.timeout, parsed.rawCaption);
      }
      throw new RecipeImportError(
        parsed.code,
        parsed.message || ERROR_MESSAGES[parsed.code],
        parsed.rawCaption
      );
    }

    return mapImportResponse(data as RecipeImportResponse);
  } catch (err) {
    if (err instanceof RecipeImportError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new RecipeImportError('timeout', ERROR_MESSAGES.timeout);
    }
    throw new RecipeImportError('network_error', ERROR_MESSAGES.network_error);
  } finally {
    window.clearTimeout(timeoutId);
    options?.signal?.removeEventListener('abort', onAbort);
  }
}
