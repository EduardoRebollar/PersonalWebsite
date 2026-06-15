// Shared YouTube helpers for the LA History surfaces (LocationDetail video embed
// + the case-study scroll-expand cover). Kept tiny and framework-free.

/** Pull the 11-char video id from a watch?v= / youtu.be / embed URL. */
export function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      // /watch?v=ID, /embed/ID, or /v/ID
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      return last && last !== 'embed' ? last : null;
    }
    if (u.hostname === 'youtu.be') return u.pathname.slice(1) || null;
    return null;
  } catch {
    return null;
  }
}
