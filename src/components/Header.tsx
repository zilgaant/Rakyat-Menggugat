/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scale, Shield, User, Lock, BookOpen, FolderArchive, Settings, LogOut, Database } from 'lucide-react';
import { UserProfile, LanguagePreference } from '../types';

interface HeaderProps {
  currentScreen: 'home' | 'cases' | 'chat' | 'assessment' | 'evidence' | 'document' | 'privacy' | 'knowledge';
  setCurrentScreen: (screen: 'home' | 'cases' | 'chat' | 'assessment' | 'evidence' | 'document' | 'privacy' | 'knowledge') => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onLanguageChange: (lang: LanguagePreference) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setCurrentScreen,
  currentUser,
  onOpenAuth,
  onLogout,
  onLanguageChange,
}) => {
  return (
    <header className="border-b border-stone-200 bg-[#FAF9F5] sticky top-0 z-40">
      {/* Top Civic Status Strip */}
      <div className="bg-[#881337] text-stone-100 text-xs py-1.5 px-4 sm:px-6 flex justify-between items-center tracking-wide font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
          <span>Platform Bantuan Advokasi Publik — Akses Keadilan Konstitusional</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-rose-200">Non-Profit & Independen</span>
          <div className="flex items-center gap-1.5 bg-[#4C0519] px-2 py-0.5 rounded border border-rose-800">
            <span className="text-[11px] text-rose-200">Bahasa:</span>
            <select
              value={currentUser?.preferensi_bahasa || 'id'}
              onChange={(e) => onLanguageChange(e.target.value as LanguagePreference)}
              className="bg-transparent text-xs text-stone-100 font-semibold focus:outline-none cursor-pointer"
              aria-label="Pilih Preferensi Bahasa"
            >
              <option value="id" className="bg-[#4C0519] text-stone-100">Indonesia</option>
              <option value="jv" className="bg-[#4C0519] text-stone-100">Jawa</option>
              <option value="su" className="bg-[#4C0519] text-stone-100">Sunda</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Identity / Wordmark */}
          <button
            onClick={() => setCurrentScreen('home')}
            className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-800 rounded p-1"
          >
            <div className="w-10 h-10 rounded bg-[#881337] text-amber-200 flex items-center justify-center border border-[#9F1239] shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
                Rakyat Menggugat
              </div>
              <p className="text-xs text-stone-600 font-sans">
                Pengujian Konstitusional MK & Uji Materiil MA
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentScreen('home')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentScreen === 'home'
                  ? 'bg-stone-200/80 text-stone-900 font-semibold'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-stone-600" />
              Edukasi
            </button>

            {currentUser && (
              <button
                onClick={() => setCurrentScreen('cases')}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentScreen === 'cases' || currentScreen === 'chat' || currentScreen === 'assessment' || currentScreen === 'evidence' || currentScreen === 'document'
                    ? 'bg-stone-200/80 text-stone-900 font-semibold'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <FolderArchive className="w-4 h-4 text-stone-600" />
                Kasus Saya
              </button>
            )}

            <button
              onClick={() => setCurrentScreen('knowledge')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentScreen === 'knowledge'
                  ? 'bg-stone-200/80 text-stone-900 font-semibold'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Database className="w-4 h-4 text-stone-600" />
              Basis Hukum
            </button>

            <button
              onClick={() => setCurrentScreen('privacy')}
              className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentScreen === 'privacy'
                  ? 'bg-stone-200/80 text-stone-900 font-semibold'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Shield className="w-4 h-4 text-stone-600" />
              Privasi
            </button>
          </nav>

          {/* Auth & Session Controls */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <div className="text-xs font-semibold text-stone-900 flex items-center justify-end gap-1">
                    {currentUser.auth_mode === 'anonim_pseudonim' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded text-[11px] font-medium border border-emerald-300">
                        <Lock className="w-3 h-3" />
                        Anonim
                      </span>
                    ) : (
                      <span className="text-stone-800 truncate max-w-[140px]">{currentUser.email}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-600 capitalize">
                    {currentUser.tipe_pengguna === 'individu' ? 'Perorangan' : currentUser.tipe_pengguna === 'kelompok_sipil' ? 'Masyarakat Sipil' : 'Badan Hukum'}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentScreen('privacy')}
                  className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-md border border-stone-300"
                  title="Privasi"
                  aria-label="Privasi"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <button
                  onClick={onLogout}
                  className="p-2 text-stone-700 hover:text-rose-900 hover:bg-rose-50 rounded-md border border-stone-300"
                  title="Keluar Sesi"
                  aria-label="Keluar Sesi"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-[#881337] hover:bg-[#70102e] text-stone-50 px-4 py-2 rounded-md text-sm font-medium transition shadow-xs flex items-center gap-2 border border-rose-900"
              >
                <User className="w-4 h-4" />
                <span>Masuk / Anonim</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="flex md:hidden border-t border-stone-200 px-4 py-2 gap-2 bg-stone-100 overflow-x-auto text-xs">
        <button
          onClick={() => setCurrentScreen('home')}
          className={`px-3 py-1.5 rounded whitespace-nowrap font-medium ${
            currentScreen === 'home' ? 'bg-[#881337] text-white' : 'text-stone-800 bg-white border border-stone-300'
          }`}
        >
          Edukasi
        </button>
        {currentUser && (
          <button
            onClick={() => setCurrentScreen('cases')}
            className={`px-3 py-1.5 rounded whitespace-nowrap font-medium ${
              currentScreen === 'cases' ? 'bg-[#881337] text-white' : 'text-stone-800 bg-white border border-stone-300'
            }`}
          >
            Kasus Saya
          </button>
        )}
        <button
          onClick={() => setCurrentScreen('knowledge')}
          className={`px-3 py-1.5 rounded whitespace-nowrap font-medium ${
            currentScreen === 'knowledge' ? 'bg-[#881337] text-white' : 'text-stone-800 bg-white border border-stone-300'
          }`}
        >
          Basis Hukum
        </button>
        <button
          onClick={() => setCurrentScreen('privacy')}
          className={`px-3 py-1.5 rounded whitespace-nowrap font-medium ${
            currentScreen === 'privacy' ? 'bg-[#881337] text-white' : 'text-stone-800 bg-white border border-stone-300'
          }`}
        >
          Privasi
        </button>
      </div>
    </header>
  );
};
