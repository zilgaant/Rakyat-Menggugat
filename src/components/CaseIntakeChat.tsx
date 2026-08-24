/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Scale, ShieldAlert, User, CheckCircle, ArrowRight } from 'lucide-react';
import { CaseRecord, CaseMessage, UserProfile, LanguagePreference } from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface CaseIntakeChatProps {
  activeCase: CaseRecord;
  currentUser: UserProfile;
  messages: CaseMessage[];
  onSendMessage: (text: string) => void;
  onRunAssessment: () => void;
  isAssessing: boolean;
  isAgentTyping?: boolean;
  onAcceptCaseDisclaimer: () => void;
}

export const CaseIntakeChat: React.FC<CaseIntakeChatProps> = ({
  activeCase,
  currentUser,
  messages,
  onSendMessage,
  onRunAssessment,
  isAssessing,
  isAgentTyping = false,
  onAcceptCaseDisclaimer,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAgentTyping, isAssessing]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAssessing || isAgentTyping) return;
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Clean Single-View Chat Interface */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col h-[78vh] overflow-hidden">
        {/* Chat Header */}
        <div className="bg-stone-50 border-b border-stone-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#881337] text-white flex items-center justify-center font-bold shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                Ceritakan masalah anda
              </h2>
              <p className="text-xs text-stone-600">
                Agen 1: Menelaah fakta masalah dalam {activeCase.bahasa_input === 'id' ? 'Bahasa Indonesia' : activeCase.bahasa_input === 'jv' ? 'Basa Jawa' : 'Basa Sunda'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-stone-200 text-stone-800 px-2.5 py-1 rounded-md font-mono font-medium">
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

            <div className="bg-stone-50 border border-stone-200 p-4 rounded-lg text-left text-xs text-stone-700 space-y-2">
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
              className="bg-[#881337] hover:bg-[#70102e] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition shadow-xs border border-rose-900 cursor-pointer"
            >
              Saya Mengerti & Mulai Konsultasi Kasus
            </button>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50">
              <DisclaimerBanner compact />

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#881337] text-white flex items-center justify-center shrink-0 mt-1 font-serif text-xs font-bold">
                      RM
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-stone-900 text-stone-50 rounded-br-none shadow-xs'
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

              {/* Animated 3-Dots Typing Indicator for Agent 1 */}
              {isAgentTyping && (
                <div className="flex gap-3 justify-start items-center animate-in fade-in duration-200">
                  <div className="w-8 h-8 rounded-full bg-[#881337] text-white flex items-center justify-center shrink-0 font-serif text-xs font-bold">
                    RM
                  </div>
                  <div className="bg-white border border-stone-200 text-stone-900 rounded-2xl rounded-bl-none px-4 py-3 shadow-2xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#881337] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#881337] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 rounded-full bg-[#881337] animate-bounce"></span>
                    <span className="text-xs text-stone-500 ml-2 font-medium">Agen 1 sedang menulis balasan...</span>
                  </div>
                </div>
              )}

              {/* Guided Action Card: Explicit Structured Fact Confirmation & "Lakukan Uji Kelayakan" */}
              {messages.length >= 2 && !isAssessing && !isAgentTyping && (
                <div className="my-3 p-4 sm:p-5 bg-stone-50 border border-stone-300 rounded-xl shadow-xs space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#881337] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Scale className="w-5 h-5 text-amber-200" />
                    </div>
                    <div className="flex-1 text-xs sm:text-sm">
                      <p className="font-bold text-stone-900 font-serif">Konfirmasi Struktur Fakta Perkara</p>
                      <p className="text-stone-600 text-xs mt-0.5 leading-relaxed">
                        Agen 1 telah merangkum pokok keluhan Anda. Harap periksa apakah butir fakta di bawah telah merefleksikan persoalan yang sebenarnya sebelum diteruskan ke Agen 2 dan Agen 3:
                      </p>
                    </div>
                  </div>

                  {/* Fact Summary Preview */}
                  <div className="p-3.5 bg-white border border-stone-200 rounded-lg text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-stone-900 shrink-0 w-28">Pokok Keluhan:</span>
                      <span className="text-stone-700">{activeCase.judul_singkat || 'Pengujian norma/peraturan hukum'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-stone-900 shrink-0 w-28">Naskah Fakta Terkini:</span>
                      <span className="text-stone-700 italic line-clamp-3">
                        "{messages.filter(m => m.role === 'user').slice(-1)[0]?.content || activeCase.ringkasan_masalah_asli}"
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>✓ Belum sesuai? Ketik koreksi pada kolom chat di bawah.</span>
                      <span className="font-medium text-amber-900">Sudah tepat? Lanjutkan pengujian →</span>
                    </div>
                  </div>

                  <button
                    onClick={onRunAssessment}
                    className="w-full bg-[#881337] hover:bg-[#70102e] active:scale-[0.99] text-white py-3 px-5 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm border border-rose-900 cursor-pointer"
                  >
                    <Scale className="w-4 h-4 text-amber-200" />
                    <span>Konfirmasi Fakta & Lakukan Uji Kelayakan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isAssessing && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-950 flex items-center gap-3 animate-pulse shadow-xs">
                  <div className="w-5 h-5 border-2 border-[#881337] border-t-transparent rounded-full animate-spin shrink-0" />
                  <div>
                    <strong className="font-semibold block text-sm">Menjalankan Dual-Agent Analysis...</strong>
                    Agent 2 (Analisis Hukum) & Agent 3 (Verifikator Independen) sedang mengevaluasi 4 lapis kelayakan secara paralel.
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts for initial guidance */}
            {messages.length <= 2 && !isAgentTyping && (
              <div className="px-4 py-2.5 bg-stone-100 border-t border-stone-200 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="font-semibold text-stone-600 shrink-0">Contoh Isu:</span>
                {activeQuickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="bg-white hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-md border border-stone-300 shrink-0 text-left truncate max-w-xs transition cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3.5 bg-white border-t border-stone-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ceritakan permasalahan hukum atau pasal yang merugikan Anda..."
                disabled={isAssessing || isAgentTyping}
                className="flex-1 px-4 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-800 bg-stone-50 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isAssessing || isAgentTyping}
                className="bg-[#881337] hover:bg-[#70102e] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Kirim</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
