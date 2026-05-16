import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@tetap/ui';
import { useAdminSessionStore, useAdminT } from '@tetap/hooks';
import { logoutAdmin } from '../api/backend-admin.js';

export const SignOutDialog = memo(function SignOutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useAdminT();
  const navigate = useNavigate();
  const reset = useAdminSessionStore(state => state.auth.reset);
  const accessToken = useAdminSessionStore(state => state.auth.accessToken);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSignOut = useCallback(async () => {
    if (accessToken) {
      try {
        await logoutAdmin(accessToken);
      } catch {
        // Local state still needs to be cleared if the server already expired the token.
      }
    }

    reset();
    onOpenChange(false);
    void navigate('/sign-in', { replace: true });
  }, [accessToken, navigate, onOpenChange, reset]);
  const handleSignOutClick = useCallback(() => {
    void handleSignOut();
  }, [handleSignOut]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent closeLabel={t('common.close')}>
        <DialogHeader>
          <DialogTitle>{t('webAdmin.layout.signOut.title')}</DialogTitle>
          <DialogDescription>{t('webAdmin.layout.signOut.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleCancel} type="button" variant="outline">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSignOutClick} type="button" variant="destructive">
            {t('webAdmin.layout.signOut.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
