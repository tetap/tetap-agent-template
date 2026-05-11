import type { ReactNode } from 'react';
import { TetapLogo } from '@tetap/ui';
import { useAdminT } from '@tetap/hooks';

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  const t = useAdminT();

  return (
    <main className="container grid h-svh max-w-none items-center justify-center">
      <section className="mx-auto flex w-full flex-col justify-center gap-2 py-8 sm:p-8">
        <div className="mb-4 flex items-center justify-center gap-2">
          <TetapLogo className="size-6" />
          <h1 className="text-xl font-medium">{t('webAdmin.title')}</h1>
        </div>
        {children}
      </section>
    </main>
  );
};
