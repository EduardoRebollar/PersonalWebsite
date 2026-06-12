'use client';

// Leaflet integration for the 1:1 replica. Loaded lazily by MapView via a
// useEffect import (see CLAUDE.md: never next/dynamic({ ssr: false }) under
// Next 16). Restyled to the original parchment map: Carto Voyager tiles,
// teardrop `.map-marker` icons with fog-of-war states, rich thumbnail
// tooltips, an era-filter pill bar, and a location search box.

import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { cn } from '@/lib/cn';
import { locations } from '@/content/data/laHistory/locations';
import { ERA_META } from '@/lib/laHistory/display';
import {
  isLocationUnlocked,
  locationsInEra,
} from '@/lib/laHistory/gamification';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import { ERA_KEYS, type EraKey, type Location } from '@/types/laHistory';

const LA_CENTER: [number, number] = [34.05, -118.25];
const LA_ZOOM = 11;
const LA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [33.65, -118.8],
  [34.45, -117.55],
];

const MARKER_VISUAL = 34; // matches --marker-size
const MARKER_PADDED = MARKER_VISUAL + 12; // shadow/hover headroom
const MARKER_OFFSET: [number, number] = [0, -(MARKER_VISUAL + 8)];

type Props = {
  selectedLocationId: number | null;
  onSelect: (locationId: number) => void;
};

function buildIcon(args: {
  color: string;
  emoji: string;
  visited: boolean;
  unlocked: boolean;
}): L.DivIcon {
  const { color, emoji, visited, unlocked } = args;
  const classes = [
    'map-marker',
    visited && 'visited',
    !unlocked && 'locked',
    unlocked && 'unlocked',
  ]
    .filter(Boolean)
    .join(' ');
  const borderColor = unlocked ? 'rgba(255,255,255,0.9)' : '#ccc';
  return L.divIcon({
    className: '',
    html: `<div class="${classes}" style="background:${color};border-color:${borderColor}"><div class="map-marker-inner">${emoji}</div></div>`,
    iconSize: [MARKER_PADDED, MARKER_PADDED],
    iconAnchor: [MARKER_PADDED / 2, MARKER_PADDED - 6],
    popupAnchor: MARKER_OFFSET,
  });
}

/** Recompute Leaflet's size when its container resizes (sidebar collapse). */
function ResizeInvalidator() {
  const map = useMap();
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => ro.disconnect();
  }, [map]);
  return null;
}

function FlyToSelected({ selectedId }: { selectedId: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId == null) return;
    const loc = locations.find((l) => l.id === selectedId);
    if (!loc) return;
    map.flyTo([loc.latitude, loc.longitude], Math.max(map.getZoom(), 13), {
      duration: 0.9,
    });
  }, [selectedId, map]);
  return null;
}

export function MapInner({ selectedLocationId, onSelect }: Props) {
  const visited = useLaHistoryStore((s) => s.visited);
  const quizPasses = useLaHistoryStore((s) => s.quizPasses);
  const conceptMaps = useLaHistoryStore((s) => s.conceptMaps);

  const [activeEras, setActiveEras] = useState<Set<EraKey>>(
    () => new Set<EraKey>(ERA_KEYS),
  );
  const [query, setQuery] = useState('');

  const markers = useMemo(() => {
    return (locations as readonly Location[]).map((loc) => {
      const meta = ERA_META[loc.era];
      const unlocked = isLocationUnlocked(loc, { quizPasses, conceptMaps });
      const wasVisited = !!visited[loc.slug];
      return {
        loc,
        meta,
        unlocked,
        visited: wasVisited,
        color: unlocked ? meta.color : '#9e9e9e',
        emoji: unlocked ? meta.emoji : '🔒',
      };
    });
  }, [visited, quizPasses, conceptMaps]);

  const visibleMarkers = useMemo(
    () =>
      markers.filter(
        (m) =>
          !m.unlocked || activeEras.size === 0 || activeEras.has(m.loc.era),
      ),
    [markers, activeEras],
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return markers
      .filter((m) => m.unlocked && m.loc.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [markers, query]);

  function toggleEra(era: EraKey) {
    setActiveEras((prev) => {
      const next = new Set(prev);
      if (next.has(era)) next.delete(era);
      else next.add(era);
      return next;
    });
  }

  return (
    <>
      <MapContainer
        center={LA_CENTER}
        zoom={LA_ZOOM}
        minZoom={11}
        maxBounds={LA_MAX_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
        zoomControl
        style={{ height: '100%', width: '100%', background: 'var(--bg)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <ResizeInvalidator />
        <FlyToSelected selectedId={selectedLocationId} />
        {visibleMarkers.map(({ loc, unlocked, visited: v, color, emoji }) => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={buildIcon({ color, emoji, visited: v, unlocked })}
            eventHandlers={{
              click: () => {
                if (unlocked) onSelect(loc.id);
              },
            }}
            keyboard
            alt={`${loc.name}${unlocked ? '' : ' (locked)'}`}
          >
            <Tooltip
              direction="top"
              offset={MARKER_OFFSET}
              opacity={0.97}
              className={loc.imageUrl ? 'marker-tooltip-with-thumb' : ''}
            >
              {loc.imageUrl ? (
                <div className="marker-tooltip-rich">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={loc.imageUrl}
                    className="marker-tooltip-thumb"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="marker-tooltip-name">{loc.name}</span>
                </div>
              ) : (
                loc.name
              )}
            </Tooltip>
            {!unlocked ? (
              <Popup maxWidth={240}>
                <div className="map-popup-name">🔒 {loc.name}</div>
                <div className="map-popup-locked">
                  {lockedHint(loc, { quizPasses, conceptMaps })}
                </div>
              </Popup>
            ) : null}
          </Marker>
        ))}
      </MapContainer>

      <div id="era-filter-bar">
        {ERA_KEYS.map((key) => {
          const meta = ERA_META[key];
          const active = activeEras.has(key);
          return (
            <button
              key={key}
              type="button"
              className={cn('era-filter-btn', active && 'active')}
              style={
                active ? { background: meta.color, borderColor: meta.color } : undefined
              }
              onClick={() => toggleEra(key)}
              aria-pressed={active}
            >
              {meta.emoji} {meta.filterLabel}
            </button>
          );
        })}
      </div>

      <div id="map-search-wrap">
        <input
          id="map-search-input"
          type="search"
          placeholder="Search locations…"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setQuery('');
          }}
          aria-label="Search locations"
        />
        {searchResults.length > 0 ? (
          <div id="map-search-results">
            {searchResults.map((m) => (
              <button
                key={m.loc.id}
                type="button"
                className="map-search-result"
                onClick={() => {
                  onSelect(m.loc.id);
                  setQuery('');
                }}
              >
                <span className="map-search-result-name">{m.loc.name}</span>
                <span className="map-search-result-era">
                  {m.meta.emoji} {m.meta.label}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

function lockedHint(
  loc: Location,
  state: {
    quizPasses: Record<string, { passed: boolean } | undefined>;
    conceptMaps: Record<number, { submitted: boolean } | undefined>;
  },
): string {
  const prevOrder = loc.eraOrder - 1;
  const prevLocs = locationsInEra(prevOrder);
  if (prevLocs.length === 0) {
    return 'Complete earlier quizzes and submit the concept map to unlock this era.';
  }
  const label = ERA_META[prevLocs[0]!.era].label;
  const passed = prevLocs.filter((l) => state.quizPasses[l.slug]?.passed).length;
  const total = prevLocs.length;
  const quizDone = passed >= total;
  const cmDone = !!state.conceptMaps[prevOrder]?.submitted;
  if (quizDone && !cmDone) {
    return `Submit the ${label} era concept map to unlock this era.`;
  }
  if (cmDone && !quizDone) {
    const needed = total - passed;
    return `Pass ${needed} more quiz${needed === 1 ? '' : 'zes'} in the ${label} era to unlock this.`;
  }
  return `Pass all ${label} era quizzes (${passed}/${total} done) and submit the ${label} concept map.`;
}
