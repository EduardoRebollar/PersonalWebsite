'use client';

import { useEffect, useState, type ComponentType } from 'react';
import type { ElementDefinition } from 'cytoscape';
import type { ConceptMapGraph } from '@/types/laHistory';
import type { CyApi } from './ConceptMapInner';

type InnerProps = {
  graph: ConceptMapGraph;
  locked: boolean;
  pendingSourceId: string | null;
  accentColor: string;
  isDark: boolean;
  onNodeTap: (id: string, pos: { x: number; y: number }) => void;
  onEdgeTap: (id: string, pos: { x: number; y: number }) => void;
  onBackgroundTap: () => void;
  onCommitPositions: (elements: ElementDefinition[]) => void;
  onApiReady: (api: CyApi | null) => void;
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
      <div className="cm-empty-state">
        <div className="cm-empty-state-text">Loading concept-map editor…</div>
      </div>
    );
  }
  return <Inner {...props} />;
}
