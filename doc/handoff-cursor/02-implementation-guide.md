# 02 · Guide d'implémentation

Marche à suivre pour Cursor (mode Agent), **dans cet ordre**. Chaque étape est isolée et
vérifiable. Ne passez à la suivante qu'une fois l'app qui tourne (`npm run dev`).

---

## Étape 0 — Préparer le terrain (5 min)

- [ ] Copier `handoff-cursor/` à la racine du repo.
- [ ] Repérer vos écrans actuels dans `src/` (probablement `src/pages/` ou `src/components/`
      d'après l'export Magic Patterns). Notez le fichier qui rend chacun :
      Accueil · Bibliothèque · Détail · Édition · Planning · Liste de courses, + le router.
- [ ] Vérifier que Tailwind compile déjà (`tailwind.config.js`, `postcss.config.js` présents ✔).

> Astuce : demandez à Cursor « liste les composants qui rendent chaque écran et où se trouve le
> router » avant toute modification — ça fiabilise le mapping.

---

## Étape 1 — Socle de style (fait une seule fois)

Suivez **`01-design-system.md`** :

1. [ ] Fusionner les `colors`, `fontFamily`, `letterSpacing` dans `tailwind.config.js`.
2. [ ] Ajouter les `<link>` Google Fonts dans `index.html` (ou self-host via `@fontsource`).
3. [ ] Mettre à jour le CSS global (`bg-paper text-ink font-body`, classe `.kicker`).
4. [ ] Copier `reference/Icon.tsx`, `reference/primitives.tsx`, `reference/Shell.tsx` dans
       `src/components/ui/` (ou votre dossier de composants partagés). Adapter les imports.

✅ **Vérif** : un écran existant doit déjà virer au papier crème + encre, polices serif actives.

---

## Étape 2 — Écran par écran

Pour **chaque** écran, le principe est toujours le même :

> **On garde la logique, on remplace la présentation.**
> Ouvrez votre composant existant, repérez : (a) les hooks/données Supabase, (b) les `props`,
> (c) les handlers/CTA. Puis remplacez le `return (...)` par la structure de la référence
> correspondante, en **rebranchant vos données et vos handlers** sur les emplacements balisés
> `// ⟵ BRANCHER` / `// ⟵ GARDER`.

Ordre recommandé (du plus simple au plus impliquant) :

| # | Écran            | Référence                    | Points d'attention                                            |
|---|------------------|------------------------------|---------------------------------------------------------------|
| 1 | Bibliothèque     | `reference/Library.tsx`      | grille 3 col. ; le `+` ouvre `AddRecipeModal` mode="import"    |
| 2 | Détail recette   | `reference/RecipeDetail.tsx` | étapes numérotées 01/02 ; garder Modifier/Supprimer           |
| 3 | Édition recette  | `reference/RecipeEdit.tsx`   | **ne touchez pas** au state de formulaire ni au submit        |
| 4 | Planning         | `reference/Planner.tsx`      | case `+` → `AddRecipeModal` mode="plan" (choisir une recette)  |
| 5 | Liste de courses | `reference/GroceryList.tsx`  | génération depuis le planning conservée ; cases à cocher       |
| 6 | Accueil          | `reference/Home.tsx`         | la barre de recherche **navigue vers l'Assistant**            |
| 7 | Assistant        | `reference/Assistant.tsx`    | **restylage** de votre onglet existant — voir Étape 3         |

✅ **Vérif après chaque écran** : données réelles affichées, chaque bouton fait toujours ce qu'il
faisait avant, aucun appel Supabase/OpenAI supprimé.

---

## Étape 2-bis — La pop-up d'ajout de recette (`AddRecipeModal`)

Un **seul** composant, `reference/AddRecipeModal.tsx`, deux usages via la prop `mode` :

- **`mode="plan"` — depuis le Planning** : clic sur une case `+` → la pop-up s'ouvre sur le créneau
  (jour, repas), avec recherche + filtres + liste de vos recettes. Choisir une recette appelle
  `onPick(id)` → **votre handler qui insère la recette dans ce créneau** (Supabase).
- **`mode="import"` — depuis les Recettes** : le `+` ouvre la pop-up avec deux entrées :
  - **« Créer une recette vierge »** (actif) → `onCreateBlank()` ouvre l'écran d'édition vide.
  - **« Coller un lien »** — bloc **préparé et désactivé**, badge « Bientôt » (feature future :
    import depuis URL). Quand vous l'activerez, branchez le champ + `Importer` sur votre parseur.

- [ ] Monter `AddRecipeModal` dans le Planning **et** dans la Bibliothèque, contrôlé par un state
      `open` + le contexte (`slot` en mode plan). Brancher `onPick` / `onCreateBlank` sur vos handlers.

---

## Étape 3 — L'onglet Assistant (restylage)

Vous avez **déjà** un onglet assistant : on le **restyle**, on ne le recrée pas. `reference/Assistant.tsx`
sert de modèle visuel.

**A. Entrée depuis l'Accueil**
- [ ] La soumission de la barre de recherche de l'Accueil navigue vers votre onglet assistant en
      passant `query` comme **premier message utilisateur** (si votre flux le permet).

**B. Câblage IA & données (déjà en place chez vous — à conserver)**
- [ ] `messages` : votre state de conversation (rôles `user` / `assistant`).
- [ ] `onSend(text)` : **votre appel OpenAI existant** (`VITE_OPENAI_API_KEY`). Streaming si dispo.
- [ ] Les **cartes-suggestions** dans le fil = recettes issues de **Supabase**. « Au planning »
      réutilise votre handler planner ; « Voir » navigue vers le détail.

> On ne reprend que la **mise en forme** (bulles, vignettes, barre ancrée, chips, note de pied).
> Envoyez-moi un screenshot de votre onglet actuel si vous voulez que je calque la référence dessus.

---

## Étape 4 — Responsive (mobile) — composants dédiés fournis

Le mobile **n'est pas** qu'une affaire de breakpoints : le dossier `reference/mobile/` contient des
**composants TSX mobiles dédiés**, car certaines structures changent vraiment (nav en onglets bas,
planning par jour). Deux façons de les utiliser :

**Option A — composants séparés (recommandé)** : rendez la version mobile ou desktop selon la largeur.
```tsx
import { useMediaQuery } from './useMediaQuery'; // ou votre hook existant
const isMobile = useMediaQuery('(max-width: 768px)');
return isMobile ? <PlannerMobile {...props} /> : <Planner {...props} />;
```
Les deux variantes partagent **les mêmes props et handlers** — vous câblez vos données une fois et
les passez aux deux.

**Option B — un seul composant responsive** : fusionnez en Tailwind (`hidden lg:block` /
`lg:hidden`) en vous servant du markup mobile comme source.

Ce que les composants mobiles encodent déjà :
- **Nav** : `MobileTopBar` (titre « Chez Verdi » conservé) + `MobileTabBar` en bas (safe-areas iOS).
- **Planning** : `Planner.mobile.tsx` = **sélecteur de jour** + repas du jour ; le `+` ouvre la même
  `AddRecipeModal` mode="plan".
- **Détail** : photo en hero pleine largeur, ingrédients puis étapes empilés.
- **Liste de courses** : pleine largeur, cases à cocher rondes.
- **Assistant** : fil pleine hauteur, barre de saisie ancrée (remplace les onglets).
- **Bibliothèque** : 1 colonne, en-tête fixe ; le `+` ouvre `AddRecipeModal` mode="import".

> `AddRecipeModal` est **commun** desktop/mobile (la pop-up est déjà responsive : `max-w-[560px]`,
> `max-h-[80vh]`).

---

## Checklist finale (front-only respecté ?)

- [ ] Aucun `select/insert/update` Supabase modifié ou supprimé.
- [ ] L'appel OpenAI de l'assistant intact.
- [ ] Tous les CTA d'origine présents et fonctionnels (ajout, édition, suppression, copie, navigation).
- [ ] Aucune route métier supprimée (l'onglet Assistant existant est **conservé**, juste restylé).
- [ ] `npm run build` passe sans erreur de type.
