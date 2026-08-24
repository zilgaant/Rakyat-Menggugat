/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Test Suite for JDIH MK Live Crawling Orchestrator
 * Verifies:
 * 1. robots.txt fetching and directive evaluation
 * 2. Strict skip of disallowed paths
 * 3. Courtesy delay measurement (before/after timestamps >= delay requirement)
 * 4. Resilient error handling (single page failure does not crash batch)
 * 5. Full sequential end-to-end orchestration (Fetch -> Allow -> Delay -> Parse -> Ingest)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  runJdihMkCrawlOrchestrator,
  DEFAULT_JDIH_MK_TARGET_URLS
} from '../server/jdihMkCrawlerOrchestrator';
import * as scraperModule from '../server/liveLegalScraper';
import { getEntryVersions, getAllLegalKnowledgeEntries } from '../server/legalKnowledgeETL';

describe('JDIH MK Live Crawling Orchestrator', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Strict robots.txt failure handling: Aborts run if robots.txt cannot be verified', async () => {
    vi.spyOn(scraperModule, 'fetchAndParseRobotsTxt').mockRejectedValueOnce(
      new Error('Connection refused / DNS lookup failed')
    );

    const result = await runJdihMkCrawlOrchestrator({
      targetUrls: ['https://jdih.mkri.id/putusan/test'],
      dryRunLabel: 'Test Robots Failure'
    });

    expect(result.status).toBe('gagal_robots_txt');
    expect(result.statistics.scanned_count).toBe(0);
    expect(result.raw_execution_logs.some(l => l.toLowerCase().includes('sinkronisasi dihentikan'))).toBe(true);
  });

  it('2. Defense-in-Depth Hard Exclusion: Strictly blocks administrative/auth paths regardless of robots.txt without HTTP fetch', async () => {
    // Mock permissive robots.txt that doesn't mention admin
    vi.spyOn(scraperModule, 'fetchAndParseRobotsTxt').mockResolvedValueOnce({
      crawlDelaySeconds: 1,
      disallowedPaths: [],
      allowedPaths: ['/'],
      rawText: 'User-agent: *\nAllow: /',
      sourceUrl: 'https://jdih.mkri.id/robots.txt',
      fetchedAt: new Date().toISOString(),
      isMockFallback: false
    });

    const fetchPageSpy = vi.spyOn(scraperModule, 'fetchLiveLegalPage').mockResolvedValue({
      html: '<html><head><title>Putusan MK 01</title></head><body><h1>Putusan MK 01</h1></body></html>',
      status: 200,
      durationMs: 45
    });

    const targetUrls = [
      'https://jdih.mkri.id/admin/login',      // HARD EXCLUDED by app layer
      'https://jdih.mkri.id/wp-admin/post.php',// HARD EXCLUDED by app layer
      'https://jdih.mkri.id/auth/signin',      // HARD EXCLUDED by app layer
      'https://jdih.mkri.id/putusan/001.html'  // ALLOWED public document
    ];

    const result = await runJdihMkCrawlOrchestrator({
      targetUrls,
      minDelayMs: 50
    });

    expect(result.statistics.skipped_disallow_count).toBe(3);
    expect(result.statistics.scanned_count).toBe(1);
    expect(result.per_page_results[0].status).toBe('dilewati_hard_exclude');
    expect(result.per_page_results[1].status).toBe('dilewati_hard_exclude');
    expect(result.per_page_results[2].status).toBe('dilewati_hard_exclude');
    expect(result.per_page_results[3].status).toBe('sukses');
    // Verify fetchLiveLegalPage was strictly called ONLY once for the allowed public document
    expect(fetchPageSpy).toHaveBeenCalledTimes(1);
  });

  it('3. Robots.txt Path Disallow Enforcement: Skips paths listed in robots.txt Disallow directives', async () => {
    // Mock robots.txt with custom disallow (not part of hard-exclude list)
    vi.spyOn(scraperModule, 'fetchAndParseRobotsTxt').mockResolvedValueOnce({
      crawlDelaySeconds: 1,
      disallowedPaths: ['/temp-staging/', '/custom-disallow/'],
      allowedPaths: ['/putusan/'],
      rawText: 'User-agent: *\nDisallow: /temp-staging/\nDisallow: /custom-disallow/\nAllow: /putusan/',
      sourceUrl: 'https://jdih.mkri.id/robots.txt',
      fetchedAt: new Date().toISOString(),
      isMockFallback: false
    });

    const fetchPageSpy = vi.spyOn(scraperModule, 'fetchLiveLegalPage').mockResolvedValue({
      html: '<html><head><title>Putusan MK 02</title></head><body><h1>Putusan MK 02</h1></body></html>',
      status: 200,
      durationMs: 45
    });

    const targetUrls = [
      'https://jdih.mkri.id/temp-staging/doc.pdf', // DISALLOWED by robots.txt
      'https://jdih.mkri.id/putusan/002.html'      // ALLOWED
    ];

    const result = await runJdihMkCrawlOrchestrator({
      targetUrls,
      minDelayMs: 50
    });

    expect(result.statistics.skipped_disallow_count).toBe(1);
    expect(result.statistics.scanned_count).toBe(1);
    expect(result.per_page_results[0].status).toBe('dilewati_robots_txt');
    expect(result.per_page_results[1].status).toBe('sukses');
    expect(fetchPageSpy).toHaveBeenCalledTimes(1);
  });

  it('3. Courtesy Delay & Timestamp Recording: Enforces courtesy delay and logs real before/after timestamps', async () => {
    vi.spyOn(scraperModule, 'fetchAndParseRobotsTxt').mockResolvedValueOnce({
      crawlDelaySeconds: 1, // 1s from robots, but minDelay is 100ms
      disallowedPaths: [],
      allowedPaths: ['/'],
      rawText: 'User-agent: *\nAllow: /',
      sourceUrl: 'https://jdih.mkri.id/robots.txt',
      fetchedAt: new Date().toISOString(),
      isMockFallback: false
    });

    vi.spyOn(scraperModule, 'fetchLiveLegalPage').mockResolvedValue({
      html: `
        <html>
          <head><title>Putusan MK Nomor 99/PUU-XX/2022</title></head>
          <body>
            <h1>Putusan MK Nomor 99/PUU-XX/2022</h1>
            <p>Ratio Decidendi: Hak konstitusional warga negara atas lingkungan hidup yang sehat.</p>
          </body>
        </html>
      `,
      status: 200,
      durationMs: 60
    });

    const result = await runJdihMkCrawlOrchestrator({
      targetUrls: ['https://jdih.mkri.id/putusan/99-2022.html'],
      minDelayMs: 150
    });

    expect(result.status).toBe('sukses');
    const pageRes = result.per_page_results[0];
    expect(pageRes.timestamp_delay_start).toBeDefined();
    expect(pageRes.timestamp_delay_end).toBeDefined();
    expect(pageRes.delay_ms_applied).toBeGreaterThanOrEqual(140);
    expect(pageRes.parsed_doc_raw?.nomor).toBe('99/PUU-XX/2022');
    expect(pageRes.ingestion_result?.version_id).toBeDefined();
  });

  it('4. Fault Tolerance / Page Error Handling: Continues running even if one page returns 500 or malformed HTML', async () => {
    vi.spyOn(scraperModule, 'fetchAndParseRobotsTxt').mockResolvedValueOnce({
      crawlDelaySeconds: 1,
      disallowedPaths: [],
      allowedPaths: ['/'],
      rawText: 'User-agent: *\nAllow: /',
      sourceUrl: 'https://jdih.mkri.id/robots.txt',
      fetchedAt: new Date().toISOString(),
      isMockFallback: false
    });

    // 1st call fails, 2nd call succeeds
    vi.spyOn(scraperModule, 'fetchLiveLegalPage')
      .mockRejectedValueOnce(new Error('HTTP 500 Internal Server Error'))
      .mockResolvedValueOnce({
        html: '<html><head><title>Putusan MK Nomor 100/PUU-XX/2022</title></head><body><p>Isi putusan</p></body></html>',
        status: 200,
        durationMs: 30
      });

    const targetUrls = [
      'https://jdih.mkri.id/putusan/broken.html',
      'https://jdih.mkri.id/putusan/valid.html'
    ];

    const result = await runJdihMkCrawlOrchestrator({
      targetUrls,
      minDelayMs: 50
    });

    expect(result.statistics.failed_pages_count).toBe(1);
    expect(result.statistics.scanned_count).toBe(1);
    expect(result.per_page_results[0].status).toBe('gagal_fetch_atau_parse');
    expect(result.per_page_results[0].error_message).toContain('500');
    expect(result.per_page_results[1].status).toBe('sukses');
  });

  it('5. End-to-End Orchestration: Successfully parses and versions live record into subcollection', async () => {
    vi.spyOn(scraperModule, 'fetchAndParseRobotsTxt').mockResolvedValueOnce({
      crawlDelaySeconds: 2,
      disallowedPaths: ['/admin/'],
      allowedPaths: ['/putusan/'],
      rawText: 'User-agent: *\nDisallow: /admin/\nAllow: /putusan/\nCrawl-delay: 2',
      sourceUrl: 'https://jdih.mkri.id/robots.txt',
      fetchedAt: new Date().toISOString(),
      isMockFallback: false
    });

    vi.spyOn(scraperModule, 'fetchLiveLegalPage').mockResolvedValue({
      html: `
        <!DOCTYPE html>
        <html>
          <head><title>Putusan Mahkamah Konstitusi Nomor 168/PUU-XXI/2023</title></head>
          <body>
            <h1>PUTUSAN NOMOR 168/PUU-XXI/2023</h1>
            <p>Menimbang bahwa ketentuan PKWT harus memiliki kepastian jangka waktu paling lama 5 tahun.</p>
            <p>MENGADILI: Mengabulkan permohonan pemohon untuk sebagian.</p>
          </body>
        </html>
      `,
      status: 200,
      durationMs: 80
    });

    const result = await runJdihMkCrawlOrchestrator({
      targetUrls: ['https://jdih.mkri.id/putusan/168-2023.html'],
      minDelayMs: 50
    });

    expect(result.status).toBe('sukses');
    expect(result.statistics.scanned_count).toBe(1);
    expect(result.per_page_results[0].ingestion_result?.entry_id).toBeDefined();

    const entryId = result.per_page_results[0].ingestion_result!.entry_id;
    const versions = getEntryVersions(entryId);
    expect(versions.length).toBeGreaterThanOrEqual(1);
    expect(versions[0].entry_id).toBe(entryId);
    expect(versions[0].content_hash).toBeDefined();
  });
});
