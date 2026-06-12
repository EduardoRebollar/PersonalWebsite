'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Sidebar } from './Sidebar';
import { MapView } from './MapView';
import { LocationDetail } from './LocationDetail';
import { TutorChat } from './TutorChat';

// The map page shell — a 1:1 port of the original `.map-layout`
// (templates/map/index.html): left sidebar + collapse toggle, the Leaflet
// map region (#map, with the era-filter bar + search living inside MapInner),
// and the sliding right detail panel.

type Props = {
  selectedLocationId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
  onOpenQuiz: (id: number) => void;
};

export function MapScreen({
  selectedLocationId,
  onSelect,
  onClose,
  onOpenQuiz,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <div className="map-layout">
        <Sidebar collapsed={collapsed} />

        <button
          type="button"
          className={cn('sidebar-toggle', collapsed && 'collapsed')}
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? '›' : '‹'}
        </button>

        <div id="map">
          <MapView selectedLocationId={selectedLocationId} onSelect={onSelect} />
        </div>

        <LocationDetail
          locationId={selectedLocationId}
          onClose={onClose}
          onOpenQuiz={onOpenQuiz}
        />
      </div>

      {/* Docked tutor — sibling of .map-layout so the detail-panel
          `:has(...) ~ .chat-panel` shift applies. Contextual to the
          currently-open location. */}
      <TutorChat locationId={selectedLocationId} />
    </>
  );
}
