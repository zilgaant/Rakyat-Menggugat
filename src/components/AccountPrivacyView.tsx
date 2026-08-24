/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Lock, Trash2, Download, AlertTriangle, CheckCircle, RefreshCw, Key, Landmark, User, FileText } from 'lucide-react';
import { UserProfile, LanguagePreference, UserType } from '../types';

interface AccountPrivacyViewProps {
  currentUser: UserProfile | null;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onDeleteAllData: () => void;
  onOpenAuth: () => void;
}

export const AccountPrivacyView: React.FC<AccountPrivacyViewProps> = ({
  currentUser,
  onUpdateUser,
  onDeleteAllData,
  onOpenAuth,
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-stone-900">
          Pengaturan Akun & Hak Privasi Data
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          Silakan masuk atau buat sesi anonim terlebih dahulu untuk mengelola hak privasi data dan riwayat perkara Anda.
        </p>
        <button
          onClick={onOpenAuth}
          className="bg-[#881337] hover:bg-[#70102e] text-white px-5 py-2.5 rounded text-sm font-semibold transition inline-flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          <span>Masuk / Buka Sesi Anonim</span>
        </button>
      </div>
    );
  }

  const handleLanguageChange = (lang: LanguagePreference) => {
    onUpdateUser({ preferensi_bahasa: lang });
    setSuccessMsg('Preferensi bahasa berhasil diperbarui.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleUserTypeChange = (type: UserType) => {
    onUpdateUser({ tipe_pengguna: type });
    setSuccessMsg('Kategori pemohon berhasil diperbarui.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentUser, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rakyat-menggugat-profile-${currentUser.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border-2 border-stone-300 rounded-lg p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
          <div className="w-10 h-10 rounded bg-[#881337] text-white flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Privasi
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Pengaturan Akun & Pelindungan Data Pribadi (Kepatuhan UU No. 27/2022 tentang Pelindungan Data Pribadi)
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-950 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-stone-50 rounded border border-stone-200 space-y-1">
            <span className="font-semibold text-stone-600 block">ID Pemohon / Sesi:</span>
            <span className="font-mono text-stone-900 break-all">{currentUser.id}</span>
          </div>

          <div className="p-4 bg-stone-50 rounded border border-stone-200 space-y-1">
            <span className="font-semibold text-stone-600 block">Mode Autentikasi:</span>
            <span className="font-medium text-stone-900">
              {currentUser.auth_mode === 'anonim_pseudonim' ? 'Mode Pseudonim Anonim (Tanpa PII)' : `Akun Email: ${currentUser.email}`}
            </span>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 space-y-6 shadow-xs">
        <h2 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-200 pb-3">
          Preferensi Konsultasi & Kategori Hukum
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-stone-900 mb-1.5 uppercase tracking-wider text-xs">
              Bahasa Konsultasi AI:
            </label>
            <select
              value={currentUser.preferensi_bahasa}
              onChange={(e) => handleLanguageChange(e.target.value as LanguagePreference)}
              className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="jv">Basa Jawa (Terjemahan Otomatis)</option>
              <option value="su">Basa Sunda (Terjemahan Otomatis)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-900 mb-1.5 uppercase tracking-wider text-xs">
              Kategori Subjek Pemohon (Legal Standing):
            </label>
            <select
              value={currentUser.tipe_pengguna}
              onChange={(e) => handleUserTypeChange(e.target.value as UserType)}
              className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
            >
              <option value="individu">Perorangan Warga Negara Indonesia (WNI)</option>
              <option value="kelompok_sipil">Kesatuan Masyarakat Adat / LSM / Organisasi</option>
              <option value="badan_hukum">Badan Hukum Publik / Privat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Sovereignty & Security Notice (PRD Section 9 & 15) */}
      <div className="bg-stone-50 border border-stone-300 rounded-lg p-6 space-y-3 text-xs text-stone-800">
        <div className="flex items-center gap-2 text-stone-900 font-bold font-serif text-sm">
          <Landmark className="w-4 h-4 text-rose-900" />
          <span>Kedaulatan Data & Hosting (Region Jakarta asia-southeast2)</span>
        </div>
        <p className="leading-relaxed">
          Seluruh data kasus dan dokumen Anda disimpan secara aman pada infrastruktur cloud region Jakarta (<code>asia-southeast2</code>) dengan enkripsi <em>at-rest</em> (AES-256) dan <em>in-transit</em> (TLS 1.3). Kami tidak menjual data Anda kepada pihak ketiga manapun untuk kepentingan komersial.
        </p>
      </div>

      {/* Bagian 8: Pemroses Data Pihak Ketiga & Mesin Pencari Hukum (Pasal.id & Model AI) */}
      <div className="bg-white border border-stone-300 rounded-lg p-6 space-y-4 shadow-xs text-xs text-stone-800">
        <div className="flex items-center gap-2 text-stone-900 font-bold font-serif text-sm border-b border-stone-200 pb-3">
          <Lock className="w-4 h-4 text-rose-900" />
          <span>Kebijakan Transparansi: Pemroses Data Pihak Ketiga (Pasal.id & Gemini AI)</span>
        </div>
        <div className="space-y-3 text-xs leading-relaxed text-stone-700">
          <p>
            Sesuai prinsip kejujuran dan keterbukaan UU No. 27/2022 tentang Pelindungan Data Pribadi (UU PDP), platform <strong>Rakyat Menggugat</strong> menggunakan integrasi pihak ketiga berikut secara terbatas dan terenkripsi:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 bg-stone-50 rounded border border-stone-200 space-y-1.5">
              <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-rose-900" />
                1. API & MCP Server Pasal.id
              </span>
              <p className="text-stone-600 text-xs leading-normal">
                Digunakan untuk pencarian naskah publik peraturan perundang-undangan (187.000+ UU/PP/Perpres) dan putusan presedensi Mahkamah Konstitusi. Transmisi ke Pasal.id murni berupa <em>query kata kunci hukum</em> (tanpa data identitas pribadi, NIK, atau nama pemohon).
              </p>
            </div>
            <div className="p-3.5 bg-stone-50 rounded border border-stone-200 space-y-1.5">
              <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-900" />
                2. Model AI Gemini (Google Cloud)
              </span>
              <p className="text-stone-600 text-xs leading-normal">
                Digunakan untuk penalaran hukum 4-lapis independen (Agent 2 & Agent 3). Pemrosesan teks fakta kasus dilakukan tanpa retensi permanen untuk pelatihan model publik.
              </p>
            </div>
          </div>
          <p className="text-stone-500 italic text-[11px] pt-1">
            * Seluruh kutipan norma hukum dan presedensi yang ditarik melalui Pasal.id disimpan dalam bentuk snapshot permanen berstempel waktu di database kami untuk menjaga audit trail yang tidak dapat diubah (immutable).
          </p>
        </div>
      </div>

      {/* Right to Erasure & Data Actions (PRD Section 17) */}
      <div className="bg-white border-2 border-rose-200 rounded-lg p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5 text-rose-900 border-b border-rose-100 pb-3">
          <Trash2 className="w-5 h-5" />
          <h2 className="font-serif font-bold text-lg text-stone-900">
            Hak Menghapus Data (Right to Erasure) & Portabilitas
          </h2>
        </div>

        <p className="text-xs text-stone-700 leading-relaxed">
          Sesuai Pasal 38 UU No. 27/2022 tentang Pelindungan Data Pribadi, Anda berhak mengunduh salinan data Anda atau menghapus seluruh catatan perkara secara permanen dari server kami sewaktu-waktu.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2 border border-stone-300 hover:bg-stone-100 rounded text-xs font-semibold text-stone-800 transition flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Profil & Salinan Data (.JSON)</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('PERINGATAN: Tindakan ini akan menghapus SELURUH draf kasus, riwayat percakapan AI, dan identitas Anda secara permanen. Tindakan ini tidak dapat dibatalkan. Lanjutkan?')) {
                onDeleteAllData();
              }
            }}
            className="bg-rose-900 hover:bg-rose-950 text-white px-4 py-2 rounded text-xs font-semibold transition flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Seluruh Data Kasus & Akun Saya</span>
          </button>
        </div>
      </div>
    </div>
  );
};
