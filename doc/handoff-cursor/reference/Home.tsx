// reference/Home.tsx
// Accueil éditorial : kicker « menu de la semaine », gros titre, barre de
// recherche-soulignée qui OUVRE l'assistant, et 3 entrées numérotées.
//
// ⟵ Le CTA central (barre + bouton envoi) doit naviguer vers l'écran Assistant,
//    en passant éventuellement la requête saisie comme premier message.

import React, { useState } from 'react';
import { Screen } from './Shell';
import { Kicker } from './primitives';
import { Icon } from './Icon';

export default function Home({
  onNavigate,
  onAsk, // ⟵ GARDER : ouvre l'assistant avec la requête (router + state)
}: {
  onNavigate?: (k: any) => void;
  onAsk?: (query: string) => void;
}) {
  const [q, setQ] = useState('');
  const features: [string, string, string][] = [
    ['01', 'Nos recettes', 'Le carnet maison, écrit à quatre mains.'],
    ['02', 'Le planning', 'Chaque repas de la semaine, à sa place.'],
    ['03', 'Liste de courses', 'Générée depuis le planning, prête à imprimer.'],
  ];

  return (
    <Screen active="" onNavigate={onNavigate}>
      <div className="max-w-[860px] mx-auto px-[52px] pt-[60px] text-center">
        <Kicker className="mb-[22px]">Le menu de la semaine · N°24</Kicker>
        <h1 className="font-display text-[60px] leading-[1.04] text-ink m-0 mb-[22px]">
          Qu'est-ce qu'on<br />mange cette semaine&nbsp;?
        </h1>
        <p className="text-[18.5px] text-ink-soft italic leading-[1.5] m-0 mb-10">
          On compose le planning, la liste de courses suit toute seule.
        </p>

        {/* Barre de recherche → ouvre l'assistant */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAsk?.(q); // ⟵ GARDER votre navigation vers l'assistant
          }}
          className="max-w-[560px] mx-auto flex items-center gap-3.5 border-b-[1.5px] border-ink pb-3"
        >
          <Icon name="search" size={20} strokeWidth={1.6} className="text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="À la recherche d'inspiration…"
            className="flex-1 bg-transparent outline-none text-[18px] text-ink text-left
                       placeholder:text-muted placeholder:italic"
          />
          <button
            type="submit"
            className="w-[42px] h-[42px] rounded-full bg-ember text-creamlight flex items-center justify-center shrink-0 cursor-pointer border-0"
          >
            <Icon name="send" size={19} strokeWidth={1.7} />
          </button>
        </form>
      </div>

      {/* 3 entrées numérotées */}
      <div className="max-w-[1000px] mx-auto px-[52px] mt-[72px]">
        <div className="border-t border-line pt-[34px] grid grid-cols-3">
          {features.map(([num, title, sub], i) => (
            <div
              key={num}
              className={`px-[30px] ${i < 2 ? 'border-r border-line' : ''}`}
            >
              <div className="font-display text-[30px] text-ember mb-3">{num}</div>
              <div className="font-label text-[12.5px] font-semibold uppercase tracking-[0.10em] text-ink mb-2">
                {title}
              </div>
              <div className="text-[15.5px] text-ink-soft leading-[1.5]">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
