import { describe, it, expect, beforeEach } from 'vitest';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
}

(globalThis as any).sessionStorage = new MemoryStorage();

const { loadChatSession, saveChatSession, clearChatSession } = await import(
  './chatSessionStorage'
);

describe('chatSessionStorage', () => {
  beforeEach(() => {
    (globalThis as any).sessionStorage = new MemoryStorage();
  });

  it('returns null when nothing was saved yet', () => {
    expect(loadChatSession()).toBeNull();
  });

  it('round-trips messages and derived state through sessionStorage', () => {
    saveChatSession({
      messages: [
        { role: 'user', content: 'Bonjour' },
        { role: 'assistant', content: 'Salut !' },
      ],
      savedSuggestionTitles: [['tarte aux pommes', 'recipe-1']],
      appliedWeekPlanIndices: [2],
      dismissedRecipeUpdates: [0],
      savedRecipeUpdateIndices: [1],
      cookingBarDismissed: true,
    });

    const restored = loadChatSession();
    expect(restored?.messages).toEqual([
      { role: 'user', content: 'Bonjour' },
      { role: 'assistant', content: 'Salut !' },
    ]);
    expect(restored?.savedSuggestionTitles).toEqual([['tarte aux pommes', 'recipe-1']]);
    expect(restored?.appliedWeekPlanIndices).toEqual([2]);
    expect(restored?.cookingBarDismissed).toBe(true);
  });

  it('simulates surviving a tab switch: a fresh "mount" still sees the saved session', () => {
    saveChatSession({
      messages: [{ role: 'user', content: 'Que cuisiner ce soir ?' }],
      savedSuggestionTitles: [],
      appliedWeekPlanIndices: [],
      dismissedRecipeUpdates: [],
      savedRecipeUpdateIndices: [],
      cookingBarDismissed: false,
    });

    // A route change unmounts ChatPage; navigating back re-mounts it and
    // re-runs the lazy useState initializers, which call loadChatSession().
    const remountedInitialMessages = loadChatSession()?.messages ?? [];
    expect(remountedInitialMessages).toEqual([{ role: 'user', content: 'Que cuisiner ce soir ?' }]);
  });

  it('clears the session so a new mount starts empty again ("Nouvelle conversation")', () => {
    saveChatSession({
      messages: [{ role: 'user', content: 'Hello' }],
      savedSuggestionTitles: [],
      appliedWeekPlanIndices: [],
      dismissedRecipeUpdates: [],
      savedRecipeUpdateIndices: [],
      cookingBarDismissed: false,
    });

    clearChatSession();

    expect(loadChatSession()).toBeNull();
  });
});
