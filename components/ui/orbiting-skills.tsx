'use client';

import React, { memo, useEffect, useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { skills as defaultSkills } from '@/content/data/skills';
import { useSceneStore } from '@/stores/useSceneStore';
import type { SkillGroup } from '@/types/content';

const ORBIT_CATEGORIES = ['Languages', 'ML / Data', 'Frameworks', 'Dev Tools'] as const;

const ORBIT_BASE_RADII: readonly number[] = [120, 190, 260, 320];
const ORBIT_SPEEDS: readonly number[] = [0.45, -0.35, 0.28, -0.22];
const ORBIT_GLOW_ALPHAS: readonly number[] = [0.85, 0.7, 0.56, 0.42];

// Per-layer entrance reveal, in seconds. Driven by the section's in-view signal
// (the `reveal` prop): the core ignites first, then each ring + its nodes fade in
// one at a time, innermost → outermost. Computed inline (not via CSS keyframes)
// because the core/nodes re-render every frame, which stalls stylesheet
// animations. Tune these to speed up / slow down the build.
const REVEAL_CORE_DELAY = 0.6;
const REVEAL_RING_BASE = 1.0;
// Stagger ≥ fade duration, so each ring (+ its nodes) finishes fading in before
// the next one starts — a strictly sequential, one-layer-at-a-time build rather
// than overlapping fades. Keep STAGGER >= DUR to preserve that ordering.
const REVEAL_RING_STAGGER = 0.65;
const REVEAL_DUR = 0.6;
// Upper bound used to stop the reveal clock once every layer has finished.
const REVEAL_TOTAL = REVEAL_RING_BASE + 4 * REVEAL_RING_STAGGER + REVEAL_DUR;

function pickFromRing<T>(arr: readonly T[], i: number): T {
  return arr[Math.min(i, arr.length - 1)] as T;
}

const NODE_SIZE = 40;

type IconRenderer = () => ReactNode;

const brandIcons: Record<string, IconRenderer> = {
  python: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="py-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5A9FD4" />
          <stop offset="1" stopColor="#306998" />
        </linearGradient>
        <linearGradient id="py-bot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE873" />
          <stop offset="1" stopColor="#FFD43B" />
        </linearGradient>
      </defs>
      <path
        fill="url(#py-top)"
        d="M11.9 0C5.8 0 6.2 2.6 6.2 2.6V5.4h5.8v.8H3.9S0 5.8 0 12s3.4 6 3.4 6h2v-2.9s-.1-3.4 3.4-3.4h5.8s3.2.1 3.2-3.1V3.1S18.3 0 11.9 0zM8.7 1.8c.6 0 1 .5 1 1 0 .6-.5 1-1 1s-1-.5-1-1c0-.6.5-1 1-1z"
      />
      <path
        fill="url(#py-bot)"
        d="M12.1 24c6.1 0 5.7-2.6 5.7-2.6V18.6h-5.8v-.8h8.1s3.9.4 3.9-5.8-3.4-6-3.4-6h-2v2.9s.1 3.4-3.4 3.4H9.4s-3.2-.1-3.2 3.1V20.9S5.7 24 12.1 24zm3.2-1.8c-.6 0-1-.5-1-1 0-.6.5-1 1-1s1 .5 1 1c0 .6-.5 1-1 1z"
      />
    </svg>
  ),
  typescript: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <rect width="24" height="24" rx="2" fill="#3178C6" />
      <path
        fill="#fff"
        d="M9.5 12v1.4h2v6.6H13v-6.6h2V12H9.5zm9.4 6.4c.3.6.7 1 1.3 1.3.5.2 1.2.4 2 .4.7 0 1.4-.1 1.9-.4.6-.3 1-.6 1.3-1.1.3-.5.5-1.1.5-1.7 0-.5-.1-.9-.2-1.2-.2-.3-.4-.6-.7-.9-.3-.2-.6-.4-1-.6l-1.2-.5c-.3-.1-.6-.2-.8-.4-.2-.1-.4-.2-.5-.4-.1-.1-.2-.3-.2-.5 0-.2 0-.3.1-.5.1-.1.3-.2.5-.3.2-.1.4-.1.7-.1.3 0 .5 0 .7.1.2.1.4.2.6.4.1.2.2.4.3.6l1.7-1.1c-.2-.4-.5-.7-.8-1-.3-.3-.7-.5-1.2-.6-.4-.1-1-.2-1.6-.2-.7 0-1.4.1-1.9.4-.5.2-.9.6-1.2 1-.3.4-.4 1-.4 1.5 0 .6.1 1.1.4 1.5.3.4.6.7 1.1 1l1.4.6c.4.2.7.3 1 .4.3.1.5.3.6.4.1.2.2.3.2.6 0 .2 0 .4-.1.5-.1.2-.3.3-.5.4-.2.1-.5.1-.8.1-.4 0-.7-.1-1-.2-.3-.1-.5-.3-.7-.6-.2-.2-.3-.5-.4-.9l-1.7 1c.1.6.4 1 .6 1.5z"
      />
    </svg>
  ),
  javascript: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <rect width="24" height="24" rx="2" fill="#F7DF1E" />
      <path
        fill="#000"
        d="M16.6 18.7c.4.7 1 1.3 2 1.3.9 0 1.4-.4 1.4-1 0-.7-.5-.9-1.5-1.4l-.5-.2c-1.5-.6-2.5-1.4-2.5-3.1 0-1.6 1.2-2.7 3-2.7 1.3 0 2.3.5 3 1.7l-1.6 1c-.4-.7-.8-.9-1.4-.9-.6 0-1 .4-1 .9 0 .6.4.8 1.3 1.2l.5.2c1.8.8 2.8 1.5 2.8 3.2 0 1.9-1.5 3-3.5 3-2 0-3.2-.9-3.8-2.2l1.8-1zm-7.8.2c.3.6.6 1.1 1.4 1.1.7 0 1.2-.3 1.2-1.4V11h2v7.6c0 2.1-1.2 3-3 3-1.6 0-2.6-.8-3.1-1.8l1.5-.9z"
      />
    </svg>
  ),
  java: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        fill="#ED8B00"
        d="M9 16.5s-1 .6.7.8c2 .2 3.1.2 5.4-.2 0 0 .6.4 1.4.7-5.1 2.2-11.5-.1-7.5-1.3zm-.6-2.9s-1.1.8.6 1c2.2.2 3.9.3 7-.4 0 0 .4.5 1 .7-6.1 1.8-12.9.2-8.6-1.3zm10.7 5s.7.6-.8 1.1c-3 1-12.3 1.2-15 0-1-.4.8-1 1.4-1.1.6-.2.9-.1.9-.1-1.1-.8-7 1.5-3 2.2 10.9 1.8 19.9-.8 16.5-2.1zM9.5 10.6s-5 1.2-1.7 1.6c1.4.2 4.1.1 6.7-.1 2.1-.2 4.2-.5 4.2-.5s-.7.3-1.3.7c-5.1 1.4-15.1.7-12.2-.7 2.4-1.2 4.3-1 4.3-1zm9 5c5.2-2.7 2.8-5.3 1.1-5 .4-.4.7-.7.7-.7s-1.2 1.4-1.5 2.7c-.2 1.2.4 1.9.4 1.9-.4-1.9.5-3.4.5-3.4s.8.5-.8 2.2c-1.4 1.4-2.4 2.7-2.4 2.7zm-7.7 6c5 .3 12.6-.2 12.8-2.5 0 0-.3.9-4 1.6-4.2.8-9.3.7-12.4.2 0 0 .6.5 3.6.7z"
      />
    </svg>
  ),
  sql: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="3" fill="none" stroke="#00758F" strokeWidth="1.6" />
      <path
        d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"
        fill="none"
        stroke="#00758F"
        strokeWidth="1.6"
      />
      <path
        d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"
        fill="none"
        stroke="#00758F"
        strokeWidth="1.6"
      />
    </svg>
  ),
  r: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <ellipse cx="12" cy="11" rx="11" ry="8" fill="#276DC3" />
      <ellipse cx="12" cy="11" rx="9" ry="6" fill="#fff" />
      <path
        fill="#276DC3"
        d="M7.5 7.5h4.8c1.8 0 3 .9 3 2.2 0 1-.7 1.7-1.6 2l2.6 4.3h-2.4l-2.4-4h-1.8v4H7.5V7.5zm2.2 1.6v2.5h2.4c.9 0 1.4-.5 1.4-1.2 0-.8-.5-1.3-1.4-1.3H9.7z"
      />
    </svg>
  ),
  html: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        fill="#E34F26"
        d="M1.5 0h21l-1.9 21.6L12 24l-8.6-2.4L1.5 0zm7 9.8l-.2-2.7 10 .1.2-2.6L5.4 4.4l.7 8h9.1l-.3 3.4-2.9.8-3-.8-.2-2.1H6.2l.4 4.2L12 19.4l5.4-1.4.7-8.2H8.5z"
      />
    </svg>
  ),
  pytorch: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        fill="#EE4C2C"
        d="M17.1 4.7l-1.4 1.4c2.3 2.3 2.3 6 0 8.3s-6 2.3-8.3 0c-2.3-2.3-2.3-6 0-8.3l3.7-3.7.5-.5V0L6.3 5.2c-3.1 3.1-3.1 8 0 11.1s8 3.1 11.1 0c3-3.1 3-8.1-.3-11.6z"
      />
      <circle cx="15.7" cy="6.1" r="0.9" fill="#EE4C2C" />
    </svg>
  ),
  pandas: () => (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-white" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/pandas.svg"
        alt=""
        className="relative h-[78%] w-[78%] object-contain"
        aria-hidden="true"
      />
    </div>
  ),
  numpy: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/numpy.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  matplotlib: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/matplotlib.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  seaborn: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/seaborn.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  jupyter: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/jupyter.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  snowflake: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/snowflake.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  nextjs: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/nextjs.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  react: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <g fill="none" stroke="#61DAFB" strokeWidth="1">
        <circle cx="12" cy="12" r="2.05" fill="#61DAFB" />
        <ellipse cx="12" cy="12" rx="11" ry="4.2" />
        <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="11" ry="4.2" transform="rotate(120 12 12)" />
      </g>
    </svg>
  ),
  flask: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        d="M9 2h6v1H14v5l5.5 11c.4 1-.4 2-1.4 2H5.9c-1 0-1.7-1-1.4-2L10 8V3H9V2z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
      />
      <path d="M7 14h10" stroke="#fff" strokeWidth="1.4" />
    </svg>
  ),
  leaflet: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        d="M20 4c-9 0-16 7-16 16 0 0 5-1 9-5s7-11 7-11z"
        fill="#199900"
      />
      <path d="M20 4L8 16" stroke="#fff" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  tailwind: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        fill="#06B6D4"
        d="M12 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6C13.7 10.6 15 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-.9-2.3-1.6C16.3 6.2 15 4.8 12 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6 1.2 1.2 2.5 2.6 5.5 2.6 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-.9-2.3-1.6C10.3 13.4 9 12 6 12z"
      />
    </svg>
  ),
  git: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        fill="#F05032"
        d="M23.5 11.2L12.8.5c-.6-.6-1.6-.6-2.3 0L8.3 2.8l2.9 2.9c.7-.2 1.4 0 1.9.5.5.5.7 1.3.5 1.9l2.8 2.8c.7-.2 1.5 0 2 .5.8.8.8 2 0 2.8s-2 .8-2.8 0c-.5-.5-.7-1.3-.4-2L12.4 9.6v6.9c.2.1.4.2.5.4.8.8.8 2 0 2.8s-2 .8-2.8 0-.8-2 0-2.8c.2-.2.5-.4.7-.5V9.5c-.3-.1-.5-.3-.7-.5-.5-.5-.7-1.3-.4-2L7 4.1.5 10.6c-.6.6-.6 1.6 0 2.3l10.7 10.7c.6.6 1.6.6 2.3 0l10.7-10.7c.6-.6.6-1.7-.7-1.7z"
      />
    </svg>
  ),
  github: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        fill="#fff"
        d="M12 .5C5.4.5 0 5.9 0 12.5c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C20.6 22.3 24 17.8 24 12.5 24 5.9 18.6.5 12 .5z"
      />
    </svg>
  ),
  windows: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/windows.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  softr: () => (
    <svg viewBox="0 0 256 256" className="h-full w-full" aria-hidden="true">
      <path
        fill="#FCB500"
        d="M2.1748 44.5816C2.1748 29.6948 2.1748 22.2515 5.07306 16.5655C7.62244 11.564 11.6904 7.49759 16.6938 4.94918C22.3819 2.05203 29.8282 2.05203 44.7206 2.05203H211.644C226.536 2.05203 233.982 2.05203 239.671 4.94918C244.674 7.49759 248.742 11.564 251.291 16.5655C254.19 22.2515 254.19 29.6948 254.19 44.5816V72.1625C254.19 87.0492 254.19 94.4926 251.291 100.179C248.742 105.18 244.674 109.246 239.671 111.795C233.982 114.692 226.536 114.692 211.644 114.692H44.7206C29.8282 114.692 22.3819 114.692 16.6938 111.795C11.6904 109.246 7.62244 105.18 5.07306 100.179C2.1748 94.4926 2.1748 87.0492 2.1748 72.1625V44.5816Z"
      />
      <path
        fill="#F53878"
        d="M2.1748 197.628C2.1748 166.523 27.3997 141.308 58.5163 141.308C89.6328 141.308 114.858 166.523 114.858 197.628C114.858 228.733 89.6328 253.948 58.5163 253.948C27.3997 253.948 2.1748 228.733 2.1748 197.628Z"
      />
      <path
        fill="#386AF5"
        d="M141.507 183.837C141.507 168.951 141.507 161.507 144.405 155.821C146.954 150.82 151.022 146.753 156.026 144.205C161.714 141.308 169.16 141.308 184.052 141.308H211.644C226.536 141.308 233.982 141.308 239.671 144.205C244.674 146.753 248.742 150.82 251.291 155.821C254.19 161.507 254.19 168.951 254.19 183.837V211.418C254.19 226.305 254.19 233.748 251.291 239.434C248.742 244.436 244.674 248.502 239.671 251.051C233.982 253.948 226.536 253.948 211.644 253.948H184.052C169.16 253.948 161.714 253.948 156.026 251.051C151.022 248.502 146.954 244.436 144.405 239.434C141.507 233.748 141.507 226.305 141.507 211.418V183.837Z"
      />
    </svg>
  ),
  macos: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        fill="#fff"
        d="M17.5 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.4 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.4-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.2-2.5 1-1.5 1.4-2.9 1.4-3 0 0-2.8-1.1-2.8-4.2zm-2.7-7.7c.7-.8 1.2-2 1-3.2-1.1.1-2.3.7-3 1.5-.7.7-1.3 2-1.1 3.1 1.2.1 2.5-.6 3.1-1.4z"
      />
    </svg>
  ),
  activedirectory: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#00BCF2" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#00BCF2" strokeWidth="1.2" />
      <circle cx="12" cy="8" r="1.6" fill="#00BCF2" />
      <circle cx="8.5" cy="14" r="1.6" fill="#00BCF2" />
      <circle cx="15.5" cy="14" r="1.6" fill="#00BCF2" />
      <path d="M12 9.5l-3 4M12 9.5l3 4M9 14h6" stroke="#00BCF2" strokeWidth="1" fill="none" />
    </svg>
  ),
  airtable: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path fill="#FFB400" d="M2 6.5L11 3l11 4-9 3.5z" />
      <path fill="#26B5F8" d="M2 8v9l9 4v-9z" />
      <path fill="#F82B60" d="M22 9v8l-9 4v-8z" />
    </svg>
  ),
  nodejs: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/nodejs.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  scikit: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/scikit.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  vercel: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/vercel.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  stata: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/stata.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  latex: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="8"
        fontWeight="700"
        fill="#fff"
      >
        LaTeX
      </text>
    </svg>
  ),
  spacy: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/spacy.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  nltk: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/nltk.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  vscode: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path
        fill="#007ACC"
        d="M17 2L7.5 11 4 8.5 2 9.5v5L4 15.5 7.5 13 17 22l5-2V4l-5-2zm0 4.8v10.4L10 12l7-5.2z"
      />
    </svg>
  ),
  tableau: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/tableau.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  gdocs: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path fill="#4285F4" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path fill="#A1C2FA" d="M14 2v6h6L14 2z" />
      <path stroke="#fff" strokeWidth="1" d="M7.5 12h9M7.5 14.5h9M7.5 17h6" />
    </svg>
  ),
  gsheets: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path fill="#0F9D58" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path fill="#87CEAC" d="M14 2v6h6L14 2z" />
      <path stroke="#fff" strokeWidth="0.9" d="M7 12h10M7 15h10M7 18h10M10 11v8M14 11v8" />
    </svg>
  ),
  gslides: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path fill="#F4B400" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path fill="#FCE8B2" d="M14 2v6h6L14 2z" />
      <rect x="7.5" y="12" width="9" height="6" rx="0.5" fill="none" stroke="#fff" strokeWidth="1" />
    </svg>
  ),
  word: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/word.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  excel: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/excel.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  powerpoint: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/powerpoint.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  canva: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/canva.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  notion: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/notion.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  zotero: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/zotero.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  zoom: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#2D8CFF" />
      <rect x="6" y="9" width="8" height="6" rx="1" fill="#fff" />
      <path d="M14 11l4-2v6l-4-2z" fill="#fff" />
    </svg>
  ),
  outlook: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/outlook.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  onedrive: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/onedrive.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  gforms: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path fill="#7248B9" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path fill="#C5A4E5" d="M14 2v6h6L14 2z" />
      <path
        d="M8 12.5l1.5 1.5L12 11.5M8 16.5l1.5 1.5L12 15.5"
        stroke="#fff"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M13.5 13h3M13.5 17h3" stroke="#fff" strokeWidth="1.2" />
    </svg>
  ),
  gsites: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path fill="#3C8BD9" d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
      <path fill="#9CC2EE" d="M14 2v6h6L14 2z" />
      <rect x="7" y="11" width="10" height="2" fill="#fff" />
      <rect x="7" y="14" width="6" height="5" fill="#fff" opacity="0.7" />
      <rect x="14" y="14" width="3" height="5" fill="#fff" opacity="0.5" />
    </svg>
  ),
  gdrive: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <path fill="#FFCF63" d="M9 3l-7 12 4 6 7-12z" />
      <path fill="#3777E3" d="M15 3H9l7 12h6z" />
      <path fill="#11A861" d="M6 21h12l4-6h-12z" />
    </svg>
  ),
  gmail: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/gmail.svg" alt="" className="h-full w-full" aria-hidden="true" />
  ),
  gcal: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/gcal.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  gmeet: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/gmeet.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  gchat: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/gchat.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  whatsapp: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#25D366" />
      <path
        fill="#fff"
        d="M16.5 14.3c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.7.9-.1.1-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-.9-1.1-1.3-1.7-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.3.2-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.1-.5-.3-.4-.5-.4h-.4c-.2 0-.4.1-.5.3-.5.6-.8 1.3-.8 2.1.1.9.4 1.8.9 2.6 1 1.5 2.3 2.7 3.9 3.5.5.2.9.4 1.4.5.5.1 1 .2 1.5.1.6-.1 1.2-.5 1.5-1 .2-.4.2-.7.1-.8l-.3-.2z"
      />
    </svg>
  ),
  linkedin: () => (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden="true">
      <rect width="24" height="24" rx="3" fill="#0A66C2" />
      <circle cx="7" cy="8" r="1.6" fill="#fff" />
      <rect x="5.7" y="10.5" width="2.6" height="8" fill="#fff" />
      <path
        fill="#fff"
        d="M10 10.5h2.5v1.1c.5-.8 1.4-1.3 2.5-1.3 2 0 3 1.3 3 3.5v4.7h-2.6v-4.2c0-1.1-.4-1.7-1.3-1.7-.8 0-1.4.5-1.4 1.7v4.2H10v-8z"
      />
    </svg>
  ),
  handshake: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/handshake.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  groupme: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/groupme.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
  remind: () => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/brand/remind.svg" alt="" className="h-full w-full object-contain" aria-hidden="true" />
  ),
};

const aliasIcons: Record<string, string> = {
  python: 'python',
  typescript: 'typescript',
  javascript: 'javascript',
  java: 'java',
  sql: 'sql',
  r: 'r',
  'html/css': 'html',
  pytorch: 'pytorch',
  pandas: 'pandas',
  numpy: 'numpy',
  matplotlib: 'matplotlib',
  seaborn: 'seaborn',
  jupyter: 'jupyter',
  snowflake: 'snowflake',
  'next.js': 'nextjs',
  nextjs: 'nextjs',
  react: 'react',
  flask: 'flask',
  leaflet: 'leaflet',
  tailwind: 'tailwind',
  git: 'git',
  github: 'github',
  windows: 'windows',
  softr: 'softr',
  'active directory': 'activedirectory',
  macos: 'macos',
  airtable: 'airtable',
  'node.js': 'nodejs',
  nodejs: 'nodejs',
  'scikit-learn': 'scikit',
  sklearn: 'scikit',
  vercel: 'vercel',
  stata: 'stata',
  latex: 'latex',
  spacy: 'spacy',
  nltk: 'nltk',
  'vs code': 'vscode',
  vscode: 'vscode',
  tableau: 'tableau',
  'google docs': 'gdocs',
  'google sheets': 'gsheets',
  'google slides': 'gslides',
  word: 'word',
  excel: 'excel',
  powerpoint: 'powerpoint',
  canva: 'canva',
  notion: 'notion',
  zotero: 'zotero',
  zoom: 'zoom',
  outlook: 'outlook',
  onedrive: 'onedrive',
  'one drive': 'onedrive',
  'google forms': 'gforms',
  'google sites': 'gsites',
  'google drive': 'gdrive',
  gmail: 'gmail',
  'google calendar': 'gcal',
  'google meet': 'gmeet',
  'google chat': 'gchat',
  whatsapp: 'whatsapp',
  linkedin: 'linkedin',
  handshake: 'handshake',
  groupme: 'groupme',
  remind: 'remind',
};

function getIcon(label: string): IconRenderer | null {
  const key = aliasIcons[label.toLowerCase().trim()];
  return key ? brandIcons[key] ?? null : null;
}

function getFallbackText(label: string): string {
  const clean = label.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length <= 2) return clean.toUpperCase();
  if (label.toLowerCase() === 'macos') return 'mac';
  if (label.toLowerCase() === 'active directory') return 'AD';
  return clean.slice(0, 3).toLowerCase();
}

type NodeDescriptor = {
  id: string;
  label: string;
  ringIndex: number;
  phase: number;
};

type OrbitDescriptor = {
  ringIndex: number;
  radius: number;
  speed: number;
  glowAlpha: number;
};

type OrbitingSkillsProps = {
  groups?: SkillGroup[];
  className?: string;
  maxSize?: number;
  /** When true, plays the per-layer entrance reveal (core → rings, staggered). */
  reveal?: boolean;
};

const SkillNode = memo(function SkillNode({
  node,
  orbit,
  time,
  scale,
  staticMode,
  opacity,
}: {
  node: NodeDescriptor;
  orbit: OrbitDescriptor;
  time: number;
  scale: number;
  staticMode: boolean;
  /** Per-layer reveal opacity (undefined = fully visible / no reveal). */
  opacity?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const angle = staticMode ? node.phase : time * orbit.speed + node.phase;
  const r = orbit.radius * scale;
  const x = Math.cos(angle) * r;
  const y = Math.sin(angle) * r;

  const iconRenderer = getIcon(node.label);
  const iconNode = iconRenderer ? iconRenderer() : null;
  const fallback = iconNode ? null : getFallbackText(node.label);

  return (
    <div
      data-ring={node.ringIndex}
      className="absolute top-1/2 left-1/2 transition-transform duration-300 ease-out"
      style={{
        width: `${NODE_SIZE}px`,
        height: `${NODE_SIZE}px`,
        transform: `translate(${x.toFixed(3)}px, ${y.toFixed(3)}px) translate(-50%, -50%)`,
        zIndex: hovered ? 30 : 10,
        opacity,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          'relative flex h-full w-full cursor-pointer items-center justify-center rounded-full border border-border bg-card p-2 shadow-lg backdrop-blur-sm transition-all duration-300',
          hovered && 'scale-125',
        )}
        style={{
          boxShadow: hovered
            ? '0 0 24px rgba(129, 140, 248, 0.45), 0 0 48px rgba(129, 140, 248, 0.25)'
            : undefined,
        }}
      >
        {iconNode ?? (
          <span className="font-mono text-[11px] tracking-[0.05em] text-foreground/90 uppercase">
            {fallback}
          </span>
        )}
        {hovered && (
          <div className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 rounded border border-border bg-popover px-2 py-1 font-mono text-[10px] tracking-[0.1em] whitespace-nowrap text-popover-foreground uppercase">
            {node.label}
          </div>
        )}
      </div>
    </div>
  );
});

const OrbitPath = memo(function OrbitPath({
  orbit,
  scale,
  opacity,
}: {
  orbit: OrbitDescriptor;
  scale: number;
  /** Per-layer reveal opacity (undefined = fully visible / no reveal). */
  opacity?: number;
}) {
  const diameter = orbit.radius * 2 * scale;
  const alpha = orbit.glowAlpha;
  const delay = orbit.ringIndex * 0.7;
  return (
    <div
      aria-hidden="true"
      data-ring={orbit.ringIndex}
      className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: `${diameter}px`,
        height: `${diameter}px`,
        opacity,
      }}
    >
      {/* Diffuse halo — radial gradient + outer/inner bloom */}
      <div
        className="absolute inset-0 animate-pulse rounded-full"
        style={{
          background: `radial-gradient(circle, transparent 50%, rgba(129, 140, 248, ${alpha * 0.4}) 80%, rgba(129, 140, 248, ${alpha * 0.6}) 100%)`,
          boxShadow: `0 0 ${60 * alpha}px rgba(129, 140, 248, ${alpha * 0.55}), inset 0 0 ${50 * alpha}px rgba(129, 140, 248, ${alpha * 0.4})`,
          animationDelay: `${delay}s`,
        }}
      />
      {/* Crisp ring outline */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid rgba(129, 140, 248, ${Math.min(1, alpha * 0.9)})`,
        }}
      />
    </div>
  );
});

export function OrbitingSkills({
  groups,
  className,
  maxSize = 720,
  reveal = false,
}: OrbitingSkillsProps) {
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const initialized = useSceneStore((s) => s.initialized);

  const sourceGroups = useMemo(() => {
    if (groups) return groups;
    return ORBIT_CATEGORIES.map((label) => defaultSkills.find((g) => g.label === label)).filter(
      (g): g is SkillGroup => Boolean(g),
    );
  }, [groups]);

  const { nodes, orbits, maxRadius } = useMemo(() => {
    const orbitDescriptors: OrbitDescriptor[] = sourceGroups.map((_, i) => ({
      ringIndex: i,
      radius: pickFromRing(ORBIT_BASE_RADII, i),
      speed: pickFromRing(ORBIT_SPEEDS, i),
      glowAlpha: pickFromRing(ORBIT_GLOW_ALPHAS, i),
    }));

    const nodeList: NodeDescriptor[] = sourceGroups.flatMap((group, ringIndex) =>
      group.items.map((label, i) => ({
        id: `${group.label}-${label}`,
        label,
        ringIndex,
        phase: (2 * Math.PI * i) / group.items.length + ringIndex * 0.3,
      })),
    );

    const max = orbitDescriptors.reduce((acc, o) => Math.max(acc, o.radius), 0);

    return { nodes: nodeList, orbits: orbitDescriptors, maxRadius: max };
  }, [sourceGroups]);

  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [coreHovered, setCoreHovered] = useState(false);
  const [containerSize, setContainerSize] = useState(720);
  // Reveal clock, in seconds since the section scrolled into view. -1 means the
  // reveal hasn't begun (layers stay hidden for motion users until then).
  const [revealT, setRevealT] = useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const staticMode = !initialized || reducedMotion;
  // Only run the staggered reveal for motion users; reduced-motion / pre-init
  // render the constellation fully visible with no entrance.
  const animateReveal = reveal && !staticMode;

  useEffect(() => {
    if (staticMode || isPaused) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTime((t) => t + dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [staticMode, isPaused]);

  // Drive the per-layer reveal once the section is in view. A dedicated clock
  // (independent of the orbit loop, so hover-pause doesn't freeze it) ticks from
  // 0 and stops once every layer has finished, holding the final value so the
  // constellation stays fully revealed.
  useEffect(() => {
    if (!animateReveal) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      setRevealT(t);
      if (t < REVEAL_TOTAL) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animateReveal]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerSize(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scale so that the outermost orbit + node radius fits inside container
  // with a small breathing margin.
  const scale = Math.min(1, (containerSize / 2 - NODE_SIZE) / maxRadius);

  // Per-layer reveal opacity for a layer whose fade starts at `delay` seconds.
  // Returns undefined (fully visible) under reduced-motion / pre-init; 0 before
  // the in-view clock starts; otherwise a 0→1 ramp over REVEAL_DUR.
  const revealOpacity = (delay: number): number | undefined => {
    if (staticMode) return undefined;
    if (!reveal || revealT < 0) return 0;
    return Math.max(0, Math.min(1, (revealT - delay) / REVEAL_DUR));
  };

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Skill constellation: Languages, ML/Data, Frameworks, and Tools — full list below"
      className={cn('relative flex items-center justify-center', className)}
      style={{
        width: `min(90vw, ${maxSize}px)`,
        height: `min(90vw, ${maxSize}px)`,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Central core */}
      <div
        className="os-core relative z-20 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-foreground to-primary shadow-2xl transition-transform duration-300"
        style={{
          transform: coreHovered ? 'scale(1.1)' : undefined,
          opacity: revealOpacity(REVEAL_CORE_DELAY),
        }}
        onMouseEnter={() => setCoreHovered(true)}
        onMouseLeave={() => setCoreHovered(false)}
      >
        <div className="absolute inset-0 animate-pulse rounded-full bg-primary/30 blur-xl" />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10 text-background"
          aria-hidden="true"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        {coreHovered && (
          <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 rounded border border-border bg-popover px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] whitespace-nowrap text-popover-foreground uppercase">
            My stack
          </div>
        )}
      </div>

      {orbits.map((orbit) => (
        <OrbitPath
          key={`path-${orbit.ringIndex}`}
          orbit={orbit}
          scale={scale}
          opacity={revealOpacity(REVEAL_RING_BASE + orbit.ringIndex * REVEAL_RING_STAGGER)}
        />
      ))}

      {nodes.map((node) => {
        const orbit = orbits[node.ringIndex];
        if (!orbit) return null;
        return (
          <SkillNode
            key={node.id}
            node={node}
            orbit={orbit}
            time={time}
            scale={scale}
            staticMode={staticMode}
            opacity={revealOpacity(REVEAL_RING_BASE + node.ringIndex * REVEAL_RING_STAGGER)}
          />
        );
      })}
    </div>
  );
}

export default OrbitingSkills;
