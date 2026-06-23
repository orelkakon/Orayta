import { ImageResponse } from 'next/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const P  = '#5C3D1E';   // primary (dark brown)
const PD = '#2C1810';   // text (very dark)
const S  = '#C4956A';   // secondary (golden)
const A  = '#9B2335';   // accent (deep red)
const BG = '#FAF7F2';   // background (cream)

const FEATURES = ['תלמוד', 'רבנים', 'סידור', 'תהילים', 'חידון', 'תכנים'];

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'row', alignItems: 'stretch',
          fontFamily: 'serif', background: PD,
        }}
      >
        {/* ── LEFT PANEL: decorative ── */}
        <div
          style={{
            width: 340, flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: `linear-gradient(180deg, ${P} 0%, ${PD} 100%)`,
            borderLeft: `4px solid ${S}`,
            gap: 24,
          }}
        >
          {/* Glow circle */}
          <div
            style={{
              width: 220, height: 220, borderRadius: '50%',
              border: `3px solid ${S}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `rgba(196,149,106,0.10)`,
              boxShadow: `0 0 48px rgba(196,149,106,0.25)`,
            }}
          >
            <div style={{ fontSize: 140, fontWeight: 700, color: S, lineHeight: 1 }}>
              א
            </div>
          </div>

          {/* Three golden dots */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[12, 16, 12].map((s, i) => (
              <div key={i} style={{ width: s, height: s, borderRadius: '50%', background: S, opacity: 0.7 }} />
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL: text content ── */}
        <div
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'flex-end', justifyContent: 'center',
            padding: '56px 72px 56px 48px', gap: 18,
            background: `linear-gradient(135deg, ${BG} 0%, #EDE5D8 100%)`,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: `rgba(155,35,53,0.10)`,
              border: `1px solid rgba(155,35,53,0.30)`,
              borderRadius: 30, padding: '5px 18px',
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: A }} />
            <span style={{ color: A, fontSize: 16, letterSpacing: 1 }}>בס״ד · מקורות יהודיים</span>
          </div>

          {/* App name */}
          <div
            style={{
              color: P, fontSize: 104, fontWeight: 700,
              lineHeight: 0.95, textAlign: 'right', letterSpacing: -3,
            }}
          >
            אורייתא
          </div>

          {/* Gold divider */}
          <div style={{ width: 72, height: 3, background: S, borderRadius: 2, alignSelf: 'flex-end' }} />

          {/* Subtitle */}
          <div
            style={{
              color: '#6B5744', fontSize: 23, lineHeight: 1.65,
              textAlign: 'right', maxWidth: 480,
            }}
          >
            לימוד, ניהול ותרגול מקורות יהודיים — תלמוד, רבנים, סידור, חידונים ועוד
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: 'flex', flexWrap: 'wrap', gap: 10,
              justifyContent: 'flex-end', marginTop: 6,
            }}
          >
            {FEATURES.map(label => (
              <div
                key={label}
                style={{
                  background: `rgba(92,61,30,0.08)`,
                  border: `1.5px solid rgba(92,61,30,0.20)`,
                  borderRadius: 20, padding: '5px 18px',
                  color: P, fontSize: 19, fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* URL hint */}
          <div style={{ color: '#9B8575', fontSize: 14, marginTop: 4 }}>
            orayta.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
