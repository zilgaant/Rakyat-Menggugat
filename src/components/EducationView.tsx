/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scale, Landmark, ShieldCheck, CheckCircle2, ArrowRight, HelpCircle, FileText, Lock, Users } from 'lucide-react';
import { DisclaimerBanner } from './DisclaimerBanner';

interface EducationViewProps {
  onStartIntake: () => void;
  onOpenBlankTemplate: () => void;
  onSelectPersona: (type: 'individu' | 'kelompok_sipil' | 'badan_hukum') => void;
}

export const EducationView: React.FC<EducationViewProps> = ({
  onStartIntake,
  onOpenBlankTemplate,
  onSelectPersona,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <section className="border-b border-stone-200 pb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-[#881337] border border-rose-200 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Hak Konstitusional Warga Negara
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-tight max-w-3xl">
          Menilai dan Memperjuangkan Hak Konstitusional Anda yang Dirugikan
        </h1>
        <p className="mt-4 text-base sm:text-lg text-stone-700 max-w-3xl leading-relaxed">
          Setiap warga negara memiliki hak untuk menggugat undang-undang atau peraturan pemerintah yang melanggar hak konstitusionalnya. Platform ini membantu Anda memeriksa kelayakan gugatan, mengumpulkan bukti, dan menyusun draf permohonan resmi secara mandiri.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={onStartIntake}
            className="bg-[#881337] hover:bg-[#70102e] text-stone-50 px-6 py-3 rounded-md text-base font-semibold transition flex items-center gap-2 shadow-xs border border-[#9F1239]"
          >
            <span>Mulai Penilaian Kasus Mandiri</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenBlankTemplate}
            className="bg-white hover:bg-stone-100 text-stone-800 px-5 py-3 rounded-md text-base font-medium transition border border-stone-300 flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-stone-600" />
            <span>Format Formulir Kosong (Tanpa AI)</span>
          </button>
        </div>
      </section>

      {/* Mandatory Disclaimer */}
      <DisclaimerBanner />

      {/* MK vs MA Comparison Module (PRD Section 4 - Core Feature) */}
      <section className="space-y-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-900">Fondasi Kewenangan</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Kapan ke Mahkamah Konstitusi (MK) vs Mahkamah Agung (MA)?
          </h2>
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-3xl">
            Kesalahan paling umum pemohon awam adalah mengajukan peraturan pemerintah atau peraturan menteri ke Mahkamah Konstitusi. Periksa perbedaan yurisdiksi di bawah ini:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mahkamah Konstitusi */}
          <div className="bg-white border-2 border-rose-900/40 rounded-lg p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded bg-rose-900 text-amber-200 flex items-center justify-center font-serif font-bold">
                  MK
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Mahkamah Konstitusi</h3>
                  <p className="text-xs text-stone-600">Pasal 24C UUD 1945</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 text-xs font-semibold">
                Tingkat Tunggal & Final
              </span>
            </div>

            <div className="space-y-2 text-sm text-stone-800">
              <p className="font-semibold text-stone-900">Objek yang Diuji:</p>
              <div className="p-3 bg-stone-50 rounded border border-stone-200 font-medium text-stone-900">
                Hanya <strong>Undang-Undang (UU)</strong> atau <strong>Perppu</strong> terhadap UUD 1945.
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-stone-700">
              <p className="font-semibold text-stone-900">Batu Uji (Parameter):</p>
              <p>Pasal-pasal dalam Undang-Undang Dasar Negara Republik Indonesia Tahun 1945.</p>
            </div>

            <div className="pt-2 border-t border-stone-100 text-xs text-stone-600">
              <strong>Contoh Kasus:</strong> Menguji pasal dalam UU Cipta Kerja atau UU Minerba yang dinilai bertentangan dengan jaminan hak hidup dan lingkungan hidup pada Pasal 28H UUD 1945.
            </div>
          </div>

          {/* Mahkamah Agung */}
          <div className="bg-white border-2 border-stone-300 rounded-lg p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded bg-stone-800 text-stone-100 flex items-center justify-center font-serif font-bold">
                  MA
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">Mahkamah Agung</h3>
                  <p className="text-xs text-stone-600">Pasal 24A UUD 1945</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-stone-200 text-stone-800 text-xs font-semibold">
                Uji Materiil Norma
              </span>
            </div>

            <div className="space-y-2 text-sm text-stone-800">
              <p className="font-semibold text-stone-900">Objek yang Diuji:</p>
              <div className="p-3 bg-stone-50 rounded border border-stone-200 font-medium text-stone-900">
                <strong>Peraturan di bawah UU</strong> (PP, Perpres, Permen, Perda Provinsi/Kabupaten/Kota).
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm text-stone-700">
              <p className="font-semibold text-stone-900">Batu Uji (Parameter):</p>
              <p>Undang-Undang yang menjadi payung hukum peraturan tersebut (apakah bertentangan dengan UU di atasnya).</p>
            </div>

            <div className="pt-2 border-t border-stone-100 text-xs text-stone-600">
              <strong>Contoh Kasus:</strong> Menguji Peraturan Menteri Keuangan atau Peraturan Daerah yang membuat aturan tambahan yang dilarang atau tidak dimandatkan oleh Undang-Undang.
            </div>
          </div>
        </div>
      </section>

      {/* 4-Layer Assessment Framework Explanation (PRD Section 12.5) */}
      <section className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-stone-200 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-900">Transparansi Metodologi</span>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
            Kerangka Evaluasi 4 Lapis Kelayakan Gugatan
          </h2>
          <p className="text-stone-700 text-sm mt-1 leading-relaxed">
            Sistem AI kami menggunakan dua agen independen (Analysis & Verifier) yang mengevaluasi kasus Anda secara berurutan sesuai praktik hukum acara MK:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-stone-200 rounded-md p-4 bg-stone-50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center text-xs">1</span>
              <span>Lapis 1: Kewenangan (Kompetensi Absolut)</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              Memastikan objek gugatan tepat kamar (UU diuji ke MK, peraturan di bawah UU diuji ke MA). Jika salah kamar, proses berhenti di lapis ini.
            </p>
          </div>

          <div className="border border-stone-200 rounded-md p-4 bg-stone-50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center text-xs">2</span>
              <span>Lapis 2: Kedudukan Hukum (Legal Standing)</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              Memeriksa 5 syarat kumulatif Putusan MK 006/PUU-III/2005: kerugian hak konstitusional yang spesifik, aktual/potensial, dan hubungan sebab-akibat (<em>causal verband</em>).
            </p>
          </div>

          <div className="border border-stone-200 rounded-md p-4 bg-stone-50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center text-xs">3</span>
              <span>Lapis 3: Batu Uji & Ne Bis In Idem</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              Memastikan pasal batu uji merujuk pada UUD 1945 serta memeriksa apakah norma tersebut sudah pernah diputus oleh MK dengan alasan hukum yang sama (Pasal 60 UU MK).
            </p>
          </div>

          <div className="border border-stone-200 rounded-md p-4 bg-stone-50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <span className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center text-xs">4</span>
              <span>Lapis 4: Alasan Permohonan (Posita)</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              Menilai konstruksi argumentasi hukum: bagaimana logika pertentangan antara norma yang digugat dengan pasal konstitusi, serta saran perbaikan formulasi permohonan.
            </p>
          </div>
        </div>
      </section>

      {/* Target Personas Section */}
      <section className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-stone-900">
          Pilih Kategori Pemohon untuk Menyesuaikan Syarat Hukum:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onSelectPersona('individu')}
            className="text-left bg-white border border-stone-200 hover:border-rose-900 p-5 rounded-lg transition group shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-800"
          >
            <div className="w-8 h-8 rounded bg-stone-100 text-stone-800 group-hover:bg-rose-100 group-hover:text-rose-900 flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-stone-900 text-base">Perorangan WNI</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Warga negara yang hak konstitusionalnya (pekerjaan, kesehatan, kepastian hukum) terdampak langsung oleh berlakunya UU.
            </p>
          </button>

          <button
            onClick={() => onSelectPersona('kelompok_sipil')}
            className="text-left bg-white border border-stone-200 hover:border-rose-900 p-5 rounded-lg transition group shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-800"
          >
            <div className="w-8 h-8 rounded bg-stone-100 text-stone-800 group-hover:bg-rose-100 group-hover:text-rose-900 flex items-center justify-center mb-3">
              <Landmark className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-stone-900 text-base">Masyarakat Adat / LSM</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Kesatuan masyarakat hukum adat yang masih hidup atau organisasi nirlaba yang memiliki keterkaitan tujuan dengan isu norma.
            </p>
          </button>

          <button
            onClick={() => onSelectPersona('badan_hukum')}
            className="text-left bg-white border border-stone-200 hover:border-rose-900 p-5 rounded-lg transition group shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-800"
          >
            <div className="w-8 h-8 rounded bg-stone-100 text-stone-800 group-hover:bg-rose-100 group-hover:text-rose-900 flex items-center justify-center mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-stone-900 text-base">Badan Hukum</h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Yayasan, perseroan, atau badan hukum publik yang memiliki legalitas dan anggaran dasar yang relevan dengan pokok permohonan.
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};
