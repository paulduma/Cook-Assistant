// reference/Planner.tsx
// Planning de la semaine : grille jours × repas, filets fins, cases vides
// cliquables (ouvrent l'ajout de recette). Le README du repo prévoit un POP-UP
// d'ajout (pas une page) avec recherche + filtres : la case + déclenche ce modal.
// ⟵ BRANCHER : meals = votre planning Supabase ; ⟵ GARDER onAddMeal / onOpenRecipe.

import React from 'react';
import { Screen } from './Shell';
import { Kicker, Button } from './primitives';
import { Icon } from './Icon';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MEALS = ['Petit-déjeuner', 'Déjeuner', 'Dîner'];

type Entry = { title: string; time: string; portions: number } | null;

export default function Planner({
  onNavigate,
  onAddMeal, // ⟵ GARDER : ouvre le POP-UP d'ajout (jour, repas)
  onOpenRecipe,
}: {
  onNavigate?: (k: any) => void;
  onAddMeal?: (dayIndex: number, mealIndex: number) => void;
  onOpenRecipe?: () => void;
}) {
  // ⟵ BRANCHER votre planning : grid[mealIndex][dayIndex]
  const grid: Entry[][] = MEALS.map((_, mi) =>
    DAYS.map((__, di) =>
      mi === 0 && di === 1 ? { title: 'Carbonara', time: '30 min', portions: 4 } : null
    )
  );

  return (
    <Screen active="planning" onNavigate={onNavigate}>
      <div className="px-[52px] py-[42px]">
        <div className="flex items-end justify-between mb-7">
          <div>
            <Kicker className="mb-2.5">Repas de la semaine</Kicker>
            <h1 className="font-display text-[46px] text-ink m-0">Planning</h1>
          </div>
          <Button icon="calendar" variant="outline">
            Cette semaine
          </Button>
        </div>

        <div className="bg-cream border border-line">
          {/* En-tête jours */}
          <div className="flex border-b border-line">
            <div className="w-[150px] shrink-0" />
            {DAYS.map((d) => (
              <div
                key={d}
                className="flex-1 text-center py-4 border-l border-line font-label text-[12.5px] font-semibold uppercase tracking-wide text-ink"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Lignes repas */}
          {MEALS.map((m, mi) => (
            <div
              key={m}
              className={`flex items-stretch ${mi < MEALS.length - 1 ? 'border-b border-line' : ''}`}
            >
              <div className="w-[150px] shrink-0 flex items-center px-5 font-display text-[18px] text-ink">
                {m}
              </div>
              {DAYS.map((d, di) => {
                const e = grid[mi][di];
                return (
                  <div
                    key={d}
                    className="flex-1 h-[80px] -ml-px border-l border-line flex items-center justify-center"
                  >
                    {e ? (
                      <button
                        onClick={onOpenRecipe}
                        className="w-full h-full px-3.5 text-left border-l-[3px] border-ember bg-transparent cursor-pointer"
                      >
                        <div className="font-display text-[16px] text-ink leading-[1.1]">{e.title}</div>
                        <div className="font-label text-[10px] uppercase tracking-wide text-muted mt-1">
                          {e.time} · {e.portions} p.
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={() => onAddMeal?.(di, mi)}
                        className="w-full h-full flex items-center justify-center text-muted hover:text-ember bg-transparent border-0 cursor-pointer"
                      >
                        <Icon name="plus" size={18} strokeWidth={1.7} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
