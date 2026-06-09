// reference/mobile/Home.mobile.tsx
import React, { useState } from 'react';
import { MobileScreen, MobileTopBar, MobileTabBar } from './MobileShell';
import { Kicker } from '../primitives';
import { Icon } from '../Icon';

export default function HomeMobile({
  onNavigate,
  onAsk, // ⟵ GARDER : ouvre l'assistant avec la requête
}: {
  onNavigate?: (k: any) => void;
  onAsk?: (q: string) => void;
}) {
  const [q, setQ] = useState('');
  const features: [string, string, string][] = [
    ['01', 'Nos recettes', 'Le carnet maison, à quatre mains.'],
    ['02', 'Le planning', 'Chaque repas de la semaine, à sa place.'],
    ['03', 'Liste de courses', 'Générée depuis le planning.'],
  ];
  return (
    <MobileScreen
      top={<MobileTopBar wordmark />}
      bottom={<MobileTabBar active="recettes" onNavigate={onNavigate} />}
    >
      <div className="px-6 pt-[34px] pb-6 text-center">
        <Kicker className="mb-4">Le menu de la semaine · N°24</Kicker>
        <h1 className="font-display text-[34px] text-ink m-0 mb-4">
          Qu'est-ce qu'on mange cette semaine&nbsp;?
        </h1>
        <p className="text-[16px] text-ink-soft italic leading-[1.5] m-0 mb-7">
          On compose le planning, la liste de courses suit toute seule.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAsk?.(q);
          }}
          className="flex items-center gap-3 border-b-[1.5px] border-ink pb-2.5 mb-2 text-left"
        >
          <Icon name="search" size={18} strokeWidth={1.6} className="text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="À la recherche d'inspiration…"
            className="flex-1 bg-transparent outline-none text-[15.5px] text-ink placeholder:text-muted placeholder:italic"
          />
          <button
            type="submit"
            className="w-[38px] h-[38px] rounded-full bg-ember text-creamlight flex items-center justify-center shrink-0 border-0 cursor-pointer"
          >
            <Icon name="send" size={17} strokeWidth={1.7} />
          </button>
        </form>
        <div className="font-label text-[10px] uppercase tracking-wide text-muted text-left mb-7">
          Touchez pour discuter avec l'assistant →
        </div>

        <div className="text-left">
          {features.map(([n, t, s]) => (
            <div key={n} className="flex gap-3.5 py-[15px] border-b border-line-soft">
              <div className="font-display text-[22px] text-ember w-[30px] shrink-0">{n}</div>
              <div>
                <div className="font-label text-[11px] font-semibold uppercase tracking-wide text-ink mb-0.5">
                  {t}
                </div>
                <div className="text-[14.5px] text-ink-soft leading-[1.4]">{s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileScreen>
  );
}
