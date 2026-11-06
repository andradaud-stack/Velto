import React from 'react';

/**
 * 100% Pure Vector HTML/CSS/SVG Illustration for Velto Finance
 * Resolution-independent, razor sharp on any 4K/Retina/Mobile display with 0% blur.
 */
export default function VeltoIllustrationVector({ isMobile = false }) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 bg-[#F4F6FC]">
      <svg
        viewBox={isMobile ? "0 0 575 1024" : "0 0 1024 682"}
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Background Gradients */}
          <linearGradient id="bgCanvasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#EEF2F9" />
          </linearGradient>

          {/* Deep Navy Waves */}
          <linearGradient id="deepNavyWave" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#0B1333" />
            <stop offset="35%" stopColor="#0F1F54" />
            <stop offset="70%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          {/* Medium Blue Wave */}
          <linearGradient id="medBlueWave" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          {/* Cyan/Light Blue Accent Wave */}
          <linearGradient id="cyanAccentWave" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.4" />
          </linearGradient>

          {/* Golden Ribbon Gradients */}
          <linearGradient id="goldRibbonFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="25%" stopColor="#FBBF24" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="goldRibbonBack" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </linearGradient>

          {/* Coin Gradients */}
          <radialGradient id="coinGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#FBBF24" />
            <stop offset="85%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </radialGradient>

          {/* Shield Gradients */}
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>

          <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>

          {/* Glass Card Gradient */}
          <linearGradient id="glassCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.65" />
          </linearGradient>

          {/* Phone Chart Gradient */}
          <linearGradient id="phoneChartFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.05" />
          </linearGradient>

          {/* Shadow Filters */}
          <filter id="softShadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0B1333" floodOpacity="0.18" />
          </filter>
          <filter id="cardShadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#1E3A8A" floodOpacity="0.22" />
          </filter>
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#D97706" floodOpacity="0.35" />
          </filter>
          <filter id="ambientBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="35" />
          </filter>
        </defs>

        {/* 1. Base Canvas Background */}
        <rect width="100%" height="100%" fill="url(#bgCanvasGrad)" />

        {/* Soft Ambient Radial Lights in the Background */}
        <circle cx={isMobile ? "280" : "480"} cy={isMobile ? "400" : "320"} r="260" fill="#DBEAFE" opacity="0.6" filter="url(#ambientBlur)" />
        <circle cx={isMobile ? "450" : "800"} cy={isMobile ? "150" : "120"} r="200" fill="#E0E7FF" opacity="0.45" filter="url(#ambientBlur)" />
        <circle cx={isMobile ? "150" : "200"} cy={isMobile ? "750" : "550"} r="240" fill="#FEF3C7" opacity="0.3" filter="url(#ambientBlur)" />

        {/* 2. Fluid Deep Wave Paths (Layer 1 - Deep Background Wave) */}
        <path
          d={
            isMobile
              ? "M -50 -50 C 200 -30, 420 80, 460 280 C 500 480, 360 620, 400 780 C 440 920, 300 1080, 200 1100 L -50 1100 Z"
              : "M -60 -60 C 280 -60, 560 120, 580 320 C 600 500, 420 580, 460 740 L -60 740 Z"
          }
          fill="url(#deepNavyWave)"
        />

        {/* Fluid Wave (Layer 2 - Royal Indigo Ribbon Wave) */}
        <path
          d={
            isMobile
              ? "M -50 120 C 240 180, 410 320, 420 520 C 430 700, 280 820, 240 1100 L -50 1100 Z"
              : "M -60 60 C 300 120, 520 280, 510 460 C 500 620, 320 680, 300 740 L -60 740 Z"
          }
          fill="url(#medBlueWave)"
          opacity="0.9"
        />

        {/* Fluid Wave (Layer 3 - Cyan Light Accent Edge) */}
        <path
          d={
            isMobile
              ? "M -30 240 C 200 290, 360 410, 365 590 C 370 740, 230 870, 180 1100 L -30 1100 Z"
              : "M -50 160 C 250 210, 460 360, 440 520 C 420 640, 260 700, 220 740 L -50 740 Z"
          }
          fill="url(#cyanAccentWave)"
        />

        {/* Top-Left Velto 3D Brand Logo */}
        <g transform={isMobile ? "translate(40, 50)" : "translate(60, 45)"}>
          {/* Blue V Leg */}
          <path d="M 0 0 L 14 36 L 27 36 L 14 0 Z" fill="#002D80" rx="3" />
          {/* Gold V Leg */}
          <path d="M 10 13 L 28 36 L 44 0 L 30 0 L 21 21 Z" fill="url(#goldRibbonFront)" rx="3" filter="url(#goldGlow)" />
          {/* Velto Typography */}
          <text x="56" y="27" fill="#0B1333" fontFamily="Inter, system-ui, sans-serif" fontWeight="900" fontSize="26" letterSpacing="-0.5">
            Velto
          </text>
        </g>

        {/* Group: 3D Centerpiece (Character + Phone + Ribbon + Shield) */}
        <g transform={isMobile ? "translate(40, 190) scale(0.9)" : "translate(10, 30) scale(0.92)"}>
          
          {/* --- Golden Ribbon Back Layer (Behind Phone & Character) --- */}
          <path
            d="M 80 500 C 20 400, 10 280, 60 210 C 110 140, 200 150, 280 230 C 350 300, 400 420, 380 540 C 360 620, 280 660, 190 640 Z"
            fill="url(#goldRibbonBack)"
            opacity="0.85"
          />

          {/* --- 3D Smartphone Device Mockup --- */}
          <g transform="translate(250, 180) rotate(-11)" filter="url(#cardShadow)">
            {/* Phone Outer Chassis (Dark Matte Titanium) */}
            <rect x="0" y="0" width="180" height="340" rx="34" fill="#0E1626" stroke="#334155" strokeWidth="4" />
            
            {/* Phone Screen Glass (Clean White) */}
            <rect x="8" y="8" width="164" height="324" rx="27" fill="#FFFFFF" />

            {/* Top Speaker / Camera Notch Pill */}
            <rect x="65" y="16" width="50" height="4" rx="2" fill="#E2E8F0" />

            {/* In-Screen Velto Header */}
            <g transform="translate(20, 32)">
              {/* Mini Brand Logo */}
              <path d="M 0 0 L 4 10 L 8 10 L 4 0 Z" fill="#002D80" />
              <path d="M 3 4 L 8 10 L 13 0 L 9 0 L 6 6 Z" fill="#F59E0B" />
              {/* Hamburger Icon */}
              <line x1="120" y1="3" x2="132" y2="3" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
              <line x1="120" y1="7" x2="132" y2="7" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Total Balance Block */}
            <g transform="translate(20, 62)">
              <text x="0" y="0" fill="#64748B" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="600">Total Balance</text>
              <text x="0" y="15" fill="#0B1333" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="900" letterSpacing="-0.5">Rp 12.750.000</text>
              <text x="0" y="27" fill="#10B981" fontFamily="Inter, sans-serif" fontSize="7.5" fontWeight="800">↑ 12.5%</text>
            </g>

            {/* Gold Area Chart Inside Screen */}
            <g transform="translate(14, 108)">
              {/* Chart Filled Gradient */}
              <path
                d="M 4 58 L 22 45 L 45 48 L 75 30 L 105 38 L 135 12 L 148 16 L 148 70 L 4 70 Z"
                fill="url(#phoneChartFill)"
              />
              {/* Chart Glowing Line */}
              <path
                d="M 4 58 L 22 45 L 45 48 L 75 30 L 105 38 L 135 12 L 148 16"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Chart Peak Node */}
              <circle cx="135" cy="12" r="3" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
            </g>

            {/* Quick Action Pill Buttons at Screen Bottom */}
            <g transform="translate(20, 205)">
              {/* Transfer */}
              <g transform="translate(0, 0)">
                <circle cx="14" cy="14" r="13" fill="#F1F5F9" />
                <path d="M 9 14 L 19 14 M 16 11 L 19 14 L 16 17" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
                <text x="14" y="36" textAnchor="middle" fill="#64748B" fontSize="6.5" fontWeight="600">Transfer</text>
              </g>

              {/* Pay Bills */}
              <g transform="translate(48, 0)">
                <circle cx="14" cy="14" r="13" fill="#F1F5F9" />
                <rect x="9" y="8" width="10" height="12" rx="2" fill="none" stroke="#6633EE" strokeWidth="1.5" />
                <line x1="12" y1="12" x2="16" y2="12" stroke="#6633EE" strokeWidth="1.5" />
                <text x="14" y="36" textAnchor="middle" fill="#64748B" fontSize="6.5" fontWeight="600">Pay Bills</text>
              </g>

              {/* Analytics */}
              <g transform="translate(96, 0)">
                <circle cx="14" cy="14" r="13" fill="#F1F5F9" />
                <path d="M 9 17 L 12 12 L 15 15 L 19 9" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
                <text x="14" y="36" textAnchor="middle" fill="#64748B" fontSize="6.5" fontWeight="600">Analytics</text>
              </g>
            </g>
          </g>

          {/* --- 3D Character (Isometric Professional Man pointing at Phone) --- */}
          <g transform="translate(80, 200)" filter="url(#softShadow)">
            {/* Dark Trouser / Base */}
            <path d="M 60 270 C 50 300, 70 340, 110 350 C 140 345, 160 310, 150 270 Z" fill="#1E293B" />

            {/* Crisp White Shirt Torso with Dimensional Folds */}
            <path
              d="M 60 170 C 45 200, 50 240, 65 275 C 95 285, 140 280, 155 260 C 165 220, 160 180, 145 165 Z"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1.5"
            />
            {/* Subtle Shirt Shadow Contour */}
            <path d="M 60 170 C 50 200, 55 240, 70 275 L 90 280 C 70 230, 68 190, 75 170 Z" fill="#E2E8F0" opacity="0.6" />

            {/* Right Arm (Extended towards Phone screen) */}
            <path
              d="M 130 170 C 150 175, 185 160, 215 150 C 220 148, 225 152, 222 157 C 200 175, 165 195, 140 195 Z"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1.5"
            />

            {/* Hand & Pointing Finger (Touching Screen) */}
            <path
              d="M 215 150 C 225 145, 235 140, 245 137 C 248 136, 249 140, 246 143 C 238 148, 228 155, 220 158 Z"
              fill="#FBCFE8"
            />
            {/* Hand Palm */}
            <ellipse cx="218" cy="154" rx="7" ry="5" fill="#FBCFE8" />

            {/* Neck */}
            <path d="M 98 135 L 98 150 L 118 150 L 118 135 Z" fill="#FDE68A" />

            {/* Head / Face Profile */}
            <ellipse cx="108" cy="115" rx="20" ry="24" fill="#FDE68A" />
            <path d="M 124 112 C 130 114, 130 120, 124 122 Z" fill="#FDE68A" /> {/* Nose profile */}

            {/* Modern Hair Cut (Dark Navy/Slate with Volume) */}
            <path
              d="M 88 115 C 85 90, 105 80, 125 88 C 135 93, 138 105, 132 118 C 122 110, 110 100, 95 105 Z"
              fill="#0F172A"
            />
            <path d="M 86 112 C 84 128, 92 135, 96 138 C 96 128, 90 120, 86 112 Z" fill="#0F172A" />
          </g>

          {/* --- Golden Ribbon Foreground Spiral (Loops around man and phone) --- */}
          <path
            d="M 40 460 C 80 430, 160 410, 260 450 C 370 490, 480 450, 520 340 C 530 310, 510 270, 470 290 C 420 320, 340 370, 250 360 C 140 350, 60 410, 30 460 Z"
            fill="url(#goldRibbonFront)"
            filter="url(#goldGlow)"
          />
          {/* Ribbon Gloss Top Highlight Line */}
          <path
            d="M 45 455 C 85 425, 165 405, 265 445 C 375 485, 485 445, 520 340"
            fill="none"
            stroke="url(#goldHighlight)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Paper Statement / Receipt Strip Attached to Ribbon */}
          <g transform="translate(35, 455) rotate(-15)" filter="url(#softShadow)">
            <path
              d="M 0 0 C 15 40, 30 80, 55 110 C 65 120, 105 105, 95 95 C 75 70, 55 35, 45 0 Z"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1.5"
            />
            {/* Receipt Text Lines */}
            <line x1="25" y1="25" x2="42" y2="25" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="30" y1="40" x2="52" y2="40" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="36" y1="55" x2="62" y2="55" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="42" y1="70" x2="72" y2="70" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="85" x2="80" y2="85" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* --- 3D Blue Shield of Security --- */}
          <g transform="translate(245, 470)" filter="url(#cardShadow)">
            {/* Outer Shield Rim */}
            <path
              d="M 35 0 C 60 0, 70 15, 70 35 C 70 65, 45 85, 35 95 C 25 85, 0 65, 0 35 C 0 15, 10 0, 35 0 Z"
              fill="url(#shieldBorder)"
            />
            {/* Inner Shield Body */}
            <path
              d="M 35 5 C 56 5, 64 18, 64 35 C 64 61, 43 78, 35 87 C 27 78, 6 61, 6 35 C 6 18, 14 5, 35 5 Z"
              fill="url(#shieldGrad)"
            />
            {/* White Checkmark Icon */}
            <path
              d="M 23 35 L 31 43 L 47 25"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* --- Floating 3D Gold Coins with "Rp" Currency --- */}
          {/* Coin 1: Top Right */}
          <g transform="translate(480, 240) rotate(15)" filter="url(#goldGlow)">
            <ellipse cx="22" cy="22" rx="22" ry="24" fill="url(#coinGrad)" />
            <ellipse cx="22" cy="22" rx="17" ry="19" fill="none" stroke="#FEF08A" strokeWidth="1.5" />
            <text x="22" y="27" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="13" letterSpacing="-0.5">Rp</text>
          </g>

          {/* Coin 2: Bottom Right */}
          <g transform="translate(470, 425) rotate(-18)" filter="url(#goldGlow)">
            <ellipse cx="18" cy="18" rx="18" ry="20" fill="url(#coinGrad)" />
            <ellipse cx="18" cy="18" rx="14" ry="16" fill="none" stroke="#FEF08A" strokeWidth="1.2" />
            <text x="18" y="23" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="11" letterSpacing="-0.5">Rp</text>
          </g>

          {/* Coin 3: Small Floating near Ribbon */}
          <g transform="translate(345, 135) rotate(25)" filter="url(#goldGlow)">
            <ellipse cx="13" cy="13" rx="13" ry="14" fill="url(#coinGrad)" />
            <text x="13" y="17" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="8">Rp</text>
          </g>

          {/* --- Floating Glassmorphism Tiles --- */}
          {/* Tile 1: Bank / Temple Icon (Top Left) */}
          <g transform="translate(75, 130)" filter="url(#softShadow)">
            <rect x="0" y="0" width="52" height="52" rx="16" fill="url(#glassCardGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
            {/* Bank Temple Icon */}
            <path d="M 16 23 L 26 15 L 36 23 Z" fill="#2563EB" />
            <rect x="18" y="24" width="3.5" height="11" rx="1" fill="#2563EB" />
            <rect x="24.5" y="24" width="3.5" height="11" rx="1" fill="#2563EB" />
            <rect x="31" y="24" width="3.5" height="11" rx="1" fill="#2563EB" />
            <rect x="15" y="35" width="22" height="3" rx="1" fill="#2563EB" />
          </g>

          {/* Tile 2: Credit Card (Middle Left) */}
          <g transform="translate(210, 170)" filter="url(#softShadow)">
            <rect x="0" y="0" width="60" height="44" rx="14" fill="url(#glassCardGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="10" y="14" width="40" height="4" rx="1.5" fill="#3B82F6" />
            <rect x="10" y="24" width="16" height="5" rx="1" fill="#93C5FD" />
          </g>

          {/* Tile 3: Growth Chart Arrow (Top Right) */}
          <g transform="translate(420, 65)" filter="url(#softShadow)">
            <rect x="0" y="0" width="56" height="56" rx="18" fill="url(#glassCardGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
            <path d="M 16 38 L 24 28 L 30 32 L 40 18" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 32 18 L 40 18 L 40 26" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Tile 4: Bar Chart (Bottom Right) */}
          <g transform="translate(415, 330)" filter="url(#softShadow)">
            <rect x="0" y="0" width="58" height="58" rx="18" fill="url(#glassCardGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="16" y="32" width="6" height="12" rx="2" fill="#93C5FD" />
            <rect x="26" y="24" width="6" height="20" rx="2" fill="#3B82F6" />
            <rect x="36" y="16" width="6" height="28" rx="2" fill="#1D4ED8" />
          </g>

        </g>
      </svg>
    </div>
  );
}
