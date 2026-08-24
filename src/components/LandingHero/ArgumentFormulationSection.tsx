/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Equal, CheckCircle, Scale, Shield, FileCheck } from 'lucide-react';

export const ArgumentFormulationSection: React.FC = () => {
  const [activeFormula, setActiveFormula] = useState<number>(0);

  const formulas = [
    {
      title: 'Uji Norma Ketenagakerjaan (Upah & PHK)',
      fakta: 'Pekerja menerima surat PHK sepihak tanpa mekanisme musyawarah bipartit yang adil.',
      norma: 'Pasal X UU Ketenagakerjaan yang melonggarkan syarat pemutusan hubungan kerja.',
      kerugian: 'Hilangnya mata pencaharian dan kepastian hak kompensasi yang layak.',
      batuUji: 'Pasal 28D ayat (1) & (2) UUD 1945 tentang hak atas kepastian hukum dan perlakuan adil.',
      posita: 'Menyatakan pasal a quo inkonstitusional bersyarat (conditionally unconstitutional) sepanjang tidak dimaknai wajib melalui putusan penetapan lembaga penyelesaian sengketa.',
    },
    {
      title: 'Uji Norma Lingkungan & Wilayah Adat',
      fakta: 'Hutan ulayat seluas 1.200 Ha dialihkan menjadi konsesi pertambangan tanpa persetujuan masyarakat adat.',
      norma: 'Pasal Y UU Kehutanan/Minerba yang mengabaikan hak veto masyarakat lokal.',
      kerugian: 'Kerusakan ekologis dan hilangnya kedaulatan wilayah adat generasi turun-temurun.',
      batuUji: 'Pasal 18B ayat (2) & Pasal 28H ayat (1) UUD 1945 tentang pengakuan masyarakat adat & lingkungan hidup baik.',
      posita: 'Menyatakan frasa dalam pasal tidak berkekuatan hukum mengikat karena bertentangan dengan prinsip penghormatan masyarakat hukum adat.',
    },
  ];

  const active = formulas[activeFormula];

  return (
    <section className="bg-white border-b border-stone-200 py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4 mb-8">
          <span className="font-mono text-xs font-bold text-[#881337] tracking-widest uppercase">
            BAGIAN 04 // ANATOMI ARGUMENTASI
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-xs text-stone-500 font-sans">
            Logika Posita & Petitum Sesuai Peraturan MK No. 2/2021
          </span>
        </div>

        {/* Title */}
        <div className="max-w-3xl space-y-3 mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
            Anatomi Argumen Konstitusional.
          </h2>
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
            Gugatan yang kuat bukanlah gugatan yang paling banyak memakai bahasa emosional, melainkan yang memiliki rantai kausalitas yuridis yang presisi:
          </p>
        </div>

        {/* Formula Switcher */}
        <div className="flex items-center gap-2 mb-8">
          {formulas.map((f, i) => (
            <button
              key={i}
              onClick={() => setActiveFormula(i)}
              className={`px-3.5 py-1.5 rounded-xs text-xs font-mono font-semibold transition cursor-pointer border ${
                activeFormula === i
                  ? 'bg-[#881337] text-white border-rose-900'
                  : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
              }`}
            >
              Formula #{i + 1}: {f.title}
            </button>
          ))}
        </div>

        {/* Visual Math Equation Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
          
          {/* Box 1: Fakta */}
          <div className="bg-stone-50 border border-stone-300 p-5 rounded-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-500 uppercase pb-2 border-b border-stone-200 mb-3">
                <span>1. Fakta Lapangan</span>
                <span className="text-[#881337] font-bold">FACT</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                {active.fakta}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-200 text-[11px] text-stone-500 font-mono">
              Bukti Empiris Warga
            </div>
          </div>

          {/* Box 2: Norma */}
          <div className="bg-stone-50 border border-stone-300 p-5 rounded-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-500 uppercase pb-2 border-b border-stone-200 mb-3">
                <span>2. Norma UU / Aturan</span>
                <span className="text-[#881337] font-bold">RULE</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                {active.norma}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-200 text-[11px] text-stone-500 font-mono">
              Objek yang Digugat
            </div>
          </div>

          {/* Box 3: Kerugian Konstitusional */}
          <div className="bg-stone-50 border border-stone-300 p-5 rounded-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-500 uppercase pb-2 border-b border-stone-200 mb-3">
                <span>3. Kerugian Hak</span>
                <span className="text-[#881337] font-bold">HARM</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                {active.kerugian}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-200 text-[11px] text-stone-500 font-mono">
              Syarat Legal Standing
            </div>
          </div>

          {/* Box 4: Batu Uji */}
          <div className="bg-stone-50 border border-stone-300 p-5 rounded-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-500 uppercase pb-2 border-b border-stone-200 mb-3">
                <span>4. Batu Uji Konstitusi</span>
                <span className="text-[#881337] font-bold">UUD 1945</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                {active.batuUji}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-200 text-[11px] text-stone-500 font-mono">
              Pasal Hak Asasi Warga
            </div>
          </div>

        </div>

        {/* Result: The Legal Posita & Petitum Box */}
        <div className="mt-6 bg-[#FAF9F5] border-2 border-[#881337] p-6 rounded-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-300 mb-4">
            <span className="font-mono text-xs font-bold text-[#881337] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              HASIL: RUMUSAN POSITA & PETITUM HUKUM
            </span>
            <span className="text-xs font-mono text-stone-600 bg-white px-2 py-0.5 border border-stone-200 rounded-xs">
              SIAP DIAJUKAN KE PERSIDANGAN
            </span>
          </div>

          <p className="font-serif text-sm sm:text-base text-stone-900 leading-relaxed font-semibold">
            &ldquo;{active.posita}&rdquo;
          </p>
        </div>

      </div>
    </section>
  );
};
