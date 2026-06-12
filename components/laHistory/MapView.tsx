'use client';

// Lazy-load wrapper around MapInner. The useEffect-based dynamic import
// keeps Leaflet (~140KB gz) out of the initial chunk and out of the SSR
// pass. See CLAUDE.md for why we avoid next/dynamic({ ssr: false }).

import { useEffect, useState, type ComponentType } from 'react';

type InnerProps = {
  selectedLocationId: number | null;
  onSelect: (locationId: number) => void;
};

export function MapView(props: InnerProps) {
  const [Inner, setInner] = useState<ComponentType<InnerProps> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('./MapInner').then((mod) => {
      if (cancelled) return;
      setInner(() => mod.MapInner);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Inner) {
    // Parchment loader, mirrors the original #map-loading overlay.
    return (
      <div id="map-loading">
        <div className="map-loader-ring" />
        <span className="map-loader-text">Loading map…</span>
      </div>
    );
  }
  return <Inner {...props} />;
}
