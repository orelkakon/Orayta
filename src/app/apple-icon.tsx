import { ImageResponse } from 'next/server';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#5C3D1E',
          gap: 5,
        }}
      >
        {/* Crown dots (keter) */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4956A' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C4956A' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C4956A' }} />
        </div>

        {/* Torah scroll */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 11, height: 81, background: 'rgba(255,255,255,0.78)', borderRadius: 6 }} />
          <div
            style={{
              width: 95,
              height: 69,
              background: 'rgba(255,255,255,0.93)',
              borderRadius: 7,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: 74, height: 2, background: 'rgba(92,61,30,0.22)', borderRadius: 1 }} />
            <div style={{ width: 74, height: 2, background: 'rgba(92,61,30,0.22)', borderRadius: 1 }} />
            <div style={{ width: 56, height: 2, background: 'rgba(92,61,30,0.22)', borderRadius: 1 }} />
          </div>
          <div style={{ width: 11, height: 81, background: 'rgba(255,255,255,0.78)', borderRadius: 6 }} />
        </div>
      </div>
    ),
    { width: 180, height: 180 },
  );
}
