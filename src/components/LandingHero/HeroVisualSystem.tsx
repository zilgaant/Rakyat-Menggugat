/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface HeroVisualSystemProps {
  isKnocking?: boolean;
}

export const HeroVisualSystem: React.FC<HeroVisualSystemProps> = ({ isKnocking = false }) => {
  const shouldReduceMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeAnnotation, setActiveAnnotation] = useState<number>(0);

  const annotations = [
    { label: 'UUD 1945 — Pasal 28D (1)', sub: 'Jaminan kepastian hukum yang adil' },
    { label: 'Putusan MK 006/PUU-III/2005', sub: '5 Syarat Kumulatif Kerugian Konstitusional' },
    { label: 'Pasal 24C UUD 1945', sub: 'Kewenangan Pengujian UU terhadap Konstitusi' },
    { label: 'Norma Posita & Causal Verband', sub: 'Hubungan Kausalitas Kerugian Hak Nyata' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAnnotation((prev) => (prev + 1) % annotations.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [annotations.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[1/1] max-w-xl mx-auto flex items-center justify-center p-4 select-none"
      aria-label="Sistem Geometri Konstitusional dan Ilustrasi Prosedural Hak Warga"
    >
      {/* Background Architectural Drafting Grid */}
      <svg
        className="absolute inset-0 w-full h-full text-stone-300/70 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="civic-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" />
          </pattern>
          <pattern id="civic-dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.75" fill="currentColor" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#civic-grid)" />
        <rect width="100%" height="100%" fill="url(#civic-dots)" />
      </svg>

      {/* Outer Editorial Margin Framing */}
      <div className="absolute inset-2 sm:inset-4 border border-stone-300/80 pointer-events-none">
        {/* Margin corner crosses */}
        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 text-stone-500 font-mono text-[9px] leading-none">+</div>
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 text-stone-500 font-mono text-[9px] leading-none text-right">+</div>
        <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 text-stone-500 font-mono text-[9px] leading-none">+</div>
        <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 text-stone-500 font-mono text-[9px] leading-none text-right">+</div>

        {/* Technical drafting metadata labels */}
        <div className="absolute top-2 left-3 font-mono text-[9px] tracking-wider text-stone-400 uppercase">
          SEC.01 // RATIO-DECIDENDI // DOKUMEN-UJI-MATERIIL
        </div>
        <div className="absolute bottom-2 right-3 font-mono text-[9px] tracking-widest text-[#881337] font-semibold uppercase flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#881337] animate-pulse" />
          YURISDIKSI MK / MA
        </div>
      </div>

      {/* Main Procedural Geometric Constitution & Gavel System */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: mousePos.x,
                y: mousePos.y,
              }
        }
        transition={{ type: 'spring', damping: 20, stiffness: 120 }}
        className="relative w-full max-w-[420px] aspect-square flex items-center justify-center"
      >
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rich Authentic Polished Wood & Brass Palette */}
            <linearGradient id="gavelWoodHead" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D4C41" />
              <stop offset="30%" stopColor="#4E342E" />
              <stop offset="70%" stopColor="#3E2723" />
              <stop offset="100%" stopColor="#27140E" />
            </linearGradient>
            <linearGradient id="gavelWoodShaft" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#795548" />
              <stop offset="30%" stopColor="#5D4037" />
              <stop offset="70%" stopColor="#3E2723" />
              <stop offset="100%" stopColor="#27140E" />
            </linearGradient>
            <linearGradient id="gavelCapWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4E342E" />
              <stop offset="100%" stopColor="#1B0C07" />
            </linearGradient>
            <linearGradient id="brassGold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="35%" stopColor="#FDE68A" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
            <linearGradient id="soundingBlockWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5D4037" />
              <stop offset="50%" stopColor="#3E2723" />
              <stop offset="100%" stopColor="#1D0E09" />
            </linearGradient>

            {/* Sophisticated Ambient Drop Shadow for Floating Gavel */}
            <filter id="gavelElevationShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="2" dy="14" stdDeviation="9" floodColor="#0F172A" floodOpacity="0.38" />
            </filter>

            <style>{`
              @keyframes gavelLevitate {
                0%, 100% {
                  transform: translate(220px, 255px) rotate(-24deg);
                }
                35% {
                  transform: translate(220px, 240px) rotate(-27deg);
                }
                70% {
                  transform: translate(220px, 248px) rotate(-22deg);
                }
              }

              @keyframes shadowBreathe {
                0%, 100% {
                  transform: scale(1);
                  opacity: 0.45;
                }
                35% {
                  transform: scale(0.82);
                  opacity: 0.22;
                }
                70% {
                  transform: scale(0.92);
                  opacity: 0.35;
                }
              }

              /* Authentic Judicial Strike Sequence */
              @keyframes gavelKnock {
                0% {
                  transform: translate(220px, 255px) rotate(-9deg);
                }
                24% {
                  transform: translate(240px, 100px) rotate(45deg);
                }
                50% {
                  transform: translate(238px, 90px) rotate(50deg);
                }
                54% {
                  transform: translate(220px, 290px) rotate(-9deg);
                }
                64% {
                  transform: translate(220px, 280px) rotate(-12deg);
                }
                74% {
                  transform: translate(220px, 290px) rotate(-9deg);
                }
                100% {
                  transform: translate(220px, 290px) rotate(-9deg);
                }
              }

              @keyframes shadowKnock {
                0% {
                  transform: scale(1);
                  opacity: 0.45;
                }
                24% {
                  transform: scale(0.6);
                  opacity: 0.15;
                }
                54% {
                  transform: scale(1.25);
                  opacity: 0.85;
                }
                64% {
                  transform: scale(0.95);
                  opacity: 0.5;
                }
                74%, 100% {
                  transform: scale(1.2);
                  opacity: 0.8;
                }
              }

              @keyframes impactRaysBurst {
                0%, 52% {
                  opacity: 0;
                  transform: scale(0.3);
                }
                54% {
                  opacity: 1;
                  transform: scale(1);
                }
                72% {
                  opacity: 0.8;
                  transform: scale(1.15);
                }
                100% {
                  opacity: 0;
                  transform: scale(1.35);
                }
              }

              @keyframes shockwaveRipples {
                0%, 52% {
                  opacity: 0;
                  transform: scale(0.2);
                }
                54% {
                  opacity: 0.95;
                  transform: scale(0.4);
                }
                74% {
                  opacity: 0.5;
                  transform: scale(1.3);
                }
                100% {
                  opacity: 0;
                  transform: scale(2.0);
                }
              }

              @keyframes blockTremor {
                0%, 52% {
                  transform: translateY(0);
                }
                54% {
                  transform: translateY(3.5px);
                }
                60% {
                  transform: translateY(-1px);
                }
                68% {
                  transform: translateY(2px);
                }
                76%, 100% {
                  transform: translateY(0);
                }
              }

              .gavel-floating-actor {
                animation: gavelLevitate 4.6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
              }

              .gavel-knocking-actor {
                animation: gavelKnock 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
              }

              .shadow-breathing-actor {
                transform-origin: 220px 388px;
                transform-box: view-box;
                animation: shadowBreathe 4.6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
              }

              .shadow-knocking-actor {
                transform-origin: 220px 388px;
                transform-box: view-box;
                animation: shadowKnock 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
              }

              .impact-rays-actor {
                transform-origin: 220px 355px;
                transform-box: view-box;
                animation: impactRaysBurst 0.9s ease-out forwards;
              }

              .shockwave-actor {
                transform-origin: 220px 358px;
                transform-box: view-box;
                animation: shockwaveRipples 0.9s ease-out forwards;
              }

              .block-tremor-actor {
                transform-origin: 220px 380px;
                transform-box: view-box;
                animation: blockTremor 0.9s ease-out forwards;
              }
            `}</style>
          </defs>

          {/* LAYER 1: Geometric Concentric Precision Rings (Constitutional Geometry) */}
          <g className="text-stone-300">
            <circle cx="250" cy="250" r="210" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
            <circle cx="250" cy="250" r="160" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
            <circle cx="250" cy="250" r="110" fill="none" stroke="#881337" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
            
            {/* Radial coordinate ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="250"
                y1="40"
                x2="250"
                y2="48"
                stroke="currentColor"
                strokeWidth="1.5"
                transform={`rotate(${deg} 250 250)`}
              />
            ))}
          </g>

          {/* LAYER 2: Abstract Constitution Parchment Folio (Base of Law) */}
          <g id="constitutional-folio">
            {/* Folio drop backdrop */}
            <rect
              x="130"
              y="110"
              width="240"
              height="280"
              rx="2"
              fill="#F4F4EE"
              stroke="#CBD5E1"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            {/* Left margin red legal rule */}
            <line x1="170" y1="110" x2="170" y2="390" stroke="#881337" strokeWidth="1.5" opacity="0.6" />
            
            {/* Typographic legal lines inside folio */}
            <line x1="185" y1="150" x2="340" y2="150" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
            <line x1="185" y1="170" x2="320" y2="170" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="185" y1="190" x2="335" y2="190" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />
            
            <line x1="185" y1="225" x2="310" y2="225" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="185" y1="240" x2="325" y2="240" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="185" y1="255" x2="280" y2="255" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

            {/* Official seal watermark emboss in folio */}
            <circle cx="320" cy="340" r="22" fill="none" stroke="#881337" strokeWidth="1.5" strokeDasharray="3 2" />
            <text x="320" y="343" textAnchor="middle" fill="#881337" fontSize="8" fontFamily="sans-serif" fontWeight="bold">UUD 1945</text>
          </g>

          {/* LAYER 3: The Authentic Constitutional Gavel Mallet & Sounding Block */}
          <g id="constitutional-gavel">
            {/* Circular Sounding Block / Legal Pedestal */}
            <g id="sounding-block" className={isKnocking ? 'block-tremor-actor' : ''}>
              {/* Dynamic contact shadow that breathes or intensifies on strike */}
              <ellipse
                cx="220"
                cy="388"
                rx="85"
                ry="22"
                fill="#090403"
                className={isKnocking ? 'shadow-knocking-actor' : 'shadow-breathing-actor'}
              />
              {/* Pedestal Base Tier */}
              <ellipse cx="220" cy="384" rx="78" ry="20" fill="url(#soundingBlockWood)" stroke="#27140E" strokeWidth="1.5" />
              {/* Pedestal Mid Tier */}
              <ellipse cx="220" cy="374" rx="66" ry="16" fill="url(#gavelWoodHead)" stroke="#4E342E" strokeWidth="1" />
              {/* Pedestal Top Brass Strike Pad */}
              <ellipse cx="220" cy="362" rx="54" ry="12" fill="url(#brassGold)" stroke="#92400E" strokeWidth="1" />
              {/* Inner Sounding Rosewood Insert */}
              <ellipse cx="220" cy="361" rx="44" ry="9" fill="#2E1812" stroke="#4E342E" strokeWidth="0.8" />

              {/* Dynamic Shockwave Ripples upon Impact */}
              {isKnocking && (
                <g id="impact-shockwaves" className="shockwave-actor pointer-events-none">
                  <ellipse cx="220" cy="360" rx="42" ry="12" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
                  <ellipse cx="220" cy="360" rx="70" ry="20" fill="none" stroke="#881337" strokeWidth="2" strokeDasharray="4 2" />
                  <ellipse cx="220" cy="360" rx="98" ry="28" fill="none" stroke="#FDE68A" strokeWidth="1.5" />
                </g>
              )}

              {/* Dynamic Impact Burst Rays (Exact 3-Left + 3-Right signature from reference image) */}
              {isKnocking && (
                <g id="impact-burst-rays" className="impact-rays-actor pointer-events-none">
                  {/* Left 3 Impact Rays */}
                  <line x1="165" y1="338" x2="132" y2="322" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="158" y1="358" x2="122" y2="358" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
                  <line x1="165" y1="378" x2="132" y2="394" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />

                  {/* Right 3 Impact Rays */}
                  <line x1="275" y1="338" x2="308" y2="322" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="282" y1="358" x2="318" y2="358" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
                  <line x1="275" y1="378" x2="308" y2="394" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
                </g>
              )}
            </g>

            {/* Unified Gavel Mallet Assembly (Floating or Striking on command) */}
            <g
              id="floating-gavel-assembly"
              className={isKnocking ? 'gavel-knocking-actor' : 'gavel-floating-actor'}
              filter="url(#gavelElevationShadow)"
            >
              {/* Gavel Handle: Extending from the side/waist of the mallet head diagonally up-right */}
              <g id="gavel-handle">
                {/* Neck Brass Ferrule at Head Junction */}
                <rect
                  x="18"
                  y="-8"
                  width="10"
                  height="16"
                  rx="2"
                  fill="url(#brassGold)"
                  stroke="#92400E"
                  strokeWidth="0.8"
                />

                {/* Turned Hardwood Handle Shaft */}
                <rect
                  x="26"
                  y="-6"
                  width="168"
                  height="12"
                  rx="4"
                  fill="url(#gavelWoodShaft)"
                  stroke="#27140E"
                  strokeWidth="1.2"
                />

                {/* Grip Accent Brass Rings */}
                <rect
                  x="120"
                  y="-7.5"
                  width="6"
                  height="15"
                  rx="1"
                  fill="url(#brassGold)"
                />
                <rect
                  x="145"
                  y="-7.5"
                  width="4"
                  height="15"
                  rx="1"
                  fill="url(#brassGold)"
                />

                {/* Turned Pommel / End Knob */}
                <rect
                  x="190"
                  y="-9"
                  width="18"
                  height="18"
                  rx="5"
                  fill="url(#gavelCapWood)"
                  stroke="#1B0C07"
                  strokeWidth="1"
                />
                <rect
                  x="188"
                  y="-8"
                  width="3"
                  height="16"
                  rx="1"
                  fill="url(#brassGold)"
                />
              </g>

              {/* Gavel Head: Cylindrical Mallet with Top Cap, Barrel Body, Center Waist & Bottom Strike Face */}
              <g id="gavel-head">
                {/* Top Rounded Cap (Crown) */}
                <rect
                  x="-25"
                  y="-68"
                  width="50"
                  height="16"
                  rx="4"
                  fill="url(#gavelCapWood)"
                  stroke="#1B0C07"
                  strokeWidth="1.2"
                />
                {/* Top Brass Collar */}
                <rect
                  x="-23"
                  y="-52"
                  width="46"
                  height="6"
                  rx="1.5"
                  fill="url(#brassGold)"
                />

                {/* Upper Mallet Barrel (Walnut Wood) */}
                <rect
                  x="-21"
                  y="-46"
                  width="42"
                  height="34"
                  fill="url(#gavelWoodHead)"
                  stroke="#27140E"
                  strokeWidth="1.5"
                />

                {/* Center Waist Inlay & Brass Trim Bands (Handle anchors into this waist) */}
                <rect
                  x="-22"
                  y="-12"
                  width="44"
                  height="24"
                  fill="url(#gavelCapWood)"
                />
                <rect
                  x="-23"
                  y="-12"
                  width="46"
                  height="4"
                  fill="url(#brassGold)"
                />
                <rect
                  x="-23"
                  y="8"
                  width="46"
                  height="4"
                  fill="url(#brassGold)"
                />

                {/* Lower Mallet Barrel (Walnut Wood) */}
                <rect
                  x="-21"
                  y="12"
                  width="42"
                  height="34"
                  fill="url(#gavelWoodHead)"
                  stroke="#27140E"
                  strokeWidth="1.5"
                />

                {/* Lower Brass Collar */}
                <rect
                  x="-23"
                  y="46"
                  width="46"
                  height="6"
                  rx="1.5"
                  fill="url(#brassGold)"
                />

                {/* Bottom Striking Face / Base Cap (Slams directly into the sounding block) */}
                <rect
                  x="-25"
                  y="52"
                  width="50"
                  height="16"
                  rx="4"
                  fill="url(#gavelCapWood)"
                  stroke="#1B0C07"
                  strokeWidth="1.2"
                />
                {/* Bottom Brass Strike Ring */}
                <rect
                  x="-22"
                  y="62"
                  width="44"
                  height="4"
                  rx="1"
                  fill="url(#brassGold)"
                />
              </g>
            </g>
          </g>

          {/* LAYER 4: Dynamic Connecting Vector Lines & Precision Brackets */}
          <g id="drafting-vectors">
            {/* Upper-right connecting bracket */}
            <path
              d="M 380 90 L 430 90 L 430 160"
              fill="none"
              stroke="#881337"
              strokeWidth="1.5"
            />
            <circle cx="380" cy="90" r="3" fill="#881337" />
            <circle cx="430" cy="160" r="3" fill="#881337" />

            {/* Lower-left citation pointer */}
            <path
              d="M 80 340 L 130 340 L 150 360"
              fill="none"
              stroke="#475569"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <circle cx="80" cy="340" r="3" fill="#475569" />
          </g>
        </svg>

        {/* Live Dynamic Annotation Badge (Floating Editorial Stamp aligned left like SEC.01) */}
        <motion.div
          key={activeAnnotation}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute -bottom-3 sm:-bottom-5 left-0 sm:left-2 max-w-[290px] sm:max-w-[340px] bg-stone-900 text-stone-100 px-4 py-2.5 rounded-xs border-l-3 border-[#881337] shadow-xl z-20"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase text-rose-400 tracking-wider font-semibold">
              Rujukan Hukum Teruji #{activeAnnotation + 1}
            </span>
            <span className="text-[10px] font-mono text-stone-400">PASAL RESMI</span>
          </div>
          <div className="font-serif text-xs sm:text-sm font-semibold text-white mt-0.5">
            {annotations[activeAnnotation].label}
          </div>
          <p className="text-[11px] text-stone-300 mt-0.5 leading-snug">
            {annotations[activeAnnotation].sub}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
