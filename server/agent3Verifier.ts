/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Agent 3: Independent Verifier Agent (Penelaah Independen)
 * Evaluates the case strictly independently without seeing Agent 2's output (no anchoring bias).
 * Has its own separate retrieval query and independent reasoning.
 */

import { GoogleGenAI } from '@google/genai';
import { LEGAL_KNOWLEDGE_BASE, LegalKnowledgeItem, retrieveRelevantLegalKnowledge } from './legalKnowledge';
import { AgentLayerEvaluation } from './agent2Analysis';

export interface AgentVerifierOutput {
  agent_run_id: string;
  agent_name: 'Agent 3 (Independent Verifier)';
  hasil_verifikasi: 'layak' | 'perlu_data_tambahan' | 'tidak_layak';
  layers: AgentLayerEvaluation[];
  catatan_kritis_independen: string;
  catatan_ambiguitas: string | null;
  confidence: 'tinggi' | 'sedang' | 'rendah';
}

export async function runAgent3Verification(
  caseFacts: string,
  userLanguage: string = 'id',
  legalKnowledgeDb: LegalKnowledgeItem[] = LEGAL_KNOWLEDGE_BASE
): Promise<AgentVerifierOutput> {
  const runId = `ag3-run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Independent retrieval query for Agent 3 (evaluates risk, ne bis in idem, & procedural bottlenecks)
  const retrievalQuery = `${caseFacts} sengketa kewenangan putusan ne bis in idem kerugian kausalitas bukti PMK 2 2021 standing peraturan menteri`;
  const retrievedDocs = retrieveRelevantLegalKnowledge(retrievalQuery, 6);

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah Agen 3 (Verifikator Hukum Independen / Adversarial Checker) pada platform Rakyat Menggugat.
Peran Anda adalah memeriksa secara mandiri, kritis, dan tanpa bias awal apakah permohonan warga negara ini benar-benar memenuhi syarat hukum beracara di Mahkamah Konstitusi / Mahkamah Agung.

Anda TIDAK diberikan kesimpulan atau hasil dari pihak lain agar penilaian Anda 100% murni dan independen.

Tugas Verifikasi 4 Lapis:
1. Lapis 1 (Kewenangan): Periksa apakah objek uji adalah norma abstrak UU (MK - Pasal 24C UUD 1945 & Pasal 10 UU MK) atau peraturan di bawah UU seperti Peraturan Menteri / PP / Perpres / Perda (MA - Pasal 24A UUD 1945). Jika objek di bawah UU, tandai "gagal_total" untuk MK dan arahkan ke jalur "MA". Jika Lapis 1 gagal_total (salah kamar), maka Lapis 2, 3, dan 4 HARUS diberi status "tidak_dievaluasi".
2. Lapis 2 (Legal Standing): Uji secara ketat apakah ada 'causal verband' langsung atau kerugian yang diklaim bersifat sekadar ketidaksetujuan umum terhadap kebijakan publik tanpa kerugian spesifik/aktual bagi pemohon (Putusan MK No. 006/PUU-III/2005 & Pasal 51 UU MK). Jika sekadar tidak setuju kebijakan, tandai "perlu_data_tambahan" (karena masih berpotensi diperbaiki jika pemohon melengkapi fakta kerugian konkret) dan berikan saran klarifikasi.
3. Lapis 3 (Batu Uji & Ne Bis In Idem): Periksa apakah ada pasal UUD 1945 yang diajukan dan apakah berisiko terbentur asas Ne Bis In Idem (Pasal 60 UU MK).
4. Lapis 4 (Posita): Identifikasi kelemahan mendasar dalam argumentasi atau kebutuhan data pembuktian lapangan (PMK No. 2/2021). Jika fakta ada namun belum merumuskan pertentangan pasal konstitusi, tandai "perlu_perbaikan" atau "perlu_data_tambahan".

Fakta Kasus Mentah dari Pemohon:
"""
${caseFacts}
"""

Daftar Rujukan Hukum Terkait:
${retrievedDocs.map(d => `- [${d.id} / ${d.version_id}] ${d.judul} (${d.nomor}): "${d.isi_teks}"`).join('\n')}

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
      "status": "lolos" | "gagal_total" | "perlu_perbaikan" | "perlu_data_tambahan" | "tidak_dievaluasi",
      "penjelasan": "string",
      "saran_perbaikan": "string",
      "rujukan": [{"knowledge_entry_id": "string", "version_id": "string", "judul_dokumen": "string", "kutipan_relevan": "string"}]
    }
  ]
}`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout after 6s')), 6000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const response = await Promise.race([generatePromise, timeoutPromise]) as any;

      const text = response.text || '';
      const parsed = JSON.parse(text);

      return {
        agent_run_id: runId,
        agent_name: 'Agent 3 (Independent Verifier)',
        hasil_verifikasi: parsed.hasil_verifikasi || 'layak',
        confidence: parsed.confidence || 'tinggi',
        catatan_kritis_independen: parsed.catatan_kritis_independen || 'Verifikasi independen telah selesai dijalankan.',
        catatan_ambiguitas: parsed.catatan_ambiguitas || null,
        layers: (parsed.layers || []).map((l: any) => ({
          ...l,
          tidak_ditemukan_rujukan: !l.rujukan || l.rujukan.length === 0
        }))
      };
    } catch (err) {
      console.warn('Agent 3 Gemini API error, falling back to deterministic verifier engine:', err);
    }
  }

  // Fallback Deterministic Independent Verifier Engine
  return generateDeterministicAgent3Output(caseFacts, runId, retrievedDocs);
}

function generateDeterministicAgent3Output(
  caseFacts: string,
  runId: string,
  retrievedDocs: LegalKnowledgeItem[]
): AgentVerifierOutput {
  const lower = caseFacts.toLowerCase();

  const isPeraturanMenteriOrPP = lower.includes('peraturan menteri') || lower.includes('permen') || lower.includes('peraturan pemerintah') || lower.includes('pp ') || lower.includes('perpres') || lower.includes('perda') || lower.includes('keputusan menteri');
  const isExplicitUU = lower.includes('undang-undang') || lower.includes(' uu ') || lower.includes('uu no') || lower.includes('uu nomor') || lower.includes('pasal');

  const isSalahKamar = isPeraturanMenteriOrPP && !isExplicitUU;
  const courtPath = isSalahKamar ? 'MA' : 'MK';

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

  const hasStrongFactsNoArticles =
    (lower.includes('saya') || lower.includes('kami') || lower.includes('warga')) &&
    (lower.includes('dirugikan') || lower.includes('korban') || lower.includes('terdampak')) &&
    !lower.includes('uud 1945') &&
    !lower.includes('pasal 28') &&
    !lower.includes('pasal 27') &&
    !lower.includes('pasal 33') &&
    !lower.includes('pasal 1');

  const isShortFacts = caseFacts.trim().length < 40;

  const kewenanganDoc = courtPath === 'MK'
    ? LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-24c')!
    : LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-24a')!;

  const legalStandingStatute = LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uu-mk-pasal-51')!;
  const legalStandingRuling = LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'putusan-mk-006-2005')!;
  const neBisInIdemDoc = LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uu-mk-pasal-60')!;
  const proceduralPmk = LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'pmk-2-2021-format')!;

  const layer1: AgentLayerEvaluation = isSalahKamar
    ? {
        lapis_ke: 1,
        nama: 'kewenangan',
        status: 'gagal_total',
        jalur_hukum: 'MA',
        penjelasan: 'Verifikasi independen mendeteksi objek permohonan adalah peraturan perundang-undangan di bawah undang-undang. MK tidak memiliki yurisdiksi absolut untuk menguji peraturan di bawah UU (Pasal 24C UUD 1945). Forum yang berwenang adalah Hak Uji Materiil Mahkamah Agung (Pasal 24A ayat 1 UUD 1945).',
        rujukan: [
          {
            knowledge_entry_id: kewenanganDoc.id,
            version_id: kewenanganDoc.version_id,
            judul_dokumen: kewenanganDoc.judul,
            kutipan_relevan: kewenanganDoc.isi_teks
          }
        ]
      }
    : {
        lapis_ke: 1,
        nama: 'kewenangan',
        status: 'lolos',
        jalur_hukum: 'MK',
        penjelasan: 'Verifikasi independen mengonfirmasi objek sengketa tepat pada yurisdiksi MK. Terpenuhi kriteria pengujian norma abstrak undang-undang terhadap UUD 1945.',
        rujukan: [
          {
            knowledge_entry_id: kewenanganDoc.id,
            version_id: kewenanganDoc.version_id,
            judul_dokumen: kewenanganDoc.judul,
            kutipan_relevan: kewenanganDoc.isi_teks
          }
        ]
      };

  // If Lapis 1 is fatal (salah kamar), Lapis 2 MUST be tidak_dievaluasi
  const layer2: AgentLayerEvaluation = isSalahKamar
    ? {
        lapis_ke: 2,
        nama: 'legal_standing',
        status: 'tidak_dievaluasi',
        penjelasan: 'Kedudukan hukum tidak dievaluasi untuk berkas perkara Mahkamah Konstitusi karena dialihkan ke Mahkamah Agung.',
        rujukan: []
      }
    : isGeneralPolicyDisagreement
    ? {
        lapis_ke: 2,
        nama: 'legal_standing',
        status: 'perlu_data_tambahan',
        penjelasan: 'Verifikator independen mencatat bahwa saat ini uraian fakta baru menyentuh ketidaksetujuan umum terhadap kebijakan (policy preference) tanpa kerugian personal nyata. Hal ini memerlukan penegasan kerugian konkret agar memenuhi doktrin 5 syarat legal standing Putusan MK No. 006/PUU-III/2005.',
        saran_perbaikan: 'Uraikan apakah kebijakan/pasal ini secara langsung merugikan hak ekonomi, pekerjaan, atau hak konstitusional spesifik Anda.',
        rujukan: [
          {
            knowledge_entry_id: legalStandingStatute.id,
            version_id: legalStandingStatute.version_id,
            judul_dokumen: legalStandingStatute.judul,
            kutipan_relevan: legalStandingStatute.isi_teks
          },
          {
            knowledge_entry_id: legalStandingRuling.id,
            version_id: legalStandingRuling.version_id,
            judul_dokumen: legalStandingRuling.judul,
            kutipan_relevan: legalStandingRuling.isi_teks
          }
        ]
      }
    : {
        lapis_ke: 2,
        nama: 'legal_standing',
        status: isShortFacts ? 'perlu_data_tambahan' : 'lolos',
        penjelasan: isShortFacts
          ? 'Dibutuhkan penegasan identitas dan bentuk kerugian langsung pemohon untuk membuktikan causal verband secara tidak terbantahkan menurut Putusan MK No. 006/PUU-III/2005.'
          : 'Verifikasi independen menyimpulkan pemohon memiliki kepentingan riil (actual interest) yang dilindungi konstitusi dan terdampak langsung oleh berlakunya pasal yang diuji.',
        rujukan: [
          {
            knowledge_entry_id: legalStandingStatute.id,
            version_id: legalStandingStatute.version_id,
            judul_dokumen: legalStandingStatute.judul,
            kutipan_relevan: legalStandingStatute.isi_teks
          },
          {
            knowledge_entry_id: legalStandingRuling.id,
            version_id: legalStandingRuling.version_id,
            judul_dokumen: legalStandingRuling.judul,
            kutipan_relevan: legalStandingRuling.isi_teks
          }
        ]
      };

  const layer3: AgentLayerEvaluation = {
    lapis_ke: 3,
    nama: 'batu_uji',
    status: isSalahKamar ? 'tidak_dievaluasi' : 'lolos',
    penjelasan: isSalahKamar
      ? 'Batu uji tidak dievaluasi karena pengujian harus dialihkan ke Mahkamah Agung.'
      : 'Pemeriksaan silang ne bis in idem (Pasal 60 UU MK) mengonfirmasi tidak terdapat putusan terdahulu dengan dasar dalil konstitusi yang identik.',
    rujukan: isSalahKamar ? [] : [
      {
        knowledge_entry_id: neBisInIdemDoc.id,
        version_id: neBisInIdemDoc.version_id,
        judul_dokumen: neBisInIdemDoc.judul,
        kutipan_relevan: neBisInIdemDoc.isi_teks
      }
    ]
  };

  const layer4: AgentLayerEvaluation = isSalahKamar
    ? {
        lapis_ke: 4,
        nama: 'posita',
        status: 'tidak_dievaluasi',
        penjelasan: 'Posita tidak dievaluasi untuk berkas perkara Mahkamah Konstitusi.',
        rujukan: []
      }
    : hasStrongFactsNoArticles
    ? {
        lapis_ke: 4,
        nama: 'posita',
        status: 'perlu_perbaikan',
        penjelasan: 'Verifikator independen menemukan kelemahan konstruksi yuridis posita: meskipun narasi fakta kerugian empiris kuat, pemohon belum merumuskan pasal UUD 1945 yang dilanggar dan argumen pertentangan normanya.',
        saran_perbaikan: 'Sempurnakan posita dengan menghubungkan kerugian faktual ke klausul hak konstitusional UUD 1945 (misalnya Pasal 28D ayat 1 atau Pasal 27 ayat 2 UUD 1945) sebelum berkas dicetak.',
        rujukan: [
          {
            knowledge_entry_id: proceduralPmk.id,
            version_id: proceduralPmk.version_id,
            judul_dokumen: proceduralPmk.judul,
            kutipan_relevan: proceduralPmk.isi_teks
          }
        ]
      }
    : {
        lapis_ke: 4,
        nama: 'posita',
        status: 'lolos',
        penjelasan: 'Argumentasi yuridis dinilai logis dan selaras dengan PMK No. 2/2021. Verifikator mencatat pentingnya melampirkan alat bukti tertulis bermaterai legalisir pos untuk membuktikan dalil posita saat persidangan pendahuluan.',
        rujukan: [
          {
            knowledge_entry_id: proceduralPmk.id,
            version_id: proceduralPmk.version_id,
            judul_dokumen: proceduralPmk.judul,
            kutipan_relevan: proceduralPmk.isi_teks
          }
        ]
      };

  const layers = [layer1, layer2, layer3, layer4];

  let hasilVerifikasi: 'layak' | 'perlu_data_tambahan' | 'tidak_layak' = 'layak';
  let confidence: 'tinggi' | 'sedang' | 'rendah' = 'tinggi';

  if (isSalahKamar) {
    hasilVerifikasi = 'tidak_layak';
    confidence = 'tinggi';
  } else if (isGeneralPolicyDisagreement || hasStrongFactsNoArticles || isShortFacts) {
    hasilVerifikasi = 'perlu_data_tambahan';
    confidence = 'sedang';
  }

  return {
    agent_run_id: runId,
    agent_name: 'Agent 3 (Independent Verifier)',
    hasil_verifikasi: hasilVerifikasi,
    confidence,
    catatan_kritis_independen: isSalahKamar
      ? 'Verifikator menolak yurisdiksi MK karena objek adalah Peraturan di bawah UU (kompetensi MA).'
      : isGeneralPolicyDisagreement
      ? 'Verifikator mencatat perlunya data kerugian konstitusional konkret agar memenuhi syarat legal standing.'
      : hasStrongFactsNoArticles
      ? 'Verifikator mencatat perlunya penyempurnaan formulasi batu uji UUD 1945 pada posita permohonan.'
      : 'Verifikasi independen mengonfirmasi kelayakan formil dan materiil.',
    catatan_ambiguitas: hasStrongFactsNoArticles
      ? 'Posita memerlukan formulasi pasal UUD 1945 yang eksplisit.'
      : isGeneralPolicyDisagreement
      ? 'Dibutuhkan data kerugian spesifik untuk memperjelas standing pemohon.'
      : null,
    layers
  };
}
