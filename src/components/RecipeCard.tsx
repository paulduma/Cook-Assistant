import { Recipe } from '../types/recipe';
import { Kicker, Thumb } from './ui/primitives';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const tag = recipe.tags[0] ?? 'Recette';
  const ingredientsPreview = recipe.ingredients.join(', ');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-cream border border-line ${onClick ? 'cursor-pointer hover:border-ink transition-colors' : ''}`}
    >
      <Thumb label="photo du plat" src={recipe.image} className="h-[150px] w-full" />
      <div className="px-[22px] pt-5 pb-[22px]">
        <Kicker className="text-olive mb-2.5">{tag}</Kicker>
        <div className="font-display text-[26px] text-ink leading-[1.1] mb-3">{recipe.title}</div>
        <div className="font-label flex gap-[18px] text-ink-soft text-[12px] uppercase tracking-wide pb-3.5 border-b border-line-soft whitespace-nowrap overflow-hidden">
          <span>{recipe.cookingTime} min</span>
          <span>·</span>
          <span>{recipe.servings} portions</span>
        </div>
        {ingredientsPreview && (
          <div className="text-[15px] text-ink-soft italic mt-3 leading-[1.4] line-clamp-2">
            {ingredientsPreview}
          </div>
        )}
      </div>
    </button>
  );
}
