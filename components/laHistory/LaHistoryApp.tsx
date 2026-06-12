'use client';

import { useState } from 'react';
import { HydrationGate } from './HydrationGate';
import { Navbar } from './Navbar';
import { MapView } from './MapView';
import { LocationDetail } from './LocationDetail';
import { TutorChat } from './TutorChat';
import { QuizView } from './QuizView';
import { ConceptMapView } from './ConceptMapView';
import { Dashboard } from './Dashboard';
import { SettingsPanel } from './SettingsPanel';
import { Tutorial } from './Tutorial';
import { MusicEngine } from './MusicEngine';

export type ViewKey = 'map' | 'concept-map' | 'dashboard';

export function LaHistoryApp() {
  const [view, setView] = useState<ViewKey>('map');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );
  const [tutorLocationId, setTutorLocationId] = useState<number | null>(null);
  const [quizLocationId, setQuizLocationId] = useState<number | null>(null);

  return (
    <HydrationGate>
      {/* `data-theme` is hardcoded to light parchment for now; the settings
          theme switcher (Step 6) will drive it (light / dark / dark + map
          tile inversion via the data-map-dark attribute). */}
      <div className="lah-root" data-theme="light">
        <Navbar
          view={view}
          onViewChange={setView}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenShortcuts={() => {
            /* Keyboard-shortcuts overlay is built in Step 6. */
          }}
        />

        {view === 'map' ? (
          // Mirrors the original `.map-layout` (fixed below the navbar).
          // Replaced by the real sidebar + map + detail panel in Step 2.
          <div
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              top: 'var(--nav-height)',
              bottom: 0,
            }}
          >
            <MapView
              selectedLocationId={selectedLocationId}
              onSelect={(id) => setSelectedLocationId(id)}
            />
          </div>
        ) : (
          <div style={{ paddingTop: 'var(--nav-height)' }}>
            {view === 'concept-map' && <ConceptMapView />}
            {view === 'dashboard' && <Dashboard />}
          </div>
        )}

        <LocationDetail
          locationId={view === 'map' ? selectedLocationId : null}
          onClose={() => setSelectedLocationId(null)}
          onOpenQuiz={(id) => setQuizLocationId(id)}
          onOpenTutor={(id) => setTutorLocationId(id)}
        />

        <TutorChat
          locationId={tutorLocationId}
          onClose={() => setTutorLocationId(null)}
        />

        {quizLocationId != null ? (
          <QuizView
            key={quizLocationId}
            locationId={quizLocationId}
            onClose={() => setQuizLocationId(null)}
          />
        ) : null}

        {settingsOpen ? (
          <SettingsPanel onClose={() => setSettingsOpen(false)} />
        ) : null}

        <Tutorial />
        <MusicEngine />
      </div>
    </HydrationGate>
  );
}
