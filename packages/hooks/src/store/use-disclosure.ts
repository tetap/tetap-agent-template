import { useCallback, useMemo, useState } from 'react';

export type UseDisclosureOptions = {
  defaultOpen?: boolean;
};

export const useDisclosure = ({ defaultOpen = false }: UseDisclosureOptions = {}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(currentValue => !currentValue), []);

  return useMemo(
    () => ({
      close,
      isOpen,
      open,
      setIsOpen,
      toggle,
    }),
    [close, isOpen, open, toggle],
  );
};
