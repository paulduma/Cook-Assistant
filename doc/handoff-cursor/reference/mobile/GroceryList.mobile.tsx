// reference/mobile/GroceryList.mobile.tsx
// Liste de courses mobile : ajout d'article, groupes filetés, cases à cocher
// rondes (geste central en magasin), toggle catégorie/recette, « Copier ».

import React, { useState } from 'react';
import { MobileScreen, MobileTabBar } from './MobileShell';
import { Kicker, SectionRule } from '../primitives';
import { Icon } from '../Icon';

type Item = { name: string; note?: string; perso?: boolean; done?: boolean };

export default function GroceryListMobile({
  onNavigate,
  onCopy, // ⟵ GARDER : copie la liste
  onAddItem, // ⟵ GARDER : ajoute un article perso
  onToggle, // ⟵ GARDER : coche un article
}: {
  onNavigate?: (k: any) => void;
  onCopy?: () => void;
  onAddItem?: (name: string) => void;
  onToggle?: (name: string) => void;
}) {
  const [v, setV] = useState('');
  // ⟵ BRANCHER : catégories générées depuis le planning
  const categories: [string, Item[]][] = [
    ['Céréales & boulangerie', [{ name: 'Pâtes', note: '1 recette' }]],
    ['Épicerie', [{ name: 'Œufs', note: '1 recette', done: true }, { name: 'Café en grains', perso: true }]],
  ];

  const top = (
    <div
      className="bg-cream border-b border-line px-5"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <Kicker className="mb-1">3 lignes</Kicker>
          <div className="font-display text-[26px] text-ink">Liste de courses</div>
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 text-ember bg-transparent border-0 cursor-pointer"
        >
          <Icon name="copy" size={18} strokeWidth={1.8} />
          <span className="font-label text-[10.5px] font-semibold uppercase tracking-wide">Copier</span>
        </button>
      </div>
      <div className="flex gap-5.5">
        {['Par catégorie', 'Par recette'].map((s, i) => (
          <button
            key={s}
            className={[
              'font-label text-[11px] font-semibold uppercase tracking-wide pb-2.5 bg-transparent border-0 cursor-pointer',
              i === 0 ? 'text-ink border-b-[1.5px] border-ember' : 'text-muted border-b-[1.5px] border-transparent',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <MobileScreen top={top} bottom={<MobileTabBar active="courses" onNavigate={onNavigate} />}>
      <div className="px-5 pt-[18px] pb-2">
        {/* Ajout d'article */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (v.trim()) onAddItem?.(v);
            setV('');
          }}
          className="flex items-center gap-2.5 border-[1.5px] border-ink pl-3.5 pr-2 py-2 mb-[22px]"
        >
          <input
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="Ajouter un article…"
            className="flex-1 bg-transparent outline-none text-[14.5px] text-ink placeholder:text-muted placeholder:italic"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 font-label text-[10.5px] font-semibold uppercase tracking-wide text-creamlight bg-ember px-3 py-2 border-0 cursor-pointer"
          >
            <Icon name="plus" size={13} strokeWidth={2.1} />
            Ajouter
          </button>
        </form>

        {categories.map(([title, items]) => (
          <div key={title} className="mb-6">
            <SectionRule>{title}</SectionRule>
            {items.map((it, i) => (
              <button
                key={i}
                onClick={() => onToggle?.(it.name)}
                className="flex items-center justify-between w-full py-3 border-b border-line-soft bg-transparent border-x-0 border-t-0 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={[
                      'w-[21px] h-[21px] rounded-full border-[1.6px] flex items-center justify-center shrink-0',
                      it.done ? 'bg-ember border-ember text-creamlight' : 'border-line',
                    ].join(' ')}
                  >
                    {it.done && <Icon name="check" size={12} strokeWidth={2.4} />}
                  </span>
                  <span className={`text-[16.5px] ${it.done ? 'text-muted line-through' : 'text-ink'}`}>
                    {it.name}
                  </span>
                </div>
                {it.perso ? (
                  <span className="font-label text-[9.5px] uppercase tracking-wide text-olive">perso</span>
                ) : (
                  <span className="font-label text-[9.5px] uppercase tracking-wide text-muted">{it.note}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </MobileScreen>
  );
}
