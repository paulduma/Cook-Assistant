# 03 · Prompts Cursor (prêts à coller)

Mode **Agent**, un prompt à la fois, en suivant l'ordre. Adaptez les noms de fichiers entre
crochets `[...]` après que Cursor a listé vos vrais composants.

> ⚠️ **Préfixe commun à rappeler si besoin** : « Refonte *front-only*. Ne modifie aucun appel
> Supabase ni OpenAI, conserve tous les props, handlers et CTA existants. Tu remplaces uniquement
> le JSX de présentation et les classes Tailwind. »

---

### Prompt 0 — Cartographie

```
Lis le dossier handoff-cursor/. Puis liste, pour cette app (Vite+React+TS+Tailwind, Supabase, OpenAI) :
1) le fichier/composant qui rend chacun de ces écrans : Accueil, Bibliothèque de recettes,
   Détail recette, Édition recette, Planning, Liste de courses ;
2) où est défini le router et comment on navigue entre écrans ;
3) où se trouvent les appels Supabase et l'appel OpenAI de l'assistant.
Ne modifie rien pour l'instant : donne-moi juste la carte.
```

---

### Prompt 1 — Socle de style

```
Applique handoff-cursor/01-design-system.md :
- fusionne colors/fontFamily/letterSpacing dans tailwind.config.js (garde l'existant) ;
- ajoute les <link> Google Fonts (Marcellus, Spectral, Archivo) dans index.html ;
- mets à jour le CSS global : body en bg-paper text-ink font-body antialiased, h1/h2/h3 en font-display,
  et ajoute la classe .kicker ;
- copie reference/Icon.tsx, reference/primitives.tsx, reference/Shell.tsx dans src/components/ui/
  en adaptant les imports.
Lance le dev server et montre-moi un écran existant pour vérifier que le thème papier/encre et les
polices serif sont actifs. Ne touche à aucune logique.
```

---

### Prompt 2 — Bibliothèque

```
Refais la présentation de [composant Bibliothèque] en suivant reference/Library.tsx.
Garde mes vraies recettes Supabase, mon state de recherche et de filtres, et la navigation vers le
détail. Remplace seulement le markup et les classes par la version éditoriale (grille 3 colonnes,
cartes cream/line, kicker olive pour le tag, titres font-display). Rends la grille responsive :
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3. Le bouton « Ajouter une recette » ouvre la pop-up
AddRecipeModal en mode="import" (cf. Prompt 7-bis).
```

---

### Prompt 3 — Détail recette

```
Refais la présentation de [composant Détail] selon reference/RecipeDetail.tsx : titre font-display,
méta en petites capitales, ingrédients en liste filetée, préparation en étapes numérotées 01/02.
Conserve les boutons Modifier et Supprimer avec leurs handlers actuels et le retour à la bibliothèque.
```

---

### Prompt 4 — Édition recette

```
Refais la présentation de [composant Édition] selon reference/RecipeEdit.tsx : champs « soulignés »
(pas de boîtes), listes d'ingrédients et d'étapes avec ajout/suppression, boutons Enregistrer/Annuler.
Ne modifie PAS mon state de formulaire ni la soumission Supabase : rebranche-les sur les inputs.
```

---

### Prompt 5 — Planning

```
Refais la présentation de [composant Planning] selon reference/Planner.tsx : grille jours × repas,
filets fins, cases vides cliquables. La case « + » ouvre la pop-up AddRecipeModal en mode="plan"
en lui passant le créneau (jour, repas) ; le choix d'une recette appelle mon handler qui l'insère
dans ce créneau (Supabase). En mobile, utilise reference/mobile/Planner.mobile.tsx (sélecteur de
jour + repas du jour).
```

---

### Prompt 6 — Liste de courses

```
Refais la présentation de [composant Liste de courses] selon reference/GroceryList.tsx : groupes par
catégorie avec filet de section, articles à case ronde cochable, toggle « Par catégorie / Par recette »,
ajout d'article perso, bouton « Copier la liste ». Garde la génération depuis le planning et tous mes
handlers (toggle, ajout, copie) intacts.
```

---

### Prompt 7 — Accueil + entrée Assistant

```
Refais la présentation de [composant Accueil] selon reference/Home.tsx (kicker, gros titre font-display,
barre de recherche soulignée, 3 entrées numérotées). La soumission de la barre de recherche doit
NAVIGUER vers le nouvel écran Assistant en passant la requête saisie comme premier message.
```

---

### Prompt 8 — Onglet Assistant (restylage)

```
Je possède DÉJÀ un onglet assistant fonctionnel (state de conversation + appel OpenAI). Ne le
recrée pas : restyle-le en suivant reference/Assistant.tsx (bulles user/assistant alignées,
chips de suggestions, cartes-recettes dans le fil avec « Au planning »/« Voir », barre de saisie
ancrée en bas, note de pied). Conserve mon appel OpenAI, mon state de messages et mes handlers ;
branche les cartes-suggestions sur mes recettes Supabase. En mobile, suis
reference/mobile/Assistant.mobile.tsx.
```

---

### Prompt 7-bis — Pop-up d'ajout de recette (AddRecipeModal)

```
Intègre reference/AddRecipeModal.tsx, qui a deux modes :
- mode="plan" (Planning) : recherche + filtres + liste de mes recettes Supabase ; onPick(id) insère
  la recette dans le créneau (jour, repas) passé en prop `slot`.
- mode="import" (Recettes) : « Créer une recette vierge » (onCreateBlank → écran d'édition vide) +
  bloc « Coller un lien » désactivé avec badge « Bientôt » (feature future, ne pas câbler).
Monte le modal dans le Planning et dans la Bibliothèque via un state `open`. Garde tous mes appels
Supabase. La pop-up est déjà responsive, pas de variante mobile séparée à créer.
```

---

### Prompt 9 — Mobile (composants dédiés)

```
Mets en place le responsive avec les composants de reference/mobile/ (MobileShell + un fichier par
écran). Approche recommandée : un hook useMediaQuery('(max-width: 768px)') qui rend la variante
mobile ou desktop, les deux partageant les mêmes props/handlers (donc une seule fois câblés).
Reprends la nav en onglets bas (MobileTabBar), le planning par jour, le détail avec photo hero, la
liste à cases à cocher, l'assistant pleine hauteur. Respecte les safe-areas iOS déjà présentes.
```

---

### Prompt 10 — Build & vérif

```
Lance npm run build et corrige les erreurs de type. Confirme qu'aucun appel Supabase/OpenAI ni
aucun CTA n'a été retiré, et que l'onglet assistant existant est conservé (juste restylé).
```
