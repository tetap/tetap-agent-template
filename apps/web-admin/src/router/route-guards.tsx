import { memo, useCallback, useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAdminSessionStore } from '@tetap/hooks';
import { fetchAdminBootstrap } from '../api/backend-admin.js';
import { toSessionMenus } from '../pages/auth/auth-session.js';

export const ProtectedRoute = memo(function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAuthenticated = useAdminSessionStore(state => state.auth.isAuthenticated());
  const accessToken = useAdminSessionStore(state => state.auth.accessToken);
  const currentUser = useAdminSessionStore(state => state.auth.user);
  const reset = useAdminSessionStore(state => state.auth.reset);
  const setContext = useAdminSessionStore(state => state.auth.setContext);

  const refreshSessionContext = useCallback(
    async (isActive: () => boolean) => {
      if (!accessToken) {
        return;
      }

      try {
        const bootstrap = await fetchAdminBootstrap(accessToken);

        if (!isActive()) {
          return;
        }

        setContext({
          user: {
            accountNo: bootstrap.user.id,
            email: bootstrap.user.email,
            exp: currentUser?.exp ?? Math.floor(Date.now() / 1000) + 60 * 60,
            isSuperAdmin: bootstrap.user.isSuperAdmin,
            name: bootstrap.user.username,
            roles: bootstrap.user.roleCodes,
          },
          capabilities: bootstrap.capabilities,
          menus: toSessionMenus(bootstrap.menus),
        });
      } catch {
        if (isActive()) {
          reset();
        }
      }
    },
    [accessToken, currentUser?.exp, reset, setContext],
  );

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isActive = true;

    void refreshSessionContext(() => isActive);

    return () => {
      isActive = false;
    };
  }, [accessToken, refreshSessionContext]);

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);

    return <Navigate replace to={`/sign-in?redirect=${redirect}`} />;
  }

  return children;
});

export const PermissionRoute = memo(function PermissionRoute({
  children,
  permission,
}: {
  children: ReactNode;
  permission: string;
}) {
  const can = useAdminSessionStore(state => state.auth.can);

  if (!can(permission)) {
    return <Navigate replace to="/errors/forbidden" />;
  }

  return children;
});
