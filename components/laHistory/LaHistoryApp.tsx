'use client';

import { useState } from 'react';
import { HydrationGate } from './HydrationGate';
import { Toolbar } from './Toolbar';
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
      <div className="flex min-h-dvh flex-col bg-base text-fg">
        <Toolbar
          view={view}
          onViewChange={setView}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <div className="relative flex-1">
          {view === 'map' && (
            <div className="absolute inset-0">
              <MapView
                selectedLocationId={selectedLocationId}
                onSelect={(id) => setSelectedLocationId(id)}
              />
            </div>
          )}
          {view === 'concept-map' && <ConceptMapView />}
          {view === 'dashboard' && <Dashboard />}
        </div>

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
