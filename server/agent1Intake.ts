/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Agent 1: Citizen Intake & Fact Clarification
 * Conducts step-by-step guided intake, clarifies constitutional injury one question at a time,
 * supports Indonesian, Javanese & Sundanese.
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
  messages: string[]; // List of separate bite-sized chat messages for friendly messaging
  formal_indonesian_paraphrase: string;
  identified_complaint_summary?: string;
  suggested_next_action?: 'continue_chat' | 'ready_for_assessment';
  current_step: number; // 1, 2, 3, or 4 (complete)
  total_steps: number; // 3 questions total
  is_clarification_complete: boolean;
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

  // Calculate current user interaction step
  // userMessages count determines which stage of clarification we are in:
  // Step 1: User just told initial story -> Agent gives empathy, ack, and asks Question #1 ONLY.
  // Step 2: User answered Question #1 -> Agent says "Baik, pertanyaan pertama sudah cukup jelas bagi saya..." and asks Question #2 ONLY.
  // Step 3: User answered Question #2 -> Agent acknowledges Question #2 and asks Question #3 ONLY.
  // Step 4+: User answered Question #3 -> All 3 questions answered! Agent summarizes facts and instructs user to check confirmation box.
  const pastUserMessages = chatHistory.filter(m => m.role === 'user');
  const userMessageCount = Math.max(1, pastUserMessages.length);

  let currentStep = userMessageCount;
  if (currentStep > 4) currentStep = 4;
  const isComplete = userMessageCount >= 4;

  if (apiKey) {
    try {
      const prompt = `Anda adalah Agen 1 (Sahabat & Asisten Klarifikasi Fakta Konstitusional) pada platform Rakyat Menggugat.
Tugas utama Anda adalah MENDAMPINGI WARGA AWAM secara bertahap (step-by-step feeding) agar warga merasa mudah, tenang, dan tidak terbebani pertanyaan yang menumpuk.

STATUS PROGRES KLARIFIKASI SAAT INI:
- Langkah Klarifikasi Pengguna: Ke-${userMessageCount} dari 3 langkah pertanyaan
- Step Aktif: ${userMessageCount === 1 ? 'Langkah 1 (Pertanyaan Pertama)' : userMessageCount === 2 ? 'Langkah 2 (Pertanyaan Kedua)' : userMessageCount === 3 ? 'Langkah 3 (Pertanyaan Ketiga)' : 'Langkah 4 (Klarifikasi Selesai - Semua Pertanyaan Terjawab)'}

PENTING - ATURAN PROTOKOL MULTI-BUBBLE CHAT (JANGAN BUAT 1 CHAT PANJANG, PECAH MENJADI ARRAY OF MESSAGES):
Warga awam tidak suka membaca 1 chat yang panjang lebar. Pisahkan respon Anda menjadi array "messages" berisi 2 atau 3 chat pendek terpisah yang nyaman dibaca seperti chat di WhatsApp:

JIKA USER MESSAGE COUNT = 1 (Langkah 1 - Keluhan Awal Warga):
- Berikan 3 chat terpisah di dalam array "messages":
  Chat 1: "Terima kasih sudah berbagi keluh kesah Anda, saya sangat memahami betapa beratnya memperjuangkan hak yang seharusnya Anda peroleh. Saat ini, saya mencatat bahwa Anda merasa dirugikan oleh [sebutkan ringkas topik masalah/UU yang dihadapi]."
  Chat 2: "Untuk membantu memperjelas duduk perkaranya agar kuat di hadapan Mahkamah Konstitusi, mohon bantu saya dengan informasi berikut:"
  Chat 3: "1. Apa alasan spesifik dari [pihak perusahaan/pemberi kerja/pihak terkait] sehingga [pesangon/hak/tanah/ijin] Anda tidak diberikan atau tidak sesuai dengan yang Anda harapkan?"
- DILARANG mengajukan pertanyaan nomor 2 atau nomor 3 sekarang! Hanya pertanyaan nomor 1.

JIKA USER MESSAGE COUNT = 2 (Langkah 2 - Menjawab Pertanyaan 1):
- Berikan 2 chat terpisah di dalam array "messages":
  Chat 1: "Baik, pertanyaan pertama sudah cukup jelas bagi saya. Poin mengenai [sebutkan ringkas jawaban user 1] telah saya catat dengan teliti."
  Chat 2: "2. Apakah Anda memiliki dokumen atau bukti pendukung seperti surat PHK/keputusan resmi, slip gaji terakhir, perjanjian kerja/kontrak, surat peringatan, sertifikat, atau bukti tertulis lainnya?"
- DILARANG mengajukan pertanyaan nomor 3 sekarang! Hanya pertanyaan nomor 2.

JIKA USER MESSAGE COUNT = 3 (Langkah 3 - Menjawab Pertanyaan 2):
- Berikan 2 chat terpisah di dalam array "messages":
  Chat 1: "Terima kasih, dokumen dan bukti pendukung yang Anda sampaikan pada pertanyaan kedua sudah saya catat sebagai bukti awal yang sangat penting."
  Chat 2: "3. Apakah Anda sudah pernah mencoba melakukan upaya mediasi atau perundingan (seperti perundingan bipartit dengan manajemen, laporan/mediasi melalui Dinas Tenaga Kerja/instansi setempat, atau somasi) sebelumnya?"
- Hanya pertanyaan nomor 3.

JIKA USER MESSAGE COUNT >= 4 (Langkah 4 - Selesai Klarifikasi):
- Berikan 3 chat terpisah di dalam array "messages":
  Chat 1: "Luar biasa, seluruh pertanyaan klarifikasi telah terjawab dengan sangat baik dan lengkap."
  Chat 2: "Seluruh kronologi, bukti pendukung, dan riwayat upaya hukum Anda kini telah tersusun rapi ke dalam struktur fakta perkara yang kokoh."
  Chat 3: "Silakan periksa rangkuman fakta perkara Anda pada kotak konfirmasi di bawah ini, lalu klik tombol 'Konfirmasi Fakta & Lakukan Uji Kelayakan' untuk memulai evaluasi 4 lapis independen bersama Agen 2 dan Agen 3."

LARANGAN MUTLAK:
- DILARANG membuat vonis/kesimpulan hukum sendiri (misal "kasus ini pasti menang", "norma ini inkonstitusional"). Menilai kelayakan adalah wewenang Agen 2 & 3.
- DILARANG menyebut nomor pasal UUD 1945 di dalam teks (wewenang Agen 2 & 3).
- Gunakan bahasa yang santun, membumi, dan mudah dicerna warga awam (atau bahasa daerah Basa Jawa/Sunda jika pengguna menggunakannya).

Riwayat Percakapan Sebelumnya:
${chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Fakta Masukan Terkini Pemohon:
"${caseFacts}"

Bahasa Pilihan Pengguna: ${language}

Keluarkan HANYA JSON murni dengan skema:
{
  "messages": [
    "Chat bubble 1",
    "Chat bubble 2",
    "Chat bubble 3"
  ],
  "formal_indonesian_paraphrase": "Uraian fakta naratif lengkap dalam Bahasa Indonesia formal standar MK tanpa menyebut nomor pasal UUD 1945",
  "identified_complaint_summary": "Ringkasan 1 kalimat inti perkara",
  "suggested_next_action": "${isComplete ? 'ready_for_assessment' : 'continue_chat'}",
  "current_step": ${currentStep},
  "total_steps": 3,
  "is_clarification_complete": ${isComplete},
  "detected_potential_norm": "nama UU terkait",
  "detected_language_register": "id" | "jv_ngoko" | "jv_krama" | "su_lemes" | "su_loma",
  "substantive_elements_extracted": {
    "latar_belakang_fakta": "kronologi faktual",
    "hak_yang_dirugikan": "hak riil yang terganggu",
    "objek_norma_uu": "norma atau UU yang dipersoalkan",
    "hubungan_kausalitas": "akibat langsung terhadap pemohon"
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
      let parsedMessages: string[] = [];

      if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
        parsedMessages = parsed.messages.map((m: string) => m.trim()).filter(Boolean);
      } else if (typeof parsed.message === 'string' && parsed.message.trim()) {
        parsedMessages = parsed.message.split(/\n\n+/).map((m: string) => m.trim()).filter(Boolean);
      }

      // Programmatic Safeguard: Ensure format matches step requirements strictly and has multiple bubbles
      if (userMessageCount === 1) {
        if (parsedMessages.length < 2 || !parsedMessages.some(m => m.includes('1.'))) {
          parsedMessages = [
            `Terima kasih sudah berbagi keluh kesah Anda, saya sangat memahami betapa beratnya memperjuangkan hak yang seharusnya Anda dapatkan. Saat ini, saya telah mencatat pokok masalah yang Anda sampaikan.`,
            `Untuk membantu memperjelas duduk perkaranya agar kuat di hadapan Mahkamah Konstitusi, mohon bantu saya dengan informasi berikut:`,
            `1. Apa alasan spesifik dari pihak perusahaan atau pihak terkait sehingga hak/pesangon/tuntutan Anda tidak diberikan atau jumlahnya tidak sesuai dengan yang Anda harapkan?`
          ];
        }
      } else if (userMessageCount === 2) {
        if (parsedMessages.length < 2 || !parsedMessages.some(m => m.includes('2.'))) {
          parsedMessages = [
            `Baik, pertanyaan pertama sudah cukup jelas bagi saya. Keterangan mengenai alasan dari pihak terkait telah saya catat dengan teliti.`,
            `2. Apakah Anda memiliki dokumen atau bukti pendukung seperti surat PHK, slip gaji terakhir, perjanjian kerja/kontrak, atau surat penolakan resmi?`
          ];
        }
      } else if (userMessageCount === 3) {
        if (parsedMessages.length < 2 || !parsedMessages.some(m => m.includes('3.'))) {
          parsedMessages = [
            `Terima kasih, dokumen bukti yang Anda miliki pada pertanyaan kedua sudah saya catat sebagai bukti pendukung yang sangat penting.`,
            `3. Apakah Anda sudah pernah mencoba melakukan upaya mediasi melalui Dinas Tenaga Kerja/instansi setempat atau perundingan bipartit dengan pihak perusahaan sebelumnya?`
          ];
        }
      } else if (userMessageCount >= 4) {
        if (parsedMessages.length < 2) {
          parsedMessages = [
            `Luar biasa, seluruh pertanyaan klarifikasi telah terjawab dengan sangat baik dan lengkap.`,
            `Seluruh kronologi, bukti pendukung, dan riwayat upaya hukum Anda kini telah tersusun rapi ke dalam struktur fakta perkara yang kokoh.`,
            `Silakan periksa rangkuman fakta perkara Anda pada kotak konfirmasi di bawah ini, lalu klik tombol 'Konfirmasi Fakta & Lakukan Uji Kelayakan' untuk memulai evaluasi 4 lapis independen bersama Agen 2 dan Agen 3.`
          ];
        }
      }

      return {
        message: parsedMessages.join('\n\n'),
        messages: parsedMessages,
        formal_indonesian_paraphrase: parsed.formal_indonesian_paraphrase || caseFacts,
        identified_complaint_summary: parsed.identified_complaint_summary,
        suggested_next_action: isComplete ? 'ready_for_assessment' : 'continue_chat',
        current_step: currentStep,
        total_steps: 3,
        is_clarification_complete: isComplete,
        detected_potential_norm: parsed.detected_potential_norm,
        detected_language_register: parsed.detected_language_register || (language as any),
        substantive_elements_extracted: parsed.substantive_elements_extracted
      };
    } catch (err) {
      console.warn('Agent 1 Gemini API error, falling back to deterministic response:', err);
    }
  }

  // Robust Fallback Deterministic Intake & Paraphrase Engine
  return generateDeterministicIntakeResponse(caseFacts, language, userMessageCount);
}

function generateDeterministicIntakeResponse(
  caseFacts: string,
  language: string,
  userMessageCount: number = 1
): IntakeResponse {
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

  const isComplete = userMessageCount >= 4;
  const currentStep = Math.min(userMessageCount, 4);

  // Check Javanese markers
  const isJvKrama = lower.includes('kula') || lower.includes('panjenengan') || lower.includes('ngraosaken') || lower.includes('kapitunan') || lower.includes('dipun') || lower.includes('ingkang') || lower.includes('dhusun');
  const isJvNgoko = lower.includes('aku') || lower.includes('kerjo') || lower.includes('nang') || lower.includes('wis') || lower.includes('kabeh') || lower.includes('ujug') || lower.includes('mergo') || lower.includes('lemah');
  
  // Check Sundanese markers
  const isSuLemes = lower.includes('sim kuring') || lower.includes('saparakanca') || lower.includes('ngaraos') || lower.includes('karandapan') || lower.includes('tatanen') || lower.includes('karuhun') || lower.includes('dumasar');
  const isSuLoma = lower.includes('urang') || lower.includes('kuring') || lower.includes('teu adil') || lower.includes('lembur') || lower.includes('aya pasal');

  let responseMessages: string[] = [];

  if (isJvKrama || (language === 'jv' && !isJvNgoko)) {
    detectedRegister = 'jv_krama';
    if (userMessageCount === 1) {
      responseMessages = [
        `Matur nuwun sanget sampun nyariyosaken perkawis ingkang panjenengan alami kanthi tinarbuka. Kula sampun nyathet sedaya runtutan prastawa saha kapitunan ingkang panjenengan raosaken.`,
        `Supados dalil permohonan panjenengan langkung kiyat wonten ing persidangan Mahkamah Konstitusi, keparenga kula nyuwun piterang:`,
        `1. Punapa alasan spesifik saking pihak perusahaan utawi instansi saengga hak/pesangon/lahan panjenengan boten dipunparingaken kados ingkang samesthinipun?`
      ];
    } else if (userMessageCount === 2) {
      responseMessages = [
        `Saestu, pitakenan kaping sepisan sampun cetha sanget tumrap kula. Katrangan babagan alasan saking pihak ingkang ngrugekaken sampun kula cathet.`,
        `2. Punapa panjenengan sampun kagungan bukti serat-serat resmi (kados serat keputusan PHK, slip gaji pungkasan, serat prajanjian kerja, utawi layang penolakan resmi)?`
      ];
    } else if (userMessageCount === 3) {
      responseMessages = [
        `Matur nuwun, katrangan bukti serat ing pitakenan kaping kalih sampun kula cathet minangka bukti wiwitan ingkang wigatos.`,
        `3. Punapa panjenengan nate ngupayakaken rembagan bipartit utawi mediasi lumantar Dinas Tenaga Kerja/instansi daerah saderengipun?`
      ];
    } else {
      responseMessages = [
        `Maturnuwun sanget, sedaya pitakenan klarifikasi sampun dipunwangsuli kanthi jangkep lan cetha.`,
        `Runtutan fakta perkawis panjenengan sapunika sampun siyap dipun-uji dening Agen 2 lan Agen 3.`,
        `Sumangga dipun-priksa kothak konfirmasi fakta ing ngandhap punika, lajeng klik tombol "Konfirmasi Fakta & Lakukan Uji Kelayakan".`
      ];
    }
  } else if (isJvNgoko) {
    detectedRegister = 'jv_ngoko';
    if (userMessageCount === 1) {
      responseMessages = [
        `Matur suwun wis nyritakake masalah sing kok alami kanthi cetha lan blaka suta. Aku wis nyathet kabeh kronologi lan rasa ora adil sing kok rasakake.`,
        `Supaya dalil gugatan menyang Mahkamah Konstitusi dadi luwih mantep, tulung bantu aku karo informasi iki:`,
        `1. Apa alasan spesifik seko pihak perusahaan utawa pihak terkait saengga hak/pesangon/lahanmu ora diwenehake utawa ora cocok karo sing kok karepke?`
      ];
    } else if (userMessageCount === 2) {
      responseMessages = [
        `Apik, pitakonan nomer siji wis cukup cetha kanggo aku. Poin babagan alasan pihak kana wis tak cathet rapi.`,
        `2. Apa kowe nduwe dokumen utawa bukti pendukung koyo layang PHK, slip gajihan pungkasan, berkas perjanjian kontrak, utawa layang peringatan?`
      ];
    } else if (userMessageCount === 3) {
      responseMessages = [
        `Matur suwun, bukti berkas neng pitakonan nomer loro wis tak cathet dadi bukti awal sing penting banget.`,
        `3. Apa kowe tau nyoba mediasi liwat Dinas Tenaga Kerja utawa rembugan bipartit karo manajemen sadurunge iki?`
      ];
    } else {
      responseMessages = [
        `Matur suwun tenan, kabeh pitakonan klarifikasi wis kok jawab kanthi komplit lan runtut.`,
        `Kabeh fakta kasusmu wis siap tak teruske menyang Agen 2 lan Agen 3 kanggo diuji kelayakane.`,
        `Coba deleng kothak konfirmasi fakta neng ngisor iki, terus klik tombol "Konfirmasi Fakta & Lakukan Uji Kelayakan" ya!`
      ];
    }
  } else if (isSuLemes || (language === 'su' && !isSuLoma)) {
    detectedRegister = 'su_lemes';
    if (userMessageCount === 1) {
      responseMessages = [
        `Hatur nuhun pisan parantos nyarioskeun perkawis ieu sacara écés. Sim kuring parantos nyatet sadaya fakta sareng karugian anu karandapan ku salira.`,
        `Supados dasar gugatan salira langkung kiat di payuneun Mahkamah Konstitusi, sim kuring badé nyuhunkeun katerangan:`,
        `1. Naon alesan husus ti pihak pausahaan atanapi instansi sahingga hak/pesangon/lahan salira henteu dibasihkeun sakumaha mistina?`
      ];
    } else if (userMessageCount === 2) {
      responseMessages = [
        `Sae pisan, patarosan nomer kahiji parantos cekap écés kanggé sim kuring.`,
        `2. Naha salira parantos nyepeng bukti serat resmi sapertos serat kaputusan PHK, slip gajih pamungkas, serat kontrak padamelan, atanapi serat panginget?`
      ];
    } else if (userMessageCount === 3) {
      responseMessages = [
        `Hatur nuhun, bukti serat dina patarosan nomer dua parantos dicatet salaku bukti awal anu penting.`,
        `3. Naha salira kantos ngupayakeun musyawarah bipartit atanapi mediasi ngalangkungan Dinas Tenaga Kerja/instansi daerah sateuacanna?`
      ];
    } else {
      responseMessages = [
        `Hatur nuhun pisan, sadaya patarosan parantos diwaler kalayan lengkep tur écés.`,
        `Fakta perkawis salira parantos siap diteraskeun kanggé Uji Kelayakan.`,
        `Mangga parios kotak konfirmasi fakta di handap, teras klik tombol "Konfirmasi Fakta & Lakukan Uji Kelayakan".`
      ];
    }
  } else {
    // Indonesian Standard
    detectedRegister = 'id';
    if (userMessageCount === 1) {
      responseMessages = [
        `Terima kasih sudah berbagi keluh kesah Anda, saya sangat memahami betapa beratnya memperjuangkan hak yang seharusnya Anda peroleh. Saat ini, saya mencatat bahwa Anda merasa dirugikan oleh persoalan hukum yang Anda hadapi.`,
        `Untuk membantu memperjelas duduk perkaranya agar kuat di hadapan Mahkamah Konstitusi, mohon bantu saya dengan informasi berikut:`,
        `1. Apa alasan spesifik dari perusahaan atau pihak terkait sehingga hak/pesangon/tuntutan Anda tidak dibayarkan atau jumlahnya tidak sesuai dengan yang Anda harapkan?`
      ];
    } else if (userMessageCount === 2) {
      responseMessages = [
        `Baik, pertanyaan pertama sudah cukup jelas bagi saya. Poin mengenai alasan dari pihak terkait telah saya catat dengan teliti.`,
        `2. Apakah Anda memiliki dokumen pendukung seperti surat PHK/surat keputusan, slip gaji terakhir, perjanjian kerja/kontrak, atau surat penolakan resmi?`
      ];
    } else if (userMessageCount === 3) {
      responseMessages = [
        `Terima kasih, informasi dokumen pendukung pada pertanyaan kedua sudah saya catat sebagai bukti awal yang sangat penting.`,
        `3. Apakah Anda sudah pernah mencoba melakukan mediasi melalui Dinas Tenaga Kerja/instansi berwenang atau upaya perundingan bipartit dengan pihak perusahaan sebelumnya?`
      ];
    } else {
      responseMessages = [
        `Luar biasa, seluruh pertanyaan klarifikasi telah terjawab dengan sangat baik dan lengkap.`,
        `Seluruh kronologi, dokumen bukti, dan riwayat upaya penyelesaian telah terangkum secara terstruktur ke dalam fakta perkara.`,
        `Silakan periksa rangkuman fakta perkara Anda pada kotak konfirmasi di bawah ini, lalu klik tombol "Konfirmasi Fakta & Lakukan Uji Kelayakan" untuk melanjutkan evaluasi 4 lapis independen bersama Agen 2 dan Agen 3.`
      ];
    }
  }

  // Detect specific issue scenarios
  if (lower.includes('tambang') || lower.includes('minerba') || lower.includes('limbah') || (lower.includes('lingkungan') && !lower.includes('cipta kerja'))) {
    detectedNorm = 'Undang-Undang Nomor 3 Tahun 2020 tentang Perubahan atas UU Nomor 4 Tahun 2009 tentang Pertambangan Mineral dan Batubara';
    latarBelakang = 'Pemohon beserta masyarakat desa mengalami dampak langsung kerusakan lingkungan hidup dan pencemaran sumber air bersih desa akibat aktivitas perizinan usaha pertambangan tanpa persetujuan warga terdampak.';
    hakDirugikan = 'Hak atas lingkungan hidup yang bersih dan sehat serta keberlanjutan sumber kehidupan masyarakat.';
    objekNorma = 'Ketentuan perizinan pertambangan sentralistik dalam UU Nomor 3 Tahun 2020 (UU Minerba).';
    kausalitas = 'Berlakunya ketentuan izin sentralistik meniadakan ruang partisipasi warga lokal dan mencemari sumber air bersih desa secara nyata.';
    formalParaphrase = `Pemohon bersama warga masyarakat setempat mengalami kerugian faktual berupa kerusakan lingkungan hidup dan terganggunya sumber air bersih desa akibat berlakunya ketentuan perizinan dalam Undang-Undang Nomor 3 Tahun 2020 tentang Pertambangan Mineral dan Batubara (UU Minerba). Ketentuan tersebut membatasi hak partisipasi masyarakat dan secara nyata mengancam kelestarian lingkungan serta penghidupan warga desa.`;
  } else if (lower.includes('bank tanah') || lower.includes('tanah ulayat') || (lower.includes('adat') && lower.includes('tanah')) || lower.includes('lahan') || lower.includes('gusur')) {
    detectedNorm = 'Undang-Undang Nomor 6 Tahun 2023 (Ketentuan Bank Tanah & Hak Pengelolaan Lahan)';
    latarBelakang = 'Pemohon bersama kesatuan masyarakat adat/petani lokal mengalami ancaman penggusuran dan pengambilalihan lahan pertanian turun-temurun tanpa musyawarah yang setara dan tanpa ganti kerugian yang adil.';
    hakDirugikan = 'Hak atas perlindungan harta benda dan tanah penghidupan dari pengambilalihan sewenang-wenang tanpa ganti kerugian yang adil.';
    objekNorma = 'Ketentuan pengelolaan bank tanah dan konsesi lahan dalam UU Nomor 6 Tahun 2023.';
    kausalitas = 'Pemberian konsesi lahan kepada pihak ketiga berdasarkan undang-undang a quo mengikis hak penguasaan tanah tradisional masyarakat secara aktual.';
    formalParaphrase = `Pemohon beserta anggota kesatuan masyarakat adat dan petani setempat mengalami ancaman penggusuran serta pengambilalihan hak ulayat atas tanah pertanian turun-temurun akibat berlakunya pengaturan bank tanah dan konsesi lahan dalam Undang-Undang Nomor 6 Tahun 2023. Pengambilalihan tersebut dilakukan tanpa proses musyawarah yang bermakna dan tanpa pemberian ganti kerugian yang layak, sehingga memutus mata pencaharian warga setempat.`;
  } else if (lower.includes('cipta kerja') || lower.includes('buruh') || lower.includes('kontrak') || lower.includes('phk') || lower.includes('pesangon') || lower.includes('outsourcing') || lower.includes('upah')) {
    detectedNorm = 'Undang-Undang Nomor 6 Tahun 2023 tentang Penetapan Perppu No. 2/2022 tentang Cipta Kerja (Klaster Ketenagakerjaan)';
    latarBelakang = 'Pemohon merupakan pekerja/buruh yang mengalami pemutusan hubungan kerja atau ketidakpastian kerja kontrak berulang tanpa pemenuhan hak pesangon dan kompensasi yang layak.';
    hakDirugikan = 'Hak atas kepastian kerja yang adil, imbalan yang layak dalam hubungan kerja, dan perlindungan dari pemutusan kerja sepihak.';
    objekNorma = 'Ketentuan ketenagakerjaan dan perjanjian kerja waktu tertentu dalam UU Nomor 6 Tahun 2023.';
    kausalitas = 'Berlakunya norma a quo menghapuskan jaminan kepastian kerja serta hak kompensasi dan pesangon pemohon secara langsung.';
    formalParaphrase = `Pemohon adalah pekerja/buruh yang terdampak langsung oleh berlakunya ketentuan ketenagakerjaan dalam Undang-Undang Nomor 6 Tahun 2023 tentang Cipta Kerja. Akibat ketentuan tersebut, masa kerja kontrak pemohon terus diperpanjang dan kemudian diputus tanpa pemenuhan hak pesangon serta jaminan kepastian kerja yang adil, sehingga menghilangkan sumber penghidupan yang layak bagi pemohon dan keluarganya.`;
  } else {
    formalParaphrase = `Pemohon mengalami kerugian hak konstitusional berupa ketidakpastian hukum yang adil dan perlakuan diskriminatif akibat berlakunya norma dalam undang-undang yang diuraikan: "${caseFacts}". Kerugian tersebut berkaitan erat dengan terganggunya hak-hak dasar pemohon sebagai warga negara.`;
  }

  return {
    message: responseMessages.join('\n\n'),
    messages: responseMessages,
    formal_indonesian_paraphrase: formalParaphrase,
    identified_complaint_summary: formalParaphrase.substring(0, 140) + '...',
    suggested_next_action: isComplete ? 'ready_for_assessment' : 'continue_chat',
    current_step: currentStep,
    total_steps: 3,
    is_clarification_complete: isComplete,
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
