import React, { useEffect, useState } from 'react';
import { Recipe, GroceryItem } from '../types/recipe';
import { localStorageHelper } from '../lib/supabase';
import { CheckIcon, CopyIcon, ShoppingCartIcon } from 'lucide-react';
export function GroceryList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [groupByRecipe, setGroupByRecipe] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    loadGroceryList();
  }, []);
  const loadGroceryList = () => {
    const loadedRecipes = localStorageHelper.getRecipes();
    const mealPlan = localStorageHelper.getMealPlan();
    const usedRecipeIds = new Set(mealPlan.filter(slot => slot.recipeId).map(slot => slot.recipeId));
    const usedRecipes = loadedRecipes.filter(r => usedRecipeIds.has(r.id));
    setRecipes(usedRecipes);
    // Combine ingredients
    const ingredientMap = new Map<string, string[]>();
    usedRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ingredient => {
        const normalized = ingredient.toLowerCase().trim();
        if (!ingredientMap.has(normalized)) {
          ingredientMap.set(normalized, []);
        }
        ingredientMap.get(normalized)!.push(recipe.title);
      });
    });
    const items: GroceryItem[] = Array.from(ingredientMap.entries()).map(([ingredient, recipeNames]) => ({
      ingredient,
      recipes: Array.from(new Set(recipeNames))
    }));
    setGroceryItems(items);
  };
  const categorizeIngredient = (ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    if (lower.includes('lettuce') || lower.includes('tomato') || lower.includes('onion') || lower.includes('pepper') || lower.includes('carrot') || lower.includes('spinach')) {
      return 'Produce';
    }
    if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || lower.includes('butter') || lower.includes('cream')) {
      return 'Dairy';
    }
    if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || lower.includes('fish') || lower.includes('turkey')) {
      return 'Meat & Seafood';
    }
    if (lower.includes('bread') || lower.includes('pasta') || lower.includes('rice') || lower.includes('flour') || lower.includes('cereal')) {
      return 'Grains & Bakery';
    }
    return 'Pantry';
  };
  const groupedByCategory = () => {
    const categories = new Map<string, GroceryItem[]>();
    groceryItems.forEach(item => {
      const category = categorizeIngredient(item.ingredient);
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(item);
    });
    return Array.from(categories.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  };
  const copyToClipboard = () => {
    let text = 'Grocery List\n\n';
    if (groupByRecipe) {
      recipes.forEach(recipe => {
        text += `${recipe.title}:\n`;
        recipe.ingredients.forEach(ing => {
          text += `  • ${ing}\n`;
        });
        text += '\n';
      });
    } else {
      groupedByCategory().forEach(([category, items]) => {
        text += `${category}:\n`;
        items.forEach(item => {
          text += `  • ${item.ingredient}\n`;
        });
        text += '\n';
      });
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  if (groceryItems.length === 0) {
    return <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grocery List</h1>
            <p className="text-gray-600 mt-1">
              Generated from your meal planner (0 unique ingredients)
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium">
              <CheckIcon className="w-4 h-4" />
              By Category
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">
              By Recipe
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium">
              <CopyIcon className="w-4 h-4" />
              Copy List
            </button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No ingredients found
          </h3>
          <p className="text-gray-600">
            Add some recipes to your meal planner to generate a grocery list.
          </p>
        </div>
      </div>;
  }
  return <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grocery List</h1>
          <p className="text-gray-600 mt-1">
            Generated from your meal planner ({groceryItems.length} unique
            ingredients)
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setGroupByRecipe(false)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${!groupByRecipe ? 'bg-emerald-500 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <CheckIcon className="w-4 h-4" />
            By Category
          </button>
          <button onClick={() => setGroupByRecipe(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${groupByRecipe ? 'bg-emerald-500 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            By Recipe
          </button>
          <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium">
            {copied ? <>
                <CheckIcon className="w-4 h-4" />
                Copied!
              </> : <>
                <CopyIcon className="w-4 h-4" />
                Copy List
              </>}
          </button>
        </div>
      </div>
      {groupByRecipe ? <div className="space-y-6">
          {recipes.map(recipe => <div key={recipe.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {recipe.title}
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => <li key={index} className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>)}
              </ul>
            </div>)}
        </div> : <div className="space-y-6">
          {groupedByCategory().map(([category, items]) => <div key={category} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {category}
              </h2>
              <ul className="space-y-2">
                {items.map((item, index) => <li key={index} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span className="text-gray-700 capitalize">
                        {item.ingredient}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({item.recipes.length} recipe
                      {item.recipes.length > 1 ? 's' : ''})
                    </span>
                  </li>)}
              </ul>
            </div>)}
        </div>}
    </div>;
}