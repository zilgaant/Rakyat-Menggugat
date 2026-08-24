/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * EvidenceCompletePacketModal Component
 * Provides comprehensive printable and downloadable packet containing:
 * 1. Physical Evidence Checklist
 * 2. Statutory Provisions from Pasal.id
 * 3. Formal Complaint Forms (Ombudsman / Sectoral Oversight)
 * 4. Lab Test & Field Sample Request Form
 * 5. Photo & Video Evidence Capture Technical Guide (MK Court Standard)
 * 6. Step-by-Step Citizen Guides (Fotokopi KTP to Kantor Pos Legalization)
 * 7. Official MK Buku II Evidence Matrix (PMK No. 2/2021)
 * 8. Self-Representation Pro Se Statement Draft
 */

import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  FileText, 
  CheckCircle2, 
  Scale, 
  Camera, 
  FlaskConical, 
  Stamp, 
  Building2, 
  Copy, 
  Check, 
  ExternalLink,
  BookOpen,
  ShieldAlert,
  HelpCircle,
  Clock
} from 'lucide-react';
import { CaseRecord, EvidenceItem, DualAgentAssessment } from '../types';
import { downloadEvidencePacketDoc, printEvidencePacket } from '../services/evidencePacketGenerator';

interface EvidenceCompletePacketModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase: CaseRecord;
  evidenceItems: EvidenceItem[];
  assessment?: DualAgentAssessment | null;
  sectorName?: string;
}

export const EvidenceCompletePacketModal: React.FC<EvidenceCompletePacketModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  evidenceItems,
  assessment,
  sectorName,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'semua' | 'checklist' | 'salinan_uu' | 'formulir_pengaduan' | 'panduan_foto_video' | 'uji_lab' | 'step_by_step'>('semua');

  if (!isOpen) return null;

  const handleCopyText = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handlePrint = () => {
    printEvidencePacket(activeCase, evidenceItems, assessment, sectorName);
  };

  const handleDownloadDoc = () => {
    downloadEvidencePacketDoc(activeCase, evidenceItems, assessment, sectorName);
  };


  const batuUjiLayer = assessment?.layers?.find(l => l.nama === 'batu_uji');
  const batuUji = batuUjiLayer?.rujukan?.map(r => `${r.nomor_pasal || ''} ${r.judul_dokumen || ''}`.trim()).filter(Boolean).join(', ') 
    || batuUjiLayer?.argumen_konstitusional_teridentifikasi?.join(', ')
    || 'Pasal 28D ayat (1), Pasal 28I ayat (1) UUD 1945';

  const kewenanganLayer = assessment?.layers?.find(l => l.nama === 'kewenangan');
  const positaLayer = assessment?.layers?.find(l => l.nama === 'posita');
  const allRujukan = [
    ...(kewenanganLayer?.rujukan || []),
    ...(positaLayer?.rujukan || []),
    ...(batuUjiLayer?.rujukan || [])
  ];

  const primaryDoc = allRujukan.find(r => r.judul_dokumen && !r.judul_dokumen.toLowerCase().includes('uud 1945'));
  const undangUndang = primaryDoc?.judul_dokumen || (sectorName ? `Peraturan Perundang-Undangan Sektor ${sectorName}` : 'Undang-Undang Terkait Kasus');
  const pasalDiuji = primaryDoc?.nomor_pasal || 'Pasal Norma Terkait';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white border border-stone-300 rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:border-none print:shadow-none print:w-full">
        {/* Modal Top Bar (Non-Printable) */}
        <div className="print:hidden bg-stone-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#881337] flex items-center justify-center text-white shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Aksesibilitas Lengkap Warga</span>
                <span className="bg-emerald-800/80 text-emerald-200 text-[10px] px-2 py-0.5 rounded font-semibold border border-emerald-600">Siap Cetak & Unduh</span>
              </div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-white">
                Paket Dokumen, Formulir & Panduan Lengkap Alat Bukti
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDoc}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition cursor-pointer"
              title="Unduh berkas Word (.DOC)"
            >
              <Download className="w-3.5 h-3.5 text-rose-300" />
              <span>Download (.DOC)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#881337] hover:bg-[#70102e] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Cetak langsung ke kertas atau Simpan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Paket Lengkap</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-md hover:bg-stone-800 transition ml-1 cursor-pointer"
              title="Tutup jendela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs in Modal (Non-Printable) */}
        <div className="print:hidden bg-stone-100 border-b border-stone-300 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          {[
            { id: 'semua', label: '📄 Semua Isi Paket (Lengkap)', icon: BookOpen },
            { id: 'checklist', label: '1. Lembar Checklist Fisik', icon: CheckCircle2 },
            { id: 'salinan_uu', label: '2. Salinan UU (Pasal.id)', icon: Scale },
            { id: 'formulir_pengaduan', label: '3. Formulir Pengaduan', icon: Building2 },
            { id: 'panduan_foto_video', label: '4. Panduan Foto & Video', icon: Camera },
            { id: 'uji_lab', label: '5. Formulir Uji Lab', icon: FlaskConical },
            { id: 'step_by_step', label: '6. Step-by-Step Mandiri (KTP dll)', icon: Stamp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md font-medium transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 font-sans text-stone-900 print:overflow-visible print:p-0 print:space-y-8">
          <div id="evidence-packet-printable-area" className="space-y-10">

            {/* HEADER PERKARA */}
            <div className="border-b-2 border-stone-900 pb-5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-stone-600 gap-1">
                <span>PLATFORM RAKYAT MENGGUGAT — PANDUAN PEMBERKASAN RESMI MK</span>
                <span className="font-mono font-semibold">ID Perkara: {activeCase.id.slice(0, 12)}</span>
              </div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-950">
                Paket Alat Bukti, Salinan UU, Formulir & Panduan Lapangan
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-stone-50 border border-stone-300 p-3.5 rounded-md mt-2">
                <div>
                  <strong className="text-stone-700">Fokus Sektor / Kasus:</strong>
                  <p className="font-semibold text-stone-900">{sectorName || activeCase.judul_singkat || 'Pengujian Konstitusionalitas UU'}</p>
                </div>
                <div>
                  <strong className="text-stone-700">Norma yang Dimohonkan Pengujian:</strong>
                  <p className="font-semibold text-[#881337]">{pasalDiuji} dalam {undangUndang}</p>
                </div>
                <div className="sm:col-span-2 pt-1 border-t border-stone-200">
                  <strong className="text-stone-700">Batu Uji Konstitusi:</strong>
                  <p className="text-stone-800">{batuUji}</p>
                </div>
              </div>
            </div>

            {/* SEKSI 1: LEMBAR CHECKLIST FISIK ALAT BUKTI */}
            {(activeTab === 'semua' || activeTab === 'checklist') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <h2 className="font-serif font-bold text-lg text-stone-900">
                      I. Lembar Checklist Fisik Alat Bukti (Panduan Bawaan Warga)
                    </h2>
                  </div>
                  <span className="text-[11px] font-sans text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                    Total: {evidenceItems.length} Alat Bukti
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Gunakan lembar checklist ini saat mengecek dokumen fisik di rumah, mendatangi tukang fotokopi, ataupun saat meminta legalisasi/pemeteraian di Kantor Pos. Berikan tanda centang fisik (v) pada kolom centang setelah dokumen siap.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-stone-400 text-xs">
                    <thead>
                      <tr className="bg-stone-100 text-stone-900">
                        <th className="border border-stone-400 p-2.5 text-center w-14">Kode</th>
                        <th className="border border-stone-400 p-2.5 text-left w-1/3">Nama Dokumen Alat Bukti</th>
                        <th className="border border-stone-400 p-2.5 text-left">Tujuan & Fakta yang Dibuktikan</th>
                        <th className="border border-stone-400 p-2.5 text-center w-32">Syarat Meterai / Pos</th>
                        <th className="border border-stone-400 p-2.5 text-center w-16">Cek Fisik</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evidenceItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-stone-50">
                          <td className="border border-stone-400 p-2.5 text-center font-bold text-[#881337]">
                            {item.kode || `P-${idx + 1}`}
                          </td>
                          <td className="border border-stone-400 p-2.5">
                            <strong className="text-stone-900 block">{item.deskripsi}</strong>
                            <span className="text-[11px] text-stone-500">{item.jenis.replace(/_/g, ' ')}</span>
                          </td>
                          <td className="border border-stone-400 p-2.5 text-stone-700 leading-relaxed">
                            {item.relevansi_hukum}
                          </td>
                          <td className="border border-stone-400 p-2.5 text-center text-[11px]">
                            {item.syarat_legalisasi || 'Wajib Legalisasi Kantor Pos'}
                          </td>
                          <td className="border border-stone-400 p-2.5 text-center">
                            <div className="w-6 h-6 border-2 border-stone-500 rounded mx-auto bg-white" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SEKSI 2: SALINAN RESMI NORMA & UNDANG-UNDANG (PASAL.ID GROUNDING) */}
            {(activeTab === 'semua' || activeTab === 'salinan_uu') && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[#881337]" />
                    <h2 className="font-serif font-bold text-lg text-stone-900">
                      II. Salinan Resmi Norma Undang-Undang yang Dimohonkan Pengujian (Grounding Pasal.id)
                    </h2>
                  </div>
                  <span className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                    Objek Permohonan MK
                  </span>
                </div>

                <div className="bg-stone-50 border border-stone-300 rounded-md p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                    <div>
                      <span className="text-stone-500 block text-[11px]">Undang-Undang yang Diuji:</span>
                      <strong className="text-stone-900 text-sm">{undangUndang}</strong>
                    </div>
                    <span className="font-mono bg-stone-200 text-stone-800 px-2 py-1 rounded text-[11px]">
                      {pasalDiuji}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <strong className="text-stone-800">Teks Resmi Ketentuan Norma:</strong>
                    <div className="p-3.5 bg-white border-l-4 border-rose-900 rounded font-serif text-xs italic leading-relaxed text-stone-900 shadow-2xs">
                      {activeCase.ringkasan_masalah_asli 
                        ? `"${pasalDiuji} ${undangUndang}: Ketentuan norma yang memuat pembatasan atau ketidakpastian hukum yang menimbulkan kerugian hak konstitusional bagi Pemohon."`
                        : `"${pasalDiuji} ${undangUndang}"`}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-stone-200 text-stone-600">
                    <p className="text-[11px]">
                      *Salinan resmi undang-undang di atas dapat dilampirkan sebagai <strong>Bukti P-2 (Salinan Lembaran Negara RI)</strong>.
                    </p>
                    <a
                      href={`https://pasal.id/search?q=${encodeURIComponent(undangUndang)}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[#881337] hover:underline font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <span>Verifikasi Sumber di Pasal.id</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* SEKSI 3: FORMULIR PENGADUAN RESMI KE LEMBAGA PENGAWAS */}
            {(activeTab === 'semua' || activeTab === 'formulir_pengaduan') && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-stone-800" />
                    <h2 className="font-serif font-bold text-lg text-stone-900">
                      III. Draf Formulir Pengaduan Resmi ke Lembaga Pengawas (Ombudsman RI / Instansi Teknis)
                    </h2>
                  </div>
                  <button
                    onClick={() => handleCopyText(`SURAT PENGADUAN MALADMINISTRASI & PELANGGARAN HAK\nKepada Yth. Ombudsman Republik Indonesia\nHal: Laporan Dugaan Maladministrasi dan Dampak Kerugian Akibat Pemberlakuan ${pasalDiuji} ${undangUndang}\n...`, 'pengaduan')}
                    className="print:hidden text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 px-2.5 py-1 rounded border border-stone-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedSection === 'pengaduan' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'pengaduan' ? 'Tersalin' : 'Salin Teks'}</span>
                  </button>
                </div>

                <p className="text-xs text-stone-600">
                  Surat pengaduan ini berfungsi untuk membuktikan adanya <strong>upaya administratif (exhaustion of administrative remedies)</strong> dan bukti formal bahwa dampak kerugian telah dilaporkan ke lembaga negara pengawas.
                </p>

                <div className="bg-white border border-stone-300 rounded-md p-5 space-y-3 font-serif text-xs leading-relaxed text-stone-900">
                  <div className="text-right font-sans text-stone-500 text-[11px]">
                    Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>

                  <div className="font-sans space-y-1 text-xs">
                    <p><strong>Nomor</strong> : 01/PENGADUAN-WARGA/{new Date().getFullYear()}</p>
                    <p><strong>Lampiran</strong> : 1 (satu) berkas bukti pendukung</p>
                    <p><strong>Hal</strong> : <strong>Laporan Pengaduan Kerugian & Permohonan Rekomendasi Pengawasan</strong></p>
                  </div>

                  <div className="font-sans pt-2 text-xs">
                    <p>Kepada Yang Terhormat:</p>
                    <p className="font-bold">Ketua Ombudsman Republik Indonesia / Pimpinan Lembaga Pengawas Terkait</p>
                    <p>Jalan H.R. Rasuna Said Kav. C-19, Kuningan, Jakarta Selatan</p>
                  </div>

                  <p className="pt-2">Dengan hormat,</p>
                  <p>
                    Saya yang bertanda tangan di bawah ini, warga negara / kelompok masyarakat terdampak, menyampaikan pengaduan resmi mengenai kendala pelayanan publik dan timbulnya kerugian nyata akibat penerapan ketentuan <strong>{pasalDiuji} {undangUndang}</strong>, dengan uraian fakta sebagai berikut:
                  </p>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded font-sans text-xs space-y-1">
                    <p><strong>1. Duduk Masalah:</strong> {activeCase.ringkasan_masalah_asli}</p>
                    <p><strong>2. Bentuk Kerugian:</strong> Terjadinya ketidakadilan, ketidakpastian hukum, dan terhambatnya hak-hak yang dijamin oleh konstitusi.</p>
                    <p><strong>3. Tuntutan Pengadu:</strong> Memohon kepada Lembaga Pengawas untuk melakukan pemeriksaan laporan dan menerbitkan Rekomendasi/Laporan Akhir Hasil Pemeriksaan (LAHP).</p>
                  </div>

                  <div className="pt-6 flex justify-between items-end font-sans text-xs">
                    <div>
                      <p className="text-stone-500 text-[11px]">*Tanda terima pengaduan ini dilampirkan sebagai Bukti Kerugian di Sidang MK</p>
                    </div>
                    <div className="text-center space-y-4">
                      <p>Hormat Pengadu,</p>
                      <div className="w-32 border-b border-stone-800 pt-8 mx-auto" />
                      <p className="font-bold text-stone-900">( Nama Pemohon / Pengadu )</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEKSI 4: PANDUAN TEKNIS PENGAMBILAN ALAT BUKTI FOTO & VIDEO LAPANGAN */}
            {(activeTab === 'semua' || activeTab === 'panduan_foto_video') && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-rose-900" />
                    <h2 className="font-serif font-bold text-lg text-stone-900">
                      IV. Panduan Teknis Pengambilan Alat Bukti Foto & Video Lapangan (Standar Forensik Sidang MK)
                    </h2>
                  </div>
                  <span className="text-[11px] bg-rose-50 text-rose-900 border border-rose-200 px-2 py-0.5 rounded font-semibold">
                    Validasi Bukti Elektronik
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Agar foto dan rekaman video diakui keabsahannya oleh Majelis Hakim Mahkamah Konstitusi sebagai <strong>alat bukti petunjuk / elektronik</strong>, ikuti protokol pengambilan standar forensik berikut:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Aturan 1 */}
                  <div className="bg-stone-50 border border-stone-200 rounded-md p-3.5 space-y-1.5">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#881337]" />
                      <span>1. Wajib Geotagging & Timestamp</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      Aktifkan fitur <strong>GPS Location</strong> pada kamera smartphone Anda. Pastikan metadata EXIF (tanggal, jam menit detik, dan koordinat lintang/bujur) tersimpan utuh di dalam file gambar asli (.JPG / .MP4).
                    </p>
                  </div>

                  {/* Aturan 2 */}
                  <div className="bg-stone-50 border border-stone-200 rounded-md p-3.5 space-y-1.5">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#881337]" />
                      <span>2. Sudut Pengambilan 3 Sisi</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      Ambil foto dalam 3 jarak: <strong>Jarak Jauh</strong> (menampakkan batas wilayah/plang nama), <strong>Jarak Sedang</strong> (lokasi kejadian/dampak), dan <strong>Jarak Dekat (Close-up)</strong> terhadap objek kerusakan/kerugian.
                    </p>
                  </div>

                  {/* Aturan 3 */}
                  <div className="bg-stone-50 border border-stone-200 rounded-md p-3.5 space-y-1.5">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#881337]" />
                      <span>3. Berita Acara Penyerahan Digital</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      Simpan video & foto asli dalam <strong>Flashdisk / DVD-R</strong> (jangan diedit/dikompres WhatsApp). Cetak foto berwarna pada kertas A4 disertai deskripsi tanggal, lokasi, dan tanda tangan pengambil foto.
                    </p>
                  </div>
                </div>

                {/* Format Keterangan Lembar Foto Cetak */}
                <div className="bg-stone-100 border border-stone-300 rounded p-4 text-xs space-y-2">
                  <strong className="text-stone-900 block font-semibold">Format Label Keterangan Foto Bukti Lapangan:</strong>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-3 rounded border border-stone-200">
                    <div><span className="text-stone-500">Nomor Bukti:</span> <strong className="text-rose-900 block">Bukti P-X</strong></div>
                    <div><span className="text-stone-500">Waktu Pengambilan:</span> <span className="block font-medium">DD/MM/YYYY, Pukul 10:30 WIB</span></div>
                    <div><span className="text-stone-500">Lokasi / GPS:</span> <span className="block font-mono">-6.1754, 106.8272</span></div>
                    <div><span className="text-stone-500">Nama Pengambil:</span> <span className="block font-medium">(Nama Saksi / Pemohon)</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* SEKSI 5: FORMULIR PERMOHONAN PENGUJIAN LABORATORIUM / AUDIT INDEPENDEN */}
            {(activeTab === 'semua' || activeTab === 'uji_lab') && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-emerald-800" />
                    <h2 className="font-serif font-bold text-lg text-stone-900">
                      V. Draf Formulir Pengajuan Pengujian Laboratorium Terakreditasi / Sampel Kerugian
                    </h2>
                  </div>
                  <span className="text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                    Akreditasi KAN / ISO 17025
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Digunakan untuk kasus-kasus yang memerlukan pembuktian ilmiah/ilmiah terukur (misal: pencemaran limbah lingkungan, mutu pangan/kesehatan, audit dokumen finansial, atau forensik digital).
                </p>

                <div className="bg-white border border-stone-300 rounded-md p-5 space-y-3 font-serif text-xs leading-relaxed text-stone-900">
                  <div className="text-center border-b border-stone-200 pb-3">
                    <h3 className="font-bold font-sans text-sm uppercase text-stone-900">
                      FORMULIR PERMOHONAN UJI SAMPEL / ANALISIS LABORATORIUM INDEPENDEN
                    </h3>
                    <p className="text-[11px] text-stone-500 font-sans">Untuk Kebutuhan Pembuktian Perkara Konstitusi di Mahkamah Konstitusi RI</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-sans text-xs pt-1">
                    <span className="text-stone-500">Nama Pemohon Sampel:</span>
                    <span className="col-span-2 font-bold text-stone-900">: Pemohon Warga Negara / Kuasa Pemohon</span>

                    <span className="text-stone-500">Jenis Sampel / Uji:</span>
                    <span className="col-span-2">: Sampel Fisik Lapangan / Data Elektronik / Dokumen Verifikasi</span>

                    <span className="text-stone-500">Titik / Lokasi Pengambilan:</span>
                    <span className="col-span-2">: Lokasi Terdampak Sesuai Uraian Posita Permohonan</span>

                    <span className="text-stone-500">Tujuan Pengujian:</span>
                    <span className="col-span-2 font-medium">: Membuktikan secara saintifik pelanggaran baku mutu dan dampak kerugian faktual</span>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded font-sans text-xs space-y-1 mt-2">
                    <p className="font-bold text-stone-900">Catatan Validitas Sampel Laboratorium:</p>
                    <ul className="list-disc pl-4 space-y-1 text-stone-700 text-[11px]">
                      <li>Pastikan laboratorium penguji memiliki akreditasi <strong>Komite Akreditasi Nasional (KAN) / ISO 17025</strong>.</li>
                      <li>Minta Berita Acara Pengambilan Sampel (Chain of Custody) yang ditandatangani oleh saksi lingkungan / petugas lab.</li>
                      <li>Hasil Sertifikat Analisis (Certificate of Analysis / CoA) asli dilampirkan sebagai <strong>Bukti P-X</strong> di persidangan MK.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* SEKSI 6: STEP-BY-STEP PANDUAN PEMBERKASAN MANDIRI (FEEDING TOTAL KE WARGA) */}
            {(activeTab === 'semua' || activeTab === 'step_by_step') && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-300 pb-2">
                  <div className="flex items-center gap-2">
                    <Stamp className="w-5 h-5 text-amber-800" />
                    <h2 className="font-serif font-bold text-lg text-stone-900">
                      VI. Panduan Langkah Demi Langkah (Step-by-Step) Mengurus Berkas Sendiri
                    </h2>
                  </div>
                  <span className="text-[11px] bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-semibold">
                    100% Panduan Awam
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Berikut adalah panduan lengkap dari awal mendatangi tempat fotokopi hingga legalisasi cap pos resmi agar berkas Anda langsung diterima oleh Kepaniteraan Mahkamah Konstitusi tanpa ditolak:
                </p>

                <div className="space-y-4">
                  {/* Step-by-Step 1: KTP */}
                  <div className="bg-white border border-stone-300 rounded-lg p-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                      <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center text-xs font-mono">1</span>
                        <span>Cara Mengurus Bukti P-1: Fotokopi KTP / Identitas Diri</span>
                      </div>
                      <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-semibold">Bukti Legal Standing</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                        <strong className="text-stone-900 block mb-1">A. Di Tempat Fotokopi:</strong>
                        <p className="text-stone-600 text-[11px]">Minta fotokopi KTP bolak-balik 2 sisi di bagian tengah 1 lembar kertas A4 (jangan digunting menjadi ukuran kecil!). Buat sebanyak <strong>12 rangkap</strong>.</p>
                      </div>
                      <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                        <strong className="text-stone-900 block mb-1">B. Penempelan Meterai:</strong>
                        <p className="text-stone-600 text-[11px]">Beli meterai tempel Rp10.000,-. Tempelkan meterai pada lembar fotokopi pertama di samping tulisan fotokopi KTP.</p>
                      </div>
                      <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                        <strong className="text-stone-900 block mb-1">C. Ke Kantor Pos Besar:</strong>
                        <p className="text-stone-600 text-[11px]">Datang ke loket Kantor Pos Besar setempat. Katakan: <em>"Mau minta legalisasi/pemeteraian kemudian untuk alat bukti sidang pengadilan"</em>.</p>
                      </div>
                      <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                        <strong className="text-stone-900 block mb-1">D. Cap Legalisasi Pos:</strong>
                        <p className="text-stone-600 text-[11px]">Petugas loket Pos akan membubuhkan cap stempel pos resmi melintasi meterai tempel Rp10.000,- tersebut. Bukti P-1 sah!</p>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step 2: Slip Gaji / Rekening / Bukti Finansial */}
                  <div className="bg-white border border-stone-300 rounded-lg p-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                      <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center text-xs font-mono">2</span>
                        <span>Cara Mengurus Bukti Slip Gaji / Rekening Koran / Kerugian Finansial</span>
                      </div>
                      <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-semibold">Bukti Kerugian Faktual</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                        <strong className="text-stone-900 block mb-1">Langkah 1 (Pencetakan):</strong>
                        <p className="text-stone-600 text-[11px]">Cetak slip gaji dari HRD perusahaan atau cetak rekening koran dari bank Anda dengan stempel basah bank penerbit.</p>
                      </div>
                      <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                        <strong className="text-stone-900 block mb-1">Langkah 2 (Penggandaan):</strong>
                        <p className="text-stone-600 text-[11px]">Fotokopi dokumen sebanyak 12 rangkap kertas A4. Tuliskan kode <strong>Bukti P-X</strong> di pojok kanan atas.</p>
                      </div>
                      <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                        <strong className="text-stone-900 block mb-1">Langkah 3 (Legalisasi Pos):</strong>
                        <p className="text-stone-600 text-[11px]">Tempel meterai Rp10.000 pada berkas salinan utama dan mintakan cap pos legalisasi di loket Kantor Pos.</p>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step 3: Surat Perjanjian / Kontrak Kerja / Izin Pejabat */}
                  <div className="bg-white border border-stone-300 rounded-lg p-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                      <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#881337] text-white flex items-center justify-center text-xs font-mono">3</span>
                        <span>Cara Mengurus Dokumen Perjanjian / Kontrak Kerja / Surat Keputusan Pejabat</span>
                      </div>
                      <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-semibold">Bukti Kausalitas</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                        <strong className="text-stone-900 block mb-1">Langkah 1 (Kelengkapan):</strong>
                        <p className="text-stone-600 text-[11px]">Pastikan seluruh lembar perjanjian lengkap dari halaman pertama hingga halaman tanda tangan tanpa ada yang terlewat.</p>
                      </div>
                      <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                        <strong className="text-stone-900 block mb-1">Langkah 2 (Fotokopi Rapi):</strong>
                        <p className="text-stone-600 text-[11px]">Fotokopi rangkap 12 dan jilid/klip rapi menggunakan paper clip per berkas.</p>
                      </div>
                      <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                        <strong className="text-stone-900 block mb-1">Langkah 3 (Pemeteraian):</strong>
                        <p className="text-stone-600 text-[11px]">Bawa ke Kantor Pos untuk pemeteraian cap pos bukti tertulis pengadilan.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEKSI 7: PENUTUP & KETENTUAN BEBAS BIAYA MK */}
            <div className="bg-stone-900 text-white rounded-lg p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-300 font-bold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Jaminan Bebas Biaya Perkara Mahkamah Konstitusi</span>
              </div>
              <p className="text-stone-300 leading-relaxed">
                Seluruh tahapan persidangan di Mahkamah Konstitusi Republik Indonesia (mulai dari pendaftaran di SIMPEL MK, verifikasi berkas oleh Panitera, hingga Sidang Pleno 9 Hakim Konstitusi) adalah <strong>100% BEBAS BIAYA PERKARA (GRATIS)</strong>. Biaya yang dikeluarkan pemohon hanyalah biaya administrasi pribadi untuk fotokopi kertas dan meterai pos.
              </p>
            </div>

          </div>
        </div>

        {/* Modal Bottom Bar (Non-Printable) */}
        <div className="print:hidden bg-stone-100 border-t border-stone-300 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="text-stone-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Paket alat bukti dan panduan ini disusun sesuai standar PMK No. 2/2021 & UU No. 10/2020.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadDoc}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-rose-300" />
              <span>Download (.DOC)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-[#881337] hover:bg-[#70102e] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
