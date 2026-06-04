import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHatIcon, BookOpenIcon, CalendarIcon, ShoppingCartIcon, SendIcon } from 'lucide-react';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    navigate('/chat', { state: { initialMessage: prompt.trim() } });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <ChefHatIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Qu'est-ce qu'on
          </h1>
          <h2 className="text-5xl font-bold text-emerald-600 mb-6">
            mange cette semaine ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Générer une liste de courses et de recettes pour la semaine.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="A la recherche d'inspiration..."
              className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={!prompt.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </form>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="text-center p-4 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
              <BookOpenIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Recettes enregistées
            </h3>
            <p className="text-gray-600">
              Ma bibliothèque de recettes perso
            </p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/planning')}
            className="text-center p-4 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
              <CalendarIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Planning
            </h3>
            <p className="text-gray-600">
              Planification de ma semaine
            </p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/grocery')}
            className="text-center p-4 rounded-xl hover:bg-emerald-50 transition-colors"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4">
              <ShoppingCartIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Listes de courses
            </h3>
            <p className="text-gray-600">
              Génération automatique de ma liste de courses
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
