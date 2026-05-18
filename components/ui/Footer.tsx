'use client';

import { useState } from 'react';
import { Mail, Copy, Check, Share2 } from 'lucide-react';
import { Container } from './Container';
import { site } from '@/content/data/site';
import { useIsLaHistoryDemoRoute } from '@/lib/laHistory/route';

const pillBase =
  'cursor-pointer motion-safe:hover:-translate-y-1 ' +
  '[filter:drop-shadow(0_0_0px_transparent)_drop-shadow(0_0_0px_transparent)] ' +
  'transition-[transform,filter] duration-200';

const mailGlow = 'hover:[filter:drop-shadow(0_0_10px_#fcd34d)_drop-shadow(0_0_5px_#fcd34d)]';
const githubGlow = 'hover:[filter:drop-shadow(0_0_20px_#ffffff)_drop-shadow(0_0_6px_#ffffff)]';
const linkedinGlow = 'hover:[filter:drop-shadow(0_0_20px_#007EBB)_drop-shadow(0_0_6px_#007EBB)]';
const copyGlow = 'hover:[filter:drop-shadow(0_0_10px_#10b981)_drop-shadow(0_0_5px_#10b981)]';
const shareGlow = 'hover:[filter:drop-shadow(0_0_10px_#a78bfa)_drop-shadow(0_0_5px_#a78bfa)]';

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 98 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252L61.8242 91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 6.69539e-07 48.9043 4.309e-07C21.8203 1.92261e-07 -1.9479e-07 22.1074 -4.3343e-07 49.1914C-6.20631e-07 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008L36.75 83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z"
        fill="white"
      />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <g fill="none" fillRule="evenodd">
        <path
          d="M8,72 L64,72 C68.418278,72 72,68.418278 72,64 L72,8 C72,3.581722 68.418278,-8.11624501e-16 64,0 L8,0 C3.581722,8.11624501e-16 -5.41083001e-16,3.581722 0,8 L0,64 C5.41083001e-16,68.418278 3.581722,72 8,72 Z"
          fill="#007EBB"
        />
        <path
          d="M62,62 L51.315625,62 L51.315625,43.8021149 C51.315625,38.8127542 49.4197917,36.0245323 45.4707031,36.0245323 C41.1746094,36.0245323 38.9300781,38.9261103 38.9300781,43.8021149 L38.9300781,62 L28.6333333,62 L28.6333333,27.3333333 L38.9300781,27.3333333 L38.9300781,32.0029283 C38.9300781,32.0029283 42.0260417,26.2742151 49.3825521,26.2742151 C56.7356771,26.2742151 62,30.7644705 62,40.051212 L62,62 Z M16.349349,22.7940133 C12.8420573,22.7940133 10,19.9296567 10,16.3970067 C10,12.8643566 12.8420573,10 16.349349,10 C19.8566406,10 22.6970052,12.8643566 22.6970052,16.3970067 C22.6970052,19.9296567 19.8566406,22.7940133 16.349349,22.7940133 Z M11.0325521,62 L21.769401,62 L21.769401,27.3333333 L11.0325521,27.3333333 L11.0325521,62 Z"
          fill="#FFF"
        />
      </g>
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const isDemoRoute = useIsLaHistoryDemoRoute();
  const [copied, setCopied] = useState(false);

  if (isDemoRoute) return null;

  const github = site.socials.find((s) => s.label === 'GitHub')?.href ?? '#';
  const linkedin = site.socials.find((s) => s.label === 'LinkedIn')?.href ?? '#';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(site.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — silently ignore
    }
  };

  const sharePage = async () => {
    const shareData = {
      title: site.name,
      text: site.tagline,
      url: site.url,
    };
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    copyLink();
  };

  return (
    <footer className="relative z-10 border-t border-hairline bg-base/40 py-3 backdrop-blur-sm">
      <Container className="flex flex-col items-center justify-between gap-3 sm:flex-row sm:items-center">
        <p className="font-mono text-[11px] tracking-wider text-fg-mute uppercase">
          <span className="text-[14px] align-middle">©</span> {year} · Designed &amp; Built With <span className="text-red-500">❤️</span> By {site.name} · {site.location}
        </p>
        <div className="flex items-center gap-10">
          <a
            href={`mailto:${site.email.primary}`}
            aria-label="Email Eduardo"
            className={`${pillBase} ${mailGlow}`}
          >
            <Mail className="h-5 w-5 text-[#fcd34d]" strokeWidth={1.5} />
          </a>
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className={`${pillBase} ${githubGlow}`}
          >
            <GithubIcon className="h-5 w-5" />
          </a>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className={`${pillBase} ${linkedinGlow}`}
          >
            <LinkedinIcon className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={copyLink}
            aria-label={copied ? 'Link copied' : 'Copy link to website'}
            className={`${pillBase} ${copyGlow}`}
          >
            {copied ? (
              <Check className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
            ) : (
              <Copy className="h-5 w-5 text-emerald-500" strokeWidth={1.5} />
            )}
          </button>
          <button
            type="button"
            onClick={sharePage}
            aria-label="Share website"
            className={`${pillBase} ${shareGlow}`}
          >
            <Share2 className="h-5 w-5 text-violet-400" strokeWidth={1.5} />
          </button>
        </div>
      </Container>
    </footer>
  );
}
