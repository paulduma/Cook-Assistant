// reference/AddRecipeModal.tsx
// Pop-up éditoriale, DEUX usages via la prop `mode` :
//
//  • mode="plan"   (onglet Planning)  → choisir une recette EXISTANTE pour un
//                                       créneau (recherche + filtres + liste).
//  • mode="import" (onglet Recettes)  → ajouter une recette à la bibliothèque :
//                                       « Créer une recette vierge » (actif) +
//                                       « Coller un lien » (préparé, marqué « bientôt »).
//
// ⟵ GARDER : onClose, onPick (slot planning), onCreateBlank (édition vierge).
// ⟵ BRANCHER : recipes (Supabase), state de recherche/filtre.

import React, { useState } from 'react';
import { Icon } from './Icon';
import { Kicker, Button, Thumb } from './primitives';

type Recipe = {
  id: string;
  title: string;
  time: string;
  portions: number;
  tag: string;
  image_url?: string | null;
};

type Slot = { dayLabel: string; mealLabel: string };

export default function AddRecipeModal({
  mode,
  slot,
  recipes = [],
  onClose,
  onPick, // ⟵ GARDER : ajoute la recette choisie au créneau (planning)
  onCreateBlank, // ⟵ GARDER : ouvre l'édition d'une recette vierge (bibliothèque)
}: {
  mode: 'plan' | 'import';
  slot?: Slot; // contexte créneau en mode "plan"
  recipes?: Recipe[];
  onClose?: () => void;
  onPick?: (id: string) => void;
  onCreateBlank?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40"
      onClick={onClose} // clic sur l'arrière-plan ferme
    >
      <div
        className="w-full max-w-[560px] max-h-[80vh] flex flex-col bg-cream border border-line shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between px-7 py-5 border-b border-line">
          <div>
            <Kicker className="mb-1.5">
              {mode === 'plan' ? 'Ajouter au planning' : 'Nouvelle recette'}
            </Kicker>
            <h2 className="font-display text-[26px] text-ink m-0 leading-none">
              {mode === 'plan' ? 'Choisir une recette' : 'Ajouter à la bibliothèque'}
            </h2>
            {mode === 'plan' && slot && (
              <div className="font-label text-[11px] uppercase tracking-wide text-muted mt-2">
                {slot.dayLabel} · {slot.mealLabel}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-ink-soft hover:text-ink bg-transparent border-0 cursor-pointer p-1 -mr-1"
            aria-label="Fermer"
          >
            <Icon name="x" size={20} strokeWidth={1.9} />
          </button>
        </div>

        {/* Corps */}
        {mode === 'plan' ? (
          <PlanBody recipes={recipes} onPick={onPick} />
        ) : (
          <ImportBody onCreateBlank={onCreateBlank} />
        )}
      </div>
    </div>
  );
}

/* ── Mode PLANNING : recherche + filtres + liste de recettes ───────── */
function PlanBody({
  recipes,
  onPick,
}: {
  recipes: Recipe[];
  onPick?: (id: string) => void;
}) {
  const [q, setQ] = useState('');
  const filters = ['Toutes', 'Déj rapide', 'Plats du soir', 'Veggie'];
  // ⟵ BRANCHER : filtrage réel ; ici simple includes sur le titre
  const list = recipes.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="px-7 pt-5">
        <div className="flex items-center gap-3 border-b-[1.5px] border-ink pb-2.5">
          <Icon name="search" size={18} strokeWidth={1.6} className="text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher dans le carnet…"
            className="flex-1 bg-transparent outline-none text-[16px] text-ink placeholder:text-muted placeholder:italic"
          />
        </div>
        <div className="flex gap-5 mt-3.5">
          {filters.map((f, i) => (
            <button
              key={f}
              className={[
                'font-label text-[11.5px] uppercase tracking-wide cursor-pointer pb-1 bg-transparent border-0',
                i === 0
                  ? 'text-ink font-semibold border-b-[1.5px] border-ember'
                  : 'text-muted font-medium border-b-[1.5px] border-transparent',
              ].join(' ')}
              /* ⟵ BRANCHER filtre actif */
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-7 py-4">
        {list.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3.5 py-3 border-b border-line-soft last:border-0"
          >
            <Thumb label="photo" src={r.image_url} className="w-[56px] h-[56px] shrink-0" />
            <div className="flex-1 min-w-0">
              <Kicker className="text-olive mb-0.5">{r.tag}</Kicker>
              <div className="font-display text-[18px] text-ink leading-tight">{r.title}</div>
              <div className="font-label text-[10px] uppercase tracking-wide text-muted mt-0.5">
                {r.time} · {r.portions} pers.
              </div>
            </div>
            <Button variant="solid" icon="plus" onClick={() => onPick?.(r.id)}>
              Ajouter
            </Button>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-center text-muted italic py-10 text-[15px]">
            Aucune recette ne correspond.
          </div>
        )}
      </div>
    </>
  );
}

/* ── Mode RECETTES : créer une vierge (actif) + coller un lien (bientôt) ── */
function ImportBody({ onCreateBlank }: { onCreateBlank?: () => void }) {
  return (
    <div className="px-7 py-7 flex flex-col gap-5">
      {/* Créer une recette vierge — actif aujourd'hui */}
      <button
        onClick={onCreateBlank}
        className="text-left bg-paper border border-line hover:border-ink transition-colors p-5 cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-1.5">
          <span className="w-9 h-9 rounded-full bg-ember text-creamlight flex items-center justify-center shrink-0">
            <Icon name="plus" size={18} strokeWidth={2.1} />
          </span>
          <span className="font-display text-[21px] text-ink">Créer une recette vierge</span>
        </div>
        <p className="text-[15px] text-ink-soft m-0 leading-[1.45] pl-12">
          Saisissez le titre, les ingrédients et les étapes à la main.
        </p>
      </button>

      {/* Coller un lien — préparé, désactivé (feature future) */}
      <div className="relative bg-paper border border-line border-dashed p-5 opacity-70">
        <span className="absolute top-4 right-4 font-label text-[9.5px] font-semibold uppercase tracking-wide text-muted border border-line px-2 py-1">
          Bientôt
        </span>
        <div className="flex items-center gap-3 mb-2.5">
          <span className="w-9 h-9 rounded-full bg-ember-soft text-ember flex items-center justify-center shrink-0">
            <Icon name="copy" size={17} strokeWidth={1.8} />
          </span>
          <span className="font-display text-[21px] text-ink">Coller un lien</span>
        </div>
        <div className="pl-12">
          <p className="text-[15px] text-ink-soft m-0 mb-3 leading-[1.45]">
            Importez une recette depuis une URL — disponible prochainement.
          </p>
          <div className="flex items-center gap-3 border-b-[1.5px] border-line pb-2">
            <input
              disabled
              placeholder="https://…"
              className="flex-1 bg-transparent outline-none text-[15px] text-muted italic cursor-not-allowed"
            />
            <Button variant="solid" disabled className="opacity-60 cursor-not-allowed">
              Importer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
