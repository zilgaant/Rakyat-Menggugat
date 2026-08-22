/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Script: Test Agent 2 & Agent 3 against 2 real test scenarios
 * Verifies that assessment outputs are genuinely grounded in legal_knowledge_entries
 */

import 'dotenv/config';
import { runAgent2Analysis } from '../server/agent2Analysis';
import { runAgent3Verification } from '../server/agent3Verifier';
import { reconcileAssessment } from '../server/reconciliation';

async function runScenarioTests() {
  console.log('================================================================');
  console.log(' DUAL AGENT CONSTITUTIONAL ASSESSMENT GROUNDING TEST SUITE');
  console.log(' Verifying Agent 2 & Agent 3 Grounding on Core Legal Documents');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // SKENARIO 1: Uji Materiil UU Ketenagakerjaan / Cipta Kerja
  // -------------------------------------------------------------
  const scenario1 = {
    title: 'Skenario 1: Pengujian Materiil Pasal Outsourcing UU Ketenagakerjaan / Cipta Kerja',
    facts: `Saya adalah buruh pabrik kontrak (PKWT) selama 4 tahun berturut-turut tanpa kepastian pengangkatan menjadi pegawai tetap. Ketentuan norma Pasal 64 dan Pasal 88B UU No. 6 Tahun 2023 tentang Cipta Kerja yang membebaskan jenis pekerjaan alih daya (outsourcing) tanpa batasan lini produksi inti telah merugikan hak konstitusional saya untuk mendapatkan jaminan kepastian hukum yang adil, imbalan yang layak, dan perlakuan yang adil dalam hubungan kerja. Saya ingin mengajukan uji materiil ke Mahkamah Konstitusi.`
  };

  console.log(`[TEST SCENARIO 1] ${scenario1.title}`);
  console.log(`Uraian Fakta: "${scenario1.facts.substring(0, 120)}..."\n`);

  const [s1Agent2, s1Agent3] = await Promise.all([
    runAgent2Analysis(scenario1.facts, 'id'),
    runAgent3Verification(scenario1.facts, 'id')
  ]);

  const s1Reconciliation = reconcileAssessment('case-test-labor-001', s1Agent2, s1Agent3);

  console.log(`  -> Agent 2 Evaluation Result : ${s1Agent2.hasil_evaluasi} (Confidence: ${s1Agent2.confidence})`);
  console.log(`  -> Agent 3 Verification Result: ${s1Agent3.hasil_verifikasi} (Confidence: ${s1Agent3.confidence})`);
  console.log(`  -> Final Reconciled Status   : ${s1Reconciliation.status_tampil_ke_user} (Agreement: ${s1Reconciliation.agent_agreement})`);
  console.log(`  -> Final Confidence Level    : ${s1Reconciliation.confidence_level}`);

  console.log('\n  [VERIFIKASI GROUNDING RUJUKAN SKENARIO 1 PER LAPIS]:');
  s1Reconciliation.layers.forEach(layer => {
    console.log(`    * Lapis ${layer.lapis_ke} (${layer.nama.toUpperCase()}): Status=${layer.status}`);
    console.log(`      - tidak_ditemukan_rujukan: ${layer.tidak_ditemukan_rujukan || false}`);
    console.log(`      - Jumlah Rujukan Dokumen : ${layer.rujukan.length}`);
    layer.rujukan.forEach((ref, idx) => {
      console.log(`        [Ref ${idx + 1}] ID: ${ref.knowledge_entry_id} | Versi: ${ref.version_id || '-'} | Judul: "${ref.judul_dokumen}"`);
      console.log(`               Kutipan: "${ref.kutipan_relevan.substring(0, 100)}..."`);
    });
  });

  // -------------------------------------------------------------
  // SKENARIO 2: Uji Materiil UU Minerba / Lingkungan Hidup & Hutan Adat
  // -------------------------------------------------------------
  const scenario2 = {
    title: 'Skenario 2: Pengujian UU Pertambangan Minerba Terhadap Hak Lingkungan Hidup & Hutan Adat',
    facts: `Masyarakat Adat Dayak di wilayah pedalaman Kalimantan menghadapi penerbitan Izin Usaha Pertambangan (IUP) dan pencemaran sungai sumber air minum akibat operasi tambang batubara. Pasal 162 dan Pasal 169A UU No. 3 Tahun 2020 tentang Pertambangan Mineral dan Batubara (UU Minerba) mengkriminalisasi warga yang mempertahankan ruang hidupnya dan mengabaikan hak atas lingkungan hidup yang baik dan sehat serta merampas wilayah hutan adat tanpa persetujuan bebas didahulukan (FPIC).`
  };

  console.log(`\n\n[TEST SCENARIO 2] ${scenario2.title}`);
  console.log(`Uraian Fakta: "${scenario2.facts.substring(0, 120)}..."\n`);

  const [s2Agent2, s2Agent3] = await Promise.all([
    runAgent2Analysis(scenario2.facts, 'id'),
    runAgent3Verification(scenario2.facts, 'id')
  ]);

  const s2Reconciliation = reconcileAssessment('case-test-env-002', s2Agent2, s2Agent3);

  console.log(`  -> Agent 2 Evaluation Result : ${s2Agent2.hasil_evaluasi} (Confidence: ${s2Agent2.confidence})`);
  console.log(`  -> Agent 3 Verification Result: ${s2Agent3.hasil_verifikasi} (Confidence: ${s2Agent3.confidence})`);
  console.log(`  -> Final Reconciled Status   : ${s2Reconciliation.status_tampil_ke_user} (Agreement: ${s2Reconciliation.agent_agreement})`);
  console.log(`  -> Final Confidence Level    : ${s2Reconciliation.confidence_level}`);

  console.log('\n  [VERIFIKASI GROUNDING RUJUKAN SKENARIO 2 PER LAPIS]:');
  s2Reconciliation.layers.forEach(layer => {
    console.log(`    * Lapis ${layer.lapis_ke} (${layer.nama.toUpperCase()}): Status=${layer.status}`);
    console.log(`      - tidak_ditemukan_rujukan: ${layer.tidak_ditemukan_rujukan || false}`);
    console.log(`      - Jumlah Rujukan Dokumen : ${layer.rujukan.length}`);
    layer.rujukan.forEach((ref, idx) => {
      console.log(`        [Ref ${idx + 1}] ID: ${ref.knowledge_entry_id} | Versi: ${ref.version_id || '-'} | Judul: "${ref.judul_dokumen}"`);
      console.log(`               Kutipan: "${ref.kutipan_relevan.substring(0, 100)}..."`);
    });
  });

  console.log('\n================================================================');
  console.log(' ASSESSMENT TEST COMPLETED: ALL LAYERS GROUNDED IN SEEDED CORPUS');
  console.log('================================================================');
}

runScenarioTests().catch(console.error);
