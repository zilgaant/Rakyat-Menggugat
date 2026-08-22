/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Lock, Mail, Check, X, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { UserProfile, UserType, LanguagePreference, AuthMode } from '../types';
import { ensureFirebaseAuth } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticate: (user: UserProfile) => void;
  initialUserType?: UserType;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticate,
  initialUserType = 'individu',
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('anonim_pseudonim');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<UserType>(initialUserType);
  const [language, setLanguage] = useState<LanguagePreference>('id');
  const [orgName, setOrgName] = useState('');
  const [picName, setPicName] = useState('');
  const [picContact, setPicContact] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAgreed) {
      setErrorMsg('Anda wajib membaca dan menyetujui Kebijakan Privasi terlebih dahulu sebelum melanjutkan.');
      return;
    }

    if (authMode === 'email' && !email.trim()) {
      setErrorMsg('Harap masukkan alamat email yang valid.');
      return;
    }

    if (userType !== 'individu' && !orgName.trim()) {
      setErrorMsg('Harap masukkan nama organisasi / badan hukum.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Authenticate with Firebase to get a real request.auth.uid
      const fbUser = await ensureFirebaseAuth();
      const now = new Date().toISOString();
      const pseudonymToken = authMode === 'anonim_pseudonim' 
        ? 'RM-ANON-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + fbUser.uid.substring(0, 6).toUpperCase()
        : null;

      const newUser: UserProfile = {
        id: fbUser.uid, // Guaranteed to match request.auth.uid in Firestore Rules
        auth_mode: authMode,
        email: authMode === 'email' ? email.trim() : null,
        pseudonim_token: pseudonymToken,
        tipe_pengguna: userType,
        preferensi_bahasa: language,
        organisasi: userType !== 'individu' ? {
          nama_organisasi: orgName.trim(),
          jenis: userType === 'kelompok_sipil' ? 'lsm' : 'badan_hukum_privat',
          pic_nama: picName.trim() || 'PIC Organisasi',
          pic_kontak: picContact.trim() || '-',
        } : null,
        privacy_policy_accepted_at: now,
        created_at: now,
      };

      onAuthenticate(newUser);
      onClose();
    } catch (err: any) {
      console.error('Authentication error:', err);
      setErrorMsg('Gagal menginisialisasi sesi otentikasi aman: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white border border-stone-300 rounded-lg max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-500 hover:text-stone-800 p-1.5 rounded-md hover:bg-stone-100"
          aria-label="Tutup Formulir"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 border-b border-stone-200 pb-3 mb-5">
          <div className="w-9 h-9 rounded bg-[#881337] text-white flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Pilihan Masuk & Privasi Pemohon
            </h3>
            <p className="text-xs text-stone-600">
              Pilih mode identitas sesuai kenyamanan dan kebutuhan hukum Anda
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded text-rose-900 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleComplete} className="space-y-5">
          {/* Auth Mode Tabs */}
          <div>
            <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              Mode Identitas:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setAuthMode('anonim_pseudonim'); setErrorMsg(null); }}
                className={`p-3 rounded-md border text-left transition flex flex-col justify-between ${
                  authMode === 'anonim_pseudonim'
                    ? 'border-[#881337] bg-rose-50/70 text-stone-900 font-semibold ring-1 ring-[#881337]'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-700" />
                    <span className="text-sm">Mode Anonim</span>
                  </div>
                  {authMode === 'anonim_pseudonim' && <Check className="w-4 h-4 text-[#881337]" />}
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  Tanpa email / nama. Sesi memakai token acak terenkripsi (Disarankan untuk warga rentan).
                </p>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('email'); setErrorMsg(null); }}
                className={`p-3 rounded-md border text-left transition flex flex-col justify-between ${
                  authMode === 'email'
                    ? 'border-[#881337] bg-rose-50/70 text-stone-900 font-semibold ring-1 ring-[#881337]'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-stone-700" />
                    <span className="text-sm">Akun Email</span>
                  </div>
                  {authMode === 'email' && <Check className="w-4 h-4 text-[#881337]" />}
                </div>
                <p className="text-[11px] text-stone-600 mt-1">
                  Simpan riwayat kasus terhubung dengan email Anda.
                </p>
              </button>
            </div>
          </div>

          {/* Email Input (If Email mode) */}
          {authMode === 'email' && (
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-stone-800 mb-1">
                Alamat Email:
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                required
                className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>
          )}

          {/* User Type Selection (Constitutional Requirement for Legal Standing) */}
          <div>
            <label htmlFor="user-type" className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
              Kategori Pemohon (Syarat Legal Standing Pasal 51 UU MK):
            </label>
            <select
              id="user-type"
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType)}
              className="w-full px-3 py-2 border border-stone-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
            >
              <option value="individu">Perorangan Warga Negara Indonesia (WNI)</option>
              <option value="kelompok_sipil">Kesatuan Masyarakat Hukum Adat / LSM / Organisasi Masyarakat</option>
              <option value="badan_hukum">Badan Hukum Publik atau Privat (Yayasan, Koperasi, PT)</option>
            </select>
          </div>

          {/* Organization details if not individual */}
          {userType !== 'individu' && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Nama Organisasi / Komunitas Adat / Lembaga:
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Contoh: Aliansi Masyarakat Adat X / Yayasan Y"
                  required
                  className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nama Penanggung Jawab (PIC):
                  </label>
                  <input
                    type="text"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    placeholder="Nama lengkap PIC"
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Kontak PIC:
                  </label>
                  <input
                    type="text"
                    value={picContact}
                    onChange={(e) => setPicContact(e.target.value)}
                    placeholder="Nomor telepon / kontak"
                    className="w-full px-2.5 py-1.5 border border-stone-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Language Preference */}
          <div>
            <label htmlFor="language" className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1">
              Preferensi Bahasa Konsultasi AI:
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguagePreference)}
              className="w-full px-3 py-2 border border-stone-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
            >
              <option value="id">Bahasa Indonesia (Utama)</option>
              <option value="jv">Basa Jawa (Diterjemahkan otomatis ke format formal)</option>
              <option value="su">Basa Sunda (Diterjemahkan otomatis ke format formal)</option>
            </select>
            <p className="text-[11px] text-stone-500 mt-1">
              Dokumen permohonan resmi akan tetap dicetak dalam Bahasa Indonesia formal sesuai Peraturan MK.
            </p>
          </div>

          {/* One-time Privacy Policy Agreement */}
          <div className="pt-3 border-t border-stone-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-[#881337] focus:ring-rose-800 border-stone-300"
              />
              <span className="text-xs text-stone-800 leading-relaxed">
                Saya telah membaca dan menyetujui <span className="font-semibold text-rose-900">Kebijakan Privasi & Perlindungan Data</span> (UU PDP No. 27/2022). Saya memahami bahwa data sensitif kasus tidak dijual, dilindungi enkripsi, dan saya berhak menghapus data kapan saja.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 rounded text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#881337] hover:bg-[#70102e] text-white px-5 py-2 rounded text-sm font-semibold transition shadow-xs border border-rose-900 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{authMode === 'anonim_pseudonim' ? 'Lanjutkan Sebagai Anonim' : 'Masuk / Daftar Akun'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
