/**
 * JSON-LD structured data renderer.
 *
 * Next 16's Metadata API doesn't support JSON-LD natively, so we render it
 * as a regular <script type="application/ld+json"> tag. Server-rendered
 * (no client interactivity) and inlined as raw HTML for crawler-readability.
 */
type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
