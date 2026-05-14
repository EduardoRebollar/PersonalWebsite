import { Container } from '@/components/ui/Container';
import { site } from '@/content/data/site';

/**
 * Phase 1 / Step 3 placeholder. Replaced in Step 4 by the real Hero, and the
 * remaining 6 sections (About, Education, Experience, Skills, Projects, Contact)
 * land in Step 7.
 */
export default function HomePage() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100dvh] items-center"
    >
      <Container className="flex flex-col gap-6 pt-32 pb-24">
        <p className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">
          PLACEHOLDER · Phase 1 / Step 3 shell
        </p>
        <h1
          id="hero-heading"
          className="font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] tracking-[var(--text-display--letter-spacing)] text-fg"
        >
          {site.name}
        </h1>
        <p className="max-w-prose font-sans text-lg text-fg-mute md:text-xl">{site.tagline}</p>
        <div className="mt-2 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]"
          />
          <span className="font-mono text-[11px] tracking-wider text-fg-mute uppercase">
            real Hero, terrain, and remaining sections wire up in Steps 4–7
          </span>
        </div>
      </Container>
    </section>
  );
}
