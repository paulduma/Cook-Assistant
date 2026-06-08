import React, { useRef, useState } from 'react';
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
  const ingredientRefs = useRef<Array<HTMLInputElement | null>>([]);
  const stepRefs = useRef<Array<HTMLTextAreaElement | null>>([]);
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
  const focusNextIngredientLine = () => {
    const nextIndex = ingredients.length;
    addIngredient();
    setTimeout(() => {
      ingredientRefs.current[nextIndex]?.focus();
    }, 0);
  };
  const focusNextStepLine = () => {
    const nextIndex = steps.length;
    addStep();
    setTimeout(() => {
      stepRefs.current[nextIndex]?.focus();
    }, 0);
  };
  const handleIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== 'Enter') {
      return;
    }
    e.preventDefault();
    const isLastIngredient = index === ingredients.length - 1;
    if (isLastIngredient || ingredients[ingredients.length - 1].trim()) {
      focusNextIngredientLine();
    }
  };
  const handleStepKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number) => {
    if (e.key !== 'Enter') {
      return;
    }
    e.preventDefault();
    const isLastStep = index === steps.length - 1;
    if (isLastStep || steps[steps.length - 1].trim()) {
      focusNextStepLine();
    }
  };
  const preventEnterSubmit = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  return <form onSubmit={handleSubmit} onKeyDown={preventEnterSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre de la recette
        </label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL de l'image (optionnel)
        </label>
        <input type="url" value={image} onChange={e => setImage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temps de cuisson (min)
          </label>
          <input type="number" value={cookingTime} onChange={e => setCookingTime(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" min="1" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Portions
          </label>
          <input type="number" value={servings} onChange={e => setServings(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" min="1" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ingrédients
        </label>
        {ingredients.map((ingredient, index) => <div key={index} className="flex gap-2 mb-2">
            <input ref={el => ingredientRefs.current[index] = el} type="text" value={ingredient} onChange={e => updateIngredient(index, e.target.value)} onKeyDown={e => handleIngredientKeyDown(e, index)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="ex. : 2 tasses de farine" />
            <button type="button" onClick={() => removeIngredient(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
              <XIcon className="w-5 h-5" />
            </button>
          </div>)}
        <button type="button" onClick={addIngredient} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
          <PlusIcon className="w-4 h-4" />
          Ajouter un ingrédient
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        {steps.map((step, index) => <div key={index} className="flex gap-2 mb-2">
            <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-gray-100 rounded-md text-sm font-medium text-gray-600">
              {index + 1}
            </span>
            <textarea ref={el => stepRefs.current[index] = el} value={step} onChange={e => updateStep(index, e.target.value)} onKeyDown={e => handleStepKeyDown(e, index)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={2} placeholder="Décrivez cette étape..." />
            <button type="button" onClick={() => removeStep(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
              <XIcon className="w-5 h-5" />
            </button>
          </div>)}
        <button type="button" onClick={addStep} className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
          <PlusIcon className="w-4 h-4" />
          Ajouter une étape
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Étiquettes
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
          <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ajouter une étiquette..." />
          <button type="button" onClick={addTag} className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
            Ajouter
          </button>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
          Enregistrer la recette
        </button>
      </div>
    </form>;
}