/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Test Suite: Legal Knowledge Base & ETL Ingestion Pipeline
 * Validates:
 * 1. ETL Extraction, Transformation, and Ingestion from official sources (JDIH MK, JDIHN, JDIH MA)
 * 2. Firestore Subcollection Versioning: legal_knowledge_entries/{entryId}/versions/{versionId}
 * 3. Content Hashing & Version Progression
 * 4. Politeness Protocol & Rate Limiting (Courtesy Delay, robots.txt compliance)
 * 5. Terminology Guard (0 instances of obsolete terminology)
 * 6. Legal Grounding & Semantic Keyword Retrieval
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  executeLegalKnowledgeSync,
  getAllLegalKnowledgeEntries,
  getEntryVersions,
  ingestScrapedRecord,
  getSyncJobHistory,
  OFFICIAL_SOURCE_RECORDS
} from '../server/legalKnowledgeETL';
import { retrieveRelevantLegalKnowledge, LEGAL_KNOWLEDGE_BASE } from '../server/legalKnowledge';
import {
  parseRobotsTxtContent,
  parseLegalHtml,
  isPathAllowed
} from '../server/liveLegalScraper';

describe('Legal Knowledge ETL Ingestion & Versioning Pipeline', () => {
  beforeEach(async () => {
    // Run an initial sync
    await executeLegalKnowledgeSync('all', 10);
  });

  it('1. Extracts and ingests all records from official government sources (JDIH MK, JDIHN, JDIH MA)', async () => {
    const entries = getAllLegalKnowledgeEntries();
    expect(entries.length).toBeGreaterThanOrEqual(7);

    // Verify presence of specific landmark constitutional rulings & statutes
    const mk006 = entries.find(e => e.id === 'putusan-mk-006-2005' || e.nomor.includes('006/PUU-III/2005'));
    expect(mk006).toBeDefined();
    expect(mk006?.sumber).toBe('jdih_mk');
    expect(mk006?.nomor).toContain('006/PUU-III/2005');
    expect(mk006?.status_berlaku).toBe('berlaku');

    const mk168 = entries.find(e => e.id === 'putusan-mk-168-2023' || e.nomor.includes('168/PUU-XXI/2023'));
    expect(mk168).toBeDefined();
    expect(mk168?.sumber).toBe('jdih_mk');
    expect(mk168?.status_berlaku).toBe('inkonstitusional_bersyarat');

    const uu10 = entries.find(e => e.id === 'uu-10-2020-bea-meterai' || e.nomor.includes('10 Tahun 2020'));
    expect(uu10).toBeDefined();
    expect(uu10?.sumber).toBe('jdihn');

    const maHum = entries.find(e => e.id === 'putusan-ma-01-p-hum-2020' || e.nomor.includes('01 P/HUM/2020'));
    expect(maHum).toBeDefined();
    expect(maHum?.sumber).toBe('jdih_ma');
  });

  it('2. Subcollection Versioning: Saves parent metadata to legal_knowledge_entries and full content to versions subcollection', async () => {
    const entries = getAllLegalKnowledgeEntries();
    for (const entry of entries) {
      expect(entry.id).toBeTruthy();
      expect(entry.current_version_id).toBeTruthy();
      expect(entry.last_synced_at).toBeTruthy();
      
      // Fetch subcollection versions
      const versions = getEntryVersions(entry.id);
      expect(versions.length).toBeGreaterThanOrEqual(1);

      const latestVer = versions[versions.length - 1];
      expect(latestVer.id).toBe(entry.current_version_id);
      expect(latestVer.entry_id).toBe(entry.id);
      expect(latestVer.isi_teks.length).toBeGreaterThan(50);
      expect(latestVer.content_hash).toBeTruthy();
      expect(latestVer.scraped_at).toBeTruthy();
    }
  });

  it('3. Content Hashing & Idempotency: Does not create duplicate versions if text has not changed', async () => {
    const testRecord = {
      id: 'test-mk-006-puu',
      source_id: 'jdih_mk' as const,
      nomor_dokumen: '006/PUU-III/2005',
      tahun: 2005,
      jenis_dokumen: 'putusan_mk' as const,
      judul: 'Uji Materiil UU Ketenagakerjaan Terhadap UUD 1945 (5 Syarat Kerugian Konstitusional)',
      status_berlaku: 'berlaku' as const,
      url_sumber: 'https://jdih.mkri.id/putusan/006-PUU-III-2005',
      isi_teks_lengkap: 'Mahkamah Konstitusi menetapkan 5 syarat kumulatif kerugian konstitusional pemohon...',
      ratio_decidendi: 'Kerugian hak konstitusional harus spesifik, aktual, ada kausalitas, dan dapat dipulihkan bila permohonan dikabulkan.',
      batu_uji_uud: ['Pasal 28D ayat (1)', 'Pasal 28I ayat (2)'],
      sektor: 'Ketenagakerjaan / Legal Standing',
      keywords: ['standing', 'kerugian konstitusional', 'kausalitas']
    };

    // First ingestion
    const { entry: e1, version: v1, isNewVersion: isNew1 } = await ingestScrapedRecord(testRecord);
    const initialVersionsCount = getEntryVersions(e1.id).length;

    // Second ingestion with identical content
    const { entry: e2, version: v2, isNewVersion: isNew2 } = await ingestScrapedRecord(testRecord);
    expect(isNew2).toBe(false);
    expect(v2.id).toBe(v1.id);
    expect(getEntryVersions(e2.id).length).toBe(initialVersionsCount);
  });

  it('4. Version Progression: Increments version number when amended text or revised jurisprudence is detected', async () => {
    const uniqueEntryId = `entry-test-amended-${Date.now()}`;
    const initialRecord = {
      id: uniqueEntryId,
      source_id: 'jdihn' as const,
      nomor_dokumen: 'UU No. 99 Tahun 2026',
      tahun: 2026,
      jenis_dokumen: 'uu' as const,
      judul: 'UU Perlindungan Masyarakat Adat (Draf Awal)',
      status_berlaku: 'berlaku' as const,
      url_sumber: 'https://jdihn.go.id/dokumen/uu-99-2026-v1',
      isi_teks_lengkap: 'Naskah teks asli tahun 2026...',
      ratio_decidendi: 'Perlindungan wilayah adat',
      batu_uji_uud: ['Pasal 18B ayat (2)'],
      sektor: 'Agraria & Hak Adat',
      keywords: ['adat', 'hutan adat']
    };

    const { entry: e1, version: v1 } = await ingestScrapedRecord(initialRecord);
    expect(v1.versi_ke).toBe(1);

    // Revised text simulating an amendment or revised regulation
    const amendedRecord = {
      ...initialRecord,
      judul: 'UU Perlindungan Masyarakat Adat (Pasca Amandemen)',
      isi_teks_lengkap: 'Naskah teks yang telah diperbarui dan diamandemen dengan ketentuan persetujuan FPIC...',
      ratio_decidendi: 'Perlindungan wilayah adat dan persetujuan atas dasar informasi awal tanpa paksaan (FPIC).'
    };

    const { entry: e2, version: v2, isNewVersion } = await ingestScrapedRecord(amendedRecord);
    expect(isNewVersion).toBe(true);
    expect(v2.versi_ke).toBe(2);
    expect(v2.content_hash).not.toBe(v1.content_hash);
    expect(e2.current_version_id).toBe(v2.id);

    const allVers = getEntryVersions(e2.id);
    expect(allVers.length).toBe(2);
  });

  it('5. Throttling Protocol: Enforces asynchronous courtesy delay and approved path whitelisting', async () => {
    const startTime = Date.now();
    const result = await executeLegalKnowledgeSync('jdih_mk', 50); // 50ms delay
    const duration = Date.now() - startTime;

    expect(result.status).toBe('sukses');
    expect(result.total_crawled).toBeGreaterThanOrEqual(1);
    expect(result.log_pesan.length).toBeGreaterThanOrEqual(3);
    // Verified polite delay execution
    expect(duration).toBeGreaterThanOrEqual(50);
  });

  it('6. Terminology Standard Compliance: 0 occurrences of obsolete Dutch terminology', () => {
    const entries = getAllLegalKnowledgeEntries();
    for (const entry of entries) {
      const jsonStr = JSON.stringify(entry).toLowerCase();
      expect(jsonStr).not.toContain('nazegelen');
      expect(jsonStr).not.toContain('nasegelen');

      const versions = getEntryVersions(entry.id);
      for (const ver of versions) {
        const verStr = JSON.stringify(ver).toLowerCase();
        expect(verStr).not.toContain('nazegelen');
        expect(verStr).not.toContain('nasegelen');
      }
    }

    // Verify statutory grounding for postal legalization
    const uuMeterai = entries.find(e => e.id === 'uu-10-2020-bea-meterai');
    expect(uuMeterai).toBeDefined();
    const versions = getEntryVersions(uuMeterai!.id);
    expect(versions[0].isi_teks).toContain('Kantor Pos');
  });

  it('7. Semantic Knowledge Grounding: Retrieves relevant precedents for case scenarios', () => {
    // Scenario A: Environmental case
    const envResults = retrieveRelevantLegalKnowledge('tambang sumber daya air izin lingkungan', 3);
    expect(envResults.length).toBeGreaterThan(0);

    // Scenario B: Labor case (Cipta Kerja / PHK)
    const laborResults = retrieveRelevantLegalKnowledge('pekerja buruh pesangon phk cipta kerja upah', 3);
    expect(laborResults.length).toBeGreaterThan(0);
  });

  it('8. Live Parser Verification: Correctly parses robots.txt directives and extracts legal metadata from HTML', () => {
    // A. Robots.txt parser test
    const sampleRobotsTxt = `
      User-agent: *
      Disallow: /admin/
      Disallow: /private/
      Allow: /putusan/
      Crawl-delay: 2
    `;
    const parsedRobots = parseRobotsTxtContent(sampleRobotsTxt, 'RakyatMenggugat-LegalKnowledgeBot/1.0');
    expect(parsedRobots.crawlDelaySeconds).toBe(2);
    expect(parsedRobots.disallowedPaths).toContain('/admin/');
    expect(parsedRobots.allowedPaths).toContain('/putusan/');
    expect(isPathAllowed('/putusan/006-2005.html', parsedRobots.disallowedPaths, parsedRobots.allowedPaths)).toBe(true);
    expect(isPathAllowed('/admin/dashboard', parsedRobots.disallowedPaths, parsedRobots.allowedPaths)).toBe(false);

    // B. HTML text & metadata extractor test
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Putusan Mahkamah Konstitusi Nomor 168/PUU-XXI/2023</title></head>
        <body>
          <div class="content">
            <h1>PUTUSAN MK NOMOR 168/PUU-XXI/2023</h1>
            <p>Mahkamah Konstitusi menguji ketentuan PKWT dan outsourcing dalam UU Cipta Kerja.</p>
            <p>Ratio Decidendi: Pembatasan waktu PKWT maksimal 5 tahun harus diatur tegas dalam Undang-Undang demi kepastian hukum.</p>
            <p>MENGADILI: Mengabulkan permohonan para Pemohon untuk sebagian.</p>
          </div>
        </body>
      </html>
    `;
    const parsedDoc = parseLegalHtml(sampleHtml, 'https://jdih.mkri.id/putusan/168', 'jdih_mk');
    expect(parsedDoc.judul).toContain('168/PUU-XXI/2023');
    expect(parsedDoc.nomor).toBe('168/PUU-XXI/2023');
    expect(parsedDoc.ratio_decidendi).toContain('Ratio Decidendi');
    expect(parsedDoc.amar_putusan).toContain('Mengabulkan permohonan');
  });
});
