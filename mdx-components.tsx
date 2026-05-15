import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';
import { Figure, Aside, TechStack, Lessons, RepoLink, DemoLink } from '@/components/mdx';
import { cn } from '@/lib/cn';

/**
 * Next.js convention: customizes how MDX elements render across the app.
 * Plain Markdown elements get our typography; custom components (<Figure />
 * etc.) are exposed so MDX files can call them as JSX.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ className, children, ...props }: ComponentPropsWithoutRef<'h1'>) => (
      <h1
        className={cn(
          'mt-12 mb-6 font-display text-h1 leading-[var(--text-h1--line-height)] tracking-[var(--text-h1--letter-spacing)] text-fg',
          className,
        )}
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ className, children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
      <h2
        className={cn(
          'mt-12 mb-4 font-display text-h2 leading-[var(--text-h2--line-height)] tracking-[var(--text-h2--letter-spacing)] text-fg',
          className,
        )}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ className, children, ...props }: ComponentPropsWithoutRef<'h3'>) => (
      <h3
        className={cn(
          'mt-8 mb-3 font-display text-h3 leading-[var(--text-h3--line-height)] text-fg',
          className,
        )}
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ className, children, ...props }: ComponentPropsWithoutRef<'p'>) => (
      <p className={cn('my-4 leading-relaxed text-fg-mute', className)} {...props}>
        {children}
      </p>
    ),
    ul: ({ className, children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
      <ul className={cn('my-4 list-disc pl-6 text-fg-mute marker:text-fg-mute', className)} {...props}>
        {children}
      </ul>
    ),
    ol: ({ className, children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
      <ol className={cn('my-4 list-decimal pl-6 text-fg-mute marker:text-fg-mute', className)} {...props}>
        {children}
      </ol>
    ),
    li: ({ className, children, ...props }: ComponentPropsWithoutRef<'li'>) => (
      <li className={cn('my-1 leading-relaxed', className)} {...props}>
        {children}
      </li>
    ),
    blockquote: ({ className, children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
      <blockquote
        className={cn('my-6 border-l-2 border-accent/60 pl-4 text-fg italic', className)}
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => (
      <code
        className={cn(
          'rounded-md border border-hairline bg-surface/60 px-1.5 py-0.5 font-mono text-[0.85em] text-fg',
          className,
        )}
        {...props}
      >
        {children}
      </code>
    ),
    pre: ({ className, children, ...props }: ComponentPropsWithoutRef<'pre'>) => (
      <pre
        className={cn(
          'my-6 overflow-x-auto rounded-xl border border-hairline bg-surface/80 p-4 font-mono text-sm text-fg',
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    ),
    a: ({ className, href, children, ...props }: ComponentPropsWithoutRef<'a'>) => {
      const isExternal = href && /^(https?:)?\/\//.test(href);
      const cls = cn(
        'text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent',
        className,
      );
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cls}
            {...props}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href ?? '#'} className={cls}>
          {children}
        </Link>
      );
    },
    hr: ({ className, ...props }: ComponentPropsWithoutRef<'hr'>) => (
      <hr className={cn('my-10 border-hairline', className)} {...props} />
    ),

    // Custom components callable from MDX as JSX
    Figure,
    Aside,
    TechStack,
    Lessons,
    RepoLink,
    DemoLink,

    ...components,
  };
}
