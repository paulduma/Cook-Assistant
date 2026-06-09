// reference/GroceryList.tsx
// Liste de courses : groupée par catégorie (toggle « Par recette »),
// articles avec case à cocher ronde, ajout d'article perso, « Copier la liste ».
// ⟵ BRANCHER : items générés depuis le planning ; ⟵ GARDER onToggle / onAdd / onCopy.

import React from 'react';
import { Screen } from './Shell';
import { Kicker, Button, SectionRule } from './primitives';
import { Icon } from './Icon';

type Item = { name: string; note?: string; perso?: boolean; done?: boolean };

function Row({ it, onToggle }: { it: Item; onToggle?: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line-soft">
      <button
        onClick={onToggle} // ⟵ GARDER : coche l'article
        className="flex items-center gap-3.5 bg-transparent border-0 cursor-pointer text-left"
      >
        <span
          className={[
            'w-[21px] h-[21px] rounded-full border-[1.6px] flex items-center justify-center shrink-0',
            it.done ? 'bg-ember border-ember text-creamlight' : 'border-line',
          ].join(' ')}
        >
          {it.done && <Icon name="check" size={12} strokeWidth={2.4} />}
        </span>
        <span
          className={`text-[17px] ${it.done ? 'text-muted line-through' : 'text-ink'}`}
        >
          {it.name}
        </span>
      </button>
      {it.perso ? (
        <span className="font-label text-[11px] uppercase tracking-wide text-olive">ajout perso</span>
      ) : (
        <span className="font-label text-[11px] uppercase tracking-wide text-muted">{it.note}</span>
      )}
    </div>
  );
}

export default function GroceryList({
  onNavigate,
  onCopy, // ⟵ GARDER : copie la liste dans le presse-papier
  onAddItem, // ⟵ GARDER : ajoute un article perso
}: {
  onNavigate?: (k: any) => void;
  onCopy?: () => void;
  onAddItem?: (name: string) => void;
}) {
  // ⟵ BRANCHER : catégories générées depuis le planning
  const categories: [string, Item[]][] = [
    ['Céréales & boulangerie', [{ name: 'Pâtes', note: '1 recette' }]],
    ['Épicerie', [{ name: 'Œufs', note: '1 recette', done: true }, { name: 'Café en grains', perso: true }]],
  ];

  return (
    <Screen active="courses" onNavigate={onNavigate}>
      <div className="max-w-[800px] mx-auto px-11 py-10">
        <div className="flex items-end justify-between mb-2">
          <div>
            <Kicker className="mb-2.5">Planning + ajouts · 3 lignes</Kicker>
            <h1 className="font-display text-[46px] text-ink m-0">Liste de courses</h1>
          </div>
          <Button icon="copy" variant="outline" onClick={onCopy}>
            Copier la liste
          </Button>
        </div>

        {/* Toggle vue */}
        <div className="flex gap-6 pt-4 mb-7 border-b border-line">
          {['Par catégorie', 'Par recette'].map((s, i) => (
            <button
              key={s}
              className={[
                'font-label text-[12px] font-semibold uppercase tracking-wide cursor-pointer pb-2.5 bg-transparent border-0',
                i === 0 ? 'text-ink border-b-[1.5px] border-ember' : 'text-muted border-b-[1.5px] border-transparent',
              ].join(' ')}
              /* ⟵ BRANCHER la vue active */
            >
              {s}
            </button>
          ))}
        </div>

        {/* Ajout d'article perso */}
        <AddItem onAddItem={onAddItem} />

        {categories.map(([title, items]) => (
          <div key={title} className="mb-7 mt-7 first:mt-0">
            <SectionRule>{title}</SectionRule>
            {items.map((it, i) => (
              <Row key={i} it={it} />
            ))}
          </div>
        ))}
      </div>
    </Screen>
  );
}

function AddItem({ onAddItem }: { onAddItem?: (name: string) => void }) {
  const [v, setV] = React.useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (v.trim()) onAddItem?.(v); // ⟵ GARDER votre ajout
        setV('');
      }}
      className="flex items-center gap-3.5 border-b-[1.5px] border-ink pb-3 mb-2"
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="ex. : papier toilette, café, croquettes de Verdi…"
        className="flex-1 bg-transparent outline-none text-[16.5px] text-ink placeholder:text-muted placeholder:italic"
      />
      <Button type="submit" variant="solid" icon="plus">
        Ajouter
      </Button>
    </form>
  );
}
