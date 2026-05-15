import type { ReactNode } from 'react';

type LessonsProps = {
  title?: string;
  children: ReactNode;
};

export function Lessons({ title = 'Lessons', children }: LessonsProps) {
  return (
    <section className="my-10 border-t border-hairline pt-6 not-prose">
      <p className="mb-4 font-mono text-[11px] tracking-[0.18em] text-accent uppercase">
        {title}
      </p>
      <div className="space-y-2 text-fg-mute leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:marker:text-accent/60 [&_li]:pl-1">
        {children}
      </div>
    </section>
  );
}
