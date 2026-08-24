/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Basis Hukum (Legal Knowledge Hub)
 * Powered & Grounded by Pasal.id
 * Provides direct access to Indonesia's complete legal corpus (187,000+ regulations & precedents).
 */

import React, { useState } from 'react';
import { 
  Scale, 
  ExternalLink, 
  Search, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  ArrowRight,
  Landmark
} from 'lucide-react';

interface LegalKnowledgeBaseViewProps {
  onSelectPrecedentForIntake?: (citation: string) => void;
}

export const LegalKnowledgeBaseView: React.FC<LegalKnowledgeBaseViewProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const url = `https://pasal.id/search?q=${encodeURIComponent(searchQuery.trim())}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://pasal.id', '_blank', 'noopener,noreferrer');
    }
  };

  const quickLinks = [
    { label: 'UUD NRI 1945', query: 'Undang-Undang Dasar Negara Republik Indonesia Tahun 1945', icon: Landmark },
    { label: 'UU Mahkamah Konstitusi', query: 'UU No. 24 Tahun 2003 tentang Mahkamah Konstitusi', icon: Scale },
    { label: 'UU Cipta Kerja', query: 'UU No. 6 Tahun 2023 Cipta Kerja', icon: FileText },
    { label: 'UU Minerba', query: 'UU No. 3 Tahun 2020 Pertambangan Mineral dan Batubara', icon: BookOpen },
    { label: 'UU ITE', query: 'UU No. 1 Tahun 2024 Informasi dan Transaksi Elektronik', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Header Badge & Title */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-[#881337] border border-rose-200 text-xs font-semibold uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5 text-[#881337]" />
          <span>Basis Hukum & Yurisprudensi Nasional</span>
        </div>
        
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight">
          Basis Hukum
        </h1>
        
        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Pusat penelusuran naskah undang-undang, peraturan pemerintah, dan putusan pengadilan terkini di Indonesia.
        </p>
      </div>

      {/* Hero Action Card: One Big Button Linking to Pasal.id */}
      <div className="bg-white border-2 border-stone-300 rounded-2xl p-6 sm:p-10 text-center space-y-8 shadow-md">
        <div className="max-w-xl mx-auto space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center justify-center mx-auto shadow-xs">
            <Scale className="w-8 h-8 text-indigo-700" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Jelajahi Seluruh Peraturan di Pasal.id
          </h2>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Akses langsung lebih dari <strong>187.000+</strong> dokumen hukum lengkap dengan status keberlakuan pasal, hierarki hukum, dan putusan uji materiil.
          </p>
        </div>

        {/* Big Hero Button */}
        <div className="max-w-lg mx-auto">
          <a
            href="https://pasal.id"
            target="_blank"
            rel="noreferrer noopener"
            className="group relative flex flex-col sm:flex-row items-center justify-center gap-3 w-full py-5 px-8 rounded-xl text-white font-bold text-lg bg-[#881337] hover:bg-[#70102e] border-2 border-[#9F1239] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>Buka Portal Pasal.id</span>
            </div>
            <span className="hidden sm:inline text-rose-300">•</span>
            <span className="text-xs sm:text-sm font-medium text-rose-100 flex items-center gap-1">
              <span>Korpus Hukum Lengkap</span>
              <ExternalLink className="w-4 h-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </a>
        </div>

        {/* Quick Search on Pasal.id */}
        <div className="pt-6 border-t border-stone-200 max-w-xl mx-auto space-y-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Atau Cari Langsung Pasal / Undang-Undang Tertentu:
          </p>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama UU, nomor pasal, atau kata kunci..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#881337]/20 focus:border-[#881337]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-semibold transition flex items-center gap-1.5 shrink-0"
            >
              <span>Cari</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {quickLinks.map((item, idx) => (
              <a
                key={idx}
                href={`https://pasal.id/search?q=${encodeURIComponent(item.query)}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition"
              >
                <item.icon className="w-3 h-3 text-stone-500" />
                <span>{item.label}</span>
                <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Polite & Gentle Disclaimer (Supported by Pasal.id) */}
      <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-5 sm:p-6 text-stone-700 text-xs sm:text-sm leading-relaxed space-y-2">
        <div className="flex items-center gap-2 font-semibold text-stone-900 text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Keterbukaan Informasi & Rujukan Hukum</span>
        </div>
        <p>
          Basis data peraturan perundang-undangan dan referensi yuridis pada platform <em>Rakyat Menggugat</em> didukung sepenuhnya oleh ekosistem data hukum terbuka <strong>Pasal.id</strong>. Seluruh proses penelusuran norma, verifikasi status keabsahan regulasi, dan rujukan naskah peraturan dilakukan secara dinamis untuk menjamin ketepatan serta kebaruan naskah hukum yang dianalisis oleh agen cerdas kami.
        </p>
      </div>
    </div>
  );
};
