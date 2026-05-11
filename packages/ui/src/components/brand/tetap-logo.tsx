import type { SVGProps } from 'react';

export type TetapLogoProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export const TetapLogo = ({ title = 'TETAP', ...props }: TetapLogoProps) => (
  <svg viewBox="0 0 512 512" fill="none" role={title ? 'img' : undefined} aria-label={title} {...props}>
    <rect x="16" y="16" width="480" height="480" rx="96" fill="#000000" />
    <g stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M182 190 L256 112 L256 352 L314 352" />
      <path d="M182 190 L306 190" />
      <path d="M220 226 L220 315 L256 352" />
      <path d="M220 315 L286 315" />
    </g>
  </svg>
);
