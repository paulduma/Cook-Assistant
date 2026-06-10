import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Recipe } from '../types/recipe';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeForm } from '../components/RecipeForm';
import { AddRecipeModal } from '../components/AddRecipeModal';
import {
  createRecipe,
  deleteRecipe,
  fetchRecipes,
  migrateFromLocalStorage,
  updateRecipe,
  uploadRecipeImage,
} from '../lib/recipes';
import { addRecipeToFirstEmptySlot } from '../lib/planning';
import { pathFromNavKey, TabKey } from '../lib/nav';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Kicker, Button } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';
import {
  LibraryListMobile,
  RecipeDetailMobile,
  RecipeFormMobile,
} from '../components/mobile/RecipeLibraryMobile';

export function RecipeLibrary() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNavTab = (key: TabKey) => navigate(pathFromNavKey(key));

  useEffect(() => {
    void loadRecipes();
  }, []);

  useEffect(() => {
    const openRecipeId = (location.state as { openRecipeId?: string } | null)?.openRecipeId;
    if (openRecipeId && recipes.length > 0) {
      const recipe = recipes.find((r) => r.id === openRecipeId);
      if (recipe) {
        setSelectedRecipe(recipe);
      }
    }
  }, [recipes, location.state]);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchQuery, selectedTag]);

  const loadRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      await migrateFromLocalStorage();
      const loadedRecipes = await fetchRecipes();
      setRecipes(loadedRecipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les recettes');
    } finally {
      setLoading(false);
    }
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

  const handleSaveRecipe = async (
    recipeData: Omit<Recipe, 'id' | 'createdAt'>,
    imageFile?: File
  ) => {
    setSaving(true);
    setError(null);
    try {
      if (editingRecipe) {
        let dataToSave = recipeData;
        if (imageFile) {
          const imageUrl = await uploadRecipeImage(editingRecipe.id, imageFile);
          dataToSave = { ...recipeData, image: imageUrl };
        }
        const updated = await updateRecipe(editingRecipe.id, dataToSave);
        setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        if (selectedRecipe?.id === updated.id) {
          setSelectedRecipe(updated);
        }
      } else {
        const dataForCreate = imageFile
          ? { ...recipeData, image: undefined }
          : recipeData;
        const created = await createRecipe(dataForCreate);
        let saved = created;
        if (imageFile) {
          const imageUrl = await uploadRecipeImage(created.id, imageFile);
          saved = await updateRecipe(created.id, { image: imageUrl });
        }
        setRecipes((prev) => [saved, ...prev]);
      }
      setShowForm(false);
      setEditingRecipe(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d’enregistrer la recette');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette recette ?')) return;

    setError(null);
    try {
      await deleteRecipe(id);
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setSelectedRecipe(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer la recette');
    }
  };

  const openBlankRecipeForm = () => {
    setShowAddModal(false);
    setEditingRecipe(null);
    setShowForm(true);
  };

  const handleAddToPlan = (recipeId: string) => {
    if (!addRecipeToFirstEmptySlot(recipeId)) {
      navigate('/planning');
    }
  };

  const allTags = Array.from(new Set(recipes.flatMap((r) => r.tags)));

  const errorBanner = error ? (
    <div className="mb-4 flex items-start justify-between gap-4 border border-ember/30 bg-cream px-4 py-3 text-[15px] text-ink-soft">
      <span>{error}</span>
      <button
        type="button"
        onClick={() => setError(null)}
        className="shrink-0 bg-transparent border-0 text-ink-soft cursor-pointer"
        aria-label="Fermer"
      >
        ×
      </button>
    </div>
  ) : null;

  if (loading && recipes.length === 0) {
    return (
      <div className="bg-paper min-h-full flex items-center justify-center px-6">
        <p className="text-muted text-lg italic">Chargement des recettes…</p>
      </div>
    );
  }

  if (isMobile) {
    if (showForm) {
      return (
        <RecipeFormMobile
          onBack={() => {
            setShowForm(false);
            setEditingRecipe(null);
          }}
        >
          {errorBanner}
          <RecipeForm
            recipe={editingRecipe || undefined}
            onSave={handleSaveRecipe}
            onCancel={() => {
              setShowForm(false);
              setEditingRecipe(null);
            }}
            saving={saving}
          />
        </RecipeFormMobile>
      );
    }

    if (selectedRecipe) {
      return (
        <RecipeDetailMobile
          recipe={selectedRecipe}
          onBack={() => setSelectedRecipe(null)}
          onAddToPlan={() => handleAddToPlan(selectedRecipe.id)}
          onEdit={() => {
            setEditingRecipe(selectedRecipe);
            setShowForm(true);
          }}
          onDelete={() => handleDeleteRecipe(selectedRecipe.id)}
        />
      );
    }

    return (
      <>
        {errorBanner && (
          <div className="px-5 pt-3">{errorBanner}</div>
        )}
        <LibraryListMobile
          recipes={filteredRecipes}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          allTags={allTags}
          onOpenRecipe={setSelectedRecipe}
          onAddRecipe={() => setShowAddModal(true)}
          onNavigate={handleNavTab}
        />
        {showAddModal && (
          <AddRecipeModal
            mode="import"
            onClose={() => setShowAddModal(false)}
            onCreateBlank={openBlankRecipeForm}
          />
        )}
      </>
    );
  }

  if (showForm) {
    return (
      <div className="bg-paper min-h-full">
        <div className="max-w-[740px] mx-auto px-11 py-10">
          {errorBanner}
          <RecipeForm
            recipe={editingRecipe || undefined}
            onSave={handleSaveRecipe}
            onCancel={() => {
              setShowForm(false);
              setEditingRecipe(null);
            }}
            saving={saving}
          />
        </div>
      </div>
    );
  }

  if (selectedRecipe) {
    const tag = selectedRecipe.tags[0] ?? 'Recette';

    return (
      <div className="bg-paper min-h-full">
        <div className="px-16 py-[38px]">
          <button
            onClick={() => setSelectedRecipe(null)}
            className="font-label flex items-center gap-2.5 text-[12px] uppercase tracking-wide text-ink-soft mb-[30px] cursor-pointer bg-transparent border-0"
          >
            <Icon name="arrowLeft" size={17} strokeWidth={1.8} className="text-ember" />
            Retour à la bibliothèque
          </button>

          <div className="flex justify-between items-start gap-6">
            <div>
              <Kicker className="text-olive mb-3.5">{tag}</Kicker>
              <h1 className="font-display text-[56px] text-ink m-0 mb-4 leading-none">
                {selectedRecipe.title}
              </h1>
              <div className="font-label flex gap-4 text-ink-soft text-[12.5px] uppercase tracking-wide">
                <span>{selectedRecipe.cookingTime} min</span>
                <span className="text-line">|</span>
                <span>{selectedRecipe.servings} portions</span>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button
                icon="edit"
                variant="outline"
                onClick={() => {
                  setEditingRecipe(selectedRecipe);
                  setShowForm(true);
                }}
              >
                Modifier
              </Button>
              <Button
                icon="trash"
                variant="danger"
                onClick={() => handleDeleteRecipe(selectedRecipe.id)}
              >
                Supprimer
              </Button>
            </div>
          </div>

          <div className="border-t border-line mt-[30px]" />

          <div className="grid grid-cols-[0.85fr_1.4fr] gap-14 mt-8">
            <div>
              <Kicker className="text-ink mb-[18px]">Ingrédients</Kicker>
              {selectedRecipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="py-3 border-b border-line-soft text-[17px] text-ink-soft"
                >
                  {ingredient}
                </div>
              ))}
            </div>
            <div>
              <Kicker className="text-ink mb-[18px]">Préparation</Kicker>
              {selectedRecipe.steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex gap-5 py-3.5 ${index < selectedRecipe.steps.length - 1 ? 'border-b border-line-soft' : ''}`}
                >
                  <div className="font-display text-[30px] text-ember leading-none w-10 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="text-[17px] text-ink-soft leading-[1.5] pt-1">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-full">
      <div className="px-[52px] py-[42px]">
        {errorBanner}
        <div className="flex items-end justify-between mb-3.5">
          <div>
            <Kicker className="mb-2.5">Le carnet maison</Kicker>
            <h1 className="font-display text-[46px] text-ink m-0">Bibliothèque de recettes</h1>
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
          <div className="flex flex-wrap gap-7 mb-7">
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
          <div className="grid grid-cols-3 gap-[26px]">
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
