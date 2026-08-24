/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Scale, Shield, User, Lock, BookOpen, FolderArchive, Settings, LogOut, Database, Menu, X, Globe, ChevronRight, Briefcase } from 'lucide-react';
import { UserProfile, LanguagePreference } from '../types';

export type ScreenType = 'home' | 'cases' | 'chat' | 'assessment' | 'evidence' | 'document' | 'privacy' | 'knowledge' | 'lawyers';

interface HeaderProps {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNavClick = (screen: ScreenType) => {
    setCurrentScreen(screen);
    setIsSidebarOpen(false);
  };

  const currentLang = currentUser?.preferensi_bahasa || 'id';

  return (
    <>
      <header className="border-b border-stone-200 bg-[#FAF9F5] sticky top-0 z-40">
        {/* Top Civic Status Strip - Visible on desktop screens (lg+), hidden on tablet/mobile to prevent cramped header */}
        <div className="hidden lg:flex bg-[#881337] text-stone-100 text-xs py-1.5 px-4 sm:px-6 justify-between items-center tracking-wide font-medium">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="truncate">Platform Bantuan Advokasi Publik — Akses Keadilan Konstitusional</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-rose-200">Non-Profit & Independen</span>
            <div className="flex items-center gap-1.5 bg-[#4C0519] px-2 py-0.5 rounded border border-rose-800">
              <span className="text-[11px] text-rose-200">Bahasa:</span>
              <select
                value={currentLang}
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

        {/* Main Navigation Bar - Clean, spacious, and responsive */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 gap-4">
            {/* Brand Identity / Wordmark */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-800 rounded p-1 shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded bg-[#881337] text-amber-200 flex items-center justify-center border border-[#9F1239] shadow-xs shrink-0">
                <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-serif text-base sm:text-xl lg:text-2xl font-bold text-stone-900 tracking-tight whitespace-nowrap">
                  Rakyat Menggugat
                </div>
                <p className="hidden sm:block text-[11px] lg:text-xs text-stone-600 font-sans whitespace-nowrap">
                  Pengujian Konstitusional MK & Uji Materiil MA
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links (Visible on large screens) */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
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
                  onClick={() => handleNavClick('cases')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
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
                onClick={() => handleNavClick('knowledge')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  currentScreen === 'knowledge'
                    ? 'bg-stone-200/80 text-stone-900 font-semibold'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Database className="w-4 h-4 text-stone-600" />
                Basis Hukum
              </button>

              <button
                onClick={() => handleNavClick('lawyers')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  currentScreen === 'lawyers'
                    ? 'bg-stone-200/80 text-stone-900 font-semibold'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Briefcase className="w-4 h-4 text-stone-600" />
                Bursa Advokat
              </button>

              <button
                onClick={() => handleNavClick('privacy')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  currentScreen === 'privacy'
                    ? 'bg-stone-200/80 text-stone-900 font-semibold'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Shield className="w-4 h-4 text-stone-600" />
                Privasi
              </button>
            </nav>

            {/* Desktop Auth & Session Controls (Visible on large screens) */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col text-right">
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
                    onClick={() => handleNavClick('privacy')}
                    className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-md border border-stone-300 cursor-pointer"
                    title="Privasi & Pengaturan"
                    aria-label="Privasi"
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onLogout}
                    className="p-2 text-stone-700 hover:text-rose-900 hover:bg-rose-50 rounded-md border border-stone-300 cursor-pointer"
                    title="Keluar Sesi"
                    aria-label="Keluar Sesi"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="bg-[#881337] hover:bg-[#70102e] text-stone-50 px-4 py-2 rounded-md text-sm font-medium transition shadow-xs flex items-center gap-2 border border-rose-900 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Masuk / Anonim</span>
                </button>
              )}
            </div>

            {/* Tablet & Mobile Menu Trigger Button (Visible on < lg screens) */}
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              {currentUser?.auth_mode === 'anonim_pseudonim' && (
                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-300">
                  <Lock className="w-3 h-3" />
                  Anonim
                </span>
              )}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg text-stone-800 hover:text-stone-950 hover:bg-stone-100 border border-stone-300 transition cursor-pointer"
                aria-label="Buka Menu Navigasi"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Pullable / Sliding Mobile & Tablet Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sliding Drawer Container */}
          <div className="relative w-[82vw] max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 border-l border-stone-200 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#881337] text-amber-200 flex items-center justify-center border border-[#9F1239]">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-sm">Rakyat Menggugat</h3>
                  <p className="text-[10px] text-stone-500">Menu Akses Publik</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md transition cursor-pointer"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Account / Session Profile */}
            <div className="p-4 bg-stone-100/70 border-b border-stone-200">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Sesi Aktif</span>
                    {currentUser.auth_mode === 'anonim_pseudonim' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-300">
                        <Lock className="w-2.5 h-2.5" />
                        Mode Anonim
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-700 font-mono truncate max-w-[120px]">
                        {currentUser.email}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-medium text-stone-700 capitalize">
                      {currentUser.tipe_pengguna === 'individu' ? 'Perorangan' : currentUser.tipe_pengguna === 'kelompok_sipil' ? 'Masyarakat Sipil' : 'Badan Hukum'}
                    </span>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsSidebarOpen(false);
                      }}
                      className="text-xs text-rose-800 hover:text-rose-950 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full bg-[#881337] hover:bg-[#70102e] text-white py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Masuk / Mode Anonim</span>
                </button>
              )}
            </div>

            {/* Navigation Links in Sidebar */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <button
                onClick={() => handleNavClick('home')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  currentScreen === 'home'
                    ? 'bg-[#881337] text-white font-bold'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Edukasi</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {currentUser && (
                <button
                  onClick={() => handleNavClick('cases')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    currentScreen === 'cases' || currentScreen === 'chat' || currentScreen === 'assessment' || currentScreen === 'evidence' || currentScreen === 'document'
                      ? 'bg-[#881337] text-white font-bold'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FolderArchive className="w-4 h-4" />
                    <span>Kasus Saya</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              )}

              <button
                onClick={() => handleNavClick('knowledge')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  currentScreen === 'knowledge'
                    ? 'bg-[#881337] text-white font-bold'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4" />
                  <span>Basis Hukum</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => handleNavClick('lawyers')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  currentScreen === 'lawyers'
                    ? 'bg-[#881337] text-white font-bold'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4" />
                  <span>Bursa Advokat</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => handleNavClick('privacy')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  currentScreen === 'privacy'
                    ? 'bg-[#881337] text-white font-bold'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4" />
                  <span>Privasi</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Language Selection inside Sidebar */}
              <div className="pt-4 mt-4 border-t border-stone-200">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 uppercase tracking-wider px-2 mb-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Pilihan Bahasa</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 px-1">
                  <button
                    onClick={() => onLanguageChange('id')}
                    className={`py-1.5 px-2 rounded text-xs font-medium text-center border transition cursor-pointer ${
                      currentLang === 'id'
                        ? 'bg-rose-900 text-white border-rose-900 font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    Indonesia
                  </button>
                  <button
                    onClick={() => onLanguageChange('jv')}
                    className={`py-1.5 px-2 rounded text-xs font-medium text-center border transition cursor-pointer ${
                      currentLang === 'jv'
                        ? 'bg-rose-900 text-white border-rose-900 font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    Jawa
                  </button>
                  <button
                    onClick={() => onLanguageChange('su')}
                    className={`py-1.5 px-2 rounded text-xs font-medium text-center border transition cursor-pointer ${
                      currentLang === 'su'
                        ? 'bg-rose-900 text-white border-rose-900 font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    Sunda
                  </button>
                </div>
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-stone-200 bg-stone-50 text-[11px] text-stone-500 text-center">
              <p className="font-semibold text-stone-700">Non-Profit & Independen</p>
              <p className="text-[10px] mt-0.5">Platform Bantuan Advokasi Publik</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

