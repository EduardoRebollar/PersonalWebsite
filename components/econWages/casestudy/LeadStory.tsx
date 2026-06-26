'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { netEffect, result } from '@/content/data/econWages/caseStudy';

/* =============================================================================
   Fig. 1 · "Wages & the Machine" — interactive lead story.
   A drag-to-set-experience widget: the slider on the left sets years of
   professional experience; the headline and the chart's marker update live to
   the total AI wage effect at that tenure, net(x) = β₁ + β₃·Exp = -0.148 +
   0.013·Exp (zero at 11.38 yrs). Exact port of the design artifact of the same
   name. Client component (the only interactive island in the broadsheet).
   ========================================================================== */

const EXP_MIN = 1;
const EXP_MAX = 40;
const BE = result.breakeven; // 11.38

/** Break-even as a fraction of the slider track (for the red→violet split). */
const BE_FRAC = ((BE - EXP_MIN) / (EXP_MAX - EXP_MIN)) * 100;

/* ---- chart geometry (viewBox units) ---- */
const W = 560;
const H = 300;
const PL = 54;
const PR = 20;
const PT = 24;
const PB = 44;
const XMAX = 40;
const YMIN = -0.18;
const YMAX = 0.4;

const sx = (x: number) => PL + (x / XMAX) * (W - PL - PR);
const sy = (y: number) => PT + (1 - (y - YMIN) / (YMAX - YMIN)) * (H - PT - PB);

/** Years readout: whole years bare, the fractional break-even to two places. */
const fmtYr = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2));

const Y_TICKS = [-0.1, 0, 0.1, 0.2, 0.3];
const X_TICKS = [0, 10, 20, 30, 40];

/** Quick-jump presets below the slider (Break-even lands on the exact crossing). */
type Preset = { label: string; yr: number; hideYr?: boolean };
const PRESETS: Preset[] = [
  { label: 'Junior', yr: 1 },
  { label: 'Early', yr: 3 },
  { label: 'Break-even', yr: BE, hideYr: true },
  { label: 'Senior', yr: 20 },
  { label: 'Staff', yr: 35 },
];

export function LeadStory() {
  const [exp, setExp] = useState(13);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  /** Map a pointer's clientX to a whole-year experience value, clamped. The SVG
      fills its box width-for-width (viewBox 0..W ↔ 0..rect.width, no letterbox),
      so the x fraction across the element is the x fraction across the viewBox. */
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

  const net = netEffect(exp); // log-pts ≈ proportional wage effect
  // Round to the displayed precision first, so the exact crossing reads as a
  // clean "breaks even" rather than a stray "−0.0% less".
  const pctRounded = Math.round(net * 1000) / 10; // one decimal place
  const breakeven = pctRounded === 0;
  const premium = pctRounded > 0;
  const negative = pctRounded < 0; // drives the red (penalty) tone
  const pctStr = (premium ? '+' : '−') + Math.abs(pctRounded).toFixed(1) + '%';

  // static line endpoints (the relation is linear in x)
  const net0 = netEffect(0);
  const net40 = netEffect(XMAX);
  const line = `M${sx(0)} ${sy(net0).toFixed(1)} L${sx(XMAX)} ${sy(net40).toFixed(1)}`;
  // signed regions: penalty triangle (x≤BE, below zero) and premium triangle (x≥BE, above)
  const areaNeg = `M${sx(0)} ${sy(0)} L${sx(0)} ${sy(net0).toFixed(1)} L${sx(BE).toFixed(1)} ${sy(0)} Z`;
  const areaPos = `M${sx(BE).toFixed(1)} ${sy(0)} L${sx(XMAX)} ${sy(net40).toFixed(1)} L${sx(XMAX)} ${sy(0)} Z`;

  const dotX = sx(exp);
  const dotY = sy(net);

  return (
    <div className="ew-lead">
      <div className="ew-lead-grid">
        {/* ---- left: story + control ---- */}
        <div className="ew-lead-story">
          <div className="ew-lead-meta">
            <span className="ew-lead-badge">Lead Story</span>
            <span className="ew-lead-live">
              <span className="dot" aria-hidden="true" />
              Live · Drag to set experience
            </span>
          </div>

          <h3 className="ew-lead-head">
            At <em className={negative ? 'neg' : 'pos'}>{fmtYr(exp)}</em>{' '}
            {exp === 1 ? 'year' : 'years'},{' '}
            {breakeven ? (
              <>
                AI use <em className="pos">breaks even</em>.
              </>
            ) : (
              <>
                AI use is worth <em className={negative ? 'neg' : 'pos'}>{pctStr}</em>{' '}
                {premium ? 'more' : 'less'}.
              </>
            )}
          </h3>

          <p className="ew-lead-body">
            The total AI wage effect bends with tenure. It opens as a <b>14.8% penalty</b> at the
            start of a career and turns into a premium at <b>11.4 years</b> — the benefit pools among
            seniors.
          </p>

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
                breakeven
                  ? `${fmtYr(exp)} years — AI use roughly breaks even`
                  : `${fmtYr(exp)} years — AI use worth ${pctStr} ${premium ? 'more' : 'less'}`
              }
              style={{
                background: `linear-gradient(90deg, var(--neg) 0%, var(--neg) ${BE_FRAC}%, var(--accent) ${BE_FRAC}%, var(--accent) 100%)`,
              }}
            />
            <div className="ew-lead-ticks">
              {[1, 10, 20, 30, 40].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ---- right: live chart ---- */}
        <div className="ew-lead-chartwrap">
          <div className="ew-chart ew-lead-chart">
            <svg
              ref={svgRef}
              className={`ew-lead-svg${dragging ? ' is-dragging' : ''}`}
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={`Total AI wage effect by experience. At ${fmtYr(exp)} years the effect is ${breakeven ? 'about zero' : pctStr}; it crosses zero at ${BE} years. Drag left or right to change experience.`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {/* signed fills */}
              <path className="areaNeg" d={areaNeg} />
              <path className="areaPos" d={areaPos} />

              {/* gridlines + y labels */}
              {Y_TICKS.map((t) => (
                <g key={t}>
                  <line
                    className={t === 0 ? 'zero' : 'grid'}
                    x1={PL}
                    y1={sy(t)}
                    x2={W - PR}
                    y2={sy(t)}
                  />
                  <text className="tick" x={PL - 9} y={sy(t) + 3} textAnchor="end">
                    {t > 0 ? '+' : ''}
                    {(t * 100).toFixed(0)}%
                  </text>
                </g>
              ))}

              {/* x ticks + axis label */}
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
                transform={`translate(8 ${(PT + H - PB) / 2}) rotate(-90)`}
                textAnchor="middle"
              >
                Total AI effect · log pts
              </text>

              {/* region captions — dark-outlined so the net line can't obscure them */}
              <text
                className="tick ew-lead-zonelab"
                x={sx(30)}
                y={sy(0.33)}
                fill="var(--accent)"
                textAnchor="middle"
              >
                AI users earn more
              </text>
              <text
                className="tick ew-lead-zonelab"
                x={sx(6.5)}
                y={sy(-0.15)}
                fill="var(--neg)"
                textAnchor="middle"
              >
                AI users earn less
              </text>

              {/* break-even marker */}
              <line className="xmark" x1={sx(BE)} y1={PT - 6} x2={sx(BE)} y2={sy(YMIN)} />
              <text className="crosslab" x={sx(BE)} y={PT - 10} textAnchor="middle">
                {BE} yrs
              </text>

              {/* the relation */}
              <path className="netLine" d={line} />

              {/* live marker (drag-handle) */}
              <line
                className={negative ? 'ew-lead-conn neg' : 'ew-lead-conn pos'}
                x1={dotX}
                y1={sy(0)}
                x2={dotX}
                y2={dotY}
              />
              <circle
                className={`ew-lead-halo${negative ? ' neg' : ''}`}
                cx={dotX}
                cy={dotY}
                r={dragging ? 13 : 10}
              />
              <circle
                className={negative ? 'ew-lead-dot neg' : 'ew-lead-dot'}
                cx={dotX}
                cy={dotY}
                r={5.5}
              />
            </svg>
          </div>
          <p className="ew-lead-eq">Total AI effect = β₁ + β₃·Exp</p>
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
