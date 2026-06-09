import React, { useEffect, useState } from 'react';
import { Recipe } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeForm } from '../components/RecipeForm';
import { AddRecipeModal } from '../components/AddRecipeModal';
import { localStorageHelper } from '../lib/supabase';
import { Kicker, Button } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';
import { XIcon } from 'lucide-react';

export function RecipeLibrary() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchQuery, selectedTag]);

  const loadRecipes = () => {
    const loadedRecipes = localStorageHelper.getRecipes();
    setRecipes(loadedRecipes);
  };

  const filterRecipes = () => {
    let filtered = recipes;
    if (searchQuery) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (selectedTag) {
      filtered = filtered.filter((recipe) => recipe.tags.includes(selectedTag));
    }
    setFilteredRecipes(filtered);
  };

  const handleSaveRecipe = (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (editingRecipe) {
      const updatedRecipes = recipes.map((r) =>
        r.id === editingRecipe.id
          ? { ...recipeData, id: editingRecipe.id, createdAt: editingRecipe.createdAt }
          : r
      );
      setRecipes(updatedRecipes);
      localStorageHelper.saveRecipes(updatedRecipes);
    } else {
      const newRecipe: Recipe = {
        ...recipeData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updatedRecipes = [...recipes, newRecipe];
      setRecipes(updatedRecipes);
      localStorageHelper.saveRecipes(updatedRecipes);
    }
    setShowForm(false);
    setEditingRecipe(null);
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette recette ?')) {
      const updatedRecipes = recipes.filter((r) => r.id !== id);
      setRecipes(updatedRecipes);
      localStorageHelper.saveRecipes(updatedRecipes);
      setSelectedRecipe(null);
    }
  };

  const openBlankRecipeForm = () => {
    setShowAddModal(false);
    setEditingRecipe(null);
    setShowForm(true);
  };

  const allTags = Array.from(new Set(recipes.flatMap((r) => r.tags)));

  if (showForm) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {editingRecipe ? 'Modifier la recette' : 'Ajouter une recette'}
        </h2>
        <RecipeForm
          recipe={editingRecipe || undefined}
          onSave={handleSaveRecipe}
          onCancel={() => {
            setShowForm(false);
            setEditingRecipe(null);
          }}
        />
      </div>
    );
  }

  if (selectedRecipe) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedRecipe(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <XIcon className="w-5 h-5" />
          Retour à la bibliothèque
        </button>
        {selectedRecipe.image && (
          <img
            src={selectedRecipe.image}
            alt={selectedRecipe.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedRecipe.title}</h1>
            <div className="flex gap-4 text-gray-600">
              <span>{selectedRecipe.cookingTime} min</span>
              <span>•</span>
              <span>{selectedRecipe.servings} portions</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingRecipe(selectedRecipe);
                setShowForm(true);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Modifier
            </button>
            <button
              onClick={() => handleDeleteRecipe(selectedRecipe.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {selectedRecipe.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingrédients</h2>
            <ul className="space-y-2">
              {selectedRecipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span className="text-gray-700">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <ol className="space-y-4">
              {selectedRecipe.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-emerald-600 text-white rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-[calc(100vh-4rem)]">
      <div className="px-4 sm:px-[52px] py-8 sm:py-[42px]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-3.5">
          <div>
            <Kicker className="mb-2.5">Le carnet maison</Kicker>
            <h1 className="font-display text-[34px] sm:text-[46px] text-ink m-0">
              Bibliothèque de recettes
            </h1>
          </div>
          <Button icon="plus" variant="outline" onClick={() => setShowAddModal(true)}>
            Ajouter une recette
          </Button>
        </div>

        <div className="flex items-center gap-3 border-b-[1.5px] border-ink pt-1.5 pb-3 my-2 mb-[22px]">
          <Icon name="search" size={19} strokeWidth={1.6} className="text-muted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une recette…"
            className="flex-1 bg-transparent outline-none text-[16.5px] text-ink placeholder:text-muted placeholder:italic"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-5 sm:gap-7 mb-7">
            <button
              onClick={() => setSelectedTag(null)}
              className={[
                'font-label text-[12.5px] uppercase tracking-wide cursor-pointer pb-1 bg-transparent border-0',
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
                onClick={() => setSelectedTag(tag)}
                className={[
                  'font-label text-[12.5px] uppercase tracking-wide cursor-pointer pb-1 bg-transparent border-0',
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

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16 border border-line bg-cream">
            <p className="text-muted text-lg mb-4 italic">Aucune recette trouvée</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="font-label text-[12px] font-semibold uppercase tracking-wide text-ember hover:text-ember-dark"
            >
              Ajouter votre première recette
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[26px]">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
              />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddRecipeModal
          mode="import"
          onClose={() => setShowAddModal(false)}
          onCreateBlank={openBlankRecipeForm}
        />
      )}
    </div>
  );
}
