'use client';

import { ResponsiveBar } from "@nivo/bar";
import {
  palette,
  fontStack,
  nivoTheme,
  labelDisplayNames,
  VizData,
} from "./shared";
import { TitleBlock, VizFooter } from "./TitleBlock";

/**
 * 2x3 grid of per-label histograms comparing FFNN vs BiLSTM prediction
 * probability distributions. Y-axis is symlog so long tails are visible.
 */
export function HistogramsGrid({ data }: { data: VizData }) {
  return (
    <section style={{ fontFamily: fontStack }}>
      <TitleBlock
        title="Prediction Probability Distributions"
        subtitle="How confidently each model labels comments across the six toxicity categories."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {data.labels.map((label) => (
          <HistogramPanel key={label} label={label} data={data} />
        ))}
      </div>

      <LegendChips />
      <VizFooter n={data.n} />
    </section>
  );
}

function HistogramPanel({ label, data }: { label: string; data: VizData }) {
  // histograms is keyed by data.labels — safe to assert. Bin arrays are
  // length-aligned (ffnn.length === bilstm.length === binEdges.length − 1).
  const h = data.histograms[label]!;
  const rows = h.ffnn.map((fc, i) => ({
    bin: `${h.binEdges[i]!.toFixed(2)}–${h.binEdges[i + 1]!.toFixed(2)}`,
    binCenter: (h.binEdges[i]! + h.binEdges[i + 1]!) / 2,
    FFNN: fc,
    BiLSTM: h.bilstm[i]!,
  }));

  return (
    <div
      style={{
        background: palette.canvas,
        borderRadius: 10,
        padding: "12px 12px 6px",
        border: `1px solid ${palette.rule}`,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: palette.text,
          marginBottom: 4,
        }}
      >
        {labelDisplayNames[label] ?? label}
      </div>
      <div style={{ height: 200 }}>
        <ResponsiveBar
          data={rows}
          keys={["FFNN", "BiLSTM"]}
          indexBy="bin"
          groupMode="grouped"
          margin={{ top: 6, right: 6, bottom: 32, left: 44 }}
          padding={0.15}
          innerPadding={0}
          valueScale={{ type: "symlog" }}
          colors={({ id }) =>
            id === "FFNN" ? palette.baseline : palette.bilstm
          }
          borderWidth={0.5}
          borderColor="#FFFFFF"
          enableLabel={false}
          axisLeft={{
            tickSize: 0,
            tickPadding: 6,
            tickValues: 4,
            legend: "Frequency (log)",
            legendPosition: "middle",
            legendOffset: -36,
            format: (v) => formatTick(Number(v)),
          }}
          axisBottom={{
            tickSize: 0,
            tickPadding: 4,
            tickRotation: 0,
            tickValues: [
              rows[0]!.bin,
              rows[Math.floor(rows.length / 2)]!.bin,
              rows[rows.length - 1]!.bin,
            ],
            format: (v) => {
              const r = rows.find((row) => row.bin === v);
              return r ? r.binCenter.toFixed(1) : "";
            },
            legend: "Predicted Probability",
            legendPosition: "middle",
            legendOffset: 26,
          }}
          axisRight={null}
          axisTop={null}
          theme={nivoTheme}
          tooltip={({ id, value, indexValue, color }) => (
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
              <div style={{ fontWeight: 700 }}>
                <span
                  style={{
                    display: "inline-block",
                    width: 9,
                    height: 9,
                    background: color,
                    borderRadius: 2,
                    marginRight: 6,
                  }}
                />
                {id}
              </div>
              <div style={{ color: palette.subtext, marginTop: 2 }}>
                probability {indexValue}
              </div>
              <div style={{ marginTop: 2 }}>
                count <strong>{Number(value).toLocaleString()}</strong>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}

function LegendChips() {
  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        justifyContent: "center",
        marginTop: 14,
        fontSize: 12,
        fontWeight: 700,
        fontFamily: fontStack,
      }}
    >
      <Chip color={palette.baseline} label="FFNN (Baseline)" />
      <Chip color={palette.bilstm} label="BiLSTM" />
    </div>
  );
}

function Chip({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 12,
          height: 12,
          background: color,
          borderRadius: 3,
        }}
      />
      {label}
    </span>
  );
}

function formatTick(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1000) return `${(v / 1000).toFixed(0)}k`;
  if (abs >= 100) return `${v.toFixed(0)}`;
  return `${v}`;
}
