import { WeekPlanEntry } from '../../lib/chatRecipes';
import { DAY_LABELS, MEAL_LABELS, MEAL_MAP } from '../../lib/planning';
import { Kicker } from '../ui/primitives';
import { Icon } from '../ui/Icon';

interface WeekPlanValidationProps {
  entries: WeekPlanEntry[];
  newRecipeCount: number;
  compact?: boolean;
  isApplying?: boolean;
  isApplied?: boolean;
  onValidate: () => void;
  onOpenPlanning?: () => void;
}

function formatSlotLabel(entry: WeekPlanEntry): string {
  const day = DAY_LABELS[entry.day.toLowerCase()] ?? entry.day;
  const meal = MEAL_MAP[entry.meal.toLowerCase()];
  const mealLabel = meal ? MEAL_LABELS[meal] : entry.meal;
  return `${day} · ${mealLabel}`;
}

export function WeekPlanValidation({
  entries,
  newRecipeCount,
  compact = false,
  isApplying = false,
  isApplied = false,
  onValidate,
  onOpenPlanning,
}: WeekPlanValidationProps) {
  return (
    <div
      className={[
        'mt-4 border border-line bg-cream',
        compact ? 'p-3' : 'p-4',
      ].join(' ')}
    >
      <Kicker className="text-ember mb-2">Menu de la semaine</Kicker>
      <ul className="m-0 p-0 list-none space-y-1.5 mb-3">
        {entries.map((entry, i) => (
          <li
            key={`${entry.day}-${entry.meal}-${i}`}
            className="text-[14px] md:text-[15px] text-ink-soft leading-snug"
          >
            <span className="font-label text-[10px] uppercase tracking-wide text-muted">
              {formatSlotLabel(entry)}
            </span>
            <span className="block font-display text-ink text-[16px] leading-tight mt-0.5">
              {entry.title}
            </span>
          </li>
        ))}
      </ul>

      {isApplied ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-1.5 font-label text-[10.5px] font-semibold uppercase tracking-wide text-olive">
            <Icon name="check" size={13} strokeWidth={2.1} />
            Planning mis à jour
          </span>
          {onOpenPlanning && (
            <button
              type="button"
              onClick={onOpenPlanning}
              className="font-label text-[10.5px] font-semibold uppercase tracking-wide text-ink bg-transparent border border-line px-3 py-2 cursor-pointer"
            >
              Voir le planning
            </button>
          )}
        </div>
      ) : (
        <>
          {newRecipeCount > 0 && (
            <p className="text-[13px] text-muted m-0 mb-3">
              {newRecipeCount === 1
                ? '1 nouvelle recette sera ajoutée au carnet.'
                : `${newRecipeCount} nouvelles recettes seront ajoutées au carnet.`}
            </p>
          )}
          <button
            type="button"
            onClick={onValidate}
            disabled={isApplying}
            className="inline-flex items-center gap-1.5 font-label text-[10.5px] font-semibold uppercase tracking-wide text-creamlight bg-ember cursor-pointer border-0 px-4 py-2.5 disabled:opacity-50"
          >
            {isApplying ? (
              <span className="w-3.5 h-3.5 border-2 border-creamlight/30 border-t-creamlight rounded-full animate-spin" />
            ) : (
              <Icon name="calendar" size={14} strokeWidth={2} />
            )}
            Valider le menu
          </button>
        </>
      )}
    </div>
  );
}
