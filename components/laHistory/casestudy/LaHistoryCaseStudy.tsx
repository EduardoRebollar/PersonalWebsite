import { caseStudy } from '@/content/data/laHistory/caseStudy';
import '@/components/laHistory/styles/casestudy.css';
import { CaseStudyShell } from './CaseStudyShell';
import { ScrollExpandCover } from './ScrollExpandCover';
import { Reveal } from './Reveal';
import { ScrollWipeHeading } from './ScrollRevealWords';
import { WhisperText } from './WhisperText';
import { SplitText } from './SplitText';
import { SectionRail } from './SectionRail';
import { ShimmerText } from './ShimmerText';
import { LinkCluster } from './LinkCluster';
import { TutorTranscript } from './TutorTranscript';
import { Gazetteer } from './Gazetteer';
import { ResultsBars } from './ResultsBars';
import { ZoomParallax, type ParallaxImage } from './ZoomParallax';
import {
  Arrow,
  ZoomIcon,
  LayersIcon,
  DialogueIcon,
  NetworkIcon,
  WithholdIcon,
  QuestionIcon,
  AnalysisIcon,
  ClarityIcon,
  InsightIcon,
  LoopIcon,
} from './icons';

const THEORY_ICONS = [LayersIcon, DialogueIcon, NetworkIcon] as const;
const CRITERION_ICONS = [WithholdIcon, QuestionIcon, AnalysisIcon, ClarityIcon] as const;
const REFLECT_ICONS = [AnalysisIcon, InsightIcon, Arrow, LoopIcon] as const;
const REFLECT_GROUPS = [
  { key: 'learned', label: 'What we learned' },
  { key: 'ahead', label: 'What’s next' },
] as const;

const C = caseStudy;
const M = C.meta;

// Interface screenshots for the zoom-parallax montage (index 0 is the centered
// hero plate). Captures live in public/la-history/screens/.
const SCREENSHOTS: ParallaxImage[] = [
  { src: '/la-history/screens/welcome.webp', alt: 'Onboarding welcome modal over the Leaflet map of Los Angeles, introducing the 15-location journey across four eras' },
  { src: '/la-history/screens/map.webp', alt: 'Era-filtered map markers with the Chavez Ravine detail panel — period photo, oral-history video, and narrative' },
  { src: '/la-history/screens/quiz.webp', alt: 'Quiz results modal — 100% on Ballona Wetlands for +45 points, with the question recap and historical timeline' },
  { src: '/la-history/screens/concept-map.webp', alt: 'Concept-map editor for the Modern era, with labeled cross-era links and the Socratic AI tutor chat alongside' },
  { src: '/la-history/screens/dashboard.webp', alt: 'Player dashboard — explorer profile, per-era progress rings, and the earned-badge collection' },
  { src: '/la-history/screens/breakdown.webp', alt: 'Location breakdown table across all 15 sites, with the four per-era concept-map summaries below' },
  { src: '/la-history/screens/gallery.webp', alt: 'Full-screen photo viewer showing the Ballona Wetlands ecological reserve, with its descriptive caption' },
  { src: '/la-history/screens/build-map.webp', alt: 'Concept-map tutorial — the "Build Your Concept Map" walkthrough with the AI tutor introducing itself' },
];

export function LaHistoryCaseStudy() {
  const peakScore = Math.max(...C.results.versions.map((v) => v.score));

  return (
    <CaseStudyShell>
      <SectionRail />
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
              <span className="lead-label">In This Issue</span>
              <div className="bs-contents-entries">
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
              </div>
            </nav>
          </Reveal>

          {/* The Bet — what it is, who built it, and the pedagogical wager */}
          <div className="wide" id="bet">
            <Reveal className="bs-divider">
              <ShimmerText>The Bet</ShimmerText>
            </Reveal>

            <div className="col">
              <SplitText as="p" className="bs-lede raised" dropCap text={C.whatItIs} />
              <div className="bs-role">
                <div>
                  <ShimmerText className="lbl">My role</ShimmerText>
                  <SplitText as="p" text={M.myRole} />
                </div>
              </div>
            </div>

            <div className="bs-wager">
              <ShimmerText className="lbl">The wager</ShimmerText>
              <WhisperText as="p" text={C.bet} delay={70} y={16} />
            </div>

            <ScrollWipeHeading text="Three theories, one loop" emphasis="one" />
            <Reveal className="bs-bento" stagger>
              {C.theories.map((t, i) => {
                const Icon = THEORY_ICONS[i];
                return (
                  <div className="bs-bento-item" key={t.name}>
                    <div className="bs-bento-header">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.image.src} alt={t.image.alt} loading="lazy" decoding="async" />
                    </div>
                    <div className="bs-bento-body">
                      <div className="bs-bento-title">
                        <h4>{t.name}</h4>
                        <span className="bs-bento-icon">{Icon ? <Icon /> : null}</span>
                      </div>
                      <p className="gl">{t.gloss}</p>
                      <p>{t.body}</p>
                    </div>
                  </div>
                );
              })}
            </Reveal>
            <div className="bs-note">
              <ShimmerText className="lbl">Design note · why a local LLM?</ShimmerText>
              <SplitText as="p" text={C.whyLocal} />
            </div>
          </div>

          {/* the interface — screenshot placeholders (real captures to follow) */}
          <div className="wide" id="interface">
            <Reveal className="bs-divider">
              <ShimmerText>The Interface</ShimmerText>
            </Reveal>
            <ScrollWipeHeading text="Explore, test, connect, reflect" emphasis="connect" />
            <Reveal className="bs-zoom-hint">
              <span className="bs-zoom-hint-chip">
                <ZoomIcon s={15} />
                Click any screen to enlarge
              </span>
            </Reveal>
            <ZoomParallax images={SCREENSHOTS} />
          </div>

          {/* pull-quote */}
          <div className="col">
            <div className="bs-pull">
              <WhisperText
                as="blockquote"
                text="“Making connections is what produces lasting understanding” — not reading facts once and moving on."
                emphasis="not reading facts once and moving on."
              />
              <cite>The premise</cite>
            </div>
          </div>

          {/* the tutor — live transcript */}
          <div className="wide" id="tutor">
            <Reveal className="bs-divider">
              <ShimmerText>The Tutor That Won&rsquo;t Answer</ShimmerText>
            </Reveal>
            <ScrollWipeHeading text="A Socratic AI that asks, never tells" emphasis="asks" />
            <div className="col" style={{ marginBottom: 'clamp(20px,2.4vw,30px)' }}>
              <div className="bs-cols bs-cols--single bs-cols--center">
                <SplitText
                  as="p"
                  text={
                    'The tutor’s system prompt is a contract, not a Q&A. It reads the ' +
                    'player’s current concept map and asks the one bridging question that pulls ' +
                    'them toward what they almost know — then prompts them to record the ' +
                    'connection. Step through a real exchange below.'
                  }
                />
              </div>
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
              <ShimmerText>Results · Prompt Optimization</ShimmerText>
            </Reveal>
            <ScrollWipeHeading text="Four versions, scored" emphasis="scored" />
            <div className="col">
              <div className="bs-cols bs-cols--single bs-cols--center">
                <SplitText as="p" text={C.results.intro} />
              </div>
            </div>
            <Reveal className="bs-bento bs-bento--criteria" stagger>
              {C.results.criteria.map((c, i) => {
                const Icon = CRITERION_ICONS[i];
                return (
                  <div className="bs-bento-item" key={c.n}>
                    <div className="bs-bento-body">
                      <span className="cn">Criterion {c.n}</span>
                      <div className="bs-bento-title">
                        <h4>{c.name}</h4>
                        <span className="bs-bento-icon">{Icon ? <Icon /> : null}</span>
                      </div>
                      <p>{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </Reveal>
            <Reveal>
              <ResultsBars
                versions={C.results.versions}
                scoreMax={C.results.scoreMax}
                peakScore={peakScore}
              />
            </Reveal>
            <div className="bs-note">
              <ShimmerText className="lbl">Key finding</ShimmerText>
              <SplitText as="p" text={C.results.finding} />
            </div>
          </div>

          {/* gazetteer — illustrated atlas, filterable by era */}
          <div className="wide" id="gazetteer">
            <Reveal className="bs-divider">
              <ShimmerText>The Gazetteer · 15 Locations</ShimmerText>
            </Reveal>
            <Gazetteer />
          </div>

          {/* how it's built */}
          <div className="wide" id="built">
            <Reveal className="bs-divider">
              <ShimmerText>How It&rsquo;s Built</ShimmerText>
            </Reveal>
            <ScrollWipeHeading text="A deliberately boring stack" emphasis="boring" />
            <div className="col">
              <div className="bs-cols bs-cols--single">
                <SplitText as="p" className="raised" dropCap text={C.stackProse} />
              </div>
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

          {/* reflections — the "debrief dossier" */}
          <div className="wide" id="reflections">
            <Reveal className="bs-divider">
              <ShimmerText>Reflections</ShimmerText>
            </Reveal>
            <div className="bs-pull">
              <WhisperText
                as="blockquote"
                text={C.reflections.quote}
                emphasis="when to be unhelpful, when to stay silent,"
                delay={75}
              />
              <span className="bs-qrule" aria-hidden="true" />
            </div>
            {/* one observer drives a two-beat reveal: the "What we learned" half
                fades in, then "What's next" follows once it has finished (see the
                `.bs-dossier > *:nth-child(2)` delay override in casestudy.css). */}
            <Reveal className="bs-dossier" stagger>
              {REFLECT_GROUPS.map((g) => (
                <div className={`bs-dossier-half bs-dossier-half--${g.key}`} key={g.key}>
                  <span className="bs-reflect-group-label">{g.label}</span>
                  <div className="bs-dossier-grid">
                    {C.reflections.points
                      .map((p, i) => ({ p, i }))
                      .filter(({ p }) => p.group === g.key)
                      .map(({ p, i }) => {
                        const Icon = REFLECT_ICONS[i];
                        return (
                          <article className={`bs-dcard bs-dcard--${g.key}`} key={p.t}>
                            <div className="bs-dcard-title">
                              <h4>{p.t}</h4>
                              <span className="bs-dcard-glyph">{Icon ? <Icon s={18} /> : null}</span>
                            </div>
                            <p>{p.d}</p>
                          </article>
                        );
                      })}
                  </div>
                </div>
              ))}
            </Reveal>
          </div>

          {/* colophon */}
          <Reveal className="bs-colophon">
            <div className="mark">✶</div>
            <LinkCluster accentLabel="Play the demo" />
          </Reveal>
        </div>
      </main>
    </CaseStudyShell>
  );
}
