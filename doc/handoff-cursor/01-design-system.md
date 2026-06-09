# 01 · Design system — « Chez Verdi » (éditorial)

Direction : **magazine culinaire chaleureux**. Papier crème + encre profonde, **un seul** accent
ocre (« ember »), un vert olive secondaire très sobre. Sérif d'affichage pour les titres, sérif de
lecture pour le corps, sans-sérif en petites capitales pour les intitulés. Filets fins, beaucoup de
blanc, grands numéros. **Pas de gros aplats, pas de dégradés, pas de coins très arrondis.**

---

## 1. Palette

| Token Tailwind     | Hex       | Usage                                                        |
| ------------------ | --------- | ----------------------------------------------------------- |
| `paper`            | `#EEE8DC` | Fond d'application                                          |
| `cream`            | `#FBF8F1` | Cartes, barres, surfaces                                    |
| `ink`              | `#23201A` | Texte principal, titres, bordures fortes                   |
| `ink-soft`         | `#5C534A` | Texte courant, descriptions                                |
| `muted`            | `#9A8F80` | Texte tertiaire, placeholders, méta                        |
| `ember`            | `#B5532A` | **Accent unique** : CTA, numéros, liens actifs, puces      |
| `ember-dark`       | `#964123` | Survol/pressé de l'accent, action destructive              |
| `ember-soft`       | `#EBDDD2` | Fonds d'accent légers (bulles, vignettes, jour actif)      |
| `olive`            | `#6C6A48` | Catégories / tags secondaires (sobre)                      |
| `line`            | `#D8D0C1` | Filets, séparateurs, bordures de cartes                    |
| `line-soft`        | `#E7DFD1` | Séparateurs internes très légers                           |

Texte sur fond `ember` : utiliser `#FBF6EE` (crème chaud) plutôt que blanc pur.

---

## 2. Typographie

| Rôle              | Police       | Réglages                                                       |
| ----------------- | ------------ | -------------------------------------------------------------- |
| Display / titres  | **Marcellus**| `font-weight: 400`, `line-height ~1.1`. Pour H1/H2 et noms de recettes. |
| Corps / lecture   | **Spectral** | 400/500, italique pour citations & placeholders.              |
| Intitulés / méta  | **Archivo**  | 500/600, `text-transform: uppercase`, `letter-spacing` large. |

**Kicker** (sur-titre récurrent) = Archivo, ~11–12px, 600, `tracking ≈ 0.16em`, uppercase, couleur `ember`.

Échelle indicative (desktop) : H1 44–60px · H2 24–28px · nom de recette en carte 24–26px ·
corps 16–18px · méta/kicker 11–12px. Sur mobile, réduire H1 à ~34px.

---

## 3. Espacement & formes

- **Rayons** : quasi nuls. Cartes et boutons à **angles droits** (`rounded-none`).
  Seules exceptions arrondies : avatars/puces rondes (`rounded-full`) et bulles de chat.
- **Bordures** : `1px solid line`. Champs de saisie = **soulignement** `1.5px ink` plutôt que boîte.
- **Filets de section** : un trait `1px line` qui prolonge le titre (voir `SectionRule`).
- **Ombres** : aucune (ou très légère). On s'appuie sur les filets, pas sur l'élévation.
- **Numéros d'étapes** : Marcellus, couleur `ember`, format `01 / 02 / 03`.

---

## 4. tailwind.config.js — à fusionner

Ajoutez ces clés dans `theme.extend` (gardez le reste de votre config Magic Patterns) :

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper:       '#EEE8DC',
        cream:       '#FBF8F1',
        ink:         { DEFAULT: '#23201A', soft: '#5C534A' },
        muted:       '#9A8F80',
        ember:       { DEFAULT: '#B5532A', dark: '#964123', soft: '#EBDDD2' },
        olive:       '#6C6A48',
        line:        { DEFAULT: '#D8D0C1', soft: '#E7DFD1' },
        creamlight:  '#FBF6EE', // texte sur ember
      },
      fontFamily: {
        display: ['Marcellus', 'Georgia', 'serif'],
        body:    ['Spectral', 'Georgia', 'serif'],
        label:   ['Archivo', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        kicker: '0.16em',
      },
    },
  },
  plugins: [],
};
```

> Avec ça : `bg-paper`, `text-ink`, `text-ink-soft`, `bg-ember`, `text-ember`, `bg-ember-soft`,
> `border-line`, `font-display`, `font-body`, `font-label`, `tracking-kicker`, etc.

---

## 5. Polices — chargement

Ajoutez dans **`index.html`** (dans `<head>`) :

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Marcellus&family=Spectral:ital,wght@0,400;0,500;1,400&family=Archivo:wght@500;600&display=swap"
  rel="stylesheet"
/>
```

> Si vous préférez self-host (recommandé en prod) : installez `@fontsource/marcellus`,
> `@fontsource/spectral`, `@fontsource/archivo` et importez-les dans votre entrée `main.tsx`.

---

## 6. CSS global — `src/index.css` (ou équivalent)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body, #root { height: 100%; }
  body {
    @apply bg-paper text-ink font-body antialiased;
  }
  h1, h2, h3 { @apply font-display font-normal; }
}

/* Kicker réutilisable */
@layer components {
  .kicker {
    @apply font-label text-[11px] font-semibold uppercase tracking-kicker text-ember;
  }
}
```

---

## 7. Iconographie

Icônes **au trait** (stroke ~1.7–1.8, `currentColor`, pas de remplissage), cohérentes et discrètes.
Le fichier `reference/Icon.tsx` fournit le jeu utilisé (toque, livre, calendrier, panier, loupe,
horloge, convives, plus, envoi, croix, check, copier, corbeille, crayon, flèche retour, patte).
Si vous utilisez déjà `lucide-react`, vous pouvez mapper sur : `ChefHat, BookOpen, Calendar,
ShoppingCart, Search, Clock, Users, Plus, Send, X, Check, Copy, Trash2, Pencil, ArrowLeft`.
Gardez **stroke fin** et la couleur `ember` uniquement pour les icônes d'action.
