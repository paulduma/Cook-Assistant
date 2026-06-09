// reference/Assistant.tsx
// NOUVEL ÉCRAN — chatbot plein écran (style ChatGPT) avec en-tête de nav conservé.
//
// Câblage attendu :
//  • messages : votre state de conversation (rôle user / assistant)
//  • réponses : votre appel OpenAI existant (streaming ou non)
//  • suggestions de recettes : résultats issus de votre base Supabase
//  • CTA « Au planning » / « Voir » : vos handlers planner / navigation détail
//
// Ce fichier illustre la MISE EN FORME (bulles, suggestions, barre ancrée).
// Les données ci-dessous sont factices.

import React from 'react';
import { Screen } from './Shell';
import { Kicker, AssistantAvatar, Thumb } from './primitives';
import { Icon } from './Icon';

/* Bulle utilisateur (alignée à droite) */
function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end mb-7">
      <div className="max-w-[74%]">
        <Kicker className="text-muted text-right mb-1.5">Vous</Kicker>
        <div className="bg-ember-soft border border-line rounded-[14px_14px_4px_14px] px-[18px] py-3 text-[16.5px] text-ink leading-[1.5]">
          {children}
        </div>
      </div>
    </div>
  );
}

/* Rangée assistant (avatar + contenu) */
function AssistantRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-7">
      <AssistantAvatar />
      <div className="flex-1 min-w-0 pt-0.5">
        <Kicker className="text-ink mb-2">Chez&nbsp;Verdi · assistant</Kicker>
        {children}
      </div>
    </div>
  );
}

/* Carte-suggestion de recette dans le fil */
function Suggestion({
  recipe,
  onAddToPlan, // ⟵ GARDER votre handler planner
  onOpen, // ⟵ GARDER votre navigation détail
}: {
  recipe: { title: string; time: string; portions: number; tag: string; image_url?: string | null };
  onAddToPlan?: () => void;
  onOpen?: () => void;
}) {
  return (
    <div className="flex-1 flex gap-3.5 bg-cream border border-line p-3.5">
      <Thumb label="photo" src={recipe.image_url} className="w-[76px] h-[76px] shrink-0" />
      <div className="flex-1 min-w-0">
        <Kicker className="text-olive mb-1">{recipe.tag}</Kicker>
        <div className="font-display text-[19px] text-ink leading-[1.1] mb-1.5">{recipe.title}</div>
        <div className="font-label text-[10.5px] uppercase tracking-wide text-muted mb-3 whitespace-nowrap">
          {recipe.time} · {recipe.portions} pers.
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAddToPlan}
            className="inline-flex items-center gap-1.5 font-label text-[10.5px] font-semibold uppercase tracking-wide
                       text-creamlight bg-ember px-3 py-2 cursor-pointer border-0 whitespace-nowrap"
          >
            <Icon name="plus" size={13} strokeWidth={2.1} />
            Au planning
          </button>
          <button
            onClick={onOpen}
            className="font-label text-[10.5px] font-semibold uppercase tracking-wide text-ink bg-transparent
                       border border-line px-3 py-2 cursor-pointer whitespace-nowrap"
          >
            Voir
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Assistant({
  onNavigate,
  onSend, // ⟵ GARDER : envoie le message à OpenAI
}: {
  onNavigate?: (k: any) => void;
  onSend?: (text: string) => void;
}) {
  // ⟵ BRANCHER : votre state messages + suggestions issues de Supabase
  const suggestions = [
    { title: 'Ratatouille', time: '55 min', portions: 4, tag: 'Veggie' },
    { title: 'Saumon & courgettes', time: '25 min', portions: 2, tag: 'Déj rapide' },
  ];
  const chips = ['Planifier la semaine', 'Vider le frigo', 'Idées veggie', 'Rapide en semaine'];

  return (
    <div className="h-screen bg-paper text-ink font-body antialiased flex flex-col">
      {/* En-tête de nav conservé */}
      <Screen active="" onNavigate={onNavigate} nav>
        <div className="flex flex-col h-full">
          {/* Fil de conversation */}
          <div className="flex-1 overflow-auto pt-[34px] pb-[18px]">
            <div className="max-w-[760px] mx-auto px-10">
              <AssistantRow>
                <p className="text-[17.5px] text-ink-soft leading-[1.55] m-0">
                  Bonsoir vous deux&nbsp;! Dites-moi ce qui vous ferait plaisir cette semaine — une
                  envie, un ingrédient à finir, un budget — et je compose le planning avec vos recettes.
                </p>
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => onSend?.(c)}
                      className="font-label text-[11.5px] font-medium uppercase tracking-wide text-ink-soft
                                 border border-line bg-cream px-[15px] py-2.5 rounded-full cursor-pointer whitespace-nowrap"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </AssistantRow>

              <UserBubble>
                Un truc réconfortant pour mercredi soir, on a des courgettes à finir 🥒
              </UserBubble>

              <AssistantRow>
                <p className="text-[17.5px] text-ink-soft leading-[1.55] m-0 mb-4">
                  Parfait pour les courgettes. Voici deux idées tirées de votre carnet — je peux les
                  glisser directement dans le planning de mercredi&nbsp;:
                </p>
                <div className="flex gap-3.5">
                  {suggestions.map((r) => (
                    <Suggestion key={r.title} recipe={r} />
                  ))}
                </div>
              </AssistantRow>
            </div>
          </div>

          {/* Barre de saisie ancrée en bas */}
          <div className="border-t border-line bg-cream">
            <div className="max-w-[760px] mx-auto px-10 pt-5 pb-4">
              <AssistantComposer onSend={onSend} />
              <div className="font-label text-[10.5px] uppercase tracking-wide text-muted text-center mt-3">
                L'assistant propose des recettes de votre carnet · vous gardez la main
              </div>
            </div>
          </div>
        </div>
      </Screen>
    </div>
  );
}

function AssistantComposer({ onSend }: { onSend?: (t: string) => void }) {
  const [text, setText] = React.useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) onSend?.(text); // ⟵ GARDER votre appel OpenAI
        setText('');
      }}
      className="flex items-center gap-3.5 border-[1.5px] border-ink bg-paper pl-5 pr-3 py-3"
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Demandez une idée, un menu, une liste…"
        className="flex-1 bg-transparent outline-none text-[17px] text-ink placeholder:text-muted placeholder:italic"
      />
      <button
        type="submit"
        className="w-[44px] h-[44px] rounded-full bg-ember text-creamlight flex items-center justify-center shrink-0 cursor-pointer border-0"
      >
        <Icon name="send" size={19} strokeWidth={1.7} />
      </button>
    </form>
  );
}
