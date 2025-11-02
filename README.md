# 🥗 Personal Recipes App (MVP)

## 🎯 Goal

Create a **personal cooking assistant** that helps save time in everyday life by suggesting recipes I like, helping me **discover new ones**, and **automating meal planning and grocery lists**.

---

## ⚙️ How It Works

The app combines four simple modules:

1. **Chat Assistant** – Ask for inspiration to an LLM that can query into my saved recipes or suggest new ones (from web search)
2. **Recipe Library** – Store and edit your favorite recipes
3. **Meal Planner** – Plan the week with drag-and-drop recipes, or from assistant automation
4. **Grocery List** – Auto-generate a grouped shopping list from your planned meals

All data is stored locally using Supabase (no accounts needed).
The AI assistant uses an LLM to find, summarize, and suggest recipes that fit your preferences.

---

## 🧠 Tech Stack

| Layer             | Technology              |
| ----------------- | ----------------------- |
| Frontend          | Vite + React            |
| Backend / Storage | Supabase                |
| AI                | LLM (OpenAI or similar) |
| Styling           | Tailwind CSS            |

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