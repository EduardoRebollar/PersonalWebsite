'use client';

import { useEffect, useState, type ComponentType } from 'react';
import type { ElementDefinition } from 'cytoscape';
import type { ConceptMapGraph } from '@/types/laHistory';

type InnerProps = {
  graph: ConceptMapGraph;
  locked: boolean;
  selectedId: string | null;
  connectFromId: string | null;
  accentColor: string;
  onSelect: (id: string | null, kind: 'node' | 'edge' | null) => void;
  onConnectFromCleared: () => void;
  onCreateEdge: (sourceId: string, targetId: string) => void;
  onCommitPositions: (elements: ElementDefinition[]) => void;
};

export function ConceptMapCanvas(props: InnerProps) {
  const [Inner, setInner] = useState<ComponentType<InnerProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('./ConceptMapInner').then((mod) => {
      if (cancelled) return;
      setInner(() => mod.ConceptMapInner);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Inner) {
    return (
      <div className="grid h-full place-items-center bg-base">
        <p className="font-mono text-[11px] tracking-[0.18em] text-fg-mute uppercase">
          Loading concept-map editor…
        </p>
      </div>
    );
  }
  return <Inner {...props} />;
}
