import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showIcons?: boolean;
  animateRing?: boolean;
  animateNib?: boolean;
  variant?: 'master' | 'nav' | 'icon' | 'animate';
}

export const Logo: React.FC<LogoProps> = ({
  size = 240,
  className = "",
  showIcons = true,
  animateRing = false,
  animateNib = false,
  variant = 'master'
}) => {
  const hexPoints = "120,35 195,78 195,162 120,205 45,162 45,78";
  
  // Size based on variant
  const actualSize = variant === 'icon' ? 56 : variant === 'nav' ? 48 : variant === 'animate' ? 360 : size;
  
  // Show/hide elements based on variant
  const showText = variant !== 'icon';
  const showCornerIcons = showIcons && variant !== 'icon' && variant !== 'nav';
  
  // Auto-animate for animate variant
  const shouldAnimateRing = animateRing || variant === 'animate';
  const shouldAnimateNib = animateNib || variant === 'animate';
  
  const ringSegments = [
    { color: "#2563eb", rotation: 0 },
    { color: "#9333ea", rotation: 90 },
    { color: "#dc2626", rotation: 180 },
    { color: "#ca8a04", rotation: 270 },
  ];

  const cornerIcons = [
    "https://cdn-icons-gif.flaticon.com/6172/6172512.gif",
    "https://cdn-icons-gif.flaticon.com/6172/6172513.gif",
    "https://cdn-icons-gif.flaticon.com/8112/8112604.gif",
    "https://cdn-icons-gif.flaticon.com/6416/6416394.gif",
    "https://cdn-icons-gif.flaticon.com/6172/6172528.gif",
    "https://cdn-icons-gif.flaticon.com/6569/6569127.gif",
  ];

  const corners = [
    { x: 120, y: 35 }, { x: 195, y: 78 }, { x: 195, y: 162 },
    { x: 120, y: 205 }, { x: 45, y: 162 }, { x: 45, y: 78 },
  ];

  return (
    <svg
      width={actualSize}
      height={actualSize}
      viewBox="0 0 240 240"
      className={`${className} overflow-visible`}
    >
      <defs>
        <linearGradient id="blueHexLogo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="whiteHexLogo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
        <linearGradient id="glossHighlightLogo" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="50%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="black" stopOpacity="0.1" />
        </linearGradient>
        <filter id="ringShadowLogo" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
        </filter>
        <filter id="coreShadowLogo" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="20" stdDeviation="25" floodOpacity="0.08" />
        </filter>
        <filter id="textGlow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#fbbf24" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* 3D INTERLOCKING RING - 4 Color Segments */}
      <g style={{ transformOrigin: '120px 120px' }} className={shouldAnimateRing ? 'logo-spin' : ''}>
        {ringSegments.map((seg, i) => (
          <g key={i} transform={`rotate(${seg.rotation}, 120, 120)`} filter="url(#ringShadowLogo)">
            <path d="M 120 12 A 108 108 0 0 1 228 120 L 219 130 L 210 120 A 90 90 0 0 0 120 30 L 130 21 Z" fill={seg.color} />
            <path d="M 228 120 L 219 130 L 210 120 Z" fill="black" fillOpacity="0.2" />
            <path d="M 120 12 A 108 108 0 0 1 228 120 L 219 130 L 210 120 A 90 90 0 0 0 120 30 L 130 21 Z" fill="url(#glossHighlightLogo)" />
          </g>
        ))}
      </g>

      {/* THE CORE HEXAGON */}
      <g filter="url(#coreShadowLogo)">
        <polygon points={hexPoints} fill="url(#blueHexLogo)" clipPath="inset(0 50% 0 0)" />
        <polygon points={hexPoints} fill="url(#whiteHexLogo)" clipPath="inset(0 0 0 50%)" />
        <line x1="120" y1="35" x2="120" y2="205" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="45" y1="78" x2="195" y2="162" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        <line x1="195" y1="78" x2="45" y2="162" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      </g>

      {/* LOGO TEXT: CP & WSS */}
      {showText && (
        <g transform="translate(85, 120)">
          <text y="-12" textAnchor="middle" fill="#fbbf24" style={{ fontFamily: 'Georgia, serif', fontWeight: '900', fontSize: '22px', fontStyle: 'italic' }} filter="url(#textGlow)">CP</text>
          <text y="2" textAnchor="middle" fill="rgba(255,255,255,0.8)" style={{ fontFamily: 'Georgia, serif', fontSize: '11px', fontStyle: 'italic', fontWeight: 'bold' }}>&amp;</text>
          <text y="18" textAnchor="middle" fill="#fbbf24" style={{ fontFamily: 'Georgia, serif', fontWeight: '900', fontSize: '22px', fontStyle: 'italic' }} filter="url(#textGlow)">WSS</text>
        </g>
      )}

      {/* BRANDING: BD (Bangladesh) */}
      {showText && (
        <g transform="translate(162, 168)">
          <text textAnchor="middle" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '900', fontSize: '46px', letterSpacing: '-3px' }}>
            <tspan fill="#16a34a">B</tspan>
            <tspan fill="#dc2626" dx="2">D</tspan>
          </text>
        </g>
      )}

      {/* SYMBOL: Pen Nib - Above BD in white section */}
      {showText && (
        <g 
          className={shouldAnimateNib ? 'nib-bounce' : ''} 
          style={{ transformOrigin: '120px 90px' }}
        >
          <path 
            d="M120 48 L144 98 L140 122 L100 122 L96 98 Z" 
            fill="#1e293b" 
          />
          <circle cx="120" cy="84" r="5" fill="#ffffff" />
          <rect x="98" y="122" width="44" height="10" rx="1.5" fill="#334155" />
        </g>
      )}

      {/* FLOATING SERVICE ICONS */}
      {showIcons && showText && corners.map((corner, index) => (
        <foreignObject key={index} x={corner.x - 16} y={corner.y - 16} width="32" height="32">
          <div className="w-full h-full flex items-center justify-center bg-white p-[5px] rounded-full shadow-md border border-slate-100/50">
            <img src={cornerIcons[index]} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        </foreignObject>
      ))}
    </svg>
  );
};

// PWA Logo - 3X nav logo size (144px) with animations
export const PWALogo: React.FC<{ size?: number; className?: string }> = ({ size = 144, className = "" }) => (
  <Logo size={size} className={className} showIcons={false} animateRing={true} animateNib={true} variant="nav" />
);

export default Logo;