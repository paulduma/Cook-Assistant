import React, { useState } from 'react';
import { Recipe } from '../types/recipe';
import { XIcon, PlusIcon } from 'lucide-react';
interface RecipeFormProps {
  recipe?: Recipe;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}
export function RecipeForm({
  recipe,
  onSave,
  onCancel
}: RecipeFormProps) {
  const [title, setTitle] = useState(recipe?.title || '');
  const [image, setImage] = useState(recipe?.image || '');
  const [ingredients, setIngredients] = useState<string[]>(recipe?.ingredients || ['']);
  const [steps, setSteps] = useState<string[]>(recipe?.steps || ['']);
  const [cookingTime, setCookingTime] = useState(recipe?.cookingTime || 30);
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [tags, setTags] = useState<string[]>(recipe?.tags || []);
  const [newTag, setNewTag] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      image: image || undefined,
      ingredients: ingredients.filter(i => i.trim()),
      steps: steps.filter(s => s.trim()),
      cookingTime,
      servings,
      tags
    });
  };
  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (index: number) => setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };
  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));
  return <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recipe Title
        </label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URL (optional)
        </label>
        <input type="url" value={image} onChange={e => setImage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cooking Time (min)
          </label>
          <input type="number" value={cookingTime} onChange={e => setCookingTime(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" min="1" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Servings
          </label>
          <input type="number" value={servings} onChange={e => setServings(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" min="1" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingredients
        </label>
        {ingredients.map((ingredient, index) => <div key={index} className="flex gap-2 mb-2">
            <input type="text" value={ingredient} onChange={e => updateIngredient(index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., 2 cups flour" />
            <button type="button" onClick={() => removeIngredient(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
              <XIcon className="w-5 h-5" />
            </button>
          </div>)}
        <button type="button" onClick={addIngredient} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
          <PlusIcon className="w-4 h-4" />
          Add Ingredient
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Steps
        </label>
        {steps.map((step, index) => <div key={index} className="flex gap-2 mb-2">
            <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-gray-100 rounded-md text-sm font-medium text-gray-600">
              {index + 1}
            </span>
            <textarea value={step} onChange={e => updateStep(index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={2} placeholder="Describe this step..." />
            <button type="button" onClick={() => removeStep(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
              <XIcon className="w-5 h-5" />
            </button>
          </div>)}
        <button type="button" onClick={addStep} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
          <PlusIcon className="w-4 h-4" />
          Add Step
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-emerald-900">
                <XIcon className="w-3 h-3" />
              </button>
            </span>)}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Add a tag..." />
          <button type="button" onClick={addTag} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
            Add
          </button>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
          Save Recipe
        </button>
      </div>
    </form>;
}