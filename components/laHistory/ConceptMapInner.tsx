'use client';

// Cytoscape integration for the 1:1 concept-map replica. Lazy-loaded by
// ConceptMapCanvas (CLAUDE.md: no next/dynamic({ ssr:false }) on Next 16).
// Uses the original concept_map.js stylesheet (round-rect nodes coloured by
// era, dashed/dotted cross-era & custom variants, labelled bezier edges) and
// reports node/edge taps (with rendered positions) up to React, which drives
// the context menu / edge-label popup.

import { useEffect, useMemo, useRef } from 'react';
import cytoscape, {
  type Core,
  type ElementDefinition,
  type EventObject,
} from 'cytoscape';

import type { ConceptMapGraph } from '@/types/laHistory';

export type CyApi = {
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
  layout: () => void;
};

type Props = {
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

function shortLabelFor(s: string): string {
  return s.length > 22 ? `${s.slice(0, 21)}…` : s;
}

function buildStylesheet(
  accentColor: string,
  isDark: boolean,
): cytoscape.StylesheetJson {
  const edgeColor = isDark ? '#6b5d48' : '#c4a97a';
  const edgeLabelBg = isDark ? '#1e1a14' : '#fdf8f0';
  const edgeLabelColor = isDark ? '#c8b898' : '#5a4232';
  return [
    {
      selector: 'node',
      style: {
        'background-color': 'data(color)',
        'background-opacity': 0.92,
        label: 'data(shortLabel)',
        color: '#fff',
        'text-wrap': 'wrap',
        'text-max-width': '96px',
        'font-size': '11.5px',
        'font-weight': 600,
        'font-family': 'var(--lah-font-sans), DM Sans, system-ui, sans-serif',
        width: 'label',
        height: 'label',
        padding: '11px 14px',
        shape: 'roundrectangle',
        'text-valign': 'center',
        'text-halign': 'center',
        'border-width': 2,
        'border-color': 'data(borderColor)',
        'border-opacity': 0.6,
        'min-width': '70px',
        'min-height': '38px',
        'text-outline-width': 0,
        'overlay-opacity': 0,
      },
    },
    {
      selector: 'node[?cross_era]',
      style: {
        'border-style': 'dashed',
        'border-color': '#a09070',
        'border-opacity': 0.7,
        'background-opacity': 0.72,
      },
    },
    {
      selector: 'node[?custom]',
      style: {
        'border-style': 'dotted',
        'border-width': 2.5,
        'border-color': '#a070d0',
        'border-opacity': 0.9,
        'background-color': '#7c4daf',
      },
    },
    {
      selector: 'node.selected-source',
      style: {
        'border-color': '#f0c040',
        'border-width': 3,
        'border-opacity': 1,
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-color': '#b8731a',
        'border-width': 3,
        'border-opacity': 1,
      },
    },
    {
      selector: 'edge',
      style: {
        width: 2.5,
        'line-color': edgeColor,
        'target-arrow-color': edgeColor,
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.1,
        'curve-style': 'bezier',
        label: 'data(label)',
        'font-size': '10.5px',
        'font-weight': 500,
        'font-family': 'var(--lah-font-sans), DM Sans, system-ui, sans-serif',
        color: edgeLabelColor,
        'text-background-color': edgeLabelBg,
        'text-background-opacity': 1,
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle',
        'text-border-opacity': 0,
        'text-rotation': 'autorotate',
        'overlay-opacity': 0,
      },
    },
    {
      selector: 'edge[?cross_era]',
      style: {
        'line-style': 'dashed',
        'line-dash-pattern': [8, 4],
        'line-color': isDark ? '#5a4e3c' : '#b0a080',
        'target-arrow-color': isDark ? '#5a4e3c' : '#b0a080',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': '#b8731a',
        'target-arrow-color': '#b8731a',
        width: 3,
      },
    },
  ];
}

export function ConceptMapInner({
  graph,
  locked,
  pendingSourceId,
  accentColor,
  isDark,
  onNodeTap,
  onEdgeTap,
  onBackgroundTap,
  onCommitPositions,
  onApiReady,
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);

  const callbacks = useRef({
    onNodeTap,
    onEdgeTap,
    onBackgroundTap,
    onCommitPositions,
    onApiReady,
  });
  useEffect(() => {
    callbacks.current = {
      onNodeTap,
      onEdgeTap,
      onBackgroundTap,
      onCommitPositions,
      onApiReady,
    };
  });

  const lockedRef = useRef(locked);
  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  const stylesheet = useMemo(
    () => buildStylesheet(accentColor, isDark),
    [accentColor, isDark],
  );

  // Mount cytoscape once.
  useEffect(() => {
    if (!hostRef.current || cyRef.current) return;
    const cy = cytoscape({
      container: hostRef.current,
      elements: [],
      style: stylesheet,
      layout: { name: 'preset' },
      wheelSensitivity: 0.3,
      minZoom: 0.4,
      maxZoom: 2.5,
      boxSelectionEnabled: false,
    });
    cyRef.current = cy;

    cy.on('tap', 'node', (evt: EventObject) => {
      if (lockedRef.current) return;
      callbacks.current.onNodeTap(evt.target.id() as string, evt.renderedPosition);
    });
    cy.on('tap', 'edge', (evt: EventObject) => {
      if (lockedRef.current) return;
      callbacks.current.onEdgeTap(evt.target.id() as string, evt.renderedPosition);
    });
    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) callbacks.current.onBackgroundTap();
    });
    cy.on('dragfree', 'node', () => {
      callbacks.current.onCommitPositions(serializeElements(cy));
    });

    // Highlight connected edges on node hover (gold), like the original.
    cy.on('mouseover', 'node', (evt: EventObject) => {
      evt.target.connectedEdges().style({
        'line-color': '#d4a843',
        'target-arrow-color': '#d4a843',
        width: 3.5,
      });
    });
    cy.on('mouseout', 'node', (evt: EventObject) => {
      const col = isDark ? '#6b5d48' : '#c4a97a';
      evt.target.connectedEdges().style({
        'line-color': col,
        'target-arrow-color': col,
        width: 2.5,
      });
    });

    const api: CyApi = {
      zoomIn: () =>
        cy.zoom({
          level: cy.zoom() * 1.2,
          renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
        }),
      zoomOut: () =>
        cy.zoom({
          level: cy.zoom() / 1.2,
          renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
        }),
      fit: () => cy.fit(undefined, 40),
      layout: () =>
        cy
          .layout({
            name: 'cose',
            animate: true,
            padding: 40,
            idealEdgeLength: () => 130,
            nodeRepulsion: () => 9000,
          } as cytoscape.LayoutOptions)
          .run(),
    };
    callbacks.current.onApiReady(api);

    return () => {
      callbacks.current.onApiReady(null);
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-style on accent / theme change.
  useEffect(() => {
    cyRef.current?.style(stylesheet);
  }, [stylesheet]);

  // Sync incoming elements; enrich node data with the fields the stylesheet
  // expects (color / borderColor / shortLabel) for any legacy nodes.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      const incomingIds = new Set<string>();
      for (const el of graph.elements) {
        const data = (el.data ?? {}) as Record<string, unknown> & {
          id?: string;
          label?: string;
          source?: string;
          target?: string;
        };
        if (!data.id) continue;
        incomingIds.add(data.id);
        const isEdge = !!(data.source && data.target);
        const enriched: Record<string, unknown> = { ...data };
        if (!isEdge) {
          if (!enriched.color) enriched.color = accentColor;
          if (!enriched.borderColor) enriched.borderColor = enriched.color;
          if (!enriched.shortLabel) {
            enriched.shortLabel = shortLabelFor(String(data.label ?? ''));
          }
        }
        const existing = cy.getElementById(data.id);
        if (existing.length === 0) {
          cy.add({
            group: isEdge ? 'edges' : 'nodes',
            data: enriched,
            position: (el as { position?: { x: number; y: number } }).position,
          });
        } else {
          existing.data('label', data.label ?? '');
          if (!isEdge) existing.data('shortLabel', enriched.shortLabel);
        }
      }
      cy.elements().forEach((el) => {
        if (!incomingIds.has(el.id())) el.remove();
      });
    });
  }, [graph, accentColor]);

  // Highlight the pending "connect source" node.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().removeClass('selected-source');
    if (pendingSourceId) {
      cy.getElementById(pendingSourceId).addClass('selected-source');
    }
  }, [pendingSourceId]);

  // Lock interactions once submitted.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.autoungrabify(locked);
  }, [locked]);

  return (
    <div
      ref={hostRef}
      id="cm-canvas"
      role="application"
      aria-label="Concept map canvas"
      tabIndex={0}
    />
  );
}

function serializeElements(cy: Core): ElementDefinition[] {
  return cy.elements().map((el) => {
    const json = el.json() as ElementDefinition & {
      position?: { x: number; y: number };
    };
    return { data: json.data, position: json.position };
  });
}
