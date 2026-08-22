/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Foundational Indonesian Constitutional Law Knowledge Base
 * Follows PRD Master Section 12.4 (Traceability with versions)
 */

import { LegalKnowledgeEntry, LegalKnowledgeVersion } from '../types';

export interface SeedKnowledgeItem {
  entry: LegalKnowledgeEntry;
  version: LegalKnowledgeVersion;
}

export const SEED_LEGAL_KNOWLEDGE: SeedKnowledgeItem[] = [
  {
    entry: {
      id: 'uud-1945-pasal-24c',
      sumber: 'seed_manual',
      jenis_dokumen: 'uud',
      nomor: 'Pasal 24C ayat (1)',
      tahun: '1945',
      judul: 'UUD 1945: Kewenangan Mahkamah Konstitusi Menguji Undang-Undang',
      status_berlaku: 'berlaku',
      current_version_id: 'v-uud-1945-24c-1',
      last_synced_at: '2026-08-01T00:00:00Z',
    },
    version: {
      id: 'v-uud-1945-24c-1',
      entry_id: 'uud-1945-pasal-24c',
      versi_ke: 1,
      isi_teks: 'Mahkamah Konstitusi berwenang mengadili pada tingkat pertama dan terakhir yang putusannya bersifat final untuk menguji undang-undang terhadap Undang-Undang Dasar, memutus sengketa kewenangan lembaga negara yang kewenangannya diberikan oleh Undang-Undang Dasar, memutus pembubaran partai politik, dan memutus perselisihan tentang hasil pemilihan umum.',
      content_hash: 'sha256-uud24c-hash-v1',
      url_sumber: 'https://mkri.id/uud1945',
      scraped_at: '2026-08-01T00:00:00Z',
    },
  },
  {
    entry: {
      id: 'uud-1945-pasal-24a',
      sumber: 'seed_manual',
      jenis_dokumen: 'uud',
      nomor: 'Pasal 24A ayat (1)',
      tahun: '1945',
      judul: 'UUD 1945: Kewenangan Mahkamah Agung Menguji Peraturan di Bawah UU',
      status_berlaku: 'berlaku',
      current_version_id: 'v-uud-1945-24a-1',
      last_synced_at: '2026-08-01T00:00:00Z',
    },
    version: {
      id: 'v-uud-1945-24a-1',
      entry_id: 'uud-1945-pasal-24a',
      versi_ke: 1,
      isi_teks: 'Mahkamah Agung berwenang mengadili pada tingkat kasasi, menguji peraturan perundang-undangan di bawah undang-undang terhadap undang-undang, dan mempunyai wewenang lainnya yang diberikan oleh undang-undang.',
      content_hash: 'sha256-uud24a-hash-v1',
      url_sumber: 'https://mahkamahagung.go.id',
      scraped_at: '2026-08-01T00:00:00Z',
    },
  },
  {
    entry: {
      id: 'uu-mk-pasal-51',
      sumber: 'jdih_mk',
      jenis_dokumen: 'uu',
      nomor: 'Pasal 51 ayat (1)',
      tahun: '2003',
      judul: 'UU No. 24/2003 jo. UU No. 7/2020: Syarat Pemohon (Legal Standing) Pengujian UU',
      status_berlaku: 'berlaku',
      current_version_id: 'v-uumk-51-1',
      last_synced_at: '2026-08-01T00:00:00Z',
    },
    version: {
      id: 'v-uumk-51-1',
      entry_id: 'uu-mk-pasal-51',
      versi_ke: 1,
      isi_teks: 'Pemohon adalah pihak yang menganggap hak dan/atau kewenangan konstitusionalnya dirugikan oleh berlakunya undang-undang, yaitu: a. perorangan warga negara Indonesia; b. kesatuan masyarakat hukum adat sepanjang masih hidup dan sesuai dengan perkembangan masyarakat dan prinsip Negara Kesatuan Republik Indonesia yang diatur dalam undang-undang; c. badan hukum publik atau privat; atau d. lembaga negara.',
      content_hash: 'sha256-uumk51-hash-v1',
      url_sumber: 'https://jdih.mkri.id/uu-mk',
      scraped_at: '2026-08-01T00:00:00Z',
    },
  },
  {
    entry: {
      id: 'putusan-mk-006-2005',
      sumber: 'jdih_mk',
      jenis_dokumen: 'putusan_mk',
      nomor: 'Putusan No. 006/PUU-III/2005',
      tahun: '2005',
      judul: 'Yurisprudensi MK: 5 Syarat Kumulatif Kerugian Hak Konstitusional',
      status_berlaku: 'berlaku',
      current_version_id: 'v-putusan-006-1',
      last_synced_at: '2026-08-01T00:00:00Z',
    },
    version: {
      id: 'v-putusan-006-1',
      entry_id: 'putusan-mk-006-2005',
      versi_ke: 1,
      isi_teks: 'Mahkamah menetapkan 5 syarat kerugian konstitusional pemohon: (a) adanya hak konstitusional pemohon yang diberikan oleh UUD 1945; (b) hak tersebut dianggap dirugikan oleh berlakunya UU yang diuji; (c) kerugian bersifat spesifik dan aktual atau setidak-tidaknya potensial menurut penalaran wajar dapat dipastikan akan terjadi; (d) ada hubungan sebab-akibat (causal verband) antara kerugian dengan UU yang dimohonkan pengujian; (e) adanya kemungkinan bahwa dengan dikabulkannya permohonan, kerugian hak konstitusional tersebut tidak lagi terjadi.',
      content_hash: 'sha256-putusan006-hash-v1',
      url_sumber: 'https://mkri.id/putusan/006-PUU-III-2005',
      scraped_at: '2026-08-01T00:00:00Z',
    },
  },
  {
    entry: {
      id: 'pmk-2-2021-format',
      sumber: 'jdih_mk',
      jenis_dokumen: 'pmk',
      nomor: 'PMK No. 2 Tahun 2021',
      tahun: '2021',
      judul: 'Tata Beracara dalam Perkara Pengujian Undang-Undang di MK',
      status_berlaku: 'berlaku',
      current_version_id: 'v-pmk2-2021-1',
      last_synced_at: '2026-08-01T00:00:00Z',
    },
    version: {
      id: 'v-pmk2-2021-1',
      entry_id: 'pmk-2-2021-format',
      versi_ke: 1,
      isi_teks: 'Permohonan pengujian undang-undang harus memuat secara berurutan: I. Identitas Pemohon atau Kuasa Hukumnya; II. Kewenangan Mahkamah Konstitusi; III. Kedudukan Hukum (Legal Standing) Pemohon; IV. Alasan Permohonan (Posita) yang memuat uraian pengujian formil/materiil; V. Hal-hal yang dimohonkan untuk diputus (Petitum). Permohonan diajukan dalam bahasa Indonesia dan ditandatangani oleh Pemohon.',
      content_hash: 'sha256-pmk2-2021-hash-v1',
      url_sumber: 'https://jdih.mkri.id/pmk-2-2021',
      scraped_at: '2026-08-01T00:00:00Z',
    },
  },
  {
    entry: {
      id: 'uud-1945-pasal-28d-1',
      sumber: 'seed_manual',
      jenis_dokumen: 'uud',
      nomor: 'Pasal 28D ayat (1)',
      tahun: '1945',
      judul: 'UUD 1945: Hak atas Kepastian Hukum yang Adil',
      status_berlaku: 'berlaku',
      current_version_id: 'v-uud-28d1-1',
      last_synced_at: '2026-08-01T00:00:00Z',
    },
    version: {
      id: 'v-uud-28d1-1',
      entry_id: 'uud-1945-pasal-28d-1',
      versi_ke: 1,
      isi_teks: 'Setiap orang berhak atas pengakuan, jaminan, perlindungan, dan kepastian hukum yang adil serta perlakuan yang sama dihadapan hukum.',
      content_hash: 'sha256-uud28d1-hash-v1',
      url_sumber: 'https://mkri.id/uud1945',
      scraped_at: '2026-08-01T00:00:00Z',
    },
  },
];
