// reference/mobile/RecipeDetail.mobile.tsx
// Détail mobile : photo en hero, titre, méta, ingrédients, étapes 01/02,
// CTA « Au planning » + édition. Sans onglets (vue plein écran avec retour).

import React from 'react';
import { MobileScreen, MobileTopBar } from './MobileShell';
import { Kicker, Thumb } from '../primitives';
import { Icon } from '../Icon';

type Recipe = {
  title: string;
  tag: string;
  time: string;
  portions: number;
  ingredients: string[];
  steps: string[];
  image_url?: string | null;
};

export default function RecipeDetailMobile({
  recipe,
  onBack,
  onAddToPlan, // ⟵ GARDER : ajoute au planning
  onEdit, // ⟵ GARDER : ouvre l'édition
}: {
  recipe?: Recipe;
  onBack?: () => void;
  onAddToPlan?: () => void;
  onEdit?: () => void;
}) {
  const r: Recipe =
    recipe ?? {
      title: 'Carbonara',
      tag: 'Déj rapide',
      time: '30 minutes',
      portions: 4,
      ingredients: ['400 g de pâtes', '4 œufs', '120 g de parmesan', '150 g de lardons'],
      steps: [
        "Faire cuire les pâtes dans une grande casserole d'eau salée.",
        'Battre les œufs avec le parmesan râpé.',
        'Faire revenir les lardons, lier hors du feu.',
      ],
    };

  return (
    <MobileScreen top={<MobileTopBar back title="Recette" onBack={onBack} />}>
      <Thumb label="photo des pâtes" src={r.image_url} className="h-[190px] w-full" />
      <div className="px-[22px] pt-5 pb-7">
        <Kicker className="text-olive mb-2.5">{r.tag}</Kicker>
        <h1 className="font-display text-[34px] text-ink m-0 mb-3">{r.title}</h1>
        <div className="font-label flex gap-3 text-ink-soft text-[11px] uppercase tracking-wide pb-4 border-b border-line">
          <span>{r.time}</span>
          <span className="text-line">|</span>
          <span>{r.portions} portions</span>
        </div>

        <Kicker className="text-ink mt-5 mb-3">Ingrédients</Kicker>
        {r.ingredients.map((x, i) => (
          <div key={i} className="py-2.5 border-b border-line-soft text-[16px] text-ink-soft">
            {x}
          </div>
        ))}

        <Kicker className="text-ink mt-[22px] mb-3">Préparation</Kicker>
        {r.steps.map((x, i) => (
          <div
            key={i}
            className={`flex gap-4 py-3 ${i < r.steps.length - 1 ? 'border-b border-line-soft' : ''}`}
          >
            <div className="font-display text-2xl text-ember leading-none w-[30px] shrink-0">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="text-[15.5px] text-ink-soft leading-[1.5]">{x}</div>
          </div>
        ))}

        <div className="flex gap-3 mt-[22px]">
          <button
            onClick={onAddToPlan}
            className="flex-1 inline-flex items-center justify-center gap-2 font-label text-[11px] font-semibold uppercase tracking-wide text-creamlight bg-ember py-3.5 border-0 cursor-pointer"
          >
            <Icon name="plus" size={15} strokeWidth={2} />
            Au planning
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 font-label text-[11px] font-semibold uppercase tracking-wide text-ink bg-transparent border border-ink py-3.5 px-[18px] cursor-pointer"
            aria-label="Modifier"
          >
            <Icon name="edit" size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </MobileScreen>
  );
}
