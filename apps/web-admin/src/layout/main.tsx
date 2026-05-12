import type { HTMLAttributes } from 'react';
import { cn } from '@tetap/ui';

type AdminMainProps = HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
  fluid?: boolean;
};

export const AdminMain = ({ className, fixed, fluid, ...props }: AdminMainProps) => (
  <main
    className={cn(
      'min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-6',
      fixed && 'flex grow flex-col',
      !fluid && '@7xl/content:mx-auto @7xl/content:w-full @7xl/content:max-w-7xl',
      className,
    )}
    data-layout={fixed ? 'fixed' : 'auto'}
    id="content"
    {...props}
  />
);
