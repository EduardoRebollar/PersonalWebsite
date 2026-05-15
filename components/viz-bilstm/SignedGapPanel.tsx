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
 * Signed mean prediction gap (FFNN − BiLSTM) per label.
 *   Left  — single-column heatmap strip (color encodes direction & magnitude)
 *   Right — ranked diverging bar chart (coral = BiLSTM higher, navy = FFNN higher)
 */
export function SignedGapPanel({ data }: { data: VizData }) {
  const labels = data.labels;
  // Records keyed by data.labels — index access is exhaustive.
  const signed = labels.map((label) => ({
    label,
    display: labelDisplayNames[label] ?? label,
    value: data.summary.signedDiff[label]!,
  }));
  const vmax = Math.max(...signed.map((r) => Math.abs(r.value))) * 1.05;

  const ranked = [...signed].sort((a, b) => a.value - b.value);

  return (
    <section style={{ fontFamily: fontStack }}>
      <TitleBlock
        title="Signed Mean Prediction Gap"
        subtitle="Which model is, on average, more confident for each toxicity label."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 240px) 1fr",
          gap: 16,
        }}
      >
        {/* Heatmap strip: hand-rolled SVG (Nivo HeatMap doesn't render a
            single column cleanly; this is cleaner and fully themeable). */}
        <div
          style={{
            background: palette.canvas,
            border: `1px solid ${palette.rule}`,
            borderRadius: 10,
            padding: "14px 14px 10px",
          }}
        >
          <h4
            style={{
              margin: "0 0 10px",
              fontSize: 13,
              fontWeight: 700,
              color: palette.text,
            }}
          >
            Signed Gap (strip)
          </h4>
          <HeatmapStrip rows={signed} vmax={vmax} />
          <div
            style={{
              fontSize: 10.5,
              color: palette.subtext,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            FFNN − BiLSTM
          </div>
        </div>

        {/* Ranked diverging bar chart */}
        <div
          style={{
            background: palette.canvas,
            border: `1px solid ${palette.rule}`,
            borderRadius: 10,
            padding: "14px 14px 8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                color: palette.text,
              }}
            >
              Direction &amp; Magnitude (ranked)
            </h4>
            <div style={{ display: "flex", gap: 14, fontSize: 11, fontWeight: 700 }}>
              <span style={{ color: palette.bilstm }}>← BiLSTM higher</span>
              <span style={{ color: palette.baseline }}>FFNN higher →</span>
            </div>
          </div>

          <div style={{ height: Math.max(280, ranked.length * 46) }}>
            <ResponsiveBar
              data={ranked.map((r) => ({ label: r.display, value: r.value }))}
              keys={["value"]}
              indexBy="label"
              layout="horizontal"
              margin={{ top: 6, right: 30, bottom: 32, left: 100 }}
              padding={0.32}
              valueScale={{ type: "linear", min: -vmax, max: vmax }}
              colors={({ value }) =>
                (value ?? 0) < 0 ? palette.bilstm : palette.baseline
              }
              borderWidth={0.5}
              borderColor="#FFFFFF"
              valueFormat={(v) =>
                `${(v as number) >= 0 ? "+" : "−"}${Math.abs(
                  v as number
                ).toFixed(4)}`
              }
              labelTextColor="#FFFFFF"
              labelSkipWidth={48}
              markers={[
                {
                  axis: "x",
                  value: 0,
                  lineStyle: {
                    stroke: palette.text,
                    strokeWidth: 1,
                    strokeOpacity: 0.6,
                  },
                },
              ]}
              axisBottom={{
                tickSize: 0,
                tickPadding: 6,
                tickValues: 5,
                legend: "FFNN − BiLSTM",
                legendPosition: "middle",
                legendOffset: 28,
              }}
              axisLeft={{ tickSize: 0, tickPadding: 8 }}
              axisRight={null}
              axisTop={null}
              theme={nivoTheme}
              tooltip={({ value, indexValue }) => {
                const v = Number(value);
                const dir = v >= 0 ? "FFNN higher" : "BiLSTM higher";
                const c = v >= 0 ? palette.baseline : palette.bilstm;
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
                    <div style={{ fontWeight: 700 }}>{indexValue}</div>
                    <div style={{ color: c, marginTop: 2 }}>{dir}</div>
                    <div style={{ marginTop: 2 }}>
                      gap{" "}
                      <strong>
                        {v >= 0 ? "+" : "−"}
                        {Math.abs(v).toFixed(4)}
                      </strong>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>
      </div>

      <VizFooter n={data.n} />
    </section>
  );
}

function HeatmapStrip({
  rows,
  vmax,
}: {
  rows: { label: string; display: string; value: number }[];
  vmax: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {rows.map((r) => {
        const t = Math.max(-1, Math.min(1, r.value / vmax));
        const bg = divergingColor(t);
        const fg = Math.abs(t) > 0.55 ? "#FFFFFF" : palette.text;
        return (
          <div
            key={r.label}
            style={{
              display: "grid",
              gridTemplateColumns: "84px 1fr",
              alignItems: "center",
              columnGap: 8,
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                color: palette.text,
                fontWeight: 600,
                textAlign: "right",
              }}
            >
              {r.display}
            </div>
            <div
              title={`${r.display}: ${r.value >= 0 ? "+" : "−"}${Math.abs(
                r.value
              ).toFixed(4)}`}
              style={{
                background: bg,
                color: fg,
                borderRadius: 6,
                padding: "8px 10px",
                fontSize: 11.5,
                fontWeight: 700,
                textAlign: "center",
                fontVariantNumeric: "tabular-nums",
                border: `1px solid rgba(15,27,45,0.05)`,
              }}
            >
              {r.value >= 0 ? "+" : "−"}
              {Math.abs(r.value).toFixed(4)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Diverging cmap centered at 0: coral ↔ white ↔ navy. */
function divergingColor(t: number): string {
  // t in [-1, 1]. Negative ⇒ coral (BiLSTM higher), positive ⇒ navy (FFNN higher).
  const ramp = (
    a: [number, number, number],
    b: [number, number, number],
    u: number
  ): [number, number, number] => [
    a[0] + (b[0] - a[0]) * u,
    a[1] + (b[1] - a[1]) * u,
    a[2] + (b[2] - a[2]) * u,
  ];
  const white: [number, number, number] = [247, 248, 251];
  const coral: [number, number, number] = [229, 82, 60];
  const coralLight: [number, number, number] = [248, 195, 184];
  const navy: [number, number, number] = [31, 58, 147];
  const navyLight: [number, number, number] = [188, 197, 230];

  let rgb: [number, number, number];
  if (t < 0) {
    const u = Math.abs(t);
    rgb = u < 0.5 ? ramp(white, coralLight, u * 2) : ramp(coralLight, coral, (u - 0.5) * 2);
  } else if (t > 0) {
    const u = t;
    rgb = u < 0.5 ? ramp(white, navyLight, u * 2) : ramp(navyLight, navy, (u - 0.5) * 2);
  } else {
    rgb = white;
  }
  return `rgb(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])})`;
}
