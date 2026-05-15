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
 * 2x3 grid of difference distributions (FFNN - BiLSTM) per label, with
 * mean and median guide lines as Nivo markers. Background tint splits
 * each panel into FFNN-higher / BiLSTM-higher zones.
 */
export function DiffDistGrid({ data }: { data: VizData }) {
  return (
    <section style={{ fontFamily: fontStack }}>
      <TitleBlock
        title="Prediction Differences  (FFNN − BiLSTM)"
        subtitle="Blue tint ⇒ FFNN higher; coral tint ⇒ BiLSTM higher. Dashed line = mean, dotted line = median."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {data.labels.map((label) => (
          <DiffPanel key={label} label={label} data={data} />
        ))}
      </div>

      <VizFooter n={data.n} />
    </section>
  );
}

function DiffPanel({ label, data }: { label: string; data: VizData }) {
  // diffDist is keyed by data.labels — safe to assert. binEdges has counts.length + 1 entries.
  const dd = data.diffDist[label]!;
  const rows = dd.counts.map((c, i) => ({
    bin: `${dd.binEdges[i]!.toFixed(2)}`,
    center: (dd.binEdges[i]! + dd.binEdges[i + 1]!) / 2,
    count: c,
  }));

  // Find marker positions by mapping the value into the nearest bin label.
  const meanBin = nearestBin(rows, dd.mean);
  const medianBin = nearestBin(rows, dd.median);

  return (
    <div
      style={{
        background: palette.canvas,
        borderRadius: 10,
        padding: "12px 12px 6px",
        border: `1px solid ${palette.rule}`,
        position: "relative",
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
      <div style={{ height: 200, position: "relative" }}>
        {/* Background zone tints */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            bottom: 32,
            left: 44,
            right: 6,
            display: "flex",
            pointerEvents: "none",
          }}
        >
          <div style={{ flex: 1, background: `${palette.bilstm}0F` }} />
          <div style={{ flex: 1, background: `${palette.baseline}0F` }} />
        </div>
        <ResponsiveBar
          data={rows}
          keys={["count"]}
          indexBy="bin"
          margin={{ top: 6, right: 6, bottom: 32, left: 44 }}
          padding={0.08}
          valueScale={{ type: "symlog" }}
          colors={[palette.neutral]}
          borderWidth={0.4}
          borderColor="#FFFFFF"
          enableLabel={false}
          markers={[
            {
              axis: "x",
              value: meanBin,
              lineStyle: {
                stroke: palette.bilstm,
                strokeWidth: 2,
                strokeDasharray: "5 3",
              },
              legend: `mean ${signed(dd.mean)}`,
              legendOrientation: "vertical",
              legendPosition: "top",
              textStyle: { fill: palette.bilstm, fontSize: 9, fontWeight: 700 },
            },
            {
              axis: "x",
              value: medianBin,
              lineStyle: {
                stroke: palette.baseline,
                strokeWidth: 2,
                strokeDasharray: "1 3",
              },
              legend: `median ${signed(dd.median)}`,
              legendOrientation: "vertical",
              legendPosition: "bottom",
              textStyle: {
                fill: palette.baseline,
                fontSize: 9,
                fontWeight: 700,
              },
            },
            {
              axis: "x",
              value: nearestBin(rows, 0),
              lineStyle: { stroke: palette.text, strokeWidth: 1, strokeOpacity: 0.6 },
            },
          ]}
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
            tickValues: [
              rows[0]!.bin,
              rows[Math.floor(rows.length / 2)]!.bin,
              rows[rows.length - 1]!.bin,
            ],
            format: (v) => {
              const r = rows.find((row) => row.bin === v);
              return r ? r.center.toFixed(1) : "";
            },
            legend: "FFNN  −  BiLSTM",
            legendPosition: "middle",
            legendOffset: 26,
          }}
          axisRight={null}
          axisTop={null}
          theme={nivoTheme}
          tooltip={({ value, indexValue, data: row }) => (
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
                {labelDisplayNames[label] ?? label}
              </div>
              <div style={{ color: palette.subtext, marginTop: 2 }}>
                difference {Number((row as { center: number }).center).toFixed(
                  2
                )}{" "}
                ({indexValue})
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

function nearestBin(rows: { bin: string; center: number }[], v: number): string {
  // Caller always passes a non-empty rows array.
  let best = rows[0]!;
  let bestDist = Math.abs(best.center - v);
  for (const r of rows) {
    const d = Math.abs(r.center - v);
    if (d < bestDist) {
      best = r;
      bestDist = d;
    }
  }
  return best.bin;
}

function signed(v: number): string {
  return `${v >= 0 ? "+" : "−"}${Math.abs(v).toFixed(3)}`;
}

function formatTick(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1000) return `${(v / 1000).toFixed(0)}k`;
  if (abs >= 100) return `${v.toFixed(0)}`;
  return `${v}`;
}
