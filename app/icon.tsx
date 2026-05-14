import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#0a1018',
          color: '#4fc3d9',
          fontSize: 18,
          fontWeight: 600,
          fontFamily: 'serif',
          letterSpacing: '-0.02em',
        }}
      >
        ER
      </div>
    ),
    size,
  );
}
