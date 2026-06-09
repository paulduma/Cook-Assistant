# Passation design — « Chez Verdi » (refonte éditoriale)

Ce dossier contient **tout ce qu'il faut pour remplacer le front actuel** de Cook-Assistant
par la nouvelle direction visuelle **éditoriale « Chez Verdi »** (magazine culinaire chaleureux).

> Stack ciblée : **Vite + React + TypeScript + Tailwind**, données **Supabase**, assistant **OpenAI**.
> C'est exactement votre stack — rien de tout ça n'est à changer côté logique.

---

## ⛔️ Règle d'or : on ne touche QUE la présentation

Cette refonte est **front-only**. Pour chaque écran, vous remplacez le **JSX présentationnel + les
classes Tailwind**, et vous **conservez à l'identique** :

- les appels de données Supabase (`select`, `insert`, `update`, hooks `useEffect`, react-query, etc.) ;
- les `props` et le `.map()` sur vos vraies données ;
- **tous les handlers et CTA existants** (`onClick`, `onSubmit`, navigation, ajout/suppression…) ;
- l'appel OpenAI de l'assistant.

Les composants de référence de ce dossier utilisent des **données factices** et des handlers vides,
**balisés par des commentaires** `// ⟵ GARDER votre logique` / `// ⟵ BRANCHER vos données`.
Vous ne copiez jamais ces données — vous copiez **la structure et les classes**.

---

## 📁 Contenu du dossier

```
handoff-cursor/
├── README.md                    ← vous êtes ici
├── 01-design-system.md          ← palette, typo, espacements, tailwind.config, polices, CSS global
├── 02-implementation-guide.md   ← marche à suivre écran par écran + checklist de mapping
├── 03-cursor-prompts.md         ← prompts prêts à coller dans Cursor (un par écran)
└── reference/                   ← composants TSX de référence, en Tailwind (à recopier/adapter)
    ├── design-tokens.ts         ← tokens en TS (si besoin hors Tailwind)
    ├── Icon.tsx                 ← jeu d'icônes (stroke, cohérent)
    ├── primitives.tsx           ← Button, Kicker, SectionRule, Field, Thumb…
    ├── Shell.tsx                ← en-tête de navigation desktop + conteneur d'écran
    ├── Home.tsx                 ← Accueil (hero + entrée vers l'assistant)
    ├── Assistant.tsx            ← Chatbot (modèle de restylage de votre onglet existant)
    ├── Library.tsx              ← Bibliothèque de recettes
    ├── RecipeDetail.tsx         ← Détail d'une recette
    ├── RecipeEdit.tsx           ← Édition / création de recette
    ├── Planner.tsx              ← Planning de la semaine
    ├── GroceryList.tsx          ← Liste de courses
    ├── AddRecipeModal.tsx       ← POP-UP : choisir (planning) / importer (recettes)
    └── mobile/                  ← écrans MOBILES dédiés (onglets bas, planning par jour…)
        ├── MobileShell.tsx      ← barre haute + barre d'onglets bas (safe-areas iOS)
        ├── Home.mobile.tsx
        ├── Assistant.mobile.tsx
        ├── Library.mobile.tsx
        ├── RecipeDetail.mobile.tsx
        ├── Planner.mobile.tsx   ← sélecteur de jour + repas du jour
        └── GroceryList.mobile.tsx
```

---

## 🚀 Comment utiliser ce dossier dans Cursor

1. **Copiez ce dossier `handoff-cursor/` à la racine de votre repo** (il ne sera pas buildé, c'est de la doc + des références).
2. Ouvrez Cursor sur le repo, puis suivez **`02-implementation-guide.md`** dans l'ordre.
3. Pour chaque écran, ouvrez le prompt correspondant dans **`03-cursor-prompts.md`**, collez-le dans
   le chat Cursor (mode Agent), et laissez-le **mapper la référence sur votre vrai composant**.
4. Commencez **toujours par `01-design-system.md`** (tokens + polices) : tout le reste en dépend.

> 💡 Les fichiers `reference/*.tsx` sont volontairement **autonomes et non câblés**. Ils compilent en
> isolation comme aperçu, mais leur rôle est de servir de **modèle visuel** que Cursor fusionne avec
> vos composants existants. Ne les importez pas tels quels dans l'app de production.

---

## 🐶 Détail de marque

Le nom retenu est **« Chez Verdi »** (clin d'œil au chien). On le garde dans l'en-tête de navigation,
avec le sous-titre en petites capitales « cuisine maison ». Quelques touches discrètes ailleurs
(ex. « croquettes de Verdi » dans le placeholder d'ajout à la liste de courses) — à garder ou retirer
selon votre goût.
