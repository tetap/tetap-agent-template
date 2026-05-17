import * as React from 'react';

import { cn } from '../../lib/utils.js';

type CardDivProps = React.HTMLAttributes<HTMLDivElement> & {
  ref?: React.Ref<HTMLDivElement>;
};

const Card = React.memo(function Card({ className, ref, ...props }: CardDivProps) {
  return (
    <div
      ref={ref}
      className={cn('min-w-0 rounded-xl border bg-card text-card-foreground shadow', className)}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.memo(function CardHeader({ className, ref, ...props }: CardDivProps) {
  return <div ref={ref} className={cn('flex min-w-0 flex-col gap-1.5 p-6', className)} {...props} />;
});
CardHeader.displayName = 'CardHeader';

const CardTitle = React.memo(function CardTitle({ className, ref, ...props }: CardDivProps) {
  return <div ref={ref} className={cn('font-semibold leading-none tracking-tight', className)} {...props} />;
});
CardTitle.displayName = 'CardTitle';

const CardDescription = React.memo(function CardDescription({ className, ref, ...props }: CardDivProps) {
  return <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />;
});
CardDescription.displayName = 'CardDescription';

const CardContent = React.memo(function CardContent({ className, ref, ...props }: CardDivProps) {
  return <div ref={ref} className={cn('min-w-0 p-6 pt-0', className)} {...props} />;
});
CardContent.displayName = 'CardContent';

const CardFooter = React.memo(function CardFooter({ className, ref, ...props }: CardDivProps) {
  return <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />;
});
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
