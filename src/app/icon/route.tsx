import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const size = parseInt(searchParams.get('s') || '32', 10);
  
  const hexPoints = "50%,15% 85%,33% 85%,67% 50%,85% 15%,67% 15%,33%";
  
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
          borderRadius: Math.max(4, size * 0.2),
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 3D Ring */}
        <svg
          width={size * 0.85}
          height={size * 0.85}
          viewBox="0 0 240 240"
          style={{ position: 'absolute', opacity: 0.3 }}
        >
          <g>
            <path
              d="M 120 12 A 108 108 0 0 1 228 120 L 219 130 L 210 120 A 90 90 0 0 0 120 30 L 130 21 Z"
              fill="#2563eb"
            />
            <path
              d="M 120 12 A 108 108 0 0 1 228 120 L 219 130 L 210 120 A 90 90 0 0 0 120 30 L 130 21 Z"
              fill="#9333ea"
              transform="rotate(90, 120, 120)"
            />
            <path
              d="M 120 12 A 108 108 0 0 1 228 120 L 219 130 L 210 120 A 90 90 0 0 0 120 30 L 130 21 Z"
              fill="#dc2626"
              transform="rotate(180, 120, 120)"
            />
            <path
              d="M 120 12 A 108 108 0 0 1 228 120 L 219 130 L 210 120 A 90 90 0 0 0 120 30 L 130 21 Z"
              fill="#ca8a04"
              transform="rotate(270, 120, 120)"
            />
          </g>
        </svg>

        {/* Core Hexagon */}
        <svg
          width={size * 0.5}
          height={size * 0.5}
          viewBox="0 0 240 240"
          style={{ position: 'absolute' }}
        >
          <defs>
            <linearGradient id="blueHex" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="whiteHex" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
          </defs>
          <polygon points={hexPoints} fill="url(#blueHex)" clipPath="inset(0 50% 0 0)" />
          <polygon points={hexPoints} fill="url(#whiteHex)" clipPath="inset(0 0 0 50%)" />
        </svg>

        {/* Logo Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontSize: Math.floor(size * 0.12),
              fontWeight: 900,
              color: '#fbbf24',
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
              textShadow: '0 2px 3px rgba(0,0,0,0.3)',
            }}
          >
            CP
          </span>
          <span
            style={{
              fontSize: Math.floor(size * 0.06),
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
            }}
          >
            &amp;
          </span>
          <span
            style={{
              fontSize: Math.floor(size * 0.12),
              fontWeight: 900,
              color: '#fbbf24',
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
              textShadow: '0 2px 3px rgba(0,0,0,0.3)',
            }}
          >
            WSS
          </span>
        </div>

        {/* BD Text */}
        <div
          style={{
            position: 'absolute',
            bottom: size * 0.08,
            right: size * 0.08,
            fontSize: Math.floor(size * 0.18),
            fontWeight: 900,
            letterSpacing: '-2px',
            display: 'flex',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span style={{ color: '#16a34a' }}>B</span>
          <span style={{ color: '#dc2626' }}>D</span>
        </div>

        {/* Pen Nib */}
        <svg
          width={size * 0.2}
          height={size * 0.25}
          viewBox="0 0 24 32"
          style={{
            position: 'absolute',
            top: size * 0.12,
            right: size * 0.12,
          }}
        >
          <path d="M0 -10 L12 4 L10 16 L-10 16 L-12 4 Z" fill="#1e293b" />
          <circle cx="0" cy="-3" r="2.5" fill="#ffffff" />
          <rect x="-11" y="16" width="22" height="5" rx="0.75" fill="#334155" />
        </svg>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}