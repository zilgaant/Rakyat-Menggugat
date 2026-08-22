/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dynamic Evidence Checklist & Guide Component (PMK No. 2/2021)
 * Links Posita arguments directly to court evidence items (P-1 s.d. P-X).
 * 
 * TERMINOLOGY COMPLIANCE:
 * Strictly uses standard Indonesian: "legalisasi/pemeteraian di Kantor Pos" (zero prohibited terms).
 */

import React, { useState } from 'react';
import { 
  FileCheck, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle, 
  ShieldCheck, 
  AlertCircle, 
  Stamp, 
  Layers, 
  FileText, 
  Scale, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { EvidenceItem, EvidenceType, EvidenceStatus, EvidenceCategory, CaseRecord } from '../types';
import { DisclaimerBanner } from './DisclaimerBanner';

interface EvidenceGuideViewProps {
  activeCase: CaseRecord;
  evidenceItems: EvidenceItem[];
  sectorName?: string;
  onUpdateEvidenceItem: (item: EvidenceItem) => void;
  onDeleteEvidenceItem?: (evidenceId: string) => void;
  onAddCustomEvidence: (item: Omit<EvidenceItem, 'id' | 'case_id' | 'created_at'>) => void;
  onProceedToDocument: () => void;
  onBackToAssessment: () => void;
}

export const EvidenceGuideView: React.FC<EvidenceGuideViewProps> = ({
  activeCase,
  evidenceItems,
  sectorName,
  onUpdateEvidenceItem,
  onDeleteEvidenceItem,
  onAddCustomEvidence,
  onProceedToDocument,
  onBackToAssessment,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showTablePreview, setShowTablePreview] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Form State for Adding Custom Evidence
  const nextNumber = evidenceItems.length + 1;
  const [customKode, setCustomKode] = useState(`P-${nextNumber}`);
  const [customJenis, setCustomJenis] = useState<EvidenceType>('bukti_tertulis');
  const [customKategori, setCustomKategori] = useState<EvidenceCategory>('kerugian_faktual');
  const [customDeskripsi, setCustomDeskripsi] = useState('');
  const [customRelevansi, setCustomRelevansi] = useState('');
  const [customPosita, setCustomPosita] = useState('');
  const [customSyarat, setCustomSyarat] = useState('Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDeskripsi.trim()) return;

    onAddCustomEvidence({
      kode: customKode.trim() || `P-${evidenceItems.length + 1}`,
      jenis: customJenis,
      kategori: customKategori,
      deskripsi: customDeskripsi.trim(),
      relevansi_hukum: customRelevansi.trim() || 'Mendukung uraian kerugian hak konstitusional pemohon dalam permohonan.',
      posita_dalil_terkait: customPosita.trim() || 'Posita: Hubungan Kausalitas dan Kerugian Aktual.',
      syarat_legalisasi: customSyarat,
      status: 'disarankan',
      catatan_pengguna: '',
    });

    setCustomDeskripsi('');
    setCustomRelevansi('');
    setCustomPosita('');
    setCustomKode(`P-${evidenceItems.length + 2}`);
    setShowAddForm(false);
  };

  const handleStatusChange = (item: EvidenceItem, newStatus: EvidenceStatus) => {
    const updated: EvidenceItem = {
      ...item,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    onUpdateEvidenceItem(updated);
  };

  const handleCycleStatus = (item: EvidenceItem) => {
    let nextStatus: EvidenceStatus = 'sudah_disiapkan_user';
    if (item.status === 'disarankan') {
      nextStatus = 'sudah_disiapkan_user';
    } else if (item.status === 'sudah_disiapkan_user') {
      nextStatus = 'terverifikasi';
    } else {
      nextStatus = 'disarankan';
    }
    handleStatusChange(item, nextStatus);
  };

  const handleSaveNote = (item: EvidenceItem) => {
    const updated: EvidenceItem = {
      ...item,
      catatan_pengguna: tempNoteText.trim(),
      updated_at: new Date().toISOString(),
    };
    onUpdateEvidenceItem(updated);
    setEditingNoteId(null);
    setTempNoteText('');
  };

  const getJenisLabel = (jenis: EvidenceType) => {
    switch (jenis) {
      case 'bukti_tertulis':
        return 'Surat / Dokumen Tertulis';
      case 'keterangan_ahli':
        return 'Keterangan Ahli';
      case 'keterangan_saksi':
        return 'Keterangan Saksi Fakta';
      case 'petunjuk':
      default:
        return 'Petunjuk / Rekaman';
    }
  };

  const getKategoriLabel = (kategori?: EvidenceCategory) => {
    switch (kategori) {
      case 'legal_standing':
        return 'Legal Standing';
      case 'objek_pengujian':
        return 'Objek Norma UU';
      case 'kerugian_faktual':
        return 'Kerugian Faktual';
      case 'kausalitas':
        return 'Hubungan Kausalitas';
      case 'doktrin_ahli':
        return 'Kajian Ahli / Doktrin';
      default:
        return 'Bukti Pendukung';
    }
  };

  const getStatusBadge = (status: EvidenceStatus) => {
    switch (status) {
      case 'terverifikasi':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Terverifikasi Lengkap</span>
          </span>
        );
      case 'sudah_disiapkan_user':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Sudah Disiapkan Pemohon</span>
          </span>
        );
      case 'disarankan':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full border border-stone-300">
            <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
            <span>Disarankan Sistem</span>
          </span>
        );
    }
  };

  // Filtered evidence items
  const filteredItems = evidenceItems.filter((item) => {
    if (filterCategory !== 'all' && item.kategori !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const totalItems = evidenceItems.length;
  const readyCount = evidenceItems.filter(
    (i) => i.status === 'sudah_disiapkan_user' || i.status === 'terverifikasi'
  ).length;
  const verifiedCount = evidenceItems.filter((i) => i.status === 'terverifikasi').length;
  const percentReady = totalItems > 0 ? Math.round((readyCount / totalItems) * 100) : 0;

  const copyTableToClipboard = () => {
    const headers = 'Kode Bukti\tJenis Bukti\tNama & Deskripsi Alat Bukti\tTujuan Pembuktian (Posita)\tSyarat Legalisasi\tStatus\n';
    const rows = evidenceItems
      .map(
        (i) =>
          `${i.kode}\t${getJenisLabel(i.jenis)}\t${i.deskripsi}\t${i.relevansi_hukum}\t${
            i.syarat_legalisasi || 'Legalisasi/Pemeteraian di Kantor Pos'
          }\t${i.status.replace(/_/g, ' ')}`
      )
      .join('\n');

    navigator.clipboard.writeText(headers + rows);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header & Readiness Dashboard */}
      <div className="bg-white border-2 border-stone-300 rounded-lg p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-900 uppercase tracking-wider">
              <Scale className="w-4 h-4" />
              <span>Buku II: Matriks Alat Bukti Mahkamah Konstitusi (PMK No. 2/2021)</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              Daftar Alat Bukti Pemohon ({evidenceItems.length > 0 ? `P-1 s.d. P-${evidenceItems.length}` : 'P-1'})
            </h1>
            <p className="text-xs text-stone-600">
              Sistem menghubungkan setiap dalil Posita kerugian konstitusional Anda dengan bukti fisik bernomor kode resmi.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-300 p-4 rounded-lg text-right shrink-0 min-w-[200px] space-y-1">
            <div className="flex justify-between items-center text-xs text-stone-600">
              <span>Kesiapan Bukti:</span>
              <span className="font-bold text-stone-900">{percentReady}%</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${percentReady}%` }}
              />
            </div>
            <div className="text-[11px] text-stone-500 flex justify-between pt-0.5">
              <span>{readyCount} dari {totalItems} siap</span>
              <span className="font-medium text-emerald-700">{verifiedCount} terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Sectoral Insight Banner */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-md p-4 text-xs text-rose-950 flex items-start gap-3">
          <FileText className="w-5 h-5 text-rose-900 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-rose-900 flex items-center gap-2">
              <span>Fokus Pembuktian Sektoral:</span>
              <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded text-[11px] font-bold border border-rose-300">
                {sectorName || 'Kerugian Hak Konstitusional Pemohon'}
              </span>
            </div>
            <p className="text-rose-900/90 leading-relaxed">
              Seluruh alat bukti surat (Bukti P-1 s.d. P-{totalItems}) wajib dibubuhi meterai tempel Rp10.000,- dan memperoleh cap <strong>legalisasi/pemeteraian di Kantor Pos</strong> sebelum diserahkan pada sidang pemeriksaan pendahuluan Mahkamah Konstitusi.
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBanner compact />

      {/* Checklist Controls & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-xl text-stone-900">
              Checklist & Matriks Pembuktian Posita
            </h2>
            <p className="text-xs text-stone-600">
              Klik status untuk memperbarui progres kesiapan dokumen fisik Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTablePreview(!showTablePreview)}
              className="px-3 py-1.5 border border-stone-300 rounded text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-stone-600" />
              <span>{showTablePreview ? 'Sembunyikan Matriks' : 'Lihat Matriks Buku II'}</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#881337] hover:bg-[#70102e] text-white px-3.5 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Tutup Form' : 'Tambah Alat Bukti'}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-stone-200 pb-3">
          <span className="text-xs text-stone-500 font-medium mr-1">Filter Kategori:</span>
          {[
            { id: 'all', label: 'Semua' },
            { id: 'legal_standing', label: 'Legal Standing (P-1)' },
            { id: 'objek_pengujian', label: 'Objek UU (P-2)' },
            { id: 'kerugian_faktual', label: 'Kerugian Faktual (P-3+)' },
            { id: 'kausalitas', label: 'Kausalitas' },
            { id: 'doktrin_ahli', label: 'Kajian Ahli' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                filterCategory === cat.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1 text-xs">
            <span className="text-stone-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1 border border-stone-300 rounded text-xs bg-white text-stone-800"
            >
              <option value="all">Semua Status</option>
              <option value="disarankan">Disarankan</option>
              <option value="sudah_disiapkan_user">Sudah Disiapkan</option>
              <option value="terverifikasi">Terverifikasi</option>
            </select>
          </div>
        </div>

        {/* Live Table Matrix Preview (Buku II layout) */}
        {showTablePreview && (
          <div className="bg-white border-2 border-stone-300 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-serif font-bold text-sm text-stone-900">
                  Tabel Resmi Matriks Alat Bukti (Format Lampiran Buku II Permohonan MK)
                </h3>
                <p className="text-[11px] text-stone-500">
                  Tabel ini dicetak sebagai dokumen terpisah yang ditandatangani Pemohon.
                </p>
              </div>
              <button
                onClick={copyTableToClipboard}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-xs font-medium text-stone-700 flex items-center gap-1.5"
              >
                {copiedTable ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTable ? 'Disalin!' : 'Salin Tabel'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-300 text-stone-900 font-semibold">
                    <th className="py-2.5 px-3 border-r border-stone-200 w-20">Kode</th>
                    <th className="py-2.5 px-3 border-r border-stone-200 w-32">Kategori</th>
                    <th className="py-2.5 px-3 border-r border-stone-200">Nama Dokumen / Alat Bukti</th>
                    <th className="py-2.5 px-3 border-r border-stone-200">Keterangan Pembuktian (Posita)</th>
                    <th className="py-2.5 px-3 border-r border-stone-200 w-36">Syarat Pemeteraian</th>
                    <th className="py-2.5 px-3 w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-stone-800">
                  {evidenceItems.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/80">
                      <td className="py-2 px-3 border-r border-stone-200 font-mono font-bold text-stone-900">
                        {item.kode}
                      </td>
                      <td className="py-2 px-3 border-r border-stone-200 text-stone-600">
                        {getKategoriLabel(item.kategori)}
                      </td>
                      <td className="py-2 px-3 border-r border-stone-200 font-medium text-stone-900">
                        {item.deskripsi}
                      </td>
                      <td className="py-2 px-3 border-r border-stone-200 text-stone-700">
                        {item.relevansi_hukum}
                      </td>
                      <td className="py-2 px-3 border-r border-stone-200 text-[11px] text-stone-600">
                        {item.syarat_legalisasi || 'Legalisasi/Pemeteraian di Kantor Pos'}
                      </td>
                      <td className="py-2 px-3 text-stone-700">
                        {getStatusBadge(item.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Custom Evidence Form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="bg-stone-50 border-2 border-stone-300 rounded-lg p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-900" />
                <span>Tambah Alat Bukti Tambahan Pemohon</span>
              </h3>
              <span className="text-xs text-stone-500 font-mono">Kode Rekomendasi: P-{nextNumber}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Kode Bukti (Format P-X):
                </label>
                <input
                  type="text"
                  value={customKode}
                  onChange={(e) => setCustomKode(e.target.value)}
                  required
                  placeholder="Misal: P-4"
                  className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Jenis Alat Bukti:
                </label>
                <select
                  value={customJenis}
                  onChange={(e) => setCustomJenis(e.target.value as EvidenceType)}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
                >
                  <option value="bukti_tertulis">Surat / Dokumen Tertulis (Fotokopi)</option>
                  <option value="keterangan_ahli">Keterangan Ahli (Tertulis / Lisan)</option>
                  <option value="keterangan_saksi">Keterangan Saksi Fakta Langsung</option>
                  <option value="petunjuk">Petunjuk / Data Digital / Media Elektronik</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Kategori Pembuktian:
                </label>
                <select
                  value={customKategori}
                  onChange={(e) => setCustomKategori(e.target.value as EvidenceCategory)}
                  className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
                >
                  <option value="kerugian_faktual">Kerugian Faktual Pemohon</option>
                  <option value="kausalitas">Hubungan Kausalitas (Causal Verband)</option>
                  <option value="legal_standing">Legal Standing Pemohon</option>
                  <option value="objek_pengujian">Objek Norma yang Diuji</option>
                  <option value="doktrin_ahli">Kajian Ahli / Doktrin / Yurisprudensi</option>
                  <option value="lainnya">Bukti Tambahan Lainnya</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Nama & Deskripsi Dokumen / Alat Bukti:
              </label>
              <input
                type="text"
                value={customDeskripsi}
                onChange={(e) => setCustomDeskripsi(e.target.value)}
                placeholder="Contoh: Salinan Surat Pengaduan ke Ombudsman / Slip Gaji Terakhir / Foto Dampak Lingkungan"
                required
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Tujuan Pembuktian / Relevansi Hukum:
                </label>
                <input
                  type="text"
                  value={customRelevansi}
                  onChange={(e) => setCustomRelevansi(e.target.value)}
                  placeholder="Membuktikan adanya kerugian hak konstitusional spesifik..."
                  className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  Keterkaitan Dalil Posita:
                </label>
                <input
                  type="text"
                  value={customPosita}
                  onChange={(e) => setCustomPosita(e.target.value)}
                  placeholder="Posita: Hubungan Kausalitas Angka 3"
                  className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Syarat Pemeteraian / Legalisasi:
              </label>
              <select
                value={customSyarat}
                onChange={(e) => setCustomSyarat(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-800"
              >
                <option value="Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Tempel Rp10.000 + Cap Pos)">
                  Wajib Legalisasi/Pemeteraian di Kantor Pos (Meterai Rp10.000 + Cap Pos)
                </option>
                <option value="Dokumen Resmi Negara / Lembaran Negara (Bebas Bea Meterai)">
                  Dokumen Resmi Negara / Lembaran Negara (Bebas Bea Meterai)
                </option>
                <option value="Surat Pernyataan Asli Bermaterai Rp10.000,-">
                  Surat Pernyataan Asli Bermaterai Rp10.000,-
                </option>
                <option value="Dokumen Pendukung / Kajian Akademik">
                  Dokumen Pendukung / Kajian Akademik
                </option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-stone-300 rounded text-xs text-stone-700 hover:bg-stone-100"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-[#881337] hover:bg-[#70102e] text-white px-5 py-2 rounded text-xs font-semibold shadow-xs"
              >
                Simpan ke Daftar Alat Bukti
              </button>
            </div>
          </form>
        )}

        {/* Evidence List Items */}
        <div className="space-y-3.5">
          {filteredItems.length === 0 ? (
            <div className="bg-stone-50 border border-stone-300 rounded-lg p-8 text-center space-y-2">
              <FileCheck className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm font-semibold text-stone-700">Tidak ada alat bukti dalam filter ini</p>
              <p className="text-xs text-stone-500">Ubah filter kategori atau status di atas untuk melihat bukti lainnya.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isReady = item.status === 'sudah_disiapkan_user' || item.status === 'terverifikasi';
              const isVerified = item.status === 'terverifikasi';
              const isEditingNote = editingNoteId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-lg p-5 transition shadow-xs space-y-4 ${
                    isVerified
                      ? 'border-emerald-300 bg-emerald-50/15'
                      : isReady
                      ? 'border-amber-300 bg-amber-50/15'
                      : 'border-stone-200'
                  }`}
                >
                  {/* Card Header: Code, Category, Status Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-stone-900 text-white px-2.5 py-0.5 rounded">
                        {item.kode}
                      </span>
                      <span className="text-[11px] bg-rose-50 text-rose-900 border border-rose-200 px-2 py-0.5 rounded font-semibold">
                        {getKategoriLabel(item.kategori)}
                      </span>
                      <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200 font-medium">
                        {getJenisLabel(item.jenis)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(item.status)}

                      {/* Dropdown status selector */}
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item, e.target.value as EvidenceStatus)}
                        className="text-xs border border-stone-300 rounded px-2 py-1 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-rose-800"
                      >
                        <option value="disarankan">Disarankan</option>
                        <option value="sudah_disiapkan_user">Sudah Disiapkan</option>
                        <option value="terverifikasi">Terverifikasi</option>
                      </select>

                      {onDeleteEvidenceItem && (
                        <button
                          onClick={() => onDeleteEvidenceItem(item.id)}
                          title="Hapus Bukti"
                          className="text-stone-400 hover:text-rose-700 p-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body: Title, Posita Relevance, Legalisation Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-900 leading-snug">
                        {item.deskripsi}
                      </h3>
                    </div>

                    {/* Posita linkage callout */}
                    <div className="bg-stone-50 border border-stone-200 rounded p-3 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-stone-900 font-semibold">
                        <Scale className="w-3.5 h-3.5 text-rose-900 shrink-0" />
                        <span>Keterkaitan Dalil Posita: {item.posita_dalil_terkait || 'Membuktikan Kerugian Faktual'}</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed pl-5">
                        <strong className="text-stone-800">Tujuan Pembuktian:</strong> {item.relevansi_hukum}
                      </p>
                    </div>

                    {/* Legalisation / Postal Stamp Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Stamp className="w-3.5 h-3.5 text-rose-800 shrink-0" />
                        <span className="font-medium">
                          Syarat Formal: <span className="text-stone-900">{item.syarat_legalisasi || 'Wajib Legalisasi/Pemeteraian di Kantor Pos'}</span>
                        </span>
                      </div>

                      <button
                        onClick={() => handleCycleStatus(item)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 border shadow-2xs ${
                          isVerified
                            ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                            : isReady
                            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                            : 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isVerified ? 'text-white' : isReady ? 'text-amber-800' : 'text-stone-400'}`} />
                        <span>
                          {isVerified ? 'Verifikasi Lengkap' : isReady ? 'Tandai Terverifikasi' : 'Tandai Disiapkan'}
                        </span>
                      </button>
                    </div>

                    {/* User Notes Section */}
                    <div className="border-t border-stone-100 pt-2 text-xs">
                      {isEditingNote ? (
                        <div className="space-y-2 pt-1">
                          <label className="block text-[11px] font-semibold text-stone-700">
                            Catatan Pribadi Pemohon (Lokasi fisik, nomor surat, tanggal perolehan):
                          </label>
                          <input
                            type="text"
                            value={tempNoteText}
                            onChange={(e) => setTempNoteText(e.target.value)}
                            placeholder="Contoh: Dokumen asli disimpan di map berkas A, fotokopi sudah dilegalisir di Kantor Pos Jakarta Pusat."
                            className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-rose-800"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveNote(item)}
                              className="bg-stone-900 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-stone-800"
                            >
                              Simpan Catatan
                            </button>
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="border border-stone-300 text-stone-700 px-3 py-1 rounded text-xs hover:bg-stone-100"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-stone-600">
                          <div className="flex items-center gap-1.5">
                            <Edit3 className="w-3 h-3 text-stone-400" />
                            <span className="italic text-[11px]">
                              {item.catatan_pengguna ? (
                                <span className="text-stone-800 font-normal not-italic">Catatan: {item.catatan_pengguna}</span>
                              ) : (
                                'Belum ada catatan fisik dokumen.'
                              )}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingNoteId(item.id);
                              setTempNoteText(item.catatan_pengguna || '');
                            }}
                            className="text-[11px] text-rose-900 font-semibold hover:underline"
                          >
                            {item.catatan_pengguna ? 'Ubah Catatan' : '+ Tambah Catatan Dokumen'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Practical Guide Section (PMK No. 2/2021 & UU Bea Meterai) */}
      <div className="bg-stone-50 border-2 border-stone-300 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 text-stone-900">
          <HelpCircle className="w-5 h-5 text-rose-900 shrink-0" />
          <h3 className="font-serif font-bold text-base">
            Panduan Resmi Beracara & Validasi Pembuktian Mahkamah Konstitusi
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white border border-stone-200 rounded-md p-4 space-y-2">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <Stamp className="w-4 h-4 text-rose-800" />
              <span>1. Legalisasi / Pemeteraian di Kantor Pos</span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              Berdasarkan UU Bea Meterai dan tata tertib persidangan MK, seluruh fotokopi alat bukti surat (khususnya Bukti P-1, P-3, dan seterusnya) <strong>wajib ditempeli meterai tempel Rp10.000,-</strong> dan dimintakan cap legalisasi/pemeteraian di loket Kantor Pos terdekat sebelum persidangan.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-md p-4 space-y-2">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-rose-800" />
              <span>2. Standar Pemberkasan 12 Rangkap</span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              Sesuai PMK No. 2/2021, Pemohon wajib menyiapkan <strong>1 (satu) berkas asli</strong> bertanda tangan basah di atas meterai Rp10.000,- serta <strong>11 (sebelas) salinan rangkap</strong> lengkap untuk diserahkan kepada 9 Hakim Konstitusi, Panitera, dan Arsip MK.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-md p-4 space-y-2">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-rose-800" />
              <span>3. Penomoran dan Penandaan Kode Bukti</span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              Tuliskan kode bukti (misal: <strong>Bukti P-1</strong>, <strong>Bukti P-2</strong>, dst.) pada pojok kanan atas setiap lembar alat bukti. Susun urutan bukti secara kronologis dan sinkron dengan uraian Posita permohonan.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-md p-4 space-y-2">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4 text-rose-800" />
              <span>4. Pendaftaran Online (SIMPEL MK) / Offline (PTSP)</span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              Pengajuan dapat dilakukan secara daring 24/7 melalui portal SIMPEL MK (<strong>simpel.mkri.id</strong>) dengan mengunggah draf permohonan format PDF & Word DOCX, atau secara langsung di Loket PTSP Gedung Mahkamah Konstitusi RI, Jakarta.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
        <button
          onClick={onBackToAssessment}
          className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 rounded-md text-xs font-semibold text-stone-700 hover:bg-stone-100 transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Laporan Asesmen</span>
        </button>

        <button
          onClick={onProceedToDocument}
          className="w-full sm:w-auto bg-[#881337] hover:bg-[#70102e] text-white px-6 py-2.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs border border-rose-900"
        >
          <span>Lanjut ke Generator Draf Permohonan Resmi (Buku I & II)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
