// Cytoscape graph → human-readable summary, ported from
// ollama_service.py:_summarize_graph_for_chat / _summarize_graph_for_eval.
//
// Handles the two element shapes Cytoscape's `cy.json()` can emit:
//   1. { elements: { nodes: [...], edges: [...] } }   ← what cy.json() returns
//   2. { elements: [ { group: 'nodes' | 'edges', data: {...} }, ... ] }
//
// The `chat` summary truncates the edge list to 10 to keep the system prompt
// within budget; the `eval` summary lists every edge so the grader can score
// each one.

import type { ConceptMapGraph } from '@/types/laHistory';

type CyNodeData = { id?: string; label?: string };
type CyEdgeData = { source?: string; target?: string; label?: string };

function partitionElements(graph: ConceptMapGraph): {
  nodes: CyNodeData[];
  edges: CyEdgeData[];
} {
  const nodes: CyNodeData[] = [];
  const edges: CyEdgeData[] = [];
  const els = graph.elements;
  if (!Array.isArray(els)) return { nodes, edges };
  for (const el of els) {
    const data = (el?.data ?? {}) as CyNodeData & CyEdgeData;
    const grouped = (el as { group?: string }).group;
    const isEdge =
      grouped === 'edges' ||
      (grouped !== 'nodes' && data.source && data.target);
    if (isEdge) {
      edges.push({
        source: data.source,
        target: data.target,
        label: data.label,
      });
    } else {
      nodes.push({ id: data.id, label: data.label });
    }
  }
  return { nodes, edges };
}

function nodeLabel(n: CyNodeData): string {
  return n.label?.trim() || n.id || '?';
}

function edgeLabel(e: CyEdgeData, idToLabel: Map<string, string>): string {
  const src = e.source ? (idToLabel.get(e.source) ?? e.source) : '?';
  const tgt = e.target ? (idToLabel.get(e.target) ?? e.target) : '?';
  const lbl = e.label?.trim() ?? '';
  return `${src} --[${lbl}]--> ${tgt}`;
}

function buildIdToLabel(nodes: CyNodeData[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const n of nodes) {
    if (n.id) map.set(n.id, nodeLabel(n));
  }
  return map;
}

export function summarizeGraphForChat(graph: ConceptMapGraph | null): string {
  if (!graph) return 'The map is currently empty.';
  const { nodes, edges } = partitionElements(graph);
  if (nodes.length === 0) return 'The map is currently empty.';
  const idToLabel = buildIdToLabel(nodes);
  let summary = `Nodes (${nodes.length}): ${nodes
    .map(nodeLabel)
    .join(', ')}.`;
  if (edges.length > 0) {
    const formatted = edges.slice(0, 10).map((e) => edgeLabel(e, idToLabel));
    summary += ` Connections (${edges.length}): ${formatted.join(' | ')}`;
    if (edges.length > 10) {
      summary += ` … and ${edges.length - 10} more.`;
    }
  } else {
    summary += ' No connections drawn yet.';
  }
  return summary;
}

export function summarizeGraphForEval(graph: ConceptMapGraph | null): string {
  if (!graph) return 'The map is empty.';
  const { nodes, edges } = partitionElements(graph);
  if (nodes.length === 0) return 'The map is empty.';
  const idToLabel = buildIdToLabel(nodes);
  const parts = [`Nodes (${nodes.length}): ${nodes.map(nodeLabel).join(', ')}.`];
  if (edges.length > 0) {
    parts.push(`Edges (${edges.length}):`);
    for (const e of edges) parts.push(`- ${edgeLabel(e, idToLabel)}`);
  } else {
    parts.push('No edges.');
  }
  return parts.join('\n');
}

export function countEdges(graph: ConceptMapGraph | null): number {
  if (!graph) return 0;
  return partitionElements(graph).edges.length;
}

export function countNodes(graph: ConceptMapGraph | null): number {
  if (!graph) return 0;
  return partitionElements(graph).nodes.length;
}
