import { SuggestedRecipe } from '../../lib/chatRecipes';
import { Kicker } from '../ui/primitives';
import { Icon } from '../ui/Icon';

interface NewRecipeSuggestionProps {
  recipe: SuggestedRecipe;
  compact?: boolean;
  isSaved?: boolean;
  isSaving?: boolean;
  onSave: () => void;
}

export function NewRecipeSuggestion({
  recipe,
  compact = false,
  isSaved = false,
  isSaving = false,
  onSave,
}: NewRecipeSuggestionProps) {
  const tag = recipe.tags[0] ?? 'Nouvelle idée';

  return (
    <div
      className={[
        'flex bg-paper border border-dashed border-olive/40',
        compact ? 'gap-3 p-3 mt-2.5 w-full' : 'flex-1 gap-3.5 p-3.5 min-w-0',
      ].join(' ')}
    >
      <div
        className={[
          'shrink-0 bg-cream border border-line flex items-center justify-center text-muted',
          compact ? 'w-16 h-16' : 'w-[76px] h-[76px]',
        ].join(' ')}
      >
        <Icon name="hat" size={compact ? 22 : 26} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <Kicker className="text-olive mb-0.5 md:mb-1">{tag}</Kicker>
        <div
          className={[
            'font-display text-ink leading-[1.1] mb-1 md:mb-1.5',
            compact ? 'text-[17px]' : 'text-[19px]',
          ].join(' ')}
        >
          {recipe.title}
        </div>
        <div className="font-label text-[10px] md:text-[10.5px] uppercase tracking-wide text-muted mb-2 md:mb-3">
          {recipe.cookingTime} min · {recipe.servings} pers.
        </div>
        {isSaved ? (
          <span className="inline-flex items-center gap-1.5 font-label text-[10.5px] font-semibold uppercase tracking-wide text-olive">
            <Icon name="check" size={13} strokeWidth={2.1} />
            Dans le carnet
          </span>
        ) : (
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className={[
              'inline-flex items-center gap-1.5 font-label font-semibold uppercase tracking-wide text-creamlight bg-olive cursor-pointer border-0 disabled:opacity-50',
              compact ? 'text-[10px] px-3 py-1.5' : 'text-[10.5px] px-3 py-2',
            ].join(' ')}
          >
            {isSaving ? (
              <span className="w-3 h-3 border-2 border-creamlight/30 border-t-creamlight rounded-full animate-spin" />
            ) : (
              <Icon name="plus" size={compact ? 12 : 13} strokeWidth={2.1} />
            )}
            Ajouter au carnet
          </button>
        )}
      </div>
    </div>
  );
}
