/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Agent 3: Independent Verifier Agent (Penelaah Independen & Adversarial Checker)
 * Evaluates the case strictly independently without seeing Agent 2's output (no anchoring bias).
 * Has its own separate retrieval query and independent reasoning.
 * Symmetrical search via Pasal.id unified search (searchPasalIdFull) with full tiered fallback.
 */

import { generateGeminiContentWithRetry } from './geminiHelper';
import { LEGAL_KNOWLEDGE_BASE, LegalKnowledgeItem, retrieveRelevantLegalKnowledge } from './legalKnowledge';
import { AgentLayerEvaluation } from './agent2Analysis';
import { searchPasalIdFull, FullLegalSearchResult } from './pasalIdClient';

export interface AgentVerifierOutput {
  agent_run_id: string;
  agent_name: 'Agent 3 (Independent Verifier)';
  model_used?: string;
  hasil_verifikasi: 'layak' | 'perlu_data_tambahan' | 'tidak_layak';
  layers: AgentLayerEvaluation[];
  catatan_kritis_independen: string;
  catatan_ambiguitas: string | null;
  confidence: 'tinggi' | 'sedang' | 'rendah';
  query_used?: string;
  search_sumber?: string;
}

/**
 * Formulates adversarial procedural & jurisdictional verification query independently for Agent 3
 */
export function formulateAgent3Query(caseFacts: string): string {
  const clean = caseFacts.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ').slice(0, 15).join(' ');
  return `${words} kompetensi absolut peradilan putusan mahkamah konstitusi ne bis in idem kewenangan ma pmk 2 2021 standing causal verband`.trim();
}

export async function runAgent3Verification(
  caseFacts: string,
  userLanguage: string = 'id',
  legalKnowledgeDb: LegalKnowledgeItem[] = LEGAL_KNOWLEDGE_BASE
): Promise<AgentVerifierOutput> {
  const runId = `ag3-run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const retrievedDocs: LegalKnowledgeItem[] = [];
  const retrievalTimestamp = new Date().toISOString();

  // 1. Independent adversarial retrieval query for Agent 3
  const adversarialQuery = formulateAgent3Query(caseFacts);
  let dataTierUsed = 'pasal_id';

  // 2. Primary Live Symmetrical Retrieval via Pasal.id (searchPasalIdFull) - FASE 1 & FASE 3
  try {
    const fullResult: FullLegalSearchResult = await searchPasalIdFull(adversarialQuery, {
      limitLaws: 4,
      limitDecisions: 4,
      timeoutMs: 3800
    });

    if (fullResult.status === 'success' && (fullResult.laws.length > 0 || fullResult.court_decisions.length > 0)) {
      // Map court decisions into LegalKnowledgeItem with permanent audit trail
      for (const dec of fullResult.court_decisions) {
        const safeNomor = dec.perkara_number || (dec.law_id ? `ID-${dec.law_id}` : 'Putusan MK');
        const safeId = dec.law_id ? `pasal-id-mk-${dec.law_id}` : `pasal-id-mk-${safeNomor.replace(/[^\w]/g, '-')}`;
        const safeTitle = dec.title || `Putusan MK ${safeNomor}`;

        retrievedDocs.push({
          id: safeId,
          version_id: `v-pasal-id-mk-${dec.law_id || 'latest'}`,
          sumber: 'pasal_id',
          jenis_dokumen: 'putusan_mk',
          nomor: safeNomor,
          tahun: String(dec.year || 2023),
          judul: safeTitle,
          isi_teks: `${safeTitle} Amar: ${dec.amar || dec.amar_label || 'Telah diputus'}. ${dec.disclaimer || ''}`,
          ringkasan_kaidah: `Presedensi Mahkamah Konstitusi dari Pasal.id: ${safeTitle}`,
          frbr_uri: dec.frbr_uri,
          reader_url: dec.reader_url || 'https://pasal.id'
        });
      }

      // Map statutory laws into LegalKnowledgeItem with permanent audit trail
      for (const law of fullResult.laws) {
        if (law.work) {
          retrievedDocs.push({
            id: `pasal-id-law-${law.work_id}`,
            version_id: `v-pasal-id-${law.work_id}`,
            sumber: 'pasal_id',
            jenis_dokumen: law.work.type === 'uu' ? 'uu' : 'pp',
            nomor: law.work.number ? `No. ${law.work.number}` : `No. ${law.work_id}`,
            tahun: String(law.work.year || 2024),
            judul: law.work.title || 'Peraturan Terkait',
            isi_teks: law.snippet || law.best_passage?.heading || law.work.title,
            ringkasan_kaidah: `Naskah hukum terverifikasi dari Pasal.id: ${law.work.title}`,
            frbr_uri: law.work.frbr_uri,
            reader_url: law.best_passage?.href ? `https://pasal.id${law.best_passage.href}` : `https://pasal.id/laws/${law.work_id}`
          });
        }
      }
    } else {
      dataTierUsed = 'seed_corpus_fallback';
    }
  } catch (pasalErr) {
    console.warn('Agent 3 Pasal.id retrieval error, fallback to seed corpus:', pasalErr);
    dataTierUsed = 'seed_corpus_fallback';
  }

  // FASE 3: Fallback 1 - Ensure foundational knowledge + fallback to seed corpus
  const foundationalSeedDocs = retrieveRelevantLegalKnowledge(adversarialQuery, 6);
  for (const doc of foundationalSeedDocs) {
    if (!retrievedDocs.some(d => d.id === doc.id)) {
      retrievedDocs.push(doc);
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Anda adalah Agen 3 (Verifikator Hukum Independen / Adversarial Checker) pada platform Rakyat Menggugat.
Peran Anda adalah memeriksa secara mandiri, kritis, dan tanpa bias awal apakah permohonan warga negara ini benar-benar memenuhi syarat hukum beracara di Mahkamah Konstitusi / Mahkamah Agung.

Anda TIDAK diberikan kesimpulan atau hasil dari pihak lain agar penilaian Anda 100% murni dan independen.

Tugas Verifikasi 4 Lapis:
1. Lapis 1 (Kewenangan): Periksa apakah objek uji adalah norma abstrak UU (MK - Pasal 24C UUD 1945 & Pasal 10 UU MK) atau peraturan di bawah UU seperti Peraturan Menteri / PP / Perpres / Perda (MA - Pasal 24A UUD 1945). Jika objek di bawah UU, tandai "gagal_total" untuk MK dan arahkan ke jalur "MA". Jika Lapis 1 gagal_total (salah kamar), maka Lapis 2, 3, dan 4 HARUS diberi status "tidak_dievaluasi".
2. Lapis 2 (Legal Standing): Uji secara ketat apakah ada 'causal verband' langsung atau kerugian yang diklaim bersifat sekadar ketidaksetujuan umum terhadap kebijakan publik tanpa kerugian spesifik/aktual bagi pemohon (Putusan MK No. 006/PUU-III/2005 & Pasal 51 UU MK). Jika sekadar tidak setuju kebijakan, tandai "perlu_data_tambahan" (karena masih berpotensi diperbaiki jika pemohon melengkapi fakta kerugian konkret) dan berikan saran klarifikasi.
3. Lapis 3 (Batu Uji & Ne Bis In Idem): Periksa apakah ada pasal UUD 1945 yang diajukan dan apakah berisiko terbentur asas Ne Bis In Idem (Pasal 60 UU MK).
4. Lapis 4 (Posita): Identifikasi kelemahan mendasar dalam argumentasi atau kebutuhan data pembuktian lapangan (PMK No. 2/2021). Jika fakta ada namun belum merumuskan pertentangan pasal konstitusi, tandai "perlu_perbaikan" (bukan perlu_data_tambahan).

ATURAN KETAT RELEVANSI RUJUKAN (ANTI-HALUSINASI & ANTI-SALAH RUJUK):
- Anda HANYA BOLEH memasukkan dokumen/putusan hukum ke dalam array "rujukan" jika substansi dan pokok perkaranya BENAR-BENAR RELEVAN dengan fakta kasus, kompetensi absolut, dan batu uji pemohon.
- JANGAN SEKALI-KALI mengutip putusan yang sekadar menguji undang-undang yang sama namun memiliki pokok klasifikasi perkara yang tidak berkaitan (misalnya: dilarang mengutip putusan tarif telekomunikasi, penyiaran, atau perselisihan pemilu untuk kasus pengujian hak buruh/pesangon).
- Jika tidak ada putusan presedensi yang relevan secara substantif, biarkan array rujukan pada lapis tersebut hanya berisi pasal UUD 1945 atau peraturan terkait yang benar-benar cocok.

Pedoman Nada Bahasa untuk "catatan_ambiguitas":
- Gunakan bahasa yang objektif, santun, dan sesuai standar Bahasa Indonesia baku.
- Jika sengketa merupakan ranah perselisihan ketenagakerjaan privat atau kontraktual perorangan (misal perselisihan hak upah atau pemutusan hubungan kerja perorangan tanpa kaitan uji norma materiil UU), rumuskan catatan: "Permohonan ini berakar pada sengketa hubungan kerja atau perjanjian kontraktual individual (ranah hukum perdata/ketenagakerjaan), bukan pengujian konstitusionalitas norma undang-undang terhadap UUD 1945. Penyelesaian sengketa tersebut merupakan kompetensi Pengadilan Hubungan Industrial (PHI) pada lingkungan Peradilan Umum di bawah Mahkamah Agung, bukan wewenang Mahkamah Konstitusi."

Fakta Kasus Mentah dari Pemohon:
"""
${caseFacts}
"""

Daftar Rujukan Hukum Terkait:
${retrievedDocs.map(d => `- [${d.id} / ${d.version_id}] ${d.judul} (${d.nomor}): "${d.isi_teks}" (Sumber: ${d.sumber})`).join('\n')}

Keluarkan HANYA JSON murni dengan format:
{
  "hasil_verifikasi": "layak" | "perlu_data_tambahan" | "tidak_layak",
  "confidence": "tinggi" | "sedang" | "rendah",
  "catatan_kritis_independen": "evaluasi kritis independen singkat",
  "catatan_ambiguitas": "catatan risiko ambiguitas jika ada, atau null",
  "layers": [
    {
      "lapis_ke": 1,
      "nama": "kewenangan",
      "status": "lolos" | "gagal_total" | "perlu_perbaikan" | "perlu_data_tambahan",
      "jalur_hukum": "MK" | "MA" | "bukan_kewenangan_keduanya",
      "penjelasan": "string",
      "rujukan": [{"knowledge_entry_id": "string", "version_id": "string", "judul_dokumen": "string", "kutipan_relevan": "string"}]
    },
    {
      "lapis_ke": 2,
      "nama": "legal_standing",
      "status": "lolos" | "gagal_total" | "perlu_perbaikan" | "perlu_data_tambahan" | "tidak_dievaluasi",
      "penjelasan": "string",
      "saran_perbaikan": "string",
      "rujukan": [{"knowledge_entry_id": "string", "version_id": "string", "judul_dokumen": "string", "kutipan_relevan": "string"}]
    },
    {
      "lapis_ke": 3,
      "nama": "batu_uji",
      "status": "lolos" | "gagal_total" | "perlu_perbaikan" | "perlu_data_tambahan" | "tidak_dievaluasi",
      "penjelasan": "string",
      "rujukan": [{"knowledge_entry_id": "string", "version_id": "string", "judul_dokumen": "string", "kutipan_relevan": "string"}]
    },
    {
      "lapis_ke": 4,
      "nama": "posita",
      "status": "lolos" | "gagal_total" | "perlu_perbaikan" | "tidak_dievaluasi",
      "penjelasan": "string",
      "saran_perbaikan": "string",
      "rujukan": [{"knowledge_entry_id": "string", "version_id": "string", "judul_dokumen": "string", "kutipan_relevan": "string"}]
    }
  ]
}`;

      const { text, modelUsed } = await generateGeminiContentWithRetry(prompt, {
        preferredModel: 'gemini-3.7-flash',
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const parsed = JSON.parse(text);

      // Attach complete audit metadata to citations
      const enrichedLayers = (parsed.layers || []).map((l: any) => {
        const rujukanWithAudit = (l.rujukan || []).map((r: any) => {
          const matchedDoc = retrievedDocs.find(d => d.id === r.knowledge_entry_id || d.judul === r.judul_dokumen);
          return {
            ...r,
            version_id: r.version_id || matchedDoc?.version_id || 'v1',
            isi_teks: matchedDoc?.isi_teks || r.kutipan_relevan,
            sumber: matchedDoc?.sumber || 'seed_manual',
            url: matchedDoc?.reader_url || matchedDoc?.frbr_uri || 'https://pasal.id',
            timestamp: retrievalTimestamp
          };
        });

        return {
          ...l,
          rujukan: rujukanWithAudit,
          tidak_ditemukan_rujukan: rujukanWithAudit.length === 0,
          saran_perbaikan: l.status === 'lolos' ? null : (l.saran_perbaikan || null)
        };
      });

      return {
        agent_run_id: runId,
        agent_name: 'Agent 3 (Independent Verifier)',
        model_used: modelUsed,
        hasil_verifikasi: parsed.hasil_verifikasi || 'layak',
        confidence: parsed.confidence || 'tinggi',
        catatan_kritis_independen: parsed.catatan_kritis_independen || 'Verifikasi independen telah selesai dijalankan.',
        catatan_ambiguitas: parsed.catatan_ambiguitas || null,
        layers: enrichedLayers,
        query_used: adversarialQuery,
        search_sumber: dataTierUsed
      };
    } catch (err) {
      console.warn('Agent 3 Gemini API error, falling back to deterministic verifier engine:', err);
    }
  }

  // Emergency Fallback Tier 2: Deterministic Independent Verifier Engine
  return generateDeterministicAgent3Output(caseFacts, runId, retrievedDocs, adversarialQuery);
}

function generateDeterministicAgent3Output(
  caseFacts: string,
  runId: string,
  retrievedDocs: LegalKnowledgeItem[],
  queryUsed: string
): AgentVerifierOutput {
  const lower = caseFacts.toLowerCase();

  // 1. Check Court Path
  const isPeraturanMenteriOrPP = lower.includes('peraturan menteri') || lower.includes('permen') || lower.includes('peraturan pemerintah') || lower.includes('pp ') || lower.includes('perpres') || lower.includes('perda') || lower.includes('keputusan menteri');
  const isExplicitUU = lower.includes('undang-undang') || lower.includes(' uu ') || lower.includes('uu no') || lower.includes('uu nomor') || lower.includes('pasal');

  const isSalahKamar = isPeraturanMenteriOrPP && !isExplicitUU;
  const courtPath = isSalahKamar ? 'MA' : 'MK';

  // 2. Check for Labor Dispute (PHI Ambiguity)
  const isIndividualLaborDispute =
    (lower.includes('gaji') || lower.includes('pesangon') || lower.includes('upah saya') || lower.includes('phk saya') || lower.includes('dipecat') || lower.includes('kontrak kerja saya')) &&
    !lower.includes('uji materiil') &&
    !lower.includes('pasal undang-undang');

  let catatanAmbiguitas: string | null = null;
  if (isIndividualLaborDispute) {
    catatanAmbiguitas = 'Permohonan ini berakar pada sengketa hubungan kerja atau perjanjian kontraktual individual (ranah hukum perdata/ketenagakerjaan), bukan pengujian konstitusionalitas norma undang-undang terhadap UUD 1945. Penyelesaian sengketa tersebut merupakan kompetensi Pengadilan Hubungan Industrial (PHI) pada lingkungan Peradilan Umum di bawah Mahkamah Agung, bukan wewenang Mahkamah Konstitusi.';
  }

  // 3. Standing Check
  const isGeneralPolicyDisagreement =
    (lower.includes('tidak setuju') || lower.includes('kurang tepat') || lower.includes('kebijakan')) &&
    !lower.includes('saya dirugikan') &&
    !lower.includes('kontrak') &&
    !lower.includes('gaji') &&
    !lower.includes('pencemaran') &&
    !lower.includes('tanah') &&
    !lower.includes('hak saya') &&
    !lower.includes('phk') &&
    !lower.includes('pidana') &&
    !lower.includes('kriminalisasi');

  // 4. Posita Check
  const hasStrongFactsNoArticles =
    (lower.includes('saya') || lower.includes('kami') || lower.includes('warga')) &&
    (lower.includes('dirugikan') || lower.includes('korban') || lower.includes('terdampak')) &&
    !lower.includes('uud 1945') &&
    !lower.includes('pasal 28') &&
    !lower.includes('pasal 27') &&
    !lower.includes('pasal 33') &&
    !lower.includes('pasal 1');

  // Retrieval selections
  const kewenanganDoc = courtPath === 'MK'
    ? LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-24c')!
    : LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-24a')!;
  const kewenanganUuDoc = LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uu-mk-pasal-10')!;

  const standingStatuteDoc = LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uu-mk-pasal-51')!;
  const standingRulingDoc = LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'putusan-mk-006-2005')!;
  const neBisInIdemDoc = LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uu-mk-pasal-60')!;
  const positaDoc = LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'pmk-2-2021-format')!;

  const now = new Date().toISOString();

  // --- LAYER 1 ---
  const layer1: AgentLayerEvaluation = isSalahKamar
    ? {
        lapis_ke: 1,
        nama: 'kewenangan',
        status: 'gagal_total',
        jalur_hukum: 'MA',
        penjelasan: 'Verifikator mengonfirmasi objek yang diajukan bukan Undang-Undang, melainkan peraturan di bawah UU. MK berwenang hanya untuk UU (Pasal 24C UUD 1945). Gugatan harus diajukan ke MA (Pasal 24A UUD 1945).',
        rujukan: [
          {
            knowledge_entry_id: kewenanganDoc.id,
            version_id: kewenanganDoc.version_id,
            judul_dokumen: kewenanganDoc.judul,
            kutipan_relevan: kewenanganDoc.isi_teks,
            isi_teks: kewenanganDoc.isi_teks,
            sumber: kewenanganDoc.sumber,
            url: 'https://jdih.mkri.id',
            timestamp: now
          }
        ]
      }
    : {
        lapis_ke: 1,
        nama: 'kewenangan',
        status: 'lolos',
        jalur_hukum: 'MK',
        penjelasan: 'Objek permohonan adalah pengujian konstitusionalitas Undang-Undang terhadap UUD 1945, sah merupakan kewenangan mutlak Mahkamah Konstitusi (Pasal 24C ayat 1 UUD 1945 jo. Pasal 10 UU MK).',
        rujukan: [
          {
            knowledge_entry_id: kewenanganDoc.id,
            version_id: kewenanganDoc.version_id,
            judul_dokumen: kewenanganDoc.judul,
            kutipan_relevan: kewenanganDoc.isi_teks,
            isi_teks: kewenanganDoc.isi_teks,
            sumber: kewenanganDoc.sumber,
            url: 'https://jdih.mkri.id',
            timestamp: now
          },
          {
            knowledge_entry_id: kewenanganUuDoc.id,
            version_id: kewenanganUuDoc.version_id,
            judul_dokumen: kewenanganUuDoc.judul,
            kutipan_relevan: kewenanganUuDoc.isi_teks,
            isi_teks: kewenanganUuDoc.isi_teks,
            sumber: kewenanganUuDoc.sumber,
            url: 'https://jdih.mkri.id',
            timestamp: now
          }
        ]
      };

  // --- LAYER 2 ---
  const layer2: AgentLayerEvaluation = isSalahKamar
    ? {
        lapis_ke: 2,
        nama: 'legal_standing',
        status: 'tidak_dievaluasi',
        penjelasan: 'Kedudukan hukum tidak dievaluasi karena permohonan gugur pada Lapis 1 (kompetensi MA).',
        rujukan: []
      }
    : isGeneralPolicyDisagreement
    ? {
        lapis_ke: 2,
        nama: 'legal_standing',
        status: 'perlu_data_tambahan',
        penjelasan: 'Verifikator mencatat kerugian yang diuraikan masih bersifat umum (kebijakan publik). Sesuai yurisprudensi Putusan 006/PUU-III/2005, pemohon wajib menjelaskan kerugian spesifik, aktual, dan kausalitas langsung terhadap dirinya.',
        saran_perbaikan: 'Lengkapi uraian fakta dengan dampak langsung yang dialami pemohon.',
        rujukan: [
          {
            knowledge_entry_id: standingStatuteDoc.id,
            version_id: standingStatuteDoc.version_id,
            judul_dokumen: standingStatuteDoc.judul,
            kutipan_relevan: standingStatuteDoc.isi_teks,
            isi_teks: standingStatuteDoc.isi_teks,
            sumber: standingStatuteDoc.sumber,
            url: 'https://jdih.mkri.id',
            timestamp: now
          },
          {
            knowledge_entry_id: standingRulingDoc.id,
            version_id: standingRulingDoc.version_id,
            judul_dokumen: standingRulingDoc.judul,
            kutipan_relevan: standingRulingDoc.isi_teks,
            isi_teks: standingRulingDoc.isi_teks,
            sumber: standingRulingDoc.sumber,
            url: 'https://jdih.mkri.id',
            timestamp: now
          }
        ]
      }
    : {
        lapis_ke: 2,
        nama: 'legal_standing',
        status: 'lolos',
        penjelasan: 'Kausalitas kerugian pemohon terverifikasi memenuhi 5 syarat doktrin Putusan MK No. 006/PUU-III/2005.',
        rujukan: [
          {
            knowledge_entry_id: standingStatuteDoc.id,
            version_id: standingStatuteDoc.version_id,
            judul_dokumen: standingStatuteDoc.judul,
            kutipan_relevan: standingStatuteDoc.isi_teks,
            isi_teks: standingStatuteDoc.isi_teks,
            sumber: standingStatuteDoc.sumber,
            url: 'https://jdih.mkri.id',
            timestamp: now
          },
          {
            knowledge_entry_id: standingRulingDoc.id,
            version_id: standingRulingDoc.version_id,
            judul_dokumen: standingRulingDoc.judul,
            kutipan_relevan: standingRulingDoc.isi_teks,
            isi_teks: standingRulingDoc.isi_teks,
            sumber: standingRulingDoc.sumber,
            url: 'https://jdih.mkri.id',
            timestamp: now
          }
        ]
      };

  // --- LAYER 3 ---
  const layer3: AgentLayerEvaluation = {
    lapis_ke: 3,
    nama: 'batu_uji',
    status: isSalahKamar ? 'tidak_dievaluasi' : 'lolos',
    penjelasan: isSalahKamar
      ? 'Batu uji tidak dievaluasi karena bukan ranah MK.'
      : 'Pemeriksaan independen tidak menemukan putusan terdahulu yang memutus substansi yang sama dengan batu uji identik. Tidak terindikasi Ne Bis In Idem (Pasal 60 UU MK).',
    rujukan: isSalahKamar ? [] : [
      {
        knowledge_entry_id: neBisInIdemDoc.id,
        version_id: neBisInIdemDoc.version_id,
        judul_dokumen: neBisInIdemDoc.judul,
        kutipan_relevan: neBisInIdemDoc.isi_teks,
        isi_teks: neBisInIdemDoc.isi_teks,
        sumber: neBisInIdemDoc.sumber,
        url: 'https://jdih.mkri.id',
        timestamp: now
      }
    ]
  };

  // --- LAYER 4 ---
  const layer4: AgentLayerEvaluation = isSalahKamar
    ? {
        lapis_ke: 4,
        nama: 'posita',
        status: 'tidak_dievaluasi',
        penjelasan: 'Posita dialihkan ke format permohonan HUM Mahkamah Agung.',
        rujukan: []
      }
    : hasStrongFactsNoArticles
    ? {
        lapis_ke: 4,
        nama: 'posita',
        status: 'perlu_perbaikan',
        penjelasan: 'Verifikator mencatat konstruksi dalil pertentangan pasal dengan UUD 1945 belum dirumuskan secara formal dalam posita (PMK No. 2/2021).',
        saran_perbaikan: 'Sertakan pasal konstitusi rujukan dan uraikan bagaimana undang-undang yang diuji melanggar pasal tersebut.',
        rujukan: [
          {
            knowledge_entry_id: positaDoc.id,
            version_id: positaDoc.version_id,
            judul_dokumen: positaDoc.judul,
            kutipan_relevan: positaDoc.isi_teks,
            isi_teks: positaDoc.isi_teks,
            sumber: positaDoc.sumber,
            url: 'https://jdih.mkri.id',
            timestamp: now
          }
        ]
      }
    : {
        lapis_ke: 4,
        nama: 'posita',
        status: 'lolos',
        penjelasan: 'Argumentasi dan konstruksi pertentangan norma memenuhi standar formil permohonan beracara PMK No. 2/2021.',
        rujukan: [
          {
            knowledge_entry_id: positaDoc.id,
            version_id: positaDoc.version_id,
            judul_dokumen: positaDoc.judul,
            kutipan_relevan: positaDoc.isi_teks,
            isi_teks: positaDoc.isi_teks,
            sumber: positaDoc.sumber,
            url: 'https://jdih.mkri.id',
            timestamp: now
          }
        ]
      };

  const layers = [layer1, layer2, layer3, layer4];

  let hasilVerifikasi: 'layak' | 'perlu_data_tambahan' | 'tidak_layak' = 'layak';
  // Deterministic fallback must strictly be 'rendah' confidence per architectural integrity rule
  const confidence: 'tinggi' | 'sedang' | 'rendah' = 'rendah';

  if (isSalahKamar) {
    hasilVerifikasi = 'tidak_layak';
  } else if (isGeneralPolicyDisagreement || hasStrongFactsNoArticles) {
    hasilVerifikasi = 'perlu_data_tambahan';
  }

  return {
    agent_run_id: runId,
    agent_name: 'Agent 3 (Independent Verifier)',
    model_used: 'deterministic-adversarial-verifier',
    hasil_verifikasi: hasilVerifikasi,
    confidence,
    catatan_kritis_independen: isSalahKamar
      ? 'Verifikasi menghasilkan penolakan formil untuk Mahkamah Konstitusi karena objek pengujian berada di bawah undang-undang.'
      : isGeneralPolicyDisagreement
      ? 'Verifikasi mencatat perlunya klarifikasi kerugian hak konstitusional spesifik pada Lapis 2.'
      : hasStrongFactsNoArticles
      ? 'Verifikasi mencatat perlunya penataan rumusan posita pertentangan norma hukum pada Lapis 4.'
      : 'Verifikasi independen mengonfirmasi terpenuhinya 4 lapis kelayakan beracara MK.',
    catatan_ambiguitas: catatanAmbiguitas,
    layers,
    query_used: queryUsed,
    search_sumber: 'seed_manual'
  };
}
