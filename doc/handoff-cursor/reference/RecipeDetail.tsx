// reference/RecipeDetail.tsx
// Détail d'une recette : titre d'affichage, méta, ingrédients en liste filetée,
// préparation en étapes numérotées (01/02…). CTA Modifier / Supprimer conservés.
// ⟵ BRANCHER recipe (Supabase) ; ⟵ GARDER onEdit / onDelete / onBack.

import React from 'react';
import { Screen } from './Shell';
import { Kicker, Button } from './primitives';
import { Icon } from './Icon';

type Recipe = {
  title: string;
  tag: string;
  time: string;
  portions: number;
  ingredients: string[];
  steps: string[];
};

export default function RecipeDetail({
  onNavigate,
  onBack,
  onEdit,
  onDelete,
  recipe,
}: {
  onNavigate?: (k: any) => void;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  recipe?: Recipe;
}) {
  // ⟵ BRANCHER la vraie recette
  const r: Recipe =
    recipe ?? {
      title: 'Carbonara',
      tag: 'Déj rapide',
      time: '30 minutes',
      portions: 4,
      ingredients: ['400 g de pâtes', '4 œufs', '120 g de parmesan', '150 g de lardons'],
      steps: [
        "Faire cuire les pâtes dans une grande casserole d'eau salée.",
        'Battre les œufs avec le parmesan fraîchement râpé.',
        'Faire revenir les lardons, puis lier le tout hors du feu.',
      ],
    };

  return (
    <Screen active="recettes" onNavigate={onNavigate}>
      <div className="px-16 py-[38px]">
        <button
          onClick={onBack}
          className="font-label flex items-center gap-2.5 text-[12px] uppercase tracking-wide text-ink-soft mb-[30px] cursor-pointer bg-transparent border-0"
        >
          <Icon name="arrowLeft" size={17} strokeWidth={1.8} className="text-ember" />
          Retour à la bibliothèque
        </button>

        <div className="flex justify-between items-start">
          <div>
            <Kicker className="text-olive mb-3.5">{r.tag}</Kicker>
            <h1 className="font-display text-[56px] text-ink m-0 mb-4 leading-none">{r.title}</h1>
            <div className="font-label flex gap-4 text-ink-soft text-[12.5px] uppercase tracking-wide">
              <span>{r.time}</span>
              <span className="text-line">|</span>
              <span>{r.portions} portions</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button icon="edit" variant="outline" onClick={onEdit}>
              Modifier
            </Button>
            <Button icon="trash" variant="danger" onClick={onDelete}>
              Supprimer
            </Button>
          </div>
        </div>

        <div className="border-t border-line mt-[30px]" />

        <div className="grid grid-cols-[0.85fr_1.4fr] gap-14 mt-8">
          {/* Ingrédients */}
          <div>
            <Kicker className="text-ink mb-[18px]">Ingrédients</Kicker>
            {r.ingredients.map((x, i) => (
              <div
                key={i}
                className="py-3 border-b border-line-soft text-[17px] text-ink-soft"
              >
                {x}
              </div>
            ))}
          </div>
          {/* Préparation */}
          <div>
            <Kicker className="text-ink mb-[18px]">Préparation</Kicker>
            {r.steps.map((x, i) => (
              <div
                key={i}
                className={`flex gap-5 py-3.5 ${i < r.steps.length - 1 ? 'border-b border-line-soft' : ''}`}
              >
                <div className="font-display text-[30px] text-ember leading-none w-10 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="text-[17px] text-ink-soft leading-[1.5] pt-1">{x}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}
