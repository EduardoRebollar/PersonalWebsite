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
 * Two-panel agreement dashboard:
 *   left  — per-label Pearson correlation (FFNN vs BiLSTM)
 *   right — per-label mean absolute difference, with a global-mean reference line
 */
export function MetricsDashboard({ data }: { data: VizData }) {
  const labels = data.labels;
  // Records below are keyed by data.labels — index access is exhaustive.
  const corr = labels.map((label) => ({
    label: labelDisplayNames[label] ?? label,
    value: data.summary.correlations[label]!,
  }));
  const absd = labels.map((label) => ({
    label: labelDisplayNames[label] ?? label,
    value: data.summary.absDiff[label]!,
  }));
  const globalAbs = data.summary.globalAbsDiff;

  const topCorr = corr.reduce(
    (m, r) => (r.value > m.value ? r : m),
    corr[0]!
  ).label;
  const topAbs = absd.reduce((m, r) => (r.value > m.value ? r : m), absd[0]!)
    .label;

  return (
    <section style={{ fontFamily: fontStack }}>
      <TitleBlock
        title="Model Agreement Metrics"
        subtitle="Where the models agree most (correlation) and where they disagree most (absolute gap)."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <Panel title="Per-Label Correlation">
          <div style={{ height: 280 }}>
            <ResponsiveBar
              data={corr}
              keys={["value"]}
              indexBy="label"
              layout="horizontal"
              margin={{ top: 6, right: 56, bottom: 36, left: 100 }}
              padding={0.32}
              colors={({ data: row }) =>
                (row as { label: string }).label === topCorr
                  ? palette.baseline
                  : palette.baseline2
              }
              borderWidth={0}
              valueScale={{ type: "linear", min: 0, max: 1 }}
              valueFormat={(v) => Number(v).toFixed(3)}
              labelTextColor="#FFFFFF"
              labelSkipWidth={40}
              axisBottom={{
                tickSize: 0,
                tickPadding: 6,
                tickValues: 5,
                legend: "Pearson Correlation",
                legendPosition: "middle",
                legendOffset: 30,
              }}
              axisLeft={{ tickSize: 0, tickPadding: 8 }}
              axisRight={null}
              axisTop={null}
              theme={nivoTheme}
              tooltip={({ value, indexValue }) => (
                <ChipTooltip
                  title={String(indexValue)}
                  body={`r = ${Number(value).toFixed(3)}`}
                  color={palette.baseline}
                />
              )}
            />
          </div>
        </Panel>

        <Panel title="Per-Label Mean Absolute Difference">
          <div style={{ height: 280, position: "relative" }}>
            <ResponsiveBar
              data={absd}
              keys={["value"]}
              indexBy="label"
              layout="horizontal"
              margin={{ top: 6, right: 56, bottom: 36, left: 100 }}
              padding={0.32}
              colors={({ data: row }) =>
                (row as { label: string }).label === topAbs
                  ? palette.bilstm
                  : palette.bilstm2
              }
              borderWidth={0}
              valueScale={{
                type: "linear",
                min: 0,
                max: Math.max(...absd.map((r) => r.value)) * 1.25,
              }}
              valueFormat={(v) => Number(v).toFixed(3)}
              labelTextColor="#FFFFFF"
              labelSkipWidth={32}
              markers={[
                {
                  axis: "x",
                  value: globalAbs,
                  lineStyle: {
                    stroke: palette.muted,
                    strokeWidth: 1.4,
                    strokeDasharray: "5 3",
                  },
                  legend: `global mean ${globalAbs.toFixed(3)}`,
                  textStyle: {
                    fill: palette.muted,
                    fontSize: 10,
                    fontWeight: 600,
                  },
                  legendOrientation: "vertical",
                  legendPosition: "top",
                },
              ]}
              axisBottom={{
                tickSize: 0,
                tickPadding: 6,
                tickValues: 5,
                legend: "Mean |FFNN − BiLSTM|",
                legendPosition: "middle",
                legendOffset: 30,
              }}
              axisLeft={{ tickSize: 0, tickPadding: 8 }}
              axisRight={null}
              axisTop={null}
              theme={nivoTheme}
              tooltip={({ value, indexValue }) => (
                <ChipTooltip
                  title={String(indexValue)}
                  body={`|Δ| = ${Number(value).toFixed(3)}`}
                  color={palette.bilstm}
                />
              )}
            />
          </div>
        </Panel>
      </div>

      <VizFooter n={data.n} />
    </section>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: palette.canvas,
        border: `1px solid ${palette.rule}`,
        borderRadius: 10,
        padding: "14px 14px 8px",
      }}
    >
      <h4
        style={{
          margin: "0 0 8px",
          fontSize: 13,
          fontWeight: 700,
          color: palette.text,
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

function ChipTooltip({
  title,
  body,
  color,
}: {
  title: string;
  body: string;
  color: string;
}) {
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
        fontFamily: fontStack,
      }}
    >
      <div style={{ fontWeight: 700, color }}>{title}</div>
      <div style={{ marginTop: 2 }}>{body}</div>
    </div>
  );
}
