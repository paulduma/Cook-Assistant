// reference/mobile/Library.mobile.tsx
// Bibliothèque mobile : en-tête fixe (titre, recherche, filtres, bouton +),
// liste de cartes pleine largeur (1 colonne). Le + ouvre AddRecipeModal mode="import".

import React from 'react';
import { MobileScreen, MobileTabBar } from './MobileShell';
import { Kicker, Thumb } from '../primitives';
import { Icon } from '../Icon';

type Recipe = {
  id: string;
  title: string;
  time: string;
  portions: number;
  tag: string;
  ingredients: string;
  image_url?: string | null;
};

export default function LibraryMobile({
  onNavigate,
  onOpenRecipe,
  onAddRecipe, // ⟵ GARDER : ouvre la pop-up d'import
}: {
  onNavigate?: (k: any) => void;
  onOpenRecipe?: (id: string) => void;
  onAddRecipe?: () => void;
}) {
  // ⟵ BRANCHER vos recettes Supabase
  const recipes: Recipe[] = [
    { id: '1', title: 'Carbonara', time: '30 min', portions: 4, tag: 'Déj rapide', ingredients: 'œuf, pâtes, parmesan, lardons' },
    { id: '2', title: 'Ratatouille', time: '55 min', portions: 4, tag: 'Veggie', ingredients: 'aubergine, courgette, poivron, tomate' },
  ];
  const filters = ['Toutes', 'Déj rapide', 'Plats du soir', 'Veggie'];

  const top = (
    <div
      className="bg-cream border-b border-line px-5 pb-3.5"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <Kicker className="mb-1 whitespace-nowrap">Le carnet maison</Kicker>
          <div className="font-display text-[28px] text-ink">Recettes</div>
        </div>
        <button
          onClick={onAddRecipe}
          className="w-[42px] h-[42px] rounded-full bg-ember text-creamlight flex items-center justify-center shrink-0 border-0 cursor-pointer"
          aria-label="Ajouter une recette"
        >
          <Icon name="plus" size={20} strokeWidth={2.1} />
        </button>
      </div>
      <div className="flex items-center gap-3 border-b-[1.5px] border-ink pt-0.5 pb-2.5 mb-3.5">
        <Icon name="search" size={17} strokeWidth={1.6} className="text-muted" />
        <span className="text-[15px] text-muted italic whitespace-nowrap">Rechercher une recette…</span>
      </div>
      <div className="flex gap-5 overflow-x-auto">
        {filters.map((f, i) => (
          <button
            key={f}
            className={[
              'font-label text-[11px] uppercase tracking-wide pb-1 bg-transparent border-0 cursor-pointer whitespace-nowrap',
              i === 0
                ? 'text-ink font-semibold border-b-[1.5px] border-ember'
                : 'text-muted font-medium border-b-[1.5px] border-transparent',
            ].join(' ')}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <MobileScreen top={top} bottom={<MobileTabBar active="recettes" onNavigate={onNavigate} />}>
      <div className="px-5 pt-[18px] pb-2">
        {recipes.map((r) => (
          <button
            key={r.id}
            onClick={() => onOpenRecipe?.(r.id)}
            className="block w-full text-left bg-cream border border-line mb-4 cursor-pointer"
          >
            <Thumb label="photo du plat" src={r.image_url} className="h-[150px] w-full" />
            <div className="px-4 pt-[15px] pb-[17px]">
              <Kicker className="text-olive mb-1.5">{r.tag}</Kicker>
              <div className="font-display text-[23px] text-ink mb-2.5">{r.title}</div>
              <div className="font-label flex gap-2.5 text-ink-soft text-[10.5px] uppercase tracking-wide pb-2.5 border-b border-line-soft whitespace-nowrap">
                <span>{r.time}</span>
                <span className="text-line">·</span>
                <span>{r.portions} portions</span>
              </div>
              <div className="text-[14.5px] text-ink-soft italic mt-2.5 leading-[1.4]">
                {r.ingredients}
              </div>
            </div>
          </button>
        ))}
      </div>
    </MobileScreen>
  );
}
