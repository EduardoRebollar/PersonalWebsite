'use client';

import { useEffect, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

import { cn } from '@/lib/cn';
import { locationForId } from '@/lib/laHistory/gamification';
import { playSfx } from '@/lib/laHistory/sfx';
import { useTts } from '@/lib/laHistory/tts';
import { useVoiceInput } from '@/lib/laHistory/voice';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type { TutorMessage, TutorRole } from '@/types/laHistory';

// Docked Socratic tutor — 1:1 port of the original `.chat-panel`
// (static/js/chat.js): a collapsible bottom-right panel that peeks when
// closed, contextual to the currently-open map location. Voice mic is wired
// in Step 7; TTS read-aloud per message is added there too.

type Props = {
  /** The currently-selected map location (chat context), or null. */
  locationId: number | null;
};

function chatKeyForLocation(locationId: number): string {
  return `location:${locationId}`;
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

export function TutorChat({ locationId }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const tts = useTts();
  const voice = useVoiceInput((text) =>
    setDraft((d) => (d ? `${d} ${text}` : text)),
  );

  const location = locationId != null ? locationForId(locationId) : undefined;

  const restoredMessages = useLaHistoryStore((s) =>
    locationId != null ? s.chatHistory[chatKeyForLocation(locationId)] : undefined,
  );
  const setChatHistory = useLaHistoryStore((s) => s.setChatHistory);
  const clearChatHistory = useLaHistoryStore((s) => s.clearChatHistory);

  const initialMessages = useMemo<UIMessage[]>(
    () => (restoredMessages ? restoredMessages.map(tutorToUi) : []),
    // Only re-seed when the location changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locationId],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/la-history/tutor',
        body: locationId != null ? { locationId } : undefined,
      }),
    [locationId],
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: locationId != null ? `tutor-${locationId}` : undefined,
    transport,
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  useEffect(() => {
    if (locationId == null || status !== 'ready' || messages.length === 0) return;
    setChatHistory(chatKeyForLocation(locationId), messages.map(uiToTutor));
  }, [messages, status, locationId, setChatHistory]);

  const busy = status === 'streaming' || status === 'submitted';

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed || locationId == null || busy) return;
    playSfx('chat-send');
    sendMessage({ text: trimmed });
    setDraft('');
  }

  function clear() {
    if (locationId != null) clearChatHistory(chatKeyForLocation(locationId));
    setMessages([]);
  }

  return (
    <div className={cn('chat-panel', open && 'open')}>
      <div className="chat-panel-header">
        <button
          type="button"
          className="chat-panel-header-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="chat-panel-icon" aria-hidden>
            🎓
          </span>
          <span className="chat-panel-title">Socratic Tutor</span>
          <span className="chat-panel-context">{location?.name ?? ''}</span>
        </button>
        <div className="chat-panel-actions">
          <button
            type="button"
            className="chat-action-btn"
            id="chat-clear-btn"
            title="Clear conversation"
            aria-label="Clear conversation"
            onClick={clear}
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
          <button
            type="button"
            className="chat-action-btn"
            id="chat-toggle-btn"
            title={open ? 'Collapse' : 'Expand'}
            aria-label={open ? 'Collapse tutor' : 'Expand tutor'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? '▼' : '▲'}
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-intro">
            <div className="chat-intro-icon" aria-hidden>
              🎓
            </div>
            <strong>Socratic Tutor</strong>
            {locationId == null
              ? 'Open a location on the map, then ask the tutor about it — I’ll guide you with questions rather than answers.'
              : 'Ask a question about this location — I’ll guide you with questions rather than answers.'}
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
                {m.role === 'assistant' && tts.supported && text ? (
                  <button
                    type="button"
                    className={cn('chat-tts-btn', tts.activeId === m.id && 'active')}
                    title="Read aloud"
                    onClick={() => tts.toggle(m.id, text)}
                  >
                    {tts.activeId === m.id ? '⏹' : '🔊'}
                  </button>
                ) : null}
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
            id="chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder={
              locationId == null ? 'Open a location first…' : 'Ask the tutor…'
            }
            disabled={locationId == null}
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
          disabled={!draft.trim() || locationId == null || busy}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
            <path d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
