import React from 'react';
import { Recipe } from '../types/recipe';
import { ClockIcon, UsersIcon } from 'lucide-react';
interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
  compact?: boolean;
}
export function RecipeCard({
  recipe,
  onClick,
  compact = false
}: RecipeCardProps) {
  if (compact) {
    return <div onClick={onClick} className={`bg-white rounded-lg border border-gray-200 overflow-hidden flex ${onClick ? 'cursor-pointer hover:border-emerald-500 transition-colors' : ''}`}>
        {recipe.image && <img src={recipe.image} alt={recipe.title} className="w-20 h-20 object-cover flex-shrink-0" />}
        <div className="p-3 flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-3 text-gray-500 text-xs">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              <span>{recipe.cookingTime}m</span>
            </div>
            <div className="flex items-center gap-1">
              <UsersIcon className="w-3 h-3" />
              <span>{recipe.servings}</span>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div onClick={onClick} className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-emerald-500 transition-all' : ''}`}>
      {recipe.image ? <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
          <span className="text-4xl">🍽️</span>
        </div>}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-3">
          {recipe.title}
        </h3>
        <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
          <div className="flex items-center gap-1.5">
            <ClockIcon className="w-4 h-4" />
            <span>{recipe.cookingTime} minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UsersIcon className="w-4 h-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
        {recipe.tags.length > 0 && <div className="flex flex-wrap gap-2">
            {recipe.tags.slice(0, 3).map(tag => <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                {tag}
              </span>)}
            {recipe.tags.length > 3 && <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                +{recipe.tags.length - 3}
              </span>}
          </div>}
        {recipe.ingredients.length > 0 && <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 font-medium mb-1">
              Ingredients:
            </p>
            <p className="text-xs text-gray-500 line-clamp-2">
              {recipe.ingredients.slice(0, 3).join(', ')}
              {recipe.ingredients.length > 3 && '...'}
            </p>
          </div>}
      </div>
    </div>;
}