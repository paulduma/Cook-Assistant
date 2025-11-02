import React, { useEffect, useState } from 'react';
import { Recipe } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeForm } from '../components/RecipeForm';
import { localStorageHelper } from '../lib/supabase';
import { PlusIcon, SearchIcon, XIcon } from 'lucide-react';
export function RecipeLibrary() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
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
      filtered = filtered.filter(recipe => recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    }
    if (selectedTag) {
      filtered = filtered.filter(recipe => recipe.tags.includes(selectedTag));
    }
    setFilteredRecipes(filtered);
  };
  const handleSaveRecipe = (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (editingRecipe) {
      const updatedRecipes = recipes.map(r => r.id === editingRecipe.id ? {
        ...recipeData,
        id: editingRecipe.id,
        createdAt: editingRecipe.createdAt
      } : r);
      setRecipes(updatedRecipes);
      localStorageHelper.saveRecipes(updatedRecipes);
    } else {
      const newRecipe: Recipe = {
        ...recipeData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      const updatedRecipes = [...recipes, newRecipe];
      setRecipes(updatedRecipes);
      localStorageHelper.saveRecipes(updatedRecipes);
    }
    setShowForm(false);
    setEditingRecipe(null);
  };
  const handleDeleteRecipe = (id: string) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      const updatedRecipes = recipes.filter(r => r.id !== id);
      setRecipes(updatedRecipes);
      localStorageHelper.saveRecipes(updatedRecipes);
      setSelectedRecipe(null);
    }
  };
  const allTags = Array.from(new Set(recipes.flatMap(r => r.tags)));
  if (showForm) {
    return <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
        </h2>
        <RecipeForm recipe={editingRecipe || undefined} onSave={handleSaveRecipe} onCancel={() => {
        setShowForm(false);
        setEditingRecipe(null);
      }} />
      </div>;
  }
  if (selectedRecipe) {
    return <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => setSelectedRecipe(null)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <XIcon className="w-5 h-5" />
          Back to Library
        </button>
        {selectedRecipe.image && <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full h-64 object-cover rounded-lg mb-6" />}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedRecipe.title}
            </h1>
            <div className="flex gap-4 text-gray-600">
              <span>{selectedRecipe.cookingTime} minutes</span>
              <span>•</span>
              <span>{selectedRecipe.servings} servings</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => {
            setEditingRecipe(selectedRecipe);
            setShowForm(true);
          }} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Edit
            </button>
            <button onClick={() => handleDeleteRecipe(selectedRecipe.id)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {selectedRecipe.tags.map(tag => <span key={tag} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
              {tag}
            </span>)}
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ingredients
            </h2>
            <ul className="space-y-2">
              {selectedRecipe.ingredients.map((ingredient, index) => <li key={index} className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span className="text-gray-700">{ingredient}</span>
                </li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Instructions
            </h2>
            <ol className="space-y-4">
              {selectedRecipe.steps.map((step, index) => <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-emerald-600 text-white rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>)}
            </ol>
          </div>
        </div>
      </div>;
  }
  return <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipe Library</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your favorite recipes
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors">
          <PlusIcon className="w-5 h-5" />
          Add Recipe
        </button>
      </div>
      <div className="mb-6 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search recipes..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        {allTags.length > 0 && <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedTag(null)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTag === null ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'}`}>
              All Recipes
            </button>
            {allTags.map(tag => <button key={tag} onClick={() => setSelectedTag(tag)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTag === tag ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-500'}`}>
                {tag}
              </button>)}
          </div>}
      </div>
      {filteredRecipes.length === 0 ? <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg mb-4">No recipes found</p>
          <button onClick={() => setShowForm(true)} className="text-emerald-600 hover:text-emerald-700 font-medium">
            Add your first recipe
          </button>
        </div> : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />)}
        </div>}
    </div>;
}