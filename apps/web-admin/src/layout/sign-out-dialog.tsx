import { useNavigate } from 'react-router';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@tetap/ui';
import { useAdminSessionStore, useAdminT } from '@tetap/hooks';

export const SignOutDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const t = useAdminT();
  const navigate = useNavigate();
  const reset = useAdminSessionStore(state => state.auth.reset);

  const handleSignOut = () => {
    reset();
    onOpenChange(false);
    void navigate('/sign-in', { replace: true });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent closeLabel={t('common.close')}>
        <DialogHeader>
          <DialogTitle>{t('webAdmin.layout.signOut.title')}</DialogTitle>
          <DialogDescription>{t('webAdmin.layout.signOut.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSignOut} type="button" variant="destructive">
            {t('webAdmin.layout.signOut.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
