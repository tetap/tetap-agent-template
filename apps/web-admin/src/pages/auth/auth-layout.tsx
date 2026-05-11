import type { ReactNode } from 'react';

export const AuthLayout = ({ children }: { children: ReactNode }) => (
  <main>
    <section>{children}</section>
  </main>
);
