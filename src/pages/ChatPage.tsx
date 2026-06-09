import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { chatWithOpenAI, isOpenAIConfigured, ChatMessage } from '../lib/openai';
import { localStorageHelper } from '../lib/supabase';
import { addRecipeToFirstEmptySlot } from '../lib/planning';
import { Recipe } from '../types/recipe';
import { Kicker, AssistantAvatar, Thumb } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';
import { MobileScreen, MobileTopBar } from '../components/ui/MobileShell';
import { useMediaQuery } from '../hooks/useMediaQuery';

const CHIPS = ['Planifier la semaine', 'Vider le frigo', 'Idées veggie', 'Rapide en semaine'];

function findMentionedRecipes(content: string, recipes: Recipe[]): Recipe[] {
  const lower = content.toLowerCase();
  return recipes.filter((r) => lower.includes(r.title.toLowerCase())).slice(0, 3);
}

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
  compact = false,
}: {
  recipe: Recipe;
  onAddToPlan: () => void;
  onOpen: () => void;
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
            onClick={onAddToPlan}
            className={[
              'inline-flex items-center gap-1.5 font-label font-semibold uppercase tracking-wide text-creamlight bg-ember cursor-pointer border-0 whitespace-nowrap',
              compact
                ? 'text-[10px] px-3 py-1.5'
                : 'text-[10.5px] px-3 py-2',
            ].join(' ')}
          >
            <Icon name="plus" size={compact ? 12 : 13} strokeWidth={2.1} />
            Au planning
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
        Bonsoir vous deux&nbsp;! Dites-moi ce qui vous ferait plaisir cette semaine — une envie,
        un ingrédient à finir, un budget — et je compose le planning avec vos recettes.
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasSentInitial = useRef(false);

  useEffect(() => {
    setRecipes(localStorageHelper.getRecipes());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      const response = await chatWithOpenAI(updatedMessages, recipes);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
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
    inputRef.current?.focus();
  };

  const addToPlanning = (recipeId: string) => {
    if (!addRecipeToFirstEmptySlot(recipeId)) {
      navigate('/planning');
    }
  };

  const openRecipe = (recipeId: string) => {
    navigate('/recipes', { state: { openRecipeId: recipeId } });
  };

  const renderAssistantMessage = (content: string, compact: boolean) => {
    const mentioned = findMentionedRecipes(content, recipes);
    return (
      <AssistantRow compact={compact}>
        <p className="text-[16px] md:text-[17.5px] text-ink-soft leading-[1.55] m-0 whitespace-pre-wrap mb-0">
          {content}
        </p>
        {mentioned.length > 0 && (
          <div
            className={[
              'mt-4',
              compact ? 'flex flex-col' : 'flex gap-3.5 flex-wrap md:flex-nowrap',
            ].join(' ')}
          >
            {mentioned.map((recipe) => (
              <RecipeSuggestion
                key={recipe.id}
                recipe={recipe}
                compact={compact}
                onAddToPlan={() => addToPlanning(recipe.id)}
                onOpen={() => openRecipe(recipe.id)}
              />
            ))}
          </div>
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
        compact
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
            L'assistant propose des recettes de votre carnet · vous gardez la main
          </div>
        )}
      </div>
    </div>
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
            <div key={index}>{renderAssistantMessage(message.content, compact)}</div>
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
        top={<MobileTopBar back title="Assistant" onBack={() => navigate('/')} />}
        bottom={composer(true)}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {errorBanner}
          {messageFeed(true)}
        </div>
      </MobileScreen>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-86px)] bg-paper text-ink font-body antialiased">
      {errorBanner}
      {messageFeed(false)}
      {composer(false)}
    </div>
  );
}
