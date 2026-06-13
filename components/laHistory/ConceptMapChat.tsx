'use client';

// Concept-map-scoped Socratic tutor — the right-column `.cm-chat-panel`
// (1:1 with the original). Bound to the era and injects the current graph
// into the request body so the system prompt has live map context.

import { useEffect, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

import { cn } from '@/lib/cn';
import { playSfx } from '@/lib/laHistory/sfx';
import { useVoiceInput } from '@/lib/laHistory/voice';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type {
  ConceptMapGraph,
  TutorMessage,
  TutorRole,
} from '@/types/laHistory';

const TRANSPORT = new DefaultChatTransport({
  api: '/api/la-history/concept-map/chat',
});

function chatKeyForEra(eraOrder: number): string {
  return `era:${eraOrder}`;
}

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

export function ConceptMapChat({
  eraOrder,
  graph,
}: {
  eraOrder: number;
  graph: ConceptMapGraph;
}) {
  const [draft, setDraft] = useState('');
  const voice = useVoiceInput((text) =>
    setDraft((d) => (d ? `${d} ${text}` : text)),
  );

  const restoredMessages = useLaHistoryStore(
    (s) => s.chatHistory[chatKeyForEra(eraOrder)],
  );
  const setChatHistory = useLaHistoryStore((s) => s.setChatHistory);
  const clearChatHistory = useLaHistoryStore((s) => s.clearChatHistory);

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
    if (status !== 'ready' || messages.length === 0) return;
    setChatHistory(chatKeyForEra(eraOrder), messages.map(uiToTutor));
  }, [messages, status, eraOrder, setChatHistory]);

  const busy = status === 'streaming' || status === 'submitted';

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed || busy) return;
    playSfx('chat-send');
    sendMessage({ text: trimmed }, { body: { eraOrder, graph } });
    setDraft('');
  }

  return (
    <aside className="cm-chat-panel" aria-label="AI Tutor">
      <div className="cm-chat-header">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.8 }} aria-hidden>
          <path
            d="M14 1H2C1.45 1 1 1.45 1 2v8c0 .55.45 1 1 1h2v3l3.5-3H14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <span className="cm-chat-title">AI Tutor</span>
        <button
          type="button"
          className="cm-chat-clear-btn"
          title="Clear conversation"
          aria-label="Clear conversation"
          onClick={() => {
            clearChatHistory(chatKeyForEra(eraOrder));
            setMessages([]);
          }}
        >
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden>
            <path
              d="M2 3h9M5 3V2h3v1M4 3l.5 7h4L9 3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="cm-chat-messages">
        {messages.length === 0 ? (
          <div className="chat-intro">
            <div className="chat-intro-icon" aria-hidden>
              🎓
            </div>
            <strong>AI Tutor</strong>
            I guide your thinking with questions — I won’t give answers
            directly. Use the <strong>💡 AI Hint</strong> button below for
            direct suggestions.
          </div>
        ) : (
          messages.map((m) => {
            const text = m.parts
              .filter(
                (p): p is { type: 'text'; text: string } => p.type === 'text',
              )
              .map((p) => p.text)
              .join('');
            return (
              <div key={m.id} className={cn('chat-msg', m.role)}>
                <div className="chat-bubble">{text || '…'}</div>
              </div>
            );
          })
        )}
        {status === 'submitted' ? (
          <div className="chat-typing" aria-label="Tutor is thinking">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        ) : null}
        {error ? (
          <div className="chat-error">
            The tutor couldn’t respond. Try again in a moment.
          </div>
        ) : null}
      </div>

      <div className="chat-input-area">
        <div className={cn('chat-input-wrap', voice.supported && 'voice-enabled')}>
          <textarea
            id="cm-chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Ask about your map…"
            aria-label="Your message"
          />
          <button
            type="button"
            className={cn(
              'chat-mic-btn',
              voice.supported && 'visible',
              voice.state === 'listening' && 'listening',
              voice.state === 'error' && 'error',
            )}
            id="cm-chat-mic-btn"
            title="Voice input"
            aria-label="Start voice input"
            aria-pressed={voice.state === 'listening'}
            onClick={voice.start}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <rect x="4" y="1" width="5" height="7" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M2 7a4.5 4.5 0 009 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <line x1="6.5" y1="11.5" x2="6.5" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          className="chat-send-btn"
          title="Send"
          aria-label="Send message"
          onClick={submit}
          disabled={!draft.trim() || busy}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
            <path d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
