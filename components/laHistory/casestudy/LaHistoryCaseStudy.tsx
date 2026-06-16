import { caseStudy } from '@/content/data/laHistory/caseStudy';
import '@/components/laHistory/styles/casestudy.css';
import { CaseStudyShell } from './CaseStudyShell';
import { ScrollExpandCover } from './ScrollExpandCover';
import { Reveal } from './Reveal';
import { LinkCluster } from './LinkCluster';
import { TutorTranscript } from './TutorTranscript';
import { Gazetteer } from './Gazetteer';
import { ResultsBars } from './ResultsBars';

const C = caseStudy;
const M = C.meta;

const SCREENS = [
  { t: 'The map', d: 'Leaflet basemap, fifteen markers, era-locked progression.' },
  { t: 'The quiz', d: 'Short per-location check that unlocks the concept map.' },
  { t: 'Concept map + tutor', d: 'Cytoscape graph editor with the Socratic chat panel.' },
  { t: 'Progress', d: 'Points, badges, and era unlocks across a session.' },
] as const;

export function LaHistoryCaseStudy() {
  const peakScore = Math.max(...C.results.versions.map((v) => v.score));

  return (
    <CaseStudyShell>
      <ScrollExpandCover
        videoUrl="/la-history/video/san-gabriel-cover.mp4"
        bgImageSrc="/la-history/img/san-gabriel-cover.jpg"
        title="LA History"
        kicker="The Griffith Observatory"
        scrollToExpand="Scroll to explore"
      />
      <main className="bsheet">
        <div className="shell">
          {/* nameplate */}
          <Reveal as="header" className="bs-plate wide" stagger>
            <div className="bs-rule" />
            <div className="bs-edition">
              <span>Vol. I · No. 01</span>
              <span>The Case Study</span>
              <span>
                {M.school.split(' ')[0]} · {M.year}
              </span>
            </div>
            <div className="bs-rule thin" />
            <h1 className="bs-name">
              LA <em>History</em>
            </h1>
            <div className="bs-rule thin" />
            <p className="bs-standfirst">{M.standfirst}</p>
            <div className="bs-byline">
              <span>
                <b>{M.team[0]}</b>
              </span>
              <span>{M.team[1]}</span>
              <span>{M.team[2]}</span>
              <span>{M.course}</span>
            </div>
            <LinkCluster accentLabel="Play the demo" />
            <nav className="bs-contents" aria-label="Contents">
              <span className="lead-label">Inside</span>
              <a href="#bet">
                <span className="num">01</span>The Bet
              </a>
              <a href="#interface">
                <span className="num">02</span>Interface
              </a>
              <a href="#tutor">
                <span className="num">03</span>The Tutor
              </a>
              <a href="#results">
                <span className="num">04</span>Results
              </a>
              <a href="#gazetteer">
                <span className="num">05</span>The Map
              </a>
              <a href="#production">
                <span className="num">06</span>To Production
              </a>
            </nav>
          </Reveal>

          {/* lede + role */}
          <div className="col">
            <Reveal className="bs-divider">
              <span>The Report</span>
            </Reveal>
            <Reveal className="bs-cols">
              <p className="raised">{C.whatItIs}</p>
              <p>{C.bet}</p>
            </Reveal>
            <Reveal className="bs-role">
              <div>
                <span className="lbl">Team</span>
                <p>{M.team.join(' · ')}</p>
              </div>
              <div>
                <span className="lbl">My role</span>
                <p>{M.myRole}</p>
              </div>
            </Reveal>
          </div>

          {/* the pedagogical bet */}
          <div className="wide" id="bet">
            <Reveal className="bs-divider">
              <span>The Pedagogical Bet</span>
            </Reveal>
            <Reveal as="h2" className="bs-head">
              Three theories, <em>one</em> loop
            </Reveal>
            <Reveal className="bs-grid3" stagger>
              {C.theories.map((t, i) => (
                <div className="bs-cell" key={t.name}>
                  <span className="cn">Theory 0{i + 1}</span>
                  <h4>{t.name}</h4>
                  <p className="gl">{t.gloss}</p>
                  <p>{t.body}</p>
                </div>
              ))}
            </Reveal>
            <Reveal className="bs-note">
              <span className="lbl">Design note · why a local LLM</span>
              <p>{C.whyLocal}</p>
            </Reveal>
          </div>

          {/* the interface — screenshot placeholders (real captures to follow) */}
          <div className="wide" id="interface">
            <Reveal className="bs-divider">
              <span>The Interface</span>
            </Reveal>
            <Reveal as="h2" className="bs-head">
              Map → quiz → concept map → <em>tutor</em>
            </Reveal>
            <Reveal className="bs-screens" stagger>
              {SCREENS.map((s) => (
                <figure className="bs-screen" key={s.t}>
                  <div className="bs-slot">Screenshot — {s.t}</div>
                  <figcaption>
                    <b>{s.t}.</b> {s.d}
                  </figcaption>
                </figure>
              ))}
            </Reveal>
          </div>

          {/* pull-quote */}
          <div className="col">
            <Reveal className="bs-pull">
              <blockquote>
                &ldquo;Making connections is what produces lasting understanding&rdquo; —{' '}
                <em>not reading facts once and moving on.</em>
              </blockquote>
              <cite>The premise</cite>
            </Reveal>
          </div>

          {/* the tutor — live transcript */}
          <div className="wide" id="tutor">
            <Reveal className="bs-divider">
              <span>The Tutor That Won&rsquo;t Answer</span>
            </Reveal>
            <Reveal as="h2" className="bs-head">
              A Socratic AI that <em>asks</em>, never tells
            </Reveal>
            <div className="col" style={{ marginBottom: 'clamp(20px,2.4vw,30px)' }}>
              <Reveal className="bs-cols">
                <p>
                  The tutor&rsquo;s system prompt is a contract, not a Q&amp;A. It reads the
                  player&rsquo;s current concept map and asks the one bridging question that pulls
                  them toward what they almost know — then prompts them to record the connection.
                  Step through a real exchange below.
                </p>
              </Reveal>
            </div>
            <Reveal>
              <TutorTranscript />
            </Reveal>
            <Reveal className="bs-tr-notes" stagger>
              <div className="nt">
                <div className="nk">Zone of proximal development</div>
                <p>
                  Each question targets the gap between what the student has mapped and what they
                  almost know.
                </p>
              </div>
              <div className="nt">
                <div className="nk">Withhold the answer</div>
                <p>A/B-tested until gemma reliably refused to state the connection outright.</p>
              </div>
              <div className="nt">
                <div className="nk">Close the loop</div>
                <p>The exchange ends by prompting the student to add the edge to their concept map.</p>
              </div>
            </Reveal>
          </div>

          {/* results — prompt optimization + user testing */}
          <div className="wide" id="results">
            <Reveal className="bs-divider">
              <span>Results · Prompt Optimization</span>
            </Reveal>
            <Reveal as="h2" className="bs-head">
              Four versions, <em>scored</em>
            </Reveal>
            <div className="col">
              <Reveal className="bs-cols">
                <p>{C.results.intro}</p>
              </Reveal>
            </div>
            <Reveal className="bs-grid4" stagger>
              {C.results.criteria.map((c) => (
                <div key={c.n}>
                  <span className="cn">Criterion {c.n}</span>
                  <h4>{c.name}</h4>
                  <p>{c.desc}</p>
                </div>
              ))}
            </Reveal>
            <Reveal>
              <ResultsBars
                versions={C.results.versions}
                scoreMax={C.results.scoreMax}
                peakScore={peakScore}
              />
            </Reveal>
            <Reveal className="bs-note">
              <span className="lbl">Key finding</span>
              <p>{C.results.finding}</p>
            </Reveal>

            <Reveal className="bs-divider">
              <span>User Testing</span>
            </Reveal>
            <div className="col">
              <Reveal className="bs-cols">
                <p>{C.userTesting.intro}</p>
              </Reveal>
            </div>
            <Reveal className="bs-testing">
              <div className="bs-tlist">
                <div className="sub">What broke</div>
                {C.userTesting.findings.map((f) => (
                  <div className="row" key={f.k}>
                    <span className="n">{f.k}</span>
                    <div>
                      <h4>{f.t}</h4>
                      <p>{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bs-tlist">
                <div className="sub">What we changed</div>
                {C.userTesting.changes.map((c) => (
                  <div className="row chg" key={c.t}>
                    <span className="n">→</span>
                    <div>
                      <h4>{c.t}</h4>
                      <p>{c.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* gazetteer — illustrated atlas, filterable by era */}
          <div className="wide" id="gazetteer">
            <Reveal className="bs-divider">
              <span>The Gazetteer · 15 Locations</span>
            </Reveal>
            <Gazetteer />
          </div>

          {/* how it's built */}
          <div className="wide" id="built">
            <Reveal className="bs-divider">
              <span>How It&rsquo;s Built</span>
            </Reveal>
            <Reveal as="h2" className="bs-head">
              A deliberately <em>boring</em> stack
            </Reveal>
            <div className="col">
              <Reveal className="bs-cols">
                <p className="raised">{C.stackProse}</p>
              </Reveal>
            </div>
            <Reveal className="bs-hard" stagger>
              {C.hardParts.map((h) => (
                <div className="row" key={h.n}>
                  <div className="n">{h.n}</div>
                  <div>
                    <h4>{h.title}</h4>
                    <p>{h.body}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          {/* pull-quote */}
          <div className="col">
            <Reveal className="bs-pull">
              <blockquote>
                The tutor&rsquo;s job isn&rsquo;t to answer. It&rsquo;s to ask the{' '}
                <em>one question</em> that bridges what you have to what you don&rsquo;t.
              </blockquote>
              <cite>On the Socratic prompt</cite>
            </Reveal>
          </div>

          {/* to production */}
          <div className="col" id="production">
            <Reveal className="bs-divider">
              <span>To Production</span>
            </Reveal>
            <Reveal as="h2" className="bs-head">
              From a laptop to a <em>district</em>
            </Reveal>
            <Reveal as="table" className="bs-ledger" stagger>
              <tbody>
                {C.production.map((p) => (
                  <tr key={p.k}>
                    <th>{p.k}</th>
                    <td>{p.v}</td>
                  </tr>
                ))}
              </tbody>
            </Reveal>
          </div>

          {/* reflections */}
          <div className="col" id="reflections">
            <Reveal className="bs-divider">
              <span>Reflections</span>
            </Reveal>
            <Reveal className="bs-pull">
              <blockquote>{C.reflections.quote}</blockquote>
              <cite>What we learned</cite>
            </Reveal>
            <Reveal className="bs-reflect" stagger>
              {C.reflections.points.map((p) => (
                <div className="bs-reflect-item" key={p.t}>
                  <h4>{p.t}</h4>
                  <p>{p.d}</p>
                </div>
              ))}
            </Reveal>
          </div>

          {/* colophon */}
          <Reveal className="bs-colophon">
            <div className="mark">✶</div>
            <p>End of report · {M.links.paper.split('/').pop()}</p>
            <LinkCluster accentLabel="Play the demo" />
          </Reveal>
        </div>
      </main>
    </CaseStudyShell>
  );
}
