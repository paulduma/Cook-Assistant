import { Recipe } from '../types/recipe';
import { ChatMessage } from './openai';
import { searchRecipes, searchRecipesForPlanning } from './recipeSearch';

export type AssistantIntent = 'planning' | 'cooking' | 'general';

const COOKING_PATTERNS = [
  /je vais cuisiner/i,
  /je vais (?:faire|préparer|preparer)\s/i,
  /on cuisine/i,
  /guide[- ]?moi/i,
  /étape\s*\d/i,
  /etape\s*\d/i,
  /c'est fait/i,
  /cest fait/i,
  /suivant/i,
];

const PLANNING_PATTERNS = [
  /planif/i,
  /cette semaine/i,
  /menu de la semaine/i,
  /qu.?est[- ]ce qu.?on mange/i,
  /vider le frigo/i,
  /idées?\s+veggie/i,
  /idees?\s+veggie/i,
  /rapide en semaine/i,
];

const VALIDATION_PATTERNS = [
  /^c'?est bon[.!]?$/i,
  /^valide[.!]?$/i,
  /^on part l[aà]-dessus[.!]?$/i,
  /^parfait[.!]?$/i,
  /^go[.!]?$/i,
  /^ok pour (?:le )?menu/i,
];

const AFFIRMATIVE_PATTERNS = [
  /^(?:oui|ok|d'accord|dac|ça me va|ca me va|on y va|vas-y|go)\b/i,
];

const COOKING_QUERY_PATTERNS = [
  /je vais (?:faire|cuisiner|préparer|preparer)\s+(?:le|la|l'|les)?\s*(.+)/i,
  /on cuisine\s+(?:le|la|l'|les)?\s*(.+)/i,
  /guide[- ]?moi\s+(?:pour\s+)?(?:le|la|l'|les)?\s*(.+)/i,
  /(?:recette|plat)\s+(?:de\s+|du\s+|des\s+)?(.+)/i,
];

function hasActiveCookingSession(messages: ChatMessage[]): boolean {
  return messages.some(
    (message) => message.role === 'assistant' && /RECETTE_ACTIVE:/i.test(message.content)
  );
}

export function detectIntent(
  userMessage: string,
  messages: ChatMessage[] = []
): AssistantIntent {
  if (hasActiveCookingSession(messages)) return 'cooking';
  if (COOKING_PATTERNS.some((pattern) => pattern.test(userMessage))) return 'cooking';
  if (PLANNING_PATTERNS.some((pattern) => pattern.test(userMessage))) return 'planning';
  return 'general';
}

export function extractRecipeQuery(userMessage: string): string | null {
  for (const pattern of COOKING_QUERY_PATTERNS) {
    const match = userMessage.match(pattern);
    if (match?.[1]) {
      const query = match[1]
        .replace(/[.!?]+$/g, '')
        .replace(/\b(s'il te plaît|stp|maintenant)\b/gi, '')
        .trim();
      if (query.length > 2) return query;
    }
  }
  return null;
}

export function isValidationMessage(userMessage: string): boolean {
  const trimmed = userMessage.trim();
  return VALIDATION_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function isAffirmativeMessage(userMessage: string): boolean {
  return AFFIRMATIVE_PATTERNS.some((pattern) => pattern.test(userMessage.trim()));
}

export function buildRuntimeContext(messages: ChatMessage[], recipes: Recipe[]): string {
  const lastUser = [...messages].reverse().find((message) => message.role === 'user');
  if (!lastUser) return '';

  const intent = detectIntent(lastUser.content, messages);
  const parts: string[] = [
    '## Données temps réel (prioritaires — l’application a déjà cherché dans le carnet)',
  ];

  if (intent === 'cooking') {
    const query = extractRecipeQuery(lastUser.content);
    const matches = query ? searchRecipes(query, recipes, 4) : [];

    if (matches.length === 1) {
      const recipe = matches[0];
      parts.push('MODE CUISINE — recette trouvée dans le carnet :');
      parts.push(`- id: ${recipe.id}`);
      parts.push(`- titre exact: ${recipe.title}`);
      parts.push(
        `OBLIGATION: utilisez uniquement l’option A. Produisez RECETTE_ACTIVE: ${recipe.id}|${recipe.title}`
      );
      if (recipe.steps.length > 0) {
        parts.push(`Produisez aussi ETAPE_CUISSON: 1/${recipe.steps.length}`);
      }
    } else if (matches.length > 1) {
      parts.push('MODE CUISINE — plusieurs recettes possibles, demandez laquelle :');
      matches.forEach((recipe) => {
        parts.push(`- id: ${recipe.id} | titre: ${recipe.title}`);
      });
    } else if (query) {
      parts.push(
        `MODE CUISINE — aucune recette ne correspond à « ${query} » dans le carnet (${recipes.length} fiches).`
      );
      parts.push('Utilisez l’option B avec NOUVELLES_RECETTES_JSON si vous proposez une nouvelle fiche.');
      parts.push(
        'INTERDIT: ne dites jamais que la recette est enregistrée — l’application le fait via un bouton.'
      );
    }
  }

  if (intent === 'planning' || intent === 'general') {
    const matches = searchRecipesForPlanning(lastUser.content, recipes, messages);
    if (matches.length > 0) {
      parts.push('MODE PLANIFICATION — recettes du carnet à utiliser (copiez les titres EXACTEMENT) :');
      matches.forEach((recipe) => {
        parts.push(`- ${recipe.title} (id: ${recipe.id})`);
      });
      parts.push(
        `OBLIGATION: incluez RECETTES: ${matches.map((recipe) => recipe.title).join(' | ')}`
      );
    }
  }

  if (isValidationMessage(lastUser.content)) {
    parts.push(
      'L’utilisateur VALIDE le menu. OBLIGATION: produisez PLAN_SEMAINE: avec les titres exacts (lun-diner:Titre | mar-dejeuner:Autre).'
    );
  }

  parts.push(
    'RAPPEL: ne prétendez jamais avoir enregistré une recette ou rempli le planning — seuls les boutons de l’application le font.'
  );

  return parts.join('\n');
}
