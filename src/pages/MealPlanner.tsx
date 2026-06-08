import React, { useEffect, useState } from 'react';
import { Recipe, MealSlot } from '../types/recipe';
import { localStorageHelper } from '../lib/supabase';
import { RecipeCard } from '../components/RecipeCard';
import { PlusIcon, XIcon, CalendarIcon } from 'lucide-react';

const DAYS = [
  { full: 'Lundi', short: 'Lun' },
  { full: 'Mardi', short: 'Mar' },
  { full: 'Mercredi', short: 'Mer' },
  { full: 'Jeudi', short: 'Jeu' },
  { full: 'Vendredi', short: 'Ven' },
  { full: 'Samedi', short: 'Sam' },
  { full: 'Dimanche', short: 'Dim' },
];
const MEALS = ['breakfast', 'lunch', 'dinner'] as const;
const MEAL_LABELS: Record<(typeof MEALS)[number], { full: string; short: string }> = {
  breakfast: { full: 'Petit-déj', short: 'Mat.' },
  lunch: { full: 'Déjeuner', short: 'Déj.' },
  dinner: { full: 'Dîner', short: 'Dîn.' },
};
export function MealPlanner() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealSlot[]>([]);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: number;
    meal: string;
  } | null>(null);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = () => {
    const loadedRecipes = localStorageHelper.getRecipes();
    const loadedMealPlan = localStorageHelper.getMealPlan();
    setRecipes(loadedRecipes);
    setMealPlan(loadedMealPlan);
  };
  const getRecipeForSlot = (day: number, meal: string): Recipe | null => {
    const slot = mealPlan.find(s => s.day === day && s.meal === meal);
    if (!slot?.recipeId) return null;
    return recipes.find(r => r.id === slot.recipeId) || null;
  };
  const handleSelectRecipe = (recipeId: string) => {
    if (!selectedSlot) return;
    const existingSlotIndex = mealPlan.findIndex(s => s.day === selectedSlot.day && s.meal === selectedSlot.meal);
    let updatedMealPlan;
    if (existingSlotIndex >= 0) {
      updatedMealPlan = [...mealPlan];
      updatedMealPlan[existingSlotIndex] = {
        ...updatedMealPlan[existingSlotIndex],
        recipeId
      };
    } else {
      updatedMealPlan = [...mealPlan, {
        day: selectedSlot.day,
        meal: selectedSlot.meal as 'breakfast' | 'lunch' | 'dinner',
        recipeId
      }];
    }
    setMealPlan(updatedMealPlan);
    localStorageHelper.saveMealPlan(updatedMealPlan);
    closeRecipeSelector();
  };
  const handleRemoveRecipe = (day: number, meal: string) => {
    const updatedMealPlan = mealPlan.map(slot => slot.day === day && slot.meal === meal ? {
      ...slot,
      recipeId: null
    } : slot);
    setMealPlan(updatedMealPlan);
    localStorageHelper.saveMealPlan(updatedMealPlan);
  };
  const openRecipeSelector = (day: number, meal: string) => {
    setSelectedSlot({
      day,
      meal
    });
    setSelectedTag(null);
    setShowRecipeSelector(true);
  };

  const closeRecipeSelector = () => {
    setShowRecipeSelector(false);
    setSelectedSlot(null);
    setSelectedTag(null);
  };

  const allTags = Array.from(new Set(recipes.flatMap(r => r.tags)));
  const filteredRecipes = selectedTag
    ? recipes.filter(r => r.tags.includes(selectedTag))
    : recipes;

  const renderMealSlot = (dayIndex: number, meal: (typeof MEALS)[number]) => {
    const recipe = getRecipeForSlot(dayIndex, meal);

    if (recipe) {
      return (
        <div className="relative group h-full">
          <div className="p-2 rounded-lg border border-gray-200 bg-white min-h-[3.5rem]">
            <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug">
              {recipe.title}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">{recipe.cookingTime} min</p>
          </div>
          <button
            onClick={() => handleRemoveRecipe(dayIndex, meal)}
            className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <XIcon className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => openRecipeSelector(dayIndex, meal)}
        className="w-full min-h-[3.5rem] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors group"
      >
        <PlusIcon className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
      </button>
    );
  };

  if (showRecipeSelector) {
    return <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sélectionner une recette</h2>
          <button onClick={closeRecipeSelector} className="p-2 hover:bg-gray-100 rounded-md">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {recipes.length === 0 ? <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Aucune recette disponible</p>
            <a href="/recipes" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Ajoutez d'abord des recettes à votre bibliothèque
            </a>
          </div> : <>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTag === null ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'}`}
                >
                  Toutes
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTag === tag ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            {filteredRecipes.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl">
                <p className="text-gray-500">Aucune recette avec cette étiquette</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} onClick={() => handleSelectRecipe(recipe.id)} />
                ))}
              </div>
            )}
          </>}
      </div>;
  }
  return <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planning</h1>
          <p className="text-gray-600 mt-1">Repas de la semaine</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
          <CalendarIcon className="w-4 h-4" />
          Cette semaine
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="bg-gray-50 p-2 sm:p-3 w-14 sm:w-24" />
              {MEALS.map(meal => (
                <th
                  key={meal}
                  className="bg-gray-50 p-2 sm:p-3 text-center font-semibold text-gray-900 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">{MEAL_LABELS[meal].full}</span>
                  <span className="sm:hidden">{MEAL_LABELS[meal].short}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, dayIndex) => (
              <tr
                key={day.full}
                className={dayIndex < DAYS.length - 1 ? 'border-b border-gray-200' : ''}
              >
                <td className="bg-gray-50 p-2 sm:p-3 font-medium text-gray-900 text-xs sm:text-sm align-middle">
                  <span className="hidden sm:inline">{day.full}</span>
                  <span className="sm:hidden">{day.short}</span>
                </td>
                {MEALS.map(meal => (
                  <td key={meal} className="p-1.5 sm:p-2 align-top">
                    {renderMealSlot(dayIndex, meal)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>;
}