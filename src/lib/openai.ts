import { Recipe } from '../types/recipe';

// Get OpenAI API key from environment
const getApiKey = (): string | null => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_OPENAI_API_KEY || null;
  }
  return null;
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Creates a system prompt that includes context about the user's saved recipes
 */
const createSystemPrompt = (recipes: Recipe[]): string => {
  const recipeContext = recipes.length > 0
    ? `\n\nYou have access to the user's saved recipes:\n${recipes.map(r => 
        `- ${r.title} (${r.cookingTime} min, ${r.servings} servings, tags: ${r.tags.join(', ')})`
      ).join('\n')}`
    : '\n\nThe user does not have any saved recipes yet.';

  return `You are a helpful cooking assistant for a meal planning app. Your role is to:
1. Suggest recipes based on user preferences, dietary restrictions, available ingredients, or cuisine types
2. Help plan meals for the week
3. Provide cooking tips and inspiration
4. Reference the user's saved recipes when relevant
5. Suggest new recipes that can be added to their library
6. Help with meal planning strategies

When suggesting recipes, provide:
- Recipe name
- Brief description
- Key ingredients (3-5 main ones)
- Estimated cooking time
- Suggested servings

Be conversational, friendly, and helpful. Keep responses concise but informative.${recipeContext}`;
};

/**
 * Sends a chat message to OpenAI and returns the assistant's response
 */
export async function chatWithOpenAI(
  messages: ChatMessage[],
  recipes: Recipe[] = []
): Promise<string> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  // Create system message with recipe context
  const systemPrompt = createSystemPrompt(recipes);
  const systemMessage: ChatMessage = {
    role: 'system',
    content: systemPrompt,
  };

  // Prepare messages for API (system + user messages)
  const apiMessages = [
    systemMessage,
    ...messages.filter(m => m.role !== 'system'), // Don't duplicate system messages
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency, can be changed to gpt-4o if needed
        messages: apiMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
        max_tokens: 500, // Limit response length for cost control
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('No response from OpenAI');
    }

    return assistantMessage;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to communicate with OpenAI API');
  }
}

/**
 * Check if OpenAI API key is configured
 */
export function isOpenAIConfigured(): boolean {
  return getApiKey() !== null;
}

