import { Container } from './Container';
import { site } from '@/content/data/site';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-hairline bg-base/40 py-8 backdrop-blur-sm">
      <Container className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="font-mono text-[11px] tracking-wider text-fg-mute uppercase">
          © {year} {site.name}
        </p>
        <p className="font-mono text-[11px] tracking-wider text-fg-mute uppercase">
          designed &amp; built with care · Los Angeles
        </p>
      </Container>
    </footer>
  );
}
