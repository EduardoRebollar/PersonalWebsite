/* Hero — Orbital. Elliptical orbits (rx >> ry → pointed left/right).
   Rings + spokes in SVG. Planets + labels driven by a plain-JS rAF engine. */

const ORBIT_CFG = [
  { lbl: 'Economics',        rx: 430, ry: 265, sz: 4, dur: 16, dir:  1, phase: 305, sec: true,  lit: false, bd: '0s',   shape: 'crosshair' },
  { lbl: 'Machine Learning', rx: 490, ry: 298, sz: 7, dur: 30, dir: -1, phase:  25, sec: false, lit: true,  bd: '1.4s', shape: 'double'    },
  { lbl: 'Data',             rx: 545, ry: 328, sz: 5, dur: 21, dir:  1, phase: 150, sec: false, lit: true,  bd: '2.8s', shape: 'diamond'   },
  { lbl: 'The Web',          rx: 600, ry: 356, sz: 3, dur: 38, dir: -1, phase: 235, sec: false, lit: false, bd: '0.7s', shape: 'dot'       },
];

const CX_ORB = 720, CY_ORB = 430;

function HeroOrbital() {
  const dust = React.useMemo(() => {
    let s = 21; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    return Array.from({ length: 70 }, () => ({
      x: rnd() * 1440, y: rnd() * 860, r: 0.5 + rnd() * 1.5, o: 0.1 + rnd() * 0.45,
    }));
  }, []);

  return (
    <div className="hero orb">

      {/* ── SVG layer: stars + gradient defs + spokes ───────────── */}
      <svg className="orb-svg" viewBox="0 0 1440 860" preserveAspectRatio="xMidYMid slice">
        <defs>
          {ORBIT_CFG.map((o, i) => (
            <linearGradient key={'grad' + i} id={'spk-grad-' + i}
              gradientUnits="userSpaceOnUse"
              x1={CX_ORB} y1={CY_ORB} x2={CX_ORB} y2={CY_ORB - o.ry}>
              <stop offset="0%"   style={{ stopColor: o.sec ? 'var(--secondary)' : 'var(--accent)', stopOpacity: 0 }} />
              <stop offset="70%"  style={{ stopColor: o.sec ? 'var(--secondary)' : 'var(--accent)', stopOpacity: 0.28 }} />
              <stop offset="100%" style={{ stopColor: o.sec ? 'var(--secondary)' : 'var(--accent)', stopOpacity: 0.55 }} />
            </linearGradient>
          ))}
        </defs>

        {dust.map((d, i) => (
          <circle key={'d' + i} className="orb-dust" cx={d.x} cy={d.y} r={d.r} opacity={d.o} />
        ))}

        {/* spokes — stroke references the per-orbit gradient */}
        {ORBIT_CFG.map((o, i) => (
          <line key={'spoke' + i} className="orb-spoke-line"
            x1={CX_ORB} y1={CY_ORB} x2={CX_ORB} y2={CY_ORB}
            stroke={`url(#spk-grad-${i})`}
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* ── planet wraps + labels (rAF-positioned) ───────────────── */}
      <div className="orb-field">
        {ORBIT_CFG.map((o, i) => (
          <div key={'p' + i}
            className={'orb-planet-wrap ' + (o.sec ? 'sec ' : '') + o.shape}
            style={{ '--sz': o.sz, '--breathe-delay': o.bd }}
          >
            <span className="orb-body" />
          </div>
        ))}
        {ORBIT_CFG.map((o, i) => (
          <div key={'l' + i} className={'orb-label' + (o.sec ? ' sec' : '')}>
            {o.lbl}
          </div>
        ))}
      </div>

      <div className="orb-vign" />
      <HeroNav active="work" />

      <div className="orb-content">
        <Eyebrow>CS &amp; Economics — Occidental College</Eyebrow>
        <h1 className="orb-name"><span>Eduardo</span><span>Rebollar</span></h1>
        <p className="orb-tag"><span style={{ color: 'var(--accent)' }}>Four</span> Fields — <span style={{ color: 'var(--accent)' }}>One</span> Intersection.</p>
        <CTAs style={{ marginTop: 40, justifyContent: 'center' }} variant="accent" primaryLabel="See Work" ghostLabel="Get in Touch" />
        <ScrollCue />
      </div>

    </div>
  );
}
window.HeroOrbital = HeroOrbital;
