// reference/Shell.tsx
// En-tête de navigation éditorial + conteneur d'écran (desktop).
// Le titre « Chez Verdi » est conservé. Les liens de nav sont neutres :
// branchez-les sur votre router (React Router <Link to> ou onClick).

import React from 'react';
import { Icon } from './Icon';

type NavKey = 'recettes' | 'planning' | 'courses' | '';

export function TopNav({
  active = '',
  onNavigate, // ⟵ BRANCHER votre navigation (router)
}: {
  active?: NavKey;
  onNavigate?: (key: NavKey) => void;
}) {
  const items: [NavKey, string][] = [
    ['recettes', 'Recettes'],
    ['planning', 'Planning'],
    ['courses', 'Liste de courses'],
  ];
  return (
    <header className="h-[86px] flex items-center justify-between px-[52px] bg-cream border-b border-line">
      <div className="flex items-center gap-3">
        <div className="w-[38px] h-[38px] rounded-full border-[1.5px] border-ember flex items-center justify-center text-ember shrink-0">
          <Icon name="hat" size={20} strokeWidth={1.6} />
        </div>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-[27px] tracking-wide text-ink whitespace-nowrap">
            Chez Verdi
          </span>
          <span className="font-label text-[11px] font-semibold uppercase tracking-kicker text-muted">
            cuisine maison
          </span>
        </div>
      </div>
      <nav className="flex items-center gap-9">
        {items.map(([key, label]) => {
          const on = active === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate?.(key)}
              className={[
                'font-label text-[12.5px] uppercase tracking-[0.10em] cursor-pointer pb-1 bg-transparent border-0',
                on
                  ? 'text-ink font-semibold border-b-[1.5px] border-ember'
                  : 'text-ink-soft font-medium border-b-[1.5px] border-transparent',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

/* Conteneur d'écran : fond papier + nav optionnelle. */
export function Screen({
  active,
  onNavigate,
  nav = true,
  children,
}: {
  active?: NavKey;
  onNavigate?: (key: NavKey) => void;
  nav?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink font-body antialiased flex flex-col">
      {nav && <TopNav active={active} onNavigate={onNavigate} />}
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
}
