/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JDIH Mahkamah Konstitusi (MK) Live Crawling Orchestrator
 * Target Base: https://jdih.mkri.id
 * 
 * Sequential End-to-End Pipeline:
 * 1. Fetch & Parse Live robots.txt from https://jdih.mkri.id (Strict halt if unverified)
 * 2. Evaluate target paths against disallowed/allowed directives via isPathAllowed()
 * 3. Enforce courtesy throttling delay (min 2000ms or crawl-delay from robots.txt)
 * 4. Fetch HTML via fetchLiveLegalPage() with civic user-agent
 * 5. Parse Legal Metadata & body text via parseLegalHtml()
 * 6. Ingest, SHA-256 hash, and version into Firestore subcollection via ingestScrapedRecord()
 * 
 * Resilience: Single page failure does NOT crash the entire batch run.
 */

import * as scraperModule from './liveLegalScraper';
import { CIVIC_USER_AGENT, LiveScrapedLegalDoc } from './liveLegalScraper';
import { ingestScrapedRecord } from './legalKnowledgeETL';
import { LegalKnowledgeEntry, LegalKnowledgeVersion } from '../src/types';

export const JDIH_MK_BASE_URL = 'https://jdih.mkri.id';

/**
 * Curated list of target pages for manual testing (strictly legitimate public legal documents only)
 */
export const DEFAULT_JDIH_MK_TARGET_URLS = [
  'https://jdih.mkri.id/peraturan',
  'https://jdih.mkri.id/putusan',
  'https://jdih.mkri.id/dokumen'
];

export interface PageCrawlResult {
  url: string;
  path: string;
  is_allowed: boolean;
  status: 'sukses' | 'dilewati_hard_exclude' | 'dilewati_robots_txt' | 'gagal_fetch_atau_parse';
  timestamp_delay_start?: string;
  timestamp_delay_end?: string;
  delay_ms_applied?: number;
  http_status?: number;
  fetch_duration_ms?: number;
  parsed_doc_raw?: Partial<LiveScrapedLegalDoc>;
  ingestion_result?: {
    entry_id: string;
    version_id: string;
    is_new_version: boolean;
    content_hash?: string;
  };
  error_message?: string;
}

export interface JdihMkOrchestrationResult {
  job_id: string;
  target_base_url: string;
  user_agent_used: string;
  status: 'sukses' | 'gagal_robots_txt' | 'parsial';
  started_at: string;
  completed_at: string;
  total_duration_ms: number;
  robots_txt_verification: {
    url: string;
    fetched_at: string;
    raw_text: string;
    crawl_delay_seconds: number;
    disallowed_paths: string[];
    allowed_paths: string[];
  };
  courtesy_delay_enforced_ms: number;
  statistics: {
    total_target_urls: number;
    scanned_count: number;
    inserted_count: number;
    updated_count: number;
    unchanged_count: number;
    skipped_disallow_count: number;
    failed_pages_count: number;
  };
  per_page_results: PageCrawlResult[];
  raw_execution_logs: string[];
}

/**
 * Execute the end-to-end JDIH MK Crawling Orchestrator
 */
export async function runJdihMkCrawlOrchestrator(options: {
  targetUrls?: string[];
  minDelayMs?: number;
  timeoutMs?: number;
  dryRunLabel?: string;
} = {}): Promise<JdihMkOrchestrationResult> {
  const startedAt = new Date();
  const logs: string[] = [];
  const jobId = `crawl-mk-${Date.now()}`;
  const targetUrls = options.targetUrls || DEFAULT_JDIH_MK_TARGET_URLS;
  const minDelayMs = options.minDelayMs ?? 2000; // Minimum 2 seconds courtesy delay
  const pageTimeoutMs = options.timeoutMs ?? 10000;

  logs.push(`[${startedAt.toISOString()}] 🏛️ Memulai JDIH MK Live Crawling Orchestrator (Job ID: ${jobId})`);
  logs.push(`[Mode]: ${options.dryRunLabel || 'Manual Live Verification / Dry-Run'}`);
  logs.push(`[User-Agent]: ${scraperModule.CIVIC_USER_AGENT}`);
  logs.push(`[Target URLs (${targetUrls.length})]:`);
  targetUrls.forEach((u, i) => logs.push(`   ${i + 1}. ${u}`));

  // --- STEP 1: Fetch & Parse Real robots.txt ---
  logs.push(`\n[STEP 1] Mengambil & memverifikasi robots.txt dari ${JDIH_MK_BASE_URL}/robots.txt...`);
  let parsedRobots: scraperModule.ParsedRobotsTxt;

  try {
    parsedRobots = await scraperModule.fetchAndParseRobotsTxt(JDIH_MK_BASE_URL, scraperModule.CIVIC_USER_AGENT, 8000);
    logs.push(`✓ robots.txt berhasil diverifikasi (${parsedRobots.sourceUrl})`);
    logs.push(`   - Crawl-Delay: ${parsedRobots.crawlDelaySeconds} detik`);
    logs.push(`   - Disallowed (${parsedRobots.disallowedPaths.length}): ${parsedRobots.disallowedPaths.join(', ') || '(none)'}`);
    logs.push(`   - Allowed (${parsedRobots.allowedPaths.length}): ${parsedRobots.allowedPaths.join(', ') || '(none)'}`);
    logs.push(`   - Raw Snippet: ${parsedRobots.rawText.slice(0, 150).replace(/\n/g, ' ')}...`);
  } catch (err: any) {
    const errorMsg = `FATAL: ${err.message}`;
    logs.push(`❌ ${errorMsg}`);
    logs.push(`🛑 Aturan Kepatuhan: Seluruh sinkronisasi dihentikan karena robots.txt tidak dapat diverifikasi secara sah.`);

    const completedAt = new Date();
    return {
      job_id: jobId,
      target_base_url: JDIH_MK_BASE_URL,
      user_agent_used: scraperModule.CIVIC_USER_AGENT,
      status: 'gagal_robots_txt',
      started_at: startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      total_duration_ms: completedAt.getTime() - startedAt.getTime(),
      robots_txt_verification: {
        url: `${JDIH_MK_BASE_URL}/robots.txt`,
        fetched_at: startedAt.toISOString(),
        raw_text: `GAGAL: ${err.message}`,
        crawl_delay_seconds: 0,
        disallowed_paths: [],
        allowed_paths: []
      },
      courtesy_delay_enforced_ms: 0,
      statistics: {
        total_target_urls: targetUrls.length,
        scanned_count: 0,
        inserted_count: 0,
        updated_count: 0,
        unchanged_count: 0,
        skipped_disallow_count: 0,
        failed_pages_count: targetUrls.length
      },
      per_page_results: targetUrls.map(u => ({
        url: u,
        path: new URL(u).pathname,
        is_allowed: false,
        status: 'gagal_fetch_atau_parse',
        error_message: 'Aborted: robots.txt verification failed'
      })),
      raw_execution_logs: logs
    };
  }

  // --- STEP 2: Enforce Effective Courtesy Delay ---
  const effectiveDelayMs = Math.max(parsedRobots.crawlDelaySeconds * 1000, minDelayMs);
  logs.push(`\n[STEP 2] Menetapkan Courtesy Delay: ${effectiveDelayMs}ms (Robots: ${parsedRobots.crawlDelaySeconds}s, Min: ${minDelayMs}ms)`);

  const pageResults: PageCrawlResult[] = [];
  let scannedCount = 0;
  let insertedCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;
  let skippedDisallowCount = 0;
  let failedPagesCount = 0;

  // --- STEP 3: Sequential Crawl & Ingestion per Document ---
  logs.push(`\n[STEP 3] Memulai iterasi pengambilan dokumen per URL secara sekuensial...`);

  for (let idx = 0; idx < targetUrls.length; idx++) {
    const urlStr = targetUrls[idx];
    let urlObj: URL;
    try {
      urlObj = new URL(urlStr);
    } catch {
      urlObj = new URL(urlStr, JDIH_MK_BASE_URL);
    }
    const pathName = urlObj.pathname;

    logs.push(`\n--- [Dokumen ${idx + 1}/${targetUrls.length}] URL: ${urlStr} ---`);

    // A1. Layer 1: Application-level Hard Exclude (Defense-in-Depth)
    const hardExcludeCheck = scraperModule.isPathHardExcluded(pathName);
    if (hardExcludeCheck.isExcluded) {
      logs.push(`  🛑 [HARD EXCLUDE DEFENSE-IN-DEPTH] Path "${pathName}" mengandung pola terlarang ("${hardExcludeCheck.matchedPattern}"). SKIPPED.`);
      skippedDisallowCount++;
      pageResults.push({
        url: urlStr,
        path: pathName,
        is_allowed: false,
        status: 'dilewati_hard_exclude',
        error_message: `Path ${pathName} matches application-level hard exclude pattern (${hardExcludeCheck.matchedPattern})`
      });
      continue;
    }

    // A2. Layer 2: Robots.txt Directives Evaluation
    const allowed = scraperModule.isPathAllowed(pathName, parsedRobots.disallowedPaths, parsedRobots.allowedPaths);

    if (!allowed) {
      logs.push(`  ⚠️ [ROBOTS.TXT DISALLOW] Path "${pathName}" masuk dalam daftar Disallowed. SKIPPED.`);
      skippedDisallowCount++;
      pageResults.push({
        url: urlStr,
        path: pathName,
        is_allowed: false,
        status: 'dilewati_robots_txt',
        error_message: `Path ${pathName} matches Disallow rules in robots.txt`
      });
      continue;
    }

    logs.push(`  ✓ [ROBOTS.TXT ALLOWED] Path "${pathName}" diizinkan untuk diakses.`);

    // B. Enforce Courtesy Delay with Before/After Timestamps
    const delayStart = new Date().toISOString();
    const startMs = Date.now();
    logs.push(`  ⏳ [Delay Start]: ${delayStart} (Menunggu ${effectiveDelayMs}ms)...`);

    await new Promise(resolve => setTimeout(resolve, effectiveDelayMs));

    const delayEnd = new Date().toISOString();
    const actualDelayMs = Date.now() - startMs;
    logs.push(`  ⏳ [Delay End]:   ${delayEnd} (Durasi riil: ${actualDelayMs}ms)`);

    // C. Fetch Live HTML
    logs.push(`  🌐 Mengambil HTML dari server live...`);
    let htmlResult: { html: string; status: number; durationMs: number };
    try {
      htmlResult = await scraperModule.fetchLiveLegalPage(urlStr, 0, pageTimeoutMs);
      logs.push(`  ✓ HTTP ${htmlResult.status} diterima dalam ${htmlResult.durationMs}ms (Ukuran: ${htmlResult.html.length} karakter)`);
    } catch (err: any) {
      logs.push(`  ❌ [FETCH ERROR] Gagal mengambil halaman: ${err.message}. Melanjutkan ke halaman berikutnya.`);
      failedPagesCount++;
      pageResults.push({
        url: urlStr,
        path: pathName,
        is_allowed: true,
        status: 'gagal_fetch_atau_parse',
        timestamp_delay_start: delayStart,
        timestamp_delay_end: delayEnd,
        delay_ms_applied: actualDelayMs,
        error_message: err.message
      });
      continue;
    }

    // D. Parse HTML to Legal Metadata
    logs.push(`  🔍 Mengekstrak metadata hukum (Nomor, Tahun, Ratio Decidendi, Teks)...`);
    let parsedDoc: Partial<scraperModule.LiveScrapedLegalDoc>;
    try {
      parsedDoc = scraperModule.parseLegalHtml(htmlResult.html, urlStr, 'jdih_mk');
      logs.push(`  ✓ Berhasil diekstrak:`);
      logs.push(`     Judul: "${parsedDoc.judul}"`);
      logs.push(`     Nomor: ${parsedDoc.nomor || '(tidak terdeteksi)'}`);
      logs.push(`     Tahun: ${parsedDoc.tahun}`);
      logs.push(`     Ratio Decidendi: ${parsedDoc.ratio_decidendi ? parsedDoc.ratio_decidendi.slice(0, 100) + '...' : '(tidak ada)'}`);
    } catch (err: any) {
      logs.push(`  ❌ [PARSE ERROR] Gagal mengekstrak HTML: ${err.message}. Melanjutkan ke halaman berikutnya.`);
      failedPagesCount++;
      pageResults.push({
        url: urlStr,
        path: pathName,
        is_allowed: true,
        status: 'gagal_fetch_atau_parse',
        timestamp_delay_start: delayStart,
        timestamp_delay_end: delayEnd,
        delay_ms_applied: actualDelayMs,
        http_status: htmlResult.status,
        fetch_duration_ms: htmlResult.durationMs,
        error_message: err.message
      });
      continue;
    }

    // E. Ingest & Version into Firestore subcollection
    logs.push(`  💾 Menyimpan ke Ingestion Pipeline & Subkoleksi Firestore (/versions/)...`);
    try {
      const docNomor = parsedDoc.nomor || `DOK-MK-${Date.now()}`;
      const docJudul = parsedDoc.judul || 'Dokumen Hukum Mahkamah Konstitusi';
      const cleanId = `entry-jdih-mk-${docNomor.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      const ingestion = await ingestScrapedRecord({
        id: cleanId,
        sumber: 'jdih_mk',
        jenis_dokumen: 'putusan_mk',
        nomor: docNomor,
        tahun: parsedDoc.tahun || String(new Date().getFullYear()),
        judul: docJudul,
        status_berlaku: 'berlaku',
        url_sumber: urlStr,
        isi_teks: parsedDoc.isi_teks || docJudul,
        ratio_decidendi: parsedDoc.ratio_decidendi,
        sektor: 'Hukum Konstitusi MKRI',
        keywords: parsedDoc.keywords || ['mkri', 'putusan']
      });

      scannedCount++;
      if (ingestion.isNewVersion) {
        if (ingestion.version.versi_ke === 1) {
          insertedCount++;
          logs.push(`  ✓ [INSERTED v1] Tersimpan sebagai Entry Baru ID: ${ingestion.entry.id} (Version: ${ingestion.version.id})`);
        } else {
          updatedCount++;
          logs.push(`  ⚡ [UPDATED v${ingestion.version.versi_ke}] Versi baru tersimpan ID: ${ingestion.entry.id} (Version: ${ingestion.version.id})`);
        }
      } else {
        unchangedCount++;
        logs.push(`  ℹ️ [UNCHANGED] Konten identik dengan hash versi aktif (${ingestion.version.id})`);
      }

      pageResults.push({
        url: urlStr,
        path: pathName,
        is_allowed: true,
        status: 'sukses',
        timestamp_delay_start: delayStart,
        timestamp_delay_end: delayEnd,
        delay_ms_applied: actualDelayMs,
        http_status: htmlResult.status,
        fetch_duration_ms: htmlResult.durationMs,
        parsed_doc_raw: parsedDoc,
        ingestion_result: {
          entry_id: ingestion.entry.id,
          version_id: ingestion.version.id,
          is_new_version: ingestion.isNewVersion,
          content_hash: ingestion.version.content_hash
        }
      });
    } catch (err: any) {
      logs.push(`  ❌ [INGESTION ERROR] Gagal menyimpan ke Firestore: ${err.message}`);
      failedPagesCount++;
      pageResults.push({
        url: urlStr,
        path: pathName,
        is_allowed: true,
        status: 'gagal_fetch_atau_parse',
        timestamp_delay_start: delayStart,
        timestamp_delay_end: delayEnd,
        delay_ms_applied: actualDelayMs,
        http_status: htmlResult.status,
        fetch_duration_ms: htmlResult.durationMs,
        parsed_doc_raw: parsedDoc,
        error_message: err.message
      });
    }
  }

  const completedAt = new Date();
  const totalDuration = completedAt.getTime() - startedAt.getTime();

  logs.push(`\n[${completedAt.toISOString()}] 🏁 JDIH MK Crawling Selesai dalam ${totalDuration}ms`);
  logs.push(`📊 Rangkuman Statistik:`);
  logs.push(`   - Total Target: ${targetUrls.length}`);
  logs.push(`   - Berhasil Di-scan: ${scannedCount}`);
  logs.push(`   - Inserted (v1 Baru): ${insertedCount}`);
  logs.push(`   - Updated (Versi Baru): ${updatedCount}`);
  logs.push(`   - Unchanged (Identik): ${unchangedCount}`);
  logs.push(`   - Dilewati Robots.txt: ${skippedDisallowCount}`);
  logs.push(`   - Gagal Fetch/Parse: ${failedPagesCount}`);

  return {
    job_id: jobId,
    target_base_url: JDIH_MK_BASE_URL,
    user_agent_used: CIVIC_USER_AGENT,
    status: failedPagesCount === 0 && skippedDisallowCount === 0 ? 'sukses' : 'parsial',
    started_at: startedAt.toISOString(),
    completed_at: completedAt.toISOString(),
    total_duration_ms: totalDuration,
    robots_txt_verification: {
      url: parsedRobots.sourceUrl,
      fetched_at: parsedRobots.fetchedAt,
      raw_text: parsedRobots.rawText,
      crawl_delay_seconds: parsedRobots.crawlDelaySeconds,
      disallowed_paths: parsedRobots.disallowedPaths,
      allowed_paths: parsedRobots.allowedPaths
    },
    courtesy_delay_enforced_ms: effectiveDelayMs,
    statistics: {
      total_target_urls: targetUrls.length,
      scanned_count: scannedCount,
      inserted_count: insertedCount,
      updated_count: updatedCount,
      unchanged_count: unchangedCount,
      skipped_disallow_count: skippedDisallowCount,
      failed_pages_count: failedPagesCount
    },
    per_page_results: pageResults,
    raw_execution_logs: logs
  };
}
