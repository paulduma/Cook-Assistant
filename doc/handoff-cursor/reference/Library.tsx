// reference/Library.tsx
// Bibliothèque de recettes : grille éditoriale 3 colonnes.
// ⟵ BRANCHER : recipes = vos données Supabase ; filtres = votre state.

import React from 'react';
import { Screen } from './Shell';
import { Kicker, Button, Thumb } from './primitives';
import { Icon } from './Icon';

type Recipe = {
  id: string;
  title: string;
  time: string;
  portions: number;
  tag: string;
  ingredients: string; // aperçu
  image_url?: string | null;
};

function RecipeCard({ r, onOpen }: { r: Recipe; onOpen?: () => void }) {
  return (
    <button
      onClick={onOpen} // ⟵ GARDER votre navigation vers le détail
      className="text-left bg-cream border border-line cursor-pointer"
    >
      <Thumb label="photo du plat" src={r.image_url} className="h-[150px] w-full" />
      <div className="px-[22px] pt-5 pb-[22px]">
        <Kicker className="text-olive mb-2.5">{r.tag}</Kicker>
        <div className="font-display text-[26px] text-ink leading-[1.1] mb-3">{r.title}</div>
        <div className="font-label flex gap-[18px] text-ink-soft text-[12px] uppercase tracking-wide pb-3.5 border-b border-line-soft whitespace-nowrap">
          <span>{r.time}</span>
          <span>·</span>
          <span>{r.portions} portions</span>
        </div>
        <div className="text-[15px] text-ink-soft italic mt-3 leading-[1.4]">{r.ingredients}</div>
      </div>
    </button>
  );
}

export default function Library({
  onNavigate,
  onOpenRecipe,
  onAddRecipe, // ⟵ GARDER : ouvre l'édition/création
}: {
  onNavigate?: (k: any) => void;
  onOpenRecipe?: (id: string) => void;
  onAddRecipe?: () => void;
}) {
  // ⟵ BRANCHER vos vraies recettes Supabase
  const recipes: Recipe[] = [
    { id: '1', title: 'Carbonara', time: '30 min', portions: 4, tag: 'Déj rapide', ingredients: 'œuf, pâtes, parmesan, lardons' },
    { id: '2', title: 'Ratatouille', time: '55 min', portions: 4, tag: 'Veggie', ingredients: 'aubergine, courgette, poivron, tomate' },
    { id: '3', title: 'Tajine de poulet', time: '1 h 10', portions: 5, tag: 'Plats du soir', ingredients: 'poulet, citron confit, olives' },
    { id: '4', title: 'Risotto aux champignons', time: '40 min', portions: 4, tag: 'Veggie', ingredients: 'riz arborio, champignons, parmesan' },
    { id: '5', title: 'Saumon & courgettes', time: '25 min', portions: 2, tag: 'Déj rapide', ingredients: 'saumon, courgette, citron, aneth' },
    { id: '6', title: 'Gratin dauphinois', time: '1 h 20', portions: 6, tag: 'Plats du soir', ingredients: 'pomme de terre, crème, ail' },
  ];
  const filters = ['Toutes', 'Déj rapide', 'Plats du soir', 'Veggie'];

  return (
    <Screen active="recettes" onNavigate={onNavigate}>
      <div className="px-[52px] py-[42px]">
        <div className="flex items-end justify-between mb-3.5">
          <div>
            <Kicker className="mb-2.5">Le carnet maison</Kicker>
            <h1 className="font-display text-[46px] text-ink m-0">Bibliothèque de recettes</h1>
          </div>
          <Button icon="plus" variant="outline" onClick={onAddRecipe}>
            Ajouter une recette
          </Button>
        </div>

        {/* Recherche soulignée */}
        <div className="flex items-center gap-3 border-b-[1.5px] border-ink pt-1.5 pb-3 my-2 mb-[22px]">
          <Icon name="search" size={19} strokeWidth={1.6} className="text-muted" />
          <input
            placeholder="Rechercher une recette…"
            className="flex-1 bg-transparent outline-none text-[16.5px] text-ink placeholder:text-muted placeholder:italic"
            /* ⟵ BRANCHER votre state de recherche */
          />
        </div>

        {/* Filtres */}
        <div className="flex gap-7 mb-7">
          {filters.map((f, i) => (
            <button
              key={f}
              className={[
                'font-label text-[12.5px] uppercase tracking-wide cursor-pointer pb-1 bg-transparent border-0',
                i === 0
                  ? 'text-ink font-semibold border-b-[1.5px] border-ember'
                  : 'text-muted font-medium border-b-[1.5px] border-transparent',
              ].join(' ')}
              /* ⟵ BRANCHER votre filtre actif */
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-[26px]">
          {recipes.map((r) => (
            <RecipeCard key={r.id} r={r} onOpen={() => onOpenRecipe?.(r.id)} />
          ))}
        </div>
      </div>
    </Screen>
  );
}
