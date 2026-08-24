/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Users, Landmark, FileText, ArrowRight, Briefcase, ChevronRight } from 'lucide-react';

interface PersonaPathsSectionProps {
  onSelectPersona: (type: 'individu' | 'kelompok_sipil' | 'badan_hukum') => void;
  onOpenLawyers?: () => void;
}

export const PersonaPathsSection: React.FC<PersonaPathsSectionProps> = ({
  onSelectPersona,
  onOpenLawyers,
}) => {
  return (
    <section className="bg-white border-b border-stone-200 py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4 mb-8">
          <span className="font-mono text-xs font-bold text-[#881337] tracking-widest uppercase">
            BAGIAN 07 // JALUR PEMOHON
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-xs text-stone-500 font-sans">
            Klasifikasi Syarat Legal Standing Berdasarkan Subjek Hukum
          </span>
        </div>

        {/* Title */}
        <div className="max-w-3xl space-y-3 mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
            Pilih Kategori Anda Sebagai Pemohon.
          </h2>
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
            Mahkamah Konstitusi menetapkan syarat bukti yang berbeda tergantung apakah Anda mengajukan permohonan sebagai individu, kesatuan masyarakat adat, atau badan hukum:
          </p>
        </div>

        {/* 3 Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Persona 1: Individu */}
          <button
            onClick={() => onSelectPersona('individu')}
            className="group text-left bg-stone-50 border border-stone-300 hover:border-[#881337] p-6 rounded-xs transition-all duration-150 flex flex-col justify-between cursor-pointer hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xs bg-stone-200 text-stone-800 group-hover:bg-[#881337] group-hover:text-white flex items-center justify-center transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-[#881337] transition-colors">
                Perorangan WNI
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Warga negara Indonesia yang hak konstitusionalnya (misal: hak atas pekerjaan, kesehatan, pendidikan, atau privasi) dirugikan secara langsung.
              </p>
              <div className="text-[11px] font-mono text-stone-500 pt-2 border-t border-stone-200">
                Bukti Kunci: KTP & Bukti Kerugian Faktual
              </div>
            </div>

            <div className="mt-6 pt-3 flex items-center justify-between text-xs font-semibold text-[#881337]">
              <span>Mulai Jalur Individu</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Persona 2: Kelompok Sipil / Masyarakat Adat */}
          <button
            onClick={() => onSelectPersona('kelompok_sipil')}
            className="group text-left bg-stone-50 border border-stone-300 hover:border-[#881337] p-6 rounded-xs transition-all duration-150 flex flex-col justify-between cursor-pointer hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xs bg-stone-200 text-stone-800 group-hover:bg-[#881337] group-hover:text-white flex items-center justify-center transition-colors">
                <Landmark className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-[#881337] transition-colors">
                Masyarakat Adat / LSM
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Kesatuan masyarakat hukum adat yang masih hidup atau organisasi non-pemerintah yang anggaran dasarnya sesuai dengan isu norma yang diuji.
              </p>
              <div className="text-[11px] font-mono text-stone-500 pt-2 border-t border-stone-200">
                Bukti Kunci: Surat Keputusan Adat / Akta Pendirian
              </div>
            </div>

            <div className="mt-6 pt-3 flex items-center justify-between text-xs font-semibold text-[#881337]">
              <span>Mulai Jalur Komunitas</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Persona 3: Badan Hukum */}
          <button
            onClick={() => onSelectPersona('badan_hukum')}
            className="group text-left bg-stone-50 border border-stone-300 hover:border-[#881337] p-6 rounded-xs transition-all duration-150 flex flex-col justify-between cursor-pointer hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xs bg-stone-200 text-stone-800 group-hover:bg-[#881337] group-hover:text-white flex items-center justify-center transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-[#881337] transition-colors">
                Badan Hukum
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Yayasan, koperasi, asosiasi profesi, perseroan terbatas, atau lembaga publik yang kepentingannya terganggu oleh keberlakuan pasal.
              </p>
              <div className="text-[11px] font-mono text-stone-500 pt-2 border-t border-stone-200">
                Bukti Kunci: SK Kemenkumham & Surat Kuasa Direksi
              </div>
            </div>

            <div className="mt-6 pt-3 flex items-center justify-between text-xs font-semibold text-[#881337]">
              <span>Mulai Jalur Badan Hukum</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

        </div>

        {/* Lawyer Directory Callout Ribbon */}
        {onOpenLawyers && (
          <div className="mt-10 bg-stone-100 border border-stone-300 p-6 sm:p-7 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#881337] uppercase">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Pendampingan Kuasa Hukum (Bursa Advokat)</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                Ingin Didampingi Advokat Berpengalaman di MK & MA?
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
                Jelajahi profil pengacara publik terverifikasi PERADI, spesialisasi peradilan konstitusi, dan layanan bantuan pro bono untuk warga.
              </p>
            </div>

            <button
              onClick={onOpenLawyers}
              className="bg-[#881337] hover:bg-[#70102e] text-white px-5 py-3 rounded-xs text-xs sm:text-sm font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
            >
              <span>Buka Bursa Advokat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
