import { memo, useCallback, useState, type ComponentProps, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useAdminT } from '@tetap/hooks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from '@tetap/ui';

type ConfirmActionButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  children: ReactNode;
  description: string;
  onConfirm: () => void;
  pending?: boolean;
  title: string;
};

export const ConfirmActionButton = memo(function ConfirmActionButton({
  children,
  description,
  disabled,
  onConfirm,
  pending,
  title,
  ...buttonProps
}: ConfirmActionButtonProps) {
  const t = useAdminT();
  const [open, setOpen] = useState(false);
  const openDialog = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <Button disabled={disabled} onClick={openDialog} {...buttonProps}>
        {pending ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
        {children}
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction disabled={pending} onClick={onConfirm}>
            {pending ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : null}
            {t('common.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
