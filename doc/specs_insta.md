# Spec — Import de recette depuis un lien Instagram

## 1. Contexte

L'appli permet déjà de sauvegarder des recettes, planifier la semaine et gérer les
courses. Cette feature ajoute un moyen rapide d'alimenter la base de recettes :
coller un lien Instagram (reel/post), et obtenir une recette pré-remplie à
vérifier/compléter avant sauvegarde.

## 2. Objectif

Réduire la friction de saisie manuelle d'une recette vue sur Instagram. L'IA fait
le gros du travail (structuration), l'utilisateur fait la vérification finale.
**Pas d'objectif de fiabilité 100% automatique** — un écran de correction fait
partie du parcours normal, pas un cas d'erreur.

## 3. Utilisateur cible

Usage personnel, un seul utilisateur (pas de multi-tenant à prévoir pour la v1).

## 4. User story

> En tant qu'utilisatrice de l'appli, je colle un lien Instagram dans un champ
> dédié, et j'obtiens un formulaire de recette pré-rempli (titre, ingrédients,
> étapes) que je peux corriger avant de l'enregistrer dans ma base.

## 5. Parcours utilisateur

1. L'utilisatrice ouvre l'écran "Nouvelle recette" → option "Importer depuis un lien"
2. Elle colle l'URL Instagram et lance l'import
3. Écran de chargement (~5-15s selon la vidéo)
4. Résultat affiché sous forme de **formulaire pré-rempli et éditable**, pas
   une simple preview en lecture seule
5. Les champs identifiés comme incertains par l'extraction (`missing_info`)
   sont **visuellement signalés** (ex: bordure orange, icône ⚠) pour attirer
   l'attention sans bloquer la sauvegarde
6. L'utilisatrice corrige/complète ce qui manque
7. Elle valide → la recette est sauvegardée comme n'importe quelle recette
   créée manuellement (même schéma de données, mêmes fonctionnalités ensuite :
   planning, liste de courses, etc.)

## 6. Fonctionnalités

### 6.1 Doit avoir (v1)
- Champ de saisie d'URL avec validation basique (format URL Instagram)
- Appel backend qui déclenche le pipeline d'extraction (téléchargement +
  extraction frames + appel LLM)
- Retour d'un objet recette structuré, pré-remplissant le formulaire de
  création existant
- Signalement visuel des champs incertains/manquants
- Gestion des erreurs d'import (voir §8) avec message clair + possibilité de
  basculer en saisie manuelle sans perdre ce qui a été récupéré
- Champ `source_url` conservé sur la recette sauvegardée (traçabilité, pas
  affiché en avant dans l'UI mais utile pour retrouver l'original)

### 6.2 Pourrait avoir (v1.5, si envie)
- Bouton "réessayer avec plus de frames" si le résultat est jugé trop pauvre
- Miniature de la vidéo affichée à côté du formulaire pendant la correction
  (aide visuelle pour vérifier les quantités)
- Historique des imports (URL déjà importée → proposer d'ouvrir la recette
  existante plutôt que de la redupliquer)

### 6.3 Hors scope (explicitement exclu)
- Transcription audio de la vidéo (géré manuellement par l'utilisatrice si
  besoin — pas dans le pipeline automatisé)
- Support d'autres plateformes que Instagram pour la v1 (TikTok/YouTube
  Shorts pourraient venir plus tard, le pipeline le permet déjà techniquement
  mais pas d'UI dédiée pour l'instant)
- Import en masse / multi-URLs
- Détection de doublons de recettes par contenu (seulement par URL, cf 6.2)

## 7. Modèle de données

Format retourné par le pipeline d'extraction, à mapper vers le schéma de
recette existant de l'appli :

```json
{
  "title": "string",
  "confidence": "high | medium | low",
  "servings": "string | null",
  "prep_time": "string | null",
  "cook_time": "string | null",
  "ingredients": [
    { "quantity": "string | null", "item": "string" }
  ],
  "steps": ["string", "..."],
  "missing_info": ["string", "..."],
  "source_url": "string",
  "source_caption_used": "boolean"
}
```

Notes de mapping :
- `confidence` et `missing_info` ne sont **pas sauvegardés** dans la recette
  finale — ils ne servent qu'à piloter l'UI de l'écran de correction.
- `source_url` est conservé.
- Le mapping ingrédients (`quantity` + `item`) doit correspondre au schéma
  ingrédients déjà utilisé par la liste de courses, pour que l'intégration
  avec cette feature soit automatique.

## 8. Gestion des erreurs

| Cas | Comportement attendu |
|---|---|
| URL invalide / pas un lien Instagram | Message inline avant même d'appeler le backend |
| Post privé / inaccessible | Message clair "Impossible d'accéder à ce contenu" + lien vers saisie manuelle |
| `yt-dlp` échoue (post supprimé, changement Instagram côté serveur) | Message générique d'échec d'import + fallback saisie manuelle |
| LLM retourne un JSON invalide/imparsable | Retry automatique une fois (côté backend) ; si échec persiste, fallback saisie manuelle avec la légende brute pré-collée dans un champ libre pour référence |
| `confidence: "low"` | Pas une erreur — la recette s'affiche quand même, avec la plupart des champs signalés à vérifier |
| Timeout (vidéo très longue, réseau lent) | Timeout backend à définir (suggestion : 30s), message "ça prend plus de temps que prévu" avec option d'annuler |

## 9. Considérations techniques

- **Pipeline** : `yt-dlp` (téléchargement + métadonnées) → `ffmpeg` (extraction
  de 3 frames) → appel API Anthropic (Claude Haiku, vision + texte) → JSON
  structuré
- **Exécution** : recommandé en asynchrone côté backend (job/queue) plutôt que
  de bloquer une requête HTTP pendant 5-15s, surtout si l'appli est mobile
  (éviter les timeouts réseau côté client)
- **Coût** : de l'ordre de quelques centimes par import (API Claude), `yt-dlp`
  et `ffmpeg` gratuits — négligeable pour un usage perso
- **Fragilité connue** : `yt-dlp` dépend du bon vouloir d'Instagram côté
  anti-scraping ; prévoir une alerte de monitoring simple (ex: taux d'échec
  d'import) pour savoir quand mettre à jour la dépendance
- **Secrets** : clé API Anthropic côté backend uniquement, jamais exposée
  côté client

## 10. Critères d'acceptation

- [ ] Je peux coller un lien Instagram valide et déclencher un import
- [ ] Un formulaire pré-rempli s'affiche avec les champs extraits
- [ ] Les champs incertains sont visuellement différenciés des champs fiables
- [ ] Je peux éditer n'importe quel champ avant de sauvegarder
- [ ] La recette sauvegardée est indiscernable, dans le reste de l'appli
      (planning, courses), d'une recette créée manuellement
- [ ] Un post inaccessible ou une erreur d'extraction ne bloque pas
      l'utilisatrice : un chemin vers la saisie manuelle est toujours proposé
- [ ] Le lien source est conservé en base même s'il n'est pas mis en avant
      dans l'UI

## 11. Hors périmètre de cette spec

L'implémentation exacte du prompt d'extraction, le script d'appel `yt-dlp`/
`ffmpeg`/Claude et son intégration en tant que job backend sont déjà
disponibles en prototype (`extract_recipe.py`) et serviront de base à
l'implémentation — cette spec décrit le comportement produit attendu autour
de ce pipeline, pas son détail d'implémentation.