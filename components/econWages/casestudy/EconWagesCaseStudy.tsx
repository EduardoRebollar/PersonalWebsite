import '@/components/econWages/styles/casestudy.css';
import { meta, sample, result, literature, fmt } from '@/content/data/econWages/caseStudy';
import { CaseStudyShell } from './CaseStudyShell';
import { Reveal } from './Reveal';
import { LinkCluster, EwFooter } from './LinkCluster';
import { CoeffForest } from './charts';
import { ExperiencePlate } from './ExperiencePlate';
import { LeadStory } from './LeadStory';
import { RegressionTable } from './RegressionTable';

/**
 * AI & Developer Wages — bespoke "broadsheet" case study for /work/econometrics-final.
 * A front-page newspaper treatment of the regression on a black canvas with a
 * violet accent. Ported from design_handoff_ai_wages_broadsheet/. Structure,
 * copy, and figures are 1:1 with the handoff; the scatter cloud behind Fig. 1 is
 * illustrative (seeded noise), everything else is the paper's real numbers.
 */
export function EconWagesCaseStudy() {
  const M = meta;
  const R = result;

  return (
    <CaseStudyShell>
      <main className="ew-bsheet">
        {/* ---- 1 · nameplate ---- */}
        <Reveal className="wide bs-plate">
          <div className="bs-rule" />
          <div className="bs-edition">
            <span>{M.date}</span>
            <span>The Econometrics Dispatch</span>
            <span>Occidental College</span>
          </div>
          <div className="bs-rule thin" />
          <h1 className="bs-name">
            AI &amp; <em>Developer</em> Wages
          </h1>
          <p className="bs-standfirst">
            Productivity research expects AI to <span className="sf-close">close</span>{' '}
            the experience gap. The salary data tells a different story &mdash; it{' '}
            <span className="sf-widen">widens</span> them.
          </p>
          <div className="bs-byline">
            <span>
              <b>{M.author}</b>
            </span>
            <span>Econ 272</span>
            <span>2025 Stack Overflow Survey</span>
            <span>N = {fmt(M.n)}</span>
          </div>
          <div className="bs-links">
            <LinkCluster />
          </div>
          <div className="bs-rule" style={{ marginTop: 18 }} />
        </Reveal>

        {/* ---- 2 · hero figure (interactive lead story) ---- */}
        <Reveal className="wide bs-hero">
          <LeadStory />
        </Reveal>

        {/* ---- 3 · the finding (lede) ---- */}
        <Reveal className="wide">
          <div className="bs-divider">
            <span>The Finding</span>
          </div>
          <h2 className="bs-head">A result that runs backwards from the hypothesis</h2>
          <div className="bs-cols">
            <p className="raised">
              Every recent study of AI and productivity points the same way: the tools help the
              least-experienced workers most, handing novices the know-how that seniors spent years
              acquiring. So the prior was clean — AI should <strong>substitute</strong> for
              experience and the interaction term should land <strong>negative</strong>.
            </p>
            <p>
              It landed positive, and significantly so. In this sample AI <em>complements</em>{' '}
              experience: a year on the job is worth about <strong>2.0%</strong> to a developer who
              doesn&rsquo;t use AI and <strong>3.3%</strong> to one who does — a return roughly{' '}
              <strong>{R.gapPct}% larger</strong>. The benefit isn&rsquo;t spread evenly. It pools
              at the senior end.
            </p>
            <p>
              Because the AI level effect is negative (−14.8% at zero experience) while the
              interaction is positive, the total AI effect <em>flips sign</em> with tenure. Solve it
              for zero and the break-even sits at <strong>11.38 years</strong>: below it, AI users
              earn less than non-users; above it, more.
            </p>
          </div>
        </Reveal>

        {/* ---- 4 · theory ledger ---- */}
        <Reveal className="wide">
          <div className="bs-grid3">
            <div className="bs-cell">
              <div className="cn">Story A</div>
              <h4>Substitute</h4>
              <p className="gl">β₃ &lt; 0 · hypothesized</p>
              <p>
                AI replicates senior know-how and hands it to juniors, closing the wage gap.
                Brynjolfsson, Peng, and Cui all find this in productivity.
              </p>
            </div>
            <div className="bs-cell">
              <div className="cn">Story B</div>
              <h4>
                <em>Complement</em>
              </h4>
              <p className="gl">β₃ &gt; 0 · what the data shows</p>
              <p>
                AI multiplies what experience already brings — architecture, review, debugging
                legacy — so seniors pull further ahead.
              </p>
            </div>
            <div className="bs-cell">
              <div className="cn">The verdict</div>
              <h4>+0.013</h4>
              <p className="gl">t = 7.06 · significant</p>
              <p>
                The interaction is positive and survives robust SE and the Mincer correction. Story
                B wins on wages.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ---- 5 · the numbers (two plates) ---- */}
        <Reveal className="wide">
          <div className="bs-divider">
            <span>The Numbers</span>
          </div>

          {/* the ledger — one home for the key figures, split descriptive
              (the sample) vs. result (the finding's trajectory). Replaces the
              old descriptive cards + the redundant bottom stat strip. */}
          <div className="ew-ledger">
            <div className="ew-ledger-row">
              <div className="ew-ledger-label">
                <span className="dot" aria-hidden="true" />
                The Sample
              </div>
              <div className="ew-ledger-cells">
                <div className="ew-ledger-cell">
                  <div className="v">{fmt(sample.developers)}</div>
                  <div className="k">Developers</div>
                </div>
                <div className="ew-ledger-cell">
                  <div className="v">
                    {sample.useAiPct}
                    <span className="u">%</span>
                  </div>
                  <div className="k">Use AI tools</div>
                </div>
                <div className="ew-ledger-cell">
                  <div className="v">{sample.medianExpYrs}</div>
                  <div className="k">Median yrs exp</div>
                </div>
                <div className="ew-ledger-cell">
                  <div className="v">{fmt(sample.countries)}</div>
                  <div className="k">Countries</div>
                </div>
              </div>
            </div>
            <div className="ew-ledger-row result">
              <div className="ew-ledger-label">
                <span className="dot" aria-hidden="true" />
                The Result
              </div>
              <div className="ew-ledger-cells">
                <div className="ew-ledger-cell">
                  <div className="v neg">{`−${Math.abs(result.beta1 * 100).toFixed(1)}%`}</div>
                  <div className="k">AI at zero exp</div>
                </div>
                <div className="ew-ledger-cell">
                  <div className="v pos">
                    {`+${result.ai.toFixed(1)}%`}
                    <span className="u">/yr</span>
                  </div>
                  <div className="k">AI return</div>
                </div>
                <div className="ew-ledger-cell">
                  <div className="v">
                    {`+${result.nonAi.toFixed(1)}%`}
                    <span className="u">/yr</span>
                  </div>
                  <div className="k">Non-AI return</div>
                </div>
                <div className="ew-ledger-cell">
                  <div className="v pos">
                    {result.breakeven.toFixed(1)}
                    <span className="u">yr</span>
                  </div>
                  <div className="k">Break-even</div>
                </div>
              </div>
            </div>
          </div>

          {/* interactive two-line plate — drag to set experience */}
          <div className="ew-plate-block">
            <ExperiencePlate />
          </div>

          <div className="bs-figsolo">
            <div className="bs-figframe">
              <CoeffForest height={300} />
            </div>
            <p className="bs-figcap">
              <b>Fig. 3 —</b> Every coefficient with its 95% CI. <b>Country</b> dominates; the
              interaction clears zero.
            </p>
          </div>
        </Reveal>

        {/* ---- 6 · regression table ---- */}
        <Reveal className="col">
          <div className="bs-tablebox">
            <p className="cap">Main regression · OLS · log annual salary</p>
            <RegressionTable />
          </div>
        </Reveal>

        {/* ---- 7 · dispatches from the literature ---- */}
        <Reveal className="wide">
          <div className="bs-divider">
            <span>Dispatches from the Literature</span>
          </div>
          <div className="bs-briefs">
            {literature.map((l) => (
              <div className="bs-brief" key={l.authors}>
                <div className="who">
                  {l.authors} <span className="yr">· {l.year}</span>
                </div>
                <div className="what">{l.finding}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ---- 8 · editor's note ---- */}
        <Reveal className="col">
          <div className="bs-note">
            <span className="lbl">Editor&rsquo;s note · limitations</span>
            <p>
              This is a cross-section of self-selected respondents, not a treatment effect — the
              developers who answer &ldquo;daily&rdquo; are the ones who opted into a long survey
              about AI. Ability and firm quality bias the AI coefficient up; manager-vs-IC role
              biases it down.{' '}
              <em>
                The honest headline is narrower: the lab&rsquo;s AI productivity effect does not show
                up in these salaries.
              </em>
            </p>
          </div>
        </Reveal>

        {/* spacer matches .bs-note's top margin so the gap below the editor's
            note equals the gap above it */}
        <div style={{ height: 'clamp(28px, 3.4vw, 44px)' }} />
      </main>

      {/* ---- 9 · footer ---- */}
      <EwFooter />
    </CaseStudyShell>
  );
}
