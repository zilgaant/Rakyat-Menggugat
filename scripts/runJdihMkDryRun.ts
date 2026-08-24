/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Manual Dry-Run Execution Script for JDIH MK Live Crawling Orchestrator
 * Target: https://jdih.mkri.id
 */

import { runJdihMkCrawlOrchestrator } from '../server/jdihMkCrawlerOrchestrator';

async function main() {
  console.log('=== STARTING MANUAL DRY-RUN FOR JDIH MK ORCHESTRATOR ===');

  // 3-5 real candidate target URLs + 1 synthetic disallowed check
  const targetUrls = [
    'https://jdih.mkri.id/peraturan',
    'https://jdih.mkri.id/putusan',
    'https://jdih.mkri.id/dokumen',
    'https://jdih.mkri.id/admin/login' // Path tested against disallow rules
  ];

  const result = await runJdihMkCrawlOrchestrator({
    targetUrls,
    minDelayMs: 2000, // 2000ms polite courtesy delay
    dryRunLabel: 'Manual Dry-Run JDIH MK (3-5 Halaman)'
  });

  console.log('\n=== DRY-RUN EXECUTION RESULT (FULL JSON) ===');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Fatal Dry-Run Error:', err);
  process.exit(1);
});
