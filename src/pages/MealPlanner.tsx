import React, { useEffect, useState } from 'react';
import { Recipe, MealSlot } from '../types/recipe';
import { localStorageHelper } from '../lib/supabase';
import { AddRecipeModal, recipeToModalRecipe } from '../components/AddRecipeModal';
import { Kicker, Button } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';

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
const MEAL_LABELS: Record<(typeof MEALS)[number], string> = {
  breakfast: 'Petit-déjeuner',
  lunch: 'Déjeuner',
  dinner: 'Dîner',
};

function getWeekDates(): Date[] {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

export function MealPlanner() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealSlot[]>([]);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: number;
    meal: (typeof MEALS)[number];
  } | null>(null);
  const [mobileDay, setMobileDay] = useState(() => {
    const today = new Date().getDay();
    return today === 0 ? 6 : today - 1;
  });

  const weekDates = getWeekDates();

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
    const slot = mealPlan.find((s) => s.day === day && s.meal === meal);
    if (!slot?.recipeId) return null;
    return recipes.find((r) => r.id === slot.recipeId) || null;
  };

  const handleSelectRecipe = (recipeId: string) => {
    if (!selectedSlot) return;
    const existingSlotIndex = mealPlan.findIndex(
      (s) => s.day === selectedSlot.day && s.meal === selectedSlot.meal
    );
    let updatedMealPlan: MealSlot[];
    if (existingSlotIndex >= 0) {
      updatedMealPlan = [...mealPlan];
      updatedMealPlan[existingSlotIndex] = {
        ...updatedMealPlan[existingSlotIndex],
        recipeId,
      };
    } else {
      updatedMealPlan = [
        ...mealPlan,
        {
          day: selectedSlot.day,
          meal: selectedSlot.meal,
          recipeId,
        },
      ];
    }
    setMealPlan(updatedMealPlan);
    localStorageHelper.saveMealPlan(updatedMealPlan);
    closeRecipeSelector();
  };

  const handleRemoveRecipe = (day: number, meal: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedMealPlan = mealPlan.map((slot) =>
      slot.day === day && slot.meal === meal ? { ...slot, recipeId: null } : slot
    );
    setMealPlan(updatedMealPlan);
    localStorageHelper.saveMealPlan(updatedMealPlan);
  };

  const openRecipeSelector = (day: number, meal: (typeof MEALS)[number]) => {
    setSelectedSlot({ day, meal });
    setShowRecipeSelector(true);
  };

  const closeRecipeSelector = () => {
    setShowRecipeSelector(false);
    setSelectedSlot(null);
  };

  const renderFilledSlot = (recipe: Recipe, day: number, meal: string, compact = false) => (
    <div className="relative group w-full h-full">
      <div
        className={[
          'w-full h-full text-left border-l-[3px] border-ember bg-transparent',
          compact ? 'px-4 py-3.5 bg-cream border border-line' : 'px-3.5 flex flex-col justify-center',
        ].join(' ')}
      >
        <div
          className={[
            'font-display text-ink leading-[1.1]',
            compact ? 'text-[19px]' : 'text-[16px]',
          ].join(' ')}
        >
          {recipe.title}
        </div>
        <div className="font-label text-[10px] uppercase tracking-wide text-muted mt-1">
          {recipe.cookingTime} min · {recipe.servings} p.
        </div>
      </div>
      <button
        onClick={(e) => handleRemoveRecipe(day, meal, e)}
        className="absolute top-1.5 right-1.5 p-1 text-muted hover:text-ember bg-cream border border-line rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        aria-label="Retirer du planning"
      >
        <Icon name="x" size={12} strokeWidth={2} />
      </button>
    </div>
  );

  const renderEmptySlot = (
    day: number,
    meal: (typeof MEALS)[number],
    compact = false
  ) => (
    <button
      onClick={() => openRecipeSelector(day, meal)}
      className={[
        'w-full flex items-center justify-center text-muted hover:text-ember bg-transparent border-0 cursor-pointer',
        compact
          ? 'gap-2 border-[1.5px] border-dashed border-line py-4'
          : 'h-full',
      ].join(' ')}
    >
      <Icon name="plus" size={compact ? 17 : 18} strokeWidth={compact ? 1.8 : 1.7} />
      {compact && (
        <span className="font-label text-[11px] uppercase tracking-wide">Ajouter un repas</span>
      )}
    </button>
  );

  const selectedDate = weekDates[mobileDay];

  return (
    <div className="bg-paper min-h-full">
      {/* Desktop */}
      <div className="hidden md:block px-[52px] py-[42px]">
        <div className="flex items-end justify-between mb-7">
          <div>
            <Kicker className="mb-2.5">Repas de la semaine</Kicker>
            <h1 className="font-display text-[46px] text-ink m-0">Planning</h1>
          </div>
          <Button icon="calendar" variant="outline">
            Cette semaine
          </Button>
        </div>

        <div className="bg-cream border border-line">
          <div className="flex border-b border-line">
            <div className="w-[150px] shrink-0" />
            {DAYS.map((d) => (
              <div
                key={d.short}
                className="flex-1 text-center py-4 border-l border-line font-label text-[12.5px] font-semibold uppercase tracking-wide text-ink"
              >
                {d.short}
              </div>
            ))}
          </div>

          {MEALS.map((meal, mi) => (
            <div
              key={meal}
              className={`flex items-stretch ${mi < MEALS.length - 1 ? 'border-b border-line' : ''}`}
            >
              <div className="w-[150px] shrink-0 flex items-center px-5 font-display text-[18px] text-ink">
                {MEAL_LABELS[meal]}
              </div>
              {DAYS.map((d, di) => {
                const recipe = getRecipeForSlot(di, meal);
                return (
                  <div
                    key={d.short}
                    className="flex-1 h-[80px] -ml-px border-l border-line flex items-center justify-center"
                  >
                    {recipe ? renderFilledSlot(recipe, di, meal) : renderEmptySlot(di, meal)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div
          className="bg-cream border-b border-line"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}
        >
          <div className="px-5 pb-3">
            <Kicker className="mb-1">Repas de la semaine</Kicker>
            <div className="font-display text-[28px] text-ink">Planning</div>
          </div>
          <div className="flex gap-1.5 px-3.5 pb-3">
            {DAYS.map((d, i) => {
              const on = i === mobileDay;
              const dateNum = weekDates[i].getDate();
              return (
                <button
                  key={d.short}
                  onClick={() => setMobileDay(i)}
                  className={`flex-1 text-center py-2 rounded-xl border-0 cursor-pointer ${on ? 'bg-ember' : 'bg-transparent'}`}
                >
                  <div
                    className={[
                      'font-label text-[9.5px] font-semibold uppercase tracking-wide',
                      on ? 'text-creamlight' : 'text-muted',
                    ].join(' ')}
                  >
                    {d.short}
                  </div>
                  <div
                    className={`font-display text-[18px] mt-0.5 ${on ? 'text-creamlight' : 'text-ink'}`}
                  >
                    {dateNum}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 pt-5 pb-8">
          <div className="font-display text-[20px] text-ink mb-4">
            {DAYS[mobileDay].full} {selectedDate.getDate()}{' '}
            {MONTHS[selectedDate.getMonth()]}
          </div>
          {MEALS.map((meal) => {
            const recipe = getRecipeForSlot(mobileDay, meal);
            return (
              <div key={meal} className="mb-3.5">
                <Kicker className="text-muted mb-2">{MEAL_LABELS[meal]}</Kicker>
                {recipe
                  ? renderFilledSlot(recipe, mobileDay, meal, true)
                  : renderEmptySlot(mobileDay, meal, true)}
              </div>
            );
          })}
        </div>
      </div>

      {showRecipeSelector && selectedSlot && (
        <AddRecipeModal
          mode="plan"
          slot={{
            dayLabel: DAYS[selectedSlot.day].full,
            mealLabel: MEAL_LABELS[selectedSlot.meal],
          }}
          recipes={recipes.map(recipeToModalRecipe)}
          onClose={closeRecipeSelector}
          onPick={handleSelectRecipe}
        />
      )}
    </div>
  );
}
