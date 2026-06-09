// reference/RecipeEdit.tsx
// Édition / création de recette. Champs « soulignés », listes d'ingrédients et
// d'étapes avec ajout/suppression. CTA Enregistrer / Annuler conservés.
// ⟵ GARDER : tout votre state de formulaire + la soumission Supabase.

import React from 'react';
import { Screen } from './Shell';
import { Kicker, Button, Field } from './primitives';
import { Icon } from './Icon';

export default function RecipeEdit({
  onNavigate,
  onSave, // ⟵ GARDER votre submit (insert/update Supabase)
  onCancel,
}: {
  onNavigate?: (k: any) => void;
  onSave?: () => void;
  onCancel?: () => void;
}) {
  // ⟵ BRANCHER votre state de formulaire (ces valeurs sont factices)
  const ingredients = ['400 g de pâtes', '4 œufs'];
  const steps = ['Faire cuire les pâtes', 'Battre les œufs avec le parmesan'];

  return (
    <Screen active="recettes" onNavigate={onNavigate}>
      <div className="max-w-[740px] mx-auto px-11 py-10">
        <Kicker className="mb-2.5">Édition</Kicker>
        <h1 className="font-display text-[44px] text-ink m-0 mb-7">Modifier la recette</h1>

        <Field label="Titre de la recette" value="Carbonara" />
        <Field label="URL de l'image (optionnel)" placeholder="https://…" />
        <div className="flex gap-7">
          <div className="flex-1">
            <Field label="Temps de cuisson (min)" value="30" />
          </div>
          <div className="flex-1">
            <Field label="Portions" value="4" />
          </div>
        </div>

        {/* Ingrédients */}
        <Kicker className="text-ink-soft mt-1 mb-3">Ingrédients</Kicker>
        {ingredients.map((x, i) => (
          <div key={i} className="flex items-center gap-3.5 mb-1.5 border-b border-line-soft py-2">
            <input
              defaultValue={x}
              className="flex-1 bg-transparent outline-none text-[17px] text-ink"
            />
            <button className="text-ember-dark cursor-pointer bg-transparent border-0" /* ⟵ GARDER remove */>
              <Icon name="x" size={17} strokeWidth={1.9} />
            </button>
          </div>
        ))}
        <button
          className="inline-flex items-center gap-2 font-label text-[12px] font-semibold uppercase tracking-wide text-ember mt-3.5 mb-7 cursor-pointer bg-transparent border-0"
          /* ⟵ GARDER add ingredient */
        >
          <Icon name="plus" size={16} strokeWidth={2} />
          Ajouter un ingrédient
        </button>

        {/* Étapes */}
        <Kicker className="text-ink-soft mb-3.5">Étapes</Kicker>
        {steps.map((x, i) => (
          <div key={i} className="flex items-start gap-[18px] mb-2 border-b border-line-soft py-2">
            <div className="font-display text-2xl text-ember leading-none w-[30px] shrink-0 pt-0.5">
              {String(i + 1).padStart(2, '0')}
            </div>
            <input
              defaultValue={x}
              className="flex-1 bg-transparent outline-none text-[17px] text-ink pt-0.5"
            />
            <button className="text-ember-dark cursor-pointer bg-transparent border-0 mt-1" /* ⟵ GARDER remove */>
              <Icon name="x" size={17} strokeWidth={1.9} />
            </button>
          </div>
        ))}

        <div className="flex gap-3.5 mt-8">
          <Button variant="solid" onClick={onSave}>
            Enregistrer
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </div>
    </Screen>
  );
}
