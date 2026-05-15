'use client';

import { useState, useMemo } from "react";
import energyDataRaw from "@/content/data/energy-per-capita.json";
import { useSceneStore } from "@/stores/useSceneStore";
import { BarSnapshot } from "./BarSnapshot";
import { LineTrend } from "./LineTrend";
import { ModeToggle, type DashboardMode } from "./ModeToggle";
import {
  chartNeutrals,
  countryColors,
  EnergyData,
  fontStack,
} from "./shared";

const energyData = energyDataRaw as EnergyData;
const DEFAULT_SNAPSHOT_YEAR = 2020;

/**
 * The two-chart dashboard from the Interactivity & Interpretability case study,
 * with a static <-> interactive toggle. Visitors can replay the between-subjects
 * manipulation themselves: static mode shows the composition the static group
 * saw (no controls); interactive mode unlocks the year stepper, click-to-isolate
 * legend, and per-country filter pills.
 */
export function InteractivityViz() {
  const [mode, setMode] = useState<DashboardMode>('static');
  const [year, setYear] = useState(DEFAULT_SNAPSHOT_YEAR);
  const [isolated, setIsolated] = useState<string | null>(null);
  const [visibleCountries, setVisibleCountries] = useState<Set<string>>(
    () => new Set(energyData.countries),
  );

  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const interactive = mode === 'interactive';

  const effectiveVisible = useMemo(
    () => (interactive ? visibleCountries : new Set(energyData.countries)),
    [interactive, visibleCountries],
  );
  const effectiveYear = interactive ? year : DEFAULT_SNAPSHOT_YEAR;
  const effectiveIsolated = interactive ? isolated : null;

  const handleModeChange = (next: DashboardMode) => {
    setMode(next);
    if (next === 'static') {
      setIsolated(null);
    }
  };

  const toggleCountry = (country: string) => {
    setVisibleCountries((prev) => {
      const next = new Set(prev);
      if (next.has(country)) {
        if (next.size <= 1) return prev;
        next.delete(country);
      } else {
        next.add(country);
      }
      return next;
    });
    if (isolated && !visibleCountries.has(isolated)) {
      setIsolated(null);
    }
  };

  const resetCountries = () => {
    setVisibleCountries(new Set(energyData.countries));
    setIsolated(null);
  };

  return (
    <figure
      style={{
        margin: '2.5rem 0',
        padding: '20px 20px 16px',
        background: chartNeutrals.canvas,
        border: `1px solid ${chartNeutrals.rule}`,
        borderRadius: 12,
        color: chartNeutrals.text,
        fontFamily: fontStack,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>
            Energy consumption dashboard
          </div>
          <div style={{ fontSize: 11, color: chartNeutrals.subtext, marginTop: 2 }}>
            Toggle the variant to replay the study&apos;s between-subjects condition.
          </div>
        </div>
        <ModeToggle mode={mode} onChange={handleModeChange} />
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <BarSnapshot
          data={energyData}
          year={effectiveYear}
          visibleCountries={effectiveVisible}
          isolated={effectiveIsolated}
          reducedMotion={reducedMotion}
          interactive={interactive}
          onYearChange={interactive ? setYear : undefined}
        />

        {interactive ? (
          <CountryFilterPills
            countries={energyData.countries}
            visible={visibleCountries}
            onToggle={toggleCountry}
            onReset={resetCountries}
          />
        ) : null}

        <LineTrend
          data={energyData}
          visibleCountries={effectiveVisible}
          isolated={effectiveIsolated}
          reducedMotion={reducedMotion}
          interactive={interactive}
          onIsolate={interactive ? setIsolated : undefined}
        />
      </div>

      <figcaption
        style={{
          marginTop: 12,
          fontSize: 11,
          color: chartNeutrals.subtext,
          lineHeight: 1.5,
        }}
      >
        Hand-curated illustrative dataset based on Our World in Data&apos;s
        per-capita primary energy consumption. The original study used live OWID
        data; the numbers here approximate macro patterns and are for the
        interactivity comparison, not energy policy analysis.
      </figcaption>
    </figure>
  );
}

function CountryFilterPills({
  countries,
  visible,
  onToggle,
  onReset,
}: {
  countries: string[];
  visible: Set<string>;
  onToggle: (country: string) => void;
  onReset: () => void;
}) {
  return (
    <div
      role="group"
      aria-label="Country filter"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '6px 8px',
        padding: '8px 10px',
        background: '#FFFFFF',
        border: `1px solid ${chartNeutrals.rule}`,
        borderRadius: 8,
        fontFamily: fontStack,
        fontSize: 11,
      }}
    >
      <span style={{ color: chartNeutrals.subtext, fontWeight: 600 }}>
        Show:
      </span>
      {countries.map((country) => {
        const active = visible.has(country);
        const color = countryColors[country] ?? chartNeutrals.subtext;
        return (
          <button
            key={country}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(country)}
            style={{
              appearance: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              padding: '3px 9px',
              borderRadius: 999,
              border: `1px solid ${active ? color : chartNeutrals.rule}`,
              background: active ? `${color}14` : 'transparent',
              color: active ? chartNeutrals.text : chartNeutrals.subtext,
              transition: 'background 160ms ease, border-color 160ms ease, color 160ms ease',
            }}
          >
            {country}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onReset}
        style={{
          appearance: 'none',
          border: 0,
          background: 'transparent',
          padding: '3px 9px',
          color: chartNeutrals.subtext,
          textDecoration: 'underline',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 'inherit',
        }}
      >
        reset
      </button>
    </div>
  );
}
