import { RecipeUpdatePayload } from '../../lib/chatRecipes';
import { Kicker } from '../ui/primitives';
import { Icon } from '../ui/Icon';

interface RecipeUpdatePromptProps {
  payload: RecipeUpdatePayload;
  compact?: boolean;
  isSaving?: boolean;
  isSaved?: boolean;
  onSave: () => void;
  onDismiss: () => void;
}

export function RecipeUpdatePrompt({
  payload,
  compact = false,
  isSaving = false,
  isSaved = false,
  onSave,
  onDismiss,
}: RecipeUpdatePromptProps) {
  const isUpdate = Boolean(payload.id);

  return (
    <div
      className={[
        'mt-4 border border-line bg-paper',
        compact ? 'p-3' : 'p-4',
      ].join(' ')}
    >
      <Kicker className="text-ember mb-1.5">
        {isUpdate ? 'Mettre à jour le carnet ?' : 'Enregistrer la recette ?'}
      </Kicker>
      <p className="text-[14px] md:text-[15px] text-ink-soft m-0 mb-3 leading-snug">
        {isUpdate
          ? `Enregistrer les modifications pour « ${payload.title} » dans votre carnet.`
          : `Ajouter « ${payload.title} » à votre carnet avec les ajustements de la session.`}
      </p>

      {isSaved ? (
        <span className="inline-flex items-center gap-1.5 font-label text-[10.5px] font-semibold uppercase tracking-wide text-olive">
          <Icon name="check" size={13} strokeWidth={2.1} />
          Enregistré
        </span>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 font-label text-[10.5px] font-semibold uppercase tracking-wide text-creamlight bg-ember cursor-pointer border-0 px-4 py-2 disabled:opacity-50"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-creamlight/30 border-t-creamlight rounded-full animate-spin" />
            ) : (
              <Icon name="edit" size={14} strokeWidth={2} />
            )}
            Enregistrer les modifications
          </button>
          <button
            type="button"
            onClick={onDismiss}
            disabled={isSaving}
            className="font-label text-[10.5px] font-semibold uppercase tracking-wide text-ink bg-transparent border border-line px-4 py-2 cursor-pointer disabled:opacity-50"
          >
            Non merci
          </button>
        </div>
      )}
    </div>
  );
}
