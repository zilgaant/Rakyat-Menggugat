/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Lawyer Directory / Bursa Advokat Publik
 * Displays verified lawyer cards with photo placeholder, name, latest education,
 * and contextual dropdowns for "Sertifikasi" and "Portfolio Kasus".
 */

import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  GraduationCap, 
  Award, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  Info,
  ExternalLink,
  X,
  FileText
} from 'lucide-react';
import { LawyerProfile, CaseRecord, UserProfile } from '../types';
import { SEED_LAWYERS } from '../data/seedLawyers';

interface LawyerDirectoryViewProps {
  currentUser: UserProfile | null;
  cases: CaseRecord[];
  activeCaseId?: string;
  onSelectCaseForConsultation?: (caseId: string) => void;
  onStartNewCase?: () => void;
}

export const LawyerDirectoryView: React.FC<LawyerDirectoryViewProps> = ({
  currentUser,
  cases,
  activeCaseId,
  onSelectCaseForConsultation,
  onStartNewCase
}) => {
  const [lawyers] = useState<LawyerProfile[]>(SEED_LAWYERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourtFilter, setSelectedCourtFilter] = useState<'all' | 'MK' | 'MA' | 'pro_bono'>('all');
  
  // Track open dropdowns per lawyer card: { [lawyerId]: { certs: boolean, portfolio: boolean } }
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, { certs: boolean; portfolio: boolean }>>({
    'lawyer-001': { certs: true, portfolio: true }, // Opened by default on first card for instant preview
    'lawyer-002': { certs: false, portfolio: true }
  });

  // Contact Modal State
  const [contactModalLawyer, setContactModalLawyer] = useState<LawyerProfile | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(activeCaseId || (cases.length > 0 ? cases[0].id : ''));
  const [consultationMessage, setConsultationMessage] = useState('');
  const [isMessageSent, setIsMessageSent] = useState(false);

  const toggleDropdown = (lawyerId: string, type: 'certs' | 'portfolio') => {
    setOpenDropdowns(prev => {
      const current = prev[lawyerId] || { certs: false, portfolio: false };
      return {
        ...prev,
        [lawyerId]: {
          ...current,
          [type]: !current[type]
        }
      };
    });
  };

  const filteredLawyers = useMemo(() => {
    return lawyers.filter(lawyer => {
      // Court filter
      if (selectedCourtFilter === 'MK') {
        const hasMK = lawyer.portfolio_kasus.some(k => k.mahkamah === 'MK') || 
                      lawyer.area_keahlian.some(a => a.toLowerCase().includes('mk') || a.toLowerCase().includes('konstitusi'));
        if (!hasMK) return false;
      } else if (selectedCourtFilter === 'MA') {
        const hasMA = lawyer.portfolio_kasus.some(k => k.mahkamah === 'MA') || 
                      lawyer.area_keahlian.some(a => a.toLowerCase().includes('ma') || a.toLowerCase().includes('uji materiil'));
        if (!hasMA) return false;
      } else if (selectedCourtFilter === 'pro_bono') {
        if (!lawyer.ketersediaan_pro_bono) return false;
      }

      // Text search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = lawyer.nama.toLowerCase().includes(q);
      const matchEdu = lawyer.pendidikan_terakhir.toLowerCase().includes(q) || 
                       lawyer.pendidikan_detail.some(d => d.toLowerCase().includes(q));
      const matchArea = lawyer.area_keahlian.some(a => a.toLowerCase().includes(q));
      const matchCerts = lawyer.sertifikasi.some(c => c.judul.toLowerCase().includes(q) || c.penerbit.toLowerCase().includes(q));
      const matchPortfolio = lawyer.portfolio_kasus.some(p => 
        p.judul_perkara.toLowerCase().includes(q) || 
        p.objek_uji.toLowerCase().includes(q) || 
        p.ringkasan_peran.toLowerCase().includes(q)
      );

      return matchName || matchEdu || matchArea || matchCerts || matchPortfolio;
    });
  }, [lawyers, selectedCourtFilter, searchQuery]);

  const handleOpenContactModal = (lawyer: LawyerProfile) => {
    setContactModalLawyer(lawyer);
    setIsMessageSent(false);
    setConsultationMessage(`Halo Bapak/Ibu ${lawyer.nama},\n\nSaya ingin berkonsultasi mengenai permohonan pengujian norma hukum di ${lawyer.area_keahlian[0] || 'Mahkamah Konstitusi/Mahkamah Agung'}. Draf rangkuman fakta dan asesmen awal saya telah disusun melalui platform Rakyat Menggugat.`);
  };

  const handleSendConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMessageSent(true);
    setTimeout(() => {
      // Auto close after 2.5s
      setTimeout(() => {
        setContactModalLawyer(null);
        setIsMessageSent(false);
      }, 2000);
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner Section */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50 rounded-full blur-3xl -z-0 pointer-events-none opacity-70" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200 text-[#881337] text-xs font-semibold mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>Bursa Advokat Publik & Jaringan Kuasa Hukum Konstitusi</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight leading-tight">
            Kontak Pengacara & Advokat Mitra <span className="text-stone-400 font-sans text-lg sm:text-xl font-normal">(Placeholder)</span>
          </h1>
          
          <p className="mt-2 text-sm sm:text-base text-stone-600 leading-relaxed">
            Daftar advokat dan praktisi hukum publik terverifikasi yang berpengalaman mendampingi warga dalam pengujian undang-undang di <strong>Mahkamah Konstitusi (MK)</strong> maupun pengujian peraturan perundang-undangan di <strong>Mahkamah Agung (MA)</strong>.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-3 border-t border-stone-100">
            <span className="flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Advokat Berlisensi Resmi (PERADI / KAI)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              Sertifikasi Litigasi MK & MA
            </span>
            <span className="flex items-center gap-1.5 font-medium text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md">
              <UserCheck className="w-3.5 h-3.5 text-rose-800" />
              Tersedia Layanan Bantuan Pro Bono
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama advokat, kampus, sertifikasi, atau perkara..."
            className="w-full pl-9.5 pr-4 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-stone-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          <button
            onClick={() => setSelectedCourtFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedCourtFilter === 'all'
                ? 'bg-[#881337] text-white shadow-xs'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            Semua ({lawyers.length})
          </button>
          <button
            onClick={() => setSelectedCourtFilter('MK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedCourtFilter === 'MK'
                ? 'bg-[#881337] text-white shadow-xs'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            Litigasi MK
          </button>
          <button
            onClick={() => setSelectedCourtFilter('MA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedCourtFilter === 'MA'
                ? 'bg-[#881337] text-white shadow-xs'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            Uji Materiil MA
          </button>
          <button
            onClick={() => setSelectedCourtFilter('pro_bono')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedCourtFilter === 'pro_bono'
                ? 'bg-[#881337] text-white shadow-xs'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
            }`}
          >
            Pro Bono Cuma-Cuma
          </button>
        </div>
      </div>

      {/* Lawyer Cards Grid */}
      {filteredLawyers.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <Scale className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-stone-800 text-lg">Tidak Ditemukan Advokat</h3>
          <p className="text-stone-600 text-xs mt-1 leading-relaxed">
            Tidak ada advokat yang cocok dengan kata kunci pencarian atau filter yang dipilih. Silakan reset filter Anda.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCourtFilter('all'); }}
            className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLawyers.map((lawyer) => {
            const isCertsOpen = openDropdowns[lawyer.id]?.certs ?? false;
            const isPortfolioOpen = openDropdowns[lawyer.id]?.portfolio ?? false;

            return (
              <div
                key={lawyer.id}
                className="bg-white border border-stone-200 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top Section: Photo Placeholder, Name, Education */}
                <div className="p-6">
                  {/* Top Header Row with Avatar & Status Badges */}
                  <div className="flex items-start gap-4">
                    {/* Placeholder Foto Advokat */}
                    <div className="relative shrink-0">
                      <div
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center font-serif text-xl sm:text-2xl font-bold shadow-xs border border-stone-200/80"
                        style={{
                          backgroundColor: lawyer.foto_avatar_placeholder.bg_color,
                          color: lawyer.foto_avatar_placeholder.text_color
                        }}
                      >
                        {lawyer.foto_avatar_placeholder.initials}
                      </div>
                      {/* Verified Badge Icon */}
                      <span 
                        className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs border border-stone-200" 
                        title="Advokat Terverifikasi"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                      </span>
                    </div>

                    {/* Lawyer Title, Name & Bar Status */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            {lawyer.organisasi_advokat.split(' ')[0]} Terverifikasi
                          </span>
                          {lawyer.ketersediaan_pro_bono && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Pro Bono
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-500 font-mono hidden sm:inline">
                          {lawyer.kota.split(',')[0]}
                        </span>
                      </div>

                      <h2 className="font-serif font-bold text-stone-900 text-lg sm:text-xl tracking-tight mt-1 leading-snug">
                        {lawyer.nama}
                      </h2>
                      <p className="text-xs text-stone-600 font-medium line-clamp-1 mt-0.5">
                        {lawyer.gelar}
                      </p>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {lawyer.no_izin_advokat}
                      </p>
                    </div>
                  </div>

                  {/* Highlighted Education Box (Pendidikan Terakhir) */}
                  <div className="mt-4 bg-stone-50 border border-stone-200/90 rounded-xl p-3 sm:p-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500 block">
                          Pendidikan Terakhir
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug mt-0.5">
                          {lawyer.pendidikan_terakhir}
                        </p>
                        {lawyer.pendidikan_detail.length > 1 && (
                          <div className="mt-1 space-y-0.5">
                            {lawyer.pendidikan_detail.slice(1).map((detail, idx) => (
                              <p key={idx} className="text-[11px] text-stone-600 leading-tight">
                                • {detail}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Area Keahlian Tag Badges */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                    {lawyer.area_keahlian.map((keahlian, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[11px] bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md font-medium border border-stone-200"
                      >
                        {keahlian}
                      </span>
                    ))}
                  </div>

                  {/* Dropdown Context 1: Sertifikasi */}
                  <div className="mt-4 border border-stone-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleDropdown(lawyer.id, 'certs')}
                      className="w-full px-4 py-2.5 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-left transition cursor-pointer"
                      aria-expanded={isCertsOpen}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                        <Award className="w-4 h-4 text-amber-700" />
                        <span>Sertifikasi & Keahlian Profesi ({lawyer.sertifikasi.length})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                        <span>{isCertsOpen ? 'Tutup' : 'Lihat'}</span>
                        {isCertsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {isCertsOpen && (
                      <div className="p-3.5 bg-white border-t border-stone-200 space-y-2.5 text-xs animate-in fade-in duration-200">
                        {lawyer.sertifikasi.map((cert) => (
                          <div key={cert.id} className="p-2.5 rounded-lg bg-stone-50/80 border border-stone-200/70">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-stone-900 leading-tight">
                                {cert.judul}
                              </span>
                              <span className="shrink-0 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                {cert.status}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
                              <span>Penerbit: <strong>{cert.penerbit}</strong></span>
                              <span>Tahun: {cert.tahun}</span>
                            </div>
                            {cert.nomor_registrasi && (
                              <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                                Reg: {cert.nomor_registrasi}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dropdown Context 2: Portfolio Kasus */}
                  <div className="mt-2.5 border border-stone-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleDropdown(lawyer.id, 'portfolio')}
                      className="w-full px-4 py-2.5 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-left transition cursor-pointer"
                      aria-expanded={isPortfolioOpen}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                        <Briefcase className="w-4 h-4 text-[#881337]" />
                        <span>Portfolio Kasus & Putusan Litigasi ({lawyer.portfolio_kasus.length})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                        <span>{isPortfolioOpen ? 'Tutup' : 'Lihat'}</span>
                        {isPortfolioOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {isPortfolioOpen && (
                      <div className="p-3.5 bg-white border-t border-stone-200 space-y-3 text-xs animate-in fade-in duration-200">
                        {lawyer.portfolio_kasus.map((kasus) => (
                          <div key={kasus.id} className="p-3 rounded-lg bg-stone-50 border border-stone-200">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                                kasus.mahkamah === 'MK'
                                  ? 'bg-[#881337] text-white'
                                  : 'bg-sky-800 text-white'
                              }`}>
                                {kasus.mahkamah === 'MK' ? 'Mahkamah Konstitusi' : 'Mahkamah Agung'}
                              </span>
                              <span className="text-[11px] text-stone-500 font-mono">
                                {kasus.tahun}
                              </span>
                            </div>

                            <h4 className="font-bold text-stone-900 text-xs sm:text-sm mt-1">
                              {kasus.judul_perkara}
                            </h4>

                            {kasus.nomor_putusan && (
                              <p className="text-[11px] text-[#881337] font-semibold font-mono mt-0.5">
                                {kasus.nomor_putusan}
                              </p>
                            )}

                            <div className="mt-1.5 text-[11px] text-stone-700 bg-white p-2 rounded border border-stone-200/80">
                              <span className="font-semibold text-stone-800">Objek Uji:</span> {kasus.objek_uji}
                            </div>

                            <div className="mt-1.5 flex items-center justify-between gap-2 pt-1 border-t border-stone-200/60">
                              <span className="text-[11px] text-stone-600">
                                <strong>Hasil:</strong> <span className="text-emerald-800 font-semibold">{kasus.hasil_amar}</span>
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-600 mt-1 italic leading-relaxed">
                              "{kasus.ringkasan_peran}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-600">
                    <span className="block font-medium text-stone-800">
                      {lawyer.model_kerjasama === 'pro_bono' ? 'Bantuan Cuma-Cuma' : 'Subsidi Silang Terjangkau'}
                    </span>
                    <span className="text-stone-500">
                      {lawyer.total_advokasi_selesai} perkara selesai
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenContactModal(lawyer)}
                    className="bg-[#881337] hover:bg-[#70102e] text-white px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Hubungi Pengacara</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Notice Disclaimer at Bottom */}
      <div className="mt-10 p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3.5 text-xs text-amber-950">
        <Info className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">
            Transparansi Layanan & Kode Etik Advokat Indonesia (UU No. 18/2003)
          </p>
          <p className="text-amber-900/90 leading-relaxed">
            Platform <strong>Rakyat Menggugat</strong> adalah platform publik nirlaba yang memfasilitasi keterhubungan warga negara dengan advokat berlisensi. Platform tidak memungut komisi (*referral fee*), tidak menjamin hasil putusan peradilan, dan seluruh hubungan profesional diatur secara mandiri antara pemohon dan kuasa hukum bersangkutan.
          </p>
        </div>
      </div>

      {/* Interactive Consultation / Contact Modal */}
      {contactModalLawyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-sm"
                  style={{
                    backgroundColor: contactModalLawyer.foto_avatar_placeholder.bg_color,
                    color: contactModalLawyer.foto_avatar_placeholder.text_color
                  }}
                >
                  {contactModalLawyer.foto_avatar_placeholder.initials}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base leading-tight">
                    Hubungi {contactModalLawyer.nama}
                  </h3>
                  <p className="text-xs text-stone-600 font-mono">
                    {contactModalLawyer.no_izin_advokat}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContactModalLawyer(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content / Form */}
            {isMessageSent ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif font-bold text-stone-900 text-lg">Permohonan Konsultasi Terkirim!</h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                  Rangkuman permohonan dan kontak Anda telah diteruskan ke kantor advokat <strong>{contactModalLawyer.nama}</strong>. Anda juga dapat menghubungi langsung melalui email:
                </p>
                <div className="bg-stone-100 p-3 rounded-lg font-mono text-xs text-stone-800 select-all">
                  {contactModalLawyer.email}
                </div>
                <p className="text-[11px] text-stone-500 italic">
                  Jendela ini akan tertutup secara otomatis...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendConsultation} className="p-5 sm:p-6 space-y-4">
                {/* Direct Contact Info Badge */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-700">Kontak Resmi:</span>
                    <span className="text-stone-500 font-mono">{contactModalLawyer.kota}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <Mail className="w-3.5 h-3.5 text-stone-500" />
                    <span className="font-mono text-[11px]">{contactModalLawyer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    <span className="font-mono text-[11px]">{contactModalLawyer.telepon}</span>
                  </div>
                </div>

                {/* Case Link Selector */}
                {cases.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Pilih Kasus yang Ingin Dikonsultasikan:
                    </label>
                    <select
                      value={selectedCaseId}
                      onChange={(e) => setSelectedCaseId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-800"
                    >
                      {cases.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.status.toUpperCase()}] {c.judul_singkat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Message Box */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Pesan / Pertanyaan Konsultasi Awal:
                  </label>
                  <textarea
                    rows={4}
                    value={consultationMessage}
                    onChange={(e) => setConsultationMessage(e.target.value)}
                    required
                    placeholder="Jelaskan kebutuhan advokasi atau pertanyaan hukum Anda..."
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-xs leading-relaxed text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-rose-800"
                  />
                  <span className="text-[11px] text-stone-500 block mt-1">
                    Rangkuman analisis kelayakan hukum dari sistem Rakyat Menggugat akan dilampirkan secara otomatis bila dipilih.
                  </span>
                </div>

                {/* Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setContactModalLawyer(null)}
                    className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#881337] hover:bg-[#70102e] text-white px-5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Permohonan Konsultasi</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
