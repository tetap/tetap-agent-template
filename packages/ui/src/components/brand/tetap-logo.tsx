import type { SVGProps } from 'react';

export type TetapLogoProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export const TetapLogo = ({ title = 'TETAP', ...props }: TetapLogoProps) => (
  <svg viewBox="0 0 64 64" fill="none" role={title ? 'img' : undefined} aria-label={title} {...props}>
    <path d="M32 7 53.65 19.5v25L32 57 10.35 44.5v-25L32 7Z" fill="currentColor" />
    <path d="M20 21h24v7h-8.35v17h-7.3V28H20v-7Z" fill="var(--background)" />
    <path d="M18 42.5h28" stroke="var(--background)" strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
  </svg>
);
