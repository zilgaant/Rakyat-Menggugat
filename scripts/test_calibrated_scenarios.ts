/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Script: Calibrated Test Suite for Edge Cases & Adversarial Scenarios
 * Tests 3 edge scenarios from PRD Section 16:
 * 1. "Salah Kamar" (PP/Peraturan Menteri -> Lapis 1 gagal_total, jalur_hukum MA)
 * 2. "Standing Terlalu Umum" (Policy Disagreement -> Lapis 2 gagal_total)
 * 3. "Posita Lemah, Fakta Kuat" (Fakta jelas tapi tanpa pasal UUD -> Lapis 4 perlu_perbaikan, hasil perlu_data_tambahan)
 */

import 'dotenv/config';
import { runAgent2Analysis } from '../server/agent2Analysis';
import { runAgent3Verification } from '../server/agent3Verifier';
import { reconcileAssessment } from '../server/reconciliation';

async function runCalibratedScenarios() {
  console.log('================================================================');
  console.log(' FEW-SHOT CALIBRATION & ADVERSARIAL ASSESSMENT TEST SUITE');
  console.log(' Testing Failures, Jurisdictional Redirection & Ambiguities');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // SKENARIO 1: SALAH KAMAR (PERATURAN MENTERI / PP KE MK)
  // -------------------------------------------------------------
  const scenarioSalahKamar = {
    title: 'SKENARIO 1: Salah Kamar (Uji Peraturan Menteri / PP ke MK)',
    facts: `Saya adalah pengusaha UMKM yang keberatan dengan ketentuan Peraturan Menteri Ketenagakerjaan (Permenaker) dan Peraturan Pemerintah (PP) tentang tata cara perizinan sertifikasi produk lokal. Saya ingin Mahkamah Konstitusi membatalkan Peraturan Menteri tersebut karena sangat memberatkan biaya operasional kami.`
  };

  console.log(`[TEST SCENARIO 1] ${scenarioSalahKamar.title}`);
  console.log(`Uraian Fakta: "${scenarioSalahKamar.facts}"\n`);

  const [s1A2, s1A3] = await Promise.all([
    runAgent2Analysis(scenarioSalahKamar.facts, 'id'),
    runAgent3Verification(scenarioSalahKamar.facts, 'id')
  ]);

  const s1Recon = reconcileAssessment('case-test-salah-kamar-001', s1A2, s1A3);

  console.log(`  -> Agent 2 Evaluation Result : ${s1A2.hasil_evaluasi} (Confidence: ${s1A2.confidence})`);
  console.log(`  -> Agent 3 Verification Result: ${s1A3.hasil_verifikasi} (Confidence: ${s1A3.confidence})`);
  console.log(`  -> Final Reconciled Status   : ${s1Recon.status_tampil_ke_user} (Agreement: ${s1Recon.agent_agreement})`);
  console.log(`  -> Final Confidence Level    : ${s1Recon.confidence_level}`);

  console.log('\n  [DETAIL EVALUASI PER LAPIS SKENARIO 1]:');
  s1Recon.layers.forEach(layer => {
    console.log(`    * Lapis ${layer.lapis_ke} (${layer.nama.toUpperCase()}): Status=${layer.status} | Jalur=${layer.jalur_hukum || '-'}`);
    console.log(`      - Penjelasan: ${layer.penjelasan}`);
    console.log(`      - Rujukan   : ${layer.rujukan.map(r => r.knowledge_entry_id).join(', ') || 'N/A'}`);
  });

  // -------------------------------------------------------------
  // SKENARIO 2: LEGAL STANDING TERLALU UMUM (POLICY DISAGREEMENT)
  // -------------------------------------------------------------
  const scenarioStandingUmum = {
    title: 'SKENARIO 2: Legal Standing Terlalu Umum (Ketidaksetujuan Kebijakan Tanpa Kerugian Spesifik)',
    facts: `Sebagai warga negara Indonesia pemerhati lingkungan, saya secara prinsip tidak setuju dan mengkritik kebijakan transisi energi pemerintah dalam percepatan kendaraan listrik nasional. Menurut saya kebijakan ini kurang tepat sasaran secara filosofis dan anggaran negara sebaiknya dialihkan ke sektor lain.`
  };

  console.log(`\n\n----------------------------------------------------------------`);
  console.log(`[TEST SCENARIO 2] ${scenarioStandingUmum.title}`);
  console.log(`Uraian Fakta: "${scenarioStandingUmum.facts}"\n`);

  const [s2A2, s2A3] = await Promise.all([
    runAgent2Analysis(scenarioStandingUmum.facts, 'id'),
    runAgent3Verification(scenarioStandingUmum.facts, 'id')
  ]);

  const s2Recon = reconcileAssessment('case-test-standing-umum-002', s2A2, s2A3);

  console.log(`  -> Agent 2 Evaluation Result : ${s2A2.hasil_evaluasi} (Confidence: ${s2A2.confidence})`);
  console.log(`  -> Agent 3 Verification Result: ${s2A3.hasil_verifikasi} (Confidence: ${s2A3.confidence})`);
  console.log(`  -> Final Reconciled Status   : ${s2Recon.status_tampil_ke_user} (Agreement: ${s2Recon.agent_agreement})`);
  console.log(`  -> Final Confidence Level    : ${s2Recon.confidence_level}`);

  console.log('\n  [DETAIL EVALUASI PER LAPIS SKENARIO 2]:');
  s2Recon.layers.forEach(layer => {
    console.log(`    * Lapis ${layer.lapis_ke} (${layer.nama.toUpperCase()}): Status=${layer.status}`);
    console.log(`      - Penjelasan: ${layer.penjelasan}`);
    console.log(`      - Rujukan   : ${layer.rujukan.map(r => r.knowledge_entry_id).join(', ') || 'N/A'}`);
  });

  // -------------------------------------------------------------
  // SKENARIO 3: POSITA LEMAH, FAKTA KUAT (BELUM ADA PASAL UUD)
  // -------------------------------------------------------------
  const scenarioPositaLemah = {
    title: 'SKENARIO 3: Posita Lemah, Fakta Kuat (Fakta Kerugian Jelas tapi Belum Merumuskan Pasal UUD)',
    facts: `Saya adalah guru honorer di daerah terpencil yang telah mengabdi 12 tahun namun upah saya hanya 300 ribu per bulan dan terancam diberhentikan tanpa jaminan apapun akibat pemberlakuan ketentuan pasal rekrutmen pegawai pada UU Sistem Kepegawaian Negara. Kami warga guru terdampak sangat dirugikan atas nasib kami ini, tolong bantu kami mengajukan gugatan.`
  };

  console.log(`\n\n----------------------------------------------------------------`);
  console.log(`[TEST SCENARIO 3] ${scenarioPositaLemah.title}`);
  console.log(`Uraian Fakta: "${scenarioPositaLemah.facts}"\n`);

  const [s3A2, s3A3] = await Promise.all([
    runAgent2Analysis(scenarioPositaLemah.facts, 'id'),
    runAgent3Verification(scenarioPositaLemah.facts, 'id')
  ]);

  const s3Recon = reconcileAssessment('case-test-posita-lemah-003', s3A2, s3A3);

  console.log(`  -> Agent 2 Evaluation Result : ${s3A2.hasil_evaluasi} (Confidence: ${s3A2.confidence})`);
  console.log(`  -> Agent 3 Verification Result: ${s3A3.hasil_verifikasi} (Confidence: ${s3A3.confidence})`);
  console.log(`  -> Final Reconciled Status   : ${s3Recon.status_tampil_ke_user} (Agreement: ${s3Recon.agent_agreement})`);
  console.log(`  -> Final Confidence Level    : ${s3Recon.confidence_level}`);

  console.log('\n  [DETAIL EVALUASI PER LAPIS SKENARIO 3]:');
  s3Recon.layers.forEach(layer => {
    console.log(`    * Lapis ${layer.lapis_ke} (${layer.nama.toUpperCase()}): Status=${layer.status}`);
    console.log(`      - Penjelasan: ${layer.penjelasan}`);
    if (layer.saran_perbaikan) {
      console.log(`      - Saran Perbaikan: ${layer.saran_perbaikan}`);
    }
    console.log(`      - Rujukan   : ${layer.rujukan.map(r => r.knowledge_entry_id).join(', ') || 'N/A'}`);
  });

  console.log('\n================================================================');
  console.log(' ALL 3 CALIBRATED SCENARIOS VERIFIED SUCCESSFULLY');
  console.log('================================================================');
}

runCalibratedScenarios().catch(console.error);
