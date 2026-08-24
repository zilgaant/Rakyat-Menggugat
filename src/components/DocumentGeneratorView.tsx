/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * DocumentGeneratorView Component
 * Renders official Buku I Permohonan Mahkamah Konstitusi (MK) and Daftar Alat Bukti
 * strictly adhering to PMK No. 2 Tahun 2021.
 * Supports interactive identity editing, DOCX binary download, and print-to-PDF formatting.
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  ArrowLeft, 
  Scale, 
  User, 
  CheckCircle2, 
  Edit3, 
  Save, 
  BookOpen, 
  Stamp, 
  Building2, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  FileCheck
} from 'lucide-react';
import { 
  CaseRecord, 
  UserProfile, 
  DualAgentAssessment, 
  EvidenceItem, 
  StatementType,
  ConstitutionalPetitionDocument,
  PetitionerIdentity
} from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface DocumentGeneratorViewProps {
  activeCase: CaseRecord;
  currentUser: UserProfile;
  assessment: DualAgentAssessment;
  evidenceItems: EvidenceItem[];
  onBackToEvidence: () => void;
  onSaveStatement: (type: StatementType, lawyerName?: string, lawyerNumber?: string) => void;
}

export const DocumentGeneratorView: React.FC<DocumentGeneratorViewProps> = ({
  activeCase,
  currentUser,
  assessment,
  evidenceItems,
  onBackToEvidence,
  onSaveStatement,
}) => {
  const [statementType, setStatementType] = useState<StatementType>('disusun_mandiri');
  const [signerName, setSignerName] = useState(
    currentUser.organisasi?.pic_nama || (currentUser.email ? currentUser.email.split('@')[0] : 'Pemohon Warga Negara')
  );
  const [lawyerName, setLawyerName] = useState('');
  const [lawyerNumber, setLawyerNumber] = useState('');
  const [statementSigned, setStatementSigned] = useState(false);

  // Document state
  const [petitionDoc, setPetitionDoc] = useState<ConstitutionalPetitionDocument | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [docError, setDocError] = useState<string | null>(null);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Identity Edit Mode
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [editIdentity, setEditIdentity] = useState<PetitionerIdentity>({
    nama_lengkap: signerName,
    nik: '3171012345670001',
    tempat_tanggal_lahir: 'Jakarta, 17 Agustus 1990',
    pekerjaan: currentUser.tipe_pengguna === 'individu' ? 'Karyawan / Pekerja / Warga Negara' : 'Pengurus Organisasi Sipil',
    alamat_lengkap: 'Jl. Keadilan Rakyat No. 45, Jakarta Pusat, DKI Jakarta',
    nomor_kontak: '0812-3456-7890',
    email: currentUser.email || 'pemohon@rakyatmenggugat.id',
    kategori_pemohon: currentUser.tipe_pengguna === 'individu' 
      ? 'Perorangan Warga Negara Indonesia' 
      : 'Badan Hukum Publik/Privat'
  });

  // Active view tab in preview
  const [activeTab, setActiveTab] = useState<'buku_1_permohonan' | 'buku_bukti' | 'panduan_simpel'>('buku_1_permohonan');

  // Fetch or generate document from server
  const fetchPetitionDocument = async (customIdentity?: PetitionerIdentity) => {
    setIsLoadingDoc(true);
    setDocError(null);
    try {
      const payloadIdentity = customIdentity || editIdentity;
      const res = await fetch('/api/generate-petition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseFacts: activeCase.ringkasan_masalah_asli,
          petitionerInput: payloadIdentity,
          assessment: assessment
        })
      });

      if (!res.ok) {
        throw new Error('Gagal merumuskan draf dokumen permohonan dari server.');
      }

      const data = await res.json();
      setPetitionDoc(data.document);
    } catch (err: any) {
      console.error('Fetch petition error:', err);
      setDocError(err.message || 'Terjadi kendala saat merancang dokumen.');
    } finally {
      setIsLoadingDoc(false);
    }
  };

  useEffect(() => {
    fetchPetitionDocument();
  }, [activeCase.id]);

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingIdentity(false);
    setSignerName(editIdentity.nama_lengkap);
    fetchPetitionDocument(editIdentity);
  };

  const handleSignStatement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) return;
    onSaveStatement(statementType, lawyerName, lawyerNumber);
    setStatementSigned(true);
  };

  const handleDownloadDocx = async () => {
    if (!petitionDoc) return;
    setIsExportingDocx(true);
    try {
      const res = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petitionDocument: petitionDoc })
      });

      if (!res.ok) {
        throw new Error('Gagal menghasilkan file DOCX.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (petitionDoc.identitas_pemohon?.nama_lengkap || 'Pemohon').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `Buku_I_Permohonan_MK_${safeName}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Export DOCX error:', err);
      alert('Gagal mengunduh file DOCX. Silakan gunakan fitur Cetak / Simpan PDF.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 print:p-0 print:m-0 print:max-w-none">
      {/* Header Toolbar (Non-Printable) */}
      <div className="print:hidden bg-white border border-stone-300 rounded-lg p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#881337] uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Format Standar PMK No. 2 Tahun 2021</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Buku I Permohonan MK & Buku Bukti
            </h1>
            <p className="text-xs text-stone-600 mt-1">
              Draf permohonan pengujian undang-undang terstruktur, daftar alat bukti, dan formulir pernyataan penyusunan mandiri.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadDocx}
              disabled={!statementSigned || isExportingDocx || !petitionDoc}
              className="bg-stone-100 hover:bg-stone-200 text-stone-800 disabled:opacity-50 border border-stone-300 px-4 py-2.5 rounded-md text-xs font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
              title={!statementSigned ? 'Wajib menandatangani pernyataan terlebih dahulu' : 'Unduh berkas Word (.DOCX)'}
            >
              <Download className="w-4 h-4 text-stone-600" />
              <span>{isExportingDocx ? 'Membuat DOCX...' : 'Unduh Word (.DOCX)'}</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={!statementSigned || !petitionDoc}
              className="bg-[#881337] hover:bg-[#70102e] disabled:opacity-50 text-white px-4 py-2.5 rounded-md text-xs font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
              title={!statementSigned ? 'Wajib menandatangani pernyataan terlebih dahulu' : 'Cetak atau simpan sebagai PDF'}
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation for Document Preview */}
        <div className="flex items-center gap-2 border-b border-stone-200 text-xs">
          <button
            onClick={() => setActiveTab('buku_1_permohonan')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'buku_1_permohonan'
                ? 'border-[#881337] text-[#881337]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Buku I: Permohonan Resmi</span>
          </button>

          <button
            onClick={() => setActiveTab('buku_bukti')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'buku_bukti'
                ? 'border-[#881337] text-[#881337]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Buku II: Daftar Alat Bukti ({petitionDoc?.daftar_alat_bukti?.length || 4})</span>
          </button>

          <button
            onClick={() => setActiveTab('panduan_simpel')}
            className={`pb-2.5 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'panduan_simpel'
                ? 'border-[#881337] text-[#881337]'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Panduan Registrasi SIMPEL MK</span>
          </button>
        </div>
      </div>

      <div className="print:hidden">
        <DisclaimerBanner />
      </div>

      {/* Mandatory Self-Representation / Independent Advocate Statement Form (PRD Section 8 & C4) */}
      {!statementSigned ? (
        <div className="print:hidden bg-white border-2 border-rose-900/40 rounded-lg p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="border-b border-stone-200 pb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#881337] text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Formulir Pernyataan Penyusunan Permohonan
              </h2>
              <p className="text-xs text-stone-600">
                Wajib dilengkapi sebelum dokumen final dapat diunduh (Word .DOCX) atau dicetak resmi.
              </p>
            </div>
          </div>

          <form onSubmit={handleSignStatement} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                Pilih Status Penyusunan Permohonan:
              </label>

              <div className="space-y-2 text-xs">
                <label className="flex items-start gap-2.5 p-3 rounded border border-stone-200 hover:bg-stone-50 cursor-pointer">
                  <input
                    type="radio"
                    name="statementType"
                    checked={statementType === 'disusun_mandiri'}
                    onChange={() => setStatementType('disusun_mandiri')}
                    className="mt-0.5 text-[#881337] focus:ring-rose-800"
                  />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Saya bertindak mewakili diri sendiri (Penyusunan Mandiri / Pro Se)</strong>
                    <span className="text-stone-600">
                      Menggunakan platform Rakyat Menggugat sebagai alat bantu perumusan berkas hukum tanpa ketergantungan kuasa hukum berbayar.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded border border-stone-200 hover:bg-stone-50 cursor-pointer">
                  <input
                    type="radio"
                    name="statementType"
                    checked={statementType === 'dibantu_lawyer_diluar_sistem'}
                    onChange={() => setStatementType('dibantu_lawyer_diluar_sistem')}
                    className="mt-0.5 text-[#881337] focus:ring-rose-800"
                  />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Saya didampingi kuasa hukum / advokat independen di luar platform</strong>
                    <span className="text-stone-600">
                      Berkas draf permohonan ini ditelaah atau didaftarkan bersama advokat berlisensi independen.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Nama Lengkap Pemohon / Penandatangan:
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Nama lengkap sesuai KTP"
                  required
                  className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
              </div>

              {statementType === 'dibantu_lawyer_diluar_sistem' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Nama Advokat / Kuasa Hukum:
                    </label>
                    <input
                      type="text"
                      value={lawyerName}
                      onChange={(e) => setLawyerName(e.target.value)}
                      placeholder="Nama Advokat"
                      className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      Nomor Induk Advokat / Izin:
                    </label>
                    <input
                      type="text"
                      value={lawyerNumber}
                      onChange={(e) => setLawyerNumber(e.target.value)}
                      placeholder="Contoh: NIA 12345/PERADI"
                      className="w-full px-3 py-2 border border-stone-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-[#881337] hover:bg-[#70102e] text-white px-5 py-2 rounded text-xs font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tandatangani Pernyataan & Buka Akses Unduh Word/PDF</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="print:hidden bg-emerald-50 border border-emerald-300 rounded-lg p-4 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>
              Formulir Pernyataan telah ditandatangani secara sah atas nama: <strong>{signerName}</strong> ({statementType === 'disusun_mandiri' ? 'Penyusunan Mandiri' : `Didampingi Kuasa Hukum: ${lawyerName || '-'}`})
            </span>
          </div>
          <button
            onClick={() => setStatementSigned(false)}
            className="text-emerald-800 hover:underline font-semibold cursor-pointer"
          >
            Ubah Pernyataan
          </button>
        </div>
      )}

      {/* Identity Editor Card (Non-Printable) */}
      <div className="print:hidden bg-stone-50 border border-stone-300 rounded-lg p-5 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
          <div className="flex items-center gap-2 font-bold text-stone-900 uppercase">
            <User className="w-4 h-4 text-[#881337]" />
            <span>Data Identitas Pemohon (Sesuai KTP untuk Registrasi MK)</span>
          </div>
          {!isEditingIdentity ? (
            <button
              onClick={() => setIsEditingIdentity(true)}
              className="text-[#881337] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Identitas</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditingIdentity(false)}
              className="text-stone-500 hover:underline cursor-pointer"
            >
              Batal
            </button>
          )}
        </div>

        {isEditingIdentity ? (
          <form onSubmit={handleSaveIdentity} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Lengkap (Sesuai KTP):</label>
                <input
                  type="text"
                  value={editIdentity.nama_lengkap}
                  onChange={(e) => setEditIdentity({ ...editIdentity, nama_lengkap: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs bg-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nomor Induk Kependudukan (NIK):</label>
                <input
                  type="text"
                  value={editIdentity.nik}
                  onChange={(e) => setEditIdentity({ ...editIdentity, nik: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs bg-white"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tempat, Tanggal Lahir:</label>
                <input
                  type="text"
                  value={editIdentity.tempat_tanggal_lahir}
                  onChange={(e) => setEditIdentity({ ...editIdentity, tempat_tanggal_lahir: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Pekerjaan / Profesi:</label>
                <input
                  type="text"
                  value={editIdentity.pekerjaan}
                  onChange={(e) => setEditIdentity({ ...editIdentity, pekerjaan: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">Alamat Domisili Lengkap:</label>
                <input
                  type="text"
                  value={editIdentity.alamat_lengkap}
                  onChange={(e) => setEditIdentity({ ...editIdentity, alamat_lengkap: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nomor Telepon / WhatsApp:</label>
                <input
                  type="text"
                  value={editIdentity.nomor_kontak}
                  onChange={(e) => setEditIdentity({ ...editIdentity, nomor_kontak: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Kategori Pemohon (Pasal 51 UU MK):</label>
                <select
                  value={editIdentity.kategori_pemohon}
                  onChange={(e) => setEditIdentity({ ...editIdentity, kategori_pemohon: e.target.value as any })}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs bg-white"
                >
                  <option value="Perorangan Warga Negara Indonesia">Perorangan Warga Negara Indonesia</option>
                  <option value="Kesatuan Masyarakat Hukum Adat">Kesatuan Masyarakat Hukum Adat</option>
                  <option value="Badan Hukum Publik/Privat">Badan Hukum Publik/Privat</option>
                  <option value="Lembaga Negara">Lembaga Negara</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan & Perbarui Draf Permohonan</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-800">
            <div>
              <span className="text-stone-500 block">Nama Pemohon:</span>
              <strong>{petitionDoc?.identitas_pemohon?.nama_lengkap || editIdentity.nama_lengkap}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">NIK:</span>
              <span>{petitionDoc?.identitas_pemohon?.nik || editIdentity.nik}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Pekerjaan:</span>
              <span>{petitionDoc?.identitas_pemohon?.pekerjaan || editIdentity.pekerjaan}</span>
            </div>
            <div>
              <span className="text-stone-500 block">Kategori:</span>
              <span className="inline-block bg-stone-200 text-stone-800 px-1.5 py-0.5 rounded text-[11px]">
                {petitionDoc?.identitas_pemohon?.kategori_pemohon || editIdentity.kategori_pemohon}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Loading / Error States */}
      {isLoadingDoc && (
        <div className="p-12 text-center bg-white border border-stone-300 rounded-lg space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#881337] mx-auto" />
          <p className="font-serif font-bold text-stone-900 text-base">
            Merumuskan Buku I Permohonan Mahkamah Konstitusi...
          </p>
          <p className="text-xs text-stone-600">
            Menyusun 4 lapis yuridis, 5 syarat legal standing, pasal batu uji UUD 1945, dan daftar alat bukti.
          </p>
        </div>
      )}

      {docError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3 text-xs text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-700 flex-shrink-0" />
          <div>
            <strong>Gagal memuat permohonan:</strong> {docError}
          </div>
          <button
            onClick={() => fetchPetitionDocument()}
            className="ml-auto bg-rose-900 text-white px-3 py-1 rounded text-xs hover:bg-rose-800 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* DOCUMENT PREVIEW CONTAINER */}
      {!isLoadingDoc && petitionDoc && (
        <>
          {/* TAB 1: BUKU I PERMOHONAN */}
          {activeTab === 'buku_1_permohonan' && (
            <div className="bg-white border border-stone-300 rounded-lg p-8 sm:p-14 shadow-sm font-serif space-y-8 text-stone-900 leading-relaxed print:border-none print:shadow-none print:p-0">
              {/* Document Header & Destination */}
              <div className="flex justify-between items-start border-b-2 border-stone-900 pb-6">
                <div>
                  <p className="text-xs font-sans font-bold text-stone-500 uppercase tracking-wider">
                    {petitionDoc.nomor_perkara_internal}
                  </p>
                  <p className="text-xs font-sans text-stone-600">
                    Sistematika Sesuai PMK No. 2/2021
                  </p>
                </div>
                <div className="text-right font-sans text-xs">
                  <p className="font-bold">{petitionDoc.tanggal_surat}</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {/* Warning Banner if Document has need_data or posita warnings */}
                {petitionDoc.peringatan_kelayakan && (
                  <div className="print:hidden p-4 bg-amber-50 border border-amber-300 rounded-md text-xs font-sans space-y-1.5 text-amber-900 shadow-xs">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                      <span>Catatan Penting Tim Asesmen Hukum:</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed">
                      {petitionDoc.peringatan_kelayakan}
                    </p>
                    {petitionDoc.catatan_kelemahan_posita && (
                      <div className="mt-2 pt-2 border-t border-amber-200 text-[11px] text-amber-900 bg-amber-100/60 p-2.5 rounded font-mono">
                        {petitionDoc.catatan_kelemahan_posita}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="font-bold text-xs uppercase tracking-wide font-sans text-stone-800">
                    Hal: {petitionDoc.judul_permohonan}
                  </p>
                </div>

                <div className="font-sans text-xs space-y-1 text-stone-800">
                  <p><strong>Kepada Yang Mulia:</strong></p>
                  <p className="font-semibold">Ketua Mahkamah Konstitusi Republik Indonesia</p>
                  <p>Jalan Medan Merdeka Barat No. 6, Gambir, Jakarta Pusat 10110</p>
                </div>

                <p className="text-xs sm:text-sm font-sans pt-2">
                  Dengan hormat,<br />
                  Yang bertanda tangan di bawah ini:
                </p>

                {/* Identitas Pemohon */}
                <div className="bg-stone-50 border border-stone-200 rounded p-4 font-sans text-xs space-y-1.5">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-stone-500">Nama Lengkap</span>
                    <span className="col-span-2 font-bold text-stone-900">: {petitionDoc.identitas_pemohon.nama_lengkap}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-stone-500">NIK / Nomor KTP</span>
                    <span className="col-span-2">: {petitionDoc.identitas_pemohon.nik}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-stone-500">Tempat, Tgl Lahir</span>
                    <span className="col-span-2">: {petitionDoc.identitas_pemohon.tempat_tanggal_lahir}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-stone-500">Pekerjaan / Profesi</span>
                    <span className="col-span-2">: {petitionDoc.identitas_pemohon.pekerjaan}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-stone-500">Alamat Domisili</span>
                    <span className="col-span-2">: {petitionDoc.identitas_pemohon.alamat_lengkap}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-stone-500">Kualifikasi Hukum</span>
                    <span className="col-span-2 font-semibold">: {petitionDoc.identitas_pemohon.kategori_pemohon}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-sans">
                  Selanjutnya disebut sebagai ------------------------------------------------------------- <strong>PEMOHON;</strong>
                </p>

                <p className="text-xs sm:text-sm font-sans leading-relaxed">
                  Dengan ini mengajukan permohonan pengujian materiil terhadap <strong>{petitionDoc.posita.norma_yang_diuji.undang_undang}</strong> terhadap Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, dengan mendasarkan pada dalil-dalil hukum dan uraian argumentasi konstitusional sebagai berikut:
                </p>
              </div>

              {/* SECTION I: KEWENANGAN MAHKAMAH KONSTITUSI */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-300 pb-1.5">
                  <h3 className="font-bold text-base uppercase tracking-wider text-stone-900">
                    I. Kewenangan Mahkamah Konstitusi
                  </h3>
                  {/* Tooltip Penjelasan Simpel */}
                  <span className="print:hidden text-[11px] font-sans text-stone-500 bg-stone-100 px-2 py-0.5 rounded flex items-center gap-1" title="Bagian ini menjelaskan dasar hukum mengapa Mahkamah Konstitusi berwenang menguji undang-undang ini sesuai UUD 1945">
                    <HelpCircle className="w-3 h-3 text-stone-400" />
                    Penjelasan: Landasan wewenang MK
                  </span>
                </div>
                <div className="text-xs sm:text-sm space-y-2 text-stone-800 font-sans leading-relaxed">
                  <ol className="list-decimal pl-5 space-y-1.5">
                    {petitionDoc.kewenangan_mk.dasar_hukum.map((dh, idx) => (
                      <li key={idx}>Bahwa berdasarkan {dh};</li>
                    ))}
                  </ol>
                  <p className="pt-2 text-justify">
                    {petitionDoc.kewenangan_mk.uraian_kewenangan}
                  </p>
                </div>
              </div>

              {/* SECTION II: KEDUDUKAN HUKUM (LEGAL STANDING) */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-300 pb-1.5">
                  <h3 className="font-bold text-base uppercase tracking-wider text-stone-900">
                    II. Kedudukan Hukum (Legal Standing) Pemohon
                  </h3>
                  {/* Tooltip Penjelasan Simpel */}
                  <span className="print:hidden text-[11px] font-sans text-stone-500 bg-stone-100 px-2 py-0.5 rounded flex items-center gap-1" title="Bagian ini membuktikan bahwa Anda adalah pihak yang berhak menggugat karena mengalami kerugian nyata atau potensial">
                    <HelpCircle className="w-3 h-3 text-stone-400" />
                    Penjelasan: Hak & kerugian pemohon
                  </span>
                </div>
                <div className="text-xs sm:text-sm space-y-3 text-stone-800 font-sans leading-relaxed">
                  <p>
                    Bahwa Pasal 51 ayat (1) UU Mahkamah Konstitusi mengatur bahwa Pemohon adalah pihak yang menganggap hak dan/atau kewenangan konstitusionalnya dirugikan oleh berlakunya undang-undang. Berdasarkan doktrin yurisprudensi tetap Mahkamah Konstitusi (Putusan No. 006/PUU-III/2005), Pemohon telah memenuhi 5 syarat kumulatif kerugian hak konstitusional sebagai berikut:
                  </p>
                  
                  <div className="space-y-2 pl-3 border-l-2 border-[#881337]/50 text-xs">
                    <p>
                      <strong>1. Hak Konstitusional Pemohon:</strong> {petitionDoc.kedudukan_hukum.uraian_5_syarat_standing.syarat_1_hak_konstitusional}
                    </p>
                    <p>
                      <strong>2. Kerugian Spesifik:</strong> {petitionDoc.kedudukan_hukum.uraian_5_syarat_standing.syarat_2_kerugian_spesifik}
                    </p>
                    <p>
                      <strong>3. Sifat Aktual / Potensial:</strong> {petitionDoc.kedudukan_hukum.uraian_5_syarat_standing.syarat_3_kerugian_aktual_potensial}
                    </p>
                    <p>
                      <strong>4. Hubungan Kausalitas (Causal Verband):</strong> {petitionDoc.kedudukan_hukum.uraian_5_syarat_standing.syarat_4_causal_verband}
                    </p>
                    <p>
                      <strong>5. Pemulihan Kerugian Apabila Dikabulkan:</strong> {petitionDoc.kedudukan_hukum.uraian_5_syarat_standing.syarat_5_efek_pemulihan}
                    </p>
                  </div>

                  <p className="italic text-stone-700 pt-1">
                    {petitionDoc.kedudukan_hukum.kesimpulan_standing}
                  </p>
                </div>
              </div>

              {/* SECTION III: POSITA */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-300 pb-1.5">
                  <h3 className="font-bold text-base uppercase tracking-wider text-stone-900">
                    III. Alasan-Alasan Permohonan (Posita)
                  </h3>
                  {/* Tooltip Penjelasan Simpel */}
                  <span className="print:hidden text-[11px] font-sans text-stone-500 bg-stone-100 px-2 py-0.5 rounded flex items-center gap-1" title="Posita memuat uraian fakta kasus dan pertentangan pasal UU terhadap pasal-pasal UUD 1945">
                    <HelpCircle className="w-3 h-3 text-stone-400" />
                    Penjelasan: Alasan & dasar gugatan
                  </span>
                </div>
                <div className="text-xs sm:text-sm space-y-4 text-stone-800 font-sans leading-relaxed">
                  {/* A. Duduk Perkara */}
                  <div>
                    <h4 className="font-bold text-stone-900 mb-1">A. Duduk Perkara & Latar Belakang Fakta</h4>
                    <p className="text-justify whitespace-pre-line bg-stone-50 p-3 rounded border border-stone-200 text-xs">
                      {petitionDoc.posita.latar_belakang_fakta}
                    </p>
                  </div>

                  {/* B. Norma yang Diuji */}
                  <div>
                    <h4 className="font-bold text-stone-900 mb-1">B. Norma Undang-Undang yang Dimohonkan Pengujian</h4>
                    <p className="text-xs">Ketentuan {petitionDoc.posita.norma_yang_diuji.pasal_ayat} dalam {petitionDoc.posita.norma_yang_diuji.undang_undang}:</p>
                    <div className="p-3 bg-stone-100 border-l-4 border-stone-700 my-2 italic text-xs font-serif">
                      {petitionDoc.posita.norma_yang_diuji.bunyi_norma}
                    </div>
                  </div>

                  {/* C. Batu Uji */}
                  <div>
                    <h4 className="font-bold text-stone-900 mb-2">C. Batu Uji Konstitusional (UUD 1945) dan Analisis Pertentangan Norma</h4>
                    <div className="space-y-3">
                      {petitionDoc.posita.batu_uji_uud_1945.map((bu, idx) => (
                        <div key={idx} className="p-3 rounded border border-stone-200 bg-white space-y-1 text-xs">
                          <p className="font-bold text-[#881337]">{bu.pasal}</p>
                          <p className="italic text-stone-700 font-serif">"{bu.bunyi_pasal}"</p>
                          <p className="text-stone-800 pt-1"><strong>Analisis Yuridis:</strong> {bu.analisis_pertentangan}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* D. Analisis Komprehensif */}
                  <div>
                    <h4 className="font-bold text-stone-900 mb-1">D. Analisis Yuridis Komprehensif</h4>
                    <p className="text-justify text-xs">
                      {petitionDoc.posita.analisis_pertentangan_komprehensif}
                    </p>
                  </div>

                  {/* E. Ne Bis In Idem */}
                  <div>
                    <h4 className="font-bold text-stone-900 mb-1">E. Pemenuhan Asas Ne Bis In Idem (Pasal 60 UU MK)</h4>
                    <p className="text-justify text-xs">
                      {petitionDoc.posita.penegasan_ne_bis_in_idem}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION IV: PETITUM */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-300 pb-1.5">
                  <h3 className="font-bold text-base uppercase tracking-wider text-stone-900">
                    IV. Hal-Hal yang Dimohonkan (Petitum)
                  </h3>
                  {/* Tooltip Penjelasan Simpel */}
                  <span className="print:hidden text-[11px] font-sans text-stone-500 bg-stone-100 px-2 py-0.5 rounded flex items-center gap-1" title="Petitum adalah poin-poin putusan yang Anda minta kepada Majelis Hakim MK untuk diputuskan">
                    <HelpCircle className="w-3 h-3 text-stone-400" />
                    Penjelasan: Permintaan putusan hakim
                  </span>
                </div>
                <div className="text-xs sm:text-sm space-y-3 text-stone-800 font-sans leading-relaxed">
                  <p>
                    Berdasarkan seluruh dalil-dalil hukum, fakta empiris, dan argumentasi konstitusional yang telah diuraikan di atas, Pemohon memohon kepada Yang Mulia Majelis Hakim Mahkamah Konstitusi Republik Indonesia berkenan memeriksa dan menjatuhkan putusan sebagai berikut:
                  </p>
                  <div className="space-y-2">
                    <p className="font-bold text-stone-900 uppercase">PRIMAIR:</p>
                    <ol className="list-decimal pl-5 space-y-1 text-xs">
                      {petitionDoc.petitum.primair.map((p, idx) => (
                        <li key={idx}>{p.replace(/^\d+\.\s*/, '')}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="space-y-1 pt-2">
                    <p className="font-bold text-stone-900 uppercase">SUBSIDAIR:</p>
                    <p className="italic text-xs pl-5">
                      {petitionDoc.petitum.subsidair}
                    </p>
                  </div>
                </div>
              </div>

              {/* Signature Block */}
              <div className="pt-10 border-t border-stone-300 flex justify-between items-end font-sans text-xs">
                <div>
                  <p className="text-stone-500">Platform Rakyat Menggugat</p>
                  <p className="text-[11px] text-stone-400">Nomor Registrasi Draf: {petitionDoc.nomor_perkara_internal}</p>
                </div>
                <div className="text-center space-y-6">
                  <p>Hormat Kami,<br /><strong>PEMOHON</strong></p>
                  <div className="border border-dashed border-stone-400 py-3 px-6 rounded text-[11px] text-stone-500">
                    Materai Rp 10.000,-
                  </div>
                  <p className="font-bold text-stone-900 underline">
                    ( {petitionDoc.identitas_pemohon.nama_lengkap} )
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUKU BUKTI (LAMPIRAN ALAT BUKTI) */}
          {activeTab === 'buku_bukti' && (
            <div className="bg-white border border-stone-300 rounded-lg p-8 sm:p-12 shadow-sm space-y-6 text-stone-900">
              <div className="text-center border-b border-stone-200 pb-4">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#881337] uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Lampiran Resmi Berkas Perkara</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                  Buku II: Daftar Alat Bukti (Buku Bukti)
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Tabel klasifikasi alat bukti tertulis, legalisasi/pemeteraian di Kantor Pos, dan korelasi pembuktian.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-stone-300 text-xs font-sans">
                  <thead>
                    <tr className="bg-stone-100 text-stone-900">
                      <th className="border border-stone-300 p-3 text-left w-16">Kode</th>
                      <th className="border border-stone-300 p-3 text-left w-1/3">Nama Dokumen Alat Bukti</th>
                      <th className="border border-stone-300 p-3 text-left">Fakta yang Dibuktikan</th>
                      <th className="border border-stone-300 p-3 text-center w-36">Status Materai</th>
                    </tr>
                  </thead>
                  <tbody>
                    {petitionDoc.daftar_alat_bukti.map((item, idx) => (
                      <tr key={idx} className="hover:bg-stone-50">
                        <td className="border border-stone-300 p-3 font-bold text-[#881337]">
                          {item.kode_bukti}
                        </td>
                        <td className="border border-stone-300 p-3">
                          <strong className="block text-stone-900">{item.nama_dokumen}</strong>
                          <span className="text-[11px] text-stone-500">{item.kategori}</span>
                        </td>
                        <td className="border border-stone-300 p-3 text-stone-700 leading-relaxed">
                          {item.keterangan_pembuktian}
                        </td>
                        <td className="border border-stone-300 p-3 text-center">
                          <span className={`inline-block px-2 py-1 rounded text-[10px] font-semibold ${
                            item.status_materai_pos.includes('Wajib')
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {item.status_materai_pos}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Panduan Pemeteraian Pos */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 space-y-2 text-xs text-amber-950">
                <div className="flex items-center gap-2 font-bold uppercase text-amber-900">
                  <Stamp className="w-4 h-4" />
                  <span>Kewajiban Legalisasi/Pemeteraian di Kantor Pos Sesuai UU Bea Meterai</span>
                </div>
                <p className="leading-relaxed">
                  {petitionDoc.panduan_pendaftaran.tata_cara_legalisasi_pos}
                </p>
                <p className="text-[11px] text-amber-800 italic">
                  Tip: Bawalah dokumen fotokopi ke Kantor Pos Besar setempat dan mintalah petugas loket untuk melakukan pemeteraian kemudian (cap pos legalisasi alat bukti pengadilan).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PANDUAN PENDAFTARAN SIMPEL MK */}
          {activeTab === 'panduan_simpel' && (
            <div className="bg-white border border-stone-300 rounded-lg p-8 sm:p-10 shadow-sm space-y-6 text-stone-900">
              <div className="border-b border-stone-200 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#881337] uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>Prosedur Beracara Mahkamah Konstitusi</span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                  Panduan Pendaftaran & Penyerahan Berkas
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  Dua jalur resmi pendaftaran permohonan ke Mahkamah Konstitusi Republik Indonesia.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Jalur Daring SIMPEL MK */}
                <div className="p-5 border-2 border-emerald-300 bg-emerald-50/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase text-emerald-900 tracking-wider">Jalur 1: Online 24/7</span>
                    <span className="bg-emerald-200 text-emerald-900 font-semibold px-2 py-0.5 rounded text-[10px]">Direkomendasikan</span>
                  </div>
                  <h3 className="font-bold text-sm text-stone-900">Portal Elektronik SIMPEL MK</h3>
                  <p className="text-stone-700 leading-relaxed">
                    {petitionDoc.panduan_pendaftaran.prosedur_online_simpel_mk}
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-stone-600">
                    <li>Buat akun Pemohon di <code className="bg-white px-1 py-0.5 border rounded">simpel.mkri.id</code></li>
                    <li>Unggah pindaian KTP & Berkas Word (.DOCX) + PDF hasil cetak</li>
                    <li>Dapatkan Tanda Terima Pengajuan Permohonan Elektronik (e-Akta)</li>
                  </ul>
                  <a
                    href="https://simpel.mkri.id"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-800 font-bold hover:underline pt-2"
                  >
                    <span>Buka Portal simpel.mkri.id</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Jalur Langsung PTSP */}
                <div className="p-5 border border-stone-300 bg-stone-50 rounded-lg space-y-3">
                  <span className="font-bold uppercase text-stone-700 tracking-wider">Jalur 2: Langsung (Offline)</span>
                  <h3 className="font-bold text-sm text-stone-900">Loket PTSP Kepaniteraan MK</h3>
                  <p className="text-stone-700 leading-relaxed">
                    {petitionDoc.panduan_pendaftaran.prosedur_offline_kepaniteraan}
                  </p>
                  <div className="pt-2 border-t border-stone-200 text-stone-600 space-y-1">
                    <p className="font-semibold text-stone-800">Ketentuan Jumlah Rangkap Berkas:</p>
                    <p>{petitionDoc.panduan_pendaftaran.jumlah_rangkap_berkas}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* POIN 10: "Yang Harus Anda Lakukan Setelah Dokumen Siap" (Timeline / Checklist Tindak Lanjut Pasca Generate) */}
      <div className="print:hidden bg-stone-900 text-white rounded-lg p-6 sm:p-8 space-y-6 shadow-md">
        <div className="border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Tahapan Lanjutan Bagi Warga</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1">
            Yang Harus Anda Lakukan Setelah Dokumen Siap
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Ikuti 5 langkah berurutan di bawah ini untuk meresmikan berkas permohonan hingga masuk ke sidang Mahkamah Konstitusi:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-lg bg-stone-800/80 border border-stone-700 space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h4 className="font-bold text-stone-100 text-sm">Unduh File Word (.DOCX)</h4>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Unduh berkas Word untuk mengecek kembali penulisan nama, alamat, serta uraian fakta yang dialami.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-lg bg-stone-800/80 border border-stone-700 space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h4 className="font-bold text-stone-100 text-sm">Cetak Rangkap Dokumen</h4>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Cetak Buku I Permohonan dan Buku II Bukti (1 rangkap asli bertanda tangan + salinan fotokopi untuk arsip/jalur PTSP).
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-lg bg-stone-800/80 border border-stone-700 space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h4 className="font-bold text-stone-100 text-sm">Legalisasi di Kantor Pos</h4>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Bawa fotokopi bukti surat ke Kantor Pos Besar terdekat untuk pemeteraian/cap pos legalisasi alat bukti pengadilan.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-lg bg-stone-800/80 border border-stone-700 space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center font-bold text-xs">
              4
            </div>
            <h4 className="font-bold text-stone-100 text-sm">Daftar Akun SIMPEL MK</h4>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Kunjungi portal resmi <strong className="text-rose-300">simpel.mkri.id</strong> dan daftarkan diri Anda sebagai pemohon mandiri tanpa biaya.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-lg bg-stone-800/80 border border-stone-700 space-y-2">
            <div className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center font-bold text-xs">
              5
            </div>
            <h4 className="font-bold text-stone-100 text-sm">Unggah Dokumen & Pantau</h4>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Unggah berkas Word dan PDF hasil scan, simpan Akta Pengajuan Permohonan Pemohon (AP3), dan tunggu jadwal Sidang Pendahuluan.
            </p>
          </div>
        </div>

        <div className="bg-stone-800/50 p-3 rounded text-[11px] text-stone-400 flex items-center gap-2 border border-stone-700">
          <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Pengajuan permohonan ke Mahkamah Konstitusi RI <strong>100% Bebas Biaya Perkara</strong> (tidak dipungut biaya pendaftaran sidang).</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="print:hidden flex items-center justify-between pt-4 border-t border-stone-200">
        <button
          onClick={onBackToEvidence}
          className="px-5 py-2.5 border border-stone-300 rounded-md text-xs font-semibold text-stone-700 hover:bg-stone-100 transition flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Panduan Bukti</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadDocx}
            disabled={!statementSigned || isExportingDocx || !petitionDoc}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 disabled:opacity-50 border border-stone-300 px-4 py-2.5 rounded-md text-xs font-semibold transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingDocx ? 'Membuat Word...' : 'Unduh Word (.DOCX)'}</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={!statementSigned || !petitionDoc}
            className="bg-[#881337] hover:bg-[#70102e] disabled:opacity-50 text-white px-6 py-2.5 rounded-md text-xs font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Resmi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
