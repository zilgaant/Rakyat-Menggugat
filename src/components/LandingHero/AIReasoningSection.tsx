/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Database, CheckCircle2, Search, ArrowRight } from 'lucide-react';

export const AIReasoningSection: React.FC = () => {
  return (
    <section className="bg-stone-900 text-stone-100 border-b border-stone-800 py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 border-b border-stone-800 pb-4 mb-8">
          <span className="font-mono text-xs font-bold text-rose-400 tracking-widest uppercase">
            BAGIAN 05 // SISTEM ANALISIS YURIDIS
          </span>
          <span className="text-stone-600">|</span>
          <span className="text-xs text-stone-400 font-sans">
            Bukan AI Ajaib, Melainkan Penalaran Hukum Berbasis Data Otentik
          </span>
        </div>

        {/* Title */}
        <div className="max-w-3xl space-y-3 mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            AI Membantu Menyusunnya Secara Terstruktur.
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Rakyat Menggugat menggunakan arsitektur agen ganda (<em>Dual-Agent Framework</em>) yang memisahkan peran penyusunan fakta dan pengujian validitas hukum untuk mencegah halusinasi pasal.
          </p>
        </div>

        {/* 3 Pillars of Structured AI Reasoning */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: Retrieval Grounding */}
          <div className="bg-stone-800/80 border border-stone-700 p-6 rounded-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xs bg-[#881337] text-white flex items-center justify-center font-mono font-bold text-xs">
                01
              </div>
              <h3 className="font-serif text-lg font-bold text-white">
                Rujukan Basis Hukum Terverifikasi
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Setiap pasal batu uji dan yurisprudensi ditautkan langsung ke teks asli UUD 1945, lembaran negara UU resmi, dan traktat putusan Mahkamah Konstitusi. Tidak mengarang nomor pasal.
              </p>
            </div>
            <div className="pt-4 border-t border-stone-700 mt-6 flex items-center gap-1.5 text-xs text-rose-300 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Anti-Hallucination Grounding</span>
            </div>
          </div>

          {/* Pillar 2: Dual-Agent Verification */}
          <div className="bg-stone-800/80 border border-stone-700 p-6 rounded-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xs bg-[#881337] text-white flex items-center justify-center font-mono font-bold text-xs">
                02
              </div>
              <h3 className="font-serif text-lg font-bold text-white">
                Pengujian Independen (2-Step Review)
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Draf yang disusun oleh Agen Analisis diuji ulang secara independen oleh Agen Verifikator yang bertindak sebagai panel hakim kritis untuk menemukan kelemahan dalil sebelum diajukan.
              </p>
            </div>
            <div className="pt-4 border-t border-stone-700 mt-6 flex items-center gap-1.5 text-xs text-rose-300 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Adversarial Validation</span>
            </div>
          </div>

          {/* Pillar 3: Confidence Score & Threshold */}
          <div className="bg-stone-800/80 border border-stone-700 p-6 rounded-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xs bg-[#881337] text-white flex items-center justify-center font-mono font-bold text-xs">
                03
              </div>
              <h3 className="font-serif text-lg font-bold text-white">
                Transparansi Kelayakan Terukur
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Jika kasus dinilai lemah atau tidak memenuhi syarat kedudukan hukum (legal standing), sistem akan berkata jujur secara terbuka daripada memberikan harapan palsu.
              </p>
            </div>
            <div className="pt-4 border-t border-stone-700 mt-6 flex items-center gap-1.5 text-xs text-rose-300 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Jujur & Tanpa Janji Palsu</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
