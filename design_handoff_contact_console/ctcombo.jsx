/* ctcombo.jsx — combined directions (#1 status panel + list  ·  #3 form)
   Shared modules: StatusCard, ChannelList, MsgForm, useMailForm
   Directions: CT5 (rail + form) · CT6 (form hero + sidebar) · CT7 (console) */

function StatusCard({ compact = false, bare = false, twoLine = false }) {
  return (
    <aside className={'cc-status' + (compact ? ' compact' : '') + (bare ? ' bare' : '')}>
      <div className="cc-status-top">
        <span className="ct-live" /><span className="lbl">Available</span>
        <span className="meta">Status</span>
      </div>
      <p className="cc-status-h">{twoLine ? <>Open to new<br />opportunities</> : 'Open to new opportunities'}</p>
      {!compact && <p className="cc-status-sub">Internships · full-time · collaborations</p>}
      <div className="cc-stats">
        <div className="cc-stat"><span className="ic">{CICONS.pin}</span>
          <span className="k">Based in</span><span className="v">{CONTACT.location}</span></div>
        <div className="cc-stat"><span className="ic">{CICONS.clock}</span>
          <span className="k">Local time</span><span className="v mono"><LiveClock /></span></div>
        <div className="cc-stat"><span className="ic">{CICONS.bolt}</span>
          <span className="k">Replies in</span><span className="v">{CONTACT.response}</span></div>
        {!compact && (
          <div className="cc-stat"><span className="ic">{CICONS.send}</span>
            <span className="k">Focus</span><span className="v">{CONTACT.focus}</span></div>
        )}
      </div>
    </aside>
  );
}

function ChannelList({ noborder = false }) {
  const [copied, copy] = useCopied();
  return (
    <div className={'cc-list' + (noborder ? ' noborder' : '')}>
      {CONTACT.channels.map((c) => {
        const isCopy = c.kind === 'copy';
        const done = copied === c.id;
        const actionIcon = c.kind === 'copy' ? CICONS.copy : c.kind === 'download' ? CICONS.download : CICONS.ext;
        return (
          <a key={c.id} className="cc-row" href={c.href}
            target={c.kind === 'ext' ? '_blank' : undefined} rel="noreferrer"
            onClick={isCopy ? (e) => { e.preventDefault(); copy(c.id, c.value); } : undefined}>
            <span className="cc-rlabel"><span className="ic">{CICONS[c.icon]}</span>{c.label}</span>
            <span className="cc-rval">{c.value}</span>
            <span className="cc-raction">
              {done ? <span className="ct-copied">{CICONS.check} Copied</span>
                    : (<>{c.action} {actionIcon}</>)}
            </span>
          </a>
        );
      })}
    </div>
  );
}

function useMailForm() {
  const [f, setF] = React.useState({ name: '', email: '', msg: '' });
  const [sent, setSent] = React.useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const send = (e) => {
    if (e) e.preventDefault();
    setSent(true);
    const url = `mailto:${CONTACT.channels[0].value}?subject=${encodeURIComponent('Hello from ' + (f.name || 'your site'))}&body=${encodeURIComponent(f.msg + (f.email ? `\n\n— ${f.name} (${f.email})` : ''))}`;
    try { window.open(url, '_blank'); } catch (er) {}
    setTimeout(() => setSent(false), 2600);
  };
  return { f, set, sent, send };
}

function MsgForm({ bare = false, head = null }) {
  const { f, set, sent, send } = useMailForm();
  return (
    <form className={'cc-form' + (bare ? ' bare' : '')} onSubmit={send}>
      {head && (
        <div className="cc-form-head">
          <p className="t">{head.t}</p>
          {head.s && <p className="s">{head.s}</p>}
        </div>
      )}
      <div className="cc-fields">
        <div className="cc-field">
          <label>Your name</label>
          <input className="cc-input" placeholder="Jane Doe" value={f.name} onChange={set('name')} />
        </div>
        <div className="cc-field">
          <label>Email</label>
          <input className="cc-input" type="email" placeholder="jane@company.com" value={f.email} onChange={set('email')} />
        </div>
        <div className="cc-field full msg">
          <label>Message</label>
          <textarea className="cc-input" placeholder="Tell me about the role, project, or idea…" value={f.msg} onChange={set('msg')} />
        </div>
      </div>
      <div className="cc-submit">
        <button className={'cc-btn' + (sent ? ' sent' : '')} type="submit">
          {sent ? <>{CICONS.check} Opening mail…</> : <>Send message {CICONS.arrow}</>}
        </button>
        <span className="cc-formnote">or email <a href={CONTACT.channels[0].href}>{CONTACT.channels[0].value}</a></span>
      </div>
    </form>
  );
}

/* ---------------- CT5 — Studio: info rail (status + list) | form ---------------- */
function CT5() {
  return (
    <div className="hero cc5">
      <div className="h-stars" />
      <HeroNav active="contact" />
      <div className="cc5-grid">
        <div className="cc5-rail ct-rise" style={{ animationDelay: '.06s' }}>
          <StatusCard twoLine />
          <ChannelList />
        </div>
        <div className="cc5-main">
          <div className="cc5-head">
            <div className="cc5-eyebrow ct-fade"><Eyebrow>Contact</Eyebrow></div>
            <h1 className="cc-h ct-rise" style={{ animationDelay: '.04s' }}>Let's <i>talk.</i></h1>
            <p className="cc5-blurb cc-blurb ct-rise" style={{ animationDelay: '.1s' }}>{CONTACT.blurb}</p>
          </div>
          <div className="ct-rise" style={{ animationDelay: '.16s', flex: 1, display: 'flex' }}>
            <MsgForm head={{ t: 'Send a message', s: 'I read every one' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- CT6 — Form hero + status/list sidebar ---------------- */
function CT6() {
  return (
    <div className="hero cc6">
      <div className="h-stars" />
      <HeroNav active="contact" />
      <div className="cc6-head">
        <div>
          <div className="cc6-eyebrow ct-fade"><Eyebrow>Contact</Eyebrow></div>
          <h1 className="cc-h ct-rise" style={{ animationDelay: '.04s' }}>Get in <i>touch.</i></h1>
        </div>
        <p className="cc6-blurb cc-blurb ct-rise" style={{ animationDelay: '.1s' }}>{CONTACT.blurb}</p>
      </div>
      <div className="cc6-grid">
        <div className="ct-rise" style={{ animationDelay: '.16s', display: 'flex' }}>
          <MsgForm head={{ t: 'Drop me a line', s: 'Replies in ' + CONTACT.response }} />
        </div>
        <div className="cc6-side ct-rise" style={{ animationDelay: '.22s' }}>
          <StatusCard compact twoLine />
          <ChannelList />
        </div>
      </div>
    </div>
  );
}

/* ---------------- CT7 — Unified contact console (single panel) ---------------- */
function CT7() {
  return (
    <div className="hero cc7">
      <div className="h-stars" />
      <HeroNav active="contact" />
      <div className="cc7-head">
        <div>
          <div className="cc7-eyebrow ct-fade"><Eyebrow>Contact</Eyebrow></div>
          <h1 className="cc-h ct-rise" style={{ animationDelay: '.04s' }}>Start a <i>conversation.</i></h1>
        </div>
        <span className="cc7-avail ct-fade"><span className="ct-live" />{CONTACT.status} · replies in {CONTACT.response}</span>
      </div>
      <div className="cc7-panel ct-rise" style={{ animationDelay: '.14s' }}>
        <div className="cc7-left">
          <MsgForm bare head={{ t: 'Send a message', s: 'Name · email · message' }} />
        </div>
        <div className="cc7-divider" />
        <div className="cc7-right">
          <StatusCard bare />
          <div className="cc-listhead">Or reach me directly</div>
          <ChannelList noborder />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StatusCard, ChannelList, MsgForm, useMailForm, CT5, CT6, CT7 });
