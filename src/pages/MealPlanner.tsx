import React, { useEffect, useState } from 'react';
import { Recipe, MealSlot } from '../types/recipe';
import { localStorageHelper } from '../lib/supabase';
import { RecipeCard } from '../components/RecipeCard';
import { PlusIcon, XIcon, CalendarIcon } from 'lucide-react';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'] as const;
export function MealPlanner() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealSlot[]>([]);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
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
    setShowRecipeSelector(false);
    setSelectedSlot(null);
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
    setShowRecipeSelector(true);
  };
  if (showRecipeSelector) {
    return <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Select a Recipe</h2>
          <button onClick={() => {
          setShowRecipeSelector(false);
          setSelectedSlot(null);
        }} className="p-2 hover:bg-gray-100 rounded-md">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        {recipes.length === 0 ? <div className="text-center py-16">
            <p className="text-gray-500 mb-4">No recipes available</p>
            <a href="/recipes" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Add recipes to your library first
            </a>
          </div> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} onClick={() => handleSelectRecipe(recipe.id)} />)}
          </div>}
      </div>;
  }
  return <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
          <p className="text-gray-600 mt-1">Plan your meals for the week</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
          <CalendarIcon className="w-4 h-4" />
          This Week
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="bg-gray-50 p-4 text-left font-semibold text-gray-900 w-32"></th>
                {DAYS.map(day => <th key={day} className="bg-gray-50 p-4 text-center font-semibold text-gray-900 min-w-[180px]">
                    {day}
                  </th>)}
              </tr>
            </thead>
            <tbody>
              {MEALS.map((meal, mealIndex) => <tr key={meal} className={mealIndex < MEALS.length - 1 ? 'border-b border-gray-200' : ''}>
                  <td className="bg-gray-50 p-4 font-medium text-gray-900 capitalize">
                    {meal}
                  </td>
                  {DAYS.map((_, dayIndex) => {
                const recipe = getRecipeForSlot(dayIndex, meal);
                return <td key={dayIndex} className="p-3">
                        {recipe ? <div className="relative group">
                            <RecipeCard recipe={recipe} compact />
                            <button onClick={() => handleRemoveRecipe(dayIndex, meal)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <XIcon className="w-3 h-3" />
                            </button>
                          </div> : <button onClick={() => openRecipeSelector(dayIndex, meal)} className="w-full h-20 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors group">
                            <PlusIcon className="w-6 h-6 text-gray-400 group-hover:text-emerald-600" />
                          </button>}
                      </td>;
              })}
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}