# Project Engineering Rules & Conventions

## 1. Transparency & Verifiable Evidence Standard (MANDATORY)
- **Always Provide Concrete Evidence**: When requested to check code, demonstrate functionality, or explain system status, you MUST provide raw code snippets, actual terminal/grep command outputs, or real test suite logs. Prosaic summaries alone are never sufficient when verification is requested.
- **Show, Don't Just Tell**: Quote the exact function implementations, lines of code, and real database write pathways.

## 2. Established Legal & Technical Terminologies
- **Legalisasi / Pemeteraian di Kantor Pos**:
  - NEVER use the obsolete Dutch term *"Nazegelen"*.
  - Exclusively use the standard Indonesian term **"legalisasi/pemeteraian di Kantor Pos"** (sesuai UU No. 10/2020 tentang Bea Meterai dan PMK No. 2/2021).
  - All UI elements, checklist cards, warning tooltips, and generated legal documents (Buku II Alat Bukti MK) must strictly follow this terminology.

## 3. Data Storage & Firestore Subcollections
- Evidence items must be persisted in subcollections: `cases/{caseId}/evidence_items/{evidenceId}`.
- Statements/agreements must be stored in: `cases/{caseId}/statement_form/{formId}` and `cases/{caseId}/consents/{consentId}`.
- Legal knowledge versioning must reside in: `legal_knowledge_entries/{entryId}/versions/{versionId}`.

## 4. Posita-Evidence Direct Linkage Rule
- Every generated evidence item ($P-1$ s.d. $P-X$) must include an explicit `posita_dalil_terkait` property linking it directly to legal standing requirements or substantive grounds in the Posita.

## 5. Legal Knowledge Pipeline Status & Known Gaps (ARCHITECTURAL RECORD)
- **Pipeline Ingestion & Versioning**: ACTIVE and fully operational via `ingestScrapedRecord()` and `executeLegalKnowledgeSync()`, using hashing (SHA-256) and Firestore subcollection versioning (`legal_knowledge_entries/{entryId}/versions/{versionId}`).
- **Corpus Source Status**: Operates deterministically on curated official snapshots (`OFFICIAL_SOURCE_RECORDS`), not live web crawling.
- **Live Scraper Component Status (ISOLATED ONLY)**: Component modules exist in `server/liveLegalScraper.ts` (`fetchLiveLegalPage()`, `parseLegalHtml()`, `fetchAndParseRobotsTxt()`, `isPathAllowed()`).
- **KNOWN GAPS / BACKLOG**:
  1. **Live Crawling Orchestrator**: NO live crawling or HTTP requests are performed against government domains (`.go.id`) in the default application runtime. End-to-end orchestration linking live fetch $\rightarrow$ live robots.txt evaluation $\rightarrow$ HTML parser $\rightarrow$ ingestion pipeline is NOT yet assembled or scheduled.
  2. **Whitelist Path Validation Engine**: Static policy helper is explicitly named `getWhitelistPolicyDescription()` (returns informational policy text for logging). Active regex/path-matching validation against incoming URLs is deferred to the future live crawler orchestrator.

