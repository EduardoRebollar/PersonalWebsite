// Shared Nivo chart theme + neutrals used across viz families.
// Each viz directory layers its own subject-specific palette on top of
// `chartNeutrals` and reuses `nivoTheme` / `fontStack` directly so the
// chart chrome (axes, ticks, tooltips, legends) stays consistent.

export const fontStack =
  '"Inter", "DejaVu Sans", system-ui, -apple-system, "Segoe UI", sans-serif';

export const chartNeutrals = {
  text:    "#0F1B2D",
  subtext: "#5C6A82",
  canvas:  "#F7F8FB",
  rule:    "#E1E5EC",
  axis:    "#D9DEE7",
  grid:    "#ECEFF4",
} as const;

export const nivoTheme = {
  background: "transparent",
  text: { fontSize: 11, fill: chartNeutrals.subtext, fontFamily: fontStack },
  axis: {
    domain: { line: { stroke: chartNeutrals.axis, strokeWidth: 1 } },
    ticks: {
      line: { stroke: chartNeutrals.axis, strokeWidth: 1 },
      text: { fill: chartNeutrals.subtext, fontSize: 10, fontFamily: fontStack },
    },
    legend: {
      text: {
        fill: chartNeutrals.subtext, fontSize: 11, fontWeight: 600,
        fontFamily: fontStack,
      },
    },
  },
  grid: { line: { stroke: chartNeutrals.grid, strokeWidth: 1 } },
  legends: {
    text: {
      fill: chartNeutrals.text, fontSize: 11, fontWeight: 600, fontFamily: fontStack,
    },
  },
  tooltip: {
    container: {
      background: "#FFFFFF",
      color: chartNeutrals.text,
      fontSize: 12,
      fontFamily: fontStack,
      borderRadius: 8,
      boxShadow: "0 4px 14px rgba(15,27,45,0.10)",
      padding: "8px 10px",
      border: `1px solid ${chartNeutrals.rule}`,
    },
  },
  annotations: {
    text: { fontSize: 11, fill: chartNeutrals.text, fontFamily: fontStack },
  },
};
