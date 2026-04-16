import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'ClippingPath & Website Services Studio';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          padding: '60px',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            right: '50px',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />
        
        {/* Logo container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          {/* Hexagon logo */}
          <div
            style={{
              width: '120px',
              height: '140px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #3b82f6 50%, #ffffff 50%)',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#fbbf24',
                  fontStyle: 'italic',
                }}
              >
                CP
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                &amp;
              </span>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#fbbf24',
                  fontStyle: 'italic',
                }}
              >
                WSS
              </span>
            </div>
          </div>
        </div>

        {/* Main title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              color: 'white',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            ClippingPath &amp; Website
          </h1>
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              background: 'linear-gradient(90deg, #10b981, #14b8a6)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Services Studio
          </h1>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: '24px',
            color: 'rgba(255,255,255,0.7)',
            marginTop: '24px',
          }}
        >
          Professional Image • Video • Web Development
        </p>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            marginTop: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '24px' }}>📸</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>50M+ Images</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '24px' }}>🎬</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>100K+ Videos</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '24px' }}>🌍</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>120+ Countries</span>
          </div>
        </div>

        {/* BD Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            fontSize: '24px',
            fontWeight: 900,
            display: 'flex',
          }}
        >
          <span style={{ color: '#16a34a' }}>B</span>
          <span style={{ color: '#dc2626' }}>D</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
