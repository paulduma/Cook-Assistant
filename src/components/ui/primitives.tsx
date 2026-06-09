import React from 'react';
import { Icon, IconName } from './Icon';

export function Kicker({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-label text-[11px] font-semibold uppercase tracking-kicker text-ember ${className}`}
    >
      {children}
    </div>
  );
}

type BtnVariant = 'solid' | 'outline' | 'danger' | 'ghost';

export function Button({
  children,
  icon,
  variant = 'outline',
  className = '',
  ...rest
}: {
  children?: React.ReactNode;
  icon?: IconName;
  variant?: BtnVariant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex items-center gap-2 whitespace-nowrap font-label text-[12.5px] font-semibold ' +
    'uppercase tracking-[0.12em] px-5 py-3 transition-colors cursor-pointer';
  const variants: Record<BtnVariant, string> = {
    solid: 'bg-ember text-creamlight hover:bg-ember-dark border border-ember',
    outline: 'bg-transparent text-ink border border-ink hover:bg-ink hover:text-creamlight',
    danger: 'bg-transparent text-ember-dark border border-line hover:border-ember-dark',
    ghost: 'bg-transparent text-ember border-0 px-0 py-0 hover:text-ember-dark',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={16} strokeWidth={1.9} />}
      {children}
    </button>
  );
}

export function SectionRule({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 mb-1">
      <h2 className="font-display text-2xl text-ink m-0">{children}</h2>
      <span className="flex-1 border-t border-line" />
    </div>
  );
}

export function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <label className="block mb-5">
      <Kicker className="text-ink-soft mb-2">{label}</Kicker>
      <input
        className="w-full bg-transparent border-b-[1.5px] border-line focus:border-ink
                   outline-none py-2 text-[17px] text-ink placeholder:text-muted placeholder:italic"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  );
}

export function Thumb({
  label = 'photo',
  className = '',
  src,
}: {
  label?: string;
  className?: string;
  src?: string | null;
}) {
  if (src) {
    return <img src={src} alt="" className={`object-cover ${className}`} />;
  }
  return (
    <div
      className={`flex items-center justify-center bg-ember-soft ${className}`}
      style={{
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(181,83,42,0.16) 0 1px, transparent 1px 11px)',
      }}
    >
      <span className="font-label text-[10px] uppercase tracking-wider text-ember bg-ember-soft px-2 py-1">
        {label}
      </span>
    </div>
  );
}

export function AssistantAvatar({ size = 38 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-ember-soft border border-line flex items-center justify-center shrink-0 text-ember"
      style={{ width: size, height: size }}
    >
      <Icon name="hat" size={Math.round(size * 0.52)} strokeWidth={1.6} />
    </div>
  );
}
