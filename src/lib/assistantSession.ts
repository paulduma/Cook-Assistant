import { SuggestedRecipe, WeekPlanEntry } from './chatRecipes';

export interface AssistantCookingSession {
  recipeId: string | null;
  title: string;
  step: number;
  totalSteps: number;
}

export interface AssistantSession {
  mode: 'planning' | 'cooking' | null;
  cooking: AssistantCookingSession | null;
}

export const INITIAL_ASSISTANT_SESSION: AssistantSession = {
  mode: null,
  cooking: null,
};

export function deriveSessionFromMessages(
  messages: { role: string; content: string }[],
  parseMessage: (content: string) => {
    activeCooking: { recipeId: string | null; title: string } | null;
    cookingStep: { current: number; total: number } | null;
    weekPlan: WeekPlanEntry[];
  }
): AssistantSession {
  let session: AssistantSession = { ...INITIAL_ASSISTANT_SESSION };

  for (const message of messages) {
    if (message.role !== 'assistant') continue;

    const parsed = parseMessage(message.content);

    if (parsed.weekPlan.length > 0) {
      session = { ...session, mode: 'planning' };
    }

    if (parsed.activeCooking) {
      session = {
        mode: 'cooking',
        cooking: {
          recipeId: parsed.activeCooking.recipeId,
          title: parsed.activeCooking.title,
          step: parsed.cookingStep?.current ?? 1,
          totalSteps: parsed.cookingStep?.total ?? 1,
        },
      };
    } else if (parsed.cookingStep && session.cooking) {
      session = {
        ...session,
        mode: 'cooking',
        cooking: {
          ...session.cooking,
          step: parsed.cookingStep.current,
          totalSteps: parsed.cookingStep.total,
        },
      };
    }
  }

  return session;
}

export function filterNewSuggestions(
  suggested: SuggestedRecipe[],
  recipes: { title: string }[],
  savedTitles: Set<string>
): SuggestedRecipe[] {
  const carnetTitles = new Set(recipes.map((r) => r.title.toLowerCase().trim()));
  const seen = new Set<string>();

  return suggested.filter((s) => {
    const norm = s.title.toLowerCase().trim();
    if (seen.has(norm) || carnetTitles.has(norm) || savedTitles.has(norm)) {
      return false;
    }
    seen.add(norm);
    return true;
  });
}

export function countUnresolvedPlanTitles(
  entries: WeekPlanEntry[],
  recipes: { id: string; title: string }[],
  suggested: SuggestedRecipe[],
  savedTitles: Map<string, string>
): number {
  let count = 0;

  for (const entry of entries) {
    const norm = entry.title.toLowerCase().trim();
    if (savedTitles.has(norm)) continue;
    if (recipes.some((r) => r.title.toLowerCase().trim() === norm)) continue;
    if (suggested.some((s) => s.title.toLowerCase().trim() === norm)) {
      count++;
    }
  }

  return count;
}
