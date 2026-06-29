import React from 'react';
import { Recipe } from '../../types/recipe';
import { MobileScreen, MobileTopBar, MobileTabBar, MobileWordmark } from '../ui/MobileShell';
import { Kicker, Thumb } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { TabKey } from '../../lib/nav';

export function LibraryListMobile({
  recipes,
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
  allTags,
  onOpenRecipe,
  onAddRecipe,
  onNavigate,
  onHome,
}: {
  recipes: Recipe[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
  allTags: string[];
  onOpenRecipe: (recipe: Recipe) => void;
  onAddRecipe: () => void;
  onNavigate: (key: TabKey) => void;
  onHome: () => void;
}) {
  const top = (
    <div
      className="bg-cream border-b border-line shrink-0"
    >
      <div className="px-5 pt-1 pb-2" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}>
        <MobileWordmark onHome={onHome} />
      </div>
      <div className="px-5 pb-3.5">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <Kicker className="mb-1 whitespace-nowrap">Le carnet maison</Kicker>
          <div className="font-display text-[28px] text-ink">Recettes</div>
        </div>
        <button
          onClick={onAddRecipe}
          className="w-[42px] h-[42px] rounded-full bg-ember text-creamlight flex items-center justify-center shrink-0 border-0 cursor-pointer"
          aria-label="Ajouter une recette"
        >
          <Icon name="plus" size={20} strokeWidth={2.1} />
        </button>
      </div>
      <div className="flex items-center gap-3 border-b-[1.5px] border-ink pt-0.5 pb-2.5 mb-3.5">
        <Icon name="search" size={17} strokeWidth={1.6} className="text-muted shrink-0" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher une recette…"
          className="flex-1 bg-transparent outline-none text-[15px] text-ink placeholder:text-muted placeholder:italic"
        />
      </div>
      {allTags.length > 0 && (
        <div className="flex gap-5 overflow-x-auto">
          <button
            onClick={() => onTagChange(null)}
            className={[
              'font-label text-[11px] uppercase tracking-wide pb-1 bg-transparent border-0 cursor-pointer whitespace-nowrap',
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
              onClick={() => onTagChange(tag)}
              className={[
                'font-label text-[11px] uppercase tracking-wide pb-1 bg-transparent border-0 cursor-pointer whitespace-nowrap',
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
    </div>
  );

  return (
    <MobileScreen top={top} bottom={<MobileTabBar active="recettes" onNavigate={onNavigate} />}>
      <div className="px-5 pt-[18px] pb-2">
        {recipes.length === 0 ? (
          <div className="text-center py-12 text-muted italic">Aucune recette trouvée</div>
        ) : (
          recipes.map((r) => {
            const tag = r.tags[0] ?? 'Recette';
            const ingredients = r.ingredients.slice(0, 4).join(', ');
            return (
              <button
                key={r.id}
                onClick={() => onOpenRecipe(r)}
                className="block w-full text-left bg-cream border border-line mb-4 cursor-pointer"
              >
                <Thumb label="photo du plat" src={r.image} className="h-[150px] w-full" />
                <div className="px-4 pt-[15px] pb-[17px]">
                  <Kicker className="text-olive mb-1.5">{tag}</Kicker>
                  <div className="font-display text-[23px] text-ink mb-2.5">{r.title}</div>
                  <div className="font-label flex gap-2.5 text-ink-soft text-[10.5px] uppercase tracking-wide pb-2.5 border-b border-line-soft whitespace-nowrap">
                    <span>{r.cookingTime} min</span>
                    <span className="text-line">·</span>
                    <span>{r.servings} portions</span>
                  </div>
                  {ingredients && (
                    <div className="text-[14.5px] text-ink-soft italic mt-2.5 leading-[1.4]">
                      {ingredients}
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </MobileScreen>
  );
}

export function RecipeDetailMobile({
  recipe,
  onBack,
  onAddToPlan,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  onBack: () => void;
  onAddToPlan: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const tag = recipe.tags[0] ?? 'Recette';

  return (
    <MobileScreen top={<MobileTopBar back title="Recette" onBack={onBack} />}>
      <Thumb label="photo du plat" src={recipe.image} className="h-[190px] w-full shrink-0" />
      <div className="px-[22px] pt-5 pb-7">
        <Kicker className="text-olive mb-2.5">{tag}</Kicker>
        <h1 className="font-display text-[34px] text-ink m-0 mb-3">{recipe.title}</h1>
        <div className="font-label flex gap-3 text-ink-soft text-[11px] uppercase tracking-wide pb-4 border-b border-line">
          <span>{recipe.cookingTime} min</span>
          <span className="text-line">|</span>
          <span>{recipe.servings} portions</span>
        </div>

        <Kicker className="text-ink mt-5 mb-3">Ingrédients</Kicker>
        {recipe.ingredients.map((x, i) => (
          <div key={i} className="py-2.5 border-b border-line-soft text-[16px] text-ink-soft">
            {x}
          </div>
        ))}

        <Kicker className="text-ink mt-[22px] mb-3">Préparation</Kicker>
        {recipe.steps.map((x, i) => (
          <div
            key={i}
            className={`flex gap-4 py-3 ${i < recipe.steps.length - 1 ? 'border-b border-line-soft' : ''}`}
          >
            <div className="font-display text-2xl text-ember leading-none w-[30px] shrink-0">
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="text-[15.5px] text-ink-soft leading-[1.5]">{x}</div>
          </div>
        ))}

        <div className="flex gap-3 mt-[22px]">
          <button
            onClick={onAddToPlan}
            className="flex-1 inline-flex items-center justify-center gap-2 font-label text-[11px] font-semibold uppercase tracking-wide text-creamlight bg-ember py-3.5 border-0 cursor-pointer"
          >
            <Icon name="plus" size={15} strokeWidth={2} />
            Au planning
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 font-label text-[11px] font-semibold uppercase tracking-wide text-ink bg-transparent border border-ink py-3.5 px-[18px] cursor-pointer"
            aria-label="Modifier"
          >
            <Icon name="edit" size={15} strokeWidth={1.8} />
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center font-label text-[11px] font-semibold uppercase tracking-wide text-ember-dark bg-transparent border border-line py-3.5 px-[14px] cursor-pointer"
            aria-label="Supprimer"
          >
            <Icon name="trash" size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </MobileScreen>
  );
}

export function RecipeFormMobile({
  onBack,
  children,
}: {
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <MobileScreen top={<MobileTopBar back title="Recette" onBack={onBack} />}>
      <div className="px-5 py-6">{children}</div>
    </MobileScreen>
  );
}
