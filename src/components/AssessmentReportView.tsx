/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, ArrowRight, BookOpen, FileText, HelpCircle, RefreshCw, PlusCircle, Briefcase, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { DualAgentAssessment, CaseRecord, AssessmentLayer, LayerStatus } from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface AssessmentReportViewProps {
  assessment: DualAgentAssessment;
  activeCase: CaseRecord;
  onProceedToEvidence: () => void;
  onBackToChat: () => void;
  onRetryAndStartNewCase?: () => void;
}

export const AssessmentReportView: React.FC<AssessmentReportViewProps> = ({
  assessment,
  activeCase,
  onProceedToEvidence,
  onBackToChat,
  onRetryAndStartNewCase,
}) => {
  const [isEvaluationDetailOpen, setIsEvaluationDetailOpen] = useState(false);

  const handleProceedToEvidence = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onProceedToEvidence();
  };

  const getStatusIcon = (status: LayerStatus) => {
    switch (status) {
      case 'lolos':
        return <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />;
      case 'perlu_perbaikan':
      case 'perlu_data_tambahan':
        return <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />;
      case 'gagal_total':
        return <XCircle className="w-5 h-5 text-rose-700 shrink-0" />;
      default:
        return <span className="w-5 h-5 rounded-full bg-stone-300 inline-block shrink-0" />;
    }
  };

  const getStatusLabel = (status: LayerStatus) => {
    switch (status) {
      case 'lolos':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded text-xs font-semibold">Lolos</span>;
      case 'perlu_perbaikan':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-xs font-semibold">Perlu Penguatan</span>;
      case 'perlu_data_tambahan':
        return <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-xs font-semibold">Perlu Data Tambahan</span>;
      case 'gagal_total':
        return <span className="bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded text-xs font-semibold">Tidak Memenuhi Syarat</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded text-xs">Belum Dievaluasi</span>;
    }
  };

  const getConfidenceBadge = (confidence: DualAgentAssessment['confidence_level']) => {
    switch (confidence) {
      case 'tinggi':
        return <span className="bg-emerald-800 text-stone-50 px-2.5 py-1 rounded text-xs font-semibold">Tingkat Keyakinan: Tinggi</span>;
      case 'sedang':
        return <span className="bg-amber-700 text-stone-50 px-2.5 py-1 rounded text-xs font-semibold">Tingkat Keyakinan: Sedang</span>;
      case 'rendah':
      default:
        return <span className="bg-rose-800 text-stone-50 px-2.5 py-1 rounded text-xs font-semibold">Tingkat Keyakinan: Rendah</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Result Card */}
      <div className="bg-white border-2 border-stone-300 rounded-lg p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-900 uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Hasil Asesmen Rekonsiliasi Dual-Agent</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Laporan Kelayakan Permohonan
            </h1>
            <p className="text-xs text-stone-600 font-mono mt-0.5">
              Kasus #{activeCase.id.substring(0, 10)} | Evaluasi 4 Lapis Berurutan
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
            {getConfidenceBadge(assessment.confidence_level)}
            <div className="text-[11px] text-stone-600">
              {assessment.agent_agreement ? (
                <span className="text-emerald-800 font-medium">✓ Agent 2 & Agent 3 Sepakat</span>
              ) : (
                <span className="text-amber-800 font-medium">⚠ Perlu Konsultasi Manusia</span>
              )}
            </div>
          </div>
        </div>

        {/* Status Evaluasi Kelayakan */}
        <div className="pt-1">
          {assessment.hasil_akhir === 'layak' ? (
            <div className="flex items-center gap-2 text-emerald-800 font-serif font-bold text-lg sm:text-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>Permohonan Memenuhi Syarat</span>
            </div>
          ) : assessment.hasil_akhir === 'perlu_data_tambahan' ? (
            <div className="flex items-center gap-2 text-amber-800 font-serif font-bold text-lg sm:text-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Butuh Bukti Lebih untuk Permohonan Ini</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#881337] font-serif font-bold text-lg sm:text-xl">
              <XCircle className="w-5 h-5 text-[#881337] shrink-0" />
              <span>Maaf, Permohonan Tidak Memenuhi Syarat</span>
            </div>
          )}
        </div>

        {/* User Summary Box */}
        <div className="p-4 bg-stone-50 rounded-md border border-stone-200 space-y-2">
          <h3 className="font-serif font-bold text-sm text-stone-900">
            Ringkasan Eksekutif untuk Pemohon:
          </h3>
          <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
            {assessment.ringkasan_untuk_user}
          </p>
        </div>

        {/* Action Button Directly Under Executive Summary Box (for 'layak' and 'perlu_data_tambahan') */}
        {assessment.hasil_akhir !== 'tidak_layak' && (
          <div className="pt-1">
            <button
              onClick={handleProceedToEvidence}
              className="w-full sm:w-auto bg-[#881337] hover:bg-[#70102e] text-white px-6 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-xs border border-rose-900 cursor-pointer"
            >
              <span>Lengkapi Bukti</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Buttons Under Executive Summary Box if Hard-Rejected ('tidak_layak') */}
        {assessment.hasil_akhir === 'tidak_layak' && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              onClick={onRetryAndStartNewCase}
              className="flex-1 bg-[#881337] hover:bg-[#70102e] text-white px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 shadow-xs border border-rose-900 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-200" />
              <span>Coba lagi</span>
            </button>

            <button
              disabled
              className="flex-1 bg-stone-100 text-stone-400 border border-stone-300 px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-80"
              title="Fitur Bursa Lawyer akan segera hadir untuk menghubungkan Anda dengan advokat berlisensi."
            >
              <Briefcase className="w-4 h-4 text-stone-400" />
              <span>Kontak Pengacara</span>
              <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-normal">Bursa Lawyer</span>
            </button>
          </div>
        )}

        {/* Advisory Banner if Need Additional Data */}
        {assessment.hasil_akhir === 'perlu_data_tambahan' && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-md text-xs text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-900 block">Catatan Kelengkapan Alat Bukti & Posita:</strong>
              <p className="mt-0.5 text-amber-900">
                Permohonan Anda tidak mengalami penolakan yurisdiksi absolut, namun disarankan melengkapi uraian kerugian konstitusional konkret atau alat bukti penguat pada panduan bukti agar kedudukan hukum (legal standing) kokoh saat registrasi di Mahkamah Konstitusi.
              </p>
            </div>
          </div>
        )}

        {assessment.catatan_ambiguitas && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950 space-y-1">
            <strong className="font-semibold text-amber-900 block">Catatan Ambiguitas dari Verifikator Independen (Agent 3):</strong>
            <p>{assessment.catatan_ambiguitas}</p>
          </div>
        )}
      </div>

      <DisclaimerBanner />

      {/* 4-Layer Breakdown (Collapsible Accordion: Collapsed by Default) */}
      <div className="border border-stone-300 bg-white rounded-lg overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsEvaluationDetailOpen(!isEvaluationDetailOpen)}
          className="w-full px-5 py-4 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-stone-700 shrink-0" />
            <div>
              <span className="font-serif font-bold text-sm sm:text-base text-stone-900 block">
                Lihat Detail Evaluasi Hukum (untuk Lawyer/Pendamping)
              </span>
              <span className="text-xs text-stone-600 block mt-0.5">
                Rincian 4 Lapis: Kewenangan MK, Legal Standing, Batu Uji & Ne Bis In Idem, Posita
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium shrink-0 ml-3">
            <span>{isEvaluationDetailOpen ? 'Tutup Detail' : 'Buka Detail'}</span>
            {isEvaluationDetailOpen ? (
              <ChevronUp className="w-4 h-4 text-stone-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-stone-600" />
            )}
          </div>
        </button>

        {isEvaluationDetailOpen && (
          <div className="p-5 sm:p-6 space-y-4 bg-white border-t border-stone-200">
            {assessment.layers.map((layer: AssessmentLayer) => (
              <div
                key={layer.lapis_ke}
                className={`bg-white border rounded-lg p-5 sm:p-6 space-y-3 transition shadow-xs ${
                  layer.status === 'lolos'
                    ? 'border-stone-200'
                    : layer.status === 'gagal_total'
                    ? 'border-rose-300 bg-rose-50/30'
                    : 'border-amber-300 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(layer.status)}
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-900">
                        Lapis {layer.lapis_ke}: {
                          layer.nama === 'kewenangan'
                            ? 'Kewenangan (Kompetensi Absolut MK vs MA)'
                            : layer.nama === 'legal_standing'
                            ? 'Kedudukan Hukum Pemohon (Legal Standing)'
                            : layer.nama === 'batu_uji'
                            ? 'Batu Uji Konstitusi & Uji Ne Bis In Idem'
                            : 'Alasan Permohonan (Posita)'
                        }
                      </h3>
                      {layer.jalur_hukum && (
                        <span className="text-xs text-stone-600">
                          Jalur yang Direkomendasikan: <strong>{layer.jalur_hukum}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {getStatusLabel(layer.status)}
                  </div>
                </div>

                {/* Explanation text */}
                <div className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                  <p>{layer.penjelasan}</p>
                </div>

                {/* Identified Arguments or Suggestions */}
                {layer.saran_perbaikan && (
                  <div className="p-3 bg-amber-50 border-l-3 border-amber-600 text-xs text-amber-950 rounded-r space-y-1">
                    <strong className="font-semibold text-amber-900 block">Saran Penguatan Posita:</strong>
                    <p>{layer.saran_perbaikan}</p>
                  </div>
                )}

                {/* Legal Citations Grounding */}
                {layer.rujukan && layer.rujukan.length > 0 && (
                  <div className="pt-2 border-t border-stone-100 space-y-1.5">
                    <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-rose-900" />
                      Rujukan Hukum Resmi:
                    </span>
                    <div className="space-y-1">
                      {layer.rujukan.map((ref, rIdx) => (
                        <div key={rIdx} className="bg-stone-50 p-2.5 rounded border border-stone-200 text-xs text-stone-800">
                          <span className="font-semibold text-stone-900 block">{ref.judul_dokumen || ref.knowledge_entry_id}:</span>
                          <blockquote className="italic text-stone-700 mt-0.5 pl-2 border-l-2 border-rose-900">
                            "{ref.kutipan_relevan}"
                          </blockquote>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
        <button
          onClick={onBackToChat}
          className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 rounded-md text-xs font-semibold text-stone-700 hover:bg-stone-100 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Klarifikasi / Lengkapi Fakta Kasus</span>
        </button>

        {assessment.hasil_akhir !== 'tidak_layak' ? (
          <button
            onClick={handleProceedToEvidence}
            className="w-full sm:w-auto bg-[#881337] hover:bg-[#70102e] text-white px-6 py-2.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs border border-rose-900 cursor-pointer"
          >
            <span>Lengkapi Bukti</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onRetryAndStartNewCase}
              className="w-full sm:w-auto bg-[#881337] hover:bg-[#70102e] text-white px-5 py-2.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs border border-rose-900 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-200" />
              <span>Coba lagi</span>
            </button>

            <button
              disabled
              className="w-full sm:w-auto bg-stone-100 text-stone-400 border border-stone-300 px-5 py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-80"
              title="Fitur Bursa Lawyer akan segera hadir untuk menghubungkan Anda dengan advokat berlisensi."
            >
              <Briefcase className="w-4 h-4 text-stone-400" />
              <span>Kontak Pengacara</span>
              <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-normal">Bursa Lawyer</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
