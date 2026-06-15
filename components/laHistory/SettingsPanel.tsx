'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { playSfx } from '@/lib/laHistory/sfx';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import { useLaHistorySettings } from '@/stores/useLaHistorySettings';

// Settings modal — 1:1 port of the original `.settings-modal` accordion
// (templates/base.html + static/js/settings.js). Drives the scoped settings
// store; the audio/TTS/voice engines (Step 7) read those values.

type Props = {
  onClose: () => void;
  onReplayTutorial: () => void;
};

function langLabel(code: string): string {
  try {
    const [lang, region] = code.split('-');
    const langName =
      new Intl.DisplayNames(['en'], { type: 'language' }).of(lang!) || lang;
    if (region) {
      const regionName =
        new Intl.DisplayNames(['en'], { type: 'region' }).of(region) || region;
      return `${langName} — ${regionName}`;
    }
    return langName ?? code;
  } catch {
    return code;
  }
}

export function SettingsPanel({ onClose, onReplayTutorial }: Props) {
  const s = useLaHistorySettings();
  const update = useLaHistorySettings((st) => st.update);
  const reset = useLaHistoryStore((st) => st.reset);

  const [open, setOpen] = useState<Record<string, boolean>>({
    appearance: true,
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Open chime on mount (the panel only mounts while open).
  useEffect(() => {
    playSfx('settings-open');
  }, []);

  const closeSettings = useCallback(() => {
    playSfx('panel-close');
    onClose();
  }, [onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSettings();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeSettings]);

  useEffect(() => {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    if (!synth) return;
    const load = () => setVoices(synth.getVoices());
    const t = setTimeout(load, 0);
    synth.addEventListener?.('voiceschanged', load);
    return () => {
      clearTimeout(t);
      synth.removeEventListener?.('voiceschanged', load);
    };
  }, []);

  const langs = [...new Set(voices.map((v) => v.lang))].sort((a, b) =>
    langLabel(a).localeCompare(langLabel(b)),
  );
  const voiceOptions = s.ttsLang
    ? voices.filter((v) => v.lang === s.ttsLang)
    : voices;

  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  function handleReset() {
    const ok = window.confirm(
      'Reset ALL progress?\n\nThis permanently deletes visited locations, ' +
        'quiz scores, badges, and points. This cannot be undone.',
    );
    if (ok) reset();
  }

  return (
    <div
      className="settings-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSettings();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="settings-modal">
        <div className="settings-modal-header">
          <span>Settings</span>
          <button
            type="button"
            className="settings-close"
            aria-label="Close settings"
            onClick={closeSettings}
          >
            ×
          </button>
        </div>
        <div className="settings-accordion">
          <Section id="appearance" title="🎨 Appearance" open={!!open.appearance} onToggle={toggle}>
            <div className="settings-row">
              <label htmlFor="theme-select">Theme</label>
              <select
                id="theme-select"
                value={s.theme}
                onChange={(e) => update({ theme: e.target.value as typeof s.theme })}
              >
                <option value="light">Light</option>
                <option value="semi-dark">Semi-Dark</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="settings-row">
              <label htmlFor="map-tile-select">Map Style</label>
              <select
                id="map-tile-select"
                value={s.mapTile}
                onChange={(e) => update({ mapTile: e.target.value as typeof s.mapTile })}
              >
                <option value="voyager">Voyager (default)</option>
                <option value="positron">Light (Positron)</option>
                <option value="dark_matter">Dark Matter</option>
              </select>
            </div>
            <div className="settings-row">
              <label htmlFor="anim-speed-select">Animations</label>
              <select
                id="anim-speed-select"
                value={s.animations}
                onChange={(e) =>
                  update({ animations: e.target.value as typeof s.animations })
                }
              >
                <option value="normal">Normal</option>
                <option value="reduced">Reduced</option>
                <option value="off">Off</option>
              </select>
            </div>
          </Section>

          <Section id="music" title="🎵 Music" open={!!open.music} onToggle={toggle}>
            <div className="settings-row settings-row-inline">
              <label htmlFor="music-toggle">Era Ambient Music</label>
              <Toggle id="music-toggle" checked={s.music} onChange={(v) => update({ music: v })} />
            </div>
            <div className="settings-row">
              <label htmlFor="music-volume-slider">
                Volume <span>{Math.round(s.musicVolume * 100)}%</span>
              </label>
              <input
                id="music-volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={s.musicVolume}
                onChange={(e) => update({ musicVolume: Number(e.target.value) })}
              />
            </div>
          </Section>

          <Section id="tts" title="🔊 Text-to-Speech" open={!!open.tts} onToggle={toggle}>
            <div className="settings-row">
              <label htmlFor="tts-lang-select">Language</label>
              <select
                id="tts-lang-select"
                value={s.ttsLang}
                onChange={(e) => update({ ttsLang: e.target.value, ttsVoice: '' })}
              >
                <option value="">All languages</option>
                {langs.map((l) => (
                  <option key={l} value={l}>
                    {langLabel(l)}
                  </option>
                ))}
              </select>
            </div>
            <div className="settings-row">
              <label htmlFor="tts-voice-select">Voice</label>
              <select
                id="tts-voice-select"
                value={s.ttsVoice}
                onChange={(e) => update({ ttsVoice: e.target.value })}
              >
                <option value="">Auto (default)</option>
                {voiceOptions.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
            <div className="settings-row">
              <label htmlFor="tts-speed-slider">
                Speed <span>{s.ttsRate.toFixed(2)}×</span>
              </label>
              <input
                id="tts-speed-slider"
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={s.ttsRate}
                onChange={(e) => update({ ttsRate: Number(e.target.value) })}
              />
            </div>
            <div className="settings-row">
              <label htmlFor="tts-pitch-slider">
                Pitch <span>{s.ttsPitch.toFixed(2)}</span>
              </label>
              <input
                id="tts-pitch-slider"
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={s.ttsPitch}
                onChange={(e) => update({ ttsPitch: Number(e.target.value) })}
              />
            </div>
            <div className="settings-row settings-row-inline">
              <label htmlFor="tts-highlight-toggle">Word Highlight</label>
              <Toggle
                id="tts-highlight-toggle"
                checked={s.ttsHighlight}
                onChange={(v) => update({ ttsHighlight: v })}
              />
            </div>
          </Section>

          <Section id="sfx" title="🔔 Sound Effects" open={!!open.sfx} onToggle={toggle}>
            <div className="settings-row settings-row-inline">
              <label htmlFor="sfx-toggle">Enable Sounds</label>
              <Toggle id="sfx-toggle" checked={s.sfx} onChange={(v) => update({ sfx: v })} />
            </div>
            <div className="settings-row">
              <label htmlFor="sfx-volume-slider">
                Volume <span>{Math.round(s.sfxVolume * 100)}%</span>
              </label>
              <input
                id="sfx-volume-slider"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={s.sfxVolume}
                onChange={(e) => update({ sfxVolume: Number(e.target.value) })}
              />
            </div>
          </Section>

          <Section id="voice" title="🎙️ Voice Input" open={!!open.voice} onToggle={toggle}>
            <div className="settings-row settings-row-inline">
              <label htmlFor="voice-enabled-toggle">Enable Voice Input</label>
              <Toggle
                id="voice-enabled-toggle"
                checked={s.voiceEnabled}
                onChange={(v) => update({ voiceEnabled: v })}
              />
            </div>
          </Section>

          <Section id="fontsize" title="🔤 Font Size" open={!!open.fontsize} onToggle={toggle}>
            <div className="settings-row">
              <label htmlFor="fontsize-slider">
                Size <span>{s.fontSize}px</span>
              </label>
              <input
                id="fontsize-slider"
                type="range"
                min={12}
                max={20}
                step={1}
                value={s.fontSize}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
              />
            </div>
          </Section>

          <Section id="markersize" title="📍 Marker Size" open={!!open.markersize} onToggle={toggle}>
            <div className="settings-row">
              <label htmlFor="markersize-select">Icon Size</label>
              <select
                id="markersize-select"
                value={s.markerSize}
                onChange={(e) => update({ markerSize: Number(e.target.value) })}
              >
                <option value={24}>Small</option>
                <option value={32}>Medium</option>
                <option value={44}>Large</option>
              </select>
            </div>
          </Section>

          <Section id="tutorial" title="🎓 Tutorial" open={!!open.tutorial} onToggle={toggle}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              Replay the interactive walkthrough to learn the map, quizzes,
              badges, and AI tutor.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%' }}
              onClick={() => {
                closeSettings();
                onReplayTutorial();
              }}
            >
              Replay Tutorial
            </button>
          </Section>

          <Section id="reset" title="🗑️ Reset Progress" open={!!open.reset} onToggle={toggle}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              This permanently erases all visited locations, quiz scores,
              badges, and points. This cannot be undone.
            </p>
            <button
              type="button"
              className="btn btn-danger"
              style={{ width: '100%' }}
              onClick={handleReset}
            >
              Reset All Progress
            </button>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="accordion-section">
      <button
        type="button"
        className={cn('accordion-header', open && 'open')}
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="accordion-chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open ? <div className="accordion-body">{children}</div> : null}
    </div>
  );
}

function Toggle({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="settings-toggle-label">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="settings-toggle-track" />
    </label>
  );
}
