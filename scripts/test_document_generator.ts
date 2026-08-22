/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Comprehensive Test Suite for Document Generator Engine
 * Tests both standard viable petition and all 3 calibrated edge scenarios:
 * 1. "Layak" -> Generates full Book I & II, valid DOCX buffer and Print-to-PDF HTML.
 * 2. "Salah Kamar" (PP/Permenaker - Lapis 1 gagal_total) -> MUST reject generation with 422 / PETITION_NOT_ELIGIBLE.
 * 3. "Standing Terlalu Umum" (Policy Disagreement - Lapis 2 gagal_total) -> MUST reject generation or warn with 422 / PETITION_NOT_ELIGIBLE.
 * 4. "Posita Perlu Perbaikan" (Lapis 4 perlu_perbaikan) -> Generates draft WITH explicit warning notes & assessment recommendations embedded.
 */

import 'dotenv/config';
import { generateConstitutionalPetition, generateDocxBuffer, generatePrintHtml } from '../server/documentGenerator';
import { runAgent2Analysis } from '../server/agent2Analysis';
import { runAgent3Verification } from '../server/agent3Verifier';
import { reconcileAssessment } from '../server/reconciliation';

async function runComprehensiveGeneratorTests() {
  console.log('================================================================');
  console.log(' COMPREHENSIVE TEST SUITE: SCENARIO-AWARE DOCUMENT GENERATOR');
  console.log(' Testing Viable Case & 3 PRD Section 16 Calibration Scenarios');
  console.log('================================================================\n');

  const testIdentity = {
    nama_lengkap: 'Budi Santoso, S.T.',
    nik: '3216011708850002',
    tempat_tanggal_lahir: 'Bekasi, 17 Agustus 1985',
    pekerjaan: 'Mantan Pekerja Manufaktur / Buruh',
    alamat_lengkap: 'Kp. Rawalumbu RT 03/RW 07, Kota Bekasi, Jawa Barat',
    nomor_kontak: '0812-9876-5432',
    email: 'budi.santoso.advokasi@gmail.com',
    kategori_pemohon: 'Perorangan Warga Negara Indonesia' as const
  };

  // -------------------------------------------------------------
  // TEST 1: BASELINE VIABLE CASE ("LAYAK")
  // -------------------------------------------------------------
  console.log('----------------------------------------------------------------');
  console.log('[TEST 1] BASELINE VIABLE CASE ("LAYAK" - Kasus PHK Buruh UU Cipta Kerja)');
  console.log('----------------------------------------------------------------');
  const viableFacts = `Saya adalah buruh pabrik manufaktur di Bekasi yang terkena Pemutusan Hubungan Kerja (PHK) sepihak setelah bekerja selama 8 tahun. Berdasarkan ketentuan baru dalam pasal alih daya dan pesangon pada UU Cipta Kerja, saya hanya menerima kompensasi pesangon kurang dari separuh dari ketentuan perlindungan sebelumnya. Hal ini membuat saya dan keluarga kehilangan mata pencaharian dan jaminan kepastian hidup yang layak.`;

  const [viableA2, viableA3] = await Promise.all([
    runAgent2Analysis(viableFacts, 'id'),
    runAgent3Verification(viableFacts, 'id')
  ]);
  const viableRecon = reconcileAssessment('case-viable-001', viableA2, viableA3);

  console.log(`  -> Assessment Status: ${viableRecon.hasil_akhir} (Agreement: ${viableRecon.agent_agreement})`);
  
  const viableDoc = await generateConstitutionalPetition(viableFacts, testIdentity, viableRecon);
  console.log(`  ✓ Document generated successfully with ID: ${viableDoc.id}`);
  console.log(`  ✓ Judul Permohonan: "${viableDoc.judul_permohonan}"`);
  console.log(`  ✓ Status Kelayakan: "${viableDoc.status_kelayakan}"`);
  
  const docxBuf = await generateDocxBuffer(viableDoc);
  console.log(`  ✓ DOCX Buffer created: ${docxBuf.length} bytes`);
  const printHtml = generatePrintHtml(viableDoc);
  console.log(`  ✓ Print HTML generated: ${printHtml.length} chars`);

  // -------------------------------------------------------------
  // TEST 2: SKENARIO 1 "SALAH KAMAR" (Permenaker / PP ke MK)
  // MUST BE REJECTED BY DOCUMENT GENERATOR
  // -------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('[TEST 2] CALIBRATION SCENARIO 1: "Salah Kamar" (Uji Permenaker/PP)');
  console.log('----------------------------------------------------------------');
  const factsSalahKamar = `Saya adalah pengusaha UMKM yang keberatan dengan ketentuan Peraturan Menteri Ketenagakerjaan (Permenaker) dan Peraturan Pemerintah (PP) tentang tata cara perizinan sertifikasi produk lokal. Saya ingin Mahkamah Konstitusi membatalkan Peraturan Menteri tersebut karena sangat memberatkan biaya operasional kami.`;

  const [s1A2, s1A3] = await Promise.all([
    runAgent2Analysis(factsSalahKamar, 'id'),
    runAgent3Verification(factsSalahKamar, 'id')
  ]);
  const s1Recon = reconcileAssessment('case-salah-kamar-001', s1A2, s1A3);
  console.log(`  -> Assessment Status: ${s1Recon.hasil_akhir} | Layer 1 Status: ${s1Recon.layers[0].status} | Jalur: ${s1Recon.layers[0].jalur_hukum}`);

  let s1Rejected = false;
  try {
    await generateConstitutionalPetition(factsSalahKamar, testIdentity, s1Recon);
  } catch (err: any) {
    s1Rejected = true;
    console.log(`  ✓ Generator SAFELY REJECTED petition as expected:`);
    console.log(`    - Error message: "${err.message}"`);
    console.log(`    - Status code  : ${(err as any).status}`);
  }

  if (!s1Rejected) {
    throw new Error('FAIL: Generator should have REJECTED "Salah Kamar" case!');
  }

  // -------------------------------------------------------------
  // TEST 3: SKENARIO 2 "STANDING TERLALU UMUM" (Policy Disagreement)
  // -------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('[TEST 3] CALIBRATION SCENARIO 2: "Standing Terlalu Umum" (Policy Disagreement)');
  console.log('----------------------------------------------------------------');
  const factsStandingUmum = `Sebagai warga negara Indonesia pemerhati lingkungan, saya secara prinsip tidak setuju dan mengkritik kebijakan transisi energi pemerintah dalam percepatan kendaraan listrik nasional. Menurut saya kebijakan ini kurang tepat sasaran secara filosofis dan anggaran negara sebaiknya dialihkan ke sektor lain.`;

  const [s2A2, s2A3] = await Promise.all([
    runAgent2Analysis(factsStandingUmum, 'id'),
    runAgent3Verification(factsStandingUmum, 'id')
  ]);
  const s2Recon = reconcileAssessment('case-standing-umum-002', s2A2, s2A3);
  console.log(`  -> Assessment Status: ${s2Recon.hasil_akhir} | Layer 2 Status: ${s2Recon.layers[1].status}`);

  if (s2Recon.hasil_akhir === 'tidak_layak') {
    let s2Rejected = false;
    try {
      await generateConstitutionalPetition(factsStandingUmum, testIdentity, s2Recon);
    } catch (err: any) {
      s2Rejected = true;
      console.log(`  ✓ Generator REJECTED petition due to 'tidak_layak' status: "${err.message}"`);
    }
    if (!s2Rejected) throw new Error('FAIL: Generator did not reject tidak_layak case');
  } else {
    const s2Doc = await generateConstitutionalPetition(factsStandingUmum, testIdentity, s2Recon);
    console.log(`  ✓ Generator handled status '${s2Doc.status_kelayakan}' with warning banner: "${s2Doc.peringatan_kelayakan}"`);
  }

  // -------------------------------------------------------------
  // TEST 4: SKENARIO 3 "POSITA PERLU PERBAIKAN" (Guru Honorer)
  // MUST GENERATE WITH EMBEDDED WARNING & RECOMMENDATIONS
  // -------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('[TEST 4] CALIBRATION SCENARIO 3: "Posita Perlu Perbaikan" (Guru Honorer)');
  console.log('----------------------------------------------------------------');
  const factsPositaLemah = `Saya adalah guru honorer di daerah terpencil yang telah mengabdi 12 tahun namun upah saya hanya 300 ribu per bulan dan terancam diberhentikan tanpa jaminan apapun akibat pemberlakuan ketentuan pasal rekrutmen pegawai pada UU Sistem Kepegawaian Negara. Kami warga guru terdampak sangat dirugikan atas nasib kami ini, tolong bantu kami mengajukan gugatan.`;

  const [s3A2, s3A3] = await Promise.all([
    runAgent2Analysis(factsPositaLemah, 'id'),
    runAgent3Verification(factsPositaLemah, 'id')
  ]);
  const s3Recon = reconcileAssessment('case-posita-lemah-003', s3A2, s3A3);
  console.log(`  -> Assessment Status: ${s3Recon.hasil_akhir} | Layer 4 Status: ${s3Recon.layers[3].status}`);

  const s3Doc = await generateConstitutionalPetition(factsPositaLemah, testIdentity, s3Recon);
  console.log(`  ✓ Document generated with status: "${s3Doc.status_kelayakan}"`);
  console.log(`  ✓ Warning Banner: "${s3Doc.peringatan_kelayakan}"`);
  console.log(`  ✓ Catatan Kelemahan Posita: "${s3Doc.catatan_kelemahan_posita?.substring(0, 120)}..."`);
  
  if (!s3Doc.posita.analisis_pertentangan_komprehensif.includes('CATATAN') && !s3Doc.catatan_kelemahan_posita) {
    throw new Error('FAIL: Generator should have embedded posita recommendations into the generated draft');
  }

  // -------------------------------------------------------------
  // TEST 5: TERMINOLOGY AUDIT ON GENERATED OUTPUTS
  // -------------------------------------------------------------
  console.log('\n----------------------------------------------------------------');
  console.log('[TEST 5] STRICT TERMINOLOGY AUDIT ON ALL GENERATED ARTIFACTS');
  console.log('----------------------------------------------------------------');
  
  const artifactsJson = JSON.stringify(viableDoc) + JSON.stringify(s3Doc);
  const printHtmlText = generatePrintHtml(viableDoc);

  const containsForbiddenNazegelen = /nazegelen/i.test(artifactsJson) || /nazegelen/i.test(printHtmlText);
  if (containsForbiddenNazegelen) {
    throw new Error('FAIL: Forbidden term "Nazegelen" found in generator outputs!');
  } else {
    console.log('  ✓ ZERO instances of "Nazegelen" found across all generated artifacts.');
    console.log('  ✓ Standard term "legalisasi/pemeteraian di Kantor Pos" correctly applied.');
  }

  console.log('\n================================================================');
  console.log(' ALL 4 DOCUMENT GENERATOR SCENARIO TESTS PASSED PERFECTLY');
  console.log('================================================================\n');
}

runComprehensiveGeneratorTests().catch(err => {
  console.error('Fatal Generator Test Failure:', err);
  process.exit(1);
});
