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
 * Horizontal grouped bar chart: average FFNN vs BiLSTM confidence per label,
 * sorted by FFNN magnitude. Δ chips on the right show the per-label gap.
 */
export function MeansBar({ data }: { data: VizData }) {
  // means is keyed by data.labels — index access is exhaustive.
  const sorted = [...data.labels].sort(
    (a, b) => data.summary.means[b]!.ffnn - data.summary.means[a]!.ffnn
  );

  const rows = sorted.map((label) => ({
    label: labelDisplayNames[label] ?? label,
    rawLabel: label,
    FFNN: data.summary.means[label]!.ffnn,
    BiLSTM: data.summary.means[label]!.bilstm,
  }));

  const xmax = Math.max(...rows.flatMap((r) => [r.FFNN, r.BiLSTM]));

  return (
    <section style={{ fontFamily: fontStack }}>
      <TitleBlock
        title="Average Model Confidence per Label"
        subtitle="Sorted by FFNN mean. Δ shows the gap between the two models."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 132px",
          gap: 12,
          background: palette.canvas,
          borderRadius: 10,
          border: `1px solid ${palette.rule}`,
          padding: 14,
        }}
      >
        <div style={{ height: Math.max(280, rows.length * 56) }}>
          <ResponsiveBar
            data={rows}
            keys={["FFNN", "BiLSTM"]}
            indexBy="label"
            layout="horizontal"
            groupMode="grouped"
            margin={{ top: 10, right: 60, bottom: 38, left: 100 }}
            padding={0.25}
            innerPadding={2}
            colors={({ id }) =>
              id === "FFNN" ? palette.baseline : palette.bilstm
            }
            borderWidth={0.5}
            borderColor="#FFFFFF"
            valueFormat={(v) => Number(v).toFixed(3)}
            labelTextColor="#FFFFFF"
            labelSkipWidth={48}
            axisBottom={{
              tickSize: 0,
              tickPadding: 6,
              tickValues: 5,
              legend: "Mean Predicted Probability",
              legendPosition: "middle",
              legendOffset: 30,
            }}
            axisLeft={{ tickSize: 0, tickPadding: 8 }}
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
                <div style={{ fontWeight: 700, color }}>{id}</div>
                <div style={{ color: palette.subtext, marginTop: 2 }}>
                  {indexValue}
                </div>
                <div style={{ marginTop: 2 }}>
                  mean <strong>{Number(value).toFixed(3)}</strong>
                </div>
              </div>
            )}
          />
        </div>

        {/* Delta chip column */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            paddingTop: 10,
            paddingBottom: 38,
          }}
        >
          {rows.map((r) => {
            const delta = r.FFNN - r.BiLSTM;
            const color = delta >= 0 ? palette.baseline : palette.bilstm;
            return (
              <div
                key={r.rawLabel}
                style={{
                  alignSelf: "flex-start",
                  fontSize: 12,
                  fontWeight: 700,
                  color: palette.text,
                  background: "#FFFFFF",
                  border: `1px solid ${color}`,
                  borderRadius: 6,
                  padding: "2px 8px",
                  whiteSpace: "nowrap",
                }}
              >
                Δ {delta >= 0 ? "+" : "−"}
                {Math.abs(delta).toFixed(3)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline legend chips */}
      <div
        style={{
          display: "flex",
          gap: 18,
          justifyContent: "center",
          marginTop: 12,
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        <Chip color={palette.baseline} label="FFNN (Baseline)" />
        <Chip color={palette.bilstm} label="BiLSTM" />
      </div>

      <VizFooter n={data.n} />
    </section>
  );

  void xmax; // intentionally unused; reserved for future axis tuning
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
