import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHatIcon, BookOpenIcon, CalendarIcon, ShoppingCartIcon, SendIcon, SparklesIcon } from 'lucide-react';
export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Please enable OpenAI integration in the Integrations panel to use the AI chat assistant.');
  };
  return <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <ChefHatIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your AI-Powered
          </h1>
          <h2 className="text-5xl font-bold text-emerald-600 mb-6">
            Meal Planning Assistant
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover recipes, plan your weekly meals, and automatically generate
            grocery lists. Make meal planning effortless with AI-powered
            suggestions.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Ask for recipes, plan meals, or get inspired..." className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 shadow-sm" />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
              <BookOpenIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Recipe Library
            </h3>
            <p className="text-gray-600">
              Store, organize, and manage all your favorite recipes in one place
              with smart tagging.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
              <CalendarIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Meal Planner
            </h3>
            <p className="text-gray-600">
              Plan your weekly meals with an intuitive 7-day grid for breakfast,
              lunch, and dinner.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
              <ShoppingCartIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Smart Grocery Lists
            </h3>
            <p className="text-gray-600">
              Automatically generate organized grocery lists from your meal
              plans with smart categorization.
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-12 text-center text-white">
          <SparklesIcon className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-3xl font-bold mb-4">
            Ready to transform your meal planning?
          </h3>
          <p className="text-emerald-50 mb-8 text-lg">
            Start by asking for recipe suggestions or browse your library to
            begin planning.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/recipes')} className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
              Browse Recipes
            </button>
            <button onClick={() => navigate('/planner')} className="px-6 py-3 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors">
              Start Planning
            </button>
          </div>
        </div>
      </div>
    </div>;
}