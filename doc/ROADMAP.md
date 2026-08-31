# Roadmap — Cook Assistant

Notes internes, idées pour la suite.  
Trié du moins complexe au plus complexe, par type de travail.

---

## 1. Bugs & polish UX

Petits correctifs et ajustements d’usage, surtout mobile.

- Filtres du planning : les faire défiler (aujourd’hui impossibles à scroller)
- Tester vraiment sur téléphone
- Flow mobile : note / moyen de revenir au début, petits ajustements pour que le parcours tienne
- Revoir la navigation et les flows clés
- Peaufiner le chat assistant (plein écran)

---

## 2. Clôturer l’import Instagram

Specs : [specs_insta.md](./specs_insta.md) · [specs_insta_technical.md](./specs_insta_technical.md)  
Branche : `feature/instagram-recipe-import`

**Déjà livré** — frontend (modal, formulaire prérempli, champs incertains, `source_url`), backend `import-service/` (FastAPI + yt-dlp/ffmpeg/Claude + Dockerfile), tests unitaires mapping / validation URL.

**Reste à faire**

- [ ] Migration SQL `source_url` sur Supabase
- [ ] Env frontend (`VITE_IMPORT_API_URL`, `VITE_IMPORT_SHARED_SECRET`)
- [ ] Déployer `import-service/` + secrets Anthropic / shared secret
- [ ] Test E2E sur un reel réel
- [ ] Merge de la branche 

---

## 3. Déploiement & partage

Décider le canal, puis tout brancher pour que l’app soit utilisable et partageable.

- [ ] Login pour sécuriser l’accès (page déjà en place : à finaliser / brancher sur le deploy)
- [ ] Choisir : web classique (Vercel, Netlify…) et/ou PWA installable
- [ ] Configurer le déploiement (Vercel en premier candidat)
- [ ] PWA si on retient l’installable mobile
- [ ] Doc + rendre le partage facile

---

## 4. Assistant IA

Plan détaillé : [ASSISTANT_PRD.md](./ASSISTANT_PRD.md)  
Code : `src/lib/openai.ts`, `src/lib/chatRecipes.ts`

**Déjà livré** — prompt & parsing, deux modes :

- **Planification** : clarifier si besoin, shortlist 5–6 idées du carnet, itérer, produire `PLAN_SEMAINE` à la validation
- **Cuisine** : chercher dans le carnet, guider pas à pas, adapter en cours de route, proposer une mise à jour via `MAJ_RECETTE_JSON`

**À faire** (du plus simple au plus lourd)

- Modifier une recette existante via l’assistant (depuis la page recette ; reprendre les tools et améliorer ses capacités)
- Liste de courses intelligente depuis le chat (fusion des ingrédients) — recouvre aussi l’item C du plan Supabase
- Alternative Gemini ? modèle + perf, éventuellement recherche Google
- Mode vocal sur le chat

---

## 5. Sync & persistance (Supabase)

Plan détaillé : [SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md)

Recettes déjà branchées sur Supabase (CRUD + images). Il reste surtout le multi-appareil et ce qui est encore en local (planning, courses).

- Sync entre appareils
- Étendre au-delà des recettes si besoin (planning, liste de courses)

---

## 6. Acquisition de recettes (après Instagram)

Dépend de la clôture de l’import Instagram.

- Support TikTok / autres URLs
- Scanner une recette depuis un livre ou une page
