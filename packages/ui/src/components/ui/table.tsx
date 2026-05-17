import * as React from 'react';

import { cn } from '../../lib/utils.js';

type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  ref?: React.Ref<HTMLTableElement>;
};

type TableSectionProps = React.HTMLAttributes<HTMLTableSectionElement> & {
  ref?: React.Ref<HTMLTableSectionElement>;
};

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  ref?: React.Ref<HTMLTableRowElement>;
};

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.Ref<HTMLTableCellElement>;
};

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement> & {
  ref?: React.Ref<HTMLTableCellElement>;
};

type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement> & {
  ref?: React.Ref<HTMLTableCaptionElement>;
};

const Table = React.memo(function Table({ className, ref, ...props }: TableProps) {
  return (
    <div className="relative w-full overflow-x-auto overscroll-x-contain">
      <table ref={ref} className={cn('w-full min-w-max caption-bottom text-sm', className)} {...props} />
    </div>
  );
});
Table.displayName = 'Table';

const TableHeader = React.memo(function TableHeader({ className, ref, ...props }: TableSectionProps) {
  return <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />;
});
TableHeader.displayName = 'TableHeader';

const TableBody = React.memo(function TableBody({ className, ref, ...props }: TableSectionProps) {
  return <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
});
TableBody.displayName = 'TableBody';

const TableFooter = React.memo(function TableFooter({ className, ref, ...props }: TableSectionProps) {
  return (
    <tfoot ref={ref} className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)} {...props} />
  );
});
TableFooter.displayName = 'TableFooter';

const TableRow = React.memo(function TableRow({ className, ref, ...props }: TableRowProps) {
  return (
    <tr
      ref={ref}
      className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)}
      {...props}
    />
  );
});
TableRow.displayName = 'TableRow';

const TableHead = React.memo(function TableHead({ className, ref, ...props }: TableHeadProps) {
  return (
    <th
      ref={ref}
      className={cn(
        'h-10 whitespace-nowrap px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  );
});
TableHead.displayName = 'TableHead';

const TableCell = React.memo(function TableCell({ className, ref, ...props }: TableCellProps) {
  return (
    <td
      ref={ref}
      className={cn(
        'whitespace-nowrap p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  );
});
TableCell.displayName = 'TableCell';

const TableCaption = React.memo(function TableCaption({ className, ref, ...props }: TableCaptionProps) {
  return <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />;
});
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
