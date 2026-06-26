/* =============================================================================
   AI & Developer Wages — the three signature visualizations.
   Math ported verbatim from design-source/econ-wages/ew-shared.jsx. Each is a
   720-wide viewBox that scales to its container; all are static / deterministic
   so they render on the server (no client JS).
   ========================================================================== */
import { main, returnLines, netEffect, result, signed } from '@/content/data/econWages/caseStudy';

/* Scatter "regression cloud" behind Fig. 1 — illustrative only. ~90 points of
   seeded noise (deterministic LCG, seed 7) around each group's line, in data
   space (ai/x/y). Computed once at module load so it's pure and layout-agnostic;
   the chart maps each point to screen coordinates with its own scale. */
const HERO_CLOUD: { ai: boolean; x: number; y: number }[] = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const out: { ai: boolean; x: number; y: number }[] = [];
  for (let i = 0; i < 90; i++) {
    const ai = rnd() > 0.3;
    const x = rnd() * 40;
    const base = ai ? -0.148 + 0.033 * x : 0.02 * x;
    const y = base + (rnd() - 0.5) * 0.34;
    out.push({ ai, x, y });
  }
  return out;
})();

/* =============================================================================
   INTERACTION CHART (Fig. 1 / hero) — experience-return lines for AI vs non-AI.
   Two lines diverge from x=0 and cross at the break-even point (11.38 yrs).
   ========================================================================== */
export function InteractionChart({ height = 400, showCloud = true }: { height?: number; showCloud?: boolean }) {
  const W = 720;
  const H = height;
  const PL = 52;
  const PR = 150;
  const PT = 26;
  const PB = 44;
  const data = returnLines(40);
  const xmax = data.xmax;
  const ymin = -0.25;
  const ymax = 1.25;
  const sx = (x: number) => PL + (x / xmax) * (W - PL - PR);
  const sy = (y: number) => PT + (1 - (y - ymin) / (ymax - ymin)) * (H - PT - PB);
  const path = (arr: { x: number; y: number }[]) =>
    arr.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ');
  const bx = sx(data.breakeven);
  const byNon = sy(0.02 * data.breakeven);

  // Map the precomputed (illustrative) cloud to screen coordinates.
  const cloud = showCloud
    ? HERO_CLOUD.map((p) => ({
        x: sx(p.x),
        y: sy(Math.max(ymin + 0.02, Math.min(ymax - 0.02, p.y))),
        ai: p.ai,
      }))
    : [];

  const yticks = [0, 0.25, 0.5, 0.75, 1.0];
  const xticks = [0, 10, 20, 30, 40];

  return (
    <div
      className="ew-chart"
      role="img"
      aria-label="Wage premium vs years of experience. AI users start 14.8% lower but gain 3.3% per year versus 2.0% for non-AI users; the lines cross at 11.4 years."
    >
      <svg viewBox={`0 0 ${W} ${H}`}>
        {yticks.map((t) => (
          <g key={`y${t}`}>
            <line className="grid" x1={PL} y1={sy(t)} x2={W - PR} y2={sy(t)} />
            <text className="tick" x={PL - 9} y={sy(t) + 3} textAnchor="end">
              {(t * 100).toFixed(0)}%
            </text>
          </g>
        ))}
        <line className="axis" x1={PL} y1={sy(ymin)} x2={W - PR} y2={sy(ymin)} />
        <line className="zero" x1={PL} y1={sy(0)} x2={W - PR} y2={sy(0)} />
        {xticks.map((t) => (
          <text key={`x${t}`} className="tick" x={sx(t)} y={H - PB + 18} textAnchor="middle">
            {t}
          </text>
        ))}
        <text className="axlbl" x={(PL + W - PR) / 2} y={H - 6} textAnchor="middle">
          Years of professional experience
        </text>
        <text
          className="axlbl"
          transform={`translate(16 ${(PT + H - PB) / 2}) rotate(-90)`}
          textAnchor="middle"
        >
          Wage premium · log pts
        </text>

        {showCloud &&
          cloud.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={2.1}
              fill={p.ai ? 'var(--accent)' : 'var(--fg-dim)'}
              opacity={p.ai ? 0.32 : 0.22}
            />
          ))}

        {/* break-even marker */}
        <line className="xmark" x1={bx} y1={sy(ymax)} x2={bx} y2={sy(ymin)} />
        <circle cx={bx} cy={byNon} r={4.5} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <text className="crosslab" x={bx} y={sy(ymax) - 6} textAnchor="middle">
          break-even · 11.4 yrs
        </text>

        {/* the two lines */}
        <path className="lineNon" d={path(data.nonAi)} />
        <path className="lineAi" d={path(data.ai)} />

        {/* endpoints + series labels */}
        <circle className="dot-non" cx={sx(40)} cy={sy(0.02 * 40)} r={4} />
        <circle className="dot-ai" cx={sx(40)} cy={sy(-0.148 + 0.033 * 40)} r={4.5} />
        <g transform={`translate(${W - PR + 14}, ${sy(-0.148 + 0.033 * 40)})`}>
          <text className="serieslab" x={0} y={-2} fill="var(--accent)" fontWeight="600">
            AI users
          </text>
          <text className="serieslab" x={0} y={14} fill="var(--fg-dim)" style={{ fontSize: 9.5 }}>
            +3.3% / yr
          </text>
        </g>
        <g transform={`translate(${W - PR + 14}, ${sy(0.02 * 40)})`}>
          <text className="serieslab" x={0} y={-2} fill="var(--fg-mute)">
            Non-AI
          </text>
          <text className="serieslab" x={0} y={14} fill="var(--fg-dim)" style={{ fontSize: 9.5 }}>
            +2.0% / yr
          </text>
        </g>
      </svg>
    </div>
  );
}

/* =============================================================================
   NET-EFFECT CHART (Fig. 2) — total AI effect on wage by experience.
   net(x) = -0.148 + 0.013·x ; shaded negative below 11.38, positive above.
   ========================================================================== */
export function NetEffectChart({ height = 320 }: { height?: number }) {
  const W = 720;
  const H = height;
  const PL = 56;
  const PR = 24;
  const PT = 24;
  const PB = 46;
  const xmax = 40;
  const ymin = -0.18;
  const ymax = 0.4;
  const sx = (x: number) => PL + (x / xmax) * (W - PL - PR);
  const sy = (y: number) => PT + (1 - (y - ymin) / (ymax - ymin)) * (H - PT - PB);
  const be = result.breakeven;

  const pts: { x: number; y: number }[] = [];
  for (let x = 0; x <= xmax; x += 0.5) pts.push({ x, y: netEffect(x) });
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ');

  const negPts = pts.filter((p) => p.x <= be);
  const posPts = pts.filter((p) => p.x >= be);
  const areaNeg =
    `M${sx(0)} ${sy(0)} ` +
    negPts.map((p) => `L${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ') +
    ` L${sx(be)} ${sy(0)} Z`;
  const areaPos =
    `M${sx(be)} ${sy(0)} ` +
    posPts.map((p) => `L${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ') +
    ` L${sx(xmax)} ${sy(0)} Z`;

  const yticks = [-0.1, 0, 0.1, 0.2, 0.3];

  return (
    <div
      className="ew-chart"
      role="img"
      aria-label="Net AI wage effect by experience: negative below 11.4 years, positive above."
    >
      <svg viewBox={`0 0 ${W} ${H}`}>
        <path className="areaNeg" d={areaNeg} />
        <path className="areaPos" d={areaPos} />
        {yticks.map((t) => (
          <g key={t}>
            <line className={t === 0 ? 'zero' : 'grid'} x1={PL} y1={sy(t)} x2={W - PR} y2={sy(t)} />
            <text className="tick" x={PL - 9} y={sy(t) + 3} textAnchor="end">
              {t > 0 ? '+' : ''}
              {(t * 100).toFixed(0)}%
            </text>
          </g>
        ))}
        {[0, 10, 20, 30, 40].map((t) => (
          <text key={t} className="tick" x={sx(t)} y={H - PB + 18} textAnchor="middle">
            {t}
          </text>
        ))}
        <text className="axlbl" x={(PL + W - PR) / 2} y={H - 6} textAnchor="middle">
          Years of professional experience
        </text>

        <line className="xmark" x1={sx(be)} y1={sy(ymax)} x2={sx(be)} y2={sy(ymin)} />
        <text className="crosslab" x={sx(be) + 6} y={sy(ymax) + 6} textAnchor="start">
          11.38 yrs
        </text>
        <text className="tick" x={sx(4)} y={sy(-0.13)} fill="var(--neg)" textAnchor="middle">
          AI users earn less
        </text>
        <text className="tick" x={sx(30)} y={sy(0.34)} fill="var(--accent)" textAnchor="middle">
          AI users earn more
        </text>

        <path className="netLine" d={line} />
      </svg>
    </div>
  );
}

/* =============================================================================
   COEFFICIENT FOREST (Fig. 3) — every coefficient with its 95% CI on one scale.
   Country dwarfs the rest by design; value labels keep the small ones legible.
   ========================================================================== */
export function CoeffForest({ height = 300 }: { height?: number }) {
  const rows = main.rows;
  const W = 720;
  const rowH = (height - 30) / rows.length;
  const PL = 150;
  const PR = 92;
  const PT = 14;
  const xmin = -0.3;
  const xmax = 1.45;
  const sx = (x: number) => PL + ((x - xmin) / (xmax - xmin)) * (W - PL - PR);

  return (
    <div
      className="ew-chart ew-forest"
      role="img"
      aria-label="Forest plot of all regression coefficients with 95% confidence intervals."
    >
      <svg viewBox={`0 0 ${W} ${height}`}>
        <line className="zero" x1={sx(0)} y1={PT - 4} x2={sx(0)} y2={PT + rows.length * rowH} />
        {[-0.2, 0, 0.5, 1.0].map((t) => (
          <text key={t} className="tick" x={sx(t)} y={height - 4} textAnchor="middle">
            {t > 0 ? '+' : ''}
            {t}
          </text>
        ))}
        {rows.map((r, i) => {
          const y = PT + i * rowH + rowH / 2;
          const lo = r.b - 1.96 * r.se;
          const hi = r.b + 1.96 * r.se;
          const cls = r.interest ? 'interest' : r.sig ? 'sig' : '';
          return (
            <g key={r.key}>
              <text className="rowlab" x={10} y={y + 4}>
                {r.label}
              </text>
              <line className="stem" x1={PL} y1={y} x2={W - PR} y2={y} opacity="0.4" />
              <line className={`ci ${r.sig ? 'sig' : ''}`} x1={sx(lo)} y1={y} x2={sx(hi)} y2={y} />
              <line className={`ci ${r.sig ? 'sig' : ''}`} x1={sx(lo)} y1={y - 4} x2={sx(lo)} y2={y + 4} />
              <line className={`ci ${r.sig ? 'sig' : ''}`} x1={sx(hi)} y1={y - 4} x2={sx(hi)} y2={y + 4} />
              <circle className={`pt ${cls}`} cx={sx(r.b)} cy={y} r={r.interest ? 5 : 4} />
              <text className="rowval" x={W - PR + 10} y={y + 4} textAnchor="start">
                {signed(r.b)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
