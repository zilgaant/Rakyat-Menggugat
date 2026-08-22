/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * TypeScript data models for Rakyat Menggugat
 * Adapted from ERD and PRD Master Section 15-16
 */

export type UserType = 'individu' | 'kelompok_sipil' | 'badan_hukum';
export type AuthMode = 'email' | 'anonim_pseudonim';
export type LanguagePreference = 'id' | 'jv' | 'su';

export interface OrganizationInfo {
  nama_organisasi: string;
  jenis: 'lsm' | 'badan_hukum_privat' | 'badan_hukum_publik';
  nomor_legalitas?: string;
  pic_nama: string;
  pic_kontak: string;
}

export interface UserProfile {
  id: string;
  auth_mode: AuthMode;
  email?: string | null;
  pseudonim_token?: string | null;
  tipe_pengguna: UserType;
  preferensi_bahasa: LanguagePreference;
  organisasi?: OrganizationInfo | null;
  privacy_policy_accepted_at: string | null; // One-time acceptance at signup/onboarding
  created_at: string;
  deleted_at?: string | null;
}

export type CaseStatus = 'draft' | 'assessed' | 'document_generated' | 'closed';

export interface CaseRecord {
  id: string;
  user_id: string;
  judul_singkat: string;
  status: CaseStatus;
  ringkasan_masalah_asli: string;
  bahasa_input: LanguagePreference;
  ai_disclaimer_accepted_at?: string | null; // Per-case disclaimer acceptance
  created_at: string;
  updated_at: string;
}

export interface CaseMessage {
  id: string;
  case_id: string;
  role: 'user' | 'agent_intake' | 'agent_analysis' | 'agent_verifier';
  content: string;
  content_translated?: string | null;
  created_at: string;
}

export type AssessmentResultType = 'layak' | 'perlu_data_tambahan' | 'tidak_layak';
export type ConfidenceLevel = 'tinggi' | 'sedang' | 'rendah';
export type LayerStatus = 'lolos' | 'gagal_total' | 'perlu_perbaikan' | 'perlu_data_tambahan' | 'tidak_dievaluasi';
export type LegalCourtPath = 'MK' | 'MA' | 'bukan_kewenangan_keduanya';

export interface LegalCitationReference {
  knowledge_entry_id: string;
  version_id?: string;
  judul_dokumen?: string;
  nomor_pasal?: string;
  kutipan_relevan: string;
}

export interface AssessmentLayer {
  lapis_ke: 1 | 2 | 3 | 4;
  nama: 'kewenangan' | 'legal_standing' | 'batu_uji' | 'posita';
  status: LayerStatus;
  jalur_hukum?: LegalCourtPath;
  penjelasan: string;
  rujukan: LegalCitationReference[];
  tidak_ditemukan_rujukan?: boolean;
  argumen_konstitusional_teridentifikasi?: string[];
  saran_perbaikan?: string | null;
}

export interface DualAgentAssessment {
  id: string;
  case_id: string;
  agent_analysis_run_id: string;
  agent_verifier_run_id: string;
  hasil_akhir: AssessmentResultType;
  confidence_level: ConfidenceLevel;
  agent_agreement: boolean;
  status_tampil_ke_user: AssessmentResultType | 'memerlukan_konsultasi_manusia';
  catatan_ketidaksesuaian?: string | null;
  catatan_ambiguitas?: string | null;
  layers: AssessmentLayer[];
  ringkasan_untuk_user: string;
  created_at: string;
}

export type EvidenceType = 'bukti_tertulis' | 'keterangan_ahli' | 'keterangan_saksi' | 'petunjuk';
export type EvidenceStatus = 'disarankan' | 'sudah_disiapkan_user' | 'terverifikasi';
export type EvidenceCategory = 'legal_standing' | 'objek_pengujian' | 'kerugian_faktual' | 'kausalitas' | 'doktrin_ahli' | 'lainnya';

export interface EvidenceItem {
  id: string;
  case_id: string;
  kode: string; // e.g. "P-1", "P-2"
  jenis: EvidenceType;
  deskripsi: string;
  relevansi_hukum: string;
  kategori?: EvidenceCategory;
  posita_dalil_terkait?: string;
  syarat_legalisasi?: string;
  catatan_pengguna?: string;
  status: EvidenceStatus;
  created_at: string;
  updated_at?: string;
}

export type StatementType = 'disusun_mandiri' | 'dibantu_lawyer_diluar_sistem';

export interface StatementFormRecord {
  id: string;
  case_id: string;
  jenis_pernyataan: StatementType;
  nama_penandatangan: string;
  nama_lawyer?: string | null;
  no_izin_lawyer?: string | null;
  signed_at: string;
}

export interface GeneratedDocument {
  id: string;
  case_id: string;
  tipe_dokumen: 'draf_permohonan' | 'daftar_bukti' | 'surat_kuasa_template';
  format_file: 'pdf' | 'docx';
  storage_path: string;
  versi: number;
  content_preview: string;
  generated_at: string;
}

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

export interface EvidenceDocumentItem {
  kode_bukti: string;
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
  daftar_alat_bukti: EvidenceDocumentItem[];
  panduan_pendaftaran: {
    tata_cara_legalisasi_pos: string;
    prosedur_online_simpel_mk: string;
    prosedur_offline_kepaniteraan: string;
    jumlah_rangkap_berkas: string;
  };
}

export interface LegalKnowledgeVersion {
  id: string;
  entry_id: string;
  versi_ke: number;
  isi_teks: string;
  catatan_perubahan?: string;
  tanggal_berlaku_versi?: string;
  amar_putusan?: 'dikabulkan' | 'ditolak' | 'tidak_dapat_diterima' | 'tidak_berwenang' | 'inkonstitusional_bersyarat' | 'tetap_berlaku';
  ratio_decidendi?: string;
  batu_uji_pasal_uud?: string[];
  url_sumber?: string;
  content_hash?: string;
  scraped_at?: string;
  created_at?: string;
}

export interface LegalKnowledgeEntry {
  id: string;
  sumber: 'jdih_mk' | 'jdihn' | 'jdih_ma' | 'seed_manual';
  jenis_dokumen: 'uud' | 'uu' | 'pp' | 'pmk' | 'perpres' | 'perda' | 'putusan_mk' | 'putusan_ma';
  nomor: string;
  tahun: string;
  judul: string;
  status_berlaku: 'berlaku' | 'dicabut' | 'diubah' | 'inkonstitusional_bersyarat';
  current_version_id: string;
  sektor_kategori?: string;
  keywords?: string[];
  ringkasan_kaidah_hukum?: string;
  total_versions?: number;
  last_synced_at: string;
  created_at?: string;
}

export interface ETLSyncJobResult {
  job_id: string;
  sumber: 'jdih_mk' | 'jdihn' | 'jdih_ma' | 'all';
  status: 'sukses' | 'parsial' | 'gagal';
  started_at: string;
  completed_at: string;
  durasi_ms: number;
  total_crawled: number;
  total_inserted: number;
  total_updated: number;
  rate_limit_delay_ms: number;
  user_agent_used: string;
  robots_txt_status: 'dihormati_dan_diizinkan' | 'jalur_terbatas';
  log_pesan: string[];
}

// Placeholder for future v2 features
export interface LawyerProfile {
  id: string;
  nama: string;
  no_izin_advokat: string;
  model_kerjasama: 'pro_bono' | 'berbayar';
  area_keahlian: string;
  status_verifikasi: 'belum_diverifikasi' | 'terverifikasi';
  created_at: string;
}

export interface LawyerMatchRequest {
  id: string;
  case_id: string;
  user_id: string;
  lawyer_id?: string | null;
  status: 'menunggu' | 'diterima' | 'ditolak';
  requested_at: string;
}

export interface AdminReviewer {
  id: string;
  nama: string;
  role: 'legal_reviewer' | 'admin_platform';
  status_aktif: boolean;
  created_at: string;
}
