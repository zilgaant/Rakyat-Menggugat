/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Scale, ShieldAlert, Sparkles, User, Bot, HelpCircle, CheckCircle, ArrowRight, CornerDownLeft, AlertCircle } from 'lucide-react';
import { CaseRecord, CaseMessage, UserProfile, LanguagePreference } from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface CaseIntakeChatProps {
  activeCase: CaseRecord;
  currentUser: UserProfile;
  messages: CaseMessage[];
  onSendMessage: (text: string) => void;
  onRunAssessment: () => void;
  isAssessing: boolean;
  onAcceptCaseDisclaimer: () => void;
}

export const CaseIntakeChat: React.FC<CaseIntakeChatProps> = ({
  activeCase,
  currentUser,
  messages,
  onSendMessage,
  onRunAssessment,
  isAssessing,
  onAcceptCaseDisclaimer,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAssessing) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Check if case disclaimer is accepted
  const hasAcceptedDisclaimer = !!activeCase.ai_disclaimer_accepted_at;

  const quickPromptsByLang: Record<LanguagePreference, string[]> = {
    id: [
      'Saya merasa pasal dalam UU Ketenagakerjaan merugikan hak pesangon saya.',
      'Peraturan Daerah di kota saya melarang pedagang kecil tanpa dasar hukum yang adil.',
      'Hutan adat masyarakat kami dialihkan sepihak menjadi konsesi tambang.',
    ],
    jv: [
      'Kula rumaos hak buruh kula dipun rugikaken kaliyan aturan Undang-Undang enggal.',
      'Tanah adat desa kula dipun pendhet kagem tambang tanpa pirembagan ingkang cetha.',
    ],
    su: [
      'Sim kuring ngaraos hak salaku warga nagara kaganggu ku ayana pasal dina Undang-Undang ieu.',
      'Lahan adat lembur sim kuring diaku ku pihak swasta dumasar aturan anu teu adil.',
    ],
  };

  const activeQuickPrompts = quickPromptsByLang[activeCase.bahasa_input || 'id'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Main Chat Column */}
      <div className="lg:col-span-8 bg-white border border-stone-200 rounded-lg shadow-xs flex flex-col h-[78vh] overflow-hidden">
        {/* Chat Header */}
        <div className="bg-stone-50 border-b border-stone-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#881337] text-white flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                Intake & Klarifikasi Fakta Perkara
              </h2>
              <p className="text-xs text-stone-600">
                Agen 1: Menelaah fakta masalah dalam {activeCase.bahasa_input === 'id' ? 'Bahasa Indonesia' : activeCase.bahasa_input === 'jv' ? 'Basa Jawa' : 'Basa Sunda'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-stone-200 text-stone-800 px-2 py-1 rounded font-mono font-medium">
              Kasus: {activeCase.id.substring(0, 8)}...
            </span>
          </div>
        </div>

        {/* Disclaimer Check Gate if not yet accepted for this case */}
        {!hasAcceptedDisclaimer ? (
          <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-center max-w-lg mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Persetujuan Khusus Sesi Perkara Baru
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed">
                Sebelum memulai percakapan klarifikasi hukum, harap konfirmasi bahwa Anda memahami sistem ini bertindak sebagai alat bantu penyusunan mandiri (bukan penasihat advokat hukum resmi).
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200 p-4 rounded text-left text-xs text-stone-700 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#881337] shrink-0 mt-0.5" />
                <span>Dokumen ini disusun untuk pengujian konstitusional/uji materiil mandiri.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#881337] shrink-0 mt-0.5" />
                <span>AI akan memetakan fakta ke dalam 4 lapis kelayakan MK/MA.</span>
              </div>
            </div>

            <button
              onClick={onAcceptCaseDisclaimer}
              className="bg-[#881337] hover:bg-[#70102e] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition shadow-xs border border-rose-900"
            >
              Saya Mengerti & Mulai Konsultasi Kasus
            </button>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-50/50">
              <DisclaimerBanner compact />

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#881337] text-white flex items-center justify-center shrink-0 mt-1 font-serif text-xs">
                      RM
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-stone-900 text-stone-50 rounded-br-none'
                        : 'bg-white border border-stone-200 text-stone-900 shadow-2xs rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.content_translated && (
                      <div className="mt-2 pt-2 border-t border-stone-200 text-[11px] text-stone-600 italic">
                        <span className="font-semibold not-italic">Terjemahan Formal:</span> {msg.content_translated}
                      </div>
                    )}
                    <span className={`block text-[10px] mt-1.5 ${
                      msg.role === 'user' ? 'text-stone-400 text-right' : 'text-stone-500'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-stone-700 text-stone-100 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isAssessing && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-xs text-rose-950 flex items-center gap-3 animate-pulse">
                  <div className="w-5 h-5 border-2 border-[#881337] border-t-transparent rounded-full animate-spin shrink-0" />
                  <div>
                    <strong className="font-semibold block text-sm">Menjalankan Dual-Agent Analysis...</strong>
                    Agent 2 (Analisis Hukum) & Agent 3 (Verifikator Independen) sedang mengevaluasi 4 lapis kelayakan secara paralel.
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 bg-stone-100 border-t border-stone-200 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="font-semibold text-stone-600 shrink-0">Contoh Isu:</span>
                {activeQuickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="bg-white hover:bg-stone-200 text-stone-800 px-3 py-1 rounded border border-stone-300 shrink-0 text-left truncate max-w-xs transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ceritakan permasalahan hukum atau pasal yang merugikan Anda..."
                disabled={isAssessing}
                className="flex-1 px-3.5 py-2.5 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-800 bg-stone-50 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isAssessing}
                className="bg-[#881337] hover:bg-[#70102e] disabled:opacity-50 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition flex items-center gap-1.5 shrink-0"
              >
                <span>Kirim</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        )}
      </div>

      {/* Structured Legal Fact Sheet Sidebar */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
            <h3 className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-rose-900" />
              <span>Struktur Fakta Perkara</span>
            </h3>
            <span className="text-[11px] bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-semibold uppercase">
              {currentUser.tipe_pengguna}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-semibold text-stone-700 block">Objek yang Dikeluhkan:</span>
              <p className="text-stone-900 bg-stone-50 p-2 rounded border border-stone-200 mt-0.5">
                {activeCase.ringkasan_masalah_asli ? activeCase.ringkasan_masalah_asli.substring(0, 100) + '...' : 'Belum teridentifikasi.'}
              </p>
            </div>

            <div>
              <span className="font-semibold text-stone-700 block">Status Pemohon:</span>
              <p className="text-stone-800 mt-0.5">
                {currentUser.tipe_pengguna === 'individu' ? 'Perorangan WNI (Hak Konstitusional Individu)' : currentUser.tipe_pengguna === 'kelompok_sipil' ? 'Masyarakat Adat / Kelompok Sipil' : 'Badan Hukum'}
              </p>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <span className="font-semibold text-stone-700 block mb-1">Kesiapan Asesmen Dual-Agent:</span>
              <div className="space-y-1.5 text-stone-600 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Agent 1 (Intake & Normalisasi Fakta)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Agent 2 (Analisis Hukum RAG)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Agent 3 (Verifikator Independen Skeptis)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Reconciliation Layer (Deterministik)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onRunAssessment}
            disabled={messages.length < 2 || isAssessing}
            className="w-full bg-[#881337] hover:bg-[#70102e] disabled:opacity-50 text-white py-2.5 px-4 rounded-md text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs border border-rose-900"
          >
            <Scale className="w-4 h-4 text-amber-200" />
            <span>Lakukan Asesmen Kelayakan Dual-Agent</span>
          </button>
        </div>

        {/* Guidance Tip Card */}
        <div className="bg-stone-100 border border-stone-300 rounded-lg p-4 text-xs text-stone-700 space-y-2">
          <div className="font-bold text-stone-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-rose-900" />
            <span>Tips Menjelaskan Masalah:</span>
          </div>
          <p className="leading-relaxed">
            Sebutkan apa nama peraturan atau kebijakan yang Anda persoalkan, kerugian nyata atau potensi kerugian yang Anda alami, dan apa yang Anda harapkan dibatalkan/diubah oleh pengadilan.
          </p>
        </div>
      </div>
    </div>
  );
};
