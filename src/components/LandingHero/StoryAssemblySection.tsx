/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

export const StoryAssemblySection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const rawFragments = [
    { text: '“Pabrik tempat saya bekerja 12 tahun tiba-tiba melakukan PHK massal tanpa pesangon layak dengan dalih pasal baru.”', tag: 'Curhatan Warga' },
    { text: '“Kami tidak punya uang ratusan juta untuk menyewa pengacara elit ke Jakarta.”', tag: 'Keterbatasan Akses' },
    { text: '“Aturannya katanya sah, tapi jelas-jelas membuat keluarga kami tidak bisa makan.”', tag: 'Dampak Nyata' },
  ];

  const structuredSections = [
    {
      title: 'I. KEDUDUKAN HUKUM (LEGAL STANDING)',
      content: 'Pemohon adalah Warga Negara Indonesia perorangan yang mengalami kerugian hak konstitusional secara spesifik, aktual, dan memiliki hubungan kausal (causal verband) dengan berlakunya Pasal a quo.',
      badge: '5 Syarat Putusan MK 006/PUU-III/2005 Terpenuhi',
    },
    {
      title: 'II. BATU UJI KONSTITUSIONAL',
      content: 'Bertentangan dengan Pasal 28D ayat (2) UUD 1945: "Setiap orang berhak untuk bekerja serta mendapat imbalan dan perlakuan yang adil dan layak dalam hubungan kerja."',
      badge: 'Norma Konstitusi Tertinggi',
    },
    {
      title: 'III. ALASAN PERMOHONAN (POSITA)',
      content: 'Konstruksi hukum membuktikan pasal tersebut mendegradasi jaminan kepastian upah layak menjadi ketidakpastian sepihak yang melanggar asas keadilan sosial.',
      badge: 'Argumentasi Doktriner & Yuridis',
    },
  ];

  return (
    <section className="bg-[#FAF9F5] border-b border-stone-200 py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4 mb-8">
          <span className="font-mono text-xs font-bold text-[#881337] tracking-widest uppercase">
            BAGIAN 02 // TRANSFORMASI CERITA
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-xs text-stone-500 font-sans">
            Dari Bahasa Awam Menjadi Konstruksi Hukum Formal
          </span>
        </div>

        {/* Narrative Intro */}
        <div className="max-w-3xl space-y-3 mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
            Ceritakan Masalah Anda Apa Adanya.
          </h2>
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
            Anda tidak perlu menghafal pasal hukum yang rumit. Sistem kami membantu merapikan fakta lapangan, dokumen pendukung, dan dampak yang dialami menjadi format hukum acara resmi.
          </p>
        </div>

        {/* Interactive Side-by-Side Transformation Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Raw Human Story Fragments (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-stone-300 rounded-xs p-6 sm:p-7 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <span className="font-mono text-xs font-bold text-stone-500 uppercase tracking-wider">
                  1. Masukan Bahasa Awam
                </span>
                <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded-xs">
                  FAKTA LAPANGAN
                </span>
              </div>

              <div className="space-y-3.5">
                {rawFragments.map((frag, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-stone-50 border-l-2 border-amber-600 text-xs sm:text-sm text-stone-800 italic leading-relaxed rounded-r-xs"
                  >
                    <p>{frag.text}</p>
                    <span className="block not-italic font-mono text-[10px] text-stone-500 mt-1 uppercase font-semibold">
                      • {frag.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Diceritakan secara santai tanpa format hukum khusus.</span>
            </div>
          </div>

          {/* MIDDLE: Transformation Vector Indicator (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center py-4 lg:py-0">
            <div className="w-10 h-10 rounded-full bg-[#881337] text-white flex items-center justify-center shadow-md">
              <ArrowRight className="w-5 h-5 hidden lg:block" />
              <span className="lg:hidden text-xs font-bold font-mono">PROSES</span>
            </div>
            <div className="mt-2 text-center">
              <span className="font-mono text-[10px] tracking-wider uppercase text-stone-500 font-bold block">
                Sistem Analisis
              </span>
              <span className="text-[9px] text-stone-400 font-mono block">
                4-Layer Legal Engine
              </span>
            </div>
          </div>

          {/* RIGHT: Structured Legal Petition Document Output (5 Cols) */}
          <div className="lg:col-span-5 bg-stone-900 text-stone-100 border border-stone-800 rounded-xs p-6 sm:p-7 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  2. Draf Permohonan Resmi
                </span>
                <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-xs">
                  STANDAR MK RI
                </span>
              </div>

              <div className="space-y-4">
                {structuredSections.map((sec, idx) => (
                  <div key={idx} className="bg-stone-800/80 p-3.5 rounded-xs border border-stone-700/60">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-serif text-xs font-bold text-amber-200">
                        {sec.title}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed font-sans">
                      {sec.content}
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded-xs border border-emerald-800">
                      ✓ {sec.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <span>Siap Diunduh (.DOCX / .PDF)</span>
              <span className="font-mono text-[#F43F5E] font-semibold">Tersertifikasi Format Panitera</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
