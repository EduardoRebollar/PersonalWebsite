// BiLSTM-specific palette + label dictionary + data-shape types.
// Generic chart chrome (fontStack, nivoTheme, neutral colors) is re-exported
// from lib/nivo-theme so this directory and viz-interactivity stay in sync.

import { chartNeutrals, fontStack, nivoTheme } from "@/lib/nivo-theme";

export { fontStack, nivoTheme };

export const palette = {
  baseline:  "#1F3A93",  // deep royal navy   -> FFNN
  baseline2: "#4F6FE5",  // lifted fill / hover accent
  bilstm:    "#E5523C",  // vivid coral       -> BiLSTM
  bilstm2:   "#F4A261",  // warm amber accent
  neutral:   "#1B9E91",  // teal accent for differences
  muted:     "#8C97A8",
  text:      chartNeutrals.text,
  subtext:   chartNeutrals.subtext,
  canvas:    chartNeutrals.canvas,
  rule:      chartNeutrals.rule,
} as const;

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
