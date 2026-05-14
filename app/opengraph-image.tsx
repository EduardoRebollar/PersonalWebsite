import { ImageResponse } from 'next/og';
import { site } from '@/content/data/site';

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          padding: 88,
          background:
            'linear-gradient(135deg, #0a1018 0%, #131b26 55%, #1a2433 100%)',
          color: '#e8edf2',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 24,
            color: '#6b7480',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: '#4fc3d9',
              boxShadow: '0 0 16px #4fc3d9',
            }}
          />
          Portfolio
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: '#e8edf2',
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#8fa8ff',
              maxWidth: 980,
              lineHeight: 1.35,
            }}
          >
            {site.role}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 22,
            color: '#6b7480',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <div>{site.location ?? ''}</div>
          <div>eduardorebollar.vercel.app</div>
        </div>
      </div>
    ),
    size,
  );
}
