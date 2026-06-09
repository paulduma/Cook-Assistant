// reference/mobile/Planner.mobile.tsx
// Planning mobile : la grille 7×3 ne tient pas → sélecteur de JOUR en haut
// (puce ronde du jour actif), puis les repas du jour en cartes. Le « + » ouvre
// AddRecipeModal mode="plan" pour le créneau (jour, repas).

import React, { useState } from 'react';
import { MobileScreen, MobileTopBar, MobileTabBar } from './MobileShell';
import { Kicker } from '../primitives';
import { Icon } from '../Icon';

const DAYS = [
  ['Lun', '9'], ['Mar', '10'], ['Mer', '11'], ['Jeu', '12'],
  ['Ven', '13'], ['Sam', '14'], ['Dim', '15'],
] as const;
const MEALS = ['Petit-déjeuner', 'Déjeuner', 'Dîner'];

type Entry = { title: string; meta: string } | null;

export default function PlannerMobile({
  onNavigate,
  onAddMeal, // ⟵ GARDER : ouvre la pop-up d'ajout (jour, repas)
  onOpenRecipe,
}: {
  onNavigate?: (k: any) => void;
  onAddMeal?: (dayIndex: number, mealIndex: number) => void;
  onOpenRecipe?: () => void;
}) {
  const [day, setDay] = useState(1);
  // ⟵ BRANCHER : repas du jour sélectionné depuis votre planning Supabase
  const entriesForDay: Entry[] = [{ title: 'Carbonara', meta: '30 min · 4 pers.' }, null, null];

  const top = (
    <div
      className="bg-cream border-b border-line"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}
    >
      <div className="px-5 pb-3">
        <Kicker className="mb-1">Repas de la semaine</Kicker>
        <div className="font-display text-[28px] text-ink">Planning</div>
      </div>
      <div className="flex gap-1.5 px-3.5 pb-3">
        {DAYS.map(([d, n], i) => {
          const on = i === day;
          return (
            <button
              key={d}
              onClick={() => setDay(i)}
              className={`flex-1 text-center py-2 rounded-xl border-0 cursor-pointer ${on ? 'bg-ember' : 'bg-transparent'}`}
            >
              <div
                className={[
                  'font-label text-[9.5px] font-semibold uppercase tracking-wide',
                  on ? 'text-creamlight' : 'text-muted',
                ].join(' ')}
              >
                {d}
              </div>
              <div className={`font-display text-[18px] mt-0.5 ${on ? 'text-creamlight' : 'text-ink'}`}>
                {n}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <MobileScreen top={top} bottom={<MobileTabBar active="planning" onNavigate={onNavigate} />}>
      <div className="px-5 pt-5 pb-2">
        <div className="font-display text-[20px] text-ink mb-4">
          {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][day]}{' '}
          {DAYS[day][1]} juin
        </div>
        {MEALS.map((m, mi) => {
          const e = entriesForDay[mi];
          return (
            <div key={m} className="mb-3.5">
              <Kicker className="text-muted mb-2">{m}</Kicker>
              {e ? (
                <button
                  onClick={onOpenRecipe}
                  className="block w-full text-left bg-cream border border-line border-l-[3px] border-l-ember px-4 py-3.5 cursor-pointer"
                >
                  <div className="font-display text-[19px] text-ink">{e.title}</div>
                  <div className="font-label text-[10px] uppercase tracking-wide text-muted mt-1">
                    {e.meta}
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => onAddMeal?.(day, mi)}
                  className="w-full flex items-center justify-center gap-2 border-[1.5px] border-dashed border-line py-4 text-muted bg-transparent cursor-pointer"
                >
                  <Icon name="plus" size={17} strokeWidth={1.8} />
                  <span className="font-label text-[11px] uppercase tracking-wide">Ajouter un repas</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </MobileScreen>
  );
}
