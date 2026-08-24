/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Express + Vite Server Entry Point for Rakyat Menggugat
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { runAgent2Analysis } from './server/agent2Analysis';
import { runAgent3Verification } from './server/agent3Verifier';
import { reconcileAssessment } from './server/reconciliation';
import { runAgent1Intake } from './server/agent1Intake';
import { LEGAL_KNOWLEDGE_BASE, retrieveRelevantLegalKnowledge } from './server/legalKnowledge';
import { generateConstitutionalPetition, generateDocxBuffer, generatePrintHtml, ConstitutionalPetitionDocument } from './server/documentGenerator';
import { generateDynamicEvidenceMatrix } from './server/evidenceGenerator';
import {
  executeLegalKnowledgeSync,
  getAllLegalKnowledgeEntries,
  getEntryVersions,
  getSyncJobHistory
} from './server/legalKnowledgeETL';
import { runJdihMkCrawlOrchestrator } from './server/jdihMkCrawlerOrchestrator';
import {
  searchPasalIdCourtDecisions,
  searchPasalIdLawsRest,
  searchPasalIdFull,
  resolvePasalIdLaw,
  readPasalIdLaw
} from './server/pasalIdClient';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- HEALTH CHECK ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- LEGAL KNOWLEDGE BASE & ETL INGESTION PIPELINE ---
  app.get('/api/legal-knowledge', (req, res) => {
    res.json({ items: LEGAL_KNOWLEDGE_BASE });
  });

  app.get('/api/legal-knowledge/entries', (req, res) => {
    try {
      const entries = getAllLegalKnowledgeEntries();
      res.json({ entries });
    } catch (err: any) {
      console.error('API /api/legal-knowledge/entries error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch legal knowledge entries' });
    }
  });

  app.get('/api/legal-knowledge/entries/:entryId/versions', (req, res) => {
    try {
      const { entryId } = req.params;
      const versions = getEntryVersions(entryId);
      res.json({ entry_id: entryId, versions });
    } catch (err: any) {
      console.error(`API /api/legal-knowledge/entries/${req.params.entryId}/versions error:`, err);
      res.status(500).json({ error: err.message || 'Failed to fetch entry versions' });
    }
  });

  app.post('/api/legal-knowledge/sync', async (req, res) => {
    try {
      const { source = 'all', delayMs = 1000 } = req.body;
      const result = await executeLegalKnowledgeSync(source, delayMs);
      res.json({ result });
    } catch (err: any) {
      console.error('API /api/legal-knowledge/sync error:', err);
      res.status(500).json({ error: err.message || 'ETL sync job failed' });
    }
  });

  // --- JDIH MK LIVE CRAWLING ORCHESTRATOR (MANUAL DRY RUN & VERIFICATION) ---
  app.post('/api/legal-knowledge/crawl-mk', async (req, res) => {
    try {
      const { targetUrls, minDelayMs = 2000, dryRunLabel } = req.body;
      const result = await runJdihMkCrawlOrchestrator({
        targetUrls,
        minDelayMs,
        dryRunLabel: dryRunLabel || 'API Manual Trigger'
      });
      res.json({ result });
    } catch (err: any) {
      console.error('API /api/legal-knowledge/crawl-mk error:', err);
      res.status(500).json({ error: err.message || 'JDIH MK crawl orchestration failed' });
    }
  });

  app.get('/api/legal-knowledge/sync-history', (req, res) => {
    try {
      const history = getSyncJobHistory();
      res.json({ history });
    } catch (err: any) {
      console.error('API /api/legal-knowledge/sync-history error:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch sync history' });
    }
  });

  app.post('/api/legal-knowledge/search', (req, res) => {
    try {
      const { query, topK = 6 } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Parameter query pencarian wajib diisi.' });
      }
      const results = retrieveRelevantLegalKnowledge(query, topK);
      res.json({ query, results });
    } catch (err: any) {
      console.error('API /api/legal-knowledge/search error:', err);
      res.status(500).json({ error: err.message || 'Legal search failed' });
    }
  });

  // --- PASAL.ID LEGAL CORPUS & PRECEDENT LOOKUP APIS ---
  app.get('/api/pasal-id/search-full', async (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      if (!query) {
        return res.status(400).json({ error: 'Query pencarian naskah hukum & putusan MK wajib diisi' });
      }
      const limitLaws = req.query.limitLaws ? parseInt(req.query.limitLaws as string, 10) : 4;
      const limitDecisions = req.query.limitDecisions ? parseInt(req.query.limitDecisions as string, 10) : 4;
      const result = await searchPasalIdFull(query, { limitLaws, limitDecisions });
      res.json(result);
    } catch (err: any) {
      console.error('API /api/pasal-id/search-full error:', err);
      res.status(500).json({ error: err.message || 'Pasal.id unified search failed' });
    }
  });

  app.get('/api/pasal-id/decisions', async (req, res) => {
    try {
      const query = (req.query.q as string) || 'Pengujian Undang-Undang';
      const reviewedLaw = req.query.reviewed_law as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const decisions = await searchPasalIdCourtDecisions(query, {
        reviewed_law: reviewedLaw,
        limit
      });
      res.json({ query, decisions });
    } catch (err: any) {
      console.error('API /api/pasal-id/decisions error:', err);
      res.status(500).json({ error: err.message || 'Pasal.id decisions search failed' });
    }
  });

  app.get('/api/pasal-id/laws', async (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      if (!query) {
        return res.status(400).json({ error: 'Query pencarian UU wajib diisi' });
      }
      const results = await searchPasalIdLawsRest(query);
      res.json({ query, results });
    } catch (err: any) {
      console.error('API /api/pasal-id/laws error:', err);
      res.status(500).json({ error: err.message || 'Pasal.id laws search failed' });
    }
  });

  app.post('/api/pasal-id/resolve', async (req, res) => {
    try {
      const { reference } = req.body;
      if (!reference) {
        return res.status(400).json({ error: 'Parameter reference wajib diisi' });
      }
      const result = await resolvePasalIdLaw(reference);
      res.json({ reference, result });
    } catch (err: any) {
      console.error('API /api/pasal-id/resolve error:', err);
      res.status(500).json({ error: err.message || 'Pasal.id resolve law failed' });
    }
  });

  app.post('/api/pasal-id/read', async (req, res) => {
    try {
      const { law, selector = 'all' } = req.body;
      if (!law) {
        return res.status(400).json({ error: 'Parameter law identifier wajib diisi' });
      }
      const result = await readPasalIdLaw(law, selector);
      res.json({ law, selector, result });
    } catch (err: any) {
      console.error('API /api/pasal-id/read error:', err);
      res.status(500).json({ error: err.message || 'Pasal.id read law failed' });
    }
  });

  // --- AGENT 1: CITIZEN INTAKE ---
  app.post('/api/agent-intake', async (req, res) => {
    try {
      const { caseFacts, chatHistory = [], userLanguage = 'id' } = req.body;
      const response = await runAgent1Intake(caseFacts || '', chatHistory, userLanguage);
      res.json(response);
    } catch (err: any) {
      console.error('API /api/agent-intake error:', err);
      res.status(500).json({ error: err.message || 'Intake failed' });
    }
  });

  // --- DUAL-AGENT INDEPENDENT CONSTITUTIONAL ASSESSMENT ---
  // Strictly invokes Agent 2 and Agent 3 independently in parallel, then reconciles deterministically
  app.post('/api/assess-dual-agent', async (req, res) => {
    try {
      const { caseId, caseFacts, userLanguage = 'id' } = req.body;

      if (!caseFacts || typeof caseFacts !== 'string') {
        return res.status(400).json({ error: 'Uraian fakta kasus wajib diisi.' });
      }

      const validCaseId = caseId || `case-${Date.now().toString(36)}`;

      // Execute Agent 2 (Legal Analyst) and Agent 3 (Independent Verifier) IN PARALLEL
      // Agent 3 does NOT receive Agent 2's output
      const [agent2Result, agent3Result] = await Promise.all([
        runAgent2Analysis(caseFacts, userLanguage),
        runAgent3Verification(caseFacts, userLanguage)
      ]);

      // Deterministic Reconciliation Layer (Pure code comparison)
      const assessment = reconcileAssessment(validCaseId, agent2Result, agent3Result);

      res.json({
        assessment,
        agent2: {
          run_id: agent2Result.agent_run_id,
          hasil: agent2Result.hasil_evaluasi,
          confidence: agent2Result.confidence
        },
        agent3: {
          run_id: agent3Result.agent_run_id,
          hasil: agent3Result.hasil_verifikasi,
          confidence: agent3Result.confidence
        }
      });
    } catch (err: any) {
      console.error('API /api/assess-dual-agent error:', err);
      res.status(500).json({ error: err.message || 'Dual agent assessment failed' });
    }
  });

  // --- DYNAMIC EVIDENCE MATRIX GENERATOR (PMK No. 2/2021) ---
  app.post('/api/generate-evidence-matrix', async (req, res) => {
    try {
      const { caseId, caseFacts, petitionerName, substantiveElements } = req.body;
      if (!caseFacts || typeof caseFacts !== 'string') {
        return res.status(400).json({ error: 'Uraian fakta kasus wajib disertakan.' });
      }

      const validCaseId = caseId || `case-${Date.now().toString(36)}`;
      const result = generateDynamicEvidenceMatrix(validCaseId, caseFacts, petitionerName || 'Pemohon', substantiveElements);

      res.json(result);
    } catch (err: any) {
      console.error('API /api/generate-evidence-matrix error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate evidence matrix' });
    }
  });

  // --- DOCUMENT GENERATOR: BUKU I PERMOHONAN MK & ALAT BUKTI ---
  app.post('/api/generate-petition', async (req, res) => {
    try {
      const { caseFacts, petitionerInput, assessment } = req.body;
      if (!caseFacts) {
        return res.status(400).json({ error: 'Uraian fakta kasus wajib disertakan.' });
      }

      const petitionDoc = await generateConstitutionalPetition(caseFacts, petitionerInput, assessment);
      res.json({ document: petitionDoc });
    } catch (err: any) {
      console.error('API /api/generate-petition error:', err);
      const statusCode = err.status || 500;
      res.status(statusCode).json({
        error: err.message || 'Failed to generate petition document',
        code: err.code,
        reconciledAssessment: err.reconciledAssessment
      });
    }
  });

  // --- EXPORT TO DOCX FILE STREAM ---
  app.post('/api/export-docx', async (req, res) => {
    try {
      const petitionDocument = (req.body.petitionDocument || req.body.document) as ConstitutionalPetitionDocument;
      if (!petitionDocument || !petitionDocument.posita) {
        return res.status(400).json({ error: 'Data dokumen permohonan tidak valid.' });
      }

      const buffer = await generateDocxBuffer(petitionDocument);
      const safeName = (petitionDocument.identitas_pemohon?.nama_lengkap || 'Pemohon')
        .replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Buku_I_Permohonan_MK_${safeName}.docx`;

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.send(buffer);
    } catch (err: any) {
      console.error('API /api/export-docx error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate DOCX' });
    }
  });

  // --- EXPORT / PREVIEW PRINT HTML (FOR PRINT TO PDF) ---
  app.post('/api/export-print-html', (req, res) => {
    try {
      const petitionDocument = (req.body.petitionDocument || req.body.document) as ConstitutionalPetitionDocument;
      if (!petitionDocument || !petitionDocument.posita) {
        return res.status(400).json({ error: 'Data dokumen permohonan tidak valid.' });
      }

      const html = generatePrintHtml(petitionDocument);
      res.json({ html });
    } catch (err: any) {
      console.error('API /api/export-print-html error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate print HTML' });
    }
  });

  // --- VITE MIDDLEWARE (Development vs Production) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rakyat Menggugat Server running on http://localhost:${PORT}`);
  });
}

startServer();
