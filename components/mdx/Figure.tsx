import Image from 'next/image';
import type { ReactNode } from 'react';

type FigureProps = {
  src: string;
  alt: string;
  caption?: ReactNode;
  width?: number;
  height?: number;
  aspect?: number;
};

export function Figure({
  src,
  alt,
  caption,
  width = 1200,
  height = 800,
  aspect,
}: FigureProps) {
  return (
    <figure className="my-10 flex flex-col gap-3">
      <div
        className="relative overflow-hidden rounded-2xl border border-hairline bg-surface/40"
        style={{ aspectRatio: aspect ?? `${width}/${height}` }}
      >
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
      </div>
      {caption && (
        <figcaption className="font-mono text-[11px] tracking-[0.1em] text-fg-mute uppercase">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
