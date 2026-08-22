/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Test Suite: Dynamic Evidence Matrix Generator (Buku II Alat Bukti MK)
 * Skenario 4 Sektor: Ketenagakerjaan, Lingkungan & Minerba, Agraria & Adat, ITE/Pidana
 */

import { describe, it, expect } from 'vitest';
import { generateDynamicEvidenceMatrix } from '../server/evidenceGenerator';

describe('Dynamic Evidence Matrix Generator (Buku II MK)', () => {
  const sectors = [
    {
      nama: 'Ketenagakerjaan',
      fakta: 'Pemohon adalah buruh kontrak (PKWT) yang mengalami pemutusan hubungan kerja sepihak tanpa pesangon berdasarkan pasal fleksibilitas kerja UU Cipta Kerja, melanggar hak atas kepastian kerja yang adil pada Pasal 28D ayat (1) UUD 1945.',
      substantive: {
        latar_belakang_fakta: 'Buruh kontrak di-PHK tanpa pesangon',
        hak_yang_dirugikan: 'Hak atas kepastian kerja yang adil Pasal 28D ayat (1)',
        objek_norma_uu: 'UU Cipta Kerja',
        hubungan_kausalitas: 'Ketentuan PKWT dan pesangon menyebabkan kerugian finansial langsung'
      }
    },
    {
      nama: 'Lingkungan',
      fakta: 'Masyarakat desa pesisir terdampak pencemaran limbah tambang nikel dan hilangnya ruang hidup akibat izin usaha pertambangan tanpa persetujuan lingkungan AMDAL, melanggar Pasal 28H ayat (1) UUD 1945.',
      substantive: {
        latar_belakang_fakta: 'Pencemaran limbah tambang nikel dan hilangnya ruang hidup',
        hak_yang_dirugikan: 'Hak atas lingkungan hidup yang baik dan sehat Pasal 28H ayat (1)',
        objek_norma_uu: 'UU Minerba',
        hubungan_kausalitas: 'Izin tambang tanpa AMDAL merusak sumber air dan wilayah tangkap nelayan'
      }
    },
    {
      nama: 'Agraria',
      fakta: 'Masyarakat hukum adat kehilangan tanah ulayat dan wilayah kelola adat yang dikonversi menjadi konsesi perkebunan sawit tanpa hak veto dan persetujuan FPIC, melanggar Pasal 18B ayat (2) UUD 1945.',
      substantive: {
        latar_belakang_fakta: 'Konversi tanah ulayat menjadi konsesi sawit',
        hak_yang_dirugikan: 'Pengakuan kesatuan masyarakat hukum adat Pasal 18B ayat (2)',
        objek_norma_uu: 'UU Pokok Agraria / Perkebunan',
        hubungan_kausalitas: 'Ketiadaan hak veto adat mengakibatkan penggusuran wilayah adat'
      }
    },
    {
      nama: 'ITE',
      fakta: 'Pemohon dikriminalisasi menggunakan pasal karet pencemaran nama baik UU ITE saat mengkritik pelayanan publik dan dugaan korupsi, melanggar kebebasan berekspresi Pasal 28E ayat (3) UUD 1945.',
      substantive: {
        latar_belakang_fakta: 'Kriminalisasi kritik pelayanan publik',
        hak_yang_dirugikan: 'Kebebasan berekspresi dan berpendapat Pasal 28E ayat (3)',
        objek_norma_uu: 'UU ITE',
        hubungan_kausalitas: 'Pasal 27A/28 menimbulkan efek jera (chilling effect) bagi partisipasi warga'
      }
    }
  ];

  it('1. Generates complete P-1 through P-X evidence matrix for all 4 sectors with explicit posita linkage', () => {
    for (const sec of sectors) {
      const caseId = `case-${sec.nama.toLowerCase()}`;
      const result = generateDynamicEvidenceMatrix(caseId, sec.fakta, 'Budi Santoso', sec.substantive);
      expect(result.sektor_terdeteksi).toBeTruthy();
      expect(result.items.length).toBeGreaterThanOrEqual(4);

      // Verify sequence numbering P-1, P-2, ...
      result.items.forEach((item, index) => {
        expect(item.kode).toBe(`P-${index + 1}`);
        expect(item.deskripsi).toBeTruthy();
        expect(item.posita_dalil_terkait).toBeTruthy();
        expect(item.posita_dalil_terkait.length).toBeGreaterThan(10);
        expect(item.case_id).toBe(caseId);
      });

      // Verify P-1 is KTP / Identity
      expect(result.items[0].deskripsi.toLowerCase()).toContain('ktp');

      // Verify Lembaran Negara / UUD statute item
      const uuItem = result.items.find(i => i.deskripsi.toLowerCase().includes('undang-undang') || i.deskripsi.toLowerCase().includes('lembaran negara'));
      if (uuItem) {
        expect(uuItem.syarat_legalisasi.toLowerCase()).toContain('bebas');
      }
    }
  });

  it('2. Strict Terminology Compliance: Zero occurrence of obsolete term "Nazegelen"', () => {
    for (const sec of sectors) {
      const result = generateDynamicEvidenceMatrix(`case-term-${sec.nama.toLowerCase()}`, sec.fakta, 'Budi', sec.substantive);
      const jsonStr = JSON.stringify(result).toLowerCase();
      expect(jsonStr).not.toContain('nazegelen');
      expect(jsonStr).not.toContain('nasegelen');

      // Verify legalisasi terms are standard
      for (const item of result.items) {
        if (item.syarat_legalisasi && item.syarat_legalisasi.includes('Wajib')) {
          expect(item.syarat_legalisasi.toLowerCase()).toContain('legalisasi/pemeteraian di kantor pos');
        }
      }
    }
  });
});
