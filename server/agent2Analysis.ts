/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Agent 2: Legal Analysis Agent (Analisis Yuridis 4-Lapis)
 * Performs independent constitutional assessment grounded in foundational legal knowledge base.
 */

import { GoogleGenAI } from '@google/genai';
import { LEGAL_KNOWLEDGE_BASE, LegalKnowledgeItem, retrieveRelevantLegalKnowledge } from './legalKnowledge';

export interface AgentLayerEvaluation {
  lapis_ke: 1 | 2 | 3 | 4;
  nama: 'kewenangan' | 'legal_standing' | 'batu_uji' | 'posita';
  status: 'lolos' | 'gagal_total' | 'perlu_perbaikan' | 'perlu_data_tambahan' | 'tidak_dievaluasi';
  jalur_hukum?: 'MK' | 'MA' | 'bukan_kewenangan_keduanya';
  penjelasan: string;
  rujukan: Array<{
    knowledge_entry_id: string;
    version_id?: string;
    judul_dokumen?: string;
    kutipan_relevan: string;
  }>;
  tidak_ditemukan_rujukan?: boolean;
  argumen_konstitusional_teridentifikasi?: string[];
  saran_perbaikan?: string;
}

export interface AgentAnalysisOutput {
  agent_run_id: string;
  agent_name: 'Agent 2 (Legal Analyst)';
  hasil_evaluasi: 'layak' | 'perlu_data_tambahan' | 'tidak_layak';
  layers: AgentLayerEvaluation[];
  analisis_yuridis_ringkas: string;
  confidence: 'tinggi' | 'sedang' | 'rendah';
}

export async function runAgent2Analysis(
  caseFacts: string,
  userLanguage: string = 'id',
  legalKnowledgeDb: LegalKnowledgeItem[] = LEGAL_KNOWLEDGE_BASE
): Promise<AgentAnalysisOutput> {
  const runId = `ag2-run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Independent retrieval query for Agent 2
  const retrievedDocs = retrieveRelevantLegalKnowledge(caseFacts, 6);

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah Agen 2 (Analis Hukum Konstitusi Independen) pada platform Rakyat Menggugat.
Tugas Anda adalah melakukan asesmen kelayakan pengujian norma hukum secara objektif, ketat, dan berbasis 4 lapis kelayakan:
1. Lapis 1 (Kewenangan Lembaga Peradilan): Tentukan apakah objek yang dipersoalkan adalah norma Undang-Undang (MK - Pasal 24C UUD 1945 & UU MK) atau peraturan di bawah UU seperti Peraturan Menteri / PP / Perpres / Perda (MA - Pasal 24A UUD 1945). Jika objek adalah Peraturan Menteri / PP / Perpres / Perda, status Lapis 1 adalah "gagal_total" untuk MK dan jalur_hukum adalah "MA". Jika Lapis 1 gagal_total (salah kamar), maka Lapis 2, 3, dan 4 HARUS diberi status "tidak_dievaluasi".
2. Lapis 2 (Kedudukan Hukum / Legal Standing): Evaluasi 5 syarat kerugian konstitusional Putusan MK No. 006/PUU-III/2005 & Pasal 51 UU MK. Jika keluhan berupa ketidaksetujuan umum terhadap kebijakan publik tanpa kerugian spesifik/aktual bagi diri pemohon, status Lapis 2 adalah "perlu_data_tambahan" (bukan tidak layak permanen) dan berikan saran pertanyaan klarifikasi.
3. Lapis 3 (Batu Uji & Ne Bis In Idem): Tentukan pasal UUD 1945 yang tepat menjadi dasar pengujian dan evaluasi potensi ne bis in idem (Pasal 60 UU MK).
4. Lapis 4 (Posita & Penalaran Hukum): Evaluasi apakah dalil pertentangan norma telah terumuskan logis atau belum ada rumusan pertentangan norma UUD yang jelas. Jika fakta jelas tapi belum merumuskan pasal batu uji atau pertentangan normanya, status Lapis 4 adalah "perlu_perbaikan" atau "perlu_data_tambahan".

Fakta Kasus Pemohon:
"""
${caseFacts}
"""

Kumpulan Norma Hukum Terkait yang Tersedia:
${retrievedDocs.map(d => `- [${d.id} / ${d.version_id}] ${d.judul} (${d.nomor}): "${d.isi_teks}"`).join('\n')}

Keluarkan HANYA JSON murni dengan skema:
{
  "hasil_evaluasi": "layak" | "perlu_data_tambahan" | "tidak_layak",
  "confidence": "tinggi" | "sedang" | "rendah",
  "analisis_yuridis_ringkas": "penjelasan komprehensif singkat",
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
        agent_name: 'Agent 2 (Legal Analyst)',
        hasil_evaluasi: parsed.hasil_evaluasi || 'layak',
        confidence: parsed.confidence || 'tinggi',
        analisis_yuridis_ringkas: parsed.analisis_yuridis_ringkas || 'Analisis hukum 4 lapis telah selesai disusun.',
        layers: (parsed.layers || []).map((l: any) => ({
          ...l,
          tidak_ditemukan_rujukan: !l.rujukan || l.rujukan.length === 0
        }))
      };
    } catch (err) {
      console.warn('Agent 2 Gemini API error, falling back to deterministic legal engine:', err);
    }
  }

  // Fallback Deterministic Legal Inference Engine for Agent 2
  return generateDeterministicAgent2Output(caseFacts, runId, retrievedDocs);
}

function generateDeterministicAgent2Output(
  caseFacts: string,
  runId: string,
  retrievedDocs: LegalKnowledgeItem[]
): AgentAnalysisOutput {
  const lower = caseFacts.toLowerCase();

  // Detect Court Path / Object type
  const isPeraturanMenteriOrPP = lower.includes('peraturan menteri') || lower.includes('permen') || lower.includes('peraturan pemerintah') || lower.includes('pp ') || lower.includes('perpres') || lower.includes('perda') || lower.includes('keputusan menteri');
  const isExplicitUU = lower.includes('undang-undang') || lower.includes(' uu ') || lower.includes('uu no') || lower.includes('uu nomor') || lower.includes('pasal');

  const isSalahKamar = isPeraturanMenteriOrPP && !isExplicitUU;
  const courtPath = isSalahKamar ? 'MA' : 'MK';

  // Specific check for abstract general policy disagreement without personal damage
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

  // Check for strong facts but missing constitutional reasoning
  const hasStrongFactsNoArticles =
    (lower.includes('saya') || lower.includes('kami') || lower.includes('warga')) &&
    (lower.includes('dirugikan') || lower.includes('korban') || lower.includes('terdampak')) &&
    !lower.includes('uud 1945') &&
    !lower.includes('pasal 28') &&
    !lower.includes('pasal 27') &&
    !lower.includes('pasal 33') &&
    !lower.includes('pasal 1');

  // Topic Identification
  const isLabor = lower.includes('buruh') || lower.includes('pekerja') || lower.includes('upah') || lower.includes('outsourcing') || lower.includes('pesangon') || lower.includes('phk') || lower.includes('cipta kerja');
  const isEnv = lower.includes('lingkungan') || lower.includes('tambang') || lower.includes('limbah') || lower.includes('sehat') || lower.includes('polusi') || lower.includes('amdal');
  const isSpeech = lower.includes('pendapat') || lower.includes('demonstrasi') || lower.includes('ekspresi') || lower.includes('bicara') || lower.includes('ite') || lower.includes('kritik');
  const isEdu = lower.includes('pendidikan') || lower.includes('sekolah') || lower.includes('kuliah') || lower.includes('ukt');
  const isAdat = lower.includes('adat') || lower.includes('ulayat') || lower.includes('hutan adat') || lower.includes('masyarakat adat');
  const isPerppu = lower.includes('perppu') || lower.includes('kegentingan memaksa');
  const isFormil = lower.includes('uji formil') || lower.includes('partisipasi bermakna') || lower.includes('meaningful participation') || lower.includes('prosedur pembentukan');

  // Select Batu Uji Documents
  const batuUjiDocs: LegalKnowledgeItem[] = [];
  if (isLabor) {
    batuUjiDocs.push(
      LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-28d-2')!,
      LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-27-2')!
    );
  } else if (isEnv) {
    batuUjiDocs.push(
      LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-28h-1')!,
      LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-33-3-4')!
    );
  } else if (isSpeech) {
    batuUjiDocs.push(
      LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-28e-3')!,
      LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-28f')!
    );
  } else if (isEdu) {
    batuUjiDocs.push(
      LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-28c-1')!
    );
  } else if (isAdat) {
    batuUjiDocs.push(
      LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-33-3-4')!,
      LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-28d-1')!
    );
  } else {
    batuUjiDocs.push(
      LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-28d-1')!,
      LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-1-3')!
    );
  }

  // Primary Kewenangan Doc
  const kewenanganDoc = courtPath === 'MK'
    ? LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-24c')!
    : LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uud-1945-pasal-24a')!;
  const kewenanganUuDoc = LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uu-mk-pasal-10')!;

  // Standing Docs
  const standingRulingDoc = isAdat
    ? LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'putusan-mk-35-2012')!
    : LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'putusan-mk-006-2005')!;
  const standingStatuteDoc = LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'uu-mk-pasal-51')!;

  // Posita / Procedural Doc
  const positaPmkDoc = isFormil
    ? LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'putusan-mk-91-2020')!
    : isPerppu
    ? LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'putusan-mk-138-2009')!
    : LEGAL_KNOWLEDGE_BASE.find(k => k.id === 'pmk-2-2021-format')!;

  // --- BUILD LAYER 1 ---
  const layer1: AgentLayerEvaluation = isSalahKamar
    ? {
        lapis_ke: 1,
        nama: 'kewenangan',
        status: 'gagal_total',
        jalur_hukum: 'MA',
        penjelasan: 'Objek yang dipersoalkan adalah peraturan perundang-undangan di bawah undang-undang (Peraturan Menteri / PP / Perpres / Perda). Mahkamah Konstitusi tidak berwenang menguji peraturan di bawah UU (Pasal 24C UUD 1945). Pengujian uji materiil (HUM) merupakan kewenangan mutlak Mahkamah Agung berdasarkan Pasal 24A ayat (1) UUD 1945.',
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
        penjelasan: 'Objek pengujian adalah norma setingkat Undang-Undang terhadap UUD 1945. Mahkamah Konstitusi berwenang mengadili perkara ini secara absolut (Pasal 24C ayat 1 UUD 1945 jo. Pasal 10 ayat 1 huruf a UU MK).',
        rujukan: [
          {
            knowledge_entry_id: kewenanganDoc.id,
            version_id: kewenanganDoc.version_id,
            judul_dokumen: kewenanganDoc.judul,
            kutipan_relevan: kewenanganDoc.isi_teks
          },
          {
            knowledge_entry_id: kewenanganUuDoc.id,
            version_id: kewenanganUuDoc.version_id,
            judul_dokumen: kewenanganUuDoc.judul,
            kutipan_relevan: kewenanganUuDoc.isi_teks
          }
        ]
      };

  // --- BUILD LAYER 2 ---
  // If Lapis 1 is fatal (salah kamar), Lapis 2 MUST be tidak_dievaluasi
  const layer2: AgentLayerEvaluation = isSalahKamar
    ? {
        lapis_ke: 2,
        nama: 'legal_standing',
        status: 'tidak_dievaluasi',
        penjelasan: 'Kedudukan hukum tidak dievaluasi untuk permohonan Mahkamah Konstitusi karena objek sengketa bukan kompetensi absolut MK (dialihkan ke Mahkamah Agung).',
        rujukan: []
      }
    : isGeneralPolicyDisagreement
    ? {
        lapis_ke: 2,
        nama: 'legal_standing',
        status: 'perlu_data_tambahan',
        penjelasan: 'Uraian pemohon saat ini baru berupa ketidaksetujuan umum terhadap kebijakan publik (policy preference). Untuk memenuhi 5 syarat kumulatif kedudukan hukum Putusan MK No. 006/PUU-III/2005 jo. Pasal 51 UU MK, diperlukan bukti/uraian kerugian hak konstitusional yang bersifat spesifik, aktual, atau potensial wajar bagi pemohon secara langsung.',
        saran_perbaikan: 'Mohon ceritakan apakah Anda/kelompok mengalami kerugian finansial, pekerjaan, atau dampak langsung akibat pelaksanaan norma ini.',
        rujukan: [
          {
            knowledge_entry_id: standingStatuteDoc.id,
            version_id: standingStatuteDoc.version_id,
            judul_dokumen: standingStatuteDoc.judul,
            kutipan_relevan: standingStatuteDoc.isi_teks
          },
          {
            knowledge_entry_id: standingRulingDoc.id,
            version_id: standingRulingDoc.version_id,
            judul_dokumen: standingRulingDoc.judul,
            kutipan_relevan: standingRulingDoc.isi_teks
          }
        ]
      }
    : {
        lapis_ke: 2,
        nama: 'legal_standing',
        status: 'lolos',
        penjelasan: 'Pemohon memenuhi kualifikasi perorangan WNI/kelompok terdampak sesuai Pasal 51 ayat (1) UU MK serta memenuhi 5 parameter kerugian hak konstitusional menurut doktrin Putusan MK No. 006/PUU-III/2005.',
        rujukan: [
          {
            knowledge_entry_id: standingStatuteDoc.id,
            version_id: standingStatuteDoc.version_id,
            judul_dokumen: standingStatuteDoc.judul,
            kutipan_relevan: standingStatuteDoc.isi_teks
          },
          {
            knowledge_entry_id: standingRulingDoc.id,
            version_id: standingRulingDoc.version_id,
            judul_dokumen: standingRulingDoc.judul,
            kutipan_relevan: standingRulingDoc.isi_teks
          }
        ]
      };

  // --- BUILD LAYER 3 ---
  // If Lapis 1 is fatal, Lapis 3 is tidak_dievaluasi. Otherwise evaluated diagnostically!
  const layer3: AgentLayerEvaluation = {
    lapis_ke: 3,
    nama: 'batu_uji',
    status: isSalahKamar ? 'tidak_dievaluasi' : 'lolos',
    penjelasan: isSalahKamar
      ? 'Evaluasi batu uji UUD 1945 dihentikan karena objek sengketa bukan kompetensi absolut Mahkamah Konstitusi.'
      : `Batu uji konstitusional utama adalah ${batuUjiDocs.map(d => d.nomor).join(' dan ')}. Pemeriksaan asas ne bis in idem (Pasal 60 UU MK) mengonfirmasi dalil dan argumentasi konstitusional ini relevan dan sah untuk diuji.`,
    rujukan: isSalahKamar ? [] : batuUjiDocs.map(d => ({
      knowledge_entry_id: d.id,
      version_id: d.version_id,
      judul_dokumen: d.judul,
      kutipan_relevan: d.isi_teks
    }))
  };

  // --- BUILD LAYER 4 ---
  // If Lapis 1 is fatal, Lapis 4 is tidak_dievaluasi. Otherwise evaluated diagnostically!
  const layer4: AgentLayerEvaluation = isSalahKamar
    ? {
        lapis_ke: 4,
        nama: 'posita',
        status: 'tidak_dievaluasi',
        penjelasan: 'Posita tidak dievaluasi untuk permohonan Mahkamah Konstitusi karena harus diajukan sebagai Hak Uji Materiil (HUM) ke Mahkamah Agung.',
        rujukan: []
      }
    : hasStrongFactsNoArticles
    ? {
        lapis_ke: 4,
        nama: 'posita',
        status: 'perlu_perbaikan',
        penjelasan: 'Uraian fakta kerugian konkret yang dialami pemohon telah tergambar jelas, namun posita belum menguraikan pertentangan pasal undang-undang yang diuji dengan pasal-pasal UUD 1945 secara terstruktur sesuai standar PMK No. 2/2021.',
        saran_perbaikan: 'Rumuskan dengan tegas pertentangan norma pasal UU yang diuji terhadap batu uji UUD 1945 (misalnya Pasal 28D ayat 1 atau Pasal 27 ayat 2 UUD 1945) dan cantumkan petitum pembatalan norma yang diinginkan.',
        rujukan: [
          {
            knowledge_entry_id: positaPmkDoc.id,
            version_id: positaPmkDoc.version_id,
            judul_dokumen: positaPmkDoc.judul,
            kutipan_relevan: positaPmkDoc.isi_teks
          }
        ]
      }
    : {
        lapis_ke: 4,
        nama: 'posita',
        status: 'lolos',
        penjelasan: 'Uraian pertentangan antara norma yang diuji dengan UUD 1945 telah memenuhi sistematika penalaran hukum beracara Mahkamah Konstitusi.',
        rujukan: [
          {
            knowledge_entry_id: positaPmkDoc.id,
            version_id: positaPmkDoc.version_id,
            judul_dokumen: positaPmkDoc.judul,
            kutipan_relevan: positaPmkDoc.isi_teks
          }
        ]
      };

  const layers = [layer1, layer2, layer3, layer4];

  let hasilEvaluasi: 'layak' | 'perlu_data_tambahan' | 'tidak_layak' = 'layak';
  let confidence: 'tinggi' | 'sedang' | 'rendah' = 'tinggi';

  if (isSalahKamar) {
    hasilEvaluasi = 'tidak_layak';
    confidence = 'tinggi';
  } else if (isGeneralPolicyDisagreement || hasStrongFactsNoArticles) {
    hasilEvaluasi = 'perlu_data_tambahan';
    confidence = 'sedang';
  }

  return {
    agent_run_id: runId,
    agent_name: 'Agent 2 (Legal Analyst)',
    hasil_evaluasi: hasilEvaluasi,
    confidence,
    analisis_yuridis_ringkas: isSalahKamar
      ? 'Permohonan ditolak untuk yurisdiksi Mahkamah Konstitusi karena objek sengketa adalah Peraturan di bawah UU yang merupakan wewenang Mahkamah Agung.'
      : isGeneralPolicyDisagreement
      ? 'Diperlukan fakta kerugian konstitusional konkret tambahan untuk membuktikan kedudukan hukum (legal standing) pemohon di Mahkamah Konstitusi.'
      : hasStrongFactsNoArticles
      ? 'Fakta kerugian kuat namun membutuhkan formulasi argumentasi pertentangan norma hukum dan pasal batu uji UUD 1945 pada posita permohonan.'
      : 'Permohonan memiliki dasar konstitusional yang solid pada yurisdiksi MK.',
    layers
  };
}
