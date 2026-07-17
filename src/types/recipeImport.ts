import { Recipe } from './recipe';

export type Confidence = 'high' | 'medium' | 'low';

/** Contrat retourné par le backend d'extraction (POST /import) */
export interface RecipeImportResponse {
  title: string;
  confidence: Confidence;
  servings: string | null;
  prep_time: string | null;
  cook_time: string | null;
  ingredients: { quantity: string | null; item: string }[];
  steps: string[];
  missing_info: string[];
  source_url: string;
  source_caption_used: boolean;
}

/** Champs du formulaire jugés incertains — piloté par missing_info, jamais persisté */
export interface UncertainFields {
  title?: boolean;
  servings?: boolean;
  cookingTime?: boolean;
  ingredients?: boolean[];
  steps?: boolean[];
}

/** Résultat exploitable côté UI après mapping */
export interface RecipeImportResult {
  draft: Partial<Recipe>;
  uncertainFields: UncertainFields;
  /** Présent seulement sur fallback JSON invalide */
  rawCaption?: string;
}

export type RecipeImportErrorCode =
  | 'invalid_url'
  | 'unauthorized'
  | 'content_unavailable'
  | 'download_failed'
  | 'extraction_failed'
  | 'timeout'
  | 'internal_error'
  | 'network_error'
  | 'not_configured';

export class RecipeImportError extends Error {
  readonly code: RecipeImportErrorCode;
  readonly rawCaption?: string;

  constructor(code: RecipeImportErrorCode, message: string, rawCaption?: string) {
    super(message);
    this.name = 'RecipeImportError';
    this.code = code;
    this.rawCaption = rawCaption;
  }
}
