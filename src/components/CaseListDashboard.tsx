/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FolderArchive, Plus, ArrowRight, Clock, FileCheck, AlertCircle, FileText, Scale, ShieldCheck, Settings } from 'lucide-react';
import { CaseRecord, UserProfile } from '../types';

interface CaseListDashboardProps {
  cases: CaseRecord[];
  currentUser: UserProfile;
  onSelectCase: (caseItem: CaseRecord) => void;
  onStartNewCase: () => void;
  onDeleteCase: (caseId: string) => void;
  onOpenPrivacy?: () => void;
}

export const CaseListDashboard: React.FC<CaseListDashboardProps> = ({
  cases,
  currentUser,
  onSelectCase,
  onStartNewCase,
  onDeleteCase,
  onOpenPrivacy,
}) => {
  const getStatusBadge = (status: CaseRecord['status']) => {
    switch (status) {
      case 'document_generated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <FileCheck className="w-3 h-3" />
            Dokumen Siap Cetak
          </span>
        );
      case 'assessed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            <Scale className="w-3 h-3" />
            Telah Dinilai Dual-Agent
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3" />
            Draf Percakapan
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-900 uppercase tracking-wider">
            <FolderArchive className="w-4 h-4" />
            <span>Dasbor Perkara Pemohon</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Daftar Kasus & Permohonan Saya
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            {currentUser.auth_mode === 'anonim_pseudonim' 
              ? `Tersimpan dalam sesi anonim (${currentUser.pseudonim_token})` 
              : `Terhubung dengan akun: ${currentUser.email}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenPrivacy && (
            <button
              onClick={onOpenPrivacy}
              className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-4 py-2.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 shrink-0"
              title="Kelola Privasi & Penghapusan Data"
            >
              <Settings className="w-4 h-4 text-stone-600" />
              <span>Pengaturan & Privasi (Layar 9)</span>
            </button>
          )}

          <button
            onClick={onStartNewCase}
            className="bg-[#881337] hover:bg-[#70102e] text-white px-5 py-2.5 rounded-md text-sm font-semibold transition flex items-center justify-center gap-2 shadow-xs border border-rose-900 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Konsultasi Kasus Baru</span>
          </button>
        </div>
      </div>

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-stone-300 rounded-lg p-10 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto">
            <FolderArchive className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-stone-900 text-lg">Belum Ada Kasus Terdaftar</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Anda belum membuat permohonan atau penilaian kasus. Mulai dengan menceritakan masalah hukum atau norma UU yang merugikan Anda.
            </p>
          </div>
          <button
            onClick={onStartNewCase}
            className="bg-[#881337] hover:bg-[#70102e] text-white px-5 py-2 rounded text-sm font-medium transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Penilaian Kasus Pertama</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
            Total {cases.length} Perkara Tercatat:
          </div>

          <div className="grid grid-cols-1 gap-4">
            {cases.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-stone-200 hover:border-stone-400 rounded-lg p-5 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(item.status)}
                    <span className="text-[11px] text-stone-500 font-mono">
                      ID: {item.id}
                    </span>
                    <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                      Bahasa: {item.bahasa_input.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-stone-900 truncate">
                    {item.judul_singkat || 'Draf Permohonan Tanpa Judul'}
                  </h3>

                  <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed">
                    {item.ringkasan_masalah_asli || 'Belum ada ringkasan materi perkara.'}
                  </p>

                  <div className="text-[11px] text-stone-500 flex items-center gap-4">
                    <span>Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    <span>Diperbarui: {new Date(item.updated_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onSelectCase(item)}
                    className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <span>Buka Berkas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Hapus draf kasus ini secara permanen dari penyimpanan Anda?')) {
                        onDeleteCase(item.id);
                      }
                    }}
                    className="text-stone-500 hover:text-rose-700 p-2 rounded hover:bg-rose-50 text-xs transition"
                    title="Hapus Kasus"
                    aria-label="Hapus Kasus"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
