/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface QuestionNarrativeSectionProps {
  onStartIntake: () => void;
}

export const QuestionNarrativeSection: React.FC<QuestionNarrativeSectionProps> = ({ onStartIntake }) => {
  const [selectedScenario, setSelectedScenario] = useState<number>(0);

  const scenarios = [
    {
      title: 'Pekerja & Hak Kesejahteraan',
      problem: 'Sebuah pasal dalam UU memotong hak pesangon minimum dan melonggarkan aturan alih daya tanpa batasan waktu yang jelas.',
      harm: 'Kerugian aktual: Hak atas perlindungan upah dan kepastian kerja yang adil (Pasal 28D ayat 2 UUD 1945).',
      remedy: 'Jalur Gugatan: Uji Materiil UU ke Mahkamah Konstitusi (MK).',
    },
    {
      title: 'Masyarakat Adat & Ruang Hidup',
      problem: 'Peraturan Pemerintah (PP) turunan mempermudah izin konsesi di hutan adat tanpa melalui musyawarah adat.',
      harm: 'Kerugian potensial: Hak atas kesatuan masyarakat hukum adat dan lingkungan hidup sehat (Pasal 18B & 28H UUD 1945).',
      remedy: 'Jalur Gugatan: Uji Materiil PP terhadap UU Kehutanan ke Mahkamah Agung (MA).',
    },
    {
      title: 'Penggiat Digital & Kebebasan Informasi',
      problem: 'Pasal karet dalam undang-undang yang mengkriminalisasi kritik masyarakat dan jurnalisme investigasi.',
      harm: 'Kerugian nyata: Hak atas kebebasan menyatakan pendapat dan berkomunikasi (Pasal 28E ayat 3 & 28F UUD 1945).',
      remedy: 'Jalur Gugatan: Uji Konstitusionalitas Pasal UU ke Mahkamah Konstitusi (MK).',
    },
  ];

  return (
    <section className="bg-white border-b border-stone-200 py-16 sm:py-24 relative">
      {/* Background Section Index Watermark */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Editorial Numbering */}
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4 mb-8">
          <span className="font-mono text-xs font-bold text-[#881337] tracking-widest uppercase">
            BAGIAN 01 // HAK DASAR
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-xs text-stone-500 font-sans">
            Prinsip Fundamental Negara Hukum (Rechtsstaat)
          </span>
        </div>

        {/* Large Editorial Statement: THE QUESTION */}
        <div className="max-w-4xl space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.08] tracking-tight">
            &ldquo;Kalau sebuah aturan merugikan Anda, <br className="hidden sm:inline" />
            bolehkah Anda menggugatnya?&rdquo;
          </h2>

          {/* The Answer Revealed */}
          <div className="flex items-start sm:items-center gap-4 pt-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xs bg-[#881337] text-white flex items-center justify-center font-serif text-2xl sm:text-4xl font-black shrink-0 shadow-md">
              YA.
            </div>
            <div>
              <p className="font-serif text-lg sm:text-2xl font-bold text-stone-900">
                Konstitusi menjamin hak Anda untuk menggugat norma yang keliru.
              </p>
              <p className="text-xs sm:text-sm text-stone-600 font-mono mt-0.5">
                Rujukan: Pasal 28D ayat (1) UUD 1945 & Pasal 51 ayat (1) UU No. 24/2003 jo. UU No. 7/2020.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Scenario Cards */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
              Contoh Kasus Nyata di Lapangan:
            </h3>
            <span className="text-xs text-stone-500 font-mono hidden sm:inline">
              PILIH CONTOH PERKARA
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {scenarios.map((item, idx) => {
              const isSelected = selectedScenario === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedScenario(idx)}
                  className={`text-left p-5 rounded-xs transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-stone-50 border-[#881337] shadow-md ring-1 ring-[#881337]'
                      : 'bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif font-bold text-stone-900 text-base">
                      {item.title}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#881337] text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed mb-3">
                    {item.problem}
                  </p>
                  <div className="text-[11px] font-medium text-[#881337] bg-rose-50/80 p-2 rounded-xs border border-rose-100">
                    <strong>Dasar Kerugian:</strong> {item.harm}
                  </div>
                  <div className="text-[11px] font-mono text-stone-600 mt-2">
                    {item.remedy}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Direct Trigger to Case Intake */}
          <div className="mt-8 bg-stone-50 border border-stone-200 p-5 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <p className="font-serif font-bold text-sm sm:text-base text-stone-900">
                Punya persoalan aturan yang merugikan Anda atau komunitas Anda?
              </p>
              <p className="text-xs text-stone-600">
                Uji fakta kasus Anda dalam 5 menit melalui percakapan hukum terpandu.
              </p>
            </div>
            <button
              onClick={onStartIntake}
              className="bg-[#881337] hover:bg-[#70102e] text-white px-5 py-2.5 rounded-xs text-xs sm:text-sm font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              <span>Periksa Kasus Saya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
