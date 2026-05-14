/**
 * Skip-to-content link — first focusable element on the page.
 * Visually hidden until focused; appears as a pill in the top-left when keyboard
 * users tab in, letting them jump past the nav into <main id="content">.
 */
export function SkipToContent() {
  return (
    <a
      href="#content"
      className="sr-only-focusable fixed top-4 left-4 z-[100] rounded-md bg-accent px-4 py-2 font-mono text-sm font-medium text-base shadow-lg"
    >
      Skip to content
    </a>
  );
}
