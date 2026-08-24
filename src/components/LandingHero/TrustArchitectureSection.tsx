/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Lock, Landmark, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

export const TrustArchitectureSection: React.FC = () => {
  return (
    <section className="bg-[#FAF9F5] border-b border-stone-200 py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4 mb-8">
          <span className="font-mono text-xs font-bold text-[#881337] tracking-widest uppercase">
            BAGIAN 06 // INTEGRITAS & METODOLOGI
          </span>
          <span className="text-stone-300">|</span>
          <span className="text-xs text-stone-500 font-sans">
            Kerangka Pengujian 4 Lapis & Keamanan Privasi Warga
          </span>
        </div>

        {/* Title */}
        <div className="max-w-3xl space-y-3 mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
            Transparansi Kerangka Penilaian.
          </h2>
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
            Permohonan uji materiil dinilai melalui 4 tahapan berurutan sesuai tata tertib persidangan Mahkamah Konstitusi:
          </p>
        </div>

        {/* 4-Layer Sequential Framework */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white border border-stone-300 p-5 rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xs bg-[#881337] text-white flex items-center justify-center font-mono font-bold text-xs">
                L-1
              </span>
              <span className="text-[10px] font-mono text-stone-500 font-bold uppercase">KOMPETENSI</span>
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Kewenangan Kamar
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Memastikan objek gugatan tepat kamar: UU diuji ke MK, peraturan di bawah UU diuji ke MA. Jika salah kamar, proses dialihkan langsung.
            </p>
          </div>

          <div className="bg-white border border-stone-300 p-5 rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xs bg-[#881337] text-white flex items-center justify-center font-mono font-bold text-xs">
                L-2
              </span>
              <span className="text-[10px] font-mono text-stone-500 font-bold uppercase">STANDING</span>
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Kedudukan Hukum
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Menguji 5 syarat kumulatif Putusan MK 006/PUU-III/2005: hak konstitusional yang spesifik, aktual/potensial, dan hubungan kausalitas nyata.
            </p>
          </div>

          <div className="bg-white border border-stone-300 p-5 rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xs bg-[#881337] text-white flex items-center justify-center font-mono font-bold text-xs">
                L-3
              </span>
              <span className="text-[10px] font-mono text-stone-500 font-bold uppercase">BATU UJI</span>
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Ne Bis In Idem
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Memeriksa apakah pasal yang diuji sudah pernah diputus oleh MK dengan alasan serupa (Pasal 60 UU MK) untuk menghindari gugatan gugur.
            </p>
          </div>

          <div className="bg-white border border-stone-300 p-5 rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xs bg-[#881337] text-white flex items-center justify-center font-mono font-bold text-xs">
                L-4
              </span>
              <span className="text-[10px] font-mono text-stone-500 font-bold uppercase">POSITA</span>
            </div>
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Formulasi Petitum
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Menilai konstruksi pertentangan norma dengan prinsip konstitusi, serta menghasilkan rumusan petitum (tuntutan) yang dapat dieksekusi hakim.
            </p>
          </div>

        </div>

        {/* Legal Disclaimer & Privacy Guarantees */}
        <div className="mt-12 bg-white border border-stone-300 p-6 sm:p-8 rounded-xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#881337] font-serif font-bold text-base sm:text-lg">
            <AlertCircle className="w-5 h-5 text-[#881337] shrink-0" />
            <span>Batasan Hukum & Tanggung Jawab Platform:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <p>
              • <strong>Bukan Kantor Hukum:</strong> Rakyat Menggugat adalah sarana pemberdayaan literasi dan penyusunan draf hukum mandiri. Kami tidak mewakili pengguna sebagai kuasa hukum di ruang sidang peradilan.
            </p>
            <p>
              • <strong>Kepatuhan UU PDP (No. 27/2022):</strong> Identitas, draf kasus, dan berkas bukti Anda dienkripsi secara privat. Pengguna memiliki kontrol penuh untuk mengekspor atau menghapus seluruh riwayat data sewaktu-waktu.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
