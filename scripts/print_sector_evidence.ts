/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Skenario Output Print untuk 4 Sektor Pembuktian:
 * 1. Ketenagakerjaan (Labor/PHK/PKWT)
 * 2. Lingkungan Hidup & Pertambangan (Minerba/Limbah)
 * 3. Agraria & Hak Ulayat Adat (Bank Tanah/Girik)
 * 4. Kebebasan Berpendapat / Berekspresi (UU ITE)
 */

import { generateDynamicEvidenceMatrix } from '../server/evidenceGenerator';

function printSectorOutputs() {
  console.log('===============================================================');
  console.log('📊 RAW EVIDENCE MATRICES GENERATED ACROSS 4 SECTORS');
  console.log('===============================================================\n');

  // Skenario 1: Ketenagakerjaan
  const laborFacts = 'Saya buruh pabrik garmen di Cikarang dikontrak PKWT 6 tahun lalu di-PHK sepihak tanpa pesangon berdasarkan UU Cipta Kerja.';
  const laborRes = generateDynamicEvidenceMatrix('case-labor', laborFacts, 'Budi Santoso');
  console.log('--- SEKTOR 1: KETENAGAKERJAAN ---');
  console.log(`Sektor: ${laborRes.sektor_terdeteksi}`);
  console.log(`Ringkasan: ${laborRes.ringkasan_kebutuhan_bukti}`);
  console.log('Items (P-1 s.d. P-X):');
  laborRes.items.forEach(item => {
    console.log(`  [${item.kode}] (${item.jenis}) ${item.deskripsi}`);
    console.log(`       Relevansi: ${item.relevansi_hukum}`);
    console.log(`       Dalil Posita: ${item.posita_dalil_terkait}`);
    console.log(`       Legalisasi: ${item.syarat_legalisasi}`);
    console.log(`       Status: ${item.status}`);
  });
  console.log('');

  // Skenario 2: Lingkungan Hidup
  const envFacts = 'Warga desa kami mengalami pencemaran air bersih akibat pembuangan limbah tambang nikel tanpa amdal.';
  const envRes = generateDynamicEvidenceMatrix('case-env', envFacts, 'Siti Rahma');
  console.log('--- SEKTOR 2: LINGKUNGAN HIDUP & PERTAMBANGAN ---');
  console.log(`Sektor: ${envRes.sektor_terdeteksi}`);
  console.log(`Ringkasan: ${envRes.ringkasan_kebutuhan_bukti}`);
  console.log('Items (P-1 s.d. P-X):');
  envRes.items.forEach(item => {
    console.log(`  [${item.kode}] (${item.jenis}) ${item.deskripsi}`);
    console.log(`       Relevansi: ${item.relevansi_hukum}`);
    console.log(`       Dalil Posita: ${item.posita_dalil_terkait}`);
    console.log(`       Legalisasi: ${item.syarat_legalisasi}`);
    console.log(`       Status: ${item.status}`);
  });
  console.log('');

  // Skenario 3: Agraria & Adat
  const agrFacts = 'Tanah adat ulayat kasepuhan digusur sepihak untuk konsesi Bank Tanah tanpa musyawarah.';
  const agrRes = generateDynamicEvidenceMatrix('case-agr', agrFacts, 'Asep Sunandar');
  console.log('--- SEKTOR 3: AGRARIA & MASYARAKAT ADAT ---');
  console.log(`Sektor: ${agrRes.sektor_terdeteksi}`);
  console.log(`Ringkasan: ${agrRes.ringkasan_kebutuhan_bukti}`);
  console.log('Items (P-1 s.d. P-X):');
  agrRes.items.forEach(item => {
    console.log(`  [${item.kode}] (${item.jenis}) ${item.deskripsi}`);
    console.log(`       Relevansi: ${item.relevansi_hukum}`);
    console.log(`       Dalil Posita: ${item.posita_dalil_terkait}`);
    console.log(`       Legalisasi: ${item.syarat_legalisasi}`);
    console.log(`       Status: ${item.status}`);
  });
  console.log('');

  // Skenario 4: ITE / Kebebasan Berpendapat
  const speechFacts = 'Aktivis dilaporkan pasal 27A UU ITE pencemaran nama baik karena mengkritik transparansi APBD di medsos.';
  const speechRes = generateDynamicEvidenceMatrix('case-speech', speechFacts, 'Fajar Nugraha');
  console.log('--- SEKTOR 4: KEBEBASAN BEREKSPRESI & UU ITE ---');
  console.log(`Sektor: ${speechRes.sektor_terdeteksi}`);
  console.log(`Ringkasan: ${speechRes.ringkasan_kebutuhan_bukti}`);
  console.log('Items (P-1 s.d. P-X):');
  speechRes.items.forEach(item => {
    console.log(`  [${item.kode}] (${item.jenis}) ${item.deskripsi}`);
    console.log(`       Relevansi: ${item.relevansi_hukum}`);
    console.log(`       Dalil Posita: ${item.posita_dalil_terkait}`);
    console.log(`       Legalisasi: ${item.syarat_legalisasi}`);
    console.log(`       Status: ${item.status}`);
  });
  console.log('===============================================================');
}

printSectorOutputs();
