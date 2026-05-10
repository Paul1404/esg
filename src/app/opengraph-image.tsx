import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ESG, free email signature generator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'radial-gradient(800px 360px at 50% 0%, rgba(124,92,255,0.4), transparent 60%), #0b0d12',
          padding: '64px 72px',
          color: '#e6e8ee',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #7c5cff, #5b3fff)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 36,
            }}
          >
            e
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.5 }}>ESG</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            Free email signature generator
          </div>
          <div style={{ fontSize: 30, color: '#9aa3b2', lineHeight: 1.3, maxWidth: 980 }}>
            HTML signatures that render correctly in Outlook, Gmail, and Apple Mail.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 22, color: '#7a8295' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: '#34d399' }} />
            No account required
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: '#34d399' }} />
            Eleven templates
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: '#34d399' }} />
            Open source
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
