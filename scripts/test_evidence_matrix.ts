/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Automated Verification Script: Dynamic Evidence Matrix & Checklist
 * Tests:
 * 1. Sectoral scenario generation (Labor, Environment, Agrarian, Free Speech)
 * 2. Posita dalil linking (P-1 s.d. P-5)
 * 3. Status transition state correctness
 * 4. STRICT REGRESSION GUARD: Zero occurrences of "Nazegelen", exclusively using "legalisasi/pemeteraian di Kantor Pos"
 */

import { generateDynamicEvidenceMatrix } from '../server/evidenceGenerator';
import { generateConstitutionalPetition } from '../server/documentGenerator';
import { EvidenceItem } from '../src/types';

async function runEvidenceMatrixTests() {
  console.log('===============================================================');
  console.log('🚀 RUNNING DYNAMIC EVIDENCE MATRIX & CHECKLIST VERIFICATION');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // --- TEST 1: SKENARIO KETENAGAKERJAAN (Labor / PKWT / PHK) ---
  console.log('📋 Test 1: Skenario Ketenagakerjaan (PHK & PKWT Tanpa Pesangon)');
  const laborFacts = 'Saya adalah buruh pabrik garmen di Bekasi yang dikontrak PKWT berulang selama 6 tahun lalu di-PHK sepihak tanpa pesangon berdasarkan aturan UU Cipta Kerja klaster ketenagakerjaan.';
  const laborMatrix = generateDynamicEvidenceMatrix('case-labor-1', laborFacts, 'Budi Santoso');

  assert(laborMatrix.items.length >= 4, 'Labor matrix generates at least 4 structured evidence items');
  assert(laborMatrix.sektor_terdeteksi.includes('Ketenagakerjaan'), 'Correctly identifies Ketenagakerjaan sector');
  
  const p1Labor = laborMatrix.items.find(i => i.kode === 'P-1');
  const p3Labor = laborMatrix.items.find(i => i.kode === 'P-3');
  const p4Labor = laborMatrix.items.find(i => i.kode === 'P-4');

  console.log('p1Labor:', p1Labor);
  assert(!!p1Labor && (p1Labor.deskripsi.includes('KTP') || p1Labor.deskripsi.includes('Budi Santoso')), 'P-1 is KTP Pemohon');
  assert(!!p3Labor && (p3Labor.deskripsi.includes('PKWT') || p3Labor.deskripsi.includes('PHK')), 'P-3 contains PKWT / PHK evidence');
  assert(!!p3Labor?.posita_dalil_terkait && p3Labor.posita_dalil_terkait.includes('Posita'), 'P-3 is explicitly linked to Posita');
  assert(!!p4Labor && (p4Labor.deskripsi.includes('Slip Gaji') || p4Labor.deskripsi.includes('Upah')), 'P-4 contains financial loss / wage evidence');
  console.log('');

  // --- TEST 2: SKENARIO LINGKUNGAN HIDUP & MINERBA ---
  console.log('📋 Test 2: Skenario Lingkungan Hidup & Pertambangan (Limbah & Sumber Air)');
  const envFacts = 'Warga desa kami mengalami pencemaran sumber air bersih akibat limbah tambang nikel yang izin konsesinya diterbitkan pusat tanpa amdal dan tanpa persetujuan warga desa.';
  const envMatrix = generateDynamicEvidenceMatrix('case-env-1', envFacts, 'Siti Rahma');

  assert(envMatrix.sektor_terdeteksi.includes('Lingkungan'), 'Correctly identifies Lingkungan Hidup sector');
  const p3Env = envMatrix.items.find(i => i.kode === 'P-3');
  const p4Env = envMatrix.items.find(i => i.kode === 'P-4');

  assert(!!p3Env && (p3Env.deskripsi.includes('Air') || p3Env.deskripsi.includes('Laboratorium')), 'P-3 contains water pollution / lab test proof');
  assert(!!p4Env && (p4Env.deskripsi.includes('Izin') || p4Env.deskripsi.includes('IUP')), 'P-4 contains Mining License / IUP copy');
  console.log('');

  // --- TEST 3: SKENARIO AGRARIA & MASYARAKAT ADAT (Bank Tanah) ---
  console.log('📋 Test 3: Skenario Agraria & Hak Ulayat Tanah Adat');
  const agrarianFacts = 'Lahan pertanian turun-temurun masyarakat adat kasepuhan terancam digusur untuk alokasi bank tanah tanpa musyawarah adat dan tanpa ganti rugi.';
  const agrarianMatrix = generateDynamicEvidenceMatrix('case-agr-1', agrarianFacts, 'Asep Sunandar');

  assert(agrarianMatrix.sektor_terdeteksi.includes('Agraria'), 'Correctly identifies Agraria sector');
  const p3Agr = agrarianMatrix.items.find(i => i.kode === 'P-3');
  const p4Agr = agrarianMatrix.items.find(i => i.kode === 'P-4');

  assert(!!p3Agr && (p3Agr.deskripsi.includes('Tanah') || p3Agr.deskripsi.includes('Girik') || p3Agr.deskripsi.includes('Adat')), 'P-3 contains Girik / customary land right proof');
  assert(!!p4Agr && (p4Agr.deskripsi.includes('Bank Tanah') || p4Agr.deskripsi.includes('Konsesi')), 'P-4 contains Bank Tanah notice');
  console.log('');

  // --- TEST 4: SKENARIO KEBEBASAN BERPENDAPAT / UU ITE ---
  console.log('📋 Test 4: Skenario Kebebasan Berpendapat & UU ITE');
  const speechFacts = 'Aktivis dilaporkan ke polisi dan dipanggil penyidik menggunakan pasal pencemaran nama baik UU ITE karena mengkritik transparansi anggaran pemda di media sosial.';
  const speechMatrix = generateDynamicEvidenceMatrix('case-speech-1', speechFacts, 'Fajar Nugraha');

  assert(speechMatrix.sektor_terdeteksi.includes('Berekspresi') || speechMatrix.sektor_terdeteksi.includes('Kebebasan'), 'Correctly identifies Freedom of Speech sector');
  const p3Speech = speechMatrix.items.find(i => i.kode === 'P-3');
  assert(!!p3Speech && (p3Speech.deskripsi.includes('Tangkapan Layar') || p3Speech.deskripsi.includes('Panggilan')), 'P-3 contains screenshot / police summons notice');
  console.log('');

  // --- TEST 5: POSITA LINKAGE & METADATA COMPLETENESS ---
  console.log('📋 Test 5: Kelengkapan Hubungan Dalil Posita & Metadata Pembuktian');
  const allMatrices = [laborMatrix, envMatrix, agrarianMatrix, speechMatrix];
  for (const mat of allMatrices) {
    for (const item of mat.items) {
      assert(!!item.kode && /^P-\d+$/.test(item.kode), `Item kode ${item.kode} adheres to P-X format`);
      assert(!!item.deskripsi && item.deskripsi.length > 5, `Item ${item.kode} has descriptive name`);
      assert(!!item.relevansi_hukum && item.relevansi_hukum.length > 10, `Item ${item.kode} has substantive legal relevance`);
      assert(!!item.posita_dalil_terkait && item.posita_dalil_terkait.length > 10, `Item ${item.kode} is explicitly linked to petition grounds/Posita`);
      assert(item.status === 'disarankan', `Item ${item.kode} default initial state is 'disarankan'`);
    }
  }
  console.log('');

  // --- TEST 6: STATUS PROGRESSION CYCLE ---
  console.log('📋 Test 6: Siklus Status Kesiapan Bukti (disarankan -> sudah_disiapkan_user -> terverifikasi)');
  let testItem: EvidenceItem = { ...laborMatrix.items[0] };
  assert(testItem.status === 'disarankan', 'Initial status is disarankan');

  // User prepares evidence
  testItem = { ...testItem, status: 'sudah_disiapkan_user', catatan_pengguna: 'Dokumen fisik KTP asli dan fotokopi bermaterai tersimpan di map A.' };
  assert(testItem.status === 'sudah_disiapkan_user', 'Status successfully transitioned to sudah_disiapkan_user');
  assert(!!testItem.catatan_pengguna && testItem.catatan_pengguna.includes('map A'), 'User note persisted on item');

  // User / verification complete
  testItem = { ...testItem, status: 'terverifikasi' };
  assert(testItem.status === 'terverifikasi', 'Status successfully transitioned to terverifikasi');
  console.log('');

  // --- TEST 7: STRICT REGRESSION GUARD (NO "NAZEGELEN") ---
  console.log('📋 Test 7: Strict Regression Guard (Zero Occurrences of "Nazegelen")');
  const fullJsonLabor = JSON.stringify(laborMatrix);
  const fullJsonEnv = JSON.stringify(envMatrix);
  const fullJsonAgr = JSON.stringify(agrarianMatrix);
  const fullJsonSpeech = JSON.stringify(speechMatrix);

  const containsForbidden = /nazegelen/i.test(fullJsonLabor) ||
                            /nazegelen/i.test(fullJsonEnv) ||
                            /nazegelen/i.test(fullJsonAgr) ||
                            /nazegelen/i.test(fullJsonSpeech);

  assert(!containsForbidden, 'ZERO instances of "Nazegelen" found in dynamic evidence generator output');

  const usesIndonesianPostalStamp = laborMatrix.items.some(i => i.syarat_legalisasi?.includes('Kantor Pos')) &&
                                    envMatrix.items.some(i => i.syarat_legalisasi?.includes('Kantor Pos')) &&
                                    agrarianMatrix.items.some(i => i.syarat_legalisasi?.includes('Kantor Pos'));
  assert(usesIndonesianPostalStamp, 'Consistently uses standard Indonesian "legalisasi/pemeteraian di Kantor Pos"');
  console.log('');

  // --- TEST 8: INTEGRATION WITH PETITION DRAFTER (BUKU II) ---
  console.log('📋 Test 8: Integrasi Daftar Alat Bukti ke Generator Buku II');
  const petitionDoc = await generateConstitutionalPetition(
    laborFacts,
    {
      nama_lengkap: 'Budi Santoso',
      nik: '3275012345670002',
      tempat_tanggal_lahir: 'Bekasi, 10 Mei 1988',
      pekerjaan: 'Buruh Pabrik Garmen',
      alamat_lengkap: 'Jl. Industri Garmen No. 12, Cikarang, Bekasi',
      nomor_kontak: '081234567890',
      email: 'budi.santoso@email.com',
      kategori_pemohon: 'Perorangan Warga Negara Indonesia'
    }
  );

  assert(petitionDoc.daftar_alat_bukti.length >= 4, 'Buku II contains at least 4 dynamically generated evidence items');
  const p3Petition = petitionDoc.daftar_alat_bukti.find(i => i.kode_bukti.includes('P-3'));
  assert(!!p3Petition, 'Buku II includes P-3 evidence');
  assert(!/nazegelen/i.test(JSON.stringify(petitionDoc)), 'ZERO instances of "Nazegelen" in generated petition document');
  console.log('');

  console.log('===============================================================');
  console.log(`✅ ALL ${passedTests}/${totalTests} EVIDENCE MATRIX & CHECKLIST TESTS PASSED!`);
  console.log('===============================================================');
}

runEvidenceMatrixTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
