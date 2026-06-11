/* Work section — PRODUCTION (Direction B1)
   Responsive, with drag-and-drop image slots for real screenshots. */

function WorkSection() {
  const { filter, pick, selId, setSelId, sel, list, step, onKeyDown } = useBFeatured();
  const i = list.findIndex((w) => w.id === sel.id);
  const featStyle = {
    '--f-accent': sel.accent,
    '--f-top': window.wkTint(sel.hue, 0.165, 0.05),
    '--f-base': window.wkTint(sel.hue, 0.12, 0.04),
  };

  return (
    <div className="wk prod">
      <div className="wk-stars" />
      <div className="wk-content prod-inner">
        <WkNav />

        <div className="prod-head">
          <div>
            <span className="wk-eyebrow prod-eyebrow"><span className="dot" />Selected work · 2023—2026</span>
            <h1 className="wk-h1 prod-title">Selected <em>work</em></h1>
          </div>
          <span className="prod-kicker">Case studies &amp; projects</span>
        </div>

        <div className="prod-grid">
          {/* featured */}
          <div className="prod-feat" style={featStyle}>
            <div className="prod-vis">
              {WORK.map((p) => (
                <image-slot key={p.id} id={`work-shot-${p.id}`}
                  shape="rect" fit="cover"
                  placeholder="Drop a screenshot"
                  style={{ display: p.id === sel.id ? 'block' : 'none' }} />
              ))}
              <span className="prod-figtag">Fig · {sel.no}</span>
            </div>
            <div className="prod-feat-body">
              <div className="prod-feat-top">
                <BBadge p={sel} />
                <span className="bf-meta"><b>{sel.year}</b> · {bMeta(sel).role}</span>
              </div>
              <div className="bf-swap prod-swap" key={sel.id}>
                <h2 className="bf-title">{sel.title}</h2>
                <p className="bf-blurb">{sel.blurb}</p>
                <BHighlights p={sel} />
              </div>
              <div className="prod-feat-foot">
                <div className="bf-tagrow">{sel.stack.map((t) => <span key={t} className="wk-tag">{t}</span>)}</div>
                <BCtas p={sel} />
              </div>
            </div>
          </div>

          {/* index */}
          <div className="prod-index">
            <div className="prod-index-head">
              <span className="prod-index-label">Index</span>
            </div>
            <BFilters filter={filter} onPick={pick} keys={['all', 'case', 'project', '2026', '2025']} />
            <div className="prod-list bf-indexfocus" tabIndex={0} onKeyDown={onKeyDown} role="listbox" aria-label="Projects">
              {list.map((p) => (
                <button key={p.id} role="option" aria-selected={p.id === selId}
                  className={'prod-item' + (p.id === selId ? ' sel' : '')}
                  style={{ '--i-accent': p.accent, '--i-tint': window.wkTint(p.hue, 0.17, 0.045) }}
                  onMouseEnter={() => setSelId(p.id)} onClick={() => setSelId(p.id)}>
                  <span className="prod-item-no">{p.no}</span>
                  <span>
                    <span className="prod-item-name">{p.short || p.title}</span>
                    <span className="prod-item-sub">{p.type}</span>
                  </span>
                  <span className="prod-item-right">
                    <span className="prod-item-year">{p.year}</span>
                    <span className="prod-item-dot" />
                  </span>
                </button>
              ))}
            </div>
            <div className="prod-index-foot">
              <span className="bf-count">{String(i + 1).padStart(2, '0')} / {String(list.length).padStart(2, '0')}</span>
              <span className="bf-nav">
                <span className="prod-focushint"><kbd>↑</kbd><kbd>↓</kbd> to browse</span>
                <button className="bf-navbtn" aria-label="Previous project" onClick={() => step(-1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button className="bf-navbtn" aria-label="Next project" onClick={() => step(1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.WorkSection = WorkSection;
