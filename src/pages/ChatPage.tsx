import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ChefHatIcon, SendIcon, LoaderIcon, Trash2Icon } from 'lucide-react';
import { chatWithOpenAI, isOpenAIConfigured, ChatMessage } from '../lib/openai';
import { localStorageHelper } from '../lib/supabase';
import { Recipe } from '../types/recipe';

export function ChatPage() {
  const location = useLocation();
  const initialMessage = (location.state as { initialMessage?: string } | null)?.initialMessage;

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasSentInitial = useRef(false);

  useEffect(() => {
    setRecipes(localStorageHelper.getRecipes());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    if (!isOpenAIConfigured()) {
      setError("Clé API OpenAI introuvable. Ajoutez VITE_OPENAI_API_KEY dans votre fichier .env puis redémarrez le serveur de développement.");
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setPrompt('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatWithOpenAI(updatedMessages, recipes);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Impossible d'obtenir une réponse de l'IA";
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialMessage && !hasSentInitial.current) {
      hasSentInitial.current = true;
      sendMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(prompt);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
              <ChefHatIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Comment puis-je vous aider ?
            </h1>
            <p className="text-gray-500 max-w-md">
              Demandez-moi des idées de recettes, un planning de la semaine ou une liste de courses.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
              >
                {message.role === 'assistant' ? (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <ChefHatIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500 text-white rounded-2xl px-4 py-3 max-w-[80%]">
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <ChefHatIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2 pt-1 text-gray-500">
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                  <span className="text-sm">L'IA réfléchit...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 pb-2">
          <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto">
          {messages.length > 0 && (
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Trash2Icon className="w-3.5 h-3.5" />
                Nouvelle conversation
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-end bg-gray-50 border border-gray-200 rounded-2xl shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-colors">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Envoyez un message..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none bg-transparent px-4 py-3.5 pr-14 text-base text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed max-h-32"
                style={{ minHeight: '52px' }}
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="absolute right-2 bottom-2 p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <SendIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              Entrée pour envoyer · Maj+Entrée pour un retour à la ligne
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
