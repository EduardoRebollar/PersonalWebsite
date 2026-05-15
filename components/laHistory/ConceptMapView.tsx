'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ElementDefinition } from 'cytoscape';

import { cn } from '@/lib/cn';
import { eras, eraByOrder } from '@/content/data/laHistory/eras';
import {
  INSIGHT_MAX_USES,
  POINTS,
  isEraUnlocked,
  locationsInEra,
} from '@/lib/laHistory/gamification';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type {
  ConceptMapEvaluation,
  ConceptMapGraph,
} from '@/types/laHistory';
import { ConceptMapCanvas } from './ConceptMapCanvas';
import { ConceptMapChat } from './ConceptMapChat';

const MIN_EDGES_TO_SUBMIT = 3;
const HISTORY_LIMIT = 30;

type EvaluateResponse = {
  evaluation?: {
    edgeFeedback: ConceptMapEvaluation['edgeFeedback'];
    overallComment: string;
    followUpQuestion: string;
    synthesisScore: number;
  };
  error?: string;
  message?: string;
};

function nextId(prefix: 'n' | 'e'): string {
  const r = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${r}`;
}

function emptyGraph(): ConceptMapGraph {
  return { elements: [] };
}

function cloneGraph(g: ConceptMapGraph): ConceptMapGraph {
  return { elements: g.elements.map((e) => ({ ...e, data: { ...e.data } })) };
}

function findElement(
  graph: ConceptMapGraph,
  id: string,
): ElementDefinition | undefined {
  return graph.elements.find(
    (el) => (el.data as { id?: string } | undefined)?.id === id,
  );
}

function isEdge(el: ElementDefinition): boolean {
  const data = el.data as { source?: string; target?: string } | undefined;
  return !!(data?.source && data?.target);
}

// Top-level shell. Holds only the active era. Editor is keyed on era so
// switching eras tears down + re-mounts state cleanly with no resync effect.
export function ConceptMapView() {
  const conceptMaps = useLaHistoryStore((s) => s.conceptMaps);
  const quizPasses = useLaHistoryStore((s) => s.quizPasses);

  const initialEra = useMemo(() => {
    for (const era of eras) {
      if (
        isEraUnlocked(era.order, { quizPasses, conceptMaps }) &&
        !conceptMaps[era.order]?.submitted
      ) {
        return era.order;
      }
    }
    return 1;
  }, [quizPasses, conceptMaps]);
  const [eraOrder, setEraOrder] = useState<number>(initialEra);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline px-4 py-2 sm:px-6">
        <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
          Era
        </p>
        {eras.map((e) => {
          const unlocked = isEraUnlocked(e.order, { quizPasses, conceptMaps });
          const submitted = !!conceptMaps[e.order]?.submitted;
          const active = e.order === eraOrder;
          return (
            <button
              key={e.order}
              type="button"
              disabled={!unlocked}
              onClick={() => setEraOrder(e.order)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors',
                active
                  ? 'border-accent text-accent'
                  : 'border-hairline text-fg-mute hover:border-fg-mute hover:text-fg',
                !unlocked && 'opacity-40',
              )}
              style={
                active
                  ? { borderColor: e.accentColor, color: e.accentColor }
                  : undefined
              }
            >
              {e.shortLabel}
              {submitted ? ' ✓' : ''}
            </button>
          );
        })}
      </div>
      <ConceptMapEditor key={eraOrder} eraOrder={eraOrder} />
    </div>
  );
}

function ConceptMapEditor({ eraOrder }: { eraOrder: number }) {
  const conceptMap = useLaHistoryStore((s) => s.conceptMaps[eraOrder]);
  const points = useLaHistoryStore((s) => s.points);
  const saveConceptMap = useLaHistoryStore((s) => s.saveConceptMap);
  const chargeInsight = useLaHistoryStore((s) => s.chargeInsight);
  const submitConceptMap = useLaHistoryStore((s) => s.submitConceptMap);

  const era = eraByOrder.get(eraOrder)!;
  const locked = conceptMap?.submitted === true;
  const eraLocations = useMemo(() => locationsInEra(eraOrder), [eraOrder]);

  const [graph, setGraph] = useState<ConceptMapGraph>(
    () => conceptMap?.graph ?? emptyGraph(),
  );
  const [pastStack, setPastStack] = useState<ConceptMapGraph[]>([]);
  const [futureStack, setFutureStack] = useState<ConceptMapGraph[]>([]);
  const [selectedId, setSelected] = useState<string | null>(null);
  const [selectedKind, setSelectedKind] = useState<
    'node' | 'edge' | null
  >(null);
  const [connectFromId, setConnectFromId] = useState<string | null>(null);
  const [labelEditor, setLabelEditor] = useState<
    { id: string; kind: 'node' | 'edge'; value: string } | null
  >(null);
  const [customNodeDraft, setCustomNodeDraft] = useState('');
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightText, setInsightText] = useState<string | null>(null);
  const [insightError, setInsightError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const insightUsesLeft =
    INSIGHT_MAX_USES - (conceptMap?.insightUses ?? 0);
  const edgeCount = graph.elements.filter(isEdge).length;
  const nodeCount = graph.elements.length - edgeCount;

  const commit = useCallback(
    (next: ConceptMapGraph) => {
      setPastStack((prev) =>
        [...prev, cloneGraph(graph)].slice(-HISTORY_LIMIT),
      );
      setFutureStack([]);
      setGraph(next);
      saveConceptMap(eraOrder, next);
    },
    [graph, saveConceptMap, eraOrder],
  );

  const addNode = useCallback(
    (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      const id = nextId('n');
      const next: ConceptMapGraph = {
        elements: [
          ...graph.elements,
          {
            data: { id, label: trimmed },
            position: jitteredPosition(graph),
          },
        ],
      };
      commit(next);
      setSelected(id);
      setSelectedKind('node');
    },
    [graph, commit],
  );

  const addEdge = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) return;
      const exists = graph.elements.some((el) => {
        const d = el.data as
          | { source?: string; target?: string }
          | undefined;
        return d?.source === sourceId && d?.target === targetId;
      });
      if (exists) {
        setSelected(null);
        return;
      }
      const id = nextId('e');
      const next: ConceptMapGraph = {
        elements: [
          ...graph.elements,
          { data: { id, source: sourceId, target: targetId, label: '' } },
        ],
      };
      commit(next);
      setSelected(id);
      setSelectedKind('edge');
      setLabelEditor({ id, kind: 'edge', value: '' });
    },
    [graph, commit],
  );

  const updateLabel = useCallback(
    (id: string, value: string) => {
      const next: ConceptMapGraph = {
        elements: graph.elements.map((el) => {
          const d = el.data as { id?: string } | undefined;
          if (d?.id !== id) return el;
          return { ...el, data: { ...el.data, label: value } };
        }),
      };
      commit(next);
    },
    [graph, commit],
  );

  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    const next: ConceptMapGraph = {
      elements: graph.elements.filter((el) => {
        const d = el.data as
          | { id?: string; source?: string; target?: string }
          | undefined;
        if (d?.id === selectedId) return false;
        if (
          selectedKind === 'node' &&
          (d?.source === selectedId || d?.target === selectedId)
        ) {
          return false;
        }
        return true;
      }),
    };
    commit(next);
    setSelected(null);
    setSelectedKind(null);
    setLabelEditor(null);
  }, [graph, commit, selectedId, selectedKind]);

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
      const next: ConceptMapGraph = { elements };
      setGraph(next);
      saveConceptMap(eraOrder, next);
    },
    [saveConceptMap, eraOrder],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (locked) return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        removeSelected();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (e.key === 'Escape') {
        setSelected(null);
        setSelectedKind(null);
        setConnectFromId(null);
        setLabelEditor(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, locked, removeSelected, undo, redo]);

  async function fetchInsight() {
    setInsightError(null);
    if (insightUsesLeft <= 0) {
      setInsightError('No insight uses remaining for this era.');
      return;
    }
    if (points < POINTS.insight) {
      setInsightError(`Need ${POINTS.insight} pts for an insight.`);
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
        setInsightError('Couldn’t fetch an insight. Try again in a moment.');
        return;
      }
      const data = (await res.json()) as { insight?: string };
      if (!data.insight) {
        setInsightError('Insight service returned an empty response.');
        return;
      }
      const charge = chargeInsight(eraOrder);
      if (!charge.ok) {
        setInsightError(
          charge.reason === 'no_uses_left'
            ? 'No insight uses remaining.'
            : `Need ${POINTS.insight} pts for an insight.`,
        );
        return;
      }
      setInsightText(data.insight);
    } catch {
      setInsightError('Network error fetching insight.');
    } finally {
      setInsightLoading(false);
    }
  }

  async function submit() {
    setSubmitError(null);
    if (edgeCount < MIN_EDGES_TO_SUBMIT) {
      setSubmitError(
        `Add at least ${MIN_EDGES_TO_SUBMIT} edges before submitting.`,
      );
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await fetch('/api/la-history/concept-map/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ eraOrder, graph }),
      });
      const data = (await res.json()) as EvaluateResponse;
      if (!res.ok || !data.evaluation) {
        setSubmitError(
          data.message ?? 'The evaluator couldn’t grade your map. Try again.',
        );
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
      setSubmitError('Network error submitting your map.');
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-hairline p-4 sm:flex">
          <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
            {era.shortLabel} locations
          </p>
          <ul className="mt-2 flex flex-col gap-1.5 overflow-y-auto">
            {eraLocations.map((loc) => (
              <li key={loc.id}>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => addNode(loc.name)}
                  className="w-full rounded-lg border border-hairline px-2 py-1.5 text-left text-xs text-fg transition-colors enabled:hover:border-fg-mute disabled:opacity-50"
                >
                  + {loc.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
              Custom node
            </p>
            <form
              className="mt-2 flex gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                addNode(customNodeDraft);
                setCustomNodeDraft('');
              }}
            >
              <input
                value={customNodeDraft}
                onChange={(e) => setCustomNodeDraft(e.target.value)}
                disabled={locked}
                placeholder="theme, event…"
                className="min-w-0 flex-1 rounded-md border border-hairline bg-base px-2 py-1.5 text-xs text-fg placeholder-fg-mute outline-none focus-visible:border-accent disabled:opacity-50"
                aria-label="Custom node label"
              />
              <button
                type="submit"
                disabled={locked || !customNodeDraft.trim()}
                className="rounded-md border border-hairline px-2 py-1 font-mono text-[10px] tracking-[0.14em] text-fg uppercase enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-40"
              >
                Add
              </button>
            </form>
          </div>
        </aside>

        <div className="relative flex-1">
          <ConceptMapCanvas
            graph={graph}
            locked={locked}
            selectedId={selectedId}
            connectFromId={connectFromId}
            accentColor={era.accentColor}
            onSelect={(id, kind) => {
              setSelected(id);
              setSelectedKind(kind);
              if (kind !== 'node' && connectFromId) setConnectFromId(null);
            }}
            onConnectFromCleared={() => setConnectFromId(null)}
            onCreateEdge={(s, t) => addEdge(s, t)}
            onCommitPositions={commitPositions}
          />

          {graph.elements.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
              <p className="max-w-sm text-sm text-fg-mute">
                Pick a location from the left to drop your first node, then
                drag nodes apart and click{' '}
                <span className="text-fg">Connect</span> to draw relationships
                between them.
              </p>
            </div>
          ) : null}

          {insightText ? (
            <div className="pointer-events-auto absolute bottom-4 left-1/2 z-10 w-[min(28rem,90vw)] -translate-x-1/2 rounded-xl border border-glow/40 bg-base/95 p-4 text-sm leading-relaxed text-fg shadow-2xl backdrop-blur-md">
              <p className="font-mono text-[10px] tracking-[0.18em] text-glow uppercase">
                Insight
              </p>
              <p className="mt-1">{insightText}</p>
              <button
                type="button"
                onClick={() => setInsightText(null)}
                className="mt-3 font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase hover:text-fg"
              >
                Dismiss
              </button>
            </div>
          ) : null}
        </div>

        <aside className="hidden w-72 shrink-0 flex-col border-l border-hairline p-4 lg:flex">
          {locked && conceptMap?.evaluation ? (
            <EvaluationPanel
              evaluation={conceptMap.evaluation}
              accent={era.accentColor}
            />
          ) : selectedId && selectedKind ? (
            <SelectionEditor
              key={selectedId}
              graph={graph}
              selectedId={selectedId}
              selectedKind={selectedKind}
              labelEditor={labelEditor}
              setLabelEditor={setLabelEditor}
              onUpdateLabel={updateLabel}
              onRemove={removeSelected}
              connectFromId={connectFromId}
              onStartConnect={() => setConnectFromId(selectedId)}
              onCancelConnect={() => setConnectFromId(null)}
              locked={locked}
            />
          ) : (
            <HelpPanel
              nodeCount={nodeCount}
              insightUsesLeft={insightUsesLeft}
            />
          )}
        </aside>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={undo}
          disabled={pastStack.length === 0 || locked}
          className="rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-fg uppercase enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-40"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={futureStack.length === 0 || locked}
          className="rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-fg uppercase enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-40"
        >
          Redo
        </button>
        <button
          type="button"
          onClick={fetchInsight}
          disabled={insightLoading || locked || insightUsesLeft <= 0}
          className="rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-fg uppercase enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-40"
        >
          {insightLoading
            ? 'Loading insight…'
            : `Insight (−${POINTS.insight}, ${insightUsesLeft}/${INSIGHT_MAX_USES})`}
        </button>
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-fg uppercase hover:border-accent hover:text-accent"
        >
          Tutor chat
        </button>

        <span className="ml-auto font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase">
          {nodeCount} nodes · {edgeCount} edges
        </span>

        {!locked ? (
          <button
            type="button"
            onClick={submit}
            disabled={submitLoading || edgeCount < MIN_EDGES_TO_SUBMIT}
            className="rounded-full border border-accent bg-accent/10 px-4 py-1.5 font-mono text-[11px] tracking-[0.14em] text-accent uppercase enabled:hover:bg-accent/20 disabled:opacity-40"
          >
            {submitLoading ? 'Grading…' : 'Submit map'}
          </button>
        ) : (
          <span className="rounded-full border border-accent/40 px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-accent uppercase">
            Submitted
          </span>
        )}
      </div>

      {insightError ? (
        <p
          role="status"
          className="border-t border-warn/40 bg-warn/5 px-4 py-2 text-xs text-warn sm:px-6"
        >
          {insightError}
        </p>
      ) : null}
      {submitError ? (
        <p
          role="status"
          className="border-t border-warn/40 bg-warn/5 px-4 py-2 text-xs text-warn sm:px-6"
        >
          {submitError}
        </p>
      ) : null}

      <ConceptMapChat
        open={chatOpen}
        eraOrder={eraOrder}
        graph={graph}
        onClose={() => setChatOpen(false)}
      />
    </>
  );
}

function HelpPanel({
  nodeCount,
  insightUsesLeft,
}: {
  nodeCount: number;
  insightUsesLeft: number;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
        Building
      </p>
      <p className="mt-2 text-sm leading-relaxed text-fg">
        {nodeCount === 0
          ? 'Drop a few locations from the palette to start.'
          : 'Tap a node to select it, then tap Connect on the selected node to draw an edge to another node.'}
      </p>
      <p className="mt-3 text-xs text-fg-mute">
        Submit at {MIN_EDGES_TO_SUBMIT} edges. {insightUsesLeft} insight
        {insightUsesLeft === 1 ? '' : 's'} left.
      </p>
    </div>
  );
}

function SelectionEditor({
  graph,
  selectedId,
  selectedKind,
  labelEditor,
  setLabelEditor,
  onUpdateLabel,
  onRemove,
  connectFromId,
  onStartConnect,
  onCancelConnect,
  locked,
}: {
  graph: ConceptMapGraph;
  selectedId: string;
  selectedKind: 'node' | 'edge';
  labelEditor: { id: string; kind: 'node' | 'edge'; value: string } | null;
  setLabelEditor: (
    v: { id: string; kind: 'node' | 'edge'; value: string } | null,
  ) => void;
  onUpdateLabel: (id: string, value: string) => void;
  onRemove: () => void;
  connectFromId: string | null;
  onStartConnect: () => void;
  onCancelConnect: () => void;
  locked: boolean;
}) {
  const el = findElement(graph, selectedId);
  const data = el?.data as
    | { id?: string; label?: string; source?: string; target?: string }
    | undefined;
  const currentLabel = data?.label ?? '';
  const editing = labelEditor?.id === selectedId;
  const isSource = connectFromId === selectedId;

  function commit() {
    if (!labelEditor) return;
    onUpdateLabel(labelEditor.id, labelEditor.value.trim());
    setLabelEditor(null);
  }

  return (
    <div className="flex h-full flex-col">
      <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
        Selected {selectedKind}
      </p>

      {editing ? (
        <textarea
          value={labelEditor.value}
          onChange={(e) =>
            setLabelEditor({ ...labelEditor, value: e.target.value })
          }
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              commit();
            }
          }}
          autoFocus
          rows={3}
          placeholder={
            selectedKind === 'edge'
              ? 'How are these related?'
              : 'Node label'
          }
          className="mt-2 w-full resize-none rounded-lg border border-accent bg-base px-3 py-2 text-sm text-fg outline-none"
        />
      ) : (
        <p className="mt-2 break-words text-sm text-fg">
          {currentLabel || (
            <span className="text-fg-mute italic">No label</span>
          )}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {editing ? (
          <>
            <button
              type="button"
              onClick={commit}
              className="rounded-full border border-accent bg-accent/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-accent uppercase hover:bg-accent/20"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setLabelEditor(null)}
              className="rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase hover:text-fg"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={locked}
            onClick={() =>
              setLabelEditor({
                id: selectedId,
                kind: selectedKind,
                value: currentLabel,
              })
            }
            className="rounded-full border border-hairline px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-fg uppercase enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-50"
          >
            Edit label
          </button>
        )}
        {!editing && selectedKind === 'node' ? (
          <button
            type="button"
            disabled={locked}
            onClick={isSource ? onCancelConnect : onStartConnect}
            className={cn(
              'rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase transition-colors',
              isSource
                ? 'border-glow bg-glow/10 text-glow'
                : 'border-hairline text-fg enabled:hover:border-accent enabled:hover:text-accent',
              'disabled:opacity-50',
            )}
          >
            {isSource ? 'Cancel connect' : 'Connect →'}
          </button>
        ) : null}
        <button
          type="button"
          disabled={locked}
          onClick={onRemove}
          className="ml-auto rounded-full border border-warn/40 px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-warn uppercase enabled:hover:bg-warn/10 disabled:opacity-40"
        >
          Delete
        </button>
      </div>

      {isSource ? (
        <p className="mt-3 text-xs text-glow">
          Now tap another node to draw an edge from this one.
        </p>
      ) : null}
    </div>
  );
}

function EvaluationPanel({
  evaluation,
  accent,
}: {
  evaluation: ConceptMapEvaluation;
  accent: string;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
        Evaluation
      </p>
      <p className="mt-2 font-display text-3xl text-fg">
        {evaluation.synthesisScore}
        <span className="ml-1 align-top font-mono text-xs text-fg-mute">
          /100
        </span>
      </p>
      <p className="mt-1 text-xs text-fg-mute">
        +{evaluation.pointsAwarded} pts
      </p>

      <p className="mt-4 text-sm leading-relaxed text-fg">
        {evaluation.overallComment}
      </p>

      {evaluation.edgeFeedback.length > 0 ? (
        <div className="mt-4">
          <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
            Edges
          </p>
          <ul className="mt-2 space-y-2">
            {evaluation.edgeFeedback.map((e, i) => (
              <li
                key={i}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs leading-relaxed',
                  e.rating === 'strong' && 'border-accent/40 bg-accent/5',
                  e.rating === 'partial' && 'border-glow/40 bg-glow/5',
                  e.rating === 'weak' && 'border-warn/40 bg-warn/5',
                )}
                style={
                  e.rating === 'strong'
                    ? { borderColor: `${accent}66` }
                    : undefined
                }
              >
                <p className="font-mono text-[10px] tracking-[0.14em] text-fg-mute uppercase">
                  {e.edgeLabel} · {e.rating}
                </p>
                <p className="mt-1 text-fg">{e.feedback}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 rounded-lg border border-hairline bg-base/40 p-3">
        <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
          Follow-up question
        </p>
        <p className="mt-1 text-sm text-fg">{evaluation.followUpQuestion}</p>
      </div>
    </div>
  );
}

function jitteredPosition(graph: ConceptMapGraph): {
  x: number;
  y: number;
} {
  const positions = graph.elements
    .map((el) => (el as { position?: { x: number; y: number } }).position)
    .filter((p): p is { x: number; y: number } => !!p);
  const cx = positions.length
    ? positions.reduce((a, p) => a + p.x, 0) / positions.length
    : 0;
  const cy = positions.length
    ? positions.reduce((a, p) => a + p.y, 0) / positions.length
    : 0;
  return {
    x: cx + (Math.random() - 0.5) * 80,
    y: cy + (Math.random() - 0.5) * 80,
  };
}
