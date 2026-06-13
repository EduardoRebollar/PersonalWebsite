'use client';

import { type CSSProperties, useEffect, useState } from 'react';
import { HydrationGate } from './HydrationGate';
import { Navbar } from './Navbar';
import { MapScreen } from './MapScreen';
import { QuizView } from './QuizView';
import { ConceptMapView } from './ConceptMapView';
import { Dashboard } from './Dashboard';
import { SettingsPanel } from './SettingsPanel';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { Tutorial } from './Tutorial';
import { MusicEngine } from './MusicEngine';
import { useLaHistorySettings } from '@/stores/useLaHistorySettings';

export type ViewKey = 'map' | 'dashboard';

export function LaHistoryApp() {
  const [view, setView] = useState<ViewKey>('map');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [tutorialForce, setTutorialForce] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );
  const [quizLocationId, setQuizLocationId] = useState<number | null>(null);
  // The concept map opens as a full-screen overlay for a given era (launched
  // from the sidebar / dashboard), matching the original.
  const [conceptMapEra, setConceptMapEra] = useState<number | null>(null);

  // UI preferences applied to the scoped `.lah-root` element.
  const theme = useLaHistorySettings((s) => s.theme);
  const animations = useLaHistorySettings((s) => s.animations);
  const fontSize = useLaHistorySettings((s) => s.fontSize);
  const markerSize = useLaHistorySettings((s) => s.markerSize);
  const themeAttr = theme === 'light' ? 'light' : 'dark';
  const mapDark = theme === 'dark';

  // Global `?` toggles the keyboard-shortcuts overlay.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '?') return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.tagName === 'SELECT' ||
          t.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      setShortcutsOpen((o) => !o);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <HydrationGate>
      <div
        className="lah-root"
        data-theme={themeAttr}
        data-anim={animations}
        {...(mapDark ? { 'data-map-dark': '' } : {})}
        style={
          {
            '--font-size-base': `${fontSize}px`,
            '--marker-size': `${markerSize + 2}px`,
          } as CSSProperties
        }
      >
        <Navbar
          view={view}
          onViewChange={setView}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />

        {view === 'map' ? (
          <MapScreen
            selectedLocationId={selectedLocationId}
            onSelect={(id) => setSelectedLocationId(id)}
            onClose={() => setSelectedLocationId(null)}
            onOpenQuiz={(id) => setQuizLocationId(id)}
            onOpenConceptMap={(eraOrder) => setConceptMapEra(eraOrder)}
          />
        ) : (
          <div style={{ paddingTop: 'var(--nav-height)' }}>
            <Dashboard
              onOpenConceptMap={(eraOrder) => setConceptMapEra(eraOrder)}
              onGoToMap={() => setView('map')}
              onOpenLocation={(id) => {
                setSelectedLocationId(id);
                setView('map');
              }}
            />
          </div>
        )}

        {conceptMapEra != null ? (
          <ConceptMapView
            key={conceptMapEra}
            eraOrder={conceptMapEra}
            onClose={() => setConceptMapEra(null)}
          />
        ) : null}

        {quizLocationId != null ? (
          <QuizView
            key={quizLocationId}
            locationId={quizLocationId}
            onClose={() => setQuizLocationId(null)}
          />
        ) : null}

        {settingsOpen ? (
          <SettingsPanel
            onClose={() => setSettingsOpen(false)}
            onReplayTutorial={() => setTutorialForce(true)}
          />
        ) : null}

        <KeyboardShortcuts
          open={shortcutsOpen}
          onClose={() => setShortcutsOpen(false)}
        />

        <Tutorial
          forceOpen={tutorialForce}
          onForceClose={() => setTutorialForce(false)}
        />
        <MusicEngine />
      </div>
    </HydrationGate>
  );
}
