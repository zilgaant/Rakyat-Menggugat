/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Scale, ShieldAlert, User, CheckCircle, ArrowRight, Sparkles, HelpCircle, CheckCheck } from 'lucide-react';
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

const AGENT1_THINKING_STEPS = [
  {
    icon: '📖',
    status: 'Mencermati kisah kasusmu...',
    reasoning: 'Sedang membaca seluruh untaian kisah dan kronologi peristiwa yang kamu alami dari awal sampai akhir...',
    stage: 'Langkah 1/20: Menelaah Fakta & Kronologi'
  },
  {
    icon: '☕',
    status: 'Sruput teh/kopi hangat dulu...',
    reasoning: 'Meneliti poin-poin penting agar tidak ada detail ketidakadilan atau peristiwa nyata yang terlewatkan...',
    stage: 'Langkah 2/20: Mengurai Garis Waktu Peristiwa'
  },
  {
    icon: '🧐',
    status: 'Buka lembaran UU & Peraturan...',
    reasoning: 'Mencocokkan kisahmu dengan kumpulan pasal undang-undang dan aturan teknis yang berlaku saat ini...',
    stage: 'Langkah 3/20: Memetakan Objek Norma Hukum'
  },
  {
    icon: '⚖️',
    status: 'Mengukur dampak kerugian hak...',
    reasoning: 'Menganalisis apakah kerugianmu tergolong faktual (nyata) atau potensi kerugian yang pasti terjadi menurut standar MK...',
    stage: 'Langkah 4/20: Menguji Legal Standing & Kerugian'
  },
  {
    icon: '💡',
    status: 'Intermezzo: Tarik napas sejenak...',
    reasoning: 'Perjuangan menuntut keadilan memang butuh kesabaran. Duduk santai ya, saya telaah perkaramu dengan teliti...',
    stage: 'Langkah 5/20: Menjaga Fokus & Ketelitian'
  },
  {
    icon: '🔍',
    status: 'Melacak pasal-pasal bermasalah...',
    reasoning: 'Mencari tahu norma mana yang memicu ketidakpastian hukum, multitafsir, atau perlakuan diskriminatif...',
    stage: 'Langkah 6/20: Analisis Kausalitas Norma'
  },
  {
    icon: '📜',
    status: 'Menghubungkan ke UUD 1945...',
    reasoning: 'Memastikan hak hidup, hak bekerja, hak milik, dan hak atas kepastian hukum yang adil terlindungi konstitusi...',
    stage: 'Langkah 7/20: Korelasi Hak Konstitusional'
  },
  {
    icon: '📂',
    status: 'Memetakan dokumen & bukti awal...',
    reasoning: 'Menginventarisasi jenis bukti surat, perjanjian, keputusan sepihak, atau data lapangan yang bisa memperkuat gugatanmu...',
    stage: 'Langkah 8/20: Pemetaan Bukti Pendukung'
  },
  {
    icon: '🍵',
    status: 'Intermezzo: Jangan lupa minum air...',
    reasoning: 'Sambil menunggu sistem meracik draf telaah, pastikan kamu tetap tenang dan terhidrasi. Perjuangan butuh stamina!',
    stage: 'Langkah 9/20: Rehat & Jaga Kesehatan'
  },
  {
    icon: '🧠',
    status: 'Membangun logika argumentasi...',
    reasoning: 'Menyusun alur berpikir hukum yang runtut agar alasan permohonan (posita) memiliki landasan kokoh di hadapan hakim...',
    stage: 'Langkah 10/20: Konstruksi Dalil Posita'
  },
  {
    icon: '🏛️',
    status: 'Melihat preseden yurisprudensi MK...',
    reasoning: 'Menyelaraskan dengan pola putusan, pertimbangan hukum, dan doktrin Mahkamah Konstitusi terkait kasus serupa...',
    stage: 'Langkah 11/20: Rujukan Yurisprudensi MK'
  },
  {
    icon: '✍️',
    status: 'Meracik pertanyaan klarifikasi bertahap...',
    reasoning: 'Menyiapkan pertanyaan terfokus satu per satu agar kamu mudah menjawabnya tanpa merasa terbebani...',
    stage: 'Langkah 12/20: Formulasi Panduan Bertahap'
  },
  {
    icon: '🛡️',
    status: 'Intermezzo: Prinsip Konstitusi...',
    reasoning: 'Pasal 28D ayat (1) UUD 1945 menjamin hak setiap warga negara atas pengakuan, jaminan, perlindungan, dan kepastian hukum yang adil.',
    stage: 'Langkah 13/20: Penguatan Hak Asasi'
  },
  {
    icon: '📑',
    status: 'Menyederhanakan bahasa hukum...',
    reasoning: 'Menerjemahkan istilah hukum formal menjadi uraian yang ramah, mudah dipahami warga awam, dan membumi...',
    stage: 'Langkah 14/20: Harmonisasi Bahasa Rakyat'
  },
  {
    icon: '✨',
    status: 'Menyusun ringkasan duduk perkara...',
    reasoning: 'Merangkum inti persoalan agar siap diverifikasi secara objektif oleh tim evaluasi hukum independen...',
    stage: 'Langkah 15/20: Parafrase Resmi Perkara'
  },
  {
    icon: '🤝',
    status: 'Intermezzo: Solidaritas Warga...',
    reasoning: 'Ingatlah bahwa kamu tidak berjuang sendirian; banyak saudara sebangsa yang mungkin merasakan ketidakadilan aturan yang sama.',
    stage: 'Langkah 16/20: Solidaritas & Kepentingan Publik'
  },
  {
    icon: '🔍',
    status: 'Cek ulang susunan kalimat...',
    reasoning: 'Melakukan double-check agar pertanyaan terasa mengalir santai dan jelas...',
    stage: 'Langkah 17/20: Quality Check Respons'
  },
  {
    icon: '🎨',
    status: 'Sentuhan akhir tata letak...',
    reasoning: 'Menata paragraf balasan agar nyaman dibaca dan tidak membingungkan di layar HP maupun komputer...',
    stage: 'Langkah 18/20: Ergonomi & Tata Bahasa'
  },
  {
    icon: '🎯',
    status: 'Sedikit lagi, hampir siap!',
    reasoning: 'Mengemas respons langkah demi langkah agar mudah dipahami...',
    stage: 'Langkah 19/20: Sinkronisasi Respon'
  },
  {
    icon: '🚀',
    status: 'Selesai! Menampilkan balasan...',
    reasoning: 'Silakan baca pertanyaan dan jawab santai sesuai kenyataan yang kamu alami...',
    stage: 'Langkah 20/20: Siap Disajikan'
  }
];

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
  const [thinkingStepIndex, setThinkingStepIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine user messages count and clarification stage
  const userMessages = messages.filter(m => m.role === 'user');
  const userMessageCount = userMessages.length;
  // Clarification is complete when user has answered question 1, 2, and 3 (total 4 user inputs: initial + 3 answers)
  const isClarificationComplete = userMessageCount >= 4 || activeCase.is_clarification_complete === true;
  const currentClarificationStep = Math.min(Math.max(1, userMessageCount), 3);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Rotate thinking steps when Agent 1 is processing
  useEffect(() => {
    if (!isAgentTyping) {
      setThinkingStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setThinkingStepIndex((prev) => (prev + 1) % AGENT1_THINKING_STEPS.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [isAgentTyping]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAgentTyping, isAssessing, thinkingStepIndex, isClarificationComplete]);

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
    <div className="max-w-4xl mx-auto sm:px-6 sm:py-6 p-0 h-[calc(100dvh-53px)] sm:h-[82vh] flex flex-col">
      {/* Clean Single-View Chat Interface */}
      <div className="bg-white sm:border sm:border-stone-200 sm:rounded-xl shadow-xs flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="bg-stone-50 border-b border-stone-200 px-3.5 py-2.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#881337] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-sm sm:text-lg leading-tight">
                Ceritakan masalah anda
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-600 truncate max-w-[200px] sm:max-w-none">
                Agen 1: Menelaah fakta dalam {activeCase.bahasa_input === 'id' ? 'Bahasa Indonesia' : activeCase.bahasa_input === 'jv' ? 'Basa Jawa' : 'Basa Sunda'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Step-by-Step Progress Badge */}
            {userMessageCount > 0 && (
              <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1 sm:gap-1.5 border ${
                isClarificationComplete
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-[#881337] border-rose-200'
              }`}>
                {isClarificationComplete ? (
                  <>
                    <CheckCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
                    <span>Lengkap (3/3)</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#881337]" />
                    <span>Tanya {currentClarificationStep}/3</span>
                  </>
                )}
              </div>
            )}
            <span className="hidden sm:inline-block text-[11px] bg-stone-200 text-stone-800 px-2.5 py-1 rounded-md font-mono font-medium">
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

              {/* Progress Step Guide Bar */}
              {userMessageCount > 0 && !isClarificationComplete && (
                <div className="bg-white border border-rose-100 rounded-lg p-3 shadow-2xs flex items-center justify-between text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#881337] text-white text-[11px] font-bold flex items-center justify-center">
                      {currentClarificationStep}
                    </span>
                    <span className="font-medium text-stone-900">
                      {currentClarificationStep === 1
                        ? 'Langkah 1: Menggali alasan pokok dari pihak terkait'
                        : currentClarificationStep === 2
                        ? 'Langkah 2: Memeriksa dokumen & bukti pendukung'
                        : 'Langkah 3: Menelusuri riwayat mediasi / perundingan'}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Dijawab satu per satu dengan santai
                  </span>
                </div>
              )}

              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                // Split multi-paragraph bot messages into individual friendly bubbles
                const paragraphs = (!isUser && msg.content.includes('\n\n'))
                  ? msg.content.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
                  : [msg.content];

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-[#881337] text-white flex items-center justify-center shrink-0 mt-1 font-serif text-xs font-bold shadow-2xs">
                        RM
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[78%] ${isUser ? 'space-y-1' : 'space-y-2'}`}>
                      {paragraphs.map((paragraphText, pIdx) => (
                        <div
                          key={pIdx}
                          className={`rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                            isUser
                              ? 'bg-stone-900 text-stone-50 rounded-br-xs shadow-xs'
                              : 'bg-white border border-stone-200 text-stone-900 shadow-2xs rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{paragraphText}</p>
                          {pIdx === paragraphs.length - 1 && msg.content_translated && (
                            <div className="mt-2 pt-2 border-t border-stone-200 text-[11px] text-stone-600 italic">
                              <span className="font-semibold not-italic">Terjemahan Formal:</span> {msg.content_translated}
                            </div>
                          )}
                          {pIdx === paragraphs.length - 1 && (
                            <span className={`block text-[10px] mt-1.5 ${
                              isUser ? 'text-stone-400 text-right' : 'text-stone-400'
                            }`}>
                              {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-stone-700 text-stone-100 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Animated Conversational Reasoning & Status Indicator for Agent 1 */}
              {isAgentTyping && (
                <div className="flex gap-3 justify-start items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-8 h-8 rounded-full bg-[#881337] text-white flex items-center justify-center shrink-0 font-serif text-xs font-bold shadow-xs relative">
                    RM
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                  </div>

                  <div className="max-w-[92%] sm:max-w-[82%] bg-gradient-to-br from-stone-50 via-rose-50/40 to-amber-50/30 border border-rose-200/90 text-stone-900 rounded-2xl rounded-bl-none p-3.5 sm:p-4 shadow-sm space-y-2.5">
                    {/* Header: Stage Badge & Lively Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg animate-bounce">
                          {AGENT1_THINKING_STEPS[thinkingStepIndex].icon}
                        </span>
                        <span className="font-semibold text-stone-900 text-xs sm:text-sm">
                          {AGENT1_THINKING_STEPS[thinkingStepIndex].status}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-mono font-medium px-2 py-0.5 bg-white/90 border border-rose-200 text-rose-900 rounded-full shadow-2xs">
                        {AGENT1_THINKING_STEPS[thinkingStepIndex].stage}
                      </span>
                    </div>

                    {/* Reasoning & Thought Process in Conversational Indonesian */}
                    <div className="bg-white/80 border border-stone-200/70 rounded-lg p-2.5 text-xs text-stone-700 leading-relaxed shadow-2xs flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-rose-900 shrink-0 mt-0.5 animate-pulse" />
                      <span className="italic">
                        "{AGENT1_THINKING_STEPS[thinkingStepIndex].reasoning}"
                      </span>
                    </div>

                    {/* Live Progress Indicator & Progress Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#881337] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#881337] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#881337] animate-bounce" />
                        <span className="text-[11px] text-rose-900 font-medium ml-1">Agen 1 sedang menelaah & meracik respon...</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono font-bold text-rose-900 bg-white/80 px-1.5 py-0.5 rounded border border-rose-200 shadow-2xs">
                          {thinkingStepIndex + 1} / {AGENT1_THINKING_STEPS.length}
                        </span>
                        <div className="w-20 sm:w-28 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-rose-700 to-[#881337] transition-all duration-300 rounded-full"
                            style={{
                              width: `${((thinkingStepIndex + 1) / AGENT1_THINKING_STEPS.length) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Guided Action Card: Explicit Structured Fact Confirmation & "Lakukan Uji Kelayakan" */}
              {/* IMPORTANT: ONLY DISPLAYED WHEN ALL 3 QUESTIONS ARE ANSWERED (isClarificationComplete === true) */}
              {isClarificationComplete && !isAssessing && !isAgentTyping && (
                <div className="my-3 p-4 sm:p-5 bg-stone-50 border border-stone-300 rounded-xl shadow-xs space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#881337] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Scale className="w-5 h-5 text-amber-200" />
                    </div>
                    <div className="flex-1 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-stone-900 font-serif">Konfirmasi Struktur Fakta Perkara</p>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          Klarifikasi Selesai
                        </span>
                      </div>
                      <p className="text-stone-600 text-xs mt-0.5 leading-relaxed">
                        Agen 1 telah merangkum seluruh jawaban dan kronologi perkara Anda. Harap periksa apakah butir fakta di bawah telah merefleksikan persoalan yang sebenarnya sebelum diteruskan ke Agen 2 dan Agen 3:
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
                        "{activeCase.ringkasan_masalah_asli || messages.filter(m => m.role === 'user').slice(-1)[0]?.content}"
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>✓ Masih ingin melengkapi? Balas di kolom chat di bawah.</span>
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

            {/* Quick Prompts for initial guidance only when messages <= 1 */}
            {messages.length <= 1 && !isAgentTyping && (
              <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-stone-100 border-t border-stone-200 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="font-semibold text-stone-600 shrink-0 text-[11px] sm:text-xs">Contoh:</span>
                {activeQuickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(prompt)}
                    className="bg-white hover:bg-stone-200 text-stone-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md border border-stone-300 shrink-0 text-left text-xs truncate max-w-[220px] sm:max-w-xs transition cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar with step-aware placeholder */}
            <form onSubmit={handleSend} className="p-2 sm:p-3.5 bg-white border-t border-stone-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  userMessageCount === 0
                    ? "Ceritakan permasalahan hukum atau pasal yang merugikan Anda..."
                    : userMessageCount === 1
                    ? "Jawab Pertanyaan 1: Apa alasan spesifik dari pihak terkait..."
                    : userMessageCount === 2
                    ? "Jawab Pertanyaan 2: Dokumen/bukti apa saja yang Anda miliki..."
                    : userMessageCount === 3
                    ? "Jawab Pertanyaan 3: Apakah sudah pernah mediasi/bipartit sebelumnya..."
                    : "Ketik tambahan informasi atau koreksi bila diperlukan..."
                }
                disabled={isAssessing || isAgentTyping}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 border border-stone-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-800 bg-stone-50 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isAssessing || isAgentTyping}
                className="bg-[#881337] hover:bg-[#70102e] disabled:opacity-50 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
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
