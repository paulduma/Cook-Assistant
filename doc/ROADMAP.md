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

- Liste de courses intelligente générée depuis le chat (fusion des ingrédients)
- Alternative Gemini ? modèle + perf pour recherche google ?


### Déploiement ou PWA
- 1. Login page to secure pwa
- 2. Vercel deploy
- 3. PWA
- Choisir : déploiement web classique (Vercel, Netlify…) ou conversion en PWA installable sur mobile
- Configurer le déploiement une fois la décision prise
- Faire aussi la doc et le rendre partageable facilement

### Import Instagram — ✅ fait, en attente de test
Specs : [specs_insta.md](./specs_insta.md) · [specs_insta_technical.md](./specs_insta_technical.md)  
Branche code : `feature/instagram-recipe-import`

**Livré**
- Frontend (modal import, formulaire prérempli, champs incertains, `source_url`)
- Backend `import-service/` (FastAPI + yt-dlp/ffmpeg/Claude + Dockerfile)
- Tests unitaires mapping / validation URL

**Reste à faire**
- [ ] Migration SQL `source_url` sur Supabase
- [ ] Env frontend (`VITE_IMPORT_API_URL`, `VITE_IMPORT_SHARED_SECRET`)
- [ ] Déployer `import-service/` + secrets Anthropic / shared secret
- [ ] Test E2E sur un reel réel
- [ ] Merge de la branche

### Plus tard
**Refine UX**
- Real test on mobile
- flow global mobile à mieux prendre en compte pour que ça marche (avoir la note pour revenir au début, small improvements)
- Peaufiner le chat assistant (full-page)
- Revoir la navigation et les flows clés
- scanner une recette depuis un livre ou une page
- activer mode vocal sur chat
- Support TikTok / autres URLs (après Instagram validé)

Quelques bugs trouvés en testant
- pouvoir aller sur une recette et demander de la modifier avec l'assistant

- filtres dans le planning : on ne peut pas les faire défiler
