/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Agent 1: Citizen Intake & Fact Clarification
 * Conducts structured intake, clarifies constitutional injury, supports Javanese & Sundanese.
 */

import { generateGeminiContentWithRetry } from './geminiHelper';

export interface SubstantiveElements {
  latar_belakang_fakta: string;
  hak_yang_dirugikan: string;
  objek_norma_uu: string;
  hubungan_kausalitas: string;
}

export interface IntakeResponse {
  message: string;
  formal_indonesian_paraphrase: string;
  identified_complaint_summary?: string;
  suggested_next_action?: 'continue_chat' | 'ready_for_assessment';
  detected_potential_norm?: string;
  detected_language_register?: 'id' | 'jv_ngoko' | 'jv_krama' | 'su_lemes' | 'su_loma';
  substantive_elements_extracted?: SubstantiveElements;
}

export async function runAgent1Intake(
  caseFacts: string,
  chatHistory: Array<{ role: string; content: string }>,
  language: string = 'id'
): Promise<IntakeResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Anda adalah Agen 1 (Intake & Klarifikasi Fakta) pada platform Rakyat Menggugat.
Tugas Anda adalah memandu warga negara Indonesia dalam menguraikan masalah hukum yang mereka hadapi:
1. Memahami keluhan warga baik dalam Bahasa Indonesia, Bahasa Jawa (Ngoko maupun Krama), atau Bahasa Sunda (Loma maupun Lemes).
2. Memetakan 4 elemen substantif hukum secara cermat:
   - Latar belakang fakta & kronologi konkret pemohon
   - Kerugian faktual / hak yang dirugikan secara nyata
   - Objek norma Undang-Undang atau peraturan yang dipersoalkan
   - Hubungan sebab-akibat (kausalitas) antara berlakunya aturan dengan kerugian pemohon
3. Menghasilkan "formal_indonesian_paraphrase": Parafrase fakta kasus ke dalam BAHASA INDONESIA FORMAL STANDAR HUKUM yang utuh, murni deskriptif naratif, dan akurat.
   ATURAN MUTLAK ANTI-ANCHORING & ANTI-HALUSINASI:
   - DILARANG KERAS mencantumkan nomor pasal UUD 1945 spesifik (misal: "Pasal 27 ayat 2", "Pasal 28D ayat 2", "Pasal 18B", "Pasal 28H", dll) di dalam formal_indonesian_paraphrase.
   - Penentuan pasal batu uji UUD 1945 adalah wewenang eksklusif Agen 2 (melalui RAG retrieval korpus hukum) dan Agen 3 (Verifikator independen). Agen 1 HANYA berfokus pada fakta dan kerugian riil.
4. Memberikan pesan balasan ("message") yang ramah, santun, dan sesuai bahasa/register pengguna (Bahasa Indonesia, Jawa Krama/Ngoko, atau Sunda Lemes/Loma). Beri tahu warga bahwa mereka dapat menekan tombol "Lakukan Uji Kelayakan" untuk langsung memeriksa peluang gugatannya.

Riwayat Percakapan:
${chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Fakta Masukan Terkini Pemohon:
"${caseFacts}"

Bahasa Pilihan Pengguna: ${language}

Keluarkan HANYA JSON murni dengan skema:
{
  "message": "pesan balasan ramah & suportif kepada warga dalam bahasa yang sesuai",
  "formal_indonesian_paraphrase": "Uraian fakta naratif lengkap dan terstruktur dalam Bahasa Indonesia formal tanpa menyebut nomor pasal UUD 1945",
  "identified_complaint_summary": "ringkasan 1-2 kalimat dari inti keluhan",
  "suggested_next_action": "continue_chat" atau "ready_for_assessment",
  "detected_potential_norm": "nama UU atau peraturan yang terindikasi dipersoalkan",
  "detected_language_register": "id" | "jv_ngoko" | "jv_krama" | "su_lemes" | "su_loma",
  "substantive_elements_extracted": {
    "latar_belakang_fakta": "kronologi faktual pemohon",
    "hak_yang_dirugikan": "deskripsi kerugian atau hak riil yang terganggu",
    "objek_norma_uu": "nama UU atau regulasi yang menjadi sumber masalah",
    "hubungan_kausalitas": "akibat langsung berlakunya aturan terhadap kerugian pemohon"
  }
}`;

      const { text } = await generateGeminiContentWithRetry(prompt, {
        preferredModel: 'gemini-3.7-flash',
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        }
      });

      const parsed = JSON.parse(text);
      return {
        message: parsed.message,
        formal_indonesian_paraphrase: parsed.formal_indonesian_paraphrase || caseFacts,
        identified_complaint_summary: parsed.identified_complaint_summary,
        suggested_next_action: parsed.suggested_next_action || 'ready_for_assessment',
        detected_potential_norm: parsed.detected_potential_norm,
        detected_language_register: parsed.detected_language_register || (language as any),
        substantive_elements_extracted: parsed.substantive_elements_extracted
      };
    } catch (err) {
      console.warn('Agent 1 Gemini API error, falling back to deterministic response:', err);
    }
  }

  // Robust Fallback Deterministic Intake & Paraphrase Engine
  return generateDeterministicIntakeResponse(caseFacts, language);
}

function generateDeterministicIntakeResponse(caseFacts: string, language: string): IntakeResponse {
  const lower = caseFacts.toLowerCase();

  // Detect Register & Tone
  let detectedRegister: 'id' | 'jv_ngoko' | 'jv_krama' | 'su_lemes' | 'su_loma' = 'id';
  let responseMessage = '';
  let detectedNorm = 'Undang-Undang terkait yang memuat norma yang dipersoalkan';
  let latarBelakang = caseFacts;
  let hakDirugikan = 'Hak atas kepastian hukum yang adil dan perlindungan dari perlakuan sewenang-wenang';
  let objekNorma = 'Ketentuan norma setingkat Undang-Undang';
  let kausalitas = 'Berlakunya norma mengakibatkan kerugian langsung terhadap pemohon';
  let formalParaphrase = '';

  // Check Javanese markers
  const isJvKrama = lower.includes('kula') || lower.includes('panjenengan') || lower.includes('ngraosaken') || lower.includes('kapitunan') || lower.includes('dipun') || lower.includes('ingkang') || lower.includes('dhusun');
  const isJvNgoko = lower.includes('aku') || lower.includes('kerjo') || lower.includes('nang') || lower.includes('wis') || lower.includes('kabeh') || lower.includes('ujug') || lower.includes('mergo') || lower.includes('lemah');
  
  // Check Sundanese markers
  const isSuLemes = lower.includes('sim kuring') || lower.includes('saparakanca') || lower.includes('ngaraos') || lower.includes('karandapan') || lower.includes('tatanen') || lower.includes('karuhun') || lower.includes('dumasar');
  const isSuLoma = lower.includes('urang') || lower.includes('kuring') || lower.includes('teu adil') || lower.includes('lembur') || lower.includes('aya pasal');

  if (isJvKrama || (language === 'jv' && !isJvNgoko)) {
    detectedRegister = 'jv_krama';
    responseMessage = 'Matur nuwun sanget kagem katrangan panjenengan. Sistem sampun nyathet sedaya fakta perkawis saha kerugian ingkang dipun raosaken. Panjenengan saged mencet tombol "Lakukan Uji Kelayakan" ing ngandhap kagem nindakaken evaluasi yuridis 4 lapis dening kalih agen mandiri.';
  } else if (isJvNgoko) {
    detectedRegister = 'jv_ngoko';
    responseMessage = 'Matur suwun wis nyritakake masalahmu kanthi cetha. Sistem wis nyathet kabeh fakta lan kerugian sing kok alami. Saiki kowe bisa ngeklik tombol "Lakukan Uji Kelayakan" ing ngisor iki kanggo mriksa kelayakan gugatan menyang Mahkamah Konstitusi.';
  } else if (isSuLemes || (language === 'su' && !isSuLoma)) {
    detectedRegister = 'su_lemes';
    responseMessage = 'Hatur nuhun kana katerangan salira anu parantos écés. Sistem parantos nyatet sadaya fakta sareng karugian anu karandapan. Salira tiasa mencet tombol "Lakukan Uji Kelayakan" di handap kanggo mariksa kalayakan gugatan ka Mahkamah Konstitusi.';
  } else if (isSuLoma) {
    detectedRegister = 'su_loma';
    responseMessage = 'Nuhun geus nyaritakeun masalahna. Sistem geus nyatet fakta jeung karugian anu karasa ku anjeun. Mangga klik tombol "Lakukan Uji Kelayakan" di handap pikeun mariksa kelayakan perkara ka Mahkamah Konstitusi.';
  } else {
    detectedRegister = 'id';
    responseMessage = 'Poin fakta telah dicatat secara sistematis. Dari uraian Anda, objek yang dipersoalkan berkaitan dengan potensi kerugian hak warga negara. Silakan klik tombol "Lakukan Uji Kelayakan" di bawah untuk menjalankan evaluasi independen 4 lapis secara otomatis.';
  }

  // Detect specific issue scenarios (purely descriptive facts - NO constitutional article numbers)
  if (lower.includes('tambang') || lower.includes('minerba') || lower.includes('toya') || lower.includes('limbah') || (lower.includes('lingkungan') && !lower.includes('cipta kerja'))) {
    detectedNorm = 'Undang-Undang Nomor 3 Tahun 2020 tentang Perubahan atas UU Nomor 4 Tahun 2009 tentang Pertambangan Mineral dan Batubara';
    latarBelakang = 'Pemohon beserta masyarakat desa mengalami dampak langsung kerusakan lingkungan hidup dan pencemaran sumber air bersih desa akibat aktivitas perizinan usaha pertambangan tanpa persetujuan warga terdampak.';
    hakDirugikan = 'Hak atas lingkungan hidup yang bersih dan sehat serta keberlanjutan sumber kehidupan masyarakat.';
    objekNorma = 'Ketentuan perizinan pertambangan sentralistik dalam UU Nomor 3 Tahun 2020 (UU Minerba).';
    kausalitas = 'Berlakunya ketentuan izin sentralistik meniadakan ruang partisipasi warga lokal dan mencemari sumber air bersih desa secara nyata.';
    formalParaphrase = `Pemohon bersama warga masyarakat setempat mengalami kerugian faktual berupa kerusakan lingkungan hidup dan terganggunya sumber air bersih desa akibat berlakunya ketentuan perizinan dalam Undang-Undang Nomor 3 Tahun 2020 tentang Pertambangan Mineral dan Batubara (UU Minerba). Ketentuan tersebut membatasi hak partisipasi masyarakat dan secara nyata mengancam kelestarian lingkungan serta penghidupan warga desa.`;
  } else if (lower.includes('bank tanah') || lower.includes('tatanen') || lower.includes('karuhun') || lower.includes('tanah ulayat') || (lower.includes('adat') && lower.includes('tanah')) || lower.includes('lahan')) {
    detectedNorm = 'Undang-Undang Nomor 6 Tahun 2023 (Ketentuan Bank Tanah & Hak Pengelolaan Lahan)';
    latarBelakang = 'Pemohon bersama kesatuan masyarakat adat/petani lokal mengalami ancaman penggusuran dan pengambilalihan lahan pertanian turun-temurun tanpa musyawarah yang setara dan tanpa ganti kerugian yang adil.';
    hakDirugikan = 'Hak atas perlindungan harta benda dan tanah penghidupan dari pengambilalihan sewenang-wenang tanpa ganti kerugian yang adil.';
    objekNorma = 'Ketentuan pengelolaan bank tanah dan konsesi lahan dalam UU Nomor 6 Tahun 2023.';
    kausalitas = 'Pemberian konsesi lahan kepada pihak ketiga berdasarkan undang-undang a quo mengikis hak penguasaan tanah tradisional masyarakat secara aktual.';
    formalParaphrase = `Pemohon beserta anggota kesatuan masyarakat adat dan petani setempat mengalami ancaman penggusuran serta pengambilalihan hak ulayat atas tanah pertanian turun-temurun akibat berlakunya pengaturan bank tanah dan konsesi lahan dalam Undang-Undang Nomor 6 Tahun 2023. Pengambilalihan tersebut dilakukan tanpa proses musyawarah yang bermakna dan tanpa pemberian ganti kerugian yang layak, sehingga memutus mata pencaharian warga setempat.`;
  } else if (lower.includes('cipta kerja') || lower.includes('buruh') || lower.includes('kontrak') || lower.includes('phk') || lower.includes('pesangon') || lower.includes('outsourcing')) {
    detectedNorm = 'Undang-Undang Nomor 6 Tahun 2023 tentang Penetapan Perppu No. 2/2022 tentang Cipta Kerja (Klaster Ketenagakerjaan)';
    latarBelakang = 'Pemohon merupakan pekerja/buruh yang mengalami perpanjangan kontrak kerja berulang dan kemudian diputus hubungan kerja tanpa pemenuhan hak pesangon yang layak.';
    hakDirugikan = 'Hak atas kepastian kerja yang adil, imbalan yang layak dalam hubungan kerja, dan perlindungan dari pemutusan kerja sepihak.';
    objekNorma = 'Ketentuan ketenagakerjaan dan perjanjian kerja waktu tertentu dalam UU Nomor 6 Tahun 2023.';
    kausalitas = 'Berlakunya norma a quo menghapuskan jaminan kepastian kerja serta hak kompensasi dan pesangon pemohon secara langsung.';
    formalParaphrase = `Pemohon adalah pekerja/buruh yang terdampak langsung oleh berlakunya ketentuan ketenagakerjaan dalam Undang-Undang Nomor 6 Tahun 2023 tentang Cipta Kerja. Akibat ketentuan tersebut, masa kerja kontrak pemohon terus diperpanjang dan kemudian diputus tanpa pemenuhan hak pesangon serta jaminan kepastian kerja yang adil, sehingga menghilangkan sumber penghidupan yang layak bagi pemohon dan keluarganya.`;
  } else {
    formalParaphrase = `Pemohon mengalami kerugian hak konstitusional berupa ketidakpastian hukum yang adil dan perlakuan diskriminatif akibat berlakunya norma dalam undang-undang yang diuraikan: "${caseFacts}". Kerugian tersebut berkaitan erat dengan terganggunya hak-hak dasar pemohon sebagai warga negara.`;
  }

  return {
    message: responseMessage,
    formal_indonesian_paraphrase: formalParaphrase,
    identified_complaint_summary: formalParaphrase.substring(0, 140) + '...',
    suggested_next_action: caseFacts.length > 30 ? 'ready_for_assessment' : 'continue_chat',
    detected_potential_norm: detectedNorm,
    detected_language_register: detectedRegister,
    substantive_elements_extracted: {
      latar_belakang_fakta: latarBelakang,
      hak_yang_dirugikan: hakDirugikan,
      objek_norma_uu: objekNorma,
      hubungan_kausalitas: kausalitas
    }
  };
}

