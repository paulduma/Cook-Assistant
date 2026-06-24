# Roadmap — Cook Assistant

Notes internes, idées pour la suite.

---

## À faire

### Connecter Supabase
- Remplacer le stockage local (localStorage) par Supabase
- Persister les recettes, le planning et les listes de courses
- Sync entre appareils  
- Plan détaillé : [SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md)

### Assistant IA (OpenAI)

Plan détaillé : [ASSISTANT_PRD.md](./ASSISTANT_PRD.md)

**Fait — prompt & parsing** (`src/lib/openai.ts`, `src/lib/chatRecipes.ts`)

- **Mode planification** : clarifier si besoin, shortlist 5–6 idées du carnet, itérer, produire `PLAN_SEMAINE` à la validation
- **Mode cuisine** : chercher dans le carnet, guider pas à pas, adapter en cours de route, proposer mise à jour via `MAJ_RECETTE_JSON`
- Contexte carnet complet (aperçu + fiches détaillées) injecté à chaque requête
- Lignes structurées parsées : `RECETTES`, `NOUVELLES_RECETTES_JSON`, `PLAN_SEMAINE`, `RECETTE_ACTIVE`, `ETAPE_CUISSON`, `MAJ_RECETTE_JSON`

**Fait — UI chat**

- Conversation, chips d'amorçage, fiches recettes du carnet, bouton *Au planning*

**Fait — câblage UX / backend (M1)**

- [x] Afficher les nouvelles recettes suggérées + bouton *Ajouter au carnet* (`NOUVELLES_RECETTES_JSON` → `createRecipe`)
- [x] Bouton *Valider le menu* → préremplir le planning (`PLAN_SEMAINE` → meal planner)
- [x] Indicateur de progression en cuisine (`ETAPE_CUISSON`)
- [x] Sauvegarder / mettre à jour une recette après session cuisine (`MAJ_RECETTE_JSON` → `createRecipe` / `updateRecipe`)

**Plus tard**

- Import de recettes depuis un lien (Instagram, TikTok, URL)
- Liste de courses intelligente générée depuis le chat (fusion des ingrédients)
- Alternative Gemini

### Refine UX -> Done: next steps = navigation & small UX changes + real test on mobile planned at the end
- Peaufiner le chat assistant (full-page)
- Améliorer les parcours recettes / planning / liste de courses
- Revoir la navigation et les flows clés

### Déploiement ou PWA
- Choisir : déploiement web classique (Vercel, Netlify…) ou conversion en PWA installable sur mobile
- Configurer le déploiement une fois la décision prise

### Import de recettes depuis un lien
- Importer une recette depuis Instagram, TikTok ou n'importe quelle URL
- Extraction automatique des ingrédients et étapes
- Feature pour ajouter une recette facilement sans saisie manuelle