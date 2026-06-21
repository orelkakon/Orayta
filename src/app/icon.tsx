import { ImageResponse } from 'next/server';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
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
          gap: 14,
        }}
      >
        {/* Crown dots (keter) */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#C4956A' }} />
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#C4956A' }} />
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#C4956A' }} />
        </div>

        {/* Torah scroll */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 30, height: 230, background: 'rgba(255,255,255,0.78)', borderRadius: 15 }} />
          <div
            style={{
              width: 270,
              height: 195,
              background: 'rgba(255,255,255,0.93)',
              borderRadius: 18,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 22,
            }}
          >
            <div style={{ width: 210, height: 5, background: 'rgba(92,61,30,0.22)', borderRadius: 3 }} />
            <div style={{ width: 210, height: 5, background: 'rgba(92,61,30,0.22)', borderRadius: 3 }} />
            <div style={{ width: 160, height: 5, background: 'rgba(92,61,30,0.22)', borderRadius: 3 }} />
          </div>
          <div style={{ width: 30, height: 230, background: 'rgba(255,255,255,0.78)', borderRadius: 15 }} />
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
