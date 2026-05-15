'use client';

import { ResponsiveHeatMap } from "@nivo/heatmap";
import type { HeatMapSerie, DefaultHeatMapDatum } from "@nivo/heatmap";
import {
  palette,
  fontStack,
  nivoTheme,
  labelDisplayNames,
  VizData,
} from "./shared";
import { TitleBlock, VizFooter } from "./TitleBlock";

/**
 * 2x3 grid of density heatmaps showing FFNN vs BiLSTM per-sample agreement.
 * Replaces the matplotlib hexbin: Nivo HeatMap on a GxG binned grid,
 * with log-transformed counts so the cross-pattern doesn't wash out.
 */
export function ScatterDensityGrid({ data }: { data: VizData }) {
  return (
    <section style={{ fontFamily: fontStack }}>
      <TitleBlock
        title="Per-Sample Agreement"
        subtitle="Binned density of FFNN vs BiLSTM predictions. Each panel shows where the two models cluster."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {data.labels.map((label) => (
          <DensityPanel key={label} label={label} data={data} />
        ))}
      </div>

      <VizFooter n={data.n} />
    </section>
  );
}

function DensityPanel({ label, data }: { label: string; data: VizData }) {
  // density/correlations records are keyed by data.labels — safe to assert.
  const d = data.density[label]!;
  const r = data.summary.correlations[label]!;
  const G = d.gridSize;
  const logMax = Math.log1p(d.max);

  // Build Nivo heatmap series: outer = BiLSTM rows (top→bottom = high→low),
  // inner = FFNN columns (left→right = low→high).
  // Use empty string axis labels and rely on legend annotations to avoid clutter.
  const series: HeatMapSerie<DefaultHeatMapDatum, Record<string, unknown>>[] = [];
  for (let j = G - 1; j >= 0; j--) {
    const row: DefaultHeatMapDatum[] = [];
    for (let i = 0; i < G; i++) {
      const c = d.grid[i]![j]!;
      row.push({ x: `${i}`, y: c === 0 ? null : Math.log1p(c) });
    }
    series.push({ id: `${j}`, data: row });
  }

  return (
    <div
      style={{
        background: palette.canvas,
        borderRadius: 10,
        padding: "12px 12px 8px",
        border: `1px solid ${palette.rule}`,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: palette.text }}>
          {labelDisplayNames[label] ?? label}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: palette.text,
            background: "#FFFFFF",
            border: `1px solid ${palette.bilstm}`,
            borderRadius: 6,
            padding: "1px 6px",
          }}
        >
          r = {r.toFixed(3)}
        </span>
      </div>
      <div style={{ height: 220, position: "relative" }}>
        <ResponsiveHeatMap
          data={series}
          margin={{ top: 4, right: 6, bottom: 28, left: 32 }}
          valueFormat={(v) =>
            v == null ? "" : Math.expm1(Number(v)).toFixed(0)
          }
          axisLeft={{
            tickSize: 0,
            tickPadding: 4,
            tickValues: [`${0}`, `${Math.floor(G / 2)}`, `${G - 1}`],
            format: (v) => {
              const i = Number(v);
              return (i / (G - 1)).toFixed(1);
            },
            legend: "BiLSTM",
            legendPosition: "middle",
            legendOffset: -24,
          }}
          axisBottom={{
            tickSize: 0,
            tickPadding: 4,
            tickValues: [`${0}`, `${Math.floor(G / 2)}`, `${G - 1}`],
            format: (v) => {
              const i = Number(v);
              return (i / (G - 1)).toFixed(1);
            },
            legend: "FFNN (Baseline)",
            legendPosition: "middle",
            legendOffset: 22,
          }}
          axisTop={null}
          axisRight={null}
          colors={{
            type: "sequential",
            scheme: "oranges",
            minValue: 0,
            maxValue: logMax,
          }}
          emptyColor="#FFFFFF"
          borderWidth={0}
          enableLabels={false}
          theme={nivoTheme}
          tooltip={({ cell }) => {
            const ffnnIdx = Number(cell.data.x);
            const biRow = Number(cell.serieId);
            const ffnnLow = ffnnIdx / G;
            const ffnnHigh = (ffnnIdx + 1) / G;
            const biLow = biRow / G;
            const biHigh = (biRow + 1) / G;
            const count = cell.value == null
              ? 0
              : Math.round(Math.expm1(Number(cell.value)));
            return (
              <div
                style={{
                  background: "#FFFFFF",
                  border: `1px solid ${palette.rule}`,
                  borderRadius: 8,
                  padding: "8px 10px",
                  fontSize: 12,
                  color: palette.text,
                  boxShadow: "0 4px 14px rgba(15,27,45,0.10)",
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {labelDisplayNames[label] ?? label}
                </div>
                <div style={{ color: palette.subtext }}>
                  FFNN {ffnnLow.toFixed(2)}–{ffnnHigh.toFixed(2)}
                </div>
                <div style={{ color: palette.subtext }}>
                  BiLSTM {biLow.toFixed(2)}–{biHigh.toFixed(2)}
                </div>
                <div style={{ marginTop: 2 }}>
                  count <strong>{count.toLocaleString()}</strong>
                </div>
              </div>
            );
          }}
        />
        {/* SVG overlay for the y=x reference diagonal */}
        <svg
          aria-hidden
          style={{
            position: "absolute",
            top: 4,
            left: 32,
            right: 6,
            bottom: 28,
            width: "calc(100% - 38px)",
            height: "calc(100% - 32px)",
            pointerEvents: "none",
          }}
        >
          <line
            x1="0%"
            y1="100%"
            x2="100%"
            y2="0%"
            stroke={palette.text}
            strokeOpacity={0.45}
            strokeWidth={1.2}
            strokeDasharray="5 4"
          />
        </svg>
      </div>
    </div>
  );
}
