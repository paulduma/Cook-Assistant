export type IngredientLine = { quantity: string; name: string };

const UNIT_PATTERN = /\b(g|kg|ml|cl|l|cs|c\.à\.s|c\.à\.c|cuillères?|tasses?)\b/i;

/** Décompose une ligne stockée (ex. « 400 g de pâtes ») en quantité + ingrédient. */
export function parseIngredient(line: string): IngredientLine {
  const trimmed = line.trim();
  if (!trimmed) return { quantity: '', name: '' };

  const deMatch = trimmed.match(/^(.+?)\s+de\s+(.+)$/i);
  if (deMatch) {
    return { quantity: deMatch[1].trim(), name: deMatch[2].trim() };
  }

  const numMatch = trimmed.match(/^(\d+[\d.,/\s]*)\s+(.+)$/);
  if (numMatch) {
    return { quantity: numMatch[1].trim(), name: numMatch[2].trim() };
  }

  return { quantity: '', name: trimmed };
}

/** Recompose le format texte conservé dans Recipe.ingredients. */
export function formatIngredient({ quantity, name }: IngredientLine): string {
  const q = quantity.trim();
  const n = name.trim();
  if (!n) return q;
  if (!q) return n;
  if (UNIT_PATTERN.test(q)) return `${q} de ${n}`;
  return `${q} ${n}`;
}

export function parseIngredients(lines: string[]): IngredientLine[] {
  const parsed = lines.map(parseIngredient);
  return parsed.length > 0 ? parsed : [{ quantity: '', name: '' }];
}

export function formatIngredients(lines: IngredientLine[]): string[] {
  return lines.map(formatIngredient).filter((line) => line.trim());
}
