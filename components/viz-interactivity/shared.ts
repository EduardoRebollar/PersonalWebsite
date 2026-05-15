// Subject-specific palette + data-shape types for the InteractivityViz
// dashboard. Generic chart chrome (fontStack, nivoTheme, chartNeutrals)
// is imported from lib/nivo-theme so this directory stays in sync with
// viz-bilstm.

import { chartNeutrals, fontStack, nivoTheme } from "@/lib/nivo-theme";

export { fontStack, nivoTheme, chartNeutrals };

// 15-country palette, chosen for distinguishability on the light chart
// canvas (#F7F8FB). Tableau10 + 5 deeper variants for the higher-n region
// of the line graph.
export const countryColors: Record<string, string> = {
  "United States":  "#1F77B4",
  "Canada":         "#FF7F0E",
  "Norway":         "#2CA02C",
  "Saudi Arabia":   "#D62728",
  "Australia":      "#9467BD",
  "Germany":        "#8C564B",
  "United Kingdom": "#E377C2",
  "France":         "#7F7F7F",
  "Japan":          "#BCBD22",
  "South Korea":    "#17BECF",
  "Russia":         "#1A5490",
  "China":          "#B22222",
  "Brazil":         "#228B22",
  "India":          "#FF8C00",
  "Bangladesh":     "#4B0082",
};

export const dimmedOpacity = 0.18;

// --------------------------------------------------------------------------
// Data shape emitted by the hand-curated JSON at
// content/data/energy-per-capita.json
// --------------------------------------------------------------------------
export interface YearValue {
  year: number;
  kwh:  number;
}

export interface CountrySeries {
  country: string;
  values:  YearValue[];
}

export interface EnergyData {
  source:    string;
  unit:      string;
  yearRange: [number, number];
  countries: string[];
  series:    CountrySeries[];
}
