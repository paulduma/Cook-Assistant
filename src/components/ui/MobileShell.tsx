import React from 'react';
import { Icon, IconName } from './Icon';
import { TabKey } from '../../lib/nav';

export function MobileWordmark({
  onHome,
  className = '',
}: {
  onHome?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onHome}
      className={[
        'flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 text-left',
        className,
      ].join(' ')}
      aria-label="Accueil"
    >
      <span className="w-[30px] h-[30px] rounded-full border-[1.4px] border-ember flex items-center justify-center shrink-0 text-ember">
        <Icon name="hat" size={16} strokeWidth={1.6} />
      </span>
      <span className="font-display text-[22px] text-ink tracking-wide">Chez Verdi</span>
    </button>
  );
}

export function MobileTopBar({
  title,
  back,
  wordmark,
  onBack,
  onHome,
}: {
  title?: string;
  back?: boolean;
  wordmark?: boolean;
  onBack?: () => void;
  onHome?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-[18px] pb-3 bg-cream border-b border-line shrink-0"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}
    >
      {back && (
        <button
          onClick={onBack}
          className="w-[30px] h-[30px] flex items-center justify-center shrink-0 text-ember bg-transparent border-0 cursor-pointer"
          aria-label="Retour"
        >
          <Icon name="arrowLeft" size={22} strokeWidth={1.9} />
        </button>
      )}
      {wordmark ? (
        <MobileWordmark onHome={onHome} className="flex-1" />
      ) : (
        <>
          {onHome && (
            <button
              type="button"
              onClick={onHome}
              className="w-[30px] h-[30px] rounded-full border-[1.4px] border-ember flex items-center justify-center shrink-0 text-ember bg-transparent cursor-pointer"
              aria-label="Accueil"
            >
              <Icon name="hat" size={16} strokeWidth={1.6} />
            </button>
          )}
          <span className="font-display text-[21px] text-ink flex-1">{title}</span>
        </>
      )}
    </div>
  );
}

export function MobileTabBar({
  active,
  onNavigate,
}: {
  active: TabKey;
  onNavigate?: (key: TabKey) => void;
}) {
  const tabs: [TabKey, string, IconName][] = [
    ['assistant', 'Assistant', 'hat'],
    ['recettes', 'Recettes', 'book'],
    ['planning', 'Planning', 'calendar'],
    ['courses', 'Liste', 'cart'],
  ];
  return (
    <nav
      className="bg-cream border-t border-line flex px-4 pt-2.5 shrink-0"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      {tabs.map(([key, label, icon]) => {
        const on = active === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate?.(key)}
            className="flex-1 flex flex-col items-center gap-1 bg-transparent border-0 cursor-pointer"
          >
            <Icon
              name={icon}
              size={23}
              strokeWidth={1.7}
              className={on ? 'text-ember' : 'text-muted'}
            />
            <span
              className={[
                'font-label text-[10px] uppercase tracking-wide',
                on ? 'text-ember font-semibold' : 'text-muted font-medium',
              ].join(' ')}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function MobileScreen({
  top,
  bottom,
  children,
  scroll = true,
}: {
  top: React.ReactNode;
  bottom?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <div className="h-[100dvh] flex flex-col bg-paper text-ink font-body antialiased">
      {top}
      <div className={`flex-1 min-h-0 ${scroll ? 'overflow-auto' : 'overflow-hidden flex flex-col'}`}>
        {children}
      </div>
      {bottom}
    </div>
  );
}
