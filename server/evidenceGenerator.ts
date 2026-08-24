/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dynamic Evidence Matrix & Checklist Generator for Rakyat Menggugat
 * Adheres strictly to PMK No. 2/2021 and Indonesian Court Procedures.
 * 
 * STRICT COMPLIANCE RULE:
 * Strictly uses standard Indonesian: "legalisasi/pemeteraian di Kantor Pos" (NO Dutch terminology).
 */

import { EvidenceItem, EvidenceType, EvidenceStatus } from '../src/types';

export interface DynamicEvidenceResult {
  sektor_terdeteksi: string;
  ringkasan_kebutuhan_bukti: string;
  items: EvidenceItem[];
  panduan_legalisasi: {
    aturan_meterai: string;
    prosedur_kantor_pos: string;
    jumlah_rangkap_sidang: string;
    format_penomoran: string;
  };
}

/**
 * Generates tailored, case-specific evidence items linked directly to Posita and constitutional harms.
 */
export function generateDynamicEvidenceMatrix(
  caseId: string,
  caseFacts: string,
  petitionerName: string = 'Pemohon',
  substantiveElements?: {
    latar_belakang_fakta?: string;
    hak_yang_dirugikan?: string;
    objek_norma_uu?: string;
    hubungan_kausalitas?: string;
  }
): DynamicEvidenceResult {
  const lower = (caseFacts || '').toLowerCase();
  const dateNow = new Date().toISOString();

  let sektor = 'Umum / Hak Konstitusional Warga Negara';
  let ringkasan = 'Alat bukti diarahkan untuk membuktikan legal standing pemohon dan kerugian hak konstitusional yang diakibatkan oleh norma undang-undang yang diuji.';

  const isSpeech = /\bite\b/i.test(lower) || lower.includes('uu ite') || lower.includes('pencemaran nama') || lower.includes('nama baik') || lower.includes('ujaran') || lower.includes('kebebasan berpendapat') || lower.includes('berekspresi') || lower.includes('kritik') || lower.includes('pasal 27a') || lower.includes('pasal 28');
  const isMiningOrEnv = !isSpeech && (lower.includes('tambang') || lower.includes('minerba') || lower.includes('lingkungan') || lower.includes('limbah') || lower.includes('amdal') || lower.includes('pencemaran') || lower.includes('air bersih') || lower.includes('toya'));
  const isLabor = lower.includes('buruh') || lower.includes('pekerja') || lower.includes('phk') || lower.includes('pesangon') || lower.includes('pkwt') || lower.includes('outsourcing') || lower.includes('upah') || lower.includes('cipta kerja');
  const isAgrarian = lower.includes('tanah') || lower.includes('bank tanah') || lower.includes('ulayat') || lower.includes('adat') || lower.includes('petani') || lower.includes('tatanen') || lower.includes('karuhun') || lower.includes('penggusuran') || lower.includes('lahan');
  const isElections = lower.includes('pemilu') || lower.includes('pilkada') || lower.includes('threshold') || lower.includes('suara') || lower.includes('kpu') || lower.includes('bawaslu') || lower.includes('partai');

  const items: EvidenceItem[] = [];

  // 1. BUKTI P-1: LEGAL STANDING PEMOHON (KTP / Identitas)
  items.push({
    id: `ev-${caseId}-p1`,
    case_id: caseId,
    kode: 'P-1',
    jenis: 'bukti_tertulis',
    kategori: 'legal_standing',
    deskripsi: `Fotokopi Kartu Tanda Penduduk (KTP) atas nama ${petitionerName}`,
    relevansi_hukum: 'Membuktikan kualifikasi Pemohon sebagai Perorangan Warga Negara Indonesia (WNI) yang sah menurut Pasal 51 ayat (1) huruf a UU Mahkamah Konstitusi.',
    posita_dalil_terkait: 'Kedudukan Hukum (Legal Standing) Pemohon - Syarat 1 Putusan MK No. 006/PUU-III/2005.',
    syarat_legalisasi: 'Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)',
    url_rujukan_pasal_id: 'https://pasal.id/peraturan/uu/uu-no-24-tahun-2003',
    frbr_uri: '/akn/id/act/uu/2003/24',
    status: 'disarankan',
    created_at: dateNow,
    updated_at: dateNow,
  });

  // 2. BUKTI P-2: OBJEK PENGUJIAN (Naskah Resmi UU)
  let uuDeskripsi = 'Salinan Lembaran Negara Republik Indonesia dari Undang-Undang yang Dimohonkan Pengujian';
  let uuPasalIdUrl = 'https://pasal.id';
  let uuFrbrUri = '/akn/id/act/uud/1945/1';

  if (substantiveElements?.objek_norma_uu) {
    uuDeskripsi = `Salinan Lembaran Negara RI ${substantiveElements.objek_norma_uu}`;
    uuPasalIdUrl = 'https://pasal.id/search?q=' + encodeURIComponent(substantiveElements.objek_norma_uu);
  } else if (isLabor) {
    uuDeskripsi = 'Salinan Lembaran Negara RI UU No. 6 Tahun 2023 tentang Penetapan Perppu Cipta Kerja Menjadi UU';
    uuPasalIdUrl = 'https://pasal.id/peraturan/uu/uu-no-6-tahun-2023';
    uuFrbrUri = '/akn/id/act/uu/2023/6';
  } else if (isSpeech) {
    uuDeskripsi = 'Salinan Lembaran Negara RI UU No. 1 Tahun 2024 tentang Perubahan Kedua UU ITE';
    uuPasalIdUrl = 'https://pasal.id/peraturan/uu/uu-no-1-tahun-2024';
    uuFrbrUri = '/akn/id/act/uu/2024/1';
  } else if (isMiningOrEnv) {
    uuDeskripsi = 'Salinan Lembaran Negara RI UU No. 3 Tahun 2020 tentang Pertambangan Mineral dan Batubara';
    uuPasalIdUrl = 'https://pasal.id/peraturan/uu/uu-no-3-tahun-2020';
    uuFrbrUri = '/akn/id/act/uu/2020/3';
  } else if (isAgrarian) {
    uuDeskripsi = 'Salinan Lembaran Negara RI UU No. 6 Tahun 2023 (Ketentuan Bank Tanah dan Pengelolaan Lahan)';
    uuPasalIdUrl = 'https://pasal.id/peraturan/uu/uu-no-6-tahun-2023';
    uuFrbrUri = '/akn/id/act/uu/2023/6';
  }

  items.push({
    id: `ev-${caseId}-p2`,
    case_id: caseId,
    kode: 'P-2',
    jenis: 'bukti_tertulis',
    kategori: 'objek_pengujian',
    deskripsi: uuDeskripsi,
    relevansi_hukum: 'Membuktikan keberadaan objek norma hukum yang dimohonkan pengujian materiil terhadap UUD 1945.',
    posita_dalil_terkait: 'Kewenangan Mahkamah Konstitusi (Pasal 24C ayat 1 UUD 1945 jo. Pasal 10 UU MK).',
    syarat_legalisasi: 'Dokumen Resmi Lembaran Negara / Berita Negara (Bebas Bea Meterai)',
    url_rujukan_pasal_id: uuPasalIdUrl,
    frbr_uri: uuFrbrUri,
    status: 'disarankan',
    created_at: dateNow,
    updated_at: dateNow,
  });

  // 3. SCENARIO-SPECIFIC SUBSTANTIVE EVIDENCES (P-3, P-4, P-5, etc.)
  if (isLabor) {
    sektor = 'Ketenagakerjaan & Perlindungan Hak Buruh';
    ringkasan = 'Alat bukti difokuskan untuk membuktikan status hubungan kerja, kronologi pemutusan hubungan kerja sepihak atau kontrak kerja berulang, dan hilangnya hak pesangon/imbalan yang adil.';

    items.push({
      id: `ev-${caseId}-p3`,
      case_id: caseId,
      kode: 'P-3',
      jenis: 'bukti_tertulis',
      kategori: 'kerugian_faktual',
      deskripsi: 'Salinan Perjanjian Kerja Waktu Tertentu (PKWT) / Surat Kontrak Kerja & Surat Pemutusan Hubungan Kerja (PHK)',
      relevansi_hukum: 'Membuktikan adanya hubungan kerja langsung dan kerugian faktual pemohon berupa PHK tanpa kepastian pesangon yang layak.',
      posita_dalil_terkait: 'Posita: Hubungan Kausalitas (Causal Verband) & Pelanggaran Pasal 28D ayat (2) jo. Pasal 27 ayat (2) UUD 1945.',
      syarat_legalisasi: 'Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });

    items.push({
      id: `ev-${caseId}-p4`,
      case_id: caseId,
      kode: 'P-4',
      jenis: 'bukti_tertulis',
      kategori: 'kausalitas',
      deskripsi: 'Salinan Slip Gaji / Rekening Koran Penerimaan Upah Terakhir & Perhitungan Hak Kompensasi yang Belum Dipenuhi',
      relevansi_hukum: 'Membuktikan kerugian finansial konkret dan terputusnya sumber penghidupan yang layak akibat berlakunya ketentuan norma a quo.',
      posita_dalil_terkait: 'Posita: Kerugian Spesifik dan Aktual Pemohon (Syarat 2 dan 3 Standing).',
      syarat_legalisasi: 'Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });

    items.push({
      id: `ev-${caseId}-p5`,
      case_id: caseId,
      kode: 'P-5',
      jenis: 'bukti_tertulis',
      kategori: 'doktrin_ahli',
      deskripsi: 'Data Komparasi Risalah Pembahasan UU Cipta Kerja & Kajian Dampak Fleksibilitas Kerja terhadap Hak Konstitusional Pekerja',
      relevansi_hukum: 'Membuktikan pertentangan substantif norma terhadap prinsip keadilan sosial dan doktrin pemenuhan hak asasi atas pekerjaan.',
      posita_dalil_terkait: 'Posita: Analisis Pertentangan Komprehensif dengan Prinsip Keadilan Substantif (Putusan MK No. 168/PUU-XXI/2023).',
      syarat_legalisasi: 'Dokumen Pendukung / Kajian Akademik',
      url_rujukan_pasal_id: 'https://pasal.id/peraturan/putusan-mk/puu-mk-168-2023',
      frbr_uri: '/akn/id/judgment/puu-mk/2023/168',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });
  } else if (isMiningOrEnv) {
    sektor = 'Lingkungan Hidup, Sumber Daya Alam & Pertambangan';
    ringkasan = 'Alat bukti difokuskan untuk membuktikan kerusakan lingkungan hidup, pencemaran sumber air/lahan desa, izin pertambangan tanpa persetujuan masyarakat, dan terancamnya hak hidup sehat.';

    items.push({
      id: `ev-${caseId}-p3`,
      case_id: caseId,
      kode: 'P-3',
      jenis: 'bukti_tertulis',
      kategori: 'kerugian_faktual',
      deskripsi: 'Dokumentasi Foto & Video Lapangan Kerusakan Sumber Air Bersih Desa dan Salinan Hasil Uji Mutu Laboratorium Lingkungan',
      relevansi_hukum: 'Membuktikan terjadinya pencemaran nyata dan rusaknya sumber air bersih yang menjadi hajat hidup vital masyarakat desa.',
      posita_dalil_terkait: 'Posita: Kerugian Faktual Aktual atas Hak Lingkungan Hidup yang Bersih dan Sehat (Pasal 28H ayat 1 UUD 1945).',
      syarat_legalisasi: 'Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)',
      url_rujukan_pasal_id: 'https://pasal.id/peraturan/putusan-mk/puu-mk-85-2013',
      frbr_uri: '/akn/id/judgment/puu-mk/2013/85',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });

    items.push({
      id: `ev-${caseId}-p4`,
      case_id: caseId,
      kode: 'P-4',
      jenis: 'bukti_tertulis',
      kategori: 'kausalitas',
      deskripsi: 'Salinan Surat Keputusan Izin Usaha Pertambangan (IUP) / Konsesi & Surat Penolakan / Berita Acara Musyawarah Warga Desa',
      relevansi_hukum: 'Membuktikan bahwa penerbitan izin sentralistik tanpa persetujuan warga merupakan akibat langsung dari keberlakuan norma UU Minerba.',
      posita_dalil_terkait: 'Posita: Hubungan Kausalitas (Causal Verband) & Ketiadaan Ruang Partisipasi Publik yang Bermakna.',
      syarat_legalisasi: 'Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)',
      url_rujukan_pasal_id: 'https://pasal.id/peraturan/uu/uu-no-3-tahun-2020',
      frbr_uri: '/akn/id/act/uu/2020/3',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });

    items.push({
      id: `ev-${caseId}-p5`,
      case_id: caseId,
      kode: 'P-5',
      jenis: 'bukti_tertulis',
      kategori: 'doktrin_ahli',
      deskripsi: 'Surat Pengaduan Masyarakat ke DLH/Pemda & Kajian Pakar Hukum Lingkungan atas Asas Berkelanjutan Berwawasan Lingkungan',
      relevansi_hukum: 'Membuktikan pelanggaran asas demokrasi ekonomi berwawasan lingkungan sebagaimana diatur dalam Pasal 33 ayat (4) UUD 1945.',
      posita_dalil_terkait: 'Posita: Pertentangan dengan Pasal 33 ayat (3) dan (4) UUD 1945.',
      syarat_legalisasi: 'Dokumen Pendukung / Surat Pengaduan Resmi',
      url_rujukan_pasal_id: 'https://pasal.id/peraturan/putusan-mk/puu-mk-85-2013',
      frbr_uri: '/akn/id/judgment/puu-mk/2013/85',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });
  } else if (isAgrarian) {
    sektor = 'Agraria, Hak Atas Tanah & Hak Masyarakat Adat';
    ringkasan = 'Alat bukti difokuskan untuk membuktikan kepemilikan/penguasaan fisik tanah pertanian turun-temurun, ketiadaan musyawarah yang adil, serta ancaman penggusuran oleh bank tanah/konsesi.';

    items.push({
      id: `ev-${caseId}-p3`,
      case_id: caseId,
      kode: 'P-3',
      jenis: 'bukti_tertulis',
      kategori: 'kerugian_faktual',
      deskripsi: 'Salinan Surat Keterangan Riwayat Tanah / Girik / Surat Penguasaan Fisik Tanah Pertanian Turun-Temurun & Peta Wilayah Adat',
      relevansi_hukum: 'Membuktikan hak penguasaan dan pemanfaatan lahan pertanian secara sah dan berkelanjutan oleh Pemohon dan masyarakat adat.',
      posita_dalil_terkait: 'Posita: Pengakuan Hak Masyarakat Hukum Adat dan Hak Milik Perseorangan yang Tidak Boleh Dirampas Sewenang-wenang.',
      syarat_legalisasi: 'Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)',
      url_rujukan_pasal_id: 'https://pasal.id/peraturan/putusan-mk/puu-mk-35-2012',
      frbr_uri: '/akn/id/judgment/puu-mk/2012/35',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });

    items.push({
      id: `ev-${caseId}-p4`,
      case_id: caseId,
      kode: 'P-4',
      jenis: 'bukti_tertulis',
      kategori: 'kausalitas',
      deskripsi: 'Salinan Surat Pemberitahuan / Penetapan Lokasi Bank Tanah / Konsesi Pihak Ketiga & Surat Keberatan Warga',
      relevansi_hukum: 'Membuktikan adanya ancaman penggusuran aktual tanpa proses musyawarah yang setara dan tanpa ganti rugi yang layak.',
      posita_dalil_terkait: 'Posita: Hubungan Kausalitas antara Pengaturan Bank Tanah dengan Kerugian Hak Pemohon.',
      syarat_legalisasi: 'Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)',
      url_rujukan_pasal_id: 'https://pasal.id/peraturan/uu/uu-no-6-tahun-2023',
      frbr_uri: '/akn/id/act/uu/2023/6',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });

    items.push({
      id: `ev-${caseId}-p5`,
      case_id: caseId,
      kode: 'P-5',
      jenis: 'bukti_tertulis',
      kategori: 'doktrin_ahli',
      deskripsi: 'Surat Keterangan Kepala Desa / Tokoh Adat tentang Riwayat Penggarapan Tanah & Kajian Komisi Yudisial / Komnas HAM',
      relevansi_hukum: 'Membuktikan bahwa perampasan hak atas tanah tradisional bertentangan dengan prinsip negara hukum dan perlindungan hak asasi.',
      posita_dalil_terkait: 'Posita: Pertentangan dengan Pasal 28D ayat (1) dan Pasal 33 ayat (3) UUD 1945.',
      syarat_legalisasi: 'Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)',
      url_rujukan_pasal_id: 'https://pasal.id/peraturan/putusan-mk/puu-mk-35-2012',
      frbr_uri: '/akn/id/judgment/puu-mk/2012/35',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });
  } else if (isSpeech) {
    sektor = 'Kebebasan Berekspresi & Kepastian Hukum Pidana/Informasi';
    ringkasan = 'Alat bukti difokuskan untuk membuktikan ekspresi kritik publik yang sah, adanya kriminalisasi atau ancaman penuntutan pidana menggunakan pasal karet, dan terlanggarnya hak menyatakan pikiran.';

    items.push({
      id: `ev-${caseId}-p3`,
      case_id: caseId,
      kode: 'P-3',
      jenis: 'bukti_tertulis',
      kategori: 'kerugian_faktual',
      deskripsi: 'Tangkapan Layar Utuh Unggahan/Kritik Pemohon & Salinan Surat Panggilan Klarifikasi / Surat Pemberitahuan Dimulainya Penyidikan (SPDP)',
      relevansi_hukum: 'Membuktikan adanya proses hukum pidana nyata (aktual) yang dialami Pemohon akibat penggunaan pasal karet norma a quo.',
      posita_dalil_terkait: 'Posita: Kerugian Aktual atas Kebebasan Berpendapat dan Menyatakan Pikiran (Pasal 28E ayat 3 UUD 1945).',
      syarat_legalisasi: 'Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)',
      url_rujukan_pasal_id: 'https://pasal.id/peraturan/uu/uu-no-1-tahun-2024',
      frbr_uri: '/akn/id/act/uu/2024/1',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });

    items.push({
      id: `ev-${caseId}-p4`,
      case_id: caseId,
      kode: 'P-4',
      jenis: 'bukti_tertulis',
      kategori: 'kausalitas',
      deskripsi: 'Kajian Ahli Bahasa / Ahli Hukum Pidana tentang Ambiguitas Rumusan Delik dalam Norma yang Diuji',
      relevansi_hukum: 'Membuktikan bahwa rumusan pasal tidak memenuhi asas lex certa dan lex stricta dalam negara hukum.',
      posita_dalil_terkait: 'Posita: Pelanggaran Asas Legalitas dan Kepastian Hukum yang Adil (Pasal 28D ayat 1 UUD 1945).',
      syarat_legalisasi: 'Dokumen Pendukung / Kajian Ahli Hukum',
      url_rujukan_pasal_id: 'https://pasal.id/peraturan/putusan-mk/puu-mk-50-2008',
      frbr_uri: '/akn/id/judgment/puu-mk/2008/50',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });

    items.push({
      id: `ev-${caseId}-p5`,
      case_id: caseId,
      kode: 'P-5',
      jenis: 'bukti_tertulis',
      kategori: 'doktrin_ahli',
      deskripsi: 'Kajian Komparatif Hak Digital & Deklarasi Kebebasan Berekspresi Internasional Terkait Perlindungan Whistleblower / Kritik Warga',
      relevansi_hukum: 'Membuktikan bahwa kritik publik terhadap pejabat atau kebijakan bukan merupakan tindak pidana pencemaran nama baik melainkan partisipasi warga yang sah.',
      posita_dalil_terkait: 'Posita: Ketiadaan Mens Rea dan Penjaminan Hak Berekspresi Pasal 28F UUD 1945.',
      syarat_legalisasi: 'Dokumen Pendukung / Kajian Hak Asasi',
      url_rujukan_pasal_id: 'https://pasal.id/peraturan/putusan-mk/puu-mk-50-2008',
      frbr_uri: '/akn/id/judgment/puu-mk/2008/50',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });
  } else {
    // Standard Universal Set
    items.push({
      id: `ev-${caseId}-p3`,
      case_id: caseId,
      kode: 'P-3',
      jenis: 'bukti_tertulis',
      kategori: 'kerugian_faktual',
      deskripsi: 'Dokumen / Surat Keterangan / Bukti Kerugian Faktual Spesifik yang Dialami Pemohon',
      relevansi_hukum: 'Membuktikan adanya kerugian hak konstitusional spesifik, langsung, dan aktual yang diderita oleh Pemohon.',
      posita_dalil_terkait: 'Posita: Kerugian Konstitusional Aktual Pemohon (Syarat 2 dan 3 Kedudukan Hukum).',
      syarat_legalisasi: 'Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)',
      url_rujukan_pasal_id: 'https://pasal.id',
      frbr_uri: '/akn/id/act/uud/1945/1',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });

    items.push({
      id: `ev-${caseId}-p4`,
      case_id: caseId,
      kode: 'P-4',
      jenis: 'bukti_tertulis',
      kategori: 'kausalitas',
      deskripsi: 'Dokumen Kronologi Hubungan Kausalitas antara Berlakunya Norma UU dengan Kerugian Pemohon',
      relevansi_hukum: 'Membuktikan hubungan sebab-akibat langsung (causal verband) antara norma hukum dengan kerugian yang diderita.',
      posita_dalil_terkait: 'Posita: Hubungan Kausalitas (Causal Verband) Syarat 4 Kedudukan Hukum.',
      syarat_legalisasi: 'Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)',
      url_rujukan_pasal_id: 'https://pasal.id',
      frbr_uri: '/akn/id/judgment/puu-mk/2005/006',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });

    items.push({
      id: `ev-${caseId}-p5`,
      case_id: caseId,
      kode: 'P-5',
      jenis: 'bukti_tertulis',
      kategori: 'doktrin_ahli',
      deskripsi: 'Kajian Yuridis / Naskah Akademik / Yurisprudensi Putusan Mahkamah Konstitusi Terdahulu Terkait',
      relevansi_hukum: 'Membuktikan ratio decidendi pertentangan norma terhadap prinsip kepastian hukum yang adil dan pemenuhan asas Ne Bis In Idem.',
      posita_dalil_terkait: 'Posita: Pemenuhan Pasal 60 UU MK & Doktrin Negara Hukum.',
      syarat_legalisasi: 'Dokumen Pendukung / Kajian Yurisprudensi',
      url_rujukan_pasal_id: 'https://pasal.id',
      frbr_uri: '/akn/id/act/uu/2003/24',
      status: 'disarankan',
      created_at: dateNow,
      updated_at: dateNow,
    });
  }

  return {
    sektor_terdeteksi: sektor,
    ringkasan_kebutuhan_bukti: ringkasan,
    items,
    panduan_legalisasi: {
      aturan_meterai: 'Sesuai UU Bea Meterai, setiap fotokopi alat bukti surat yang diajukan ke persidangan wajib dibubuhi meterai tempel Rp10.000,-.',
      prosedur_kantor_pos: 'Bawa seluruh fotokopi alat bukti ke Kantor Pos terdekat di loket pelayanan pemeteraian dokumen, kemudian petugas pos akan membubuhkan cap legalisasi/pemeteraian di Kantor Pos.',
      jumlah_rangkap_sidang: 'Siapkan 1 rangkap dokumen permohonan dan bukti asli bertanda tangan basah dan bermaterai, serta 11 rangkap salinan lengkap untuk Majelis Hakim Konstitusi dan Kepaniteraan MK.',
      format_penomoran: 'Penomoran kode bukti untuk Pemohon menggunakan format Bukti P-1, Bukti P-2, Bukti P-3, dst., yang dicantumkan pada pojok kanan atas dokumen.'
    }
  };
}
