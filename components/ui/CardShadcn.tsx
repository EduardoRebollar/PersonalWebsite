import * as React from 'react';

import { cn } from '@/lib/cn';

/**
 * shadcn/ui Card primitive set, saved under a distinct name so it does not
 * shadow the project's own link-wrapper [components/ui/Card.tsx].
 *
 * Uses shadcn semantic tokens (bg-card, text-card-foreground, …) that are not
 * defined in this project's Tailwind v4 @theme. Callers typically override
 * background via className (e.g. bg-black/[0.96] in the Spline demo).
 */

const CardShadcn = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  ),
);
CardShadcn.displayName = 'CardShadcn';

const CardShadcnHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
);
CardShadcnHeader.displayName = 'CardShadcnHeader';

const CardShadcnTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardShadcnTitle.displayName = 'CardShadcnTitle';

const CardShadcnDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardShadcnDescription.displayName = 'CardShadcnDescription';

const CardShadcnContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
);
CardShadcnContent.displayName = 'CardShadcnContent';

const CardShadcnFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
);
CardShadcnFooter.displayName = 'CardShadcnFooter';

export {
  CardShadcn,
  CardShadcnHeader,
  CardShadcnFooter,
  CardShadcnTitle,
  CardShadcnDescription,
  CardShadcnContent,
};
