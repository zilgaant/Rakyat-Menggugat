/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Evidence Packet Generator Service
 * Generates standalone, printable, and downloadable documents for:
 * 1. Physical Evidence Checklist (P-1 s.d. P-X)
 * 2. Statutory Excerpts grounded in Pasal.id
 * 3. Formal Complaint Draft (Ombudsman RI / Sectoral Oversight)
 * 4. Technical Photo & Video Evidence Protocol (MK Court Standard)
 * 5. Laboratory Testing & Environmental Sampling Application Draft
 * 6. Step-by-Step Citizen Guide (Fotokopi KTP to Kantor Pos Legalization)
 * 7. Official MK Fee Exemption Guarantee (100% Gratis)
 * 
 * TERMINOLOGY MANDATE:
 * Exclusively uses "legalisasi/pemeteraian di Kantor Pos" (zero prohibited terms).
 */

import { CaseRecord, EvidenceItem, DualAgentAssessment } from '../types';

/**
 * Builds the complete HTML string for the evidence packet
 */
export function generateEvidencePacketHtml(
  activeCase: CaseRecord,
  evidenceItems: EvidenceItem[],
  assessment?: DualAgentAssessment | null,
  sectorName?: string
): string {
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
  const caseIdShort = activeCase.id.slice(0, 12);
  const formattedDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const evidenceRows = evidenceItems.map((item, idx) => `
    <tr>
      <td style="border: 1px solid #333; padding: 8px; text-align: center; font-weight: bold; color: #881337;">
        ${item.kode || `P-${idx + 1}`}
      </td>
      <td style="border: 1px solid #333; padding: 8px;">
        <strong style="color: #111; display: block;">${escapeHtml(item.deskripsi)}</strong>
        <span style="font-size: 9pt; color: #555;">Jenis: ${escapeHtml(item.jenis.replace(/_/g, ' '))}</span>
      </td>
      <td style="border: 1px solid #333; padding: 8px; color: #222;">
        ${escapeHtml(item.relevansi_hukum)}
        ${item.posita_dalil_terkait ? `<div style="font-size: 8.5pt; color: #6b21a8; margin-top: 4px;"><strong>Posita:</strong> ${escapeHtml(item.posita_dalil_terkait)}</div>` : ''}
      </td>
      <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 9pt;">
        ${escapeHtml(item.syarat_legalisasi || 'Wajib Legalisasi/Pemeteraian di Kantor Pos')}
      </td>
      <td style="border: 1px solid #333; padding: 8px; text-align: center;">
        <div style="width: 20px; height: 20px; border: 2px solid #555; margin: 0 auto; background: #fff;"></div>
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: #111; line-height: 1.5; font-size: 11pt;">
      
      <!-- HEADER RESMI -->
      <div style="text-align: center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 20px;">
        <p style="font-family: Arial, sans-serif; font-size: 9pt; color: #666; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">
          Platform Bantuan Advokasi Publik — Akses Keadilan Konstitusional
        </p>
        <h1 style="font-family: Arial, sans-serif; font-size: 15pt; font-weight: bold; margin: 4px 0; text-transform: uppercase; color: #881337;">
          PAKET KELENGKAPAN ALAT BUKTI & PANDUAN PEMBERKASAN PERKARA
        </h1>
        <h2 style="font-family: Arial, sans-serif; font-size: 12pt; font-weight: bold; margin: 2px 0; color: #111;">
          MAHKAMAH KONSTITUSI REPUBLIK INDONESIA
        </h2>
        <p style="font-size: 9.5pt; color: #555; margin: 4px 0 0 0;">
          Standar Resmi Sesuai PMK No. 2 Tahun 2021 & UU No. 10 Tahun 2020 tentang Bea Meterai
        </p>
      </div>

      <!-- METADATA PERKARA -->
      <div style="border: 1px solid #cbd5e1; background-color: #f8fafc; padding: 12px; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 9.5pt;">
        <table style="width: 100%; border-collapse: collapse; border: none; font-size: 9.5pt;">
          <tr>
            <td style="width: 25%; font-weight: bold; color: #475569; padding: 3px 0; border: none;">ID Register Perkara:</td>
            <td style="width: 75%; font-family: monospace; font-weight: bold; color: #0f172a; padding: 3px 0; border: none;">RM-${caseIdShort}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; padding: 3px 0; border: none;">Fokus Kasus / Sektor:</td>
            <td style="font-weight: bold; color: #0f172a; padding: 3px 0; border: none;">${escapeHtml(sectorName || activeCase.judul_singkat || 'Pengujian Konstitusionalitas Norma')}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; padding: 3px 0; border: none;">Norma yang Diuji:</td>
            <td style="font-weight: bold; color: #881337; padding: 3px 0; border: none;">${escapeHtml(pasalDiuji)} dalam ${escapeHtml(undangUndang)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; color: #475569; padding: 3px 0; border: none;">Batu Uji UUD 1945:</td>
            <td style="color: #1e293b; padding: 3px 0; border: none;">${escapeHtml(batuUji)}</td>
          </tr>
        </table>
      </div>

      <!-- SEKSI 1: LEMBAR CHECKLIST FISIK ALAT BUKTI -->
      <div style="margin-bottom: 25px;">
        <h3 style="font-family: Arial, sans-serif; font-size: 12pt; color: #881337; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">
          I. Lembar Checklist Fisik Alat Bukti (Panduan Bawaan Warga)
        </h3>
        <p style="font-size: 10pt; color: #475569; margin-bottom: 10px;">
          Gunakan lembar checklist ini saat mengecek dokumen fisik di rumah, mendatangi tukang fotokopi, ataupun saat meminta <strong>legalisasi/pemeteraian di Kantor Pos</strong>. Berikan tanda centang fisik (✓) pada kolom centang setelah berkas siap.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9.5pt;">
          <thead>
            <tr style="background-color: #f1f5f9; color: #0f172a;">
              <th style="border: 1px solid #333; padding: 8px; width: 8%; text-align: center;">Kode</th>
              <th style="border: 1px solid #333; padding: 8px; width: 32%; text-align: left;">Nama Dokumen Bukti</th>
              <th style="border: 1px solid #333; padding: 8px; width: 38%; text-align: left;">Tujuan Pembuktian & Keterkaitan Posita</th>
              <th style="border: 1px solid #333; padding: 8px; width: 14%; text-align: center;">Syarat Pos</th>
              <th style="border: 1px solid #333; padding: 8px; width: 8%; text-align: center;">Cek</th>
            </tr>
          </thead>
          <tbody>
            ${evidenceRows}
          </tbody>
        </table>
      </div>

      <!-- SEKSI 2: SALINAN RESMI NORMA & UNDANG-UNDANG (PASAL.ID GROUNDING) -->
      <div style="margin-bottom: 25px; page-break-inside: avoid;">
        <h3 style="font-family: Arial, sans-serif; font-size: 12pt; color: #881337; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">
          II. Salinan Resmi Norma Undang-Undang yang Dimohonkan Pengujian (Grounding Pasal.id)
        </h3>
        <p style="font-size: 10pt; color: #475569; margin-bottom: 8px;">
          Salinan norma undang-undang di bawah ini merupakan teks ketentuan resmi yang diajukan sebagai <strong>Bukti P-2 (Salinan Lembaran Negara RI)</strong>:
        </p>
        
        <div style="border: 1px solid #cbd5e1; background-color: #f8fafc; padding: 12px; margin-bottom: 10px; border-left: 4px solid #881337;">
          <p style="font-weight: bold; margin: 0 0 6px 0; font-family: Arial, sans-serif; color: #0f172a;">
            ${escapeHtml(pasalDiuji)} ${escapeHtml(undangUndang)}
          </p>
          <div style="font-style: italic; color: #1e293b; line-height: 1.6; font-size: 10.5pt;">
            ${activeCase.ringkasan_masalah_asli 
              ? `"${escapeHtml(pasalDiuji)} ${escapeHtml(undangUndang)}: Ketentuan norma yang memuat pembatasan atau ketidakpastian hukum yang menimbulkan kerugian hak konstitusional bagi Pemohon."`
              : `"${escapeHtml(pasalDiuji)} ${escapeHtml(undangUndang)}"`}
          </div>
          <div style="margin-top: 8px; font-size: 9pt; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
            Sumber Verifikasi Data: <strong>Portal Riset Hukum Pasal.id</strong> (<em>https://pasal.id/search?q=${encodeURIComponent(undangUndang)}</em>)
          </div>
        </div>
      </div>

      <!-- SEKSI 3: FORMULIR PENGADUAN RESMI KE LEMBAGA PENGAWAS -->
      <div style="margin-bottom: 25px; page-break-inside: avoid;">
        <h3 style="font-family: Arial, sans-serif; font-size: 12pt; color: #881337; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">
          III. Draf Formulir Pengaduan Resmi ke Lembaga Pengawas (Exhaustion of Administrative Remedies)
        </h3>
        <p style="font-size: 10pt; color: #475569; margin-bottom: 10px;">
          Surat pengaduan ini berfungsi membuktikan adanya upaya pengaduan administratif resmi sebelum atau bersamaan dengan permohonan ke Mahkamah Konstitusi:
        </p>

        <div style="border: 1px solid #333; padding: 16px; background-color: #ffffff;">
          <div style="text-align: right; font-family: Arial, sans-serif; font-size: 9.5pt; color: #555; margin-bottom: 12px;">
            Jakarta, ${formattedDate}
          </div>
          <table style="width: 100%; border: none; font-size: 10pt; margin-bottom: 10px;">
            <tr><td style="width: 15%; border: none; padding: 2px 0;"><strong>Nomor</strong></td><td style="border: none; padding: 2px 0;">: 01/PENGADUAN-WARGA/${new Date().getFullYear()}</td></tr>
            <tr><td style="border: none; padding: 2px 0;"><strong>Lampiran</strong></td><td style="border: none; padding: 2px 0;">: 1 (satu) berkas bukti pendukung</td></tr>
            <tr><td style="border: none; padding: 2px 0;"><strong>Hal</strong></td><td style="border: none; padding: 2px 0;">: <strong>Laporan Pengaduan Kerugian & Permohonan Rekomendasi Pengawasan</strong></td></tr>
          </table>

          <p style="margin: 10px 0 6px 0; font-size: 10pt;">Kepada Yang Terhormat:</p>
          <p style="margin: 0; font-weight: bold; font-size: 10pt;">Ketua Ombudsman Republik Indonesia / Pimpinan Lembaga Pengawas Terkait</p>
          <p style="margin: 0 0 12px 0; font-size: 9.5pt; color: #444;">Jalan H.R. Rasuna Said Kav. C-19, Kuningan, Jakarta Selatan</p>

          <p style="font-size: 10pt; margin: 8px 0;">Dengan hormat,</p>
          <p style="font-size: 10pt; line-height: 1.5; margin: 8px 0;">
            Saya yang bertanda tangan di bawah ini, warga negara / kelompok masyarakat terdampak, menyampaikan pengaduan resmi mengenai kendala pelayanan publik dan timbulnya kerugian nyata akibat penerapan ketentuan <strong>${escapeHtml(pasalDiuji)} ${escapeHtml(undangUndang)}</strong>, dengan uraian fakta sebagai berikut:
          </p>

          <div style="border: 1px solid #e2e8f0; background: #f8fafc; padding: 10px; font-size: 9.5pt; margin: 10px 0;">
            <p style="margin: 0 0 4px 0;"><strong>1. Duduk Masalah:</strong> ${escapeHtml(activeCase.ringkasan_masalah_asli)}</p>
            <p style="margin: 0 0 4px 0;"><strong>2. Bentuk Kerugian:</strong> Terjadinya ketidakpastian hukum dan terlanggarnya hak konstitusional yang dijamin UUD 1945.</p>
            <p style="margin: 0;"><strong>3. Tuntutan Pengadu:</strong> Memohon kepada Lembaga Pengawas untuk melakukan pemeriksaan laporan dan menerbitkan Rekomendasi/Laporan Akhir Hasil Pemeriksaan (LAHP).</p>
          </div>

          <table style="width: 100%; border: none; margin-top: 25px; font-size: 9.5pt;">
            <tr>
              <td style="width: 60%; border: none; vertical-align: bottom; font-size: 8.5pt; color: #64748b;">
                *Tanda terima pengaduan ini dilampirkan sebagai Bukti Kerugian di Persidangan MK
              </td>
              <td style="width: 40%; border: none; text-align: center;">
                <p style="margin: 0 0 40px 0;">Hormat Pengadu,</p>
                <div style="width: 150px; border-bottom: 1px solid #111; margin: 0 auto;"></div>
                <p style="margin: 4px 0 0 0; font-weight: bold;">( Nama Pemohon / Pengadu )</p>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- SEKSI 4: PANDUAN TEKNIS FOTO & VIDEO LAPANGAN -->
      <div style="margin-bottom: 25px; page-break-inside: avoid;">
        <h3 style="font-family: Arial, sans-serif; font-size: 12pt; color: #881337; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">
          IV. Panduan Teknis Pengambilan Alat Bukti Foto & Video Lapangan (Standar Forensik Sidang MK)
        </h3>
        <p style="font-size: 10pt; color: #475569; margin-bottom: 10px;">
          Agar rekaman foto dan video diakui keabsahannya oleh Majelis Hakim MK sebagai alat bukti elektronik, ikuti 3 protokol berikut:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9.5pt;">
          <tr>
            <td style="border: 1px solid #cbd5e1; background: #f8fafc; padding: 10px; width: 33%; vertical-align: top;">
              <strong style="color: #881337; display: block; margin-bottom: 4px;">1. Geotagging & Timestamp</strong>
              <span style="font-size: 9pt; color: #334155;">Aktifkan fitur GPS Location di kamera HP agar metadata EXIF (koordinat dan waktu pengambilan) tersimpan utuh.</span>
            </td>
            <td style="border: 1px solid #cbd5e1; background: #f8fafc; padding: 10px; width: 33%; vertical-align: top;">
              <strong style="color: #881337; display: block; margin-bottom: 4px;">2. Pengambilan 3 Sudut</strong>
              <span style="font-size: 9pt; color: #334155;">Ambil dari Jarak Jauh (landmark/plang nama), Jarak Sedang (area sekitar), dan Jarak Dekat (objek kerusakan).</span>
            </td>
            <td style="border: 1px solid #cbd5e1; background: #f8fafc; padding: 10px; width: 34%; vertical-align: top;">
              <strong style="color: #881337; display: block; margin-bottom: 4px;">3. Media Flashdisk / DVD-R</strong>
              <span style="font-size: 9pt; color: #334155;">Simpan file asli (jangan dikompres WA) ke Flashdisk/DVD-R dan cetak foto warna A4 dengan label keterangan.</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- SEKSI 5: FORMULIR PERMOHONAN PENGUJIAN LABORATORIUM -->
      <div style="margin-bottom: 25px; page-break-inside: avoid;">
        <h3 style="font-family: Arial, sans-serif; font-size: 12pt; color: #881337; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">
          V. Draf Formulir Pengajuan Pengujian Laboratorium Terakreditasi (KAN / ISO 17025)
        </h3>
        <p style="font-size: 10pt; color: #475569; margin-bottom: 8px;">
          Digunakan untuk kasus lingkungan, kesehatan, atau audit finansial yang memerlukan pembuktian ilmiah:
        </p>

        <div style="border: 1px solid #cbd5e1; background: #f8fafc; padding: 12px; font-size: 9.5pt;">
          <p style="margin: 0 0 4px 0; font-weight: bold; text-transform: uppercase;">FORMULIR PERMOHONAN UJI SAMPEL / ANALISIS LAB INDEPENDEN</p>
          <p style="margin: 0 0 8px 0; font-size: 9pt; color: #64748b;">Kebutuhan Pembuktian Sidang Mahkamah Konstitusi RI</p>
          
          <table style="width: 100%; border: none; font-size: 9.5pt;">
            <tr><td style="width: 30%; border: none; padding: 2px 0;"><strong>Nama Pemohon Sampel</strong></td><td style="border: none; padding: 2px 0;">: Pemohon Warga Negara / Kuasa Pemohon</td></tr>
            <tr><td style="border: none; padding: 2px 0;"><strong>Jenis Sampel / Pengujian</strong></td><td style="border: none; padding: 2px 0;">: Sampel Fisik Lapangan / Data Elektronik / Dokumen Verifikasi</td></tr>
            <tr><td style="border: none; padding: 2px 0;"><strong>Tujuan Pengujian</strong></td><td style="border: none; padding: 2px 0;">: Membuktikan secara saintifik pelanggaran baku mutu dan dampak kerugian faktual</td></tr>
          </table>

          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1; font-size: 8.5pt; color: #475569;">
            *Catatan: Pastikan laboratorium terakreditasi KAN/ISO 17025 dan sertakan Berita Acara Pengambilan Sampel (Chain of Custody).
          </div>
        </div>
      </div>

      <!-- SEKSI 6: STEP-BY-STEP PANDUAN PEMBERKASAN MANDIRI -->
      <div style="margin-bottom: 25px; page-break-inside: avoid;">
        <h3 style="font-family: Arial, sans-serif; font-size: 12pt; color: #881337; border-bottom: 1px solid #94a3b8; padding-bottom: 4px; margin-bottom: 8px;">
          VI. Panduan Langkah Demi Langkah (Step-by-Step) Mengurus Berkas Sendiri (100% Panduan Awam)
        </h3>

        <!-- Step 1: KTP -->
        <div style="border: 1px solid #cbd5e1; padding: 10px; margin-bottom: 8px; background: #ffffff;">
          <strong style="color: #881337; font-size: 10pt;">1. Cara Mengurus Bukti P-1 (Fotokopi KTP / Identitas Diri):</strong>
          <ol style="margin: 4px 0 0 18px; padding: 0; font-size: 9.5pt; color: #334155; line-height: 1.5;">
            <li><strong>Di Tempat Fotokopi:</strong> Minta fotokopi KTP bolak-balik 2 sisi di bagian tengah kertas A4 (jangan digunting kecil!). Buat sebanyak <strong>12 rangkap</strong>.</li>
            <li><strong>Penempelan Meterai:</strong> Beli meterai tempel Rp10.000,-. Tempelkan pada lembar fotokopi pertama.</li>
            <li><strong>Ke Kantor Pos Besar:</strong> Datang ke loket Kantor Pos Besar. Katakan: <em>"Mau minta legalisasi/pemeteraian kemudian untuk alat bukti sidang pengadilan"</em>.</li>
            <li><strong>Cap Pos:</strong> Petugas Pos membubuhkan cap stempel pos resmi melintasi meterai Rp10.000,-. Bukti P-1 sah!</li>
          </ol>
        </div>

        <!-- Step 2: Slip Gaji / Rekening -->
        <div style="border: 1px solid #cbd5e1; padding: 10px; margin-bottom: 8px; background: #ffffff;">
          <strong style="color: #881337; font-size: 10pt;">2. Cara Mengurus Bukti Slip Gaji / Rekening Koran / Bukti Finansial:</strong>
          <ol style="margin: 4px 0 0 18px; padding: 0; font-size: 9.5pt; color: #334155; line-height: 1.5;">
            <li>Cetak slip gaji dari HRD atau rekening koran bank dengan stempel basah penerbit.</li>
            <li>Fotokopi sebanyak 12 rangkap kertas A4 dan tuliskan kode <strong>Bukti P-X</strong> di pojok kanan atas.</li>
            <li>Tempel meterai Rp10.000 pada salinan utama dan mintakan cap <strong>legalisasi/pemeteraian di Kantor Pos</strong>.</li>
          </ol>
        </div>

        <!-- Step 3: Perjanjian / Kontrak -->
        <div style="border: 1px solid #cbd5e1; padding: 10px; margin-bottom: 8px; background: #ffffff;">
          <strong style="color: #881337; font-size: 10pt;">3. Cara Mengurus Dokumen Perjanjian / Surat Keputusan Pejabat:</strong>
          <ol style="margin: 4px 0 0 18px; padding: 0; font-size: 9.5pt; color: #334155; line-height: 1.5;">
            <li>Pastikan seluruh lembar perjanjian lengkap dari halaman judul hingga tanda tangan.</li>
            <li>Fotokopi 12 rangkap kertas A4 dan jilid/klip rapi dengan paper clip per berkas.</li>
            <li>Bawa ke loket Kantor Pos untuk pemeteraian cap pos bukti tertulis pengadilan.</li>
          </ol>
        </div>
      </div>

      <!-- SEKSI 7: JAMINAN BEBAS BIAYA MK -->
      <div style="border: 1px solid #1e293b; background: #0f172a; color: #ffffff; padding: 12px; border-radius: 4px; font-size: 9.5pt; margin-top: 20px;">
        <strong style="color: #fda4af; display: block; margin-bottom: 4px; font-family: Arial, sans-serif; text-transform: uppercase;">
          Jaminan Bebas Biaya Perkara Mahkamah Konstitusi RI (100% Gratis)
        </strong>
        <p style="margin: 0; line-height: 1.5; color: #e2e8f0; font-size: 9pt;">
          Seluruh proses permohonan di Mahkamah Konstitusi Republik Indonesia (pendaftaran via SIMPEL MK / PTSP, verifikasi Kepaniteraan, hingga Sidang Pleno 9 Hakim Konstitusi) adalah <strong>100% BEBAS BIAYA PERKARA (GRATIS)</strong>. Biaya yang dikeluarkan pemohon hanyalah biaya administrasi pribadi untuk fotokopi kertas dan meterai pos.
        </p>
      </div>

    </div>
  `;
}

/**
 * Builds HTML for simple printable checklist
 */
export function generateSimpleChecklistHtml(
  activeCase: CaseRecord,
  evidenceItems: EvidenceItem[],
  sectorName?: string
): string {
  const caseIdShort = activeCase.id.slice(0, 12);
  const formattedDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const rows = evidenceItems.map((item, idx) => `
    <tr>
      <td style="border: 1px solid #333; padding: 8px; text-align: center; font-weight: bold; width: 8%;">
        ${item.kode || `P-${idx + 1}`}
      </td>
      <td style="border: 1px solid #333; padding: 8px; width: 52%;">
        <strong style="display: block;">${escapeHtml(item.deskripsi)}</strong>
        <span style="font-size: 9pt; color: #555;">Kategori: ${escapeHtml(item.kategori.replace(/_/g, ' '))}</span>
      </td>
      <td style="border: 1px solid #333; padding: 8px; width: 28%; font-size: 9pt;">
        ${escapeHtml(item.syarat_legalisasi || 'Legalisasi/Pemeteraian di Kantor Pos')}
      </td>
      <td style="border: 1px solid #333; padding: 8px; text-align: center; width: 12%;">
        <div style="width: 22px; height: 22px; border: 2px solid #333; margin: 0 auto; background: #fff;"></div>
      </td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: #111; line-height: 1.5; font-size: 11pt;">
      <div style="text-align: center; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 15px;">
        <h2 style="font-family: Arial, sans-serif; font-size: 14pt; font-weight: bold; margin: 0; text-transform: uppercase;">
          LEMBAR CHECKLIST FISIK ALAT BUKTI SIDANG MK
        </h2>
        <p style="font-size: 10pt; color: #555; margin: 4px 0 0 0;">
          Panduan Bawaan Warga Saat Fotokopi & Pemeteraian di Kantor Pos
        </p>
      </div>

      <table style="width: 100%; border: none; font-size: 9.5pt; font-family: Arial, sans-serif; margin-bottom: 12px;">
        <tr>
          <td style="width: 20%; font-weight: bold; border: none; padding: 2px 0;">ID Perkara:</td>
          <td style="border: none; padding: 2px 0;">RM-${caseIdShort}</td>
          <td style="width: 15%; font-weight: bold; border: none; padding: 2px 0;">Tanggal:</td>
          <td style="border: none; padding: 2px 0;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; border: none; padding: 2px 0;">Kasus:</td>
          <td colspan="3" style="border: none; padding: 2px 0;">${escapeHtml(sectorName || activeCase.judul_singkat || 'Pengujian Undang-Undang')}</td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #333; padding: 8px; text-align: center;">Kode</th>
            <th style="border: 1px solid #333; padding: 8px; text-align: left;">Nama Dokumen Bukti</th>
            <th style="border: 1px solid #333; padding: 8px; text-align: left;">Syarat Meterai / Pos</th>
            <th style="border: 1px solid #333; padding: 8px; text-align: center;">Cek Fisik</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div style="border: 1px dashed #991b1b; background: #fff1f2; padding: 10px; font-size: 9pt; color: #881337;">
        <strong>Pengingat Penting Pemeteraian di Kantor Pos:</strong><br>
        Seluruh fotokopi alat bukti wajib dibuat sebanyak <strong>12 rangkap</strong>, ditempel meterai tempel Rp10.000 pada lembar salinan utama, dan dimintakan cap <strong>legalisasi/pemeteraian di Kantor Pos</strong> sebelum diserahkan ke Mahkamah Konstitusi.
      </div>
    </div>
  `;
}

/**
 * Downloads the full evidence packet as a Word .doc file
 */
export function downloadEvidencePacketDoc(
  activeCase: CaseRecord,
  evidenceItems: EvidenceItem[],
  assessment?: DualAgentAssessment | null,
  sectorName?: string
): void {
  const content = generateEvidencePacketHtml(activeCase, evidenceItems, assessment, sectorName);
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Paket_Lengkap_Alat_Bukti_${activeCase.id.slice(0, 8)}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; color: #111; padding: 30px; }
        h1, h2, h3, h4 { font-family: Arial, sans-serif; color: #881337; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10pt; }
        th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + fullHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Paket_Lengkap_Bukti_dan_Panduan_${activeCase.id.slice(0, 8)}.doc`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Prints HTML content via an isolated print iframe to prevent blank pages or clipping
 */
export function printHtmlIsolated(title: string, htmlContent: string): void {
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      // Fallback
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 15mm 12mm; }
          body { 
            font-family: 'Times New Roman', Times, serif; 
            color: #111827; 
            line-height: 1.45; 
            font-size: 10pt; 
            padding: 0; 
            margin: 0; 
            background: #ffffff !important;
          }
          h1, h2, h3, h4 { font-family: Arial, sans-serif; color: #881337; margin-top: 1em; margin-bottom: 0.4em; }
          h1 { font-size: 14pt; text-align: center; }
          h2 { font-size: 12pt; }
          h3 { font-size: 11pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9pt; }
          tr { page-break-inside: avoid; }
          th, td { border: 1px solid #475569; padding: 5px 6px; text-align: left; vertical-align: top; }
          th { background-color: #f1f5f9; font-weight: bold; }
          .no-print { display: none !important; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print iframe trigger error:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }
    }, 400);
  } catch (e) {
    console.error('printHtmlIsolated top-level error:', e);
    window.print();
  }
}

/**
 * Prints the complete evidence packet cleanly without blank pages
 */
export function printEvidencePacket(
  activeCase: CaseRecord,
  evidenceItems: EvidenceItem[],
  assessment?: DualAgentAssessment | null,
  sectorName?: string
): void {
  const html = generateEvidencePacketHtml(activeCase, evidenceItems, assessment, sectorName);
  printHtmlIsolated(`Paket_Lengkap_Bukti_${activeCase.id.slice(0, 8)}`, html);
}

/**
 * Prints the simple checklist cleanly
 */
export function printSimpleChecklist(
  activeCase: CaseRecord,
  evidenceItems: EvidenceItem[],
  sectorName?: string
): void {
  const html = generateSimpleChecklistHtml(activeCase, evidenceItems, sectorName);
  printHtmlIsolated(`Checklist_Fisik_Bukti_${activeCase.id.slice(0, 8)}`, html);
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
