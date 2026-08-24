/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Landmark, Scale, ArrowDownRight, ArrowDownLeft, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const LegalPathBranchingSection: React.FC = () => {
  const [selectedRuleType, setSelectedRuleType] = useState<'UU' | 'PP' | 'Perpres' | 'Permen' | 'Perda'>('UU');

  const ruleOptions: Array<{
    type: 'UU' | 'PP' | 'Perpres' | 'Permen' | 'Perda';
    name: string;
    example: string;
    court: 'MK' | 'MA';
    courtName: string;
    batuUji: string;
    basisHukum: string;
    explanation: string;
  }> = [
    {
      type: 'UU',
      name: 'Undang-Undang (UU)',
      example: 'UU No. 6 Tahun 2023 (Cipta Kerja), UU ITE, UU Minerba',
      court: 'MK',
      courtName: 'Mahkamah Konstitusi',
      batuUji: 'Pasal-pasal dalam Undang-Undang Dasar 1945 (UUD 1945)',
      basisHukum: 'Pasal 24C ayat (1) UUD 1945 & UU No. 24/2003',
      explanation: 'Undang-Undang hanya dapat diuji oleh Mahkamah Konstitusi karena MK adalah satu-satunya lembaga pengawal konstitusi tertinggi di Indonesia.',
    },
    {
      type: 'PP',
      name: 'Peraturan Pemerintah (PP)',
      example: 'PP No. 35 Tahun 2021 tentang PKWT, Alih Daya, Waktu Kerja & PHK',
      court: 'MA',
      courtName: 'Mahkamah Agung',
      batuUji: 'Undang-Undang yang memerintahkan pembentukan PP tersebut',
      basisHukum: 'Pasal 24A ayat (1) UUD 1945 & UU No. 14/1985 jo. UU 5/2004',
      explanation: 'PP adalah peraturan pelaksana di bawah UU. Jika materi muatan PP bertentangan dengan UU induknya, diajukan Uji Materiil ke Mahkamah Agung.',
    },
    {
      type: 'Perpres',
      name: 'Peraturan Presiden (Perpres)',
      example: 'Perpres tentang Tata Ruang Kawasan Strategis atau Jaminan Kesehatan',
      court: 'MA',
      courtName: 'Mahkamah Agung',
      batuUji: 'Undang-Undang terkait yang berada di atasnya',
      basisHukum: 'Pasal 24A ayat (1) UUD 1945',
      explanation: 'Perpres berada di bawah hierarki UU, sehingga kewenangan pengujian materiil berada mutlak di bawah Mahkamah Agung.',
    },
    {
      type: 'Permen',
      name: 'Peraturan Menteri (Permen)',
      example: 'Permendag tentang Kuota Impor, Permenaker tentang Upah Minimum',
      court: 'MA',
      courtName: 'Mahkamah Agung',
      batuUji: 'Undang-Undang atau Peraturan Pemerintah di atasnya',
      basisHukum: 'Pasal 24A ayat (1) UUD 1945',
      explanation: 'Banyak warga keliru mengajukan Permen ke MK. MK pasti menolak karena Permen bukan objek kewenangan MK (Kompetensi Absolut MA).',
    },
    {
      type: 'Perda',
      name: 'Peraturan Daerah (Perda)',
      example: 'Perda Pajak & Retribusi Daerah, Perda Tata Ruang Wilayah Kab/Kota',
      court: 'MA',
      courtName: 'Mahkamah Agung',
      batuUji: 'Undang-Undang (UU) yang lebih tinggi',
      basisHukum: 'Pasal 24A ayat (1) UUD 1945 & UU Pemda',
      explanation: 'Perda Provinsi maupun Perda Kabupaten/Kota diuji ke Mahkamah Agung jika melanggar ketentuan Undang-Undang yang lebih tinggi.',
    },
  ];

  const currentOption = ruleOptions.find((r) => r.type === selectedRuleType) || ruleOptions[0];

  return (
    <section className="bg-stone-900 text-stone-100 border-b border-stone-800 py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 border-b border-stone-800 pb-4 mb-8">
          <span className="font-mono text-xs font-bold text-amber-400 tracking-widest uppercase">
            BAGIAN 03 // PEMILIHAN YURISDIKSI
          </span>
          <span className="text-stone-600">|</span>
          <span className="text-xs text-stone-400 font-sans">
            Hierarki Peraturan Perundang-undangan (UU No. 12/2011)
          </span>
        </div>

        {/* Title */}
        <div className="max-w-3xl space-y-3 mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Kapan ke MK vs Kapan ke MA?
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Kesalahan fatal nomor satu pemohon pemula adalah salah memilih kamar peradilan (&ldquo;salah kamar&rdquo;). Mahkamah Konstitusi akan langsung menolak jika objek perkara bukan Undang-Undang.
          </p>
        </div>

        {/* Interactive Selector Tabs */}
        <div className="space-y-4">
          <label className="block text-xs font-mono uppercase tracking-wider text-stone-400 font-semibold">
            Pilih Jenis Aturan yang Ingin Anda Uji:
          </label>
          <div className="flex flex-wrap gap-2">
            {ruleOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelectedRuleType(opt.type)}
                className={`px-4 py-2 rounded-xs font-mono text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                  selectedRuleType === opt.type
                    ? 'bg-[#881337] text-white border-rose-600 shadow-md'
                    : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700 hover:text-white'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>

        {/* Spatial Visual Branching Chamber */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Active Input Rule Overview (4 Cols) */}
          <div className="lg:col-span-4 bg-stone-800/90 border border-stone-700 p-6 rounded-xs flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider font-bold">
                OBJEK GUGATAN
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                {currentOption.name}
              </h3>
              <div className="p-3 bg-stone-900 rounded-xs border border-stone-700 text-xs text-stone-300">
                <span className="font-semibold text-stone-200 block mb-1">Contoh Nyata:</span>
                {currentOption.example}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-700/80 mt-6">
              <span className="text-xs text-stone-400 font-mono">
                Klasifikasi Otomatis Sistem AI
              </span>
            </div>
          </div>

          {/* Branching Destination Card: Target Chamber (8 Cols) */}
          <div className={`lg:col-span-8 p-6 sm:p-8 rounded-xs border transition-all ${
            currentOption.court === 'MK'
              ? 'bg-rose-950/40 border-rose-800 text-white'
              : 'bg-slate-900 border-slate-700 text-white'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-700/80 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xs flex items-center justify-center font-serif font-bold text-lg ${
                  currentOption.court === 'MK' ? 'bg-[#881337] text-amber-200' : 'bg-slate-700 text-stone-100'
                }`}>
                  {currentOption.court}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">
                    KAMAR PERADILAN YANG BERWENANG
                  </span>
                  <h4 className="font-serif text-xl sm:text-2xl font-bold text-amber-200">
                    {currentOption.courtName}
                  </h4>
                </div>
              </div>

              <span className="self-start sm:self-auto px-2.5 py-1 rounded-xs bg-stone-800 text-stone-300 font-mono text-[11px] border border-stone-700">
                {currentOption.basisHukum}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-stone-900/80 p-4 rounded-xs border border-stone-800">
                <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1">
                  BATU UJI (PARAMETER HUKUM)
                </span>
                <p className="text-xs sm:text-sm text-stone-200 font-medium">
                  {currentOption.batuUji}
                </p>
              </div>

              <div className="bg-stone-900/80 p-4 rounded-xs border border-stone-800">
                <span className="text-[10px] font-mono uppercase text-stone-400 block mb-1">
                  ALASAN HUKUM KAMAR
                </span>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {currentOption.explanation}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800 flex items-center gap-2 text-xs text-amber-300/90 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Sistem Rakyat Menggugat memverifikasi yurisdiksi sebelum menyusun berkas gugatan.</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
