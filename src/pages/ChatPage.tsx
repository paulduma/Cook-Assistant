import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { chatWithOpenAI, isOpenAIConfigured, ChatMessage } from '../lib/openai';
import { parseAssistantMessage, SuggestedRecipe, findRecipeByTitleLoose } from '../lib/chatRecipes';
import { fetchRecipes, createRecipe, updateRecipe } from '../lib/recipes';
import {
  addRecipeToFirstEmptySlot,
  applyWeekPlan,
  findSuggestedByTitle,
  resolveTitleToRecipeId,
  weekPlanEntryToSlot,
} from '../lib/planning';
import {
  deriveSessionFromMessages,
  filterNewSuggestions,
  countUnresolvedPlanTitles,
  INITIAL_ASSISTANT_SESSION,
} from '../lib/assistantSession';
import { buildRuntimeContext, isAffirmativeMessage } from '../lib/assistantContext';
import {
  enrichAssistantResponse,
  collectConversationSuggested,
  findSuggestedInConversation,
} from '../lib/assistantEnrichment';
import { Recipe } from '../types/recipe';
import { Kicker, AssistantAvatar, Thumb } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';
import { Carousel } from '../components/ui/Carousel';
import { MobileScreen, MobileTopBar, MobileTabBar } from '../components/ui/MobileShell';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { pathFromNavKey, TabKey } from '../lib/nav';
import { NewRecipeSuggestion } from '../components/assistant/NewRecipeSuggestion';
import { WeekPlanValidation } from '../components/assistant/WeekPlanValidation';
import { CookingSessionBar } from '../components/assistant/CookingSessionBar';
import { RecipeUpdatePrompt } from '../components/assistant/RecipeUpdatePrompt';
import { loadChatSession, saveChatSession, clearChatSession } from '../lib/chatSessionStorage';

const CHIPS = ['Planifier la semaine', 'Je vais cuisiner', 'Vider le frigo', 'Idées veggie', 'Rapide en semaine'];

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end mb-7">
      <div className="max-w-[82%] md:max-w-[74%]">
        <Kicker className="text-muted text-right mb-1.5">Vous</Kicker>
        <div className="bg-ember-soft border border-line rounded-[14px_14px_4px_14px] px-3.5 md:px-[18px] py-2.5 md:py-3 text-[15.5px] md:text-[16.5px] text-ink leading-[1.5] whitespace-pre-wrap">
          {children}
        </div>
      </div>
    </div>
  );
}

function AssistantRow({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`flex gap-3 md:gap-4 mb-7 ${compact ? '' : ''}`}>
      <AssistantAvatar size={compact ? 30 : 38} />
      <div className="flex-1 min-w-0 pt-0.5">
        <Kicker className="text-ink mb-1.5 md:mb-2">
          Chez&nbsp;Verdi · assistant
        </Kicker>
        {children}
      </div>
    </div>
  );
}

function RecipeSuggestion({
  recipe,
  onAddToPlan,
  onOpen,
  isAddedToPlan = false,
  compact = false,
}: {
  recipe: Recipe;
  onAddToPlan: () => void;
  onOpen: () => void;
  isAddedToPlan?: boolean;
  compact?: boolean;
}) {
  const tag = recipe.tags[0] ?? 'Recette';
  return (
    <div
      className={[
        'flex bg-cream border border-line',
        compact ? 'gap-3 p-3 mt-2.5 w-full' : 'flex-1 gap-3.5 p-3.5 min-w-0',
      ].join(' ')}
    >
      <Thumb
        label="photo"
        src={recipe.image}
        className={compact ? 'w-16 h-16 shrink-0' : 'w-[76px] h-[76px] shrink-0'}
      />
      <div className="flex-1 min-w-0">
        <Kicker className="text-olive mb-0.5 md:mb-1">{tag}</Kicker>
        <div
          className={[
            'font-display text-ink leading-[1.1] mb-1 md:mb-1.5',
            compact ? 'text-[17px] mb-1' : 'text-[19px]',
          ].join(' ')}
        >
          {recipe.title}
        </div>
        <div className="font-label text-[10px] md:text-[10.5px] uppercase tracking-wide text-muted mb-2 md:mb-3 whitespace-nowrap">
          {recipe.cookingTime} min · {recipe.servings} pers.
        </div>
        <div className={`flex gap-2 ${compact ? '' : ''}`}>
          <button
            type="button"
            onClick={onAddToPlan}
            disabled={isAddedToPlan}
            className={[
              'inline-flex items-center gap-1.5 font-label font-semibold uppercase tracking-wide border-0 whitespace-nowrap',
              isAddedToPlan
                ? 'text-muted bg-line cursor-default'
                : 'text-creamlight bg-ember cursor-pointer',
              compact
                ? 'text-[10px] px-3 py-1.5'
                : 'text-[10.5px] px-3 py-2',
            ].join(' ')}
          >
            <Icon
              name={isAddedToPlan ? 'check' : 'plus'}
              size={compact ? 12 : 13}
              strokeWidth={2.1}
            />
            {isAddedToPlan ? 'Ajouté' : 'Au planning'}
          </button>
          {!compact && (
            <button
              onClick={onOpen}
              className="font-label text-[10.5px] font-semibold uppercase tracking-wide text-ink bg-transparent border border-line px-3 py-2 cursor-pointer whitespace-nowrap"
            >
              Voir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onChipClick }: { onChipClick: (text: string) => void }) {
  return (
    <AssistantRow>
      <p className="text-[16px] md:text-[17.5px] text-ink-soft leading-[1.55] m-0">
        Bonsoir vous deux&nbsp;! Je peux composer votre semaine ou vous guider pas à pas pendant
        que vous cuisinez — dites-moi ce que vous avez envie de faire.
      </p>
      <div className="flex flex-wrap gap-2 md:gap-2.5 mt-3 md:mt-4">
        {CHIPS.map((c) => (
          <button
            key={c}
            onClick={() => onChipClick(c)}
            className="font-label text-[10.5px] md:text-[11.5px] font-medium uppercase tracking-wide text-ink-soft border border-line bg-cream px-3 md:px-[15px] py-1.5 md:py-2.5 rounded-full cursor-pointer whitespace-nowrap"
          >
            {c}
          </button>
        ))}
      </div>
    </AssistantRow>
  );
}

export function ChatPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const initialMessage = (location.state as { initialMessage?: string } | null)?.initialMessage;

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => loadChatSession()?.messages ?? []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedSuggestionTitles, setSavedSuggestionTitles] = useState<Map<string, string>>(
    () => new Map(loadChatSession()?.savedSuggestionTitles ?? [])
  );
  const [appliedWeekPlanIndices, setAppliedWeekPlanIndices] = useState<Set<number>>(
    () => new Set(loadChatSession()?.appliedWeekPlanIndices ?? [])
  );
  const [dismissedRecipeUpdates, setDismissedRecipeUpdates] = useState<Set<number>>(
    () => new Set(loadChatSession()?.dismissedRecipeUpdates ?? [])
  );
  const [savedRecipeUpdateIndices, setSavedRecipeUpdateIndices] = useState<Set<number>>(
    () => new Set(loadChatSession()?.savedRecipeUpdateIndices ?? [])
  );
  const [addedToPlanningRecipeIds, setAddedToPlanningRecipeIds] = useState<Set<string>>(
    () => new Set(loadChatSession()?.addedToPlanningRecipeIds ?? [])
  );
  const [savingSuggestionTitles, setSavingSuggestionTitles] = useState<Set<string>>(
    () => new Set()
  );
  const [applyingWeekPlanIndex, setApplyingWeekPlanIndex] = useState<number | null>(null);
  const [savingRecipeUpdateIndex, setSavingRecipeUpdateIndex] = useState<number | null>(null);
  const [cookingBarDismissed, setCookingBarDismissed] = useState(
    () => loadChatSession()?.cookingBarDismissed ?? false
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSentInitial = useRef(false);
  // Synchronous lock (unlike React state, updates are visible immediately) so the
  // manual "Ajouter au carnet" click and the auto-save-on-affirmation flow below
  // never both insert the same suggested recipe.
  const suggestionSaveLockRef = useRef<Set<string>>(new Set());

  const parseForSession = useCallback(
    (content: string) => {
      const parsed = parseAssistantMessage(content, recipes);
      return {
        activeCooking: parsed.activeCooking,
        cookingStep: parsed.cookingStep,
        weekPlan: parsed.weekPlan,
      };
    },
    [recipes]
  );

  const session = useMemo(() => {
    if (messages.length === 0) return INITIAL_ASSISTANT_SESSION;
    return deriveSessionFromMessages(messages, parseForSession);
  }, [messages, parseForSession]);

  const showCookingBar = session.mode === 'cooking' && session.cooking && !cookingBarDismissed;

  const refreshRecipes = useCallback(async () => {
    try {
      setRecipes(await fetchRecipes());
    } catch (err) {
      console.warn('Failed to load recipes for chat:', err);
    }
  }, []);

  useEffect(() => {
    void refreshRecipes();
  }, [refreshRecipes]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    saveChatSession({
      messages,
      savedSuggestionTitles: Array.from(savedSuggestionTitles.entries()),
      appliedWeekPlanIndices: Array.from(appliedWeekPlanIndices),
      dismissedRecipeUpdates: Array.from(dismissedRecipeUpdates),
      savedRecipeUpdateIndices: Array.from(savedRecipeUpdateIndices),
      addedToPlanningRecipeIds: Array.from(addedToPlanningRecipeIds),
      cookingBarDismissed,
    });
  }, [
    messages,
    savedSuggestionTitles,
    appliedWeekPlanIndices,
    dismissedRecipeUpdates,
    savedRecipeUpdateIndices,
    addedToPlanningRecipeIds,
    cookingBarDismissed,
  ]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    if (!isOpenAIConfigured()) {
      setError(
        "Clé API OpenAI introuvable. Ajoutez VITE_OPENAI_API_KEY dans votre fichier .env puis redémarrez le serveur de développement."
      );
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setPrompt('');
    setIsLoading(true);
    setError(null);

    try {
      let freshRecipes = recipes;
      try {
        freshRecipes = await fetchRecipes();
        setRecipes(freshRecipes);
      } catch (err) {
        console.warn('Failed to refresh recipes before chat:', err);
      }

      if (freshRecipes.length === 0) {
        setError(
          'Carnet vide ou inaccessible. Vérifiez votre connexion Supabase avant de continuer.'
        );
      }

      const runtimeContext = buildRuntimeContext(updatedMessages, freshRecipes);
      const rawResponse = await chatWithOpenAI(updatedMessages, freshRecipes, runtimeContext);
      const enrichedResponse = enrichAssistantResponse(
        rawResponse,
        trimmed,
        updatedMessages,
        freshRecipes
      );

      setMessages((prev) => [...prev, { role: 'assistant', content: enrichedResponse }]);

      const parsed = parseAssistantMessage(enrichedResponse, freshRecipes);
      if (isAffirmativeMessage(trimmed) && parsed.suggested.length > 0) {
        let savedAny = false;
        for (const suggested of parsed.suggested) {
          const norm = suggested.title.toLowerCase().trim();
          if (
            savedSuggestionTitles.has(norm) ||
            suggestionSaveLockRef.current.has(norm) ||
            findRecipeByTitleLoose(suggested.title, freshRecipes)
          ) {
            continue;
          }
          suggestionSaveLockRef.current.add(norm);
          try {
            const created = await createRecipe({
              title: suggested.title,
              ingredients: suggested.ingredients,
              steps: suggested.steps,
              cookingTime: suggested.cookingTime,
              servings: suggested.servings,
              tags: suggested.tags,
            });
            setSavedSuggestionTitles((prev) => new Map(prev).set(norm, created.id));
            savedAny = true;
          } catch (err) {
            console.warn('Auto-save suggested recipe failed:', err);
          } finally {
            suggestionSaveLockRef.current.delete(norm);
          }
        }
        if (savedAny) {
          await refreshRecipes();
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Impossible d'obtenir une réponse de l'IA";
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialMessage && !hasSentInitial.current) {
      hasSentInitial.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(prompt);
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
    setSavedSuggestionTitles(new Map());
    setAppliedWeekPlanIndices(new Set());
    setDismissedRecipeUpdates(new Set());
    setSavedRecipeUpdateIndices(new Set());
    setAddedToPlanningRecipeIds(new Set());
    setCookingBarDismissed(false);
    clearChatSession();
    inputRef.current?.focus();
  };

  const handleNavTab = (key: TabKey) => navigate(pathFromNavKey(key));

  const addToPlanning = (recipeId: string) => {
    if (addRecipeToFirstEmptySlot(recipeId)) {
      setAddedToPlanningRecipeIds((prev) => new Set(prev).add(recipeId));
    } else {
      navigate('/planning');
    }
  };

  const openRecipe = (recipeId: string) => {
    navigate('/recipes', { state: { openRecipeId: recipeId } });
  };

  const handleSaveSuggestion = async (suggested: SuggestedRecipe) => {
    const norm = suggested.title.toLowerCase().trim();
    if (savedSuggestionTitles.has(norm) || suggestionSaveLockRef.current.has(norm)) return;

    suggestionSaveLockRef.current.add(norm);
    setSavingSuggestionTitles((prev) => new Set(prev).add(norm));
    setError(null);

    try {
      const created = await createRecipe({
        title: suggested.title,
        ingredients: suggested.ingredients,
        steps: suggested.steps,
        cookingTime: suggested.cookingTime,
        servings: suggested.servings,
        tags: suggested.tags,
      });
      setSavedSuggestionTitles((prev) => {
        const next = new Map(prev);
        next.set(norm, created.id);
        return next;
      });
      await refreshRecipes();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Impossible d'ajouter la recette au carnet";
      setError(message);
    } finally {
      suggestionSaveLockRef.current.delete(norm);
      setSavingSuggestionTitles((prev) => {
        const next = new Set(prev);
        next.delete(norm);
        return next;
      });
    }
  };

  const handleValidateWeekPlan = async (
    messageIndex: number,
    content: string
  ) => {
    const parsed = parseAssistantMessage(content, recipes);
    if (parsed.weekPlan.length === 0) return;

    setApplyingWeekPlanIndex(messageIndex);
    setError(null);

    try {
      const conversationSuggested = collectConversationSuggested(messages);
      const allSuggested = [...parsed.suggested, ...conversationSuggested];
      const titleToId = new Map(savedSuggestionTitles);
      const slots = [];
      const unresolved: string[] = [];

      for (const entry of parsed.weekPlan) {
        const mapped = weekPlanEntryToSlot(entry);
        if (!mapped) continue;

        let recipeId = resolveTitleToRecipeId(mapped.title, recipes, titleToId);

        if (!recipeId) {
          const suggested =
            findSuggestedByTitle(mapped.title, allSuggested) ??
            findSuggestedInConversation(mapped.title, messages);
          if (suggested) {
            const created = await createRecipe({
              title: suggested.title,
              ingredients: suggested.ingredients,
              steps: suggested.steps,
              cookingTime: suggested.cookingTime,
              servings: suggested.servings,
              tags: suggested.tags,
            });
            recipeId = created.id;
            titleToId.set(mapped.title.toLowerCase().trim(), created.id);
            titleToId.set(suggested.title.toLowerCase().trim(), created.id);
          }
        }

        if (recipeId) {
          slots.push({ day: mapped.day, meal: mapped.meal, recipeId });
        } else {
          unresolved.push(mapped.title);
        }
      }

      if (slots.length === 0) {
        setError(
          unresolved.length > 0
            ? `Impossible d'associer : ${unresolved.join(', ')}. Ajoutez-les au carnet puis réessayez.`
            : "Aucun créneau du menu n'a pu être associé à une recette."
        );
        return;
      }

      const result = applyWeekPlan(slots);
      setSavedSuggestionTitles(titleToId);
      setAppliedWeekPlanIndices((prev) => new Set(prev).add(messageIndex));
      await refreshRecipes();

      if (unresolved.length > 0) {
        setError(
          `${result.applied} créneau(x) ajouté(s). Non résolus : ${unresolved.join(', ')}.`
        );
      } else if (result.skipped.length > 0) {
        setError(
          `${result.applied} créneau(x) ajouté(s), mais ${result.skipped.length} n'ont pas pu être remplis.`
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Impossible de remplir le planning';
      setError(message);
    } finally {
      setApplyingWeekPlanIndex(null);
    }
  };

  const handleSaveRecipeUpdate = async (messageIndex: number, content: string) => {
    const { recipeUpdate } = parseAssistantMessage(content, recipes);
    if (!recipeUpdate) return;

    setSavingRecipeUpdateIndex(messageIndex);
    setError(null);

    try {
      if (recipeUpdate.id) {
        await updateRecipe(recipeUpdate.id, {
          title: recipeUpdate.title,
          ingredients: recipeUpdate.ingredients,
          steps: recipeUpdate.steps,
          cookingTime: recipeUpdate.cookingTime,
          servings: recipeUpdate.servings,
          tags: recipeUpdate.tags,
        });
      } else {
        const created = await createRecipe({
          title: recipeUpdate.title,
          ingredients: recipeUpdate.ingredients,
          steps: recipeUpdate.steps,
          cookingTime: recipeUpdate.cookingTime,
          servings: recipeUpdate.servings,
          tags: recipeUpdate.tags,
        });
        setSavedSuggestionTitles((prev) => {
          const next = new Map(prev);
          next.set(recipeUpdate.title.toLowerCase().trim(), created.id);
          return next;
        });
      }

      setSavedRecipeUpdateIndices((prev) => new Set(prev).add(messageIndex));
      await refreshRecipes();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Impossible d\'enregistrer la recette';
      setError(message);
    } finally {
      setSavingRecipeUpdateIndex(null);
    }
  };

  const renderAssistantMessage = (content: string, messageIndex: number, compact: boolean) => {
    const parsed = parseAssistantMessage(content, recipes);
    const isCookingMessage = Boolean(parsed.activeCooking || parsed.cookingStep);
    const hideCarnetCards = session.mode === 'cooking' && isCookingMessage;

    const newSuggestions = filterNewSuggestions(
      [...parsed.suggested, ...collectConversationSuggested(messages.slice(0, messageIndex + 1))],
      recipes,
      new Set(savedSuggestionTitles.keys())
    );

    const conversationSuggested = collectConversationSuggested(messages.slice(0, messageIndex + 1));
    const newRecipeCount = countUnresolvedPlanTitles(
      parsed.weekPlan,
      recipes,
      [...parsed.suggested, ...conversationSuggested],
      savedSuggestionTitles
    );

    return (
      <AssistantRow compact={compact}>
        <p className="text-[16px] md:text-[17.5px] text-ink-soft leading-[1.55] m-0 whitespace-pre-wrap mb-0">
          {parsed.text}
        </p>

        {!hideCarnetCards && parsed.mentioned.length > 0 && (() => {
          const mentionedCards = parsed.mentioned.map((recipe) => (
            <RecipeSuggestion
              key={recipe.id}
              recipe={recipe}
              compact={compact}
              isAddedToPlan={addedToPlanningRecipeIds.has(recipe.id)}
              onAddToPlan={() => addToPlanning(recipe.id)}
              onOpen={() => openRecipe(recipe.id)}
            />
          ));
          return (
            <div className="mt-4">
              {!compact && mentionedCards.length > 1 ? (
                <Carousel>{mentionedCards}</Carousel>
              ) : (
                <div className={compact ? 'flex flex-col' : 'flex gap-3.5'}>
                  {mentionedCards}
                </div>
              )}
            </div>
          );
        })()}

        {newSuggestions.length > 0 && (() => {
          const newSuggestionCards = newSuggestions.map((suggested) => {
            const norm = suggested.title.toLowerCase().trim();
            const isSaved = savedSuggestionTitles.has(norm);
            return (
              <NewRecipeSuggestion
                key={suggested.title}
                recipe={suggested}
                compact={compact}
                isSaved={isSaved}
                isSaving={savingSuggestionTitles.has(norm)}
                onSave={() => void handleSaveSuggestion(suggested)}
              />
            );
          });
          return !compact && newSuggestionCards.length > 1 ? (
            <Carousel>{newSuggestionCards}</Carousel>
          ) : (
            <div className={compact ? 'flex flex-col' : 'flex gap-3.5'}>
              {newSuggestionCards}
            </div>
          );
        })()}

        {parsed.weekPlan.length > 0 && (
          <WeekPlanValidation
            entries={parsed.weekPlan}
            newRecipeCount={newRecipeCount}
            compact={compact}
            isApplying={applyingWeekPlanIndex === messageIndex}
            isApplied={appliedWeekPlanIndices.has(messageIndex)}
            onValidate={() => void handleValidateWeekPlan(messageIndex, content)}
            onOpenPlanning={() => navigate('/planning')}
          />
        )}

        {parsed.recipeUpdate &&
          !dismissedRecipeUpdates.has(messageIndex) && (
            <RecipeUpdatePrompt
              payload={parsed.recipeUpdate}
              compact={compact}
              isSaving={savingRecipeUpdateIndex === messageIndex}
              isSaved={savedRecipeUpdateIndices.has(messageIndex)}
              onSave={() => void handleSaveRecipeUpdate(messageIndex, content)}
              onDismiss={() =>
                setDismissedRecipeUpdates((prev) => new Set(prev).add(messageIndex))
              }
            />
          )}
      </AssistantRow>
    );
  };

  const composer = (compact: boolean) => (
    <div
      className={[
        'border-t border-line bg-cream',
        compact ? 'px-4 pt-3' : '',
      ].join(' ')}
      style={
        compact && !isMobile
          ? { paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }
          : undefined
      }
    >
      <div className={compact ? '' : 'max-w-[760px] mx-auto px-5 md:px-10 pt-5 pb-4'}>
        {messages.length > 0 && (
          <div className={`flex justify-end ${compact ? 'mb-2' : 'mb-2'}`}>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wide text-muted hover:text-ink bg-transparent border-0 cursor-pointer"
            >
              <Icon name="trash" size={12} strokeWidth={1.8} />
              Nouvelle conversation
            </button>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className={[
            'flex items-center border-[1.5px] border-ink bg-paper',
            compact ? 'gap-2.5 pl-4 pr-2 py-2' : 'gap-3.5 pl-5 pr-3 py-3',
          ].join(' ')}
        >
          <input
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              compact ? 'Une idée, un menu, une liste…' : 'Demandez une idée, un menu, une liste…'
            }
            disabled={isLoading}
            className={[
              'flex-1 bg-transparent outline-none text-ink placeholder:text-muted placeholder:italic disabled:opacity-50',
              compact ? 'text-[15px]' : 'text-[17px]',
            ].join(' ')}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={[
              'rounded-full bg-ember text-creamlight flex items-center justify-center shrink-0 cursor-pointer border-0 disabled:opacity-40',
              compact ? 'w-9 h-9' : 'w-[44px] h-[44px]',
            ].join(' ')}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-creamlight/30 border-t-creamlight rounded-full animate-spin" />
            ) : (
              <Icon name="send" size={compact ? 16 : 19} strokeWidth={1.7} />
            )}
          </button>
        </form>
        {!compact && (
          <div className="font-label text-[10.5px] uppercase tracking-wide text-muted text-center mt-3">
            L'assistant compose votre semaine · carnet + nouvelles idées · vous validez
          </div>
        )}
      </div>
    </div>
  );

  const cookingBar = showCookingBar && session.cooking && (
    <CookingSessionBar
      title={session.cooking.title}
      currentStep={session.cooking.step}
      totalSteps={session.cooking.totalSteps}
      isNewRecipe={session.cooking.recipeId === null}
      onEnd={() => setCookingBarDismissed(true)}
    />
  );

  const messageFeed = (compact: boolean) => (
    <div
      className={[
        'flex-1 overflow-auto',
        compact ? 'px-[18px] pt-5 pb-2' : 'pt-[34px] pb-[18px]',
      ].join(' ')}
    >
      <div className={compact ? '' : 'max-w-[760px] mx-auto px-5 md:px-10'}>
        {messages.length === 0 && !isLoading && <WelcomeScreen onChipClick={sendMessage} />}

        {messages.map((message, index) =>
          message.role === 'user' ? (
            <UserBubble key={index}>{message.content}</UserBubble>
          ) : (
            <div key={index}>{renderAssistantMessage(message.content, index, compact)}</div>
          )
        )}

        {isLoading && (
          <AssistantRow compact={compact}>
            <p className="text-[16px] text-ink-soft m-0 flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-muted/30 border-t-muted rounded-full animate-spin shrink-0" />
              L'IA réfléchit…
            </p>
          </AssistantRow>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );

  const errorBanner = error && (
    <div className={isMobile ? 'px-4 pt-3 shrink-0' : 'px-4 pt-3'}>
      <div className="max-w-[760px] mx-auto bg-ember-soft border border-line px-4 py-3 text-ember-dark text-[14px]">
        {error}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileScreen
        scroll={false}
        top={<MobileTopBar title="Assistant" onHome={() => navigate('/')} />}
        bottom={
          <>
            {composer(true)}
            <MobileTabBar active="assistant" onNavigate={handleNavTab} />
          </>
        }
      >
        <div className="flex flex-col flex-1 min-h-0">
          {cookingBar}
          {errorBanner}
          {messageFeed(true)}
        </div>
      </MobileScreen>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-86px)] bg-paper text-ink font-body antialiased">
      {cookingBar}
      {errorBanner}
      {messageFeed(false)}
      {composer(false)}
    </div>
  );
}
