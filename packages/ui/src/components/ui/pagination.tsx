import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '../../lib/utils.js';
import type { ButtonProps } from './button.js';
import { buttonVariants } from './button.js';

const Pagination = React.memo(function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label="pagination" className={cn('mx-auto flex w-full justify-center', className)} {...props} />;
});
Pagination.displayName = 'Pagination';

type PaginationContentProps = React.ComponentProps<'ul'> & {
  ref?: React.Ref<HTMLUListElement>;
};

type PaginationItemProps = React.ComponentProps<'li'> & {
  ref?: React.Ref<HTMLLIElement>;
};

const PaginationContent = React.memo(function PaginationContent({ className, ref, ...props }: PaginationContentProps) {
  return <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />;
});
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.memo(function PaginationItem({ className, ref, ...props }: PaginationItemProps) {
  return <li ref={ref} className={cn('', className)} {...props} />;
});
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
  ref?: React.Ref<HTMLAnchorElement>;
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>;

const PaginationLink = React.memo(function PaginationLink({
  className,
  isActive,
  ref,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  return (
    <a
      ref={ref}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        className,
      )}
      {...props}
    />
  );
});
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = React.memo(function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn('gap-1 pl-2.5', className)}
      {...props}>
      <ChevronLeft className="size-4" />
      <span>Previous</span>
    </PaginationLink>
  );
});
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = React.memo(function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink aria-label="Go to next page" size="default" className={cn('gap-1 pr-2.5', className)} {...props}>
      <span>Next</span>
      <ChevronRight className="size-4" />
    </PaginationLink>
  );
});
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = React.memo(function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span aria-hidden className={cn('flex size-9 items-center justify-center', className)} {...props}>
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
});
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
