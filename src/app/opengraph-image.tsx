import { ImageResponse } from 'next/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #4a2f14 0%, #5C3D1E 50%, #7a5230 100%)',
          padding: '60px 80px',
          fontFamily: 'serif',
        }}
      >
        {/* Left: text content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(196,149,106,0.25)',
              border: '1px solid rgba(196,149,106,0.5)',
              borderRadius: 30,
              padding: '6px 18px',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C4956A' }} />
            <span style={{ color: '#C4956A', fontSize: 18, letterSpacing: 2 }}>בס״ד · מקורות יהודיים</span>
          </div>

          {/* App name */}
          <div style={{ color: 'white', fontSize: 110, fontWeight: 700, lineHeight: 1, letterSpacing: -2 }}>
            אורייתא
          </div>

          {/* Subtitle */}
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 28, lineHeight: 1.5, maxWidth: 560 }}>
            מערכת לניהול, לימוד ותרגול מקורות יהודיים
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
            {['📜 תלמוד', '👥 רבנים', '📖 ספרים', '🎯 תרגול'].map(label => (
              <div
                key={label}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 20,
                  padding: '6px 16px',
                  color: 'white',
                  fontSize: 20,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Torah scroll icon */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            marginRight: 20,
          }}
        >
          {/* Outer glow ring */}
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: '50%',
              border: '3px solid rgba(196,149,106,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Crown dots */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C4956A' }} />
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#C4956A' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C4956A' }} />
              </div>
              {/* Scroll */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 16, height: 120, background: 'rgba(255,255,255,0.78)', borderRadius: 8 }} />
                <div
                  style={{
                    width: 138,
                    height: 100,
                    background: 'rgba(255,255,255,0.93)',
                    borderRadius: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                  }}
                >
                  <div style={{ width: 108, height: 3, background: 'rgba(92,61,30,0.22)', borderRadius: 2 }} />
                  <div style={{ width: 108, height: 3, background: 'rgba(92,61,30,0.22)', borderRadius: 2 }} />
                  <div style={{ width: 82, height: 3, background: 'rgba(92,61,30,0.22)', borderRadius: 2 }} />
                </div>
                <div style={{ width: 16, height: 120, background: 'rgba(255,255,255,0.78)', borderRadius: 8 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
