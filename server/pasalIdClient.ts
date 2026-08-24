/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pasal.id Unified Symmetrical Legal Client & Rate-Limited Provider
 * Connects Rakyat Menggugat with the Pasal.id REST API & MCP Server (v3.2.0)
 * 
 * Capabilities:
 * 1. searchPasalIdFull (Unified Symmetrical Search: Laws + Court Decisions for Agent 2 & Agent 3)
 * 2. searchPasalIdCourtDecisions (Mahkamah Konstitusi PUU, SKLN, PHPU Decisions)
 * 3. searchPasalIdLawsRest (187,000+ Indonesian Laws & Regulations)
 * 4. resolvePasalIdLaw & readPasalIdLaw (Specific articles, pasal, and ayat text)
 * 5. Built-in Client Throttler, Concurrency Lock & Abort Controller
 */

export interface PasalIdCourtDecision {
  law_id: number;
  perkara_number: string;
  title: string;
  lane: string;
  lane_label?: string;
  amar: string;
  amar_label?: string;
  jenis?: string;
  jenis_pengujian?: string;
  klasifikasi?: string;
  decided_at?: string;
  year?: number;
  has_dissent?: boolean;
  score?: number; // Computed topical relevance score
  reviewed_laws?: Array<{
    law_id: number;
    citation: string;
    law_title: string;
    law_number: string;
    year: number;
    frbr_uri: string;
    reader_url: string;
  }>;
  reader_url?: string;
  source_url?: string;
  frbr_uri?: string;
  disclaimer?: string;
}

export interface PasalIdSearchResult {
  work_id: number;
  snippet?: string;
  score?: number;
  matching_pasals?: string[];
  best_passage?: {
    version?: number;
    target?: string;
    href?: string;
    work_href?: string;
    node_id?: number;
    pasal_node_id?: number;
    pasal_number?: string;
    pasal_label?: string;
    node_type?: string;
    heading?: string | null;
  } | null;
  work?: {
    frbr_uri: string;
    title: string;
    number: string;
    year: number;
    status: string;
    type: string;
  };
}

export interface FullLegalSearchResult {
  laws: PasalIdSearchResult[];
  court_decisions: PasalIdCourtDecision[];
  sumber: 'pasal_id' | 'seed_manual';
  query_used: string;
  timestamp: string;
  latency_ms?: number;
  status: 'success' | 'partial' | 'failed';
}

export function getPasalIdApiKey(): string {
  return process.env.PASAL_ID_API_KEY || '';
}

// --- RATE LIMITER & THROTTLER IMPLEMENTATION (FASE 4) ---
let lastRequestTimestamp = 0;
const MIN_REQUEST_INTERVAL_MS = 250; // Minimum spacing between outbound Pasal.id calls
let activeConcurrentRequests = 0;
const MAX_CONCURRENT_REQUESTS = 2;

async function throttlePasalIdCall<T>(action: () => Promise<T>): Promise<T> {
  // Wait if too many concurrent requests
  while (activeConcurrentRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise(r => setTimeout(r, 100));
  }

  // Ensure minimum interval between calls
  const now = Date.now();
  const elapsed = now - lastRequestTimestamp;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL_MS - elapsed));
  }

  activeConcurrentRequests++;
  lastRequestTimestamp = Date.now();

  try {
    return await action();
  } finally {
    activeConcurrentRequests--;
  }
}

/**
 * Executes a tool call on the Pasal.id MCP Server via SSE / JSON-RPC 2.0 with timeout
 */
export async function callPasalIdMcpTool<T = any>(
  toolName: string, 
  args: Record<string, any> = {},
  timeoutMs: number = 4000
): Promise<T> {
  return throttlePasalIdCall(async () => {
    const apiKey = getPasalIdApiKey();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // 1. Initialize MCP session
      const initHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      };
      if (apiKey) {
        initHeaders['Authorization'] = `Bearer ${apiKey}`;
      }

      const initRes = await fetch('https://mcp.pasal.id/mcp', {
        method: 'POST',
        headers: initHeaders,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'RakyatMenggugat-CivicClient',
              version: '1.1.0'
            }
          }
        }),
        signal: controller.signal
      });

      if (!initRes.ok) {
        throw new Error(`Pasal.id MCP initialization failed: HTTP ${initRes.status} ${initRes.statusText}`);
      }

      const sessionId = initRes.headers.get('mcp-session-id');
      if (!sessionId) {
        throw new Error('Pasal.id MCP did not return a valid session ID');
      }

      // 2. Call the tool
      const callHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'mcp-session-id': sessionId
      };
      if (apiKey) {
        callHeaders['Authorization'] = `Bearer ${apiKey}`;
      }

      const callRes = await fetch('https://mcp.pasal.id/mcp', {
        method: 'POST',
        headers: callHeaders,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args
          }
        }),
        signal: controller.signal
      });

      if (!callRes.ok) {
        throw new Error(`Pasal.id MCP tool ${toolName} call failed: HTTP ${callRes.status}`);
      }

      const rawText = await callRes.text();
      const jsonStr = rawText.replace(/^event:\s*message\s*data:\s*/m, '').trim();
      const parsed = JSON.parse(jsonStr);

      if (parsed.error) {
        throw new Error(`Pasal.id MCP Error [${parsed.error.code}]: ${parsed.error.message}`);
      }

      if (parsed.result?.content && Array.isArray(parsed.result.content)) {
        const textContent = parsed.result.content.find((c: any) => c.type === 'text');
        if (textContent?.text) {
          try {
            return JSON.parse(textContent.text) as T;
          } catch {
            return textContent.text as unknown as T;
          }
        }
      }

      return parsed.result as T;
    } finally {
      clearTimeout(timer);
    }
  });
}

/**
 * Searches Putusan Mahkamah Konstitusi via Pasal.id MCP tool `search_court_decisions`
 */
export async function searchPasalIdCourtDecisions(
  query: string,
  options?: {
    reviewed_law?: string;
    lane?: string;
    amar?: string;
    year?: number;
    has_dissent?: boolean;
    limit?: number;
    timeoutMs?: number;
  }
): Promise<PasalIdCourtDecision[]> {
  try {
    const result = await callPasalIdMcpTool<PasalIdCourtDecision[]>(
      'search_court_decisions', 
      {
        query,
        reviewed_law: options?.reviewed_law,
        lane: options?.lane,
        amar: options?.amar,
        year: options?.year,
        has_dissent: options?.has_dissent,
        limit: options?.limit || 5
      },
      options?.timeoutMs || 4000
    );

    if (Array.isArray(result)) {
      return result;
    }
    return [];
  } catch (err: any) {
    console.warn('searchPasalIdCourtDecisions non-blocking error:', err.message);
    return [];
  }
}

/**
 * Searches statutory laws and regulations via REST API /api/v1/search with throttling & timeout
 */
export async function searchPasalIdLawsRest(
  query: string, 
  timeoutMs: number = 4000
): Promise<PasalIdSearchResult[]> {
  return throttlePasalIdCall(async () => {
    const apiKey = getPasalIdApiKey();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = `https://pasal.id/api/v1/search?q=${encodeURIComponent(query)}`;
      const reqHeaders: Record<string, string> = {
        'Accept': 'application/json'
      };
      if (apiKey) {
        reqHeaders['Authorization'] = `Bearer ${apiKey}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: reqHeaders,
        signal: controller.signal
      });

      if (!res.ok) {
        console.warn(`Pasal.id REST search notice: HTTP ${res.status}`);
        return [];
      }

      const data = await res.json();
      return (data.results || []) as PasalIdSearchResult[];
    } catch (err: any) {
      console.warn('searchPasalIdLawsRest non-blocking error:', err.message);
      return [];
    } finally {
      clearTimeout(timer);
    }
  });
}

/**
 * Computes a substantive topical relevance score between query keywords and court decision metadata
 */
export function computeCourtDecisionRelevance(
  decision: PasalIdCourtDecision,
  query: string
): number {
  const qLower = query.toLowerCase();
  const rawWords = qLower.split(/[\s,\-\.\/]+/).filter(w => w.length > 2);
  const stopWords = new Set(['dan', 'atau', 'yang', 'untuk', 'dari', 'dalam', 'atas', 'tentang', 'nomor', 'tahun', 'pasal', 'oleh', 'pada', 'dengan', 'terhadap']);
  const keywords = rawWords.filter(w => !stopWords.has(w));

  let score = 0;

  // 1. Lane bonus / penalty
  const isQueryAboutPUU = qLower.includes('uu') || qLower.includes('undang') || qLower.includes('materiil') || qLower.includes('formil');
  if (decision.lane === 'puu') {
    score += isQueryAboutPUU ? 1.0 : 0.5;
  } else if (decision.lane === 'phpu' || decision.lane === 'phpkada') {
    // If query is not explicitly about election/pemilu, heavily penalize election disputes
    const isElectionQuery = qLower.includes('pemilu') || qLower.includes('pilpres') || qLower.includes('pilkada') || qLower.includes('suara');
    if (!isElectionQuery) {
      return -5.0; // Completely filter out
    }
  }

  const klasifikasiLower = (decision.klasifikasi || '').toLowerCase();
  const titleLower = (decision.title || '').toLowerCase();

  // 2. Keyword matching in Klasifikasi (Highest weight)
  for (const kw of keywords) {
    if (klasifikasiLower.includes(kw)) {
      score += 2.0;
    }
    if (titleLower.includes(kw)) {
      score += 1.0;
    }
  }

  // 3. Reviewed law matching
  if (decision.reviewed_laws && decision.reviewed_laws.length > 0) {
    for (const rl of decision.reviewed_laws) {
      const lawTitle = (rl.law_title || '').toLowerCase();
      const citation = (rl.citation || '').toLowerCase();
      for (const kw of keywords) {
        if (citation.includes(kw) || lawTitle.includes(kw)) {
          score += 0.5;
        }
      }
    }
  }

  // 4. Multi-Sector Domain Alignment & Disparate Domain Penalties (Anti-Salah Rujuk across 4 Core Sectors)
  // Sektor 1: Ketenagakerjaan
  const isLaborQuery = qLower.includes('buruh') || qLower.includes('pesangon') || qLower.includes('upah') || qLower.includes('phk') || qLower.includes('ketenagakerjaan') || qLower.includes('pekerja') || qLower.includes('serikat');
  if (isLaborQuery) {
    if (klasifikasiLower.includes('telekomunikasi') || klasifikasiLower.includes('tarif') || klasifikasiLower.includes('penyiaran') || klasifikasiLower.includes('pajak') || klasifikasiLower.includes('pertambangan') || klasifikasiLower.includes('pemilu')) {
      score -= 3.5; // Disparate domain penalty
    }
    if (klasifikasiLower.includes('ketenagakerjaan') || klasifikasiLower.includes('hubungan industrial') || klasifikasiLower.includes('phk') || klasifikasiLower.includes('upah') || klasifikasiLower.includes('tenaga kerja')) {
      score += 4.0; // Strong bonus for matching domain
    }
  }

  // Sektor 2: Lingkungan Hidup / Minerba / AMDAL
  const isEnvironmentQuery = qLower.includes('lingkungan') || qLower.includes('amdal') || qLower.includes('limbah') || qLower.includes('minerba') || qLower.includes('tambang') || qLower.includes('polusi') || qLower.includes('hutan') || qLower.includes('pencemaran');
  if (isEnvironmentQuery) {
    if (klasifikasiLower.includes('telekomunikasi') || klasifikasiLower.includes('ketenagakerjaan') || klasifikasiLower.includes('upah') || klasifikasiLower.includes('pemilu') || klasifikasiLower.includes('pajak')) {
      score -= 3.5; // Disparate domain penalty
    }
    if (klasifikasiLower.includes('lingkungan hidup') || klasifikasiLower.includes('pertambangan') || klasifikasiLower.includes('mineral dan batubara') || klasifikasiLower.includes('kehutanan') || klasifikasiLower.includes('sumber daya alam')) {
      score += 4.0; // Strong bonus for matching domain
    }
  }

  // Sektor 3: Agraria / Tanah / Masyarakat Adat
  const isAgrarianQuery = qLower.includes('tanah') || qLower.includes('adat') || qLower.includes('ulayat') || qLower.includes('agraria') || qLower.includes('penggusuran') || qLower.includes('sertifikat') || qLower.includes('hgu') || qLower.includes('wilayah adat');
  if (isAgrarianQuery) {
    if (klasifikasiLower.includes('telekomunikasi') || klasifikasiLower.includes('ketenagakerjaan') || klasifikasiLower.includes('pemilu') || klasifikasiLower.includes('ite') || klasifikasiLower.includes('penyiaran')) {
      score -= 3.5; // Disparate domain penalty
    }
    if (klasifikasiLower.includes('agraria') || klasifikasiLower.includes('tanah') || klasifikasiLower.includes('masyarakat hukum adat') || klasifikasiLower.includes('kehutanan') || klasifikasiLower.includes('hak ulayat')) {
      score += 4.0; // Strong bonus for matching domain
    }
  }

  // Sektor 4: ITE / Digital / Kebebasan Berekspresi
  const isDigitalQuery = qLower.includes('ite') || qLower.includes('pencemaran nama baik') || qLower.includes('berekspresi') || qLower.includes('informasi elektronik') || qLower.includes('kebebasan berpendapat') || qLower.includes('hoaks') || qLower.includes('ujaran kebencian');
  if (isDigitalQuery) {
    if (klasifikasiLower.includes('pertambangan') || klasifikasiLower.includes('lingkungan') || klasifikasiLower.includes('ketenagakerjaan') || klasifikasiLower.includes('upah') || klasifikasiLower.includes('agraria')) {
      score -= 3.5; // Disparate domain penalty
    }
    if (klasifikasiLower.includes('informasi dan transaksi elektronik') || klasifikasiLower.includes('ite') || klasifikasiLower.includes('kebebasan menyatakan pendapat') || klasifikasiLower.includes('telekomunikasi') || klasifikasiLower.includes('pers')) {
      score += 4.0; // Strong bonus for matching domain
    }
  }

  return score;
}

/**
 * UNIFIED SYMMETRICAL LEGAL SEARCH (FASE 1)
 * Accessible FULLY by both Agent 2 (Legal Analyst) and Agent 3 (Independent Verifier).
 * Searches both statutory laws and court decisions for the agent's custom-formulated query.
 */
export async function searchPasalIdFull(
  query: string,
  options?: {
    limitLaws?: number;
    limitDecisions?: number;
    timeoutMs?: number;
  }
): Promise<FullLegalSearchResult> {
  const startTime = Date.now();
  const cleanQuery = query.substring(0, 160).replace(/[^\w\s\-\.\/]/g, ' ').trim();

  try {
    const [laws, courtDecisions] = await Promise.all([
      searchPasalIdLawsRest(cleanQuery, options?.timeoutMs || 4000),
      searchPasalIdCourtDecisions(cleanQuery, {
        limit: (options?.limitDecisions || 4) * 2, // Fetch broader pool to filter by relevance
        timeoutMs: options?.timeoutMs || 4000
      })
    ]);

    // Rank and filter court decisions by substantive relevance score
    const scoredDecisions: PasalIdCourtDecision[] = courtDecisions.map(d => ({
      ...d,
      score: computeCourtDecisionRelevance(d, cleanQuery)
    }));

    // Filter out negative score decisions (disparate topics) and sort descending
    const filteredDecisions = scoredDecisions
      .filter(d => (d.score ?? 0) >= 0)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    const latency = Date.now() - startTime;
    const isSuccess = laws.length > 0 || filteredDecisions.length > 0;

    return {
      laws: laws.slice(0, options?.limitLaws || 4),
      court_decisions: filteredDecisions.slice(0, options?.limitDecisions || 4),
      sumber: 'pasal_id',
      query_used: cleanQuery,
      timestamp: new Date().toISOString(),
      latency_ms: latency,
      status: isSuccess ? 'success' : 'failed'
    };
  } catch (err: any) {
    console.warn(`searchPasalIdFull failed for query "${cleanQuery}":`, err.message);
    return {
      laws: [],
      court_decisions: [],
      sumber: 'pasal_id',
      query_used: cleanQuery,
      timestamp: new Date().toISOString(),
      latency_ms: Date.now() - startTime,
      status: 'failed'
    };
  }
}

/**
 * Resolves a legal citation to canonical law_id via MCP `resolve_law`
 */
export async function resolvePasalIdLaw(reference: string): Promise<any> {
  try {
    return await callPasalIdMcpTool('resolve_law', { reference }, 3500);
  } catch (err: any) {
    console.warn(`resolvePasalIdLaw error for "${reference}":`, err.message);
    return null;
  }
}

/**
 * Reads specific pasal/articles from a law via MCP `read_law`
 */
export async function readPasalIdLaw(law: string, selector: string = 'all'): Promise<any> {
  try {
    return await callPasalIdMcpTool('read_law', { law, selector, max_chars: 15000 }, 4500);
  } catch (err: any) {
    console.warn(`readPasalIdLaw error for "${law}" selector "${selector}":`, err.message);
    return null;
  }
}
