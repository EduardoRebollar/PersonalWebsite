'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ElementDefinition } from 'cytoscape';

import { cn } from '@/lib/cn';
import { eras, eraByOrder } from '@/content/data/laHistory/eras';
import { ERA_META } from '@/lib/laHistory/display';
import {
  INSIGHT_MAX_USES,
  POINTS,
  isEraUnlocked,
  locationsInEra,
} from '@/lib/laHistory/gamification';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import { useLaHistorySettings } from '@/stores/useLaHistorySettings';
import type {
  ConceptMapEvaluation,
  ConceptMapGraph,
  EdgeAssessment,
  Location,
} from '@/types/laHistory';
import { ConceptMapCanvas } from './ConceptMapCanvas';
import { ConceptMapChat } from './ConceptMapChat';
import type { CyApi } from './ConceptMapInner';

const MIN_EDGES_TO_SUBMIT = 3;
const HISTORY_LIMIT = 30;

type Pos = { x: number; y: number };
type NodeData = {
  id: string;
  label?: string;
  source?: string;
  target?: string;
  custom?: boolean;
  cross_era?: boolean;
};

function nextId(prefix: 'n' | 'e'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}
function emptyGraph(): ConceptMapGraph {
  return { elements: [] };
}
function cloneGraph(g: ConceptMapGraph): ConceptMapGraph {
  return { elements: g.elements.map((e) => ({ ...e, data: { ...e.data } })) };
}
function dataOf(el: ElementDefinition): NodeData {
  return (el.data ?? {}) as NodeData;
}
function isEdgeEl(el: ElementDefinition): boolean {
  const d = dataOf(el);
  return !!(d.source && d.target);
}
function shortLabel(s: string): string {
  return s.length > 22 ? `${s.slice(0, 21)}…` : s;
}
function jitteredPosition(graph: ConceptMapGraph): Pos {
  const ps = graph.elements
    .map((el) => (el as { position?: Pos }).position)
    .filter((p): p is Pos => !!p);
  const cx = ps.length ? ps.reduce((a, p) => a + p.x, 0) / ps.length : 0;
  const cy = ps.length ? ps.reduce((a, p) => a + p.y, 0) / ps.length : 0;
  return { x: cx + (Math.random() - 0.5) * 120, y: cy + (Math.random() - 0.5) * 120 };
}

export function ConceptMapView({
  eraOrder,
  onClose,
}: {
  eraOrder: number;
  onClose: () => void;
}) {
  const era = eraByOrder.get(eraOrder)!;
  const meta = ERA_META[era.key];

  const conceptMap = useLaHistoryStore((s) => s.conceptMaps[eraOrder]);
  const points = useLaHistoryStore((s) => s.points);
  const visited = useLaHistoryStore((s) => s.visited);
  const quizPasses = useLaHistoryStore((s) => s.quizPasses);
  const conceptMaps = useLaHistoryStore((s) => s.conceptMaps);
  const saveConceptMap = useLaHistoryStore((s) => s.saveConceptMap);
  const chargeInsight = useLaHistoryStore((s) => s.chargeInsight);
  const submitConceptMap = useLaHistoryStore((s) => s.submitConceptMap);
  const isDark = useLaHistorySettings((s) => s.theme) !== 'light';

  const locked = conceptMap?.submitted === true;

  const [graph, setGraph] = useState<ConceptMapGraph>(
    () => conceptMap?.graph ?? emptyGraph(),
  );
  // Undo/redo history — read only through the setters' callback args
  // (no toolbar buttons; Ctrl+Z / Ctrl+Shift+Z drive it, like the original).
  const [, setPastStack] = useState<ConceptMapGraph[]>([]);
  const [, setFutureStack] = useState<ConceptMapGraph[]>([]);

  const [pendingSource, setPendingSource] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<
    { pos: Pos; kind: 'node' | 'edge'; id: string } | null
  >(null);
  const [edgePopup, setEdgePopup] = useState<
    { pos: Pos; source: string; target: string; editingEdgeId?: string; value: string }
    | null
  >(null);
  const [crossEraOpen, setCrossEraOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState('');

  const [insightLoading, setInsightLoading] = useState(false);
  const [insightText, setInsightText] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const apiRef = useRef<CyApi | null>(null);

  const insightUsesLeft = INSIGHT_MAX_USES - (conceptMap?.insightUses ?? 0);
  const edgeCount = graph.elements.filter(isEdgeEl).length;
  const nodeCount = graph.elements.length - edgeCount;
  const onCanvas = useMemo(
    () => new Set(graph.elements.map((e) => dataOf(e).id)),
    [graph],
  );

  const commit = useCallback(
    (next: ConceptMapGraph) => {
      setPastStack((p) => [...p, cloneGraph(graph)].slice(-HISTORY_LIMIT));
      setFutureStack([]);
      setGraph(next);
      saveConceptMap(eraOrder, next);
    },
    [graph, saveConceptMap, eraOrder],
  );

  const addLocationNode = useCallback(
    (loc: Location, crossEra = false) => {
      const id = `loc-${loc.id}`;
      if (graph.elements.some((e) => dataOf(e).id === id)) return;
      const color = ERA_META[loc.era].color;
      commit({
        elements: [
          ...graph.elements,
          {
            data: {
              id,
              label: loc.name,
              shortLabel: shortLabel(loc.name),
              color,
              borderColor: color,
              ...(crossEra ? { cross_era: true } : {}),
            },
            position: jitteredPosition(graph),
          },
        ],
      });
    },
    [graph, commit],
  );

  const addCustomNode = useCallback(
    (label: string) => {
      const t = label.trim();
      if (!t) return;
      commit({
        elements: [
          ...graph.elements,
          {
            data: {
              id: nextId('n'),
              label: t,
              shortLabel: shortLabel(t),
              custom: true,
              color: '#7c4daf',
              borderColor: '#a070d0',
            },
            position: jitteredPosition(graph),
          },
        ],
      });
    },
    [graph, commit],
  );

  const addEdge = useCallback(
    (source: string, target: string, label: string) => {
      if (source === target) return;
      if (
        graph.elements.some((e) => {
          const d = dataOf(e);
          return d.source === source && d.target === target;
        })
      ) {
        return;
      }
      commit({
        elements: [
          ...graph.elements,
          { data: { id: nextId('e'), source, target, label } },
        ],
      });
    },
    [graph, commit],
  );

  const updateLabel = useCallback(
    (id: string, value: string) => {
      commit({
        elements: graph.elements.map((el) =>
          dataOf(el).id === id
            ? { ...el, data: { ...el.data, label: value } }
            : el,
        ),
      });
    },
    [graph, commit],
  );

  const removeNode = useCallback(
    (id: string) => {
      commit({
        elements: graph.elements.filter((el) => {
          const d = dataOf(el);
          return d.id !== id && d.source !== id && d.target !== id;
        }),
      });
    },
    [graph, commit],
  );

  const removeEdge = useCallback(
    (id: string) => {
      commit({
        elements: graph.elements.filter((el) => dataOf(el).id !== id),
      });
    },
    [graph, commit],
  );

  const undo = useCallback(() => {
    setPastStack((past) => {
      if (past.length === 0) return past;
      const prev = past[past.length - 1]!;
      setFutureStack((f) => [...f, cloneGraph(graph)]);
      setGraph(prev);
      saveConceptMap(eraOrder, prev);
      return past.slice(0, -1);
    });
  }, [graph, saveConceptMap, eraOrder]);

  const redo = useCallback(() => {
    setFutureStack((future) => {
      if (future.length === 0) return future;
      const next = future[future.length - 1]!;
      setPastStack((p) => [...p, cloneGraph(graph)]);
      setGraph(next);
      saveConceptMap(eraOrder, next);
      return future.slice(0, -1);
    });
  }, [graph, saveConceptMap, eraOrder]);

  const commitPositions = useCallback(
    (elements: ElementDefinition[]) => {
      const next = { elements };
      setGraph(next);
      saveConceptMap(eraOrder, next);
    },
    [saveConceptMap, eraOrder],
  );

  function clearOverlays() {
    setContextMenu(null);
    setEdgePopup(null);
  }

  const onNodeTap = useCallback(
    (id: string, pos: Pos) => {
      setEdgePopup(null);
      if (!pendingSource) {
        setContextMenu({ pos, kind: 'node', id });
      } else if (pendingSource === id) {
        setPendingSource(null);
        setContextMenu(null);
      } else {
        setContextMenu(null);
        setEdgePopup({ pos, source: pendingSource, target: id, value: '' });
      }
    },
    [pendingSource],
  );

  const onEdgeTap = useCallback((id: string, pos: Pos) => {
    setEdgePopup(null);
    setContextMenu({ pos, kind: 'edge', id });
  }, []);

  const onBackgroundTap = useCallback(() => {
    setPendingSource(null);
    clearOverlays();
  }, []);

  // Keyboard: undo/redo/escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        if (e.key === 'Escape') (t as HTMLElement).blur();
        return;
      }
      if (e.key === 'Escape') {
        if (contextMenu || edgePopup || pendingSource) {
          setPendingSource(null);
          clearOverlays();
        } else if (crossEraOpen || customOpen) {
          setCrossEraOpen(false);
          setCustomOpen(false);
        } else {
          onClose();
        }
        return;
      }
      if (locked) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [contextMenu, edgePopup, pendingSource, crossEraOpen, customOpen, locked, undo, redo, onClose]);

  async function fetchInsight() {
    setStatusMsg(null);
    if (insightUsesLeft <= 0) {
      setStatusMsg('No insight uses remaining for this era.');
      return;
    }
    if (points < POINTS.insight) {
      setStatusMsg(`Need ${POINTS.insight} pts for a hint.`);
      return;
    }
    setInsightLoading(true);
    try {
      const res = await fetch('/api/la-history/concept-map/insight', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ eraOrder, graph }),
      });
      if (!res.ok) {
        setStatusMsg('Couldn’t fetch a hint. Try again in a moment.');
        return;
      }
      const data = (await res.json()) as { insight?: string };
      if (!data.insight) {
        setStatusMsg('The hint service returned an empty response.');
        return;
      }
      const charge = chargeInsight(eraOrder);
      if (!charge.ok) {
        setStatusMsg(
          charge.reason === 'no_uses_left'
            ? 'No insight uses remaining.'
            : `Need ${POINTS.insight} pts for a hint.`,
        );
        return;
      }
      setInsightText(data.insight);
    } catch {
      setStatusMsg('Network error fetching hint.');
    } finally {
      setInsightLoading(false);
    }
  }

  async function submit() {
    setStatusMsg(null);
    if (edgeCount < MIN_EDGES_TO_SUBMIT) {
      setStatusMsg(`Add at least ${MIN_EDGES_TO_SUBMIT} connections before submitting.`);
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await fetch('/api/la-history/concept-map/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ eraOrder, graph }),
      });
      const data = (await res.json()) as {
        evaluation?: {
          edgeFeedback: ConceptMapEvaluation['edgeFeedback'];
          overallComment: string;
          followUpQuestion: string;
          synthesisScore: number;
        };
        message?: string;
      };
      if (!res.ok || !data.evaluation) {
        setStatusMsg(data.message ?? 'The evaluator couldn’t grade your map. Try again.');
        return;
      }
      submitConceptMap(eraOrder, {
        edgeFeedback: data.evaluation.edgeFeedback,
        overallComment: data.evaluation.overallComment,
        followUpQuestion: data.evaluation.followUpQuestion,
        synthesisScore: data.evaluation.synthesisScore,
        pointsAwarded: 0,
        evaluatedAt: 0,
      });
    } catch {
      setStatusMsg('Network error submitting your map.');
    } finally {
      setSubmitLoading(false);
    }
  }

  function flashSaved() {
    saveConceptMap(eraOrder, graph);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  }

  // Palette data.
  const eraLocations = useMemo(() => locationsInEra(eraOrder), [eraOrder]);
  const visitedEraLocs = useMemo(
    () => eraLocations.filter((l) => visited[l.slug]),
    [eraLocations, visited],
  );
  const crossEraLocs = useMemo(() => {
    const out: Location[] = [];
    for (const e of eras) {
      if (e.order === eraOrder) continue;
      if (!isEraUnlocked(e.order, { quizPasses, conceptMaps })) continue;
      for (const l of locationsInEra(e.order)) {
        if (visited[l.slug]) out.push(l);
      }
    }
    return out;
  }, [eraOrder, visited, quizPasses, conceptMaps]);
  const customNodes = useMemo(
    () =>
      graph.elements
        .filter((e) => !isEdgeEl(e) && dataOf(e).custom)
        .map((e) => dataOf(e)),
    [graph],
  );

  const evaluation = locked ? conceptMap?.evaluation : undefined;
  const statusText = locked
    ? 'Submitted ✓'
    : graph.elements.length > 0
      ? 'Draft saved'
      : '';
  const submitTooltip =
    edgeCount < MIN_EDGES_TO_SUBMIT
      ? `Add at least ${MIN_EDGES_TO_SUBMIT} connections to submit`
      : '';

  return (
    <div
      className="cm-overlay open"
      role="dialog"
      aria-modal="true"
      aria-label="Concept Map"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cm-panel">
        <div className="cm-panel-header">
          <div className="cm-panel-title">
            <span className="cm-panel-title-icon" aria-hidden>
              🗺️
            </span>
            <span>Concept Map</span>
            <span className="cm-era-pill" style={{ background: meta.color }}>
              {era.name}
            </span>
          </div>
          <div className="cm-header-actions">
            <span className="cm-status">{statusText}</span>
            <button
              type="button"
              className="cm-close-btn"
              aria-label="Close concept map"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        <div className="cm-body">
          {/* Palette */}
          <aside className="cm-palette" aria-label="Location palette">
            <div className="cm-palette-section cm-section--era">
              <h4 className="cm-palette-heading">
                <span className="cm-section-icon" aria-hidden>
                  📍
                </span>
                Era Locations
              </h4>
              {visitedEraLocs.length === 0 ? (
                <p className="cm-palette-empty">
                  Visit locations on the map to add them here.
                </p>
              ) : (
                visitedEraLocs.map((loc) => {
                  const added = onCanvas.has(`loc-${loc.id}`);
                  return (
                    <div className="cm-palette-item" key={loc.id}>
                      <span
                        className="cm-palette-dot"
                        style={{ background: ERA_META[loc.era].color }}
                        aria-hidden
                      />
                      <span
                        className={cn('cm-palette-item-name', added && 'on-map')}
                        title={loc.name}
                      >
                        {loc.name}
                      </span>
                      <button
                        type="button"
                        className="cm-btn cm-btn-secondary cm-palette-add-btn"
                        disabled={locked || added}
                        onClick={() => addLocationNode(loc)}
                        aria-label={`Add ${loc.name}`}
                      >
                        +
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="cm-palette-section cm-section--cross">
              <h4 className="cm-palette-heading">
                <span className="cm-section-icon" aria-hidden>
                  🔗
                </span>
                Cross-Era
              </h4>
              <button
                type="button"
                className="cm-palette-action-btn cm-palette-action-btn--cross"
                disabled={locked || crossEraLocs.length === 0}
                onClick={() => setCrossEraOpen(true)}
              >
                <span className="cm-action-plus" aria-hidden>
                  ＋
                </span>
                Add from another era
              </button>
            </div>

            <div className="cm-palette-section cm-section--custom">
              <h4 className="cm-palette-heading">
                <span className="cm-section-icon" aria-hidden>
                  ✦
                </span>
                Custom Nodes
              </h4>
              <button
                type="button"
                className="cm-palette-action-btn cm-palette-action-btn--custom"
                disabled={locked}
                onClick={() => setCustomOpen(true)}
              >
                <span className="cm-action-plus" aria-hidden>
                  ＋
                </span>
                Create custom node
              </button>
              {customNodes.map((n) => (
                <div className="cm-custom-palette-item" key={n.id}>
                  <span className="cm-custom-palette-dot" aria-hidden />
                  <span className="cm-custom-palette-name on-map" title={n.label}>
                    {n.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="cm-instructions">
              <strong>💡 Quick Start</strong>
              <div className="cm-steps">
                <div className="cm-step">
                  <span className="cm-step-n">1</span>
                  <span>
                    Click <strong>+</strong> beside a location to add it
                  </span>
                </div>
                <div className="cm-step">
                  <span className="cm-step-n">2</span>
                  <span>
                    Click a node, then <strong>Start connection</strong>
                  </span>
                </div>
                <div className="cm-step">
                  <span className="cm-step-n">3</span>
                  <span>Click the destination node</span>
                </div>
                <div className="cm-step">
                  <span className="cm-step-n">4</span>
                  <span>Describe the relationship, then add it</span>
                </div>
              </div>
              <div className="cm-instructions-tip">
                Click any edge to edit its label or delete it
              </div>
            </div>
          </aside>

          {/* Canvas */}
          <div className={cn('cm-canvas-area', pendingSource && 'source-pending')}>
            <ConceptMapCanvas
              graph={graph}
              locked={locked}
              pendingSourceId={pendingSource}
              accentColor={meta.color}
              isDark={isDark}
              onNodeTap={onNodeTap}
              onEdgeTap={onEdgeTap}
              onBackgroundTap={onBackgroundTap}
              onCommitPositions={commitPositions}
              onApiReady={(api) => {
                apiRef.current = api;
              }}
            />

            <div className={cn('cm-empty-state', graph.elements.length > 0 && 'hidden')}>
              <div className="cm-empty-state-icon" aria-hidden>
                🕸️
              </div>
              <div className="cm-empty-state-text">
                Add locations from the sidebar to start building your concept
                map
              </div>
            </div>

            <div className="cm-zoom-controls">
              <button
                type="button"
                className="cm-zoom-btn"
                title="Zoom in"
                aria-label="Zoom in"
                onClick={() => apiRef.current?.zoomIn()}
              >
                +
              </button>
              <button
                type="button"
                className="cm-zoom-btn"
                title="Zoom out"
                aria-label="Zoom out"
                onClick={() => apiRef.current?.zoomOut()}
              >
                −
              </button>
            </div>

            {insightText ? (
              <div
                className="cm-edge-popup visible"
                style={{ left: 16, top: 16, width: 320 }}
                role="status"
              >
                <span className="cm-edge-popup-label">💡 AI Hint</span>
                <p style={{ fontSize: '0.83rem', lineHeight: 1.55, color: 'var(--text)' }}>
                  {insightText}
                </p>
                <div className="cm-edge-popup-actions">
                  <button
                    type="button"
                    className="cm-btn cm-btn-secondary"
                    onClick={() => setInsightText(null)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}

            {contextMenu ? (
              <div
                className="cm-context-menu visible"
                style={{ left: contextMenu.pos.x, top: contextMenu.pos.y }}
                role="menu"
              >
                {contextMenu.kind === 'node' ? (
                  <>
                    <button
                      type="button"
                      className="cm-context-menu-item"
                      onClick={() => {
                        setPendingSource(contextMenu.id);
                        setContextMenu(null);
                      }}
                    >
                      🔗 Start connection from here
                    </button>
                    <div className="cm-context-menu-sep" />
                    <button
                      type="button"
                      className="cm-context-menu-item danger"
                      onClick={() => {
                        removeNode(contextMenu.id);
                        setContextMenu(null);
                      }}
                    >
                      🗑️ Remove from map
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="cm-context-menu-item"
                      onClick={() => {
                        const edge = graph.elements.find(
                          (e) => dataOf(e).id === contextMenu.id,
                        );
                        const d = edge ? dataOf(edge) : undefined;
                        setContextMenu(null);
                        if (d?.source && d?.target) {
                          setEdgePopup({
                            pos: contextMenu.pos,
                            source: d.source,
                            target: d.target,
                            editingEdgeId: contextMenu.id,
                            value: d.label ?? '',
                          });
                        }
                      }}
                    >
                      Edit label
                    </button>
                    <div className="cm-context-menu-sep" />
                    <button
                      type="button"
                      className="cm-context-menu-item danger"
                      onClick={() => {
                        removeEdge(contextMenu.id);
                        setContextMenu(null);
                      }}
                    >
                      Delete connection
                    </button>
                  </>
                )}
              </div>
            ) : null}

            {edgePopup ? (
              <div
                className="cm-edge-popup visible"
                style={{ left: edgePopup.pos.x, top: edgePopup.pos.y }}
              >
                <label className="cm-edge-popup-label" htmlFor="cm-edge-label-input">
                  Relationship label
                </label>
                <input
                  id="cm-edge-label-input"
                  type="text"
                  value={edgePopup.value}
                  onChange={(e) =>
                    setEdgePopup((p) => (p ? { ...p, value: e.target.value } : p))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      confirmEdgePopup();
                    }
                  }}
                  placeholder="e.g. both displaced by Mission system"
                  maxLength={120}
                  autoComplete="off"
                  autoFocus
                />
                <div className="cm-edge-popup-actions">
                  <button
                    type="button"
                    className="cm-btn cm-btn-secondary"
                    onClick={() => {
                      setEdgePopup(null);
                      setPendingSource(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="cm-btn cm-btn-primary"
                    onClick={confirmEdgePopup}
                  >
                    {edgePopup.editingEdgeId ? 'Save' : 'Add Connection'}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Cross-era picker */}
            <div className={cn('cm-cross-era-picker', crossEraOpen && 'visible')}>
              <div className="cm-cross-era-picker-inner">
                <div className="cm-cross-era-picker-header">
                  <span>Add location from another era</span>
                  <button
                    type="button"
                    className="cm-close-btn"
                    aria-label="Close picker"
                    onClick={() => setCrossEraOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <div id="cm-picker-list">
                  {crossEraLocs.length === 0 ? (
                    <p className="cm-picker-empty">
                      No visited locations in other unlocked eras yet.
                    </p>
                  ) : (
                    crossEraLocs.map((loc) => {
                      const added = onCanvas.has(`loc-${loc.id}`);
                      return (
                        <div className="cm-picker-item" key={loc.id}>
                          <span className={cn('cm-picker-era-badge', loc.era)}>
                            {ERA_META[loc.era].label}
                          </span>
                          <span className="cm-picker-name">{loc.name}</span>
                          <button
                            type="button"
                            className="cm-btn cm-btn-secondary cm-picker-add-btn"
                            disabled={added}
                            onClick={() => {
                              addLocationNode(loc, true);
                              setCrossEraOpen(false);
                            }}
                          >
                            {added ? 'Added' : 'Add'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Custom node dialog */}
            <div className={cn('cm-custom-node-dialog', customOpen && 'visible')}>
              <div className="cm-custom-node-dialog-inner">
                <div className="cm-cross-era-picker-header">
                  <span>Add custom node</span>
                  <button
                    type="button"
                    className="cm-close-btn"
                    aria-label="Close"
                    onClick={() => {
                      setCustomOpen(false);
                      setCustomDraft('');
                    }}
                  >
                    ×
                  </button>
                </div>
                <div style={{ padding: '14px 16px 16px' }}>
                  <label className="cm-edge-popup-label" htmlFor="cm-custom-node-input">
                    Node label
                  </label>
                  <input
                    id="cm-custom-node-input"
                    type="text"
                    value={customDraft}
                    onChange={(e) => setCustomDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomNode(customDraft);
                        setCustomDraft('');
                        setCustomOpen(false);
                      }
                    }}
                    placeholder="e.g. Trade Routes, Disease, Religion…"
                    maxLength={60}
                    autoComplete="off"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '8px 11px',
                      border: '1.5px solid var(--border)',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      outline: 'none',
                    }}
                  />
                  <div className="cm-edge-popup-actions" style={{ marginTop: 10 }}>
                    <button
                      type="button"
                      className="cm-btn cm-btn-secondary"
                      onClick={() => {
                        setCustomOpen(false);
                        setCustomDraft('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="cm-btn cm-btn-primary"
                      onClick={() => {
                        addCustomNode(customDraft);
                        setCustomDraft('');
                        setCustomOpen(false);
                      }}
                    >
                      Add Node
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tutor */}
          <ConceptMapChat eraOrder={eraOrder} graph={graph} />
        </div>

        {/* AI feedback results */}
        {evaluation ? (
          <div className="cm-results-panel">
            <div className="cm-results-header">
              <div className="cm-results-header-title">
                <span className="cm-results-header-icon" aria-hidden>
                  ✨
                </span>
                <span>AI Feedback</span>
              </div>
              <span className="cm-synthesis-score">
                {evaluation.synthesisScore}/100
              </span>
            </div>
            <div className="cm-edge-feedback-list">
              {evaluation.edgeFeedback.map((ef, i) => (
                <EdgeFeedbackItem key={i} ef={ef} />
              ))}
            </div>
            <div className="cm-results-overall">
              <span className="cm-results-overall-icon" aria-hidden>
                📝
              </span>
              <span>{evaluation.overallComment}</span>
            </div>
            {evaluation.followUpQuestion ? (
              <div className="cm-results-follow-up">
                <span className="cm-results-follow-up-icon" aria-hidden>
                  ❓
                </span>
                <span>{evaluation.followUpQuestion}</span>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Footer */}
        <div className="cm-panel-footer">
          <div className="cm-footer-left">
            <span className="cm-edge-count">
              {nodeCount} nodes · {edgeCount} connections
            </span>
            <span className={cn('cm-save-indicator', savedFlash && 'visible')}>
              ✓ Saved
            </span>
            <button
              type="button"
              className="cm-btn cm-btn-secondary"
              title="Fit all nodes in view"
              onClick={() => apiRef.current?.fit()}
            >
              ⤢ Fit
            </button>
            <button
              type="button"
              className="cm-btn cm-btn-secondary"
              title="Auto-arrange nodes"
              onClick={() => apiRef.current?.layout()}
            >
              ⟳ Auto-arrange
            </button>
            <button
              type="button"
              className="cm-btn cm-btn-secondary cm-clear-all-btn"
              disabled={locked || graph.elements.length === 0}
              onClick={() => commit(emptyGraph())}
            >
              Clear All
            </button>
            {!locked ? (
              <button
                type="button"
                className="cm-btn cm-btn-insight"
                disabled={insightLoading || insightUsesLeft <= 0}
                onClick={fetchInsight}
                title={`Spend ${POINTS.insight} pts for a direct hint`}
              >
                {insightLoading
                  ? 'Loading…'
                  : `💡 AI Hint (${POINTS.insight} pts) — ${insightUsesLeft} left`}
              </button>
            ) : null}
          </div>
          <div className="cm-footer-right">
            {!locked ? (
              <button
                type="button"
                className="cm-btn cm-btn-secondary"
                onClick={flashSaved}
              >
                💾 Save
              </button>
            ) : null}
            {!locked ? (
              <div className="cm-submit-wrapper">
                <button
                  type="button"
                  className="cm-btn cm-btn-primary"
                  disabled={submitLoading || edgeCount < MIN_EDGES_TO_SUBMIT}
                  onClick={submit}
                >
                  {submitLoading ? 'Grading…' : 'Submit for Feedback'}
                </button>
                <span className="cm-submit-tooltip" role="tooltip">
                  {submitTooltip}
                </span>
              </div>
            ) : (
              <span className="cm-status">Submitted ✓</span>
            )}
          </div>
        </div>

        {statusMsg ? (
          <div
            role="status"
            style={{
              padding: '8px 18px',
              fontSize: '0.8rem',
              color: 'var(--danger)',
              borderTop: '1px solid var(--border)',
            }}
          >
            {statusMsg}
          </div>
        ) : null}
      </div>
    </div>
  );

  function confirmEdgePopup() {
    if (!edgePopup) return;
    const value = edgePopup.value.trim();
    if (edgePopup.editingEdgeId) {
      updateLabel(edgePopup.editingEdgeId, value);
    } else {
      addEdge(edgePopup.source, edgePopup.target, value);
    }
    setEdgePopup(null);
    setPendingSource(null);
  }
}

function EdgeFeedbackItem({ ef }: { ef: EdgeAssessment }) {
  const ratingClass =
    ef.rating === 'strong'
      ? 'strong'
      : ef.rating === 'partial'
        ? 'partial'
        : 'needs_probing';
  const ratingLabel =
    ef.rating === 'strong'
      ? 'Strong'
      : ef.rating === 'partial'
        ? 'Partial'
        : 'Needs probing';
  return (
    <div className={cn('cm-edge-feedback-item', `cm-ef-${ratingClass}`)}>
      <div className="cm-edge-feedback-connection">
        <span className={cn('cm-ef-quality-badge', `cm-ef-badge-${ratingClass}`)}>
          {ratingLabel}
        </span>
        <span className="cm-ef-label">“{ef.edgeLabel}”</span>
      </div>
      <div className="cm-edge-feedback-comment">{ef.feedback}</div>
    </div>
  );
}
