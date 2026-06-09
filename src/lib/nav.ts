export type TabKey = 'recettes' | 'planning' | 'courses' | '';

export function pathFromNavKey(key: TabKey): string {
  switch (key) {
    case 'recettes':
      return '/recipes';
    case 'planning':
      return '/planning';
    case 'courses':
      return '/grocery';
    default:
      return '/';
  }
}

export function navKeyFromPath(path: string): TabKey {
  if (path.startsWith('/recipes')) return 'recettes';
  if (path.startsWith('/planning')) return 'planning';
  if (path.startsWith('/grocery')) return 'courses';
  return '';
}
