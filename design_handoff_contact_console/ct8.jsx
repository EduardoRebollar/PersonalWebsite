/* ct8.jsx — Unified Console (expanded). Selected direction #7, built out.
   Reuses StatusCard + ChannelList from ctcombo.jsx (loaded before this). */

const CT8_REASONS = ['Internship', 'Full-time role', 'Freelance / project', 'Just saying hi'];

function CT8() {
  const [reason, setReason] = React.useState(null);
  const [f, setF] = React.useState({ name: '', email: '', msg: '' });
  const [sent, setSent] = React.useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const subjectFor = () => {
    const r = reason ? `[${reason}] ` : '';
    return `${r}Hello from ${f.name || 'your site'}`;
  };
  const send = (e) => {
    if (e) e.preventDefault();
    const url = `mailto:${CONTACT.channels[0].value}?subject=${encodeURIComponent(subjectFor())}&body=${encodeURIComponent(f.msg + (f.email ? `\n\n— ${f.name} (${f.email})` : ''))}`;
    try {window.open(url, '_blank');} catch (er) {}
    setSent(true);
  };
  const reset = () => {setSent(false);setF({ name: '', email: '', msg: '' });setReason(null);};
  const onKey = (e) => {if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {e.preventDefault();send();}};

  return (
    <div className="hero cc8">
      <div className="h-stars" />
      <HeroNav active="contact" />

      <div className="cc8-head">
        <div className="cc8-headl">
          <div className="cc8-eyebrow ct-fade"><Eyebrow>Contact</Eyebrow></div>
          <h1 className="cc8-h ct-rise" style={{ animationDelay: '.04s' }}>Start a <i>conversation.</i></h1>
        </div>
        <div className="cc8-headr ct-fade" style={{ animationDelay: '.08s' }}>
          <span className="cc8-avail"><span className="ct-live" />{CONTACT.status} · replies in {CONTACT.response}</span>
          <span className="sub"></span>
        </div>
      </div>

      <div className="cc8-panel ct-rise" style={{ animationDelay: '.14s' }}>
        {/* console bar */}
        <div className="cc8-bar">
          <span className="sq" />
          <span className="path"><b>eduardo</b>@portfolio : ~/contact</span>
          <span className="clock"><span className="ic">{CICONS.clock}</span><LiveClock /> · Los Angeles</span>
        </div>

        <div className="cc8-body">
          {/* left — form / success */}
          <div className="cc8-left">
            {sent ?
            <div className="cc8-success">
                <span className="ring">{CICONS.check}</span>
                <p className="t">Your message<br />is ready.</p>
                <p className="s">I've opened your mail client with everything filled in — just hit send. I'll get back to you within {CONTACT.response}.</p>
                <button className="cc8-again" onClick={reset}>{CICONS.arrow} Write another</button>
              </div> :

            <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                <div className="cc8-fhead">
                  <p className="t">Send a message</p>
                  <p className="s">I read every one</p>
                </div>

                <div className="cc8-reason">
                  <div className="lab">I'm reaching out about</div>
                  <div className="cc8-chips">
                    {CT8_REASONS.map((r) =>
                  <button type="button" key={r}
                  className={'cc8-chip' + (reason === r ? ' on' : '')}
                  onClick={() => setReason(reason === r ? null : r)}>{r}</button>
                  )}
                  </div>
                </div>

                <div className="cc8-fields">
                  <div className="cc8-field">
                    <label>Your name</label>
                    <input className="cc8-input" placeholder="Jane Doe" value={f.name} onChange={set('name')} onKeyDown={onKey} />
                  </div>
                  <div className="cc8-field">
                    <label>Email</label>
                    <input className="cc8-input" type="email" placeholder="jane@company.com" value={f.email} onChange={set('email')} onKeyDown={onKey} />
                  </div>
                  <div className="cc8-field full msg">
                    <label>Message</label>
                    <textarea className="cc8-input" placeholder="Tell me about the role, project, or idea…" value={f.msg} onChange={set('msg')} onKeyDown={onKey} />
                  </div>
                </div>

                <div className="cc8-submit">
                  <button className="cc8-btn" type="submit">Send message {CICONS.arrow}</button>
                  <span className="cc8-hint">or press <kbd>⌘</kbd><kbd>↵</kbd></span>
                </div>
              </form>
            }
          </div>

          <div className="cc8-divider" />

          {/* right — status + channels */}
          <div className="cc8-right">
            <div className="cc8-statusbare"><StatusCard bare compact /></div>
            <p className="cc8-rlabel">Or reach me directly</p>
            <ChannelList noborder />
            <div className="cc8-foot">{CICONS.mail}<span>Prefer email? <b>{CONTACT.channels[0].value}</b> reaches me first.</span></div>
          </div>
        </div>
      </div>
    </div>);

}
window.CT8 = CT8;