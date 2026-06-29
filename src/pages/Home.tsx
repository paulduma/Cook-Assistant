import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Kicker } from '../components/ui/primitives';
import { Icon } from '../components/ui/Icon';
import { MobileScreen, MobileTopBar, MobileTabBar } from '../components/ui/MobileShell';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { pathFromNavKey, TabKey } from '../lib/nav';

const FEATURES: { num: string; title: string; sub: string; path: string }[] = [
  {
    num: '01',
    title: 'Nos recettes',
    sub: 'Le carnet maison, écrit à quatre mains.',
    path: '/recipes',
  },
  {
    num: '02',
    title: 'Le planning',
    sub: 'Chaque repas de la semaine, à sa place.',
    path: '/planning',
  },
  {
    num: '03',
    title: 'Liste de courses',
    sub: 'Générée depuis le planning, prête à imprimer.',
    path: '/grocery',
  },
];

function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return Math.ceil((days + start.getDay() + 1) / 7);
}

export function Home() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const weekNum = getWeekNumber();

  const handleNavTab = (key: TabKey) => navigate(pathFromNavKey(key));
  const goHome = () => navigate('/');

  const handleAsk = (query: string) => {
    const trimmed = query.trim();
    navigate('/chat', trimmed ? { state: { initialMessage: trimmed } } : undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(prompt);
  };

  const searchForm = (compact = false) => (
    <form
      onSubmit={handleSubmit}
      className={[
        'flex items-center gap-3 border-b-[1.5px] border-ink text-left',
        compact ? 'gap-3 pb-2.5 mb-2' : 'gap-3.5 max-w-[560px] mx-auto pb-3',
      ].join(' ')}
    >
      <Icon
        name="search"
        size={compact ? 18 : 20}
        strokeWidth={1.6}
        className="text-muted shrink-0"
      />
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="À la recherche d'inspiration…"
        className={[
          'flex-1 bg-transparent outline-none text-ink placeholder:text-muted placeholder:italic',
          compact ? 'text-[15.5px]' : 'text-[18px]',
        ].join(' ')}
      />
      <button
        type="submit"
        className={[
          'rounded-full bg-ember text-creamlight flex items-center justify-center shrink-0 cursor-pointer border-0',
          compact ? 'w-[38px] h-[38px]' : 'w-[42px] h-[42px]',
        ].join(' ')}
        aria-label="Ouvrir l'assistant"
      >
        <Icon name="send" size={compact ? 17 : 19} strokeWidth={1.7} />
      </button>
    </form>
  );

  if (isMobile) {
    return (
      <MobileScreen
        top={<MobileTopBar wordmark onHome={goHome} />}
        bottom={<MobileTabBar active="" onNavigate={handleNavTab} />}
      >
        <div className="px-6 pt-[34px] pb-6 text-center">
          <Kicker className="mb-4">Le menu de la semaine · N°{weekNum}</Kicker>
          <h1 className="font-display text-[34px] text-ink m-0 mb-4">
            Qu'est-ce qu'on mange cette semaine&nbsp;?
          </h1>
          <p className="text-[16px] text-ink-soft italic leading-[1.5] m-0 mb-7">
            On compose le planning, la liste de courses suit toute seule.
          </p>
          {searchForm(true)}
          <div className="font-label text-[10px] uppercase tracking-wide text-muted text-left mb-7">
            Touchez pour discuter avec l'assistant →
          </div>
          <div className="text-left">
            {FEATURES.map(({ num, title, sub, path }) => (
              <button
                key={num}
                type="button"
                onClick={() => navigate(path)}
                className="flex gap-3.5 pt-5 pb-[15px] border-b border-line-soft w-full text-left bg-transparent border-x-0 border-t-0 cursor-pointer"
              >
                <div className="font-display text-[22px] text-ember w-[30px] shrink-0">{num}</div>
                <div>
                  <div className="font-label text-[11px] font-semibold uppercase tracking-wide text-ink mb-0.5">
                    {title}
                  </div>
                  <div className="text-[14.5px] text-ink-soft leading-[1.4]">{sub}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </MobileScreen>
    );
  }

  return (
    <div className="bg-paper min-h-full">
      <div className="max-w-[860px] mx-auto px-[52px] pt-[60px] text-center">
        <Kicker className="mb-[22px]">Le menu de la semaine · N°{weekNum}</Kicker>
        <h1 className="font-display text-[60px] leading-[1.04] text-ink m-0 mb-[22px]">
          Qu'est-ce qu'on
          <br />
          mange cette semaine&nbsp;?
        </h1>
        <p className="text-[18.5px] text-ink-soft italic leading-[1.5] m-0 mb-10">
          On compose le planning, la liste de courses suit toute seule.
        </p>
        {searchForm()}
      </div>

      <div className="max-w-[1000px] mx-auto px-[52px] mt-[72px] pb-16">
        <div className="border-t border-line pt-[34px] grid grid-cols-3">
          {FEATURES.map(({ num, title, sub, path }, i) => (
            <button
              key={num}
              type="button"
              onClick={() => navigate(path)}
              className={[
                'text-left px-[30px] pt-6 bg-transparent border-0 cursor-pointer hover:bg-cream/60 transition-colors',
                i < 2 ? 'border-r border-line' : '',
              ].join(' ')}
            >
              <div className="font-display text-[30px] text-ember mb-3">{num}</div>
              <div className="font-label text-[12.5px] font-semibold uppercase tracking-[0.10em] text-ink mb-2">
                {title}
              </div>
              <div className="text-[15.5px] text-ink-soft leading-[1.5]">{sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
