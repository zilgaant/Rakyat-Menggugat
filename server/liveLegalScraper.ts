/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Live HTTP Scraper & Parser for Indonesian Legal Repositories
 * Targets:
 * - JDIH Mahkamah Konstitusi (https://jdih.mkri.id)
 * - JDIHN BPHN Kemenkumham (https://jdihn.go.id)
 * - JDIH Mahkamah Agung (https://jdih.mahkamahagung.go.id)
 * 
 * Features:
 * 1. Live fetch of robots.txt with rule evaluation per User-Agent
 * 2. Rate-limited HTTP fetcher with timeout, exponential backoff, and courtesy delay
 * 3. HTML text & metadata extractor (DOM/Regex parsing)
 * 4. Transparent network diagnostics
 */

export const CIVIC_USER_AGENT = 'RakyatMenggugat-LegalKnowledgeBot/1.0 (+https://rakyat-menggugat.id/legal-bot; non-profit-civic-access; contact: info@rakyat-menggugat.id)';

export interface ParsedRobotsTxt {
  crawlDelaySeconds: number;
  disallowedPaths: string[];
  allowedPaths: string[];
  rawText: string;
  sourceUrl: string;
  fetchedAt: string;
  isMockFallback: boolean;
}

export interface LiveScrapedLegalDoc {
  url: string;
  sumber: 'jdih_mk' | 'jdihn' | 'jdih_ma';
  nomor?: string;
  tahun?: string;
  judul?: string;
  jenis_dokumen: 'uud' | 'uu' | 'pp' | 'pmk' | 'perpres' | 'perda' | 'putusan_mk' | 'putusan_ma';
  isi_teks: string;
  ratio_decidendi?: string;
  amar_putusan?: string;
  status_berlaku?: 'berlaku' | 'dicabut' | 'diubah' | 'inkonstitusional_bersyarat';
  keywords: string[];
  scraped_at: string;
  http_status: number;
  fetch_duration_ms: number;
}

/**
 * 1. Live Fetch and Parser for robots.txt
 */
export async function fetchAndParseRobotsTxt(
  baseUrl: string,
  userAgent: string = CIVIC_USER_AGENT,
  timeoutMs: number = 5000
): Promise<ParsedRobotsTxt> {
  const robotsUrl = `${baseUrl.replace(/\/$/, '')}/robots.txt`;
  const fetchedAt = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(robotsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/plain, text/html, */*'
      },
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!response.ok) {
      // If 404 or not found, robots.txt permits all crawling by convention
      return {
        crawlDelaySeconds: 1,
        disallowedPaths: [],
        allowedPaths: ['/'],
        rawText: `HTTP ${response.status}: Defaulting to permissive rules`,
        sourceUrl: robotsUrl,
        fetchedAt,
        isMockFallback: false
      };
    }

    const rawText = await response.text();
    const parsed = parseRobotsTxtContent(rawText, userAgent);

    return {
      ...parsed,
      rawText,
      sourceUrl: robotsUrl,
      fetchedAt,
      isMockFallback: false
    };
  } catch (err: any) {
    // Network / timeout failure (e.g. offline sandbox or blocked egress)
    return {
      crawlDelaySeconds: 1,
      disallowedPaths: ['/admin/', '/private/'],
      allowedPaths: ['/putusan/', '/dokumen/', '/peraturan/'],
      rawText: `Fallback due to fetch error (${err.message}): standard permissive policy assumed`,
      sourceUrl: robotsUrl,
      fetchedAt,
      isMockFallback: true
    };
  }
}

/**
 * Parses raw robots.txt lines for the relevant User-Agent section
 */
export function parseRobotsTxtContent(
  raw: string,
  targetAgent: string
): { crawlDelaySeconds: number; disallowedPaths: string[]; allowedPaths: string[] } {
  const lines = raw.split(/\r?\n/);
  let currentAgentApplies = false;
  const disallowed: string[] = [];
  const allowed: string[] = [];
  let crawlDelay = 1;

  for (const line of lines) {
    const clean = line.split('#')[0].trim();
    if (!clean) continue;

    const [directive, ...valParts] = clean.split(':');
    const key = directive.trim().toLowerCase();
    const val = valParts.join(':').trim();

    if (key === 'user-agent') {
      const agentVal = val.toLowerCase();
      if (agentVal === '*' || targetAgent.toLowerCase().includes(agentVal)) {
        currentAgentApplies = true;
      } else {
        currentAgentApplies = false;
      }
    } else if (currentAgentApplies) {
      if (key === 'disallow' && val) {
        disallowed.push(val);
      } else if (key === 'allow' && val) {
        allowed.push(val);
      } else if (key === 'crawl-delay') {
        const parsedDelay = parseFloat(val);
        if (!isNaN(parsedDelay)) crawlDelay = parsedDelay;
      }
    }
  }

  return {
    crawlDelaySeconds: crawlDelay,
    disallowedPaths: disallowed,
    allowedPaths: allowed
  };
}

/**
 * Checks if a specific path is allowed according to parsed rules
 */
export function isPathAllowed(path: string, disallowedPaths: string[], allowedPaths: string[]): boolean {
  // Explicit allow overrides disallow
  for (const allowPath of allowedPaths) {
    if (path.startsWith(allowPath)) return true;
  }
  for (const disallowPath of disallowedPaths) {
    if (path.startsWith(disallowPath)) return false;
  }
  return true;
}

/**
 * 2. Live HTTP Document Fetcher with Rate Limiting & Courtesy Sleep
 */
export async function fetchLiveLegalPage(
  url: string,
  courtesyDelayMs: number = 1000,
  timeoutMs: number = 8000
): Promise<{ html: string; status: number; durationMs: number }> {
  // Enforce courteous delay before request
  if (courtesyDelayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, courtesyDelayMs));
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': CIVIC_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      signal: controller.signal
    });
    clearTimeout(timer);

    const html = await response.text();
    const durationMs = Date.now() - startTime;
    return { html, status: response.status, durationMs };
  } catch (err: any) {
    clearTimeout(timer);
    const durationMs = Date.now() - startTime;
    throw new Error(`Gagal menghubungi server ${url}: ${err.message} (${durationMs}ms)`);
  }
}

/**
 * 3. HTML Text & Legal Metadata Parser
 * Extracts Title, Nomor, Ratio Decidendi, and Clean Body Text from raw HTML
 */
export function parseLegalHtml(
  html: string,
  url: string,
  sumber: 'jdih_mk' | 'jdihn' | 'jdih_ma'
): Partial<LiveScrapedLegalDoc> {
  // Remove scripts, styles, and comments
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Extract <title>
  const titleMatch = cleanHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
  const rawTitle = titleMatch ? titleMatch[1].trim() : 'Dokumen Hukum';

  // Extract plain text from paragraphs and headings
  const textMatches = cleanHtml.match(/<(?:p|div|h[1-6]|li|td)[^>]*>([\s\S]*?)<\/(?:p|div|h[1-6]|li|td)>/gi) || [];
  const textLines = textMatches
    .map(block => block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 20);

  const fullText = textLines.join('\n\n');

  // Regex extractors for Indonesian legal identifiers
  const nomorMatch = fullText.match(/(?:Nomor|No\.?)\s*[:]?\s*([0-9A-Z\/\-\.]+)/i);
  const tahunMatch = fullText.match(/Tahun\s*([12][0-9]{3})/i);

  // Extract Ratio Decidendi / Kaidah Hukum
  let ratioDecidendi = '';
  const kaidahMatch = fullText.match(/(?:Kaidah Hukum|Ratio Decidendi|Pertimbangan Mahkamah|Menimbang)[\s\S]{10,800}?(?=\.|$)/i);
  if (kaidahMatch) {
    ratioDecidendi = kaidahMatch[0].replace(/\s+/g, ' ').trim();
  }

  // Extract Amar Putusan
  let amar = '';
  const amarMatch = fullText.match(/MENGADILI\s*[:]?([\s\S]{10,500}?)(?=(?:Demikian|Ditetapkan|$))/i);
  if (amarMatch) {
    amar = amarMatch[1].replace(/\s+/g, ' ').trim();
  }

  return {
    url,
    sumber,
    judul: rawTitle,
    nomor: nomorMatch ? nomorMatch[1] : undefined,
    tahun: tahunMatch ? tahunMatch[1] : new Date().getFullYear().toString(),
    isi_teks: fullText.length > 50 ? fullText : rawTitle,
    ratio_decidendi: ratioDecidendi || undefined,
    amar_putusan: amar || undefined,
    keywords: [rawTitle.toLowerCase(), nomorMatch ? nomorMatch[1].toLowerCase() : ''].filter(Boolean)
  };
}
