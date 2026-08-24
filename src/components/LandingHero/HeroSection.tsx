/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, FileText, ChevronDown, Landmark, Scale, HelpCircle } from 'lucide-react';
import { HeroVisualSystem } from './HeroVisualSystem';

interface HeroSectionProps {
  onStartIntake: () => void;
  onOpenBlankTemplate: () => void;
  onOpenLawyers?: () => void;
  onScrollToNarrative: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartIntake,
  onOpenBlankTemplate,
  onOpenLawyers,
  onScrollToNarrative,
}) => {
  const [isKnocking, setIsKnocking] = useState(false);

  const handleMulaiMenggugatClick = () => {
    if (isKnocking) return;
    setIsKnocking(true);

    // Gavel knock animation duration: 900ms.
    // Transition to intake ("Ceritakan masalah anda") exactly 0.5s (500ms) after animation completes (900ms + 500ms = 1400ms)
    setTimeout(() => {
      onStartIntake();
    }, 1400);
  };
  return (
    <section className="relative overflow-hidden bg-[#FAF9F5] border-b border-stone-200 pt-8 sm:pt-14 pb-14 sm:pb-20">
      {/* Editorial Watermark Margin Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#881337]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Editorial Typography & CTAs (7 Columns) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            
            {/* Eyebrow Label */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 border border-stone-300/80 rounded-xs text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-widest text-[#881337]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#881337]" />
              HAK KONSTITUSIONAL ADALAH HAK SEMUA
            </motion.div>

            {/* Massive Display Headline */}
            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-stone-900 tracking-tight leading-[0.98] select-text"
              >
                RAKYAT<br />
                <span className="text-[#881337] underline decoration-stone-300 decoration-wavy decoration-1 underline-offset-8">
                  MENGGUGAT.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-serif text-xl sm:text-2xl text-stone-800 font-medium pt-2 leading-snug"
              >
                Ketika sebuah aturan merugikan Anda, <br className="hidden sm:inline" />
                <span className="text-stone-900 font-semibold">Anda berhak mempertanyakannya.</span>
              </motion.p>
            </div>

            {/* Substantive Editorial Statement */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-stone-700 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal"
            >
              Platform nirlaba pemberdayaan hukum warga negara. Kami membantu Anda menguji apakah kerugian yang dialami bertentangan dengan Undang-Undang Dasar 1945, menentukan yurisdiksi yang tepat (<strong>MK</strong> atau <strong>MA</strong>), mengumpulkan bukti, dan menyusun draf permohonan resmi secara mandiri.
            </motion.p>

            {/* Transformation Ribbon: Visual sequence from Question to Petition */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="py-3 px-3.5 bg-stone-100/90 border border-stone-200 rounded-sm flex items-center gap-1.5 sm:gap-2 flex-wrap font-mono text-[10px] sm:text-xs text-stone-700"
            >
              <span className="font-bold text-[#881337]">PROSES:</span>
              <span className="bg-white px-1.5 py-0.5 border border-stone-300 rounded-xs">Tanya</span>
              <span className="text-stone-400">→</span>
              <span className="bg-white px-1.5 py-0.5 border border-stone-300 rounded-xs">Cerita</span>
              <span className="text-stone-400">→</span>
              <span className="bg-white px-1.5 py-0.5 border border-stone-300 rounded-xs">Uji Kamar (MK/MA)</span>
              <span className="text-stone-400">→</span>
              <span className="bg-white px-1.5 py-0.5 border border-stone-300 rounded-xs">Bukti</span>
              <span className="text-stone-400">→</span>
              <span className="bg-[#881337] text-white px-1.5 py-0.5 rounded-xs font-semibold">Draf Permohonan</span>
            </motion.div>

            {/* CTAs Section */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              {/* Primary Action Button */}
              <button
                id="hero-primary-cta"
                onClick={handleMulaiMenggugatClick}
                disabled={isKnocking}
                className={`group relative inline-flex items-center justify-center gap-3 bg-[#881337] hover:bg-[#70102e] text-white px-7 py-3.5 rounded-xs text-base font-semibold tracking-wide shadow-md border-b-3 border-[#4c0519] active:translate-y-0.5 transition-all duration-150 cursor-pointer ${
                  isKnocking ? 'opacity-90 cursor-wait' : ''
                }`}
              >
                <span>{isKnocking ? 'Membuka Sidang Rakyat...' : 'Mulai Menggugat!'}</span>
                <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${isKnocking ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
              </button>

              {/* Secondary Action: Learn Rights */}
              <button
                id="hero-secondary-learn-cta"
                onClick={onScrollToNarrative}
                className="inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200/80 text-stone-800 px-5 py-3.5 rounded-xs text-sm font-medium border border-stone-300 transition-colors duration-150 cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-stone-600" />
                <span>Pelajari Cara Kerja</span>
              </button>

              {/* Tertiary: Blank Template */}
              <button
                id="hero-blank-template-cta"
                onClick={onOpenBlankTemplate}
                className="inline-flex items-center justify-center gap-1.5 text-stone-600 hover:text-stone-900 px-3 py-2 text-xs font-medium hover:underline transition-all cursor-pointer"
                title="Unduh atau isi format permohonan tanpa bantuan AI"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Formulir Kosong</span>
              </button>
            </motion.div>

            {/* Constitutional Legal Safety & Integrity Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-600 border-t border-stone-200/80"
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Bukan Kantor Hukum • Alat Bantu Mandiri</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Standar Hukum Acara MK & MA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-stone-500 shrink-0" />
                <span>100% Gratis & Nirlaba</span>
              </div>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Procedural Visual System (5 Columns, Desktop only - hidden on mobile and tablet) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex lg:col-span-5 items-center justify-center"
          >
            <HeroVisualSystem isKnocking={isKnocking} />
          </motion.div>

        </div>
      </div>

      {/* Downward Scroll Indicator */}
      <div className="w-full flex justify-center pt-8 sm:pt-12">
        <button
          onClick={onScrollToNarrative}
          className="flex flex-col items-center gap-1 text-stone-500 hover:text-[#881337] transition-colors cursor-pointer group"
          aria-label="Gulir ke narasi interaktif"
        >
          <span className="font-mono text-[10px] tracking-widest uppercase text-stone-500 group-hover:text-[#881337]">
            Eksplorasi Hak & Bukti
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce text-stone-500 group-hover:text-[#881337]" />
        </button>
      </div>
    </section>
  );
};
