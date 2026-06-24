import { Kicker } from '../ui/primitives';
import { Icon } from '../ui/Icon';

interface CookingSessionBarProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  isNewRecipe?: boolean;
  onEnd?: () => void;
}

export function CookingSessionBar({
  title,
  currentStep,
  totalSteps,
  isNewRecipe = false,
  onEnd,
}: CookingSessionBarProps) {
  const progress = totalSteps > 0 ? Math.min(100, (currentStep / totalSteps) * 100) : 0;

  return (
    <div className="shrink-0 border-b border-line bg-cream px-4 py-3 md:px-10">
      <div className="max-w-[760px] mx-auto">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <Kicker className="text-ember mb-0.5">
              {isNewRecipe ? 'Cuisine · nouvelle recette' : 'Cuisine en cours'}
            </Kicker>
            <div className="font-display text-[17px] md:text-[19px] text-ink leading-tight truncate">
              {title}
            </div>
          </div>
          <div className="shrink-0 font-label text-[11px] font-semibold uppercase tracking-wide text-ink-soft whitespace-nowrap pt-1">
            Étape {currentStep}/{totalSteps}
          </div>
        </div>
        <div className="h-1 bg-line overflow-hidden">
          <div
            className="h-full bg-ember transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {onEnd && (
          <button
            type="button"
            onClick={onEnd}
            className="mt-2 inline-flex items-center gap-1 font-label text-[10px] uppercase tracking-wide text-muted hover:text-ink bg-transparent border-0 cursor-pointer p-0"
          >
            <Icon name="x" size={12} strokeWidth={2} />
            Terminer la session
          </button>
        )}
      </div>
    </div>
  );
}
