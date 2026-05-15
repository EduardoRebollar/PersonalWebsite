'use client';

// Concept-map-scoped Socratic chat. Same shape as TutorChat but bound to
// the era and injects the current graph state into the request body so the
// 17-rule system prompt has live map context to reason about.

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

const TRANSPORT = new DefaultChatTransport({
  api: '/api/la-history/concept-map/chat',
});

import { cn } from '@/lib/cn';
import { eraByOrder } from '@/content/data/laHistory/eras';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type {
  ConceptMapGraph,
  TutorMessage,
  TutorRole,
} from '@/types/laHistory';

type Props = {
  open: boolean;
  eraOrder: number;
  graph: ConceptMapGraph;
  onClose: () => void;
};

function uiToTutor(m: UIMessage): TutorMessage {
  const text = m.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
  return {
    role: (m.role === 'assistant' ? 'assistant' : 'user') as TutorRole,
    content: text,
    createdAt: Date.now(),
  };
}

function tutorToUi(m: TutorMessage, idx: number): UIMessage {
  return {
    id: `restored-${idx}`,
    role: m.role,
    parts: [{ type: 'text', text: m.content }],
  } as UIMessage;
}

function chatKeyForEra(eraOrder: number): string {
  return `era:${eraOrder}`;
}

export function ConceptMapChat({ open, eraOrder, graph, onClose }: Props) {
  const era = eraByOrder.get(eraOrder);
  const restoredMessages = useLaHistoryStore(
    (s) => s.chatHistory[chatKeyForEra(eraOrder)],
  );
  const setChatHistory = useLaHistoryStore((s) => s.setChatHistory);

  const initialMessages = useMemo<UIMessage[]>(
    () => (restoredMessages ? restoredMessages.map(tutorToUi) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eraOrder],
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: `concept-map-${eraOrder}`,
    transport: TRANSPORT,
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  useEffect(() => {
    if (status !== 'ready') return;
    if (messages.length === 0) return;
    const tutored = messages.map(uiToTutor);
    setChatHistory(chatKeyForEra(eraOrder), tutored);
  }, [messages, status, eraOrder, setChatHistory]);

  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, status]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [open, onClose]);

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (status === 'streaming' || status === 'submitted') return;
    sendMessage(
      { text: trimmed },
      { body: { eraOrder, graph } },
    );
    setDraft('');
  }

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={-1}
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 cursor-pointer bg-base/50 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Concept-map tutor chat"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] min-h-[55vh] flex-col rounded-t-2xl border-t border-hairline bg-surface shadow-2xl transition-transform duration-300 ease-out',
          'sm:right-4 sm:bottom-4 sm:left-auto sm:w-[26rem] sm:rounded-2xl sm:border',
          open ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <header className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
              Concept-map tutor
            </p>
            <p className="mt-0.5 font-display text-base text-fg">
              {era?.name ?? `Era ${eraOrder}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutor"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-fg-mute transition-colors hover:border-accent hover:text-accent"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-4 w-4"
            >
              <path d="M6 6 L18 18 M18 6 L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-3"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <p className="mx-auto max-w-[20rem] text-center text-sm text-fg-mute">
              The tutor sees your current map and follows strict Socratic
              rules — it asks questions, never states facts.
            </p>
          ) : (
            <ul className="space-y-3">
              {messages.map((m) => {
                const text = m.parts
                  .filter(
                    (p): p is { type: 'text'; text: string } =>
                      p.type === 'text',
                  )
                  .map((p) => p.text)
                  .join('');
                const isUser = m.role === 'user';
                return (
                  <li
                    key={m.id}
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                      isUser
                        ? 'ml-auto bg-elev text-fg'
                        : 'mr-auto bg-base/60 text-fg',
                    )}
                  >
                    {text || <span className="text-fg-mute">…</span>}
                  </li>
                );
              })}
            </ul>
          )}
          {status === 'submitted' || status === 'streaming' ? (
            <p className="mt-3 font-mono text-[10px] tracking-[0.18em] text-fg-mute uppercase">
              Tutor is thinking…
            </p>
          ) : null}
          {error ? (
            <p className="mt-3 text-sm text-warn">
              The tutor couldn&apos;t respond. Try again in a moment.
            </p>
          ) : null}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-end gap-2 border-t border-hairline px-3 py-3"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="What are you noticing about your map?"
            className="max-h-32 min-h-[2.25rem] flex-1 resize-none rounded-xl border border-hairline bg-base px-3 py-2 text-sm text-fg placeholder-fg-mute outline-none focus-visible:border-accent"
            aria-label="Your message"
          />
          <button
            type="submit"
            disabled={
              !draft.trim() ||
              status === 'streaming' ||
              status === 'submitted'
            }
            className="inline-flex h-9 items-center rounded-full border border-hairline bg-base px-4 font-mono text-[11px] tracking-[0.14em] text-fg uppercase transition-colors enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </section>
    </>
  );
}
