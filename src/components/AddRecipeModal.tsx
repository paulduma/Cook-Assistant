import { useRef, useState } from 'react';
import { Recipe } from '../types/recipe';
import { RecipeImportResult } from '../types/recipeImport';
import { RecipeImportError, getImportErrorMessage, importFromUrl, isValidInstagramUrl } from '../lib/recipeImport';
import { Icon } from './ui/Icon';
import { Kicker, Button, Thumb } from './ui/primitives';

type Slot = { dayLabel: string; mealLabel: string };

type ModalRecipe = {
  id: string;
  title: string;
  time: string;
  portions: number;
  tag: string;
  tags: string[];
  image_url?: string | null;
};

export function recipeToModalRecipe(recipe: Recipe): ModalRecipe {
  const tags = recipe.tags.length > 0 ? recipe.tags : ['Recette'];
  return {
    id: recipe.id,
    title: recipe.title,
    time: `${recipe.cookingTime} min`,
    portions: recipe.servings,
    tag: tags[0],
    tags,
    image_url: recipe.image ?? null,
  };
}

export function AddRecipeModal({
  mode,
  slot,
  recipes = [],
  onClose,
  onPick,
  onCreateBlank,
  onImported,
}: {
  mode: 'plan' | 'import';
  slot?: Slot;
  recipes?: ModalRecipe[];
  onClose?: () => void;
  onPick?: (id: string) => void;
  onCreateBlank?: () => void;
  onImported?: (result: RecipeImportResult) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] max-h-[80vh] flex flex-col bg-cream border border-line shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-7 py-5 border-b border-line">
          <div>
            <Kicker className="mb-1.5">
              {mode === 'plan' ? 'Ajouter au planning' : 'Nouvelle recette'}
            </Kicker>
            <h2 className="font-display text-[26px] text-ink m-0 leading-none">
              {mode === 'plan' ? 'Choisir une recette' : 'Ajouter à la bibliothèque'}
            </h2>
            {mode === 'plan' && slot && (
              <div className="font-label text-[11px] uppercase tracking-wide text-muted mt-2">
                {slot.dayLabel} · {slot.mealLabel}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-ink-soft hover:text-ink bg-transparent border-0 cursor-pointer p-1 -mr-1"
            aria-label="Fermer"
          >
            <Icon name="x" size={20} strokeWidth={1.9} />
          </button>
        </div>

        {mode === 'plan' ? (
          <PlanBody recipes={recipes} onPick={onPick} />
        ) : (
          <ImportBody onCreateBlank={onCreateBlank} onImported={onImported} />
        )}
      </div>
    </div>
  );
}

function PlanBody({
  recipes,
  onPick,
}: {
  recipes: ModalRecipe[];
  onPick?: (id: string) => void;
}) {
  const [q, setQ] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allTags = Array.from(new Set(recipes.flatMap((r) => r.tags)));

  const toggleTag = (tag: string) => {
    setSelectedTag((current) => (current === tag ? null : tag));
  };

  const list = recipes.filter((r) => {
    const query = q.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(query) ||
      r.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesTag = !selectedTag || r.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <>
      <div className="px-7 pt-5 shrink-0">
        <div className="flex items-center gap-3 border-b-[1.5px] border-ink pb-2.5">
          <Icon name="search" size={18} strokeWidth={1.6} className="text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher dans le carnet…"
            className="flex-1 bg-transparent outline-none text-[16px] text-ink placeholder:text-muted placeholder:italic"
          />
        </div>
        {allTags.length > 0 && (
          <div className="-mx-7 px-7 flex gap-5 overflow-x-auto mt-3.5 pb-0.5 shrink-0">
            <button
              onClick={() => setSelectedTag(null)}
              className={[
                'font-label text-[11.5px] uppercase tracking-wide cursor-pointer pb-1 bg-transparent border-0 whitespace-nowrap shrink-0',
                selectedTag === null
                  ? 'text-ink font-semibold border-b-[1.5px] border-ember'
                  : 'text-muted font-medium border-b-[1.5px] border-transparent',
              ].join(' ')}
            >
              Toutes
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={[
                  'font-label text-[11.5px] uppercase tracking-wide cursor-pointer pb-1 bg-transparent border-0 whitespace-nowrap shrink-0',
                  selectedTag === tag
                    ? 'text-ink font-semibold border-b-[1.5px] border-ember'
                    : 'text-muted font-medium border-b-[1.5px] border-transparent',
                ].join(' ')}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto px-7 py-4">
        {list.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-3.5 py-3 border-b border-line-soft last:border-0"
          >
            <Thumb label="photo" src={r.image_url} className="w-[56px] h-[56px] shrink-0" />
            <div className="flex-1 min-w-0">
              <Kicker className="text-olive mb-0.5">{r.tag}</Kicker>
              <div className="font-display text-[18px] text-ink leading-tight">{r.title}</div>
              <div className="font-label text-[10px] uppercase tracking-wide text-muted mt-0.5">
                {r.time} · {r.portions} pers.
              </div>
            </div>
            <Button variant="solid" icon="plus" onClick={() => onPick?.(r.id)}>
              Ajouter
            </Button>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-center text-muted italic py-10 text-[15px]">
            Aucune recette ne correspond.
          </div>
        )}
      </div>
    </>
  );
}

function ImportBody({
  onCreateBlank,
  onImported,
}: {
  onCreateBlank?: () => void;
  onImported?: (result: RecipeImportResult) => void;
}) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [rawCaptionFallback, setRawCaptionFallback] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const handleImport = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setInlineError('Collez un lien Instagram.');
      return;
    }
    if (!isValidInstagramUrl(trimmed)) {
      setInlineError('Ce lien ne semble pas être une URL Instagram valide (post ou reel).');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setInlineError(null);
    setRawCaptionFallback(undefined);

    try {
      const result = await importFromUrl(trimmed, { signal: controller.signal });
      onImported?.(result);
    } catch (err) {
      if (err instanceof RecipeImportError) {
        setInlineError(err.message || getImportErrorMessage(err.code));
        setRawCaptionFallback(err.rawCaption);
      } else {
        setInlineError(getImportErrorMessage('internal_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelImport = () => {
    abortRef.current?.abort();
    setLoading(false);
    setInlineError('Import annulé. Vous pouvez réessayer ou saisir à la main.');
  };

  const handleManualFallback = () => {
    if (rawCaptionFallback) {
      onImported?.({
        draft: {
          title: '',
          ingredients: [''],
          steps: [''],
          cookingTime: 30,
          servings: 4,
          tags: [],
          sourceUrl: url.trim() || undefined,
        },
        uncertainFields: {
          title: true,
          servings: true,
          cookingTime: true,
          ingredients: [true],
          steps: [true],
        },
        rawCaption: rawCaptionFallback,
      });
      return;
    }
    onCreateBlank?.();
  };

  return (
    <div className="px-7 py-7 flex flex-col gap-5 overflow-auto">
      <button
        type="button"
        onClick={onCreateBlank}
        className="text-left bg-paper border border-line hover:border-ink transition-colors p-5 cursor-pointer"
      >
        <div className="flex items-center gap-3 mb-1.5">
          <span className="w-9 h-9 rounded-full bg-ember text-creamlight flex items-center justify-center shrink-0">
            <Icon name="plus" size={18} strokeWidth={2.1} />
          </span>
          <span className="font-display text-[21px] text-ink">Créer une recette vierge</span>
        </div>
        <p className="text-[15px] text-ink-soft m-0 leading-[1.45] pl-12">
          Saisissez le titre, les ingrédients et les étapes à la main.
        </p>
      </button>

      <div className="bg-paper border border-line p-5">
        <div className="flex items-center gap-3 mb-2.5">
          <span className="w-9 h-9 rounded-full bg-ember-soft text-ember flex items-center justify-center shrink-0">
            <Icon name="copy" size={17} strokeWidth={1.8} />
          </span>
          <span className="font-display text-[21px] text-ink">Importer depuis Instagram</span>
        </div>
        <div className="pl-12">
          <p className="text-[15px] text-ink-soft m-0 mb-3 leading-[1.45]">
            Collez un lien de post ou de reel — l’IA préremplit le formulaire à vérifier.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-b-[1.5px] border-ink pb-2">
            <input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (inlineError) setInlineError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleImport();
                }
              }}
              disabled={loading}
              placeholder="https://www.instagram.com/reel/…"
              className="flex-1 bg-transparent outline-none text-[15px] text-ink placeholder:text-muted placeholder:italic disabled:opacity-50"
              autoFocus
            />
            {loading ? (
              <Button type="button" variant="outline" onClick={handleCancelImport}>
                Annuler
              </Button>
            ) : (
              <Button type="button" variant="solid" onClick={() => void handleImport()}>
                Importer
              </Button>
            )}
          </div>
          {loading && (
            <p className="flex items-center gap-2 text-[13px] text-muted m-0 mt-3">
              <span className="w-3.5 h-3.5 border-2 border-muted/30 border-t-muted rounded-full animate-spin shrink-0" />
              Extraction en cours (environ 5–15&nbsp;s)…
            </p>
          )}
          {inlineError && (
            <div className="mt-3 text-[13px] text-ember-dark leading-[1.45]">
              <p className="m-0 mb-2">{inlineError}</p>
              <button
                type="button"
                onClick={handleManualFallback}
                className="font-label text-[11px] font-semibold uppercase tracking-wide text-ember bg-transparent border-0 cursor-pointer p-0 underline"
              >
                Continuer en saisie manuelle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
