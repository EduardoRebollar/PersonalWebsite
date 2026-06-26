'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { returnLines, netEffect, result } from '@/content/data/econWages/caseStudy';

/* =============================================================================
   Fig. 2 · "Two Returns to Experience" — interactive companion to the lead story.
   Drag across the chart (or use the slider) to set years of professional
   experience; both trend lines are read off live — AI users (−0.148 + 0.033·Exp)
   and non-AI (0.020·Exp) — along with the gap between them (which is the net AI
   effect, netEffect(x), zero at the 11.38-yr break-even). Mirrors the LeadStory
   island's structure + styling (reuses the .ew-lead-* classes). The scatter cloud
   is illustrative (seeded noise), exactly as in the static InteractionChart.
   ========================================================================== */

const EXP_MIN = 0;
const EXP_MAX = 40;
const BE = result.breakeven; // 11.38
/** Break-even as a fraction of the slider track (for the red→violet split). */
const BE_FRAC = ((BE - EXP_MIN) / (EXP_MAX - EXP_MIN)) * 100;

/* ---- chart geometry (viewBox units) ---- */
const W = 640;
const H = 320;
const PL = 52;
const PR = 96;
const PT = 26;
const PB = 44;
const XMAX = 40;
const YMIN = -0.25;
const YMAX = 1.25;

const sx = (x: number) => PL + (x / XMAX) * (W - PL - PR);
const sy = (y: number) => PT + (1 - (y - YMIN) / (YMAX - YMIN)) * (H - PT - PB);

const aiAt = (x: number) => -0.148 + 0.033 * x;
const nonAt = (x: number) => 0.02 * x;

const fmtYr = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2));
const pct = (v: number) => (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(1) + '%';

const Y_TICKS = [0, 0.25, 0.5, 0.75, 1.0];
const X_TICKS = [0, 10, 20, 30, 40];

/* Illustrative regression cloud — ~90 points of seeded noise (deterministic LCG,
   seed 7) around each group's line, in data space. Mirrors charts.tsx so the two
   renderings agree; computed once at module load (pure). */
const CLOUD: { ai: boolean; x: number; y: number }[] = (() => {
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const out: { ai: boolean; x: number; y: number }[] = [];
  for (let i = 0; i < 90; i++) {
    const ai = rnd() > 0.3;
    const x = rnd() * 40;
    const base = ai ? aiAt(x) : nonAt(x);
    out.push({ ai, x, y: base + (rnd() - 0.5) * 0.34 });
  }
  return out;
})();

type Preset = { label: string; yr: number; hideYr?: boolean };
const PRESETS: Preset[] = [
  { label: 'Junior', yr: 2 },
  { label: 'Early', yr: 6 },
  { label: 'Break-even', yr: BE, hideYr: true },
  { label: 'Senior', yr: 20 },
  { label: 'Staff', yr: 35 },
];

export function ExperiencePlate() {
  const [exp, setExp] = useState(8);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  /** Map a pointer's clientX to a whole-year experience value, clamped. The SVG
      fills its box width-for-width (viewBox 0..W ↔ 0..rect.width, no letterbox). */
  const expFromClientX = (clientX: number): number => {
    const svg = svgRef.current;
    if (!svg) return exp;
    const rect = svg.getBoundingClientRect();
    const vbX = ((clientX - rect.left) / rect.width) * W;
    const xData = ((vbX - PL) / (W - PL - PR)) * XMAX;
    return Math.max(EXP_MIN, Math.min(EXP_MAX, Math.round(xData)));
  };

  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setExp(expFromClientX(e.clientX));
  };
  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    setExp(expFromClientX(e.clientX));
  };
  const endDrag = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const data = returnLines(40);
  const linePath = (arr: { x: number; y: number }[]) =>
    arr.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(' ');

  const aiY = aiAt(exp);
  const nonY = nonAt(exp);
  const gap = netEffect(exp); // = aiY − nonY (the net AI effect)
  const gapPct = Math.round(gap * 1000) / 10; // round to displayed precision first
  const even = gapPct === 0;
  const ahead = gapPct > 0;

  const cloud = CLOUD.map((p) => ({
    cx: sx(p.x),
    cy: sy(Math.max(YMIN + 0.02, Math.min(YMAX - 0.02, p.y))),
    ai: p.ai,
  }));

  const bx = sx(BE);
  const xx = sx(exp);
  const aiDotY = sy(aiY);
  const nonDotY = sy(nonY);

  return (
    <div className="ew-lead">
      <div className="ew-lead-grid">
        {/* ---- left: story + control ---- */}
        <div className="ew-lead-story">
          <div className="ew-lead-meta">
            <span className="ew-lead-badge">Fig. 2 · Interactive</span>
            <span className="ew-lead-live">
              <span className="dot" aria-hidden="true" />
              Live · Drag to set experience
            </span>
          </div>

          <h3 className="ew-lead-head">
            At <em className={ahead ? 'pos' : 'neg'}>{fmtYr(exp)}</em>{' '}
            {exp === 1 ? 'year' : 'years'},{' '}
            {even ? (
              <>
                the two paths <em className="pos">draw even</em>.
              </>
            ) : (
              <>
                AI users sit <em className={ahead ? 'pos' : 'neg'}>{pct(gap)}</em>{' '}
                {ahead ? 'ahead' : 'behind'}.
              </>
            )}
          </h3>

          <p className="ew-lead-body">
            Two returns to experience. AI users open <b>14.8% behind</b> but climb <b>3.3%/yr</b>{' '}
            against <b>2.0%/yr</b> for non-AI users — overtaking them at the <b>11.4-year</b>{' '}
            break-even.
          </p>

          {/* live readout: each line + the gap at the current tenure */}
          <div className="ew-plate-readout">
            <div className="cell">
              <div className="k ai">AI users</div>
              <div className="v">{pct(aiY)}</div>
            </div>
            <div className="cell">
              <div className="k non">Non-AI</div>
              <div className="v">{pct(nonY)}</div>
            </div>
            <div className="cell">
              <div className="k">Gap</div>
              <div className={`v ${ahead ? 'pos' : even ? '' : 'neg'}`}>
                {even ? '±0.0%' : pct(gap)}
              </div>
            </div>
          </div>

          <div className="ew-lead-slider">
            <div className="ew-lead-sliderhead">
              <span className="ew-lead-sliderlbl">Years of experience</span>
              <span className="ew-lead-val">
                {fmtYr(exp)}
                <span>yr</span>
              </span>
            </div>
            <input
              className="ew-lead-range"
              type="range"
              min={EXP_MIN}
              max={EXP_MAX}
              step={1}
              value={exp}
              onChange={(e) => setExp(Number(e.target.value))}
              aria-label="Years of professional experience"
              aria-valuetext={
                even
                  ? `${fmtYr(exp)} years — AI and non-AI users draw even`
                  : `${fmtYr(exp)} years — AI users ${pct(gap)} ${ahead ? 'ahead of' : 'behind'} non-AI users`
              }
              style={{
                background: `linear-gradient(90deg, var(--neg) 0%, var(--neg) ${BE_FRAC}%, var(--accent) ${BE_FRAC}%, var(--accent) 100%)`,
              }}
            />
            <div className="ew-lead-ticks">
              {[0, 10, 20, 30, 40].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ---- right: live chart ---- */}
        <div className="ew-lead-chartwrap">
          <div className="ew-chart ew-lead-chart ew-plate-chart">
            <svg
              ref={svgRef}
              className={`ew-lead-svg${dragging ? ' is-dragging' : ''}`}
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={`Wage premium versus years of experience, AI users versus non-AI users. At ${fmtYr(exp)} years AI users are at ${pct(aiY)} and non-AI users at ${pct(nonY)}; the lines cross at ${BE} years. Drag left or right to change experience.`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {/* gridlines + y labels */}
              {Y_TICKS.map((t) => (
                <g key={t}>
                  <line className="grid" x1={PL} y1={sy(t)} x2={W - PR} y2={sy(t)} />
                  <text className="tick" x={PL - 9} y={sy(t) + 3} textAnchor="end">
                    {(t * 100).toFixed(0)}%
                  </text>
                </g>
              ))}
              <line className="zero" x1={PL} y1={sy(0)} x2={W - PR} y2={sy(0)} />

              {/* x ticks + axis labels */}
              {X_TICKS.map((t) => (
                <text key={t} className="tick" x={sx(t)} y={H - PB + 18} textAnchor="middle">
                  {t}
                </text>
              ))}
              <text className="axlbl" x={(PL + W - PR) / 2} y={H - 6} textAnchor="middle">
                Years of professional experience
              </text>
              <text
                className="axlbl"
                transform={`translate(0 ${(PT + H - PB) / 2}) rotate(-90)`}
                textAnchor="middle"
              >
                Wage premium · log pts
              </text>

              {/* illustrative scatter cloud */}
              {cloud.map((p, i) => (
                <circle
                  key={i}
                  cx={p.cx}
                  cy={p.cy}
                  r={2.1}
                  fill={p.ai ? 'var(--accent)' : 'var(--fg-dim)'}
                  opacity={p.ai ? 0.32 : 0.22}
                />
              ))}

              {/* break-even marker */}
              <line className="xmark" x1={bx} y1={sy(YMAX)} x2={bx} y2={sy(YMIN)} />
              <text className="crosslab" x={bx} y={sy(YMAX) - 6} textAnchor="middle">
                break-even · 11.4 yrs
              </text>

              {/* the two relations */}
              <path className="lineNon" d={linePath(data.nonAi)} />
              <path className="lineAi" d={linePath(data.ai)} />

              {/* endpoint dots + series labels */}
              <circle className="dot-non" cx={sx(40)} cy={sy(nonAt(40))} r={4} />
              <circle className="dot-ai" cx={sx(40)} cy={sy(aiAt(40))} r={4.5} />
              <g transform={`translate(${W - PR + 14}, ${sy(aiAt(40))})`}>
                <text className="serieslab" x={0} y={-2} fill="var(--accent)" fontWeight="600">
                  AI users
                </text>
                <text
                  className="serieslab"
                  x={0}
                  y={14}
                  fill="var(--fg-dim)"
                  style={{ fontSize: 11 }}
                >
                  +3.3% / yr
                </text>
              </g>
              <g transform={`translate(${W - PR + 14}, ${sy(nonAt(40))})`}>
                <text className="serieslab" x={0} y={-2} fill="var(--fg-mute)">
                  Non-AI
                </text>
                <text
                  className="serieslab"
                  x={0}
                  y={14}
                  fill="var(--fg-dim)"
                  style={{ fontSize: 11 }}
                >
                  +2.0% / yr
                </text>
              </g>

              {/* ---- live scrubber (drag-handle) ---- */}
              <line className="ew-plate-scrub" x1={xx} y1={PT - 4} x2={xx} y2={sy(YMIN)} />
              {/* gap segment between the two lines, tinted by sign */}
              <line
                className={`ew-lead-conn ${ahead ? 'pos' : 'neg'}`}
                x1={xx}
                y1={nonDotY}
                x2={xx}
                y2={aiDotY}
              />
              {/* non-AI marker (grey) */}
              <circle className="ew-lead-halo non" cx={xx} cy={nonDotY} r={dragging ? 12 : 9} />
              <circle className="ew-lead-dot non" cx={xx} cy={nonDotY} r={5} />
              {/* AI marker (violet above break-even, red below) */}
              <circle
                className={`ew-lead-halo${ahead ? '' : ' neg'}`}
                cx={xx}
                cy={aiDotY}
                r={dragging ? 13 : 10}
              />
              <circle
                className={`ew-lead-dot${ahead ? '' : ' neg'}`}
                cx={xx}
                cy={aiDotY}
                r={5.5}
              />
            </svg>
          </div>
          <p className="ew-lead-eq">AI = −0.148 + 0.033·Exp · Non-AI = 0.020·Exp</p>
        </div>
      </div>

      <div className="ew-lead-jump">
        <span className="ew-lead-jumplbl">Jump</span>
        <div className="ew-lead-jumprow">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={`ew-lead-chip${exp === p.yr ? ' is-active' : ''}`}
              aria-pressed={exp === p.yr}
              onClick={() => setExp(p.yr)}
            >
              {p.hideYr ? p.label : `${p.label} · ${p.yr}yr`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
