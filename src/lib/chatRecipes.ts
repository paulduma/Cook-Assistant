import { Recipe } from '../types/recipe';

const RECETTES_LINE = /^RECETTES:\s*(.+)$/im;

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

function matchRecipeByTitle(title: string, recipes: Recipe[]): Recipe | undefined {
  const norm = title.toLowerCase().trim();
  return recipes.find((r) => r.title.toLowerCase().trim() === norm);
}

export function findMentionedRecipes(content: string, recipes: Recipe[]): Recipe[] {
  const stripped = stripMarkdown(content);
  const lower = stripped.toLowerCase();
  return recipes
    .filter((r) => {
      const title = r.title.toLowerCase().trim();
      return title.length > 2 && lower.includes(title);
    })
    .slice(0, 3);
}

export function parseAssistantMessage(
  content: string,
  recipes: Recipe[]
): { text: string; mentioned: Recipe[] } {
  const match = content.match(RECETTES_LINE);

  if (match) {
    const text = stripMarkdown(content.slice(0, match.index).trim());
    const titles = match[1].split('|').map((t) => t.trim()).filter(Boolean);
    const mentioned: Recipe[] = [];

    for (const title of titles) {
      const recipe = matchRecipeByTitle(title, recipes);
      if (recipe && !mentioned.some((m) => m.id === recipe.id)) {
        mentioned.push(recipe);
      }
    }

    return { text, mentioned: mentioned.slice(0, 3) };
  }

  const text = stripMarkdown(content);
  return { text, mentioned: findMentionedRecipes(text, recipes) };
}
