// Shared palette, Nivo theme, label dictionary, and TypeScript types for the
// FFNN vs BiLSTM prediction visualizations. Mirrors the palette used by the
// matplotlib version in compare_predictions.py so static and interactive
// renderings look like the same family.

export const palette = {
  baseline:  "#1F3A93",  // deep royal navy   -> FFNN
  baseline2: "#4F6FE5",  // lifted fill / hover accent
  bilstm:    "#E5523C",  // vivid coral       -> BiLSTM
  bilstm2:   "#F4A261",  // warm amber accent
  neutral:   "#1B9E91",  // teal accent for differences
  muted:     "#8C97A8",
  text:      "#0F1B2D",
  subtext:   "#5C6A82",
  canvas:    "#F7F8FB",
  rule:      "#E1E5EC",
} as const;

export const fontStack =
  '"Inter", "DejaVu Sans", system-ui, -apple-system, "Segoe UI", sans-serif';

export const nivoTheme = {
  background: "transparent",
  text: { fontSize: 11, fill: palette.subtext, fontFamily: fontStack },
  axis: {
    domain: { line: { stroke: "#D9DEE7", strokeWidth: 1 } },
    ticks: {
      line: { stroke: "#D9DEE7", strokeWidth: 1 },
      text: { fill: palette.subtext, fontSize: 10, fontFamily: fontStack },
    },
    legend: {
      text: {
        fill: palette.subtext, fontSize: 11, fontWeight: 600,
        fontFamily: fontStack,
      },
    },
  },
  grid: { line: { stroke: "#ECEFF4", strokeWidth: 1 } },
  legends: {
    text: {
      fill: palette.text, fontSize: 11, fontWeight: 600, fontFamily: fontStack,
    },
  },
  tooltip: {
    container: {
      background: "#FFFFFF",
      color: palette.text,
      fontSize: 12,
      fontFamily: fontStack,
      borderRadius: 8,
      boxShadow: "0 4px 14px rgba(15,27,45,0.10)",
      padding: "8px 10px",
      border: `1px solid ${palette.rule}`,
    },
  },
  annotations: {
    text: { fontSize: 11, fill: palette.text, fontFamily: fontStack },
  },
};

export const labelDisplayNames: Record<string, string> = {
  toxic:         "Toxic",
  severe_toxic:  "Severe Toxic",
  obscene:       "Obscene",
  threat:        "Threat",
  insult:        "Insult",
  identity_hate: "Identity Hate",
};

// --------------------------------------------------------------------------
// Data shape emitted by generate_viz_data.py
// --------------------------------------------------------------------------
export interface HistogramSeries {
  binEdges: number[];   // length N+1
  ffnn:     number[];   // length N
  bilstm:   number[];   // length N
}

export interface DensityGrid {
  gridSize: number;     // G; grid is G x G
  grid:     number[][]; // grid[i][j] = count where i indexes FFNN bin, j indexes BiLSTM bin
  max:      number;
}

export interface DiffDistribution {
  binEdges: number[];
  counts:   number[];
  mean:     number;
  median:   number;
}

export interface VizSummary {
  means:         Record<string, { ffnn: number; bilstm: number }>;
  correlations:  Record<string, number>;
  absDiff:       Record<string, number>;
  signedDiff:    Record<string, number>;
  globalAbsDiff: number;
}

export interface VizData {
  n:          number;
  labels:     string[];
  histograms: Record<string, HistogramSeries>;
  density:    Record<string, DensityGrid>;
  diffDist:   Record<string, DiffDistribution>;
  summary:    VizSummary;
}
