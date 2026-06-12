'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  Download,
  FileText,
  Mail,
  MapPin,
} from 'lucide-react';

/** Shared shape for both lucide icons and the inline brand marks below, so they
 *  can sit in the same channel map. */
type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

/* lucide v1 dropped its brand glyphs — inline the GitHub / LinkedIn marks from
   the design handoff (filled, so strokeWidth is accepted but ignored). */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.79-4.58 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}
import { ShinyButton } from '@/components/ui/cta/ShinyButton';
import { Container } from '@/components/ui/primitives/Container';
import { WaveText } from '@/components/ui/wave-text';
import { site } from '@/content/data/site';
import { cn } from '@/lib/cn';

const TZ = 'America/Los_Angeles';
const RESPONSE = '48 hrs';

const github = site.socials.find((s) => s.label === 'GitHub');
const linkedin = site.socials.find((s) => s.label === 'LinkedIn');

type Channel = {
  id: string;
  Icon: IconType;
  label: string;
  value: string;
  href: string;
  kind: 'copy' | 'ext' | 'download';
  action: string;
};

const CHANNEL_LIST: (Channel | null)[] = [
  {
    id: 'personal',
    Icon: Mail,
    label: 'Personal',
    value: site.email.primary,
    href: `mailto:${site.email.primary}`,
    kind: 'copy',
    action: 'Copy',
  },
  site.email.secondary
    ? {
        id: 'occidental',
        Icon: Mail,
        label: 'Occidental',
        value: site.email.secondary,
        href: `mailto:${site.email.secondary}`,
        kind: 'copy',
        action: 'Copy',
      }
    : null,
  github
    ? {
        id: 'github',
        Icon: GithubIcon,
        label: 'GitHub',
        value: github.handle ?? github.href,
        href: github.href,
        kind: 'ext',
        action: 'Open',
      }
    : null,
  linkedin
    ? {
        id: 'linkedin',
        Icon: LinkedinIcon,
        label: 'LinkedIn',
        value: linkedin.handle ?? linkedin.href,
        href: linkedin.href,
        kind: 'ext',
        action: 'Open',
      }
    : null,
  {
    id: 'resume',
    Icon: FileText,
    label: 'Résumé',
    value: 'resume.pdf',
    href: site.resumeHref ?? '/resume.pdf',
    kind: 'download',
    action: 'PDF',
  },
];

const CHANNELS: Channel[] = CHANNEL_LIST.filter((c): c is Channel => c !== null);

/** Live wall-clock in LA, 24-hour. Renders a stable placeholder until mounted to
 *  avoid an SSR/client hydration mismatch on the ticking value. */
function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // Seed on the next frame rather than synchronously in the effect body: keeps
    // the first server + client render on the same placeholder (no hydration
    // mismatch) and satisfies the react-hooks/set-state-in-effect rule.
    const raf = requestAnimationFrame(() => setNow(new Date()));
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);
  if (!now) return '12:00:00 AM';
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(now);
  } catch {
    return '12:00:00 AM';
  }
}

/** Splits text into word spans (each fades in separately during the boot
 *  sequence). A trailing non-breaking space keeps natural word spacing while the
 *  spans stay inline. */
function Words({ text }: { text: string | undefined }) {
  if (!text) return null;
  const parts = text.split(' ');
  return (
    <>
      {parts.map((w, i) => (
        <span key={i} className="cc8-w">
          {w}
          {i < parts.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', msg: '' });
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const clock = useClock();

  // In-view toggle drives the CSS "boot sequence" entrance (same plain
  // IntersectionObserver pattern as About; the motion itself lives in globals.css,
  // gated on prefers-reduced-motion so reduced-motion / no-JS get static content).
  // The `-25%` bottom margin fires the sweep once the console is genuinely in view.
  const revealRef = useRef<HTMLDivElement>(null);
  const inView = useInView(revealRef, { once: true, margin: '0px 0px -25% 0px' });

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((s) => ({ ...s, [key]: e.target.value }));

  const send = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // The submit is driven via onClick/⌘↵ (not a native form submit), so trigger
    // the browser's built-in required/email validation ourselves before drafting.
    if (formRef.current && !formRef.current.reportValidity()) return;
    const subject = form.subject.trim() || `Hello from ${form.name || 'your site'}`;
    const body = form.msg + (form.email ? `\n\n— ${form.name} (${form.email})` : '');
    const url = `mailto:${site.email.primary}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      window.open(url, '_blank');
    } catch {
      /* popup blocked — success state still confirms the draft is ready */
    }
    setSent(true);
  };

  const reset = () => {
    setSent(false);
    setForm({ name: '', email: '', subject: '', msg: '' });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  };

  const copy = (id: string, text: string) => {
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
    setCopied(id);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(null), 1500);
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="contact-console relative overflow-hidden pt-16 pb-4 md:pt-24 md:pb-6"
    >
      {/* Starfield sky is the shared <PageStarfield> (app/page.tsx); the
          fade-out at the page bottom is handled by the footer's own translucent,
          backdrop-blurred bar. */}
      <Container className="relative z-10">
        {/* `.is-on` (added once the console scrolls into view) drives the boot
            sequence: head fades up → panel powers on → the prompt types in → the
            channel rows print one-by-one. All choreography is in globals.css,
            scoped under .cc8-reveal and gated on prefers-reduced-motion. */}
        <div ref={revealRef} className={cn('cc8-reveal', inView && 'is-on')}>
        <div className="cc8-head">
          <div className="cc8-headl">
            <h2 id="contact-heading" className="cc8-h">
              <WaveText text="Start a conversation." />
            </h2>
          </div>
          <div className="cc8-headr">
            <span className="cc8-avail">
              <span className="ct-live" aria-hidden="true" />
              Open to new opportunities · Replies within {RESPONSE}
            </span>
          </div>
        </div>

        <div className="cc8-panel">
          {/* console bar */}
          <div className="cc8-bar">
            <span className="sq" aria-hidden="true" />
            <span className="path">
              <b>eduardo</b>@portfolio : ~/contact
            </span>
            <span className="clock">
              <MapPin className="ic" strokeWidth={1.6} aria-hidden="true" />
              <span className="loc">
                <Words text={site.location} />
              </span>
              <span className="sep" aria-hidden="true">·</span>
              <Clock className="ic" strokeWidth={1.6} aria-hidden="true" />
              <span className="time">
                <Words text={clock} />
              </span>
            </span>
          </div>

          <div className="cc8-body">
            {/* left — form / success */}
            <div className="cc8-left">
              {sent ? (
                <div className="cc8-success">
                  <span className="ring" aria-hidden="true">
                    <Check strokeWidth={2} />
                  </span>
                  <p className="t">
                    Your message
                    <br />
                    is ready.
                  </p>
                  <p className="s">
                    I&apos;ve opened your mail client with everything filled in — just hit send. I&apos;ll
                    get back to you within {RESPONSE}.
                  </p>
                  <button type="button" className="cc8-again" onClick={reset}>
                    <ArrowRight strokeWidth={2} aria-hidden="true" /> Write another
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={send} className="cc8-form">
                  <div className="cc8-fhead">
                    <p className="t">Send a message</p>
                  </div>

                  <div className="cc8-fields">
                    <div className="cc8-field">
                      <label htmlFor="cc-name">Your name</label>
                      <input
                        id="cc-name"
                        className="cc8-input"
                        placeholder="John Doe"
                        autoComplete="name"
                        required
                        value={form.name}
                        onChange={set('name')}
                        onKeyDown={onKey}
                      />
                    </div>
                    <div className="cc8-field">
                      <label htmlFor="cc-email">Email</label>
                      <input
                        id="cc-email"
                        className="cc8-input"
                        type="email"
                        placeholder="john@company.com"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={set('email')}
                        onKeyDown={onKey}
                      />
                    </div>
                    <div className="cc8-field">
                      <label htmlFor="cc-subject">Subject</label>
                      <input
                        id="cc-subject"
                        className="cc8-input"
                        placeholder="Work Opportunity, Collaboration"
                        value={form.subject}
                        onChange={set('subject')}
                        onKeyDown={onKey}
                      />
                    </div>
                    <div className="cc8-field full msg">
                      <label htmlFor="cc-msg">Message</label>
                      <textarea
                        id="cc-msg"
                        className="cc8-input"
                        placeholder="Tell me about the role, project, or idea…"
                        required
                        value={form.msg}
                        onChange={set('msg')}
                        onKeyDown={onKey}
                      />
                    </div>
                  </div>

                  <div className="cc8-submit">
                    <ShinyButton
                      href="#contact"
                      aria-keyshortcuts="Meta+Enter Control+Enter"
                      onClick={(e) => {
                        e.preventDefault();
                        send();
                      }}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface/50 px-3.5 py-2 font-mono text-[9.5px] tracking-[0.18em] text-fg uppercase backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface hover:text-accent focus-visible:border-accent focus-visible:text-accent"
                    >
                      Send message
                      <span
                        aria-hidden="true"
                        className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </ShinyButton>
                    <span className="cc8-hint" aria-hidden="true">
                      or press <kbd>⌘</kbd>
                      <kbd>↵</kbd>
                    </span>
                  </div>
                </form>
              )}
            </div>

            <div className="cc8-divider" aria-hidden="true" />

            {/* right — status + channels */}
            <div className="cc8-right">
              <p className="cc8-rlabel">Reach me directly</p>

              <div className="cc8-list" role="list" aria-label="Contact channels">
                {CHANNELS.map((c) => {
                  const done = copied === c.id;
                  const ActionIcon = c.kind === 'copy' ? Copy : c.kind === 'download' ? Download : ArrowUpRight;
                  const rowLabel =
                    c.kind === 'ext'
                      ? `${c.label} — ${c.value} (opens in new tab)`
                      : c.kind === 'download'
                        ? `Download ${c.label} (${c.value})`
                        : `Copy ${c.label}: ${c.value}`;
                  return (
                    <a
                      key={c.id}
                      role="listitem"
                      aria-label={rowLabel}
                      className="cc8-row"
                      data-kind={c.kind}
                      href={c.href}
                      target={c.kind === 'ext' ? '_blank' : undefined}
                      rel={c.kind === 'ext' ? 'noopener noreferrer' : undefined}
                      onClick={
                        c.kind === 'copy'
                          ? (e) => {
                              e.preventDefault();
                              copy(c.id, c.value);
                            }
                          : undefined
                      }
                    >
                      <span className="cc8-rlbl">
                        <c.Icon className="ic" strokeWidth={1.6} />
                        {c.label}
                      </span>
                      <span className="cc8-rval">{c.value}</span>
                      <span className="cc8-raction">
                        {done ? (
                          <span className="ct-copied">
                            <Check aria-hidden="true" /> Copied
                          </span>
                        ) : (
                          <>
                            {c.action} <ActionIcon strokeWidth={1.7} aria-hidden="true" />
                          </>
                        )}
                      </span>
                    </a>
                  );
                })}
              </div>

              <div className="cc8-foot">
                <Mail strokeWidth={1.6} aria-hidden="true" />
                <span>
                  Prefer email? <b>{site.email.primary}</b> reaches me first.
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </Container>
    </section>
  );
}
