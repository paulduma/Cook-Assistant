import { Recipe } from '../types/recipe';
import { ChatMessage } from './openai';
import {
  detectIntent,
  extractRecipeQuery,
  isValidationMessage,
} from './assistantContext';
import { searchRecipes, searchRecipesForPlanning } from './recipeSearch';
import { SuggestedRecipe } from './chatRecipes';

const RECETTES_LINE = /^RECETTES:\s*(.+)$/im;
const PLAN_LINE = /^PLAN_SEMAINE:\s*(.+)$/im;
const RECETTE_ACTIVE_LINE = /^RECETTE_ACTIVE:\s*(.+)$/im;
const ETAPE_LINE = /^ETAPE_CUISSON:\s*(.+)$/im;
const NOUVELLES_LINE = /^NOUVELLES_RECETTES_JSON:\s*(.+)$/im;

function appendLine(content: string, line: string): string {
  return `${content.trimEnd()}\n${line}`;
}

export function enrichAssistantResponse(
  content: string,
  lastUserMessage: string,
  messages: ChatMessage[],
  recipes: Recipe[]
): string {
  let enriched = content;
  const intent = detectIntent(lastUserMessage, messages);

  if (intent === 'cooking') {
    const query = extractRecipeQuery(lastUserMessage);
    const match = query ? searchRecipes(query, recipes, 1)[0] : undefined;

    if (match) {
      if (!RECETTE_ACTIVE_LINE.test(enriched)) {
        enriched = appendLine(enriched, `RECETTE_ACTIVE: ${match.id}|${match.title}`);
      }
      if (!ETAPE_LINE.test(enriched) && match.steps.length > 0) {
        enriched = appendLine(enriched, `ETAPE_CUISSON: 1/${match.steps.length}`);
      }
    }
  }

  if (intent === 'planning' || isValidationMessage(lastUserMessage)) {
    const matches = searchRecipesForPlanning(lastUserMessage, recipes, messages);
    if (matches.length > 0 && !RECETTES_LINE.test(enriched)) {
      enriched = appendLine(
        enriched,
        `RECETTES: ${matches.map((recipe) => recipe.title).join(' | ')}`
      );
    }
  }

  return enriched;
}

export function collectConversationSuggested(messages: ChatMessage[]): SuggestedRecipe[] {
  const byTitle = new Map<string, SuggestedRecipe>();

  for (const message of messages) {
    if (message.role !== 'assistant') continue;
    const match = message.content.match(NOUVELLES_LINE);
    if (!match) continue;

    try {
      const parsed = JSON.parse(match[1].trim());
      if (!Array.isArray(parsed)) continue;
      for (const item of parsed) {
        if (typeof item?.title !== 'string') continue;
        byTitle.set(item.title.toLowerCase().trim(), item as SuggestedRecipe);
      }
    } catch {
      // ignore malformed JSON
    }
  }

  return [...byTitle.values()];
}

export function findSuggestedInConversation(
  title: string,
  messages: ChatMessage[]
): SuggestedRecipe | undefined {
  const norm = title.toLowerCase().trim();
  const exact = collectConversationSuggested(messages).find(
    (recipe) => recipe.title.toLowerCase().trim() === norm
  );
  if (exact) return exact;

  return collectConversationSuggested(messages).find((recipe) => {
    const recipeNorm = recipe.title.toLowerCase().trim();
    return recipeNorm.includes(norm) || norm.includes(recipeNorm);
  });
}
