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
    ? `\n\nVous avez accès aux recettes sauvegardées par l'utilisateur :\n${recipes.map(r => 
        `- ${r.title} (${r.cookingTime} min, ${r.servings} portions, étiquettes : ${r.tags.join(', ')})`
      ).join('\n')}`
    : "\n\nL'utilisateur n'a pas encore de recettes sauvegardées.";

  return `Vous êtes un assistant culinaire utile pour une application de planification de repas. Votre rôle est de :
1. Suggérer des recettes selon les préférences de l'utilisateur, ses restrictions alimentaires, les ingrédients disponibles ou les types de cuisine
2. Aider à planifier les repas de la semaine
3. Fournir des conseils de cuisine et de l'inspiration
4. Faire référence aux recettes sauvegardées de l'utilisateur lorsque c'est pertinent
5. Proposer de nouvelles recettes à ajouter à sa bibliothèque
6. Aider avec des stratégies de planification des repas

Format de réponse (obligatoire) :
- Pas de markdown : pas de **, #, listes à puces ni numérotées pour détailler les recettes.
- Texte conversationnel court (2 à 4 phrases maximum) dans le corps du message.
- Les fiches recettes s'affichent automatiquement sous votre message : ne répétez pas les ingrédients, étapes, temps ou portions dans le texte.
- Quand vous recommandez des recettes du carnet de l'utilisateur, terminez TOUJOURS votre message par une ligne seule, exactement au format :
  RECETTES: Titre exact 1 | Titre exact 2
  (copiez les titres à l'identique depuis la liste du carnet, maximum 3 recettes)
- Pour une idée de recette qui n'est pas dans le carnet, décrivez-la brièvement dans le texte sans ligne RECETTES.

Répondez en français, de manière conversationnelle, chaleureuse et utile.${recipeContext}`;
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
    throw new Error("Clé API OpenAI introuvable. Ajoutez VITE_OPENAI_API_KEY à votre fichier .env.");
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
      throw new Error("Aucune réponse reçue d'OpenAI");
    }

    return assistantMessage;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Échec de la communication avec l'API OpenAI");
  }
}

/**
 * Check if OpenAI API key is configured
 */
export function isOpenAIConfigured(): boolean {
  return getApiKey() !== null;
}

