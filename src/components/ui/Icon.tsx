import React from 'react';

const PATHS: Record<string, string> = {
  hat: 'M7.6 14.5h8.8v4.4a1.5 1.5 0 0 1-1.5 1.5H9.1a1.5 1.5 0 0 1-1.5-1.5z M7.7 15a4 4 0 0 1-1.3-7.8 3.2 3.2 0 0 1 3-3.1 3.4 3.4 0 0 1 5.2 0 3.2 3.2 0 0 1 3 3.1A4 4 0 0 1 16.3 15 M9.6 14.6v3.4 M12 14.6v3.4 M14.4 14.6v3.4',
  book: 'M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5z M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5A1.5 1.5 0 0 0 20 17.5z',
  calendar: 'M3.5 5h17a0 0 0 0 1 0 0v13a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V5z M3.5 9.5h17 M8 3.5v3 M16 3.5v3',
  cart: 'M3 4h2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.3a1.5 1.5 0 0 0 1.47-1.16L21 8H6 M9.5 19.5a1.3 1.3 0 1 0 0-.01 M17.5 19.5a1.3 1.3 0 1 0 0-.01',
  search: 'M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z M20 20l-3.8-3.8',
  clock: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z M12 7.5V12l3 2',
  users: 'M9 5.3a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z M3.5 19a5.5 5.5 0 0 1 11 0 M16 6.2a3.2 3.2 0 0 1 0 6 M17.5 19a5.5 5.5 0 0 0-2.2-4.4',
  plus: 'M12 5v14 M5 12h14',
  send: 'M21 3L3 10.5l7 2.5 2.5 7z M21 3l-9 9',
  x: 'M6 6l12 12 M18 6L6 18',
  check: 'M4 12.5l5 5 11-11',
  copy: 'M8 8h12v12H8z M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2',
  trash: 'M4 7h16 M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2 M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 20L18 7',
  edit: 'M14.5 5.5l4 4 M4 20l1-4L16 5a2 2 0 0 1 3 3L8 19z',
  arrowLeft: 'M11 5l-6 7 6 7 M5 12h14',
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  className = '',
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name].split(' M').map((d, i) => (
        <path key={i} d={i === 0 ? d : 'M' + d} />
      ))}
    </svg>
  );
}
