import { RippleLink } from '@/components/ui/cta/RippleLink';
import { caseStudy } from '@/content/data/laHistory/caseStudy';
import { PlayIcon, PaperIcon, ExtArrow } from './icons';

/**
 * The demo + paper CTA pair used under the nameplate and in the colophon.
 * Page-level CTAs, so they route through RippleLink per the site convention.
 */
export function LinkCluster({ accentLabel = 'Play the demo' }: { accentLabel?: string }) {
  const links = caseStudy.meta.links;
  return (
    <div className="cs-links">
      <RippleLink internal href={links.demo} className="btn btn-primary">
        <PlayIcon /> {accentLabel}
      </RippleLink>
      <RippleLink href={links.paper} className="btn btn-ghost">
        <PaperIcon /> Read the paper <ExtArrow s={13} />
      </RippleLink>
    </div>
  );
}
