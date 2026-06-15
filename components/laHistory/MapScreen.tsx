'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { playSfx } from '@/lib/laHistory/sfx';
import { Sidebar } from './Sidebar';
import { MapView } from './MapView';
import { LocationDetail } from './LocationDetail';

// The map page shell — a 1:1 port of the original `.map-layout`
// (templates/map/index.html): left sidebar + collapse toggle, the Leaflet
// map region (#map, with the era-filter bar + search living inside MapInner),
// and the sliding right detail panel.

type Props = {
  selectedLocationId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
  onOpenQuiz: (id: number) => void;
  onOpenConceptMap: (eraOrder: number) => void;
};

export function MapScreen({
  selectedLocationId,
  onSelect,
  onClose,
  onOpenQuiz,
  onOpenConceptMap,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  // The tutorial's "Your Progress" / "Earn Badges" steps need the sidebar open
  // to measure it (mirrors the original `_ensureSidebarOpen` hook).
  useEffect(() => {
    function openSidebar() {
      setCollapsed(false);
    }
    window.addEventListener('lah:tutorial-open-sidebar', openSidebar);
    return () =>
      window.removeEventListener('lah:tutorial-open-sidebar', openSidebar);
  }, []);

  return (
    <div className="map-layout">
      <Sidebar collapsed={collapsed} onOpenConceptMap={onOpenConceptMap} />

      <button
        type="button"
        id="sidebar-toggle"
        className={cn('sidebar-toggle', collapsed && 'collapsed')}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
        onClick={() => {
          playSfx('sidebar-toggle');
          setCollapsed((c) => !c);
        }}
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
  );
}
