'use client';

import { ResponsiveLine, type CustomLayerProps } from "@nivo/line";
import { useMemo } from "react";
import {
  chartNeutrals,
  countryColors,
  dimmedOpacity,
  EnergyData,
  fontStack,
  nivoTheme,
} from "./shared";

type Props = {
  data: EnergyData;
  visibleCountries: Set<string>;
  isolated: string | null;
  reducedMotion: boolean;
  interactive: boolean;
  onIsolate?: (country: string | null) => void;
};

export function LineTrend({
  data,
  visibleCountries,
  isolated,
  reducedMotion,
  interactive,
  onIsolate,
}: Props) {
  const series = useMemo(() => {
    return data.series
      .filter((s) => visibleCountries.has(s.country))
      .map((s) => ({
        id: s.country,
        data: s.values.map((v) => ({ x: v.year, y: v.kwh })),
      }));
  }, [data, visibleCountries]);

  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: chartNeutrals.text,
          fontFamily: fontStack,
          marginBottom: 2,
        }}
      >
        Per-capita energy consumption — temporal trend
      </div>
      <div
        style={{
          fontSize: 11,
          color: chartNeutrals.subtext,
          fontFamily: fontStack,
          marginBottom: 6,
        }}
      >
        {data.yearRange[0]}–{data.yearRange[1]} · {data.unit}
        {interactive ? ' · click a country in the legend to isolate' : ''}
      </div>

      <div style={{ height: 340 }}>
        <ResponsiveLine
          data={series}
          margin={{ top: 10, right: 24, bottom: 44, left: 56 }}
          xScale={{ type: 'linear', min: data.yearRange[0], max: data.yearRange[1] }}
          yScale={{ type: 'linear', min: 0, max: 'auto' }}
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
            tickValues: 6,
            format: (v) => `${v}`,
          }}
          axisRight={null}
          axisTop={null}
          colors={(serie) => countryColors[serie.id as string] ?? chartNeutrals.subtext}
          lineWidth={2}
          enablePoints={false}
          enableGridX={false}
          enableSlices="x"
          theme={nivoTheme}
          animate={!reducedMotion}
          motionConfig={reducedMotion ? undefined : 'gentle'}
          layers={[
            'grid',
            'axes',
            'crosshair',
            (props) => <DimmedLines {...props} isolated={isolated} />,
            'slices',
            'mesh',
            'legends',
          ]}
          sliceTooltip={({ slice }) => (
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
                maxWidth: 220,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {slice.points[0]?.data.xFormatted}
              </div>
              {[...slice.points]
                .sort((a, b) => Number(b.data.y) - Number(a.data.y))
                .slice(0, 8)
                .map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      opacity:
                        isolated && p.serieId !== isolated ? 0.5 : 1,
                    }}
                  >
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          background: p.serieColor,
                          borderRadius: 2,
                          marginRight: 6,
                        }}
                      />
                      {p.serieId}
                    </span>
                    <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {Number(p.data.y).toLocaleString()}
                    </strong>
                  </div>
                ))}
            </div>
          )}
        />
      </div>

      <CountryLegend
        countries={series.map((s) => String(s.id))}
        latestValues={Object.fromEntries(
          series.map((s) => [String(s.id), Number(s.data[s.data.length - 1]?.y ?? 0)]),
        )}
        isolated={isolated}
        interactive={interactive}
        onIsolate={onIsolate}
      />
    </div>
  );
}

function DimmedLines({
  lineGenerator,
  series,
  xScale,
  yScale,
  isolated,
}: CustomLayerProps & { isolated: string | null }) {
  // Nivo's xScale/yScale are scale objects callable as functions; cast for
  // narrow use.
  const x = xScale as unknown as (v: number) => number;
  const y = yScale as unknown as (v: number) => number;
  return (
    <g>
      {series.map((s) => {
        const pts = s.data.map((d) => ({
          x: x(Number(d.data.x)),
          y: y(Number(d.data.y)),
        }));
        const path = lineGenerator(pts);
        if (!path) return null;
        const dimmed = isolated && s.id !== isolated;
        return (
          <path
            key={s.id}
            d={path}
            fill="none"
            stroke={s.color ?? chartNeutrals.subtext}
            strokeWidth={2}
            opacity={dimmed ? dimmedOpacity : 1}
            style={{ transition: 'opacity 200ms ease' }}
          />
        );
      })}
    </g>
  );
}

function CountryLegend({
  countries,
  latestValues,
  isolated,
  interactive,
  onIsolate,
}: {
  countries: string[];
  latestValues: Record<string, number>;
  isolated: string | null;
  interactive: boolean;
  onIsolate?: (country: string | null) => void;
}) {
  const sorted = interactive
    ? [...countries].sort((a, b) => (latestValues[b] ?? 0) - (latestValues[a] ?? 0))
    : countries;

  const handleClick = (country: string) => {
    if (!interactive || !onIsolate) return;
    onIsolate(isolated === country ? null : country);
  };

  return (
    <div
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? 'Country isolation legend' : undefined}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px 10px',
        marginTop: 10,
        fontFamily: fontStack,
        fontSize: 11,
      }}
    >
      {sorted.map((country) => {
        const color = countryColors[country] ?? chartNeutrals.subtext;
        const dimmed = isolated && country !== isolated;
        const isActive = isolated === country;
        const baseStyle: React.CSSProperties = {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: chartNeutrals.subtext,
          opacity: dimmed ? 0.45 : 1,
          padding: '2px 6px',
          borderRadius: 4,
          background: isActive ? `${color}1A` : 'transparent',
          transition: 'opacity 180ms ease, background 180ms ease',
        };
        return interactive ? (
          <button
            key={country}
            type="button"
            onClick={() => handleClick(country)}
            aria-pressed={isActive}
            style={{
              ...baseStyle,
              border: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'inherit',
            }}
          >
            <ChipDot color={color} />
            {country}
          </button>
        ) : (
          <span key={country} style={baseStyle}>
            <ChipDot color={color} />
            {country}
          </span>
        );
      })}
    </div>
  );
}

function ChipDot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        background: color,
        borderRadius: 2,
      }}
      aria-hidden
    />
  );
}

function formatTick(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return `${v}`;
}
