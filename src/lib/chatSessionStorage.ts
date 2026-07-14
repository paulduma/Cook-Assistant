import { ChatMessage } from './openai';

const STORAGE_KEY = 'cookAssistant.chatSession';

export interface StoredChatSession {
  messages: ChatMessage[];
  savedSuggestionTitles: [string, string][];
  appliedWeekPlanIndices: number[];
  dismissedRecipeUpdates: number[];
  savedRecipeUpdateIndices: number[];
  addedToPlanningRecipeIds: string[];
  cookingBarDismissed: boolean;
}

// Uses sessionStorage on purpose: the conversation should survive tab
// switches within the same browser session but reset when the tab/browser
// closes, or when the user explicitly starts a new conversation.
export function loadChatSession(): StoredChatSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredChatSession) : null;
  } catch (err) {
    console.warn('Failed to load chat session:', err);
    return null;
  }
}

export function saveChatSession(session: StoredChatSession) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Failed to save chat session:', err);
  }
}

export function clearChatSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear chat session:', err);
  }
}
