'use client';

// Cytoscape integration. Lazy-loaded by ConceptMapCanvas via useEffect-
// import (CLAUDE.md: no next/dynamic({ ssr: false }) on Next 16). Stays in
// its own chunk so the case-study page never pulls Cytoscape (~250KB gz).

import { useEffect, useMemo, useRef } from 'react';
import cytoscape, {
  type Core,
  type ElementDefinition,
  type EventObject,
} from 'cytoscape';

import type { ConceptMapGraph } from '@/types/laHistory';

type Props = {
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

function buildStylesheet(accentColor: string): cytoscape.StylesheetJson {
  return [
    {
      selector: 'node',
      style: {
        'background-color': '#1a2433',
        'border-color': '#243040',
        'border-width': 1,
        color: '#e8edf2',
        label: 'data(label)',
        'font-family':
          'var(--font-sans, ui-sans-serif, system-ui, sans-serif)',
        'font-size': 12,
        'font-weight': 500,
        'text-valign': 'center',
        'text-halign': 'center',
        'text-wrap': 'wrap',
        'text-max-width': '120px',
        width: 'label',
        height: 'label',
        padding: '12px',
        shape: 'round-rectangle',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-color': accentColor,
        'border-width': 2,
      },
    },
    {
      selector: 'node.connect-source',
      style: {
        'border-color': '#8fa8ff',
        'border-width': 2,
        'background-color': '#1f2a3b',
      },
    },
    {
      selector: 'edge',
      style: {
        width: 1.2,
        'line-color': '#243040',
        'target-arrow-color': '#243040',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        label: 'data(label)',
        'font-family':
          'var(--font-mono, ui-monospace, "SF Mono", Menlo, monospace)',
        'font-size': 10,
        color: '#8893a0',
        'text-rotation': 'autorotate',
        'text-background-color': '#0a1018',
        'text-background-opacity': 0.8,
        'text-background-padding': '2px',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': accentColor,
        'target-arrow-color': accentColor,
        color: '#e8edf2',
        width: 1.8,
      },
    },
  ];
}

export function ConceptMapInner({
  graph,
  locked,
  selectedId,
  connectFromId,
  accentColor,
  onSelect,
  onConnectFromCleared,
  onCreateEdge,
  onCommitPositions,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);
  // Stash the latest handler args so the cy event listeners (installed once)
  // can always invoke the current React-side handlers without re-mounting.
  const callbacks = useRef({
    onSelect,
    onCreateEdge,
    onConnectFromCleared,
    onCommitPositions,
  });
  useEffect(() => {
    callbacks.current = {
      onSelect,
      onCreateEdge,
      onConnectFromCleared,
      onCommitPositions,
    };
  });
  const connectFromRef = useRef<string | null>(connectFromId);
  useEffect(() => {
    connectFromRef.current = connectFromId;
  }, [connectFromId]);

  const stylesheet = useMemo(
    () => buildStylesheet(accentColor),
    [accentColor],
  );

  // Mount cytoscape once.
  useEffect(() => {
    if (!hostRef.current || cyRef.current) return;
    const cy = cytoscape({
      container: hostRef.current,
      elements: graph.elements as ElementDefinition[],
      style: stylesheet,
      layout: { name: 'preset' },
      wheelSensitivity: 0.3,
      minZoom: 0.4,
      maxZoom: 2.5,
    });
    cyRef.current = cy;

    cy.on('tap', 'node', (evt: EventObject) => {
      const id = evt.target.id() as string;
      const from = connectFromRef.current;
      if (from && from !== id) {
        callbacks.current.onCreateEdge(from, id);
        callbacks.current.onConnectFromCleared();
        return;
      }
      callbacks.current.onSelect(id, 'node');
    });
    cy.on('tap', 'edge', (evt: EventObject) => {
      callbacks.current.onSelect(evt.target.id() as string, 'edge');
    });
    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        callbacks.current.onSelect(null, null);
        if (connectFromRef.current) {
          callbacks.current.onConnectFromCleared();
        }
      }
    });
    cy.on('dragfree', 'node', () => {
      callbacks.current.onCommitPositions(serializeElements(cy));
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-style on accent change.
  useEffect(() => {
    cyRef.current?.style(stylesheet);
  }, [stylesheet]);

  // Sync incoming elements (additions / removals / label edits) with the
  // running Cytoscape instance. Diffing is cheap because the graph rarely
  // exceeds ~30 elements in normal use.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      const incomingIds = new Set<string>();
      for (const el of graph.elements) {
        const data = (el.data ?? {}) as {
          id?: string;
          label?: string;
          source?: string;
          target?: string;
        };
        if (!data.id) continue;
        incomingIds.add(data.id);
        const existing = cy.getElementById(data.id);
        if (existing.length === 0) {
          cy.add({
            group: data.source && data.target ? 'edges' : 'nodes',
            data: { ...data },
            position: (el as { position?: { x: number; y: number } })
              .position,
          });
        } else {
          existing.data('label', data.label ?? '');
        }
      }
      cy.elements().forEach((node) => {
        const id = node.id();
        if (!incomingIds.has(id)) node.remove();
      });
    });
  }, [graph]);

  // Reflect the selected id from React state to Cytoscape selection.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().unselect();
    if (selectedId) {
      cy.getElementById(selectedId).select();
    }
  }, [selectedId]);

  // Highlight the "connect source" node with a class.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().removeClass('connect-source');
    if (connectFromId) {
      cy.getElementById(connectFromId).addClass('connect-source');
    }
  }, [connectFromId]);

  // Lock / unlock interactive features when a map has been submitted.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.userPanningEnabled(!locked || true);
    cy.userZoomingEnabled(true);
    cy.boxSelectionEnabled(!locked);
    cy.autoungrabify(locked);
  }, [locked]);

  return (
    <div
      ref={hostRef}
      className="h-full w-full"
      role="application"
      aria-label="Concept map canvas"
    />
  );
}

function serializeElements(cy: Core): ElementDefinition[] {
  return cy.elements().map((el) => {
    const json = el.json() as ElementDefinition & {
      position?: { x: number; y: number };
    };
    return {
      data: json.data,
      position: json.position,
    };
  });
}
