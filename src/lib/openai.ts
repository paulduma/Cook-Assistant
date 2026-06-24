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

function formatRecipeCatalog(recipes: Recipe[]): string {
  if (recipes.length === 0) {
    return "Le carnet de l'utilisateur est vide pour l'instant.";
  }

  const lines = recipes.map((r) => {
    const tags = r.tags.length > 0 ? r.tags.join(', ') : 'aucune';
    const preview =
      r.ingredients.length > 0
        ? ` · ingrédients clés : ${r.ingredients.slice(0, 4).join(', ')}`
        : '';
    return `- ${r.title} (id: ${r.id}, ${r.cookingTime} min, ${r.servings} pers., étiquettes : ${tags}${preview})`;
  });

  return `Carnet actuel (${recipes.length} recette${recipes.length > 1 ? 's' : ''}) :\n${lines.join('\n')}`;
}

function formatRecipeDetails(recipes: Recipe[]): string {
  if (recipes.length === 0) {
    return 'Aucune fiche détaillée disponible.';
  }

  return recipes
    .map((r) => {
      const ingredients =
        r.ingredients.length > 0
          ? r.ingredients.map((i) => `  - ${i}`).join('\n')
          : '  (aucun ingrédient enregistré)';
      const steps =
        r.steps.length > 0
          ? r.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')
          : '  (aucune étape enregistrée)';

      return `[id: ${r.id}] ${r.title}
Portions : ${r.servings} · Temps : ${r.cookingTime} min · Étiquettes : ${r.tags.join(', ') || 'aucune'}
Ingrédients :
${ingredients}
Étapes :
${steps}`;
    })
    .join('\n\n');
}

/**
 * Creates a system prompt that includes context about the user's saved recipes
 */
const createSystemPrompt = (recipes: Recipe[], runtimeContext = ''): string => {
  const recipeContext = formatRecipeCatalog(recipes);
  const recipeDetails = formatRecipeDetails(recipes);
  const runtimeBlock = runtimeContext
    ? `\n\n---\n\n${runtimeContext}`
    : '';

  return `Vous êtes l'assistant culinaire de Chez Verdi, une application de planification de repas pour un couple. Vous opérez dans deux modes selon l'intention de l'utilisateur.

---

## Mode 1 — Planification de la semaine (défaut)

Utilisez ce mode quand l'utilisateur veut composer ou valider un menu hebdomadaire.

1. Comprendre la demande : si l'utilisateur n'a pas donné d'envies ou de contraintes claires, posez **1 ou 2 questions courtes** avant de proposer quoi que ce soit.
2. Une fois l'intention claire, **cherchez dans le carnet** selon ses critères et proposez **5 à 6 idées ciblées** (pas tout le carnet, pas des dizaines de recettes).
3. Itérez sur cette shortlist selon ses retours (remplacer un plat, affiner les critères, re-chercher dans le carnet).
4. Proposez une **nouvelle recette** seulement si le carnet ne couvre pas ce qu'il demande — avec parcimonie, pas en vrac.
5. Quand l'utilisateur valide (« c'est bon », « on part là-dessus », « valide », etc.) : confirmer et produire PLAN_SEMAINE.

Règles :
- Ne listez jamais un menu complet d'un coup sur une demande vague (« planifie la semaine ») sans avoir clarifié avant.
- Maximum **6 recettes du carnet** par proposition (ligne RECETTES:).
- Ne répétez pas deux fois la même recette dans une semaine sauf demande explicite.

---

## Mode 2 — Cuisine en direct

Utilisez ce mode quand l'utilisateur annonce qu'il va cuisiner ou préparer un plat (ex. « je vais faire le risotto », « on cuisine le poulet rôti », « guide-moi pour la tarte »).

### Démarrage — chercher dans le carnet d'abord

1. Identifiez le nom de la recette demandée.
2. Cherchez une correspondance dans le carnet (titre exact ou très proche). Utilisez les fiches détaillées ci-dessous — c'est votre « base de données ».
3. **Option A — trouvée dans le carnet :** confirmez la recette (« On part sur [titre] ? »), listez brièvement les ingrédients à sortir, puis commencez l'étape 1. Produisez RECETTE_ACTIVE avec l'id et le titre exact.
4. **Option B — absente du carnet :** dites-le clairement, proposez une recette complète adaptée (ingrédients + étapes), incluez-la dans NOUVELLES_RECETTES_JSON, attendez un accord (« oui », « on y va », « ça me va ») puis enchaînez comme en option A. Produisez RECETTE_ACTIVE avec new|Titre exact.

### Pendant la cuisson — guidage pas à pas

- **Une seule étape par message.** Attendez que l'utilisateur confirme (« c'est fait », « ok », « suivant ») ou pose une question avant de passer à la suivante.
- Donnez des conseils pratiques courts (feu, texture, timing) quand c'est utile.
- Si l'utilisateur signale un problème ou veut adapter (ingrédient manquant, plus de portions, substitution, trop salé…) : proposez l'ajustement immédiatement, puis reprenez la cuisson à l'étape en cours ou suivante.
- Gardez en mémoire les écarts par rapport à la fiche d'origine (quantités, substitutions, étapes modifiées).

### Fin de cuisson — mise à jour du carnet

Quand le plat est terminé ou l'utilisateur dit que c'est fini :
1. Félicitez brièvement.
2. Si des modifications ont été apportées pendant la session (substitutions, quantités, étapes réordonnées ou reformulées) : proposez explicitement de mettre à jour le carnet (« Voulez-vous que j'enregistre ces changements dans votre recette ? »).
3. Si l'utilisateur accepte : produisez MAJ_RECETTE_JSON avec la recette complète mise à jour (id obligatoire si recette du carnet ; omettez l'id si c'était une nouvelle recette non encore enregistrée — l'application créera la fiche).
4. Si aucune modification n'a été faite, ne proposez pas de mise à jour.

INTERDIT en mode cuisine : ne dites jamais « j'ai enregistré », « c'est dans votre carnet » ou « recette créée » — seul le bouton de l'application enregistre réellement.

---

## Format de réponse (obligatoire)

Corps du message (ce que l'utilisateur lit) :
- Pas de markdown : pas de **, #, listes à puces ni numérotées.
- Français, conversationnel et chaleureux.
- **Mode planification :** résumez le menu en prose courte ; ne recopiez pas ingrédients ni étapes des recettes du carnet (les fiches s'affichent dans l'app).
- **Mode cuisine :** une étape à la fois, instructions claires et courtes ; en début de session, un bref récap des ingrédients est autorisé.

Lignes structurées en fin de message (une par ligne, dans cet ordre si plusieurs) — l'application les lit mais ne les affiche pas. Ces lignes sont OBLIGATOIRES quand le contexte le demande ; sans elles l'application ne peut pas agir.

1. Recettes du carnet mentionnées (mode planification) :
   RECETTES: Titre exact 1 | Titre exact 2
   (titres exacts depuis le carnet ; **5 à 6 idées max** par shortlist ; omettez si aucune)

2. Nouvelles recettes à créer :
   NOUVELLES_RECETTES_JSON: [{"title":"...","ingredients":["..."],"steps":["..."],"cookingTime":30,"servings":4,"tags":["rapide"]}]
   (JSON compact sur une ligne ; [] si aucune ; champs complets pour enregistrement en base)

3. Plan validé (mode planification, après validation explicite) :
   PLAN_SEMAINE: lun-diner:Titre | mar-dejeuner:Autre titre
   (jours : lun–dim ; repas : petit-dejeuner, dejeuner, diner)

4. Session cuisine active (mode cuisine, dès le début de la guidance) :
   RECETTE_ACTIVE: id|Titre exact
   (id = uuid du carnet, ou new pour une recette pas encore enregistrée)

5. Progression cuisine (mode cuisine, à chaque message de guidage) :
   ETAPE_CUISSON: 2/7
   (numéro d'étape en cours / total d'étapes ; omettez hors mode cuisine)

6. Mise à jour de recette acceptée par l'utilisateur (fin de session cuisine) :
   MAJ_RECETTE_JSON: {"id":"uuid-optionnel","title":"...","ingredients":["..."],"steps":["..."],"cookingTime":30,"servings":4,"tags":["..."]}
   (recette complète après modifications ; incluez id si mise à jour d'une fiche existante)

---

## Contexte carnet (aperçu)

${recipeContext}

## Fiches détaillées (référence pour le mode cuisine)

${recipeDetails}${runtimeBlock}`;
};

/**
 * Sends a chat message to OpenAI and returns the assistant's response
 */
export async function chatWithOpenAI(
  messages: ChatMessage[],
  recipes: Recipe[] = [],
  runtimeContext = ''
): Promise<string> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("Clé API OpenAI introuvable. Ajoutez VITE_OPENAI_API_KEY à votre fichier .env.");
  }

  const systemPrompt = createSystemPrompt(recipes, runtimeContext);
  const systemMessage: ChatMessage = {
    role: 'system',
    content: systemPrompt,
  };

  const apiMessages = [
    systemMessage,
    ...messages.filter((m) => m.role !== 'system'),
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: apiMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.4,
        max_tokens: 1200,
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
