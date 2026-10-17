# 🥗 Personal Recipes App (MVP) - WIP

## 🎯 Goal

Create a **personal cooking assistant** that helps save time in everyday life by suggesting recipes I like, helping me **discover new ones**, and **automating meal planning and grocery lists**.
This is a project I launched this summer to train myself of building a real end-to-end produc AI conversational product. The app is live at [https://verdi-cooking.vercel.app/](https://verdi-cooking.vercel.app/). 


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
- **Asks questions** if you haven't given clear direction yet
- **Surfaces 5–6 matching ideas from your carnet** once intent is clear, then iterates with you
- Adds **new recipes only when the carnet doesn't cover** what you want
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
| Save new recipes from chat | ✅ |
| Prefill week planning on validation | ✅ |
| Update recipe after cooking | ✅ |
| Cooking session progress bar | ✅ |

Prompt and structured output parsing live in `src/lib/openai.ts` and `src/lib/chatRecipes.ts`.

Full product spec: [doc/ASSISTANT_PRD.md](./doc/ASSISTANT_PRD.md).

---

## 🧠 Tech Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| Frontend          | Vite + React            |
| Backend / Storage | Supabase                |
| AI                | LLM (OpenAI or similar) |
| Styling           | Tailwind CSS            |
| Hosting           | Vercel                  |

Frontend built with a mix of Lovable and Figma Make for inspiration, and Magic Patterns to finalize and export a first codebase draft
Backend developed with Cursor and Claude Code
AI chatbot uses an OpenAI API key