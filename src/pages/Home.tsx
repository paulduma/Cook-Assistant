import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHatIcon, BookOpenIcon, CalendarIcon, ShoppingCartIcon, SendIcon, SparklesIcon, LoaderIcon } from 'lucide-react';
import { chatWithOpenAI, isOpenAIConfigured, ChatMessage } from '../lib/openai';
import { localStorageHelper } from '../lib/supabase';
import { Recipe } from '../types/recipe';

export function Home() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load recipes for context
  useEffect(() => {
    const loadedRecipes = localStorageHelper.getRecipes();
    setRecipes(loadedRecipes);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;

    // Check if OpenAI is configured
    if (!isOpenAIConfigured()) {
      setError('OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your .env file and restart the dev server.');
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt.trim(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);
    setError(null);

    try {
      // Send to OpenAI with recipe context
      const response = await chatWithOpenAI([...messages, userMessage], recipes);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response from AI';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <ChefHatIcon className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            My AI Powered
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
        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto mb-16">
          {/* Messages Display */}
          {messages.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-4 p-6 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Ask for recipes, plan meals, or get inspired..."
                disabled={isLoading}
                className="w-full px-6 py-4 pr-14 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <SendIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <div className="text-center mt-4">
              <button
                onClick={() => {
                  setMessages([]);
                  setError(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear chat history
              </button>
            </div>
          )}
        </div>
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