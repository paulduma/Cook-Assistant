# 🥗 Personal Recipes App (MVP) - WIP

## 🎯 Goal

Create a **personal cooking assistant** that helps save time in everyday life by suggesting recipes I like, helping me **discover new ones**, and **automating meal planning and grocery lists**.

---

## ⚙️ How It Works

The app combines four simple modules:

1. **Chat Assistant** – Conversational AI with two modes (see below), backed by your Supabase recipe carnet
2. **Recipe Library** – Store and edit your favorite recipes
3. **Meal Planner** – Plan the week with drag-and-drop recipes, or from assistant automation
4. **Grocery List** – Auto-generate a grouped shopping list from your planned meals

All data is stored in Supabase (no accounts needed).
The AI assistant uses OpenAI to read your carnet, suggest recipes, plan your week, and guide you while cooking.

---

## 🤖 Chat Assistant — two modes

The assistant picks the mode from what you say. Quick-start chips on the chat screen include *Planifier la semaine* and *Je vais cuisiner*.

### Mode 1 — Week planning

Helps you compose and validate a weekly menu.

- Understands your constraints (time, diet, ingredients to use, number of meals)
- Proposes a **mix of saved recipes + new ideas** (~40–70% from your carnet when it is not empty)
- Iterates on your feedback (swap a dish, simplify a day, etc.)
- On validation (*c'est bon*, *valide*), outputs a structured week plan ready to prefill the meal planner

### Mode 2 — Live cooking

Guides you step by step while you cook a named dish.

- **Looks up your carnet first** by recipe name (exact or close match)
- **If found:** confirms the recipe, recaps ingredients, then walks you through **one step per message**
- **If not found:** proposes a full new recipe, waits for your OK, then guides you the same way
- Adapts on the fly (substitutions, missing ingredients, timing, portions)
- At the end, if you changed the recipe, asks whether to **save or update** it in your carnet

### Wired today vs. next

| Capability | Status |
|------------|--------|
| Chat + carnet context | ✅ |
| Recipe cards from your library | ✅ |
| Add one recipe to planning manually | ✅ |
| Step-by-step cooking in chat | ✅ |
| Save new recipes from chat | ⏳ prompt ready, UI pending |
| Prefill week planning on validation | ⏳ prompt ready, UI pending |
| Update recipe after cooking | ⏳ prompt ready, UI pending |

Prompt and structured output parsing live in `src/lib/openai.ts` and `src/lib/chatRecipes.ts`.

---

## 🧠 Tech Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| Frontend          | Vite + React            |
| Backend / Storage | Supabase                |
| AI                | LLM (OpenAI or similar) |
| Styling           | Tailwind CSS            |

Frontend built with a mix of Lovable and Figma Make for inspiration, and Magic Patterns to finalize and export a first codebase draft
Backend developed with Cursor
AI chatbot embed in MVP will use an OpenAI API key

---

## 🧰 Developer Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/personal-recipes-app.git
cd personal-recipes-app

# 2. Install dependencies
npm install

# 3. Start local dev server
npm run dev
```

### 🔑 Environment Variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_OPENAI_API_KEY=<your-openai-api-key>
```

---

## Work in Progress and Next steps

**Assistant UX wiring**
- Save new recipes from chat (`NOUVELLES_RECETTES_JSON` → Supabase)
- Prefill meal planner on week validation (`PLAN_SEMAINE`)
- Update recipe after a cooking session (`MAJ_RECETTE_JSON`)
- Show step progress during live cooking (`ETAPE_CUISSON`)

**Other**
- Refine chat UI (new-recipe cards, validation flows)
- Refine meal planner UI / UX: easily add recipes (popup, search, simple filters)
- Import recipes from a URL (Instagram, TikTok, etc.)