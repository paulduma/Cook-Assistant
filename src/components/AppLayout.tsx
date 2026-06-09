import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { navKeyFromPath, pathFromNavKey, TabKey } from '../lib/nav';
import { TopNav } from './ui/Shell';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  const navigate = useNavigate();
  const active = navKeyFromPath(location.pathname);

  const handleNavigate = (key: TabKey) => {
    navigate(pathFromNavKey(key));
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {!isMobile && (
        <TopNav active={active} onNavigate={handleNavigate} onHome={() => navigate('/')} />
      )}
      <main className="flex-1 min-h-0">{children}</main>
    </div>
  );
}
