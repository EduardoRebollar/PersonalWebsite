'use client';

// Actual Leaflet integration. Loaded lazily by MapView via a useEffect-
// based import (see CLAUDE.md: never use next/dynamic({ ssr: false }) under
// Next 16 — it triggers a subtree bailout). All Leaflet imports live in
// this file so the bundle for the case-study landing page never pulls
// them in.

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { locations } from '@/content/data/laHistory/locations';
import { eraByOrder } from '@/content/data/laHistory/eras';
import {
  isLocationUnlocked,
} from '@/lib/laHistory/gamification';
import { useLaHistoryStore } from '@/stores/useLaHistoryStore';
import type { Location } from '@/types/laHistory';

const LA_CENTER: [number, number] = [34.05, -118.25];
const LA_ZOOM = 10;

type Props = {
  selectedLocationId: number | null;
  onSelect: (locationId: number) => void;
};

function buildIcon(args: {
  color: string;
  visited: boolean;
  unlocked: boolean;
  selected: boolean;
}): L.DivIcon {
  const { color, visited, unlocked, selected } = args;
  const ring = selected ? '#e8edf2' : color;
  const fill = unlocked ? color : '#243040';
  const opacity = unlocked ? 1 : 0.55;
  const size = selected ? 28 : 22;
  const inner = visited
    ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 6}" fill="#0a1018" />`
    : '';
  const lockOverlay = unlocked
    ? ''
    : `<text x="${size / 2}" y="${size / 2 + 4}" text-anchor="middle" font-size="${size * 0.55}" fill="#0a1018">🔒</text>`;
  return L.divIcon({
    className: 'la-history-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="opacity:${opacity}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${fill}" stroke="${ring}" stroke-width="2" />
      ${inner}
      ${lockOverlay}
    </svg>`,
  });
}

function FlyToSelected({
  selectedId,
}: {
  selectedId: number | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (selectedId == null) return;
    const loc = locations.find((l) => l.id === selectedId);
    if (!loc) return;
    map.flyTo([loc.latitude, loc.longitude], Math.max(map.getZoom(), 12), {
      duration: 0.6,
    });
  }, [selectedId, map]);
  return null;
}

export function MapInner({ selectedLocationId, onSelect }: Props) {
  const visited = useLaHistoryStore((s) => s.visited);
  const quizPasses = useLaHistoryStore((s) => s.quizPasses);
  const conceptMaps = useLaHistoryStore((s) => s.conceptMaps);

  const markers = useMemo(() => {
    return (locations as readonly Location[]).map((loc) => {
      const era = eraByOrder.get(loc.eraOrder);
      const unlocked = isLocationUnlocked(loc, { quizPasses, conceptMaps });
      return {
        loc,
        unlocked,
        visited: !!visited[loc.slug],
        color: era?.accentColor ?? '#4fc3d9',
      };
    });
  }, [visited, quizPasses, conceptMaps]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={LA_CENTER}
        zoom={LA_ZOOM}
        scrollWheelZoom
        zoomControl
        style={{ height: '100%', width: '100%', background: '#0a1018' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &middot; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <FlyToSelected selectedId={selectedLocationId} />
        {markers.map(({ loc, unlocked, visited: v, color }) => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={buildIcon({
              color,
              visited: v,
              unlocked,
              selected: selectedLocationId === loc.id,
            })}
            eventHandlers={{
              click: () => {
                if (unlocked) onSelect(loc.id);
              },
            }}
            keyboard
            alt={`${loc.name}${unlocked ? '' : ' (locked)'}`}
          />
        ))}
      </MapContainer>
    </div>
  );
}
