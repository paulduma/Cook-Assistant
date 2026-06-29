import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasStoredAccess, isAccessGateEnabled } from '../lib/appAccess';
import { LoginPage } from '../pages/LoginPage';

export function AppAccessGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(hasStoredAccess);

  const handleSuccess = () => {
    setAuthed(true);
    navigate('/', { replace: true });
  };

  if (!isAccessGateEnabled() || authed) {
    return <>{children}</>;
  }

  return <LoginPage onSuccess={handleSuccess} />;
}
