import React, { useRef, useState } from 'react';
import { Recipe } from '../types/recipe';
import {
  IngredientLine,
  formatIngredients,
  parseIngredients,
} from '../lib/ingredients';
import { Kicker, Button, Field } from './ui/primitives';
import { Icon } from './ui/Icon';

interface RecipeFormProps {
  recipe?: Recipe;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const underlineInput =
  'flex-1 bg-transparent outline-none text-[17px] text-ink placeholder:text-muted placeholder:italic';

export function RecipeForm({ recipe, onSave, onCancel }: RecipeFormProps) {
  const [title, setTitle] = useState(recipe?.title || '');
  const [image, setImage] = useState(recipe?.image || '');
  const [ingredients, setIngredients] = useState<IngredientLine[]>(() =>
    parseIngredients(recipe?.ingredients || [''])
  );
  const [steps, setSteps] = useState<string[]>(recipe?.steps || ['']);
  const [cookingTime, setCookingTime] = useState(recipe?.cookingTime || 30);
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [tags, setTags] = useState<string[]>(recipe?.tags || []);
  const [newTag, setNewTag] = useState('');
  const quantityRefs = useRef<Array<HTMLInputElement | null>>([]);
  const nameRefs = useRef<Array<HTMLInputElement | null>>([]);
  const stepRefs = useRef<Array<HTMLTextAreaElement | null>>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      image: image || undefined,
      ingredients: formatIngredients(ingredients),
      steps: steps.filter((s) => s.trim()),
      cookingTime,
      servings,
      tags,
    });
  };

  const addIngredient = () => setIngredients([...ingredients, { quantity: '', name: '' }]);
  const removeIngredient = (index: number) =>
    setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (
    index: number,
    field: keyof IngredientLine,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const isIngredientLineFilled = (line: IngredientLine) =>
    line.quantity.trim() || line.name.trim();

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

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const focusNextIngredientLine = () => {
    const nextIndex = ingredients.length;
    addIngredient();
    setTimeout(() => {
      quantityRefs.current[nextIndex]?.focus();
    }, 0);
  };

  const focusNextStepLine = () => {
    const nextIndex = steps.length;
    addStep();
    setTimeout(() => {
      stepRefs.current[nextIndex]?.focus();
    }, 0);
  };

  const handleQuantityKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    nameRefs.current[index]?.focus();
  };

  const handleNameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const isLastIngredient = index === ingredients.length - 1;
    const lastLine = ingredients[ingredients.length - 1];
    if (isLastIngredient || isIngredientLineFilled(lastLine)) {
      focusNextIngredientLine();
    }
  };

  const handleStepKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const isLastStep = index === steps.length - 1;
    if (isLastStep || steps[steps.length - 1].trim()) {
      focusNextStepLine();
    }
  };

  const preventEnterSubmit = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} onKeyDown={preventEnterSubmit}>
      <Kicker className="mb-2.5">{recipe ? 'Édition' : 'Nouvelle recette'}</Kicker>
      <h1 className="font-display text-[34px] sm:text-[44px] text-ink m-0 mb-7">
        {recipe ? 'Modifier la recette' : 'Ajouter une recette'}
      </h1>

      <Field label="Titre de la recette" value={title} onChange={setTitle} required />
      <Field
        label="URL de l'image (optionnel)"
        value={image}
        placeholder="https://…"
        onChange={setImage}
      />

      <div className="flex flex-col sm:flex-row gap-7">
        <div className="flex-1">
          <Field
            label="Temps de cuisson (min)"
            value={String(cookingTime)}
            onChange={(v) => setCookingTime(Number(v) || 1)}
          />
        </div>
        <div className="flex-1">
          <Field
            label="Portions"
            value={String(servings)}
            onChange={(v) => setServings(Number(v) || 1)}
          />
        </div>
      </div>

      <Kicker className="text-ink-soft mt-1 mb-3">Ingrédients</Kicker>
      <div className="flex gap-3.5 mb-2 font-label text-[10px] uppercase tracking-wide text-muted">
        <span className="w-24 sm:w-28 shrink-0">Quantité</span>
        <span className="flex-1">Ingrédient</span>
        <span className="w-[17px] shrink-0" aria-hidden="true" />
      </div>
      {ingredients.map((ingredient, index) => (
        <div
          key={index}
          className="flex items-center gap-3.5 mb-1.5 border-b border-line-soft py-2"
        >
          <input
            ref={(el) => {
              quantityRefs.current[index] = el;
            }}
            type="text"
            value={ingredient.quantity}
            onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
            onKeyDown={(e) => handleQuantityKeyDown(e, index)}
            className={`${underlineInput} w-24 sm:w-28 shrink-0`}
            placeholder="400 g"
          />
          <input
            ref={(el) => {
              nameRefs.current[index] = el;
            }}
            type="text"
            value={ingredient.name}
            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
            onKeyDown={(e) => handleNameKeyDown(e, index)}
            className={underlineInput}
            placeholder="pâtes"
          />
          <button
            type="button"
            onClick={() => removeIngredient(index)}
            className="text-ember-dark cursor-pointer bg-transparent border-0 shrink-0"
          >
            <Icon name="x" size={17} strokeWidth={1.9} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addIngredient}
        className="inline-flex items-center gap-2 font-label text-[12px] font-semibold uppercase tracking-wide text-ember mt-3.5 mb-7 cursor-pointer bg-transparent border-0"
      >
        <Icon name="plus" size={16} strokeWidth={2} />
        Ajouter un ingrédient
      </button>

      <Kicker className="text-ink-soft mb-3.5">Étapes</Kicker>
      {steps.map((step, index) => (
        <div
          key={index}
          className="flex items-start gap-[18px] mb-2 border-b border-line-soft py-2"
        >
          <div className="font-display text-2xl text-ember leading-none w-[30px] shrink-0 pt-0.5">
            {String(index + 1).padStart(2, '0')}
          </div>
          <textarea
            ref={(el) => {
              stepRefs.current[index] = el;
            }}
            value={step}
            onChange={(e) => updateStep(index, e.target.value)}
            onKeyDown={(e) => handleStepKeyDown(e, index)}
            className={`${underlineInput} resize-none min-h-[28px] pt-0.5`}
            rows={2}
            placeholder="Décrivez cette étape…"
          />
          <button
            type="button"
            onClick={() => removeStep(index)}
            className="text-ember-dark cursor-pointer bg-transparent border-0 mt-1 shrink-0"
          >
            <Icon name="x" size={17} strokeWidth={1.9} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addStep}
        className="inline-flex items-center gap-2 font-label text-[12px] font-semibold uppercase tracking-wide text-ember mt-3.5 mb-7 cursor-pointer bg-transparent border-0"
      >
        <Icon name="plus" size={16} strokeWidth={2} />
        Ajouter une étape
      </button>

      <Kicker className="text-ink-soft mb-3">Étiquettes</Kicker>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 font-label text-[11px] uppercase tracking-wide text-olive border border-line px-3 py-1.5"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-ember-dark bg-transparent border-0 cursor-pointer p-0"
              >
                <Icon name="x" size={12} strokeWidth={2} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 border-b-[1.5px] border-line pb-2 mb-8">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          className={`${underlineInput} text-[16px]`}
          placeholder="Ajouter une étiquette…"
        />
        <Button type="button" variant="ghost" icon="plus" onClick={addTag}>
          Ajouter
        </Button>
      </div>

      <div className="flex flex-wrap gap-3.5 mt-8">
        <Button type="submit" variant="solid">
          Enregistrer
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
