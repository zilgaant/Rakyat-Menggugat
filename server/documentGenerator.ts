/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Document Generator Engine
 * Generates Buku I Permohonan Mahkamah Konstitusi (MK) and Daftar Alat Bukti
 * strictly compliant with Peraturan Mahkamah Konstitusi (PMK) No. 2 Tahun 2021.
 * Supports structured JSON, DOCX export (via docx library), and Print-to-PDF HTML.
 */

import { generateGeminiContentWithRetry } from './geminiHelper';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, Header, Footer, PageNumber } from 'docx';
import { ReconciledAssessmentResult } from './reconciliation';
import { retrieveRelevantLegalKnowledge, LEGAL_KNOWLEDGE_BASE } from './legalKnowledge';
import { generateDynamicEvidenceMatrix } from './evidenceGenerator';

export interface PetitionerIdentity {
  nama_lengkap: string;
  nik: string;
  tempat_tanggal_lahir: string;
  pekerjaan: string;
  alamat_lengkap: string;
  nomor_kontak: string;
  email: string;
  kategori_pemohon: 'Perorangan Warga Negara Indonesia' | 'Kesatuan Masyarakat Hukum Adat' | 'Badan Hukum Publik/Privat' | 'Lembaga Negara';
}

export interface EvidenceItem {
  kode_bukti: string; // e.g. "P-1", "P-2"
  nama_dokumen: string;
  kategori: 'Identitas Diri' | 'Undang-Undang / Peraturan' | 'Fakta Kerugian' | 'Kajian / Doktrin / Yurisprudensi';
  keterangan_pembuktian: string;
  status_materai_pos: 'Wajib Legalisasi/Pemeteraian di Kantor Pos' | 'Dokumen Resmi Negara' | 'Dokumen Pendukung';
}

export interface ConstitutionalPetitionDocument {
  id: string;
  case_id: string;
  created_at: string;
  nomor_perkara_internal: string;
  judul_permohonan: string;
  mahkamah_tujuan: string;
  tanggal_surat: string;
  status_kelayakan?: 'layak' | 'perlu_data_tambahan' | 'tidak_layak';
  peringatan_kelayakan?: string | null;
  catatan_kelemahan_posita?: string | null;
  identitas_pemohon: PetitionerIdentity;
  kewenangan_mk: {
    dasar_hukum: string[];
    uraian_kewenangan: string;
  };
  kedudukan_hukum: {
    dasar_hukum: string[];
    uraian_5_syarat_standing: {
      syarat_1_hak_konstitusional: string;
      syarat_2_kerugian_spesifik: string;
      syarat_3_kerugian_aktual_potensial: string;
      syarat_4_causal_verband: string;
      syarat_5_efek_pemulihan: string;
    };
    kesimpulan_standing: string;
  };
  posita: {
    latar_belakang_fakta: string;
    norma_yang_diuji: {
      undang_undang: string;
      pasal_ayat: string;
      bunyi_norma: string;
    };
    batu_uji_uud_1945: Array<{
      pasal: string;
      bunyi_pasal: string;
      analisis_pertentangan: string;
    }>;
    analisis_pertentangan_komprehensif: string;
    penegasan_ne_bis_in_idem: string;
  };
  petitum: {
    primair: string[];
    subsidair: string;
  };
  daftar_alat_bukti: EvidenceItem[];
  panduan_pendaftaran: {
    tata_cara_legalisasi_pos: string;
    prosedur_online_simpel_mk: string;
    prosedur_offline_kepaniteraan: string;
    jumlah_rangkap_berkas: string;
  };
}

export async function generateConstitutionalPetition(
  caseFacts: string,
  petitionerInput?: Partial<PetitionerIdentity>,
  reconciledAssessment?: ReconciledAssessmentResult
): Promise<ConstitutionalPetitionDocument> {
  // CRITICAL SAFETY GATE: Refuse generation if assessment result is 'tidak_layak'
  if (reconciledAssessment && (reconciledAssessment.hasil_akhir === 'tidak_layak' || reconciledAssessment.status_tampil_ke_user === 'tidak_layak')) {
    const lapis1 = reconciledAssessment.layers.find(l => l.lapis_ke === 1);
    const lapis2 = reconciledAssessment.layers.find(l => l.lapis_ke === 2);
    
    let alasanPenolakan = 'Kasus ini tidak memenuhi syarat untuk diajukan ke Mahkamah Konstitusi.';
    if (lapis1 && lapis1.status === 'gagal_total') {
      alasanPenolakan = `Permohonan ditolak karena Salah Kamar Yurisdiksi: ${lapis1.penjelasan}. Norma yang diuji berada di bawah UU dan merupakan wewenang ${lapis1.jalur_hukum || 'Mahkamah Agung (MA)'}.`;
    } else if (lapis2 && lapis2.status === 'gagal_total') {
      alasanPenolakan = `Permohonan ditolak karena Tidak Memiliki Kedudukan Hukum (Legal Standing): ${lapis2.penjelasan}.`;
    } else if (reconciledAssessment.ringkasan_untuk_user) {
      alasanPenolakan = reconciledAssessment.ringkasan_untuk_user;
    }

    const error = new Error(`GENERATION_REJECTED: ${alasanPenolakan}`);
    (error as any).status = 422;
    (error as any).code = 'PETITION_NOT_ELIGIBLE';
    (error as any).reconciledAssessment = reconciledAssessment;
    throw error;
  }

  const docId = `doc-mk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();
  const dateFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(now);

  const defaultIdentity: PetitionerIdentity = {
    nama_lengkap: petitionerInput?.nama_lengkap || 'Warga Pemohon Konstitusi',
    nik: petitionerInput?.nik || '3171012345670001',
    tempat_tanggal_lahir: petitionerInput?.tempat_tanggal_lahir || 'Jakarta, 17 Agustus 1990',
    pekerjaan: petitionerInput?.pekerjaan || 'Karyawan Swasta / Pekerja / Warga Negara',
    alamat_lengkap: petitionerInput?.alamat_lengkap || 'Jl. Keadilan Rakyat No. 45, Jakarta Pusat, DKI Jakarta',
    nomor_kontak: petitionerInput?.nomor_kontak || '0812-3456-7890',
    email: petitionerInput?.email || 'pemohon@rakyatmenggugat.id',
    kategori_pemohon: petitionerInput?.kategori_pemohon || 'Perorangan Warga Negara Indonesia'
  };

  const retrieved = retrieveRelevantLegalKnowledge(caseFacts, 8);

  // Extract layer specific advice / warnings if status is perlu_data_tambahan
  let positaWarning: string | null = null;
  if (reconciledAssessment) {
    const lapis4 = reconciledAssessment.layers.find(l => l.lapis_ke === 4);
    if (lapis4 && (lapis4.status === 'perlu_perbaikan' || lapis4.status === 'perlu_data_tambahan')) {
      positaWarning = `CATATAN REKOMENDASI PERBAIKAN POSITA DARI ASESMEN HUKUM:\n${lapis4.penjelasan} ${lapis4.saran_perbaikan ? `\nSaran Tindakan: ${lapis4.saran_perbaikan}` : ''}`;
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Anda adalah Ahli Perancang Dokumen Hukum Konstitusi (Constitutional Drafter) Mahkamah Konstitusi Republik Indonesia.
Tugas Anda adalah merumuskan berkas permohonan "Buku I Permohonan Pengujian Undang-Undang" dan "Daftar Alat Bukti" yang baku, presisi, dan sesuai dengan Peraturan Mahkamah Konstitusi (PMK) No. 2 Tahun 2021.

Fakta Kasus Pemohon:
"""
${caseFacts}
"""

${reconciledAssessment ? `Catatan Asesmen Awal:
- Hasil Asesmen: ${reconciledAssessment.hasil_akhir}
- Catatan Posita/Standing: ${positaWarning || 'Fakta telah dianalisis secara hukum.'}
` : ''}

Identitas Pemohon:
- Nama: ${defaultIdentity.nama_lengkap}
- Pekerjaan: ${defaultIdentity.pekerjaan}
- Alamat: ${defaultIdentity.alamat_lengkap}
- Kategori: ${defaultIdentity.kategori_pemohon}

Rujukan Hukum Tersedia:
${retrieved.map(r => `- [${r.nomor}] ${r.judul}: ${r.isi_teks}`).join('\n')}

Hasilkan HANYA JSON murni yang terstruktur valid dengan skema:
{
  "judul_permohonan": "Permohonan Pengujian Materiil Undang-Undang ... terhadap UUD 1945",
  "kewenangan_mk": {
    "dasar_hukum": ["Pasal 24C ayat (1) UUD 1945", "Pasal 10 ayat (1) UU MK", "Pasal 29 UU Kekuasaan Kehakiman"],
    "uraian_kewenangan": "Uraian yuridis kewenangan MK..."
  },
  "kedudukan_hukum": {
    "dasar_hukum": ["Pasal 51 ayat (1) UU MK", "Putusan MK No. 006/PUU-III/2005"],
    "uraian_5_syarat_standing": {
      "syarat_1_hak_konstitusional": "Hak konstitusional pemohon yang dijamin...",
      "syarat_2_kerugian_spesifik": "Uraian kerugian spesifik dan khusus...",
      "syarat_3_kerugian_aktual_potensial": "Kerugian bersifat aktual/potensial wajar...",
      "syarat_4_causal_verband": "Hubungan kausalitas sebab akibat...",
      "syarat_5_efek_pemulihan": "Pemulihan hak apabila norma dibatalkan..."
    },
    "kesimpulan_standing": "Kesimpulan bahwa pemohon memiliki legal standing yang sah."
  },
  "posita": {
    "latar_belakang_fakta": "Uraian kronologis latar belakang fakta...",
    "norma_yang_diuji": {
      "undang_undang": "Nama dan Nomor UU yang diuji",
      "pasal_ayat": "Pasal dan ayat yang diuji",
      "bunyi_norma": "Kutipan bunyi teks norma pasal yang diuji"
    },
    "batu_uji_uud_1945": [
      {
        "pasal": "Pasal 28D ayat (1) UUD 1945",
        "bunyi_pasal": "Bunyi pasal batu uji",
        "analisis_pertentangan": "Analisis spesifik mengapa norma UU melanggar pasal ini"
      }
    ],
    "analisis_pertentangan_komprehensif": "Analisis penalaran hukum mendalam pertentangan norma...",
    "penegasan_ne_bis_in_idem": "Penegasan pemenuhan Pasal 60 UU MK bahwa permohonan ini belum pernah diputus atau memiliki dasar pengujian berbeda."
  },
  "petitum": {
    "primair": [
      "Mengabulkan permohonan Pemohon untuk seluruhnya;",
      "Menyatakan Pasal [...] Undang-Undang [...] bertentangan dengan Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 dan tidak mempunyai kekuatan hukum mengikat;",
      "Memerintahkan pemuatan putusan ini dalam Berita Negara Republik Indonesia."
    ],
    "subsidair": "Atau apabila Mahkamah Konstitusi berpendapat lain, mohon putusan yang seadil-adilnya (ex aequo et bono)."
  },
  "daftar_alat_bukti": [
    {
      "kode_bukti": "Bukti P-1",
      "nama_dokumen": "Fotokopi Kartu Tanda Penduduk (KTP) Pemohon",
      "kategori": "Identitas Diri",
      "keterangan_pembuktian": "Membuktikan kedudukan pemohon sebagai WNI perorangan.",
      "status_materai_pos": "Wajib Legalisasi/Pemeteraian di Kantor Pos"
    },
    {
      "kode_bukti": "Bukti P-2",
      "nama_dokumen": "Salinan Lembaran Negara Undang-Undang yang diuji",
      "kategori": "Undang-Undang / Peraturan",
      "keterangan_pembuktian": "Membuktikan objek norma hukum yang diuji.",
      "status_materai_pos": "Dokumen Resmi Negara"
    },
    {
      "kode_bukti": "Bukti P-3",
      "nama_dokumen": "Dokumen Bukti Kerugian Faktual Pemohon",
      "kategori": "Fakta Kerugian",
      "keterangan_pembuktian": "Membuktikan adanya kerugian langsung yang dialami pemohon akibat berlakunya norma.",
      "status_materai_pos": "Wajib Legalisasi/Pemeteraian di Kantor Pos"
    }
  ]
}Raw JSON only:`;

      const { text } = await generateGeminiContentWithRetry(prompt, {
        preferredModel: 'gemini-3.7-flash',
        config: {
          responseMimeType: 'application/json',
          temperature: 0.15,
        }
      });

      const parsed = JSON.parse(text || '{}');

      if (parsed.judul_permohonan && parsed.posita && parsed.petitum) {
        return assembleFinalDocument(docId, dateFormatted, defaultIdentity, parsed, reconciledAssessment, positaWarning, caseFacts);
      }
    } catch (err) {
      console.warn('Gemini Document Drafter error, using deterministic legal drafting template:', err);
    }
  }

  // Deterministic Legal Document Generator Fallback
  return generateDeterministicConstitutionalPetition(caseFacts, docId, dateFormatted, defaultIdentity, retrieved, reconciledAssessment, positaWarning);
}

function assembleFinalDocument(
  docId: string,
  dateFormatted: string,
  identity: PetitionerIdentity,
  parsed: any,
  reconciledAssessment?: ReconciledAssessmentResult,
  positaWarning?: string | null,
  caseFacts: string = ''
): ConstitutionalPetitionDocument {
  // If there's an assessment with warnings or suggestions, ensure posita reflects it clearly
  const finalPosita = { ...parsed.posita };
  if (positaWarning) {
    finalPosita.analisis_pertentangan_komprehensif = `[CATATAN KRITIS TIM ASESMEN: Terdapat catatan kelemahan argumentasi yang perlu diperhatikan sebelum diajukan ke MK: ${positaWarning}]\n\n${finalPosita.analisis_pertentangan_komprehensif || ''}`;
  }

  return {
    id: docId,
    case_id: docId,
    created_at: new Date().toISOString(),
    nomor_perkara_internal: `RM/PUU/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    judul_permohonan: parsed.judul_permohonan || 'Permohonan Pengujian Materiil Undang-Undang terhadap UUD 1945',
    mahkamah_tujuan: 'Kepada Yth. Ketua Mahkamah Konstitusi Republik Indonesia\nJalan Medan Merdeka Barat No. 6, Gambir, Jakarta Pusat 10110',
    tanggal_surat: `Jakarta, ${dateFormatted}`,
    status_kelayakan: reconciledAssessment?.hasil_akhir || 'layak',
    peringatan_kelayakan: reconciledAssessment?.hasil_akhir === 'perlu_data_tambahan' 
      ? 'Draf ini disusun dengan catatan status "Perlu Data Tambahan/Perbaikan". Mohon cermati catatan rekomendasi perbaikan pada bagian Posita.'
      : null,
    catatan_kelemahan_posita: positaWarning,
    identitas_pemohon: identity,
    kewenangan_mk: parsed.kewenangan_mk || {
      dasar_hukum: ['Pasal 24C ayat (1) UUD 1945', 'Pasal 10 ayat (1) UU No. 24/2003 jo. UU No. 7/2020', 'Pasal 29 ayat (1) UU No. 48/2009'],
      uraian_kewenangan: 'Mahkamah Konstitusi berwenang mengadili pada tingkat pertama dan terakhir yang putusannya bersifat final untuk menguji undang-undang terhadap Undang-Undang Dasar.'
    },
    kedudukan_hukum: parsed.kedudukan_hukum,
    posita: finalPosita,
    petitum: parsed.petitum,
    daftar_alat_bukti: parsed.daftar_alat_bukti || getDynamicEvidenceList(caseFacts, identity.nama_lengkap),
    panduan_pendaftaran: getRegistrationGuide()
  };
}

function generateDeterministicConstitutionalPetition(
  caseFacts: string,
  docId: string,
  dateFormatted: string,
  identity: PetitionerIdentity,
  retrieved: any[],
  reconciledAssessment?: ReconciledAssessmentResult,
  positaWarning?: string | null
): ConstitutionalPetitionDocument {
  const lower = caseFacts.toLowerCase();

  // Detect domain
  const isLabor = lower.includes('buruh') || lower.includes('pekerja') || lower.includes('upah') || lower.includes('phk') || lower.includes('outsourcing') || lower.includes('pesangon');
  const isEnv = lower.includes('lingkungan') || lower.includes('tambang') || lower.includes('polusi') || lower.includes('limbah') || lower.includes('sehat');
  const isSpeech = lower.includes('pendapat') || lower.includes('bicara') || lower.includes('ite') || lower.includes('ekspresi') || lower.includes('demonstrasi');
  const isEdu = lower.includes('pendidikan') || lower.includes('guru') || lower.includes('sekolah') || lower.includes('kuliah') || lower.includes('ukt') || lower.includes('honorer');
  const isAdat = lower.includes('adat') || lower.includes('ulayat') || lower.includes('hutan');

  let uuName = 'Undang-Undang Terkait Hak Warga Negara';
  let uuPasal = 'Pasal yang membatasi hak konstitusional';
  let uuBunyi = `Ketentuan norma hukum yang menjadi pokok keberatan Pemohon sebagaimana termaktub dalam fakta perkara.`;

  if (isLabor) {
    uuName = 'Undang-Undang Nomor 6 Tahun 2023 tentang Penetapan Peraturan Pemerintah Pengganti Undang-Undang Nomor 2 Tahun 2022 tentang Cipta Kerja Menjadi Undang-Undang';
    uuPasal = 'Klaster Ketenagakerjaan (Pasal tentang Alih Daya, Pemutusan Hubungan Kerja, dan Kompensasi Upah)';
    uuBunyi = '"Pengaturan mengenai pembatasan jenis pekerjaan alih daya serta tata cara kompensasi upah minimum dan pesangon yang tidak memberikan kepastian jaminan kelangsungan hidup layak bagi pekerja."';
  } else if (isEdu) {
    uuName = 'Undang-Undang Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional / Undang-Undang Aparatur Sipil Negara';
    uuPasal = 'Pasal mengenai Rekrutmen, Status Kepegawaian, dan Standar Kesejahteraan Tenaga Pendidik';
    uuBunyi = '"Ketentuan sistem rekruitmen dan formasi kepegawaian pendidik yang tidak memberikan jaminan perlindungan status kerja dan upah layak bagi tenaga pendidik honorer yang telah mengabdi puluhan tahun."';
  } else if (isEnv) {
    uuName = 'Undang-Undang Nomor 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup jo. UU Cipta Kerja';
    uuPasal = 'Pasal mengenai AMDAL dan Izin Lingkungan Kegiatan Usaha';
    uuBunyi = '"Ketentuan penyederhanaan izin lingkungan yang mereduksi hak partisipasi masyarakat terdampak langsung terhadap penilaian analisis mengenai dampak lingkungan."';
  } else if (isSpeech) {
    uuName = 'Undang-Undang Nomor 1 Tahun 2024 tentang Perubahan Kedua atas UU Nomor 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik';
    uuPasal = 'Pasal 27A jo. Pasal 45 ayat (4) tentang Pencemaran Nama Baik / Menyerang Kehormatan di Ruang Digital';
    uuBunyi = '"Setiap Orang yang dengan sengaja menyerang kehormatan atau nama baik orang lain dengan cara menuduhkan suatu hal melalui Sistem Elektronik..."';
  }

  const batuUjiList = [];
  if (isLabor || isEdu) {
    batuUjiList.push(
      {
        pasal: 'Pasal 28D ayat (1) UUD 1945',
        bunyi_pasal: 'Setiap orang berhak atas pengakuan, jaminan, perlindungan, dan kepastian hukum yang adil serta perlakuan yang sama di hadapan hukum.',
        analisis_pertentangan: 'Norma yang diuji melanggar prinsip kepastian hukum yang adil (rechtszekerheid) dan menciptakan ketidakadilan sistemik bagi Pemohon.'
      },
      {
        pasal: 'Pasal 28D ayat (2) UUD 1945',
        bunyi_pasal: 'Setiap orang berhak untuk bekerja serta mendapat imbalan dan perlakuan yang adil dan layak dalam hubungan kerja.',
        analisis_pertentangan: 'Norma yang diuji menghilangkan hak konstitusional Pemohon untuk memperoleh perlakuan yang adil dan imbalan yang layak dalam hubungan kerja yang bermartabat.'
      },
      {
        pasal: 'Pasal 27 ayat (2) UUD 1945',
        bunyi_pasal: 'Tiap-tiap warga negara berhak atas pekerjaan dan penghidupan yang layak bagi kemanusiaan.',
        analisis_pertentangan: 'Norma yang diuji mengabaikan tanggung jawab negara dalam memastikan penghidupan yang layak bagi kemanusiaan bagi setiap warga negaranya.'
      }
    );
  } else if (isEnv) {
    batuUjiList.push(
      {
        pasal: 'Pasal 28H ayat (1) UUD 1945',
        bunyi_pasal: 'Setiap orang berhak hidup sejahtera lahir dan batin, bertempat tinggal, dan mendapatkan lingkungan hidup yang baik dan sehat serta berhak memperoleh pelayanan kesehatan.',
        analisis_pertentangan: 'Norma yang diuji mereduksi instrumen proteksi lingkungan hidup yang baik dan sehat yang merupakan hak asasi yang tidak dapat dikurangi.'
      },
      {
        pasal: 'Pasal 33 ayat (4) UUD 1945',
        bunyi_pasal: 'Perekonomian nasional diselenggarakan berdasar atas demokrasi ekonomi dengan prinsip kebersamaan, efisiensi berkeadilan, berkelanjutan, berwawasan lingkungan...',
        analisis_pertentangan: 'Norma hukum bertentangan dengan prinsip pembangunan berkelanjutan berwawasan lingkungan dan efisiensi berkeadilan.'
      }
    );
  } else {
    batuUjiList.push(
      {
        pasal: 'Pasal 28D ayat (1) UUD 1945',
        bunyi_pasal: 'Setiap orang berhak atas pengakuan, jaminan, perlindungan, dan kepastian hukum yang adil serta perlakuan yang sama di hadapan hukum.',
        analisis_pertentangan: 'Norma yang dipersoalkan mengandung ambiguitas dan ketidakpastian hukum yang merugikan hak konstitusional Pemohon.'
      },
      {
        pasal: 'Pasal 1 ayat (3) UUD 1945',
        bunyi_pasal: 'Negara Indonesia adalah negara hukum.',
        analisis_pertentangan: 'Sebagai negara hukum, setiap produk legislasi tidak boleh melanggar hak-hak fundamental warga negara yang dijamin oleh konstitusi tertinggi.'
      }
    );
  }

  let analisisYuridis = `Bahwa norma yang dimohonkan pengujian materiil terbukti bertentangan secara diametral dengan jaminan hak asasi manusia dan prinsip negara hukum yang diatur dalam UUD 1945. Norma a quo telah menciptakan kekosongan perlindungan hukum yang adil dan bertentangan dengan doktrin keadilan substantif (substantive justice). Oleh karena itu, sudah sepatutnya Mahkamah Konstitusi menyatakan norma tersebut inkonstitusional.`;

  if (positaWarning) {
    analisisYuridis = `[CATATAN ASESMEN: ${positaWarning}]\n\n${analisisYuridis}`;
  }

  return {
    id: docId,
    case_id: docId,
    created_at: new Date().toISOString(),
    nomor_perkara_internal: `RM/PUU/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
    judul_permohonan: `Permohonan Pengujian Materiil ${uuName} terhadap Undang-Undang Dasar Negara Republik Indonesia Tahun 1945`,
    mahkamah_tujuan: 'Kepada Yth. Ketua Mahkamah Konstitusi Republik Indonesia\nJalan Medan Merdeka Barat No. 6, Gambir, Jakarta Pusat 10110',
    tanggal_surat: `Jakarta, ${dateFormatted}`,
    status_kelayakan: reconciledAssessment?.hasil_akhir || 'layak',
    peringatan_kelayakan: reconciledAssessment?.hasil_akhir === 'perlu_data_tambahan'
      ? 'Draf ini disusun dengan status Perlu Penguatan/Data Tambahan. Cermati catatan pada Posita.'
      : null,
    catatan_kelemahan_posita: positaWarning,
    identitas_pemohon: identity,
    kewenangan_mk: {
      dasar_hukum: [
        'Pasal 24C ayat (1) Undang-Undang Dasar Negara Republik Indonesia Tahun 1945',
        'Pasal 10 ayat (1) huruf a Undang-Undang Nomor 24 Tahun 2003 tentang Mahkamah Konstitusi sebagaimana telah diubah terakhir dengan Undang-Undang Nomor 7 Tahun 2020',
        'Pasal 29 ayat (1) huruf a Undang-Undang Nomor 48 Tahun 2009 tentang Kekuasaan Kehakiman'
      ],
      uraian_kewenangan: 'Berdasarkan ketentuan Pasal 24C ayat (1) UUD 1945 jo. Pasal 10 ayat (1) huruf a UU Mahkamah Konstitusi, Mahkamah Konstitusi berwenang mengadili pada tingkat pertama dan terakhir yang putusannya bersifat final untuk menguji undang-undang terhadap Undang-Undang Dasar. Bahwa objek permohonan a quo adalah norma abstrak tingkat Undang-Undang, sehingga Mahkamah Konstitusi berwenang penuh secara absolut untuk memeriksa, mengadili, dan memutus permohonan ini.'
    },
    kedudukan_hukum: {
      dasar_hukum: [
        'Pasal 51 ayat (1) Undang-Undang Nomor 24 Tahun 2003 tentang Mahkamah Konstitusi',
        'Doktrin 5 Syarat Kerugian Konstitusional dalam Putusan MK No. 006/PUU-III/2005 dan Putusan MK No. 011/PUU-V/2007'
      ],
      uraian_5_syarat_standing: {
        syarat_1_hak_konstitusional: `Pemohon memiliki hak konstitusional yang dijamin secara tegas dalam UUD 1945, antara lain hak atas kepastian hukum yang adil (Pasal 28D ayat 1) dan hak atas penghidupan serta perlakuan kerja yang layak (Pasal 27 ayat 2 dan Pasal 28D ayat 2).`,
        syarat_2_kerugian_spesifik: `Pemohon mengalami kerugian hak konstitusional yang bersifat spesifik (khusus) dan nyata/aktual akibat berlakunya ketentuan ${uuPasal} yang membatasi hak dan kepastian hukum Pemohon.`,
        syarat_3_kerugian_aktual_potensial: `Kerugian tersebut bersifat aktual (telah dialami secara nyata oleh Pemohon) atau setidak-tidaknya potensial yang menurut penalaran yang wajar dapat dipastikan akan terjadi secara berkelanjutan apabila norma ini tetap berlaku.`,
        syarat_4_causal_verband: `Terdapat hubungan sebab-akibat langsung (causal verband) yang tak terbantahkan antara berlakunya ketentuan norma pasal undang-undang yang diuji dengan kerugian hak konstitusional yang diderita oleh Pemohon.`,
        syarat_5_efek_pemulihan: `Apabila permohonan Pemohon dikabulkan oleh Mahkamah Konstitusi dengan menyatakan norma a quo bertentangan dengan UUD 1945 dan tidak mempunyai kekuatan hukum mengikat, maka kerugian hak konstitusional yang dialami Pemohon tidak akan atau tidak lagi terjadi.`
      },
      kesimpulan_standing: `Berdasarkan uraian pemenuhan 5 syarat kumulatif di atas, Pemohon terbukti secara sah memiliki kedudukan hukum (legal standing) sebagai Pemohon Pengujian Undang-Undang di Mahkamah Konstitusi.`
    },
    posita: {
      latar_belakang_fakta: `Bahwa Pemohon mengajukan permohonan ini berdasarkan fakta-fakta konkret sebagai berikut:\n"${caseFacts}"\n\nBahwa keberlakuan norma tersebut telah menimbulkan ketidakpastian hukum dan mendiskriminasi posisi Pemohon sebagai warga negara yang berhak atas perlindungan konstitusional tertinggi.`,
      norma_yang_diuji: {
        undang_undang: uuName,
        pasal_ayat: uuPasal,
        bunyi_norma: uuBunyi
      },
      batu_uji_uud_1945: batuUjiList,
      analisis_pertentangan_komprehensif: analisisYuridis,
      penegasan_ne_bis_in_idem: `Bahwa permohonan a quo memenuhi ketentuan Pasal 60 UU Mahkamah Konstitusi serta Pasal 78 PMK No. 2 Tahun 2021 mengenai asas Ne Bis In Idem, karena pokok permohonan, dasar argumentasi konstitusional, dan alat bukti kerugian faktual yang diajukan oleh Pemohon memiliki alasan konstitusionalitas yang berbeda secara fundamental dari perkara yang pernah diputus sebelumnya.`
    },
    petitum: {
      primair: [
        '1. Mengabulkan permohonan Pemohon untuk seluruhnya;',
        `2. Menyatakan ketentuan ${uuPasal} dalam ${uuName} bertentangan dengan Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 dan tidak mempunyai kekuatan hukum mengikat;`,
        '3. Memerintahkan pemuatan putusan ini dalam Berita Negara Republik Indonesia sebagaimana mestinya.'
      ],
      subsidair: 'Atau apabila Yang Mulia Majelis Hakim Mahkamah Konstitusi Republik Indonesia berpendapat lain, mohon putusan yang seadil-adilnya (ex aequo et bono).'
    },
    daftar_alat_bukti: getDynamicEvidenceList(caseFacts, identity.nama_lengkap),
    panduan_pendaftaran: getRegistrationGuide()
  };
}

function getDynamicEvidenceList(caseFacts: string, namaPemohon: string): EvidenceItem[] {
  const matrix = generateDynamicEvidenceMatrix('doc-gen', caseFacts, namaPemohon);
  return matrix.items.map(item => {
    let kategori: 'Identitas Diri' | 'Undang-Undang / Peraturan' | 'Fakta Kerugian' | 'Kajian / Doktrin / Yurisprudensi' = 'Fakta Kerugian';
    if (item.kategori === 'legal_standing') kategori = 'Identitas Diri';
    else if (item.kategori === 'objek_pengujian') kategori = 'Undang-Undang / Peraturan';
    else if (item.kategori === 'doktrin_ahli') kategori = 'Kajian / Doktrin / Yurisprudensi';

    let statusMaterai: 'Wajib Legalisasi/Pemeteraian di Kantor Pos' | 'Dokumen Resmi Negara' | 'Dokumen Pendukung' = 'Wajib Legalisasi/Pemeteraian di Kantor Pos';
    if (item.syarat_legalisasi?.includes('Resmi')) statusMaterai = 'Dokumen Resmi Negara';
    else if (item.syarat_legalisasi?.includes('Pendukung') || item.syarat_legalisasi?.includes('Akademik')) statusMaterai = 'Dokumen Pendukung';

    return {
      kode_bukti: item.kode.startsWith('Bukti') ? item.kode : `Bukti ${item.kode}`,
      nama_dokumen: item.deskripsi,
      kategori,
      keterangan_pembuktian: `${item.posita_dalil_terkait ? `${item.posita_dalil_terkait}: ` : ''}${item.relevansi_hukum}`,
      status_materai_pos: statusMaterai
    };
  });
}

function getRegistrationGuide() {
  return {
    tata_cara_legalisasi_pos: 'Seluruh alat bukti surat fotokopi (khususnya Bukti P-1, P-3, dan seterusnya) WAJIB dibubuhi meterai tempel Rp10.000,- dan dicap legalisir di Kantor Pos Besar (proses legalisasi/pemeteraian di Kantor Pos sesuai UU Bea Meterai) sebelum diserahkan pada sidang pemeriksaan pendahuluan.',
    prosedur_online_simpel_mk: 'Pemohon dapat mendaftarkan permohonan secara daring 24/7 melalui portal Sistem Informasi Manajemen Pelayanan Elektronik Mahkamah Konstitusi (SIMPEL MK) di laman: https://simpel.mkri.id dengan mengunggah berkas Permohonan (PDF & Word DOCX) dan identitas diri.',
    prosedur_offline_kepaniteraan: 'Pendaftaran langsung dapat dilakukan di Loket Pelayanan Terpadu Satu Pintu (PTSP) Kepaniteraan MK di Gedung Mahkamah Konstitusi RI, Jalan Medan Merdeka Barat No. 6, Jakarta Pusat (Senin - Jumat, pukul 08.00 - 16.00 WIB).',
    jumlah_rangkap_berkas: 'Berdasarkan PMK No. 2/2021, permohonan fisik wajib dicetak sebanyak 1 (satu) berkas asli bertanda tangan asli basah di atas meterai Rp10.000,- dan 11 (sebelas) salinan rangkap untuk 9 Hakim Konstitusi, Panitera, dan Arsip MK.'
  };
}

/**
 * Generates binary Buffer for .docx download using docx npm package
 */
export async function generateDocxBuffer(doc: ConstitutionalPetitionDocument): Promise<Buffer> {
  const docxDoc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt
            color: '000000',
          },
          paragraph: {
            spacing: {
              line: 360, // 1.5 lines spacing
              before: 120,
              after: 120,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 2268,    // 4 cm (standard MK drafting)
              bottom: 1701, // 3 cm
              left: 2268,   // 4 cm
              right: 1701,  // 3 cm
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `Mahkamah Konstitusi RI | Permohonan Uji Materiil (${doc.nomor_perkara_internal})`,
                    italics: true,
                    size: 18,
                    color: '555555',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: ['Halaman ', PageNumber.CURRENT, ' dari ', PageNumber.TOTAL_PAGES],
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Header / Date & Recipient
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: doc.tanggal_surat,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Hal: ', bold: true }),
              new TextRun({
                text: doc.judul_permohonan,
                bold: true,
              }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Kepada Yang Mulia:\nKetua Mahkamah Konstitusi Republik Indonesia\nJalan Medan Merdeka Barat No. 6, Jakarta Pusat 10110', bold: true }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Dengan hormat,\nYang bertanda tangan di bawah ini:', bold: true }),
            ],
          }),

          // Identitas Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createTableRow('Nama Lengkap', `: ${doc.identitas_pemohon.nama_lengkap}`),
              createTableRow('NIK / Nomor KTP', `: ${doc.identitas_pemohon.nik}`),
              createTableRow('Tempat / Tgl Lahir', `: ${doc.identitas_pemohon.tempat_tanggal_lahir}`),
              createTableRow('Pekerjaan / Profesi', `: ${doc.identitas_pemohon.pekerjaan}`),
              createTableRow('Alamat Lengkap', `: ${doc.identitas_pemohon.alamat_lengkap}`),
              createTableRow('Nomor Kontak / HP', `: ${doc.identitas_pemohon.nomor_kontak}`),
              createTableRow('Alamat Surat Elektronik', `: ${doc.identitas_pemohon.email}`),
              createTableRow('Kualifikasi Pemohon', `: ${doc.identitas_pemohon.kategori_pemohon}`),
            ],
          }),

          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Selanjutnya disebut sebagai ------------------------------------------------------------- PEMOHON;',
                bold: true,
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Dengan ini Pemohon mengajukan permohonan pengujian materiil terhadap ${doc.posita.norma_yang_diuji.undang_undang} terhadap Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, dengan mendasarkan pada dalil-dalil dan uraian argumentasi hukum sebagai berikut:`,
              }),
            ],
          }),

          // SECTION I: KEWENANGAN MAHKAMAH KONSTITUSI
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: 'I. KEWENANGAN MAHKAMAH KONSTITUSI',
                bold: true,
              }),
            ],
          }),
          ...doc.kewenangan_mk.dasar_hukum.map((dh, idx) =>
            new Paragraph({
              children: [new TextRun({ text: `${idx + 1}. Bahwa berdasarkan ${dh};` })],
            })
          ),
          new Paragraph({
            children: [new TextRun({ text: doc.kewenangan_mk.uraian_kewenangan })],
          }),

          // SECTION II: KEDUDUKAN HUKUM (LEGAL STANDING)
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: 'II. KEDUDUKAN HUKUM (LEGAL STANDING) PEMOHON',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Bahwa Pasal 51 ayat (1) UU MK mengatur bahwa Pemohon adalah pihak yang menganggap hak dan/atau kewenangan konstitusionalnya dirugikan oleh berlakunya undang-undang. Doktrin Mahkamah Konstitusi (Putusan No. 006/PUU-III/2005) mensyaratkan 5 parameter kumulatif kerugian hak konstitusional, yang dipenuhi Pemohon sebagai berikut:',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Adanya Hak Konstitusional Pemohon: ', bold: true }),
              new TextRun({ text: doc.kedudukan_hukum.uraian_5_syarat_standing.syarat_1_hak_konstitusional }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Kerugian Hak yang Spesifik: ', bold: true }),
              new TextRun({ text: doc.kedudukan_hukum.uraian_5_syarat_standing.syarat_2_kerugian_spesifik }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. Kerugian Bersifat Aktual / Potensial: ', bold: true }),
              new TextRun({ text: doc.kedudukan_hukum.uraian_5_syarat_standing.syarat_3_kerugian_aktual_potensial }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '4. Hubungan Kausalitas (Causal Verband): ', bold: true }),
              new TextRun({ text: doc.kedudukan_hukum.uraian_5_syarat_standing.syarat_4_causal_verband }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '5. Pemulihan Kerugian Apabila Dikabulkan: ', bold: true }),
              new TextRun({ text: doc.kedudukan_hukum.uraian_5_syarat_standing.syarat_5_efek_pemulihan }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: doc.kedudukan_hukum.kesimpulan_standing, italics: true }),
            ],
          }),

          // SECTION III: POKOK PERMOHONAN (POSITA)
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: 'III. ALASAN-ALASAN PERMOHONAN (POSITA)',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'A. Latar Belakang Fakta dan Duduk Perkara\n', bold: true }),
              new TextRun({ text: doc.posita.latar_belakang_fakta }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '\nB. Norma Undang-Undang yang Dimohonkan Pengujian\n', bold: true }),
              new TextRun({ text: `Ketentuan ${doc.posita.norma_yang_diuji.pasal_ayat} dalam ${doc.posita.norma_yang_diuji.undang_undang} yang berbunyi:\n` }),
              new TextRun({ text: doc.posita.norma_yang_diuji.bunyi_norma, italics: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '\nC. Batu Uji Konstitusional (UUD 1945) dan Analisis Pertentangan Norma\n', bold: true }),
            ],
          }),
          ...doc.posita.batu_uji_uud_1945.flatMap(bu => [
            new Paragraph({
              children: [
                new TextRun({ text: `* Batu Uji: ${bu.pasal}\n`, bold: true }),
                new TextRun({ text: `"${bu.bunyi_pasal}"\n`, italics: true }),
                new TextRun({ text: `Analisis Pertentangan: ${bu.analisis_pertentangan}` }),
              ],
            }),
          ]),
          new Paragraph({
            children: [
              new TextRun({ text: '\nD. Analisis Yuridis Komprehensif\n', bold: true }),
              new TextRun({ text: doc.posita.analisis_pertentangan_komprehensif }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '\nE. Pemenuhan Asas Ne Bis In Idem (Pasal 60 UU MK)\n', bold: true }),
              new TextRun({ text: doc.posita.penegasan_ne_bis_in_idem }),
            ],
          }),

          // SECTION IV: PETITUM
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [
              new TextRun({
                text: 'IV. PETITUM (HAL-HAL YANG DIMOHONKAN)',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Berdasarkan seluruh dalil-dalil hukum, fakta empiris, dan argumentasi konstitusional yang telah diuraikan di atas, Pemohon memohon kepada Yang Mulia Majelis Hakim Mahkamah Konstitusi Republik Indonesia berkenan memeriksa dan menjatuhkan putusan sebagai berikut:',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'PRIMAIR:', bold: true }),
            ],
          }),
          ...doc.petitum.primair.map(p =>
            new Paragraph({
              children: [new TextRun({ text: p })],
            })
          ),
          new Paragraph({
            children: [
              new TextRun({ text: 'SUBSIDAIR:', bold: true }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: doc.petitum.subsidair, italics: true })],
          }),

          // SIGNATURE BLOCK
          new Paragraph({ text: '' }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: `Hormat Kami,\nPEMOHON,\n\n\n[Materai Rp 10.000,-]\n\n\n` }),
              new TextRun({ text: `(${doc.identitas_pemohon.nama_lengkap})`, bold: true, underline: {} }),
            ],
          }),

          // PAGE BREAK / BUKU II DAFTAR BUKTI
          new Paragraph({ text: '' }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'LAMPIRAN: DAFTAR ALAT BUKTI (BUKU BUKTI)',
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Dalam Perkara Pengujian ${doc.posita.norma_yang_diuji.undang_undang} terhadap UUD 1945`,
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Evidence Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('No / Kode', 15),
                  createHeaderCell('Nama Dokumen / Alat Bukti', 35),
                  createHeaderCell('Keterangan Pokok Pembuktian', 35),
                  createHeaderCell('Status Materai', 15),
                ],
              }),
              ...doc.daftar_alat_bukti.map(b =>
                new TableRow({
                  children: [
                    createTableCell(b.kode_bukti, 15, true),
                    createTableCell(b.nama_dokumen, 35),
                    createTableCell(b.keterangan_pembuktian, 35),
                    createTableCell(b.status_materai_pos, 15),
                  ],
                })
              ),
            ],
          }),

          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Catatan Pemeteraian & Registrasi Mahkamah Konstitusi:\n', bold: true }),
              new TextRun({ text: `* ${doc.panduan_pendaftaran.tata_cara_legalisasi_pos}\n` }),
              new TextRun({ text: `* ${doc.panduan_pendaftaran.prosedur_online_simpel_mk}\n` }),
              new TextRun({ text: `* ${doc.panduan_pendaftaran.jumlah_rangkap_berkas}` }),
            ],
          }),
        ],
      },
    ],
  });

  const { Packer } = await import('docx');
  return await Packer.toBuffer(docxDoc);
}

function createTableRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
        children: [new Paragraph({ children: [new TextRun({ text: value })] })],
      }),
    ],
  });
}

function createHeaderCell(text: string, widthPercent: number): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
  });
}

function createTableCell(text: string, widthPercent: number, bold: boolean = false): TableCell {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text, bold })] })],
  });
}

/**
 * Returns formatted HTML for print-to-pdf styling
 */
export function generatePrintHtml(doc: ConstitutionalPetitionDocument): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${doc.judul_permohonan}</title>
  <style>
    @page {
      size: A4;
      margin: 40mm 30mm 30mm 40mm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 20px;
    }
    .header-doc {
      text-align: right;
      font-size: 10pt;
      color: #4b5563;
      border-bottom: 1px solid #d1d5db;
      padding-bottom: 8px;
      margin-bottom: 24px;
    }
    .title-box {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      text-align: center;
      margin-top: 24px;
      margin-bottom: 12px;
      text-transform: uppercase;
      border-bottom: 1.5px solid #111827;
      padding-bottom: 4px;
    }
    .identitas-table, .evidence-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 11pt;
    }
    .identitas-table td {
      padding: 4px 8px;
      vertical-align: top;
    }
    .evidence-table th, .evidence-table td {
      border: 1px solid #374151;
      padding: 8px;
      text-align: left;
    }
    .evidence-table th {
      background-color: #f3f4f6;
      font-weight: bold;
    }
    .quote-box {
      margin: 12px 24px;
      padding: 8px 16px;
      background-color: #f9fafb;
      border-left: 3px solid #4b5563;
      font-style: italic;
    }
    .signature-box {
      margin-top: 40px;
      text-align: right;
      page-break-inside: avoid;
    }
    .stamp-area {
      display: inline-block;
      border: 1px dashed #9ca3af;
      padding: 16px 24px;
      margin: 12px 0;
      color: #6b7280;
      font-size: 9pt;
      text-align: center;
    }
    .page-break {
      page-break-before: always;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header-doc">
    MAHKAMAH KONSTITUSI REPUBLIK INDONESIA | PERMOHONAN PENGUJIAN UNDANG-UNDANG
  </div>

  <div style="text-align: right; font-weight: bold; margin-bottom: 16px;">
    ${doc.tanggal_surat}
  </div>

  <div class="title-box">
    <strong>Hal:</strong> ${doc.judul_permohonan}
  </div>

  <p>
    <strong>Kepada Yang Mulia:</strong><br>
    Ketua Mahkamah Konstitusi Republik Indonesia<br>
    Jalan Medan Merdeka Barat No. 6, Gambir, Jakarta Pusat 10110
  </p>

  <p>Dengan hormat,<br>Yang bertanda tangan di bawah ini:</p>

  <table class="identitas-table">
    <tr><td style="width: 30%;"><strong>Nama Lengkap</strong></td><td>: ${doc.identitas_pemohon.nama_lengkap}</td></tr>
    <tr><td><strong>NIK / No. KTP</strong></td><td>: ${doc.identitas_pemohon.nik}</td></tr>
    <tr><td><strong>Tempat / Tgl Lahir</strong></td><td>: ${doc.identitas_pemohon.tempat_tanggal_lahir}</td></tr>
    <tr><td><strong>Pekerjaan</strong></td><td>: ${doc.identitas_pemohon.pekerjaan}</td></tr>
    <tr><td><strong>Alamat Lengkap</strong></td><td>: ${doc.identitas_pemohon.alamat_lengkap}</td></tr>
    <tr><td><strong>Telepon / Kontak</strong></td><td>: ${doc.identitas_pemohon.nomor_kontak}</td></tr>
    <tr><td><strong>Email</strong></td><td>: ${doc.identitas_pemohon.email}</td></tr>
    <tr><td><strong>Kualifikasi Hukum</strong></td><td>: ${doc.identitas_pemohon.kategori_pemohon}</td></tr>
  </table>

  <p>Selanjutnya disebut sebagai ------------------------------------------------------------- <strong>PEMOHON;</strong></p>

  <p>Dengan ini mengajukan permohonan pengujian materiil terhadap <strong>${doc.posita.norma_yang_diuji.undang_undang}</strong> terhadap Undang-Undang Dasar Negara Republik Indonesia Tahun 1945, dengan uraian pertimbangan hukum sebagai berikut:</p>

  <div class="section-title">I. Kewenangan Mahkamah Konstitusi</div>
  <ol>
    ${doc.kewenangan_mk.dasar_hukum.map(dh => `<li>Bahwa berdasarkan ${dh};</li>`).join('')}
  </ol>
  <p>${doc.kewenangan_mk.uraian_kewenangan}</p>

  <div class="section-title">II. Kedudukan Hukum (Legal Standing) Pemohon</div>
  <p>Bahwa berdasarkan Pasal 51 ayat (1) UU MK jo. Doktrin 5 Syarat Putusan MK No. 006/PUU-III/2005, Pemohon memenuhi kualifikasi legal standing dengan parameter sebagai berikut:</p>
  <ul>
    <li><strong>1. Hak Konstitusional:</strong> ${doc.kedudukan_hukum.uraian_5_syarat_standing.syarat_1_hak_konstitusional}</li>
    <li><strong>2. Kerugian Hak Spesifik:</strong> ${doc.kedudukan_hukum.uraian_5_syarat_standing.syarat_2_kerugian_spesifik}</li>
    <li><strong>3. Sifat Aktual / Potensial:</strong> ${doc.kedudukan_hukum.uraian_5_syarat_standing.syarat_3_kerugian_aktual_potensial}</li>
    <li><strong>4. Hubungan Kausalitas:</strong> ${doc.kedudukan_hukum.uraian_5_syarat_standing.syarat_4_causal_verband}</li>
    <li><strong>5. Efek Pemulihan:</strong> ${doc.kedudukan_hukum.uraian_5_syarat_standing.syarat_5_efek_pemulihan}</li>
  </ul>
  <p><em>${doc.kedudukan_hukum.kesimpulan_standing}</em></p>

  <div class="section-title">III. Alasan Permohonan (Posita)</div>
  <p><strong>A. Duduk Perkara & Fakta Kerugian Empiris</strong></p>
  <p>${doc.posita.latar_belakang_fakta.replace(/\n/g, '<br>')}</p>

  <p><strong>B. Norma yang Dimohonkan Pengujian</strong></p>
  <p>Ketentuan ${doc.posita.norma_yang_diuji.pasal_ayat} dalam ${doc.posita.norma_yang_diuji.undang_undang}:</p>
  <div class="quote-box">${doc.posita.norma_yang_diuji.bunyi_norma}</div>

  <p><strong>C. Batu Uji Konstitusional (UUD 1945) & Pertentangan Norma</strong></p>
  ${doc.posita.batu_uji_uud_1945.map(bu => `
    <div style="margin-bottom: 12px;">
      <strong>* Batu Uji: ${bu.pasal}</strong><br>
      <em>"${bu.bunyi_pasal}"</em><br>
      <span>Analisis: ${bu.analisis_pertentangan}</span>
    </div>
  `).join('')}

  <p><strong>D. Analisis Yuridis Komprehensif</strong></p>
  <p>${doc.posita.analisis_pertentangan_komprehensif}</p>

  <p><strong>E. Pemenuhan Asas Ne Bis In Idem (Pasal 60 UU MK)</strong></p>
  <p>${doc.posita.penegasan_ne_bis_in_idem}</p>

  <div class="section-title">IV. Petitum</div>
  <p>Berdasarkan dalil-dalil dan alasan hukum di atas, Pemohon memohon kepada Majelis Hakim Mahkamah Konstitusi untuk memutuskan:</p>
  <p><strong>PRIMAIR:</strong></p>
  <ol>
    ${doc.petitum.primair.map(p => `<li>${p.replace(/^\d+\.\s*/, '')}</li>`).join('')}
  </ol>
  <p><strong>SUBSIDAIR:</strong></p>
  <p><em>${doc.petitum.subsidair}</em></p>

  <div class="signature-box">
    <p>Hormat Kami,<br><strong>PEMOHON,</strong></p>
    <div class="stamp-area">Materai Rp 10.000,-</div><br>
    <p><strong><u>(${doc.identitas_pemohon.nama_lengkap})</u></strong></p>
  </div>

  <div class="page-break"></div>

  <div class="section-title">LAMPIRAN: DAFTAR ALAT BUKTI (BUKU BUKTI)</div>
  <p style="text-align: center; font-style: italic;">Perkara Pengujian ${doc.posita.norma_yang_diuji.undang_undang} terhadap UUD 1945</p>

  <table class="evidence-table">
    <thead>
      <tr>
        <th style="width: 15%;">Kode Bukti</th>
        <th style="width: 35%;">Nama Dokumen Alat Bukti</th>
        <th style="width: 35%;">Keterangan Pokok Pembuktian</th>
        <th style="width: 15%;">Status Materai</th>
      </tr>
    </thead>
    <tbody>
      ${doc.daftar_alat_bukti.map(b => `
        <tr>
          <td><strong>${b.kode_bukti}</strong></td>
          <td>${b.nama_dokumen}</td>
          <td>${b.keterangan_pembuktian}</td>
          <td>${b.status_materai_pos}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="margin-top: 24px; padding: 12px; border: 1px solid #d1d5db; background-color: #f9fafb; font-size: 10pt;">
    <strong>Petunjuk Pemeteraian & Registrasi Mahkamah Konstitusi:</strong>
    <ul>
      <li>${doc.panduan_pendaftaran.tata_cara_legalisasi_pos}</li>
      <li>${doc.panduan_pendaftaran.prosedur_online_simpel_mk}</li>
      <li>${doc.panduan_pendaftaran.jumlah_rangkap_berkas}</li>
    </ul>
  </div>
</body>
</html>`;
}
