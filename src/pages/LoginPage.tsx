import React, { useState } from 'react';
import { Icon } from '../components/ui/Icon';
import { Button, Kicker } from '../components/ui/primitives';
import { grantAccess } from '../lib/appAccess';

interface LoginPageProps {
  onSuccess: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    if (grantAccess(code)) {
      onSuccess();
      return;
    }

    setError('Code incorrect.');
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px] bg-cream border border-line px-10 py-12 text-center">
        <div className="w-[52px] h-[52px] rounded-full border-[1.5px] border-ember flex items-center justify-center text-ember mx-auto mb-6">
          <Icon name="hat" size={26} strokeWidth={1.6} />
        </div>

        <Kicker className="mb-3">Accès privé</Kicker>
        <h1 className="font-display text-[34px] text-ink m-0 mb-2">Chez Verdi</h1>
        <p className="text-[16px] text-ink-soft italic leading-[1.5] m-0 mb-9">
          Cette application est réservée à la maison.
        </p>

        <form onSubmit={handleSubmit} className="text-left">
          <label className="block mb-6">
            <Kicker className="text-ink-soft mb-2">Code d&apos;accès</Kicker>
            <input
              type="password"
              autoComplete="current-password"
              autoFocus
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                if (error) setError('');
              }}
              placeholder="Entrez le code"
              className="w-full bg-transparent border-b-[1.5px] border-line focus:border-ink
                         outline-none py-2 text-[17px] text-ink placeholder:text-muted placeholder:italic"
            />
          </label>

          {error && (
            <p className="font-label text-[12px] uppercase tracking-[0.10em] text-ember-dark mb-4">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="solid"
            className="w-full justify-center"
            disabled={submitting || code.trim().length === 0}
          >
            Entrer
          </Button>
        </form>
      </div>
    </div>
  );
}
