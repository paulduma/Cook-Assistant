import React, { useEffect, useState } from 'react';
import { Recipe, GroceryItem } from '../types/recipe';
import { localStorageHelper } from '../lib/supabase';
import { Kicker, Button, SectionRule } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';

type DisplayItem = {
  key: string;
  name: string;
  note?: string;
  perso?: boolean;
  done: boolean;
  onRemove?: () => void;
};

function loadCheckedItems(): Set<string> {
  const raw = localStorage.getItem('groceryChecked');
  return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
}

function saveCheckedItems(checked: Set<string>) {
  localStorage.setItem('groceryChecked', JSON.stringify([...checked]));
}

function GroceryRow({
  item,
  onToggle,
}: {
  item: DisplayItem;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line-soft">
      <button
        onClick={() => onToggle(item.key)}
        className="flex items-center gap-3.5 bg-transparent border-0 cursor-pointer text-left flex-1 min-w-0"
      >
        <span
          className={[
            'w-[21px] h-[21px] rounded-full border-[1.6px] flex items-center justify-center shrink-0',
            item.done ? 'bg-ember border-ember text-creamlight' : 'border-line',
          ].join(' ')}
        >
          {item.done && <Icon name="check" size={12} strokeWidth={2.4} />}
        </span>
        <span
          className={[
            'text-[17px] capitalize',
            item.done ? 'text-muted line-through' : 'text-ink',
          ].join(' ')}
        >
          {item.name}
        </span>
      </button>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {item.perso ? (
          <span className="font-label text-[11px] uppercase tracking-wide text-olive">
            ajout perso
          </span>
        ) : (
          item.note && (
            <span className="font-label text-[11px] uppercase tracking-wide text-muted">
              {item.note}
            </span>
          )
        )}
        {item.onRemove && (
          <button
            onClick={item.onRemove}
            className="p-1 text-muted hover:text-ember bg-transparent border-0 cursor-pointer"
            aria-label="Retirer de la liste"
          >
            <Icon name="x" size={14} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

function AddItemForm({
  value,
  onChange,
  onAdd,
  compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  compact?: boolean;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd();
  };

  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2.5 border-[1.5px] border-ink pl-3.5 pr-2 py-2 mb-[22px]"
      >
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ajouter un article…"
          className="flex-1 bg-transparent outline-none text-[14.5px] text-ink placeholder:text-muted placeholder:italic"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 font-label text-[10.5px] font-semibold uppercase tracking-wide text-creamlight bg-ember px-3 py-2 border-0 cursor-pointer"
        >
          <Icon name="plus" size={13} strokeWidth={2.1} />
          Ajouter
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3.5 border-b-[1.5px] border-ink pb-3 mb-2"
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ex. : papier toilette, café, croquettes de Verdi…"
        className="flex-1 bg-transparent outline-none text-[16.5px] text-ink placeholder:text-muted placeholder:italic"
      />
      <Button type="submit" variant="solid" icon="plus">
        Ajouter
      </Button>
    </form>
  );
}

function ViewToggle({
  groupByRecipe,
  onChange,
  className = '',
}: {
  groupByRecipe: boolean;
  onChange: (byRecipe: boolean) => void;
  className?: string;
}) {
  return (
    <div className={`flex gap-6 border-b border-line ${className}`}>
      {(['Par catégorie', 'Par recette'] as const).map((label, i) => {
        const active = i === 0 ? !groupByRecipe : groupByRecipe;
        return (
          <button
            key={label}
            onClick={() => onChange(i === 1)}
            className={[
              'font-label text-[12px] font-semibold uppercase tracking-wide cursor-pointer pb-2.5 bg-transparent border-0',
              active
                ? 'text-ink border-b-[1.5px] border-ember'
                : 'text-muted border-b-[1.5px] border-transparent',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function GroceryList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [groupByRecipe, setGroupByRecipe] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newExtraItem, setNewExtraItem] = useState('');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(loadCheckedItems);

  useEffect(() => {
    loadGroceryList();
  }, []);

  const loadGroceryList = () => {
    const loadedRecipes = localStorageHelper.getRecipes();
    const mealPlan = localStorageHelper.getMealPlan();
    const extraRaw = localStorageHelper.getExtraGroceryItems();
    const usedRecipeIds = new Set(
      mealPlan.filter((slot) => slot.recipeId).map((slot) => slot.recipeId)
    );
    const usedRecipes = loadedRecipes.filter((r) => usedRecipeIds.has(r.id));
    setRecipes(usedRecipes);

    const ingredientMap = new Map<string, string[]>();
    usedRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const normalized = ingredient.toLowerCase().trim();
        if (!ingredientMap.has(normalized)) {
          ingredientMap.set(normalized, []);
        }
        ingredientMap.get(normalized)!.push(recipe.title);
      });
    });
    const recipeKeys = new Set(ingredientMap.keys());

    const items: GroceryItem[] = Array.from(ingredientMap.entries()).map(
      ([ingredient, recipeNames]) => ({
        ingredient,
        recipes: Array.from(new Set(recipeNames)),
      })
    );

    const seenExtraNorm = new Set<string>();
    extraRaw.forEach((raw) => {
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
        manual: true,
      });
    });

    setGroceryItems(items);
  };

  const manualItems = groceryItems.filter((i) => i.manual);
  const hasPlanIngredients = recipes.length > 0;
  const hasManualItems = manualItems.length > 0;

  const toggleItem = (key: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      saveCheckedItems(next);
      return next;
    });
  };

  const addExtraItem = () => {
    const trimmed = newExtraItem.trim();
    if (!trimmed) {
      return;
    }
    const extras = localStorageHelper.getExtraGroceryItems();
    const norm = trimmed.toLowerCase();
    if (extras.some((e) => e.toLowerCase().trim() === norm)) {
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
    const idx = extras.findIndex((e) => e.toLowerCase().trim() === norm);
    if (idx >= 0) {
      const next = [...extras];
      next.splice(idx, 1);
      localStorageHelper.saveExtraGroceryItems(next);
      setCheckedItems((prev) => {
        const updated = new Set(prev);
        updated.delete(norm);
        saveCheckedItems(updated);
        return updated;
      });
      loadGroceryList();
    }
  };

  const categorizeIngredient = (ingredient: string): string => {
    const lower = ingredient.toLowerCase();
    if (
      lower.includes('lettuce') ||
      lower.includes('tomato') ||
      lower.includes('onion') ||
      lower.includes('pepper') ||
      lower.includes('carrot') ||
      lower.includes('spinach') ||
      lower.includes('salade') ||
      lower.includes('tomate') ||
      lower.includes('oignon') ||
      lower.includes('poivron') ||
      lower.includes('carotte') ||
      lower.includes('epinard') ||
      lower.includes('épinard')
    ) {
      return 'Fruits et légumes';
    }
    if (
      lower.includes('milk') ||
      lower.includes('cheese') ||
      lower.includes('yogurt') ||
      lower.includes('butter') ||
      lower.includes('cream') ||
      lower.includes('lait') ||
      lower.includes('fromage') ||
      lower.includes('yaourt') ||
      lower.includes('beurre') ||
      lower.includes('creme') ||
      lower.includes('crème')
    ) {
      return 'Produits laitiers';
    }
    if (
      lower.includes('chicken') ||
      lower.includes('beef') ||
      lower.includes('pork') ||
      lower.includes('fish') ||
      lower.includes('turkey') ||
      lower.includes('poulet') ||
      lower.includes('boeuf') ||
      lower.includes('bœuf') ||
      lower.includes('porc') ||
      lower.includes('poisson') ||
      lower.includes('dinde')
    ) {
      return 'Viandes et poissons';
    }
    if (
      lower.includes('bread') ||
      lower.includes('pasta') ||
      lower.includes('rice') ||
      lower.includes('flour') ||
      lower.includes('cereal') ||
      lower.includes('pain') ||
      lower.includes('pates') ||
      lower.includes('pâtes') ||
      lower.includes('riz') ||
      lower.includes('farine') ||
      lower.includes('cereale') ||
      lower.includes('céréale')
    ) {
      return 'Céréales et boulangerie';
    }
    return 'Épicerie';
  };

  const groupedByCategory = () => {
    const categories = new Map<string, GroceryItem[]>();
    groceryItems.forEach((item) => {
      const category = categorizeIngredient(item.ingredient);
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(item);
    });
    return Array.from(categories.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const toDisplayItem = (item: GroceryItem): DisplayItem => {
    const key = item.ingredient.toLowerCase().trim();
    return {
      key,
      name: item.ingredient,
      note: item.manual
        ? undefined
        : `${item.recipes.length} recette${item.recipes.length > 1 ? 's' : ''}`,
      perso: item.manual,
      done: checkedItems.has(key),
      onRemove: item.manual ? () => removeManualItem(item.ingredient) : undefined,
    };
  };

  const copyToClipboard = () => {
    let text = 'Liste de courses\n\n';
    if (groupByRecipe) {
      recipes.forEach((recipe) => {
        text += `${recipe.title}:\n`;
        recipe.ingredients.forEach((ing) => {
          text += `  • ${ing}\n`;
        });
        text += '\n';
      });
      if (hasManualItems) {
        text += 'Articles ajoutés:\n';
        manualItems.forEach((item) => {
          text += `  • ${item.ingredient}\n`;
        });
        text += '\n';
      }
    } else {
      groupedByCategory().forEach(([category, items]) => {
        text += `${category}:\n`;
        items.forEach((item) => {
          text += `  • ${item.ingredient}\n`;
        });
        text += '\n';
      });
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const kickerText = () => {
    if (groceryItems.length === 0) {
      return 'Planning + ajouts';
    }
    if (hasPlanIngredients && hasManualItems) {
      return `Planning + ajouts · ${groceryItems.length} ligne${groceryItems.length > 1 ? 's' : ''}`;
    }
    if (hasPlanIngredients) {
      return `Planning · ${groceryItems.length} ingrédient${groceryItems.length > 1 ? 's' : ''}`;
    }
    return `${groceryItems.length} article${groceryItems.length > 1 ? 's' : ''} ajouté${groceryItems.length > 1 ? 's' : ''}`;
  };

  const showEmptyState = groceryItems.length === 0;

  const renderCategorySections = () =>
    groupedByCategory().map(([category, items]) => (
      <div key={category} className="mb-7 mt-7 first:mt-0">
        <SectionRule>{category}</SectionRule>
        {items.map((item) => (
          <GroceryRow
            key={item.ingredient}
            item={toDisplayItem(item)}
            onToggle={toggleItem}
          />
        ))}
      </div>
    ));

  const renderRecipeSections = () => (
    <>
      {recipes.map((recipe) => (
        <div key={recipe.id} className="mb-7 mt-7 first:mt-0">
          <SectionRule>{recipe.title}</SectionRule>
          {recipe.ingredients.map((ingredient, index) => {
            const key = ingredient.toLowerCase().trim();
            return (
              <GroceryRow
                key={`${recipe.id}-${index}`}
                item={{
                  key,
                  name: ingredient,
                  done: checkedItems.has(key),
                }}
                onToggle={toggleItem}
              />
            );
          })}
        </div>
      ))}
      {hasManualItems && (
        <div className="mb-7 mt-7">
          <SectionRule>Articles ajoutés</SectionRule>
          {manualItems.map((item) => (
            <GroceryRow
              key={item.ingredient}
              item={toDisplayItem(item)}
              onToggle={toggleItem}
            />
          ))}
        </div>
      )}
    </>
  );

  const renderListContent = () => {
    if (showEmptyState) {
      return (
        <div className="text-center py-16 border border-line bg-cream mt-7">
          <Icon name="cart" size={48} strokeWidth={1.4} className="text-muted mx-auto mb-4" />
          <h3 className="font-display text-[22px] text-ink mb-2">Liste vide pour l'instant</h3>
          <p className="text-ink-soft text-[15px] m-0 max-w-sm mx-auto leading-relaxed">
            Ajoutez des recettes au planning pour remplir la liste, ou saisissez des articles
            ci-dessus.
          </p>
        </div>
      );
    }
    return groupByRecipe ? renderRecipeSections() : renderCategorySections();
  };

  return (
    <div className="bg-paper min-h-full">
      {/* Desktop */}
      <div className="hidden md:block max-w-[800px] mx-auto px-11 py-10">
        <div className="flex items-end justify-between mb-2">
          <div>
            <Kicker className="mb-2.5">{kickerText()}</Kicker>
            <h1 className="font-display text-[46px] text-ink m-0">Liste de courses</h1>
          </div>
          {!showEmptyState && (
            <Button icon="copy" variant="outline" onClick={copyToClipboard}>
              {copied ? 'Copié !' : 'Copier la liste'}
            </Button>
          )}
        </div>

        <ViewToggle
          groupByRecipe={groupByRecipe}
          onChange={setGroupByRecipe}
          className="pt-4 mb-7"
        />

        <AddItemForm
          value={newExtraItem}
          onChange={setNewExtraItem}
          onAdd={addExtraItem}
        />

        {renderListContent()}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div
          className="bg-cream border-b border-line px-5"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <Kicker className="mb-1">{kickerText()}</Kicker>
              <div className="font-display text-[26px] text-ink">Liste de courses</div>
            </div>
            {!showEmptyState && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 text-ember bg-transparent border-0 cursor-pointer"
              >
                <Icon name="copy" size={18} strokeWidth={1.8} />
                <span className="font-label text-[10.5px] font-semibold uppercase tracking-wide">
                  {copied ? 'Copié !' : 'Copier'}
                </span>
              </button>
            )}
          </div>
          <ViewToggle
            groupByRecipe={groupByRecipe}
            onChange={setGroupByRecipe}
            className="gap-5 pb-0"
          />
        </div>

        <div className="px-5 pt-[18px] pb-8">
          <AddItemForm
            value={newExtraItem}
            onChange={setNewExtraItem}
            onAdd={addExtraItem}
            compact
          />
          {renderListContent()}
        </div>
      </div>
    </div>
  );
}
