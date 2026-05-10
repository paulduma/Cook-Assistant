import React, { useEffect, useState } from 'react';
import { Recipe, GroceryItem } from '../types/recipe';
import { localStorageHelper } from '../lib/supabase';
import { CheckIcon, CopyIcon, PlusIcon, ShoppingCartIcon, XIcon } from 'lucide-react';

export function GroceryList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [groupByRecipe, setGroupByRecipe] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newExtraItem, setNewExtraItem] = useState('');

  useEffect(() => {
    loadGroceryList();
  }, []);

  const loadGroceryList = () => {
    const loadedRecipes = localStorageHelper.getRecipes();
    const mealPlan = localStorageHelper.getMealPlan();
    const extraRaw = localStorageHelper.getExtraGroceryItems();
    const usedRecipeIds = new Set(mealPlan.filter(slot => slot.recipeId).map(slot => slot.recipeId));
    const usedRecipes = loadedRecipes.filter(r => usedRecipeIds.has(r.id));
    setRecipes(usedRecipes);

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
    const recipeKeys = new Set(ingredientMap.keys());

    const items: GroceryItem[] = Array.from(ingredientMap.entries()).map(([ingredient, recipeNames]) => ({
      ingredient,
      recipes: Array.from(new Set(recipeNames))
    }));

    const seenExtraNorm = new Set<string>();
    extraRaw.forEach(raw => {
      const trimmed = raw.trim();
      const norm = trimmed.toLowerCase();
      if (!norm || seenExtraNorm.has(norm)) {
        return;
      }
      if (recipeKeys.has(norm)) {
        return;
      }
      seenExtraNorm.add(norm);
      items.push({
        ingredient: trimmed,
        recipes: [],
        manual: true
      });
    });

    setGroceryItems(items);
  };

  const manualItems = groceryItems.filter(i => i.manual);
  const hasPlanIngredients = recipes.length > 0;
  const hasManualItems = manualItems.length > 0;

  const addExtraItem = () => {
    const trimmed = newExtraItem.trim();
    if (!trimmed) {
      return;
    }
    const extras = localStorageHelper.getExtraGroceryItems();
    const norm = trimmed.toLowerCase();
    if (extras.some(e => e.toLowerCase().trim() === norm)) {
      setNewExtraItem('');
      return;
    }
    localStorageHelper.saveExtraGroceryItems([...extras, trimmed]);
    setNewExtraItem('');
    loadGroceryList();
  };

  const removeManualItem = (ingredient: string) => {
    const norm = ingredient.toLowerCase().trim();
    const extras = localStorageHelper.getExtraGroceryItems();
    const idx = extras.findIndex(e => e.toLowerCase().trim() === norm);
    if (idx >= 0) {
      const next = [...extras];
      next.splice(idx, 1);
      localStorageHelper.saveExtraGroceryItems(next);
      loadGroceryList();
    }
  };

  const categorizeIngredient = (ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    if (lower.includes('lettuce') || lower.includes('tomato') || lower.includes('onion') || lower.includes('pepper') || lower.includes('carrot') || lower.includes('spinach') || lower.includes('salade') || lower.includes('tomate') || lower.includes('oignon') || lower.includes('poivron') || lower.includes('carotte') || lower.includes('epinard') || lower.includes('épinard')) {
      return 'Fruits et légumes';
    }
    if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || lower.includes('butter') || lower.includes('cream') || lower.includes('lait') || lower.includes('fromage') || lower.includes('yaourt') || lower.includes('beurre') || lower.includes('creme') || lower.includes('crème')) {
      return 'Produits laitiers';
    }
    if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || lower.includes('fish') || lower.includes('turkey') || lower.includes('poulet') || lower.includes('boeuf') || lower.includes('bœuf') || lower.includes('porc') || lower.includes('poisson') || lower.includes('dinde')) {
      return 'Viandes et poissons';
    }
    if (lower.includes('bread') || lower.includes('pasta') || lower.includes('rice') || lower.includes('flour') || lower.includes('cereal') || lower.includes('pain') || lower.includes('pates') || lower.includes('pâtes') || lower.includes('riz') || lower.includes('farine') || lower.includes('cereale') || lower.includes('céréale')) {
      return 'Céréales et boulangerie';
    }
    return 'Épicerie';
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
    let text = 'Liste de courses\n\n';
    if (groupByRecipe) {
      recipes.forEach(recipe => {
        text += `${recipe.title}:\n`;
        recipe.ingredients.forEach(ing => {
          text += `  • ${ing}\n`;
        });
        text += '\n';
      });
      if (hasManualItems) {
        text += 'Articles ajoutés:\n';
        manualItems.forEach(item => {
          text += `  • ${item.ingredient}\n`;
        });
        text += '\n';
      }
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

  const listSubtitle = () => {
    if (hasPlanIngredients && hasManualItems) {
      return `Planning et articles ajoutés (${groceryItems.length} ligne${groceryItems.length > 1 ? 's' : ''})`;
    }
    if (hasPlanIngredients) {
      return `Générée depuis votre planning de repas (${groceryItems.length} ingrédient${groceryItems.length > 1 ? 's' : ''} unique${groceryItems.length > 1 ? 's' : ''})`;
    }
    if (hasManualItems) {
      return `${groceryItems.length} article${groceryItems.length > 1 ? 's' : ''} ajouté${groceryItems.length > 1 ? 's' : ''}`;
    }
    return '';
  };

  const showEmptyState = groceryItems.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Liste de courses</h1>
          <p className="text-gray-600 mt-1">
            {showEmptyState ? 'Générée depuis le planning de repas et vos ajouts' : listSubtitle()}
          </p>
        </div>
        {!showEmptyState && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setGroupByRecipe(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${!groupByRecipe ? 'bg-emerald-500 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <CheckIcon className="w-4 h-4" />
              Par catégorie
            </button>
            <button
              type="button"
              onClick={() => setGroupByRecipe(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${groupByRecipe ? 'bg-emerald-500 text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              Par recette
            </button>
            <button
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Copié !
                </>
              ) : (
                <>
                  <CopyIcon className="w-4 h-4" />
                  Copier la liste
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
        <label htmlFor="extra-grocery" className="block text-sm font-medium text-gray-700 mb-2">
          Ajouter un article à la liste
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="extra-grocery"
            type="text"
            value={newExtraItem}
            onChange={e => setNewExtraItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addExtraItem())}
            placeholder="ex. : papier toilette, café..."
            className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
          <button
            type="button"
            onClick={addExtraItem}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shrink-0"
          >
            <PlusIcon className="w-5 h-5" />
            Ajouter
          </button>
        </div>
      </div>

      {showEmptyState ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Liste vide pour l’instant</h3>
          <p className="text-gray-600">
            Ajoutez des recettes au planning pour remplir la liste, ou saisissez des articles ci-dessus.
          </p>
        </div>
      ) : groupByRecipe ? (
        <div className="space-y-6">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{recipe.title}</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {hasManualItems && (
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-emerald-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Articles ajoutés</h2>
              <ul className="space-y-2">
                {manualItems.map((item, index) => (
                  <li key={`manual-${index}`} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span className="text-gray-700">{item.ingredient}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeManualItem(item.ingredient)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md shrink-0"
                      aria-label="Retirer de la liste"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByCategory().map(([category, items]) => (
            <div key={category} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={`${category}-${index}`} className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-emerald-600 mt-1 shrink-0">•</span>
                      <span className="text-gray-700 capitalize">{item.ingredient}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.manual ? (
                        <span className="text-sm text-emerald-600">Ajout personnel</span>
                      ) : (
                        <span className="text-sm text-gray-500">
                          ({item.recipes.length} recette{item.recipes.length > 1 ? 's' : ''})
                        </span>
                      )}
                      {item.manual && (
                        <button
                          type="button"
                          onClick={() => removeManualItem(item.ingredient)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          aria-label="Retirer de la liste"
                        >
                          <XIcon className="w-4 h-5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
