import React, { useState } from 'react';
import { hasStoredAccess, isAccessGateEnabled } from '../lib/appAccess';
import { LoginPage } from '../pages/LoginPage';

export function AppAccessGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(hasStoredAccess);

  if (!isAccessGateEnabled() || authed) {
    return <>{children}</>;
  }

  return <LoginPage onSuccess={() => setAuthed(true)} />;
}
