/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Reconciliation Engine
 * Merges output from Agent 2 (Legal Analyst) and Agent 3 (Independent Verifier)
 * Applies strict, conservative rules per PRD Section 16 & Constitutional Law logic.
 */

import { AgentAnalysisOutput, AgentLayerEvaluation } from './agent2Analysis';
import { AgentVerifierOutput } from './agent3Verifier';

export interface ReconciledLayerAssessment extends AgentLayerEvaluation {
  status: 'lolos' | 'gagal_total' | 'perlu_perbaikan' | 'perlu_data_tambahan' | 'tidak_dievaluasi';
  catatan_rekonsiliasi?: string;
}

export interface ReconciledAssessmentResult {
  id: string;
  case_id: string;
  agent_analysis_run_id: string;
  agent_verifier_run_id: string;
  model_used_analysis?: string;
  model_used_verifier?: string;
  hasil_akhir: 'layak' | 'perlu_data_tambahan' | 'tidak_layak';
  confidence_level: 'tinggi' | 'sedang' | 'rendah';
  agent_agreement: boolean;
  status_tampil_ke_user: 'layak' | 'perlu_data_tambahan' | 'tidak_layak' | 'memerlukan_konsultasi_manusia';
  catatan_ketidaksesuaian: string | null;
  catatan_ambiguitas: string | null;
  layers: ReconciledLayerAssessment[];
  ringkasan_untuk_user: string;
  created_at: string;
}

export function reconcileAssessment(
  caseId: string,
  agent2: AgentAnalysisOutput,
  agent3: AgentVerifierOutput
): ReconciledAssessmentResult {
  const assessmentId = `recon-eval-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const reconciledLayers: ReconciledLayerAssessment[] = [];
  const discrepancies: string[] = [];
  let layerAgreementCount = 0;

  // Reconcile each of the 4 layers
  for (let lapis = 1; lapis <= 4; lapis++) {
    const l2 = agent2.layers.find(l => l.lapis_ke === lapis) || {
      lapis_ke: lapis,
      nama: lapis === 1 ? 'kewenangan' : lapis === 2 ? 'legal_standing' : lapis === 3 ? 'batu_uji' : 'posita',
      status: 'perlu_data_tambahan',
      penjelasan: 'Belum dievaluasi oleh Agen 2.',
      rujukan: []
    } as AgentLayerEvaluation;

    const l3 = agent3.layers.find(l => l.lapis_ke === lapis) || {
      lapis_ke: lapis,
      nama: lapis === 1 ? 'kewenangan' : lapis === 2 ? 'legal_standing' : lapis === 3 ? 'batu_uji' : 'posita',
      status: 'perlu_data_tambahan',
      penjelasan: 'Belum dievaluasi oleh Agen 3.',
      rujukan: []
    } as AgentLayerEvaluation;

    const statusMatch = l2.status === l3.status;
    const pathMatch = lapis === 1 ? (l2.jalur_hukum === l3.jalur_hukum) : true;

    if (statusMatch && pathMatch) {
      layerAgreementCount++;
      // Merge best citations
      const combinedRujukan = [...l2.rujukan];
      for (const r3 of l3.rujukan) {
        if (!combinedRujukan.some(r => r.knowledge_entry_id === r3.knowledge_entry_id)) {
          combinedRujukan.push(r3);
        }
      }

      const rawSaran = l2.saran_perbaikan || l3.saran_perbaikan;
      reconciledLayers.push({
        ...l2,
        penjelasan: l2.penjelasan + (l3.penjelasan !== l2.penjelasan ? ` [Catatan Verifikator: ${l3.penjelasan}]` : ''),
        rujukan: combinedRujukan,
        saran_perbaikan: l2.status === 'lolos' ? null : (rawSaran || null)
      });
    } else {
      // Discrepancy found between Agent 2 and Agent 3
      discrepancies.push(`Lapis ${lapis} (${l2.nama}): Agen 2 menilai "${l2.status}"${l2.jalur_hukum ? ' ['+l2.jalur_hukum+']' : ''}, sedangkan Agen 3 menilai "${l3.status}"${l3.jalur_hukum ? ' ['+l3.jalur_hukum+']' : ''}.`);

      // Determine conservative reconciled status
      let reconciledStatus = l2.status;
      if (l2.status === 'gagal_total' || l3.status === 'gagal_total') {
        reconciledStatus = 'gagal_total';
      } else if (l2.status === 'perlu_data_tambahan' || l3.status === 'perlu_data_tambahan') {
        reconciledStatus = 'perlu_data_tambahan';
      } else if (l2.status === 'perlu_perbaikan' || l3.status === 'perlu_perbaikan') {
        reconciledStatus = 'perlu_perbaikan';
      }

      const rawDiscrepancySaran = `Perbedaan pandangan teridentifikasi: ${l2.saran_perbaikan || ''} ${l3.saran_perbaikan || ''}`.trim();
      reconciledLayers.push({
        lapis_ke: lapis as 1 | 2 | 3 | 4,
        nama: l2.nama,
        status: reconciledStatus,
        jalur_hukum: l2.jalur_hukum || l3.jalur_hukum,
        penjelasan: `Hasil Analis: ${l2.penjelasan} | Hasil Verifikator: ${l3.penjelasan}`,
        rujukan: [...l2.rujukan, ...l3.rujukan],
        saran_perbaikan: reconciledStatus === 'lolos' ? null : (rawDiscrepancySaran || null)
      });
    }
  }

  // --- FINAL DEFENSIVE SANITIZATION PASS FOR RECONCILED LAYERS ---
  // Ensure that every layer with status 'lolos' has saran_perbaikan strictly set to null
  const sanitizedLayers = reconciledLayers.map(layer => ({
    ...layer,
    saran_perbaikan: layer.status === 'lolos' ? null : (layer.saran_perbaikan || null)
  }));

  const agentAgreement = layerAgreementCount === 4;

  // --- DETERMINISTIC CONFIDENCE CALCULATION (PRD Section 16) ---
  // Strictly takes the MORE CONSERVATIVE (LOWER) value between Agent 2 and Agent 3, NOT an average.
  const confidenceRank: Record<'rendah' | 'sedang' | 'tinggi', number> = {
    rendah: 1,
    sedang: 2,
    tinggi: 3,
  };

  const rankToConfidence: Record<number, 'rendah' | 'sedang' | 'tinggi'> = {
    1: 'rendah',
    2: 'sedang',
    3: 'tinggi',
  };

  const a2Rank = confidenceRank[agent2.confidence || 'sedang'] || 2;
  const a3Rank = confidenceRank[agent3.confidence || 'sedang'] || 2;

  // Step 1: Base confidence is the minimum (lower) of both agents
  const minAgentConfidenceScore = Math.min(a2Rank, a3Rank);
  let computedConfidenceRank = minAgentConfidenceScore;

  // Step 2: If there is any discrepancy or disagreement between agents, downgrade confidence
  if (!agentAgreement) {
    // If agents disagree on any layer, confidence cannot exceed 'sedang', and drops to 'rendah' if multiple discrepancies
    computedConfidenceRank = Math.min(computedConfidenceRank, discrepancies.length >= 2 ? 1 : 2);
  }

  // Determine overall result and final conservative confidence level
  let hasilAkhir: 'layak' | 'perlu_data_tambahan' | 'tidak_layak' = 'layak';
  let statusTampil: 'layak' | 'perlu_data_tambahan' | 'tidak_layak' | 'memerlukan_konsultasi_manusia' = 'layak';

  const isLapis1Gagal = reconciledLayers.some(l => l.lapis_ke === 1 && l.status === 'gagal_total');
  const isLapis3GagalTotal = reconciledLayers.some(l => l.lapis_ke === 3 && l.status === 'gagal_total');
  const hasPerluData = reconciledLayers.some(l => l.status === 'perlu_data_tambahan');
  const hasPerluPerbaikan = reconciledLayers.some(l => l.status === 'perlu_perbaikan');

  if (isLapis1Gagal) {
    // Permanently fatal for Constitutional Court jurisdiction (Salah Kamar)
    hasilAkhir = 'tidak_layak';
    statusTampil = 'tidak_layak';
  } else if (isLapis3GagalTotal) {
    // Permanently fatal for Constitutional Court jurisdiction (Ne Bis In Idem - Pasal 60 UU MK)
    hasilAkhir = 'tidak_layak';
    statusTampil = 'tidak_layak';
  } else if (hasPerluData || hasPerluPerbaikan) {
    // Remediable flaw (e.g. general standing or weak posita) -> keep hope open, request data
    hasilAkhir = 'perlu_data_tambahan';
    statusTampil = 'perlu_data_tambahan';
    computedConfidenceRank = Math.min(computedConfidenceRank, 2); // cap at sedang
  } else {
    hasilAkhir = 'layak';
    statusTampil = 'layak';
  }

  if (!agentAgreement && discrepancies.length >= 2) {
    computedConfidenceRank = 1;
    statusTampil = 'memerlukan_konsultasi_manusia';
  }

  const isDeterministicFallback = 
    agent2.model_used === 'deterministic-rules-engine' || 
    agent3.model_used === 'deterministic-adversarial-verifier' ||
    !agent2.model_used ||
    !agent3.model_used;

  // If deterministic engine is used without full AI reasoning, confidence is strictly forced to 'rendah' (rank 1)
  if (isDeterministicFallback) {
    computedConfidenceRank = 1;
  }

  const confidenceLevel = rankToConfidence[computedConfidenceRank] || 'sedang';

  const catatanKetidaksesuaian = discrepancies.length > 0 ? discrepancies.join('; ') : null;
  const catatanAmbiguitas = agent3.catatan_ambiguitas || null;

  // Build plain-language citizen summary
  const courtPath = reconciledLayers[0]?.jalur_hukum || 'MK';
  let summary = '';
  if (isLapis1Gagal) {
    summary = `Objek sengketa adalah Peraturan di bawah Undang-Undang. Mahkamah Konstitusi tidak berwenang mengadili perkara ini. Jalur pengujian hukum yang tepat adalah Hak Uji Materiil (HUM) ke Mahkamah Agung (Pasal 24A ayat 1 UUD 1945).`;
  } else if (hasilAkhir === 'layak') {
    if (agentAgreement) {
      summary = `Kedua agen independen (Analis Hukum & Verifikator) sepakat bahwa permohonan Anda berpotensi kuat memenuhi seluruh syarat formil untuk diajukan ke Mahkamah Konstitusi (MK). Kedudukan hukum dan batu uji konstitusional Anda telah teridentifikasi dengan jelas.`;
    } else {
      summary = `Permohonan Anda berpotensi layak diajukan ke MK, namun terdapat catatan dari Verifikator Independen pada salah satu lapis evaluasi yang disarankan untuk diperkuat sebelum persidangan pendahuluan.`;
    }
  } else if (hasilAkhir === 'perlu_data_tambahan') {
    summary = `Asesmen menunjukkan diperlukannya kelengkapan data atau uraian fakta kerugian konkret tambahan pada tahap intake agar permohonan Anda memenuhi 5 syarat kedudukan hukum dan posita beracara di Mahkamah Konstitusi.`;
  } else {
    summary = `Asesmen menunjukkan permohonan saat ini berisiko tidak memenuhi syarat kompetensi atau kedudukan hukum formil. Silakan tinjau kembali objek gugatan dan rujukan pasal perundang-undangan.`;
  }

  if (isDeterministicFallback) {
    summary += ' [Catatan Sistem: Asesmen ini dihitung menggunakan mesin aturan deterministik cadangan karena keterbatasan jaringan AI. Tingkat keyakinan ditandai "rendah" dan disarankan penelaahan manual.]';
  }

  return {
    id: assessmentId,
    case_id: caseId,
    agent_analysis_run_id: agent2.agent_run_id,
    agent_verifier_run_id: agent3.agent_run_id,
    model_used_analysis: agent2.model_used,
    model_used_verifier: agent3.model_used,
    hasil_akhir: hasilAkhir,
    confidence_level: confidenceLevel,
    agent_agreement: agentAgreement,
    status_tampil_ke_user: statusTampil,
    catatan_ketidaksesuaian: catatanKetidaksesuaian,
    catatan_ambiguitas: catatanAmbiguitas,
    layers: sanitizedLayers,
    ringkasan_untuk_user: summary,
    created_at: new Date().toISOString()
  };
}
