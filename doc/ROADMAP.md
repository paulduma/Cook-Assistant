# Roadmap — Cook Assistant

Notes internes, idées pour la suite.

---

## À faire

### Connecter Supabase
- Sync entre appareils  
- Plan détaillé : [SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md)

### Assistant IA (OpenAI)

Plan détaillé : [ASSISTANT_PRD.md](./ASSISTANT_PRD.md)

**Fait — prompt & parsing** (`src/lib/openai.ts`, `src/lib/chatRecipes.ts`)
2 modes 
- **Mode planification** : clarifier si besoin, shortlist 5–6 idées du carnet, itérer, produire `PLAN_SEMAINE` à la validation
- **Mode cuisine** : chercher dans le carnet, guider pas à pas, adapter en cours de route, proposer mise à jour via `MAJ_RECETTE_JSON`


- Import de recettes depuis un lien (Instagram, TikTok, URL)
- Liste de courses intelligente générée depuis le chat (fusion des ingrédients)
- Alternative Gemini ? modèle + perf pour recherche google ?


### Déploiement ou PWA
- 1. Login page to secure pwa
- 2. Vercel deploy
- 3. PWA
- Choisir : déploiement web classique (Vercel, Netlify…) ou conversion en PWA installable sur mobile
- Configurer le déploiement une fois la décision prise
- Faire aussi la doc et le rendre partageable facilement

### Plus tard
**Import de recettes depuis un lien**
- Importer une recette depuis Instagram, TikTok ou n'importe quelle URL
- Extraction automatique des ingrédients et étapes
- Feature pour ajouter une recette facilement sans saisie manuelle

**Refine UX**
- Real test on mobile
- Homepage ne marche pas sur mobile -> solved, to test
- recettes overlap sur le planning -> solved, to test
- flow global mobile à mieux prendre en compte pour que ça marche (avoir la note pour revenir au début, small improvements)
- vérifier import recette fonctionne bien
- Peaufiner le chat assistant (full-page)
- Revoir la navigation et les flows clés
- scanner une recette depuis un livre ou une page
- activer mode vocal sur chat

Quelques bugs trouvés en testant
- la session IA ne persiste pas si on change d'onglet - à fix

