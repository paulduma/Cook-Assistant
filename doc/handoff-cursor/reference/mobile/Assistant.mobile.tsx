// reference/mobile/Assistant.mobile.tsx
// Assistant en pleine hauteur : barre du haut avec retour, fil scrollable,
// barre de saisie ancrée en bas (remplace les onglets). Câblage = identique au
// desktop (voir reference/Assistant.tsx) : OpenAI + suggestions Supabase.

import React from 'react';
import { MobileScreen, MobileTopBar } from './MobileShell';
import { Kicker, AssistantAvatar, Thumb } from '../primitives';
import { Icon } from '../Icon';

function Suggestion({
  r,
  onAddToPlan,
}: {
  r: { title: string; time: string; portions: number; tag: string; image_url?: string | null };
  onAddToPlan?: () => void;
}) {
  return (
    <div className="flex gap-3 bg-cream border border-line p-3 mt-2.5">
      <Thumb label="photo" src={r.image_url} className="w-16 h-16 shrink-0" />
      <div className="flex-1 min-w-0">
        <Kicker className="text-olive mb-0.5">{r.tag}</Kicker>
        <div className="font-display text-[17px] text-ink leading-tight mb-1">{r.title}</div>
        <div className="font-label text-[10px] uppercase tracking-wide text-muted mb-2.5">
          {r.time} · {r.portions} pers.
        </div>
        <button
          onClick={onAddToPlan}
          className="inline-flex items-center gap-1.5 font-label text-[10px] font-semibold uppercase tracking-wide text-creamlight bg-ember px-3 py-1.5 cursor-pointer border-0"
        >
          <Icon name="plus" size={12} strokeWidth={2.1} />
          Au planning
        </button>
      </div>
    </div>
  );
}

export default function AssistantMobile({
  onBack,
  onSend, // ⟵ GARDER votre appel OpenAI
}: {
  onBack?: () => void;
  onSend?: (t: string) => void;
}) {
  // ⟵ BRANCHER : votre vrai fil + suggestions Supabase
  const suggestions = [
    { title: 'Ratatouille', time: '55 min', portions: 4, tag: 'Veggie' },
    { title: 'Saumon & courgettes', time: '25 min', portions: 2, tag: 'Déj rapide' },
  ];
  const chips = ['Planifier la semaine', 'Vider le frigo', 'Veggie'];

  const composer = (
    <Composer onSend={onSend} />
  );

  return (
    <MobileScreen top={<MobileTopBar back title="Assistant" onBack={onBack} />} bottom={composer}>
      <div className="px-[18px] pt-5 pb-2">
        <div className="flex gap-3 mb-[22px]">
          <AssistantAvatar size={30} />
          <div className="flex-1 min-w-0">
            <Kicker className="text-ink mb-1.5">Chez Verdi</Kicker>
            <p className="text-[16px] text-ink-soft leading-[1.5] m-0">
              Bonsoir vous deux&nbsp;! Une envie, un ingrédient à finir&nbsp;? Je compose le planning
              avec vos recettes.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {chips.map((c) => (
                <button
                  key={c}
                  onClick={() => onSend?.(c)}
                  className="font-label text-[10.5px] font-medium uppercase tracking-wide text-ink-soft border border-line bg-cream px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-[22px]">
          <div className="max-w-[82%]">
            <Kicker className="text-muted text-right mb-1.5">Vous</Kicker>
            <div className="bg-ember-soft border border-line rounded-[14px_14px_4px_14px] px-3.5 py-2.5 text-[15.5px] text-ink leading-[1.5]">
              Réconfortant pour mercredi soir, on a des courgettes à finir 🥒
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <AssistantAvatar size={30} />
          <div className="flex-1 min-w-0">
            <Kicker className="text-ink mb-1.5">Chez Verdi</Kicker>
            <p className="text-[16px] text-ink-soft leading-[1.5] m-0">
              Deux idées de votre carnet, à glisser dans mercredi&nbsp;:
            </p>
            {suggestions.map((r) => (
              <Suggestion key={r.title} r={r} />
            ))}
          </div>
        </div>
      </div>
    </MobileScreen>
  );
}

function Composer({ onSend }: { onSend?: (t: string) => void }) {
  const [text, setText] = React.useState('');
  return (
    <div
      className="bg-cream border-t border-line px-4 pt-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) onSend?.(text);
          setText('');
        }}
        className="flex items-center gap-2.5 border-[1.5px] border-ink bg-paper pl-4 pr-2 py-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Une idée, un menu, une liste…"
          className="flex-1 bg-transparent outline-none text-[15px] text-ink placeholder:text-muted placeholder:italic"
        />
        <button
          type="submit"
          className="w-9 h-9 rounded-full bg-ember text-creamlight flex items-center justify-center shrink-0 border-0 cursor-pointer"
        >
          <Icon name="send" size={16} strokeWidth={1.7} />
        </button>
      </form>
    </div>
  );
}
