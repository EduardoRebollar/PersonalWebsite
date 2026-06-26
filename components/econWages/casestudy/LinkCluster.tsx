import { meta } from '@/content/data/econWages/caseStudy';
import { ExtArrow, PaperIcon, SlidesIcon } from './icons';

/** Primary "Read the paper" + ghost "Slides" actions (nameplate + footer). */
export function LinkCluster() {
  const L = meta.links;
  return (
    <div className="bs-links-row">
      <a className="btn btn-primary" href={L.paper} target="_blank" rel="noopener noreferrer">
        <PaperIcon /> Read the paper <ExtArrow s={13} />
      </a>
      <a className="btn btn-ghost" href={L.slides} target="_blank" rel="noopener noreferrer">
        <SlidesIcon /> Slides
      </a>
    </div>
  );
}

/** Closing footer — a meta rule (framing · source) over the
    primary "Read the paper" + ghost "Slides" actions. */
export function EwFooter() {
  return (
    <footer className="ew-footer">
      <div className="ew-footer-inner">
        <div className="ew-foot-rule" />
        <div className="ew-foot-meta">
          <span className="ew-foot-tag">Cross-section · Not causal</span>
          <span className="ew-foot-src">
            <em>{meta.dataset}</em>
          </span>
        </div>
        <div className="ew-foot-cta">
          <LinkCluster />
        </div>
      </div>
    </footer>
  );
}
