'use client';

import { ResponsiveBar } from "@nivo/bar";
import { useMemo } from "react";
import {
  chartNeutrals,
  countryColors,
  EnergyData,
  fontStack,
  nivoTheme,
} from "./shared";

type Props = {
  data: EnergyData;
  year: number;
  visibleCountries: Set<string>;
  isolated: string | null;
  reducedMotion: boolean;
  interactive: boolean;
  onYearChange?: (year: number) => void;
};

export function BarSnapshot({
  data,
  year,
  visibleCountries,
  isolated,
  reducedMotion,
  interactive,
  onYearChange,
}: Props) {
  const rows = useMemo(() => {
    return data.series
      .filter((s) => visibleCountries.has(s.country))
      .map((s) => {
        const point = s.values.find((v) => v.year === year);
        return {
          country: s.country,
          kwh: point?.kwh ?? 0,
        };
      })
      .sort((a, b) => b.kwh - a.kwh);
  }, [data, year, visibleCountries]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 6,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: chartNeutrals.text,
              fontFamily: fontStack,
            }}
          >
            Per-capita energy consumption — snapshot
          </div>
          <div
            style={{
              fontSize: 11,
              color: chartNeutrals.subtext,
              fontFamily: fontStack,
            }}
          >
            {year} · {data.unit}
          </div>
        </div>
        {interactive && onYearChange ? (
          <YearStepper
            min={data.yearRange[0]}
            max={data.yearRange[1]}
            value={year}
            onChange={onYearChange}
          />
        ) : null}
      </div>

      <div style={{ height: 280 }}>
        <ResponsiveBar
          data={rows}
          keys={["kwh"]}
          indexBy="country"
          margin={{ top: 10, right: 16, bottom: 70, left: 56 }}
          padding={0.25}
          colors={({ data: row }) => {
            const base = countryColors[row.country as string] ?? chartNeutrals.subtext;
            if (isolated && row.country !== isolated) return `${base}55`;
            return base;
          }}
          borderWidth={0}
          enableLabel={false}
          axisLeft={{
            tickSize: 0,
            tickPadding: 6,
            tickValues: 5,
            legend: data.unit,
            legendPosition: 'middle',
            legendOffset: -48,
            format: (v) => formatTick(Number(v)),
          }}
          axisBottom={{
            tickSize: 0,
            tickPadding: 6,
            tickRotation: -35,
          }}
          axisRight={null}
          axisTop={null}
          theme={nivoTheme}
          animate={!reducedMotion}
          motionConfig={reducedMotion ? undefined : 'gentle'}
          tooltip={({ value, indexValue, color }) => (
            <div
              style={{
                background: '#FFFFFF',
                border: `1px solid ${chartNeutrals.rule}`,
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: 12,
                color: chartNeutrals.text,
                fontFamily: fontStack,
                boxShadow: '0 4px 14px rgba(15,27,45,0.10)',
              }}
            >
              <div style={{ fontWeight: 700 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 9,
                    height: 9,
                    background: color,
                    borderRadius: 2,
                    marginRight: 6,
                  }}
                />
                {indexValue}
              </div>
              <div style={{ marginTop: 2 }}>
                <strong>{Number(value).toLocaleString()}</strong> {data.unit}
              </div>
            </div>
          )}
          role="img"
          ariaLabel={`Bar chart: per-capita energy consumption in ${year}, by country`}
        />
      </div>
    </div>
  );
}

function YearStepper({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 11,
        color: chartNeutrals.subtext,
        fontFamily: fontStack,
        fontWeight: 600,
      }}
    >
      Year
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: 140, accentColor: chartNeutrals.text }}
        aria-label="Snapshot year"
      />
      <span
        style={{
          fontVariantNumeric: 'tabular-nums',
          color: chartNeutrals.text,
          minWidth: 32,
        }}
      >
        {value}
      </span>
    </label>
  );
}

function formatTick(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return `${v}`;
}
