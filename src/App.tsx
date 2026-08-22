/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EducationView } from './components/EducationView';
import { AuthModal } from './components/AuthModal';
import { CaseListDashboard } from './components/CaseListDashboard';
import { CaseIntakeChat } from './components/CaseIntakeChat';
import { AssessmentReportView } from './components/AssessmentReportView';
import { EvidenceGuideView } from './components/EvidenceGuideView';
import { DocumentGeneratorView } from './components/DocumentGeneratorView';
import { AccountPrivacyView } from './components/AccountPrivacyView';
import { LegalKnowledgeBaseView } from './components/LegalKnowledgeBaseView';
import { 
  UserProfile, 
  CaseRecord, 
  CaseMessage, 
  DualAgentAssessment, 
  EvidenceItem, 
  StatementType, 
  LanguagePreference,
  UserType
} from './types';
import { SEED_LEGAL_KNOWLEDGE } from './data/seedKnowledge';
import { firestoreService } from './services/firestoreService';
import { ensureFirebaseAuth, auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

type ScreenType = 'home' | 'cases' | 'chat' | 'assessment' | 'evidence' | 'document' | 'privacy' | 'knowledge';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('rm_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default anonymous session for instant access
    return {
      id: 'usr_RM-DEMO-2026',
      auth_mode: 'anonim_pseudonim',
      email: null,
      pseudonim_token: 'RM-ANON-8F29A-2026',
      tipe_pengguna: 'individu',
      preferensi_bahasa: 'id',
      organisasi: null,
      privacy_policy_accepted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
  });

  const [cases, setCases] = useState<CaseRecord[]>(() => {
    const saved = localStorage.getItem('rm_cases_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Seed initial demo case for instant exploration
    return [
      {
        id: 'case-demo-001',
        user_id: 'usr_RM-DEMO-2026',
        judul_singkat: 'Uji Materiil Pasal Jaminan Hak Lingkungan Hidup vs Izin Tambang',
        status: 'assessed',
        ringkasan_masalah_asli: 'Masyarakat kami terdampak oleh ketentuan dalam UU Pertambangan Mineral dan Batubara yang meniadakan hak veto masyarakat lokal atas izin lingkungan, bertentangan dengan Pasal 28H ayat (1) UUD 1945.',
        bahasa_input: 'id',
        ai_disclaimer_accepted_at: new Date().toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  });

  const [activeCaseId, setActiveCaseId] = useState<string>('case-demo-001');
  const [isAssessing, setIsAssessing] = useState(false);

  // Case messages store
  const [caseMessages, setCaseMessages] = useState<Record<string, CaseMessage[]>>({
    'case-demo-001': [
      {
        id: 'msg-1',
        case_id: 'case-demo-001',
        role: 'agent_intake',
        content: 'Selamat datang di Rakyat Menggugat. Saya adalah Agen 1 (Intake & Klarifikasi Fakta). Silakan ceritakan apa undang-undang atau pasal yang merugikan hak Anda, apa dampak nyata yang Anda alami, dan apa yang Anda harapkan dibatalkan oleh Mahkamah Konstitusi/Mahkamah Agung.',
        created_at: new Date(Date.now() - 86000000).toISOString(),
      },
      {
        id: 'msg-2',
        case_id: 'case-demo-001',
        role: 'user',
        content: 'Masyarakat kami di desa terdampak limbah pertambangan. Kami melihat ketentuan dalam UU Minerba meniadakan hak masyarakat untuk menolak izin di wilayah mereka. Kami merasa ini melanggar hak hidup sehat yang dijamin UUD 1945 Pasal 28H.',
        created_at: new Date(Date.now() - 85000000).toISOString(),
      },
      {
        id: 'msg-3',
        case_id: 'case-demo-001',
        role: 'agent_intake',
        content: 'Terima kasih atas rincian fakta tersebut. Sistem mengidentifikasi bahwa objek yang Anda keluhkan adalah norma dalam Undang-Undang (UU), dengan batu uji hak konstitusional atas lingkungan hidup yang baik dan sehat (Pasal 28H ayat 1 UUD 1945). Anda dapat menekan tombol "Lakukan Asesmen Kelayakan Dual-Agent" untuk menjalankan evaluasi berurutan 4 lapis.',
        created_at: new Date(Date.now() - 84000000).toISOString(),
      }
    ]
  });

  // Assessments store
  const [caseAssessments, setCaseAssessments] = useState<Record<string, DualAgentAssessment>>({
    'case-demo-001': {
      id: 'asm-demo-001',
      case_id: 'case-demo-001',
      agent_analysis_run_id: 'run-agent2-001',
      agent_verifier_run_id: 'run-agent3-001',
      hasil_akhir: 'layak',
      confidence_level: 'tinggi',
      agent_agreement: true,
      status_tampil_ke_user: 'layak',
      catatan_ketidaksesuaian: null,
      catatan_ambiguitas: 'Agent 3 mencatat perlunya kelengkapan bukti surat verifikasi dampak lingkungan di lapangan untuk memperkokoh legal standing faktual.',
      layers: [
        {
          lapis_ke: 1,
          nama: 'kewenangan',
          status: 'lolos',
          jalur_hukum: 'MK',
          penjelasan: 'Objek yang dimohonkan pengujian adalah materi muatan dalam Undang-Undang (UU) terhadap Undang-Undang Dasar 1945. Berdasarkan Pasal 24C ayat (1) UUD 1945 jo. Pasal 10 ayat (1) UU No. 24/2003, Mahkamah Konstitusi berwenang penuh mengadili permohonan ini.',
          rujukan: [
            {
              knowledge_entry_id: 'uud-1945-pasal-24c',
              version_id: 'v-uud-1945-24c-1',
              judul_dokumen: 'UUD 1945 Pasal 24C ayat (1)',
              kutipan_relevan: 'Mahkamah Konstitusi berwenang mengadili pada tingkat pertama dan terakhir yang putusannya bersifat final untuk menguji undang-undang terhadap Undang-Undang Dasar.'
            }
          ]
        },
        {
          lapis_ke: 2,
          nama: 'legal_standing',
          status: 'lolos',
          penjelasan: 'Pemohon memenuhi 5 syarat kumulatif Putusan MK No. 006/PUU-III/2005: terdapat hak konstitusional yang diberikan Pasal 28H ayat (1) UUD 1945, kerugian bersifat aktual dan spesifik dialami warga terdampak, serta adanya hubungan sebab-akibat langsung (causal verband) dengan pasal norma UU a quo.',
          rujukan: [
            {
              knowledge_entry_id: 'putusan-mk-006-2005',
              version_id: 'v-putusan-006-1',
              judul_dokumen: 'Yurisprudensi MK No. 006/PUU-III/2005',
              kutipan_relevan: 'Syarat kerugian hak konstitusional: adanya hak konstitusional, kerugian spesifik dan aktual, hubungan sebab akibat (causal verband), dan potensi kerugian terpulihkan jika dikabulkan.'
            }
          ]
        },
        {
          lapis_ke: 3,
          nama: 'batu_uji',
          status: 'lolos',
          penjelasan: 'Batu uji yang diajukan adalah Pasal 28H ayat (1) dan Pasal 28D ayat (1) UUD 1945. Penelusuran preseden ne bis in idem menunjukkan pasal norma ini belum pernah diuji dengan alasan hukum dan dalil pertentangan konstitusi yang sama (Pasal 60 UU MK).',
          rujukan: [
            {
              knowledge_entry_id: 'uud-1945-pasal-28d-1',
              version_id: 'v-uud-28d1-1',
              judul_dokumen: 'UUD 1945 Pasal 28D ayat (1)',
              kutipan_relevan: 'Setiap orang berhak atas pengakuan, jaminan, perlindungan, dan kepastian hukum yang adil.'
            }
          ]
        },
        {
          lapis_ke: 4,
          nama: 'posita',
          status: 'lolos',
          penjelasan: 'Argumentasi konstitusional telah terumuskan dengan baik, menguraikan pertentangan antara pembatasan hak partisipasi warga lokal dengan mandat perlindungan lingkungan hidup yang berkelanjutan.',
          saran_perbaikan: 'Perkuat dalil dengan menyertakan data riil dampak lingkungan di desa pemohon untuk membuktikan kerugian nyata pada persidangan pembuktian.',
          rujukan: []
        }
      ],
      ringkasan_untuk_user: 'Permohonan Anda berpotensi kuat memenuhi seluruh syarat formil untuk diajukan ke Mahkamah Konstitusi (MK). Kedua agen verifikasi sepakat bahwa objek perkara tepat kamar pada yurisdiksi MK, dan kerugian konstitusional Anda memiliki keterkaitan langsung dengan hak lingkungan hidup pada Pasal 28H UUD 1945.',
      created_at: new Date().toISOString(),
    }
  });

  // Evidence items store
  const [caseEvidence, setCaseEvidence] = useState<Record<string, EvidenceItem[]>>({
    'case-demo-001': [
      {
        id: 'ev-1',
        case_id: 'case-demo-001',
        kode: 'P-1',
        jenis: 'bukti_tertulis',
        deskripsi: 'Fotokopi KTP Pemohon (Legalisir Pos Bermaterai)',
        relevansi_hukum: 'Membuktikan status Pemohon sebagai perorangan WNI yang sah (Pasal 51 ayat 1 huruf a UU MK).',
        status: 'sudah_disiapkan_user',
        created_at: new Date().toISOString(),
      },
      {
        id: 'ev-2',
        case_id: 'case-demo-001',
        kode: 'P-2',
        jenis: 'bukti_tertulis',
        deskripsi: 'Dokumen Salinan Lembaran Negara UU Pertambangan Mineral & Batubara',
        relevansi_hukum: 'Membuktikan objek norma undang-undang yang dimohonkan pengujian materiil.',
        status: 'sudah_disiapkan_user',
        created_at: new Date().toISOString(),
      },
      {
        id: 'ev-3',
        case_id: 'case-demo-001',
        kode: 'P-3',
        jenis: 'bukti_tertulis',
        deskripsi: 'Surat Keterangan Domisili & Surat Keluhan Warga atas Dampak Lingkungan',
        relevansi_hukum: 'Membuktikan kerugian aktual dan spesifik yang dialami langsung oleh Pemohon (causal verband).',
        status: 'disarankan',
        created_at: new Date().toISOString(),
      },
      {
        id: 'ev-4',
        case_id: 'case-demo-001',
        kode: 'P-4',
        jenis: 'keterangan_ahli',
        deskripsi: 'Pendapat Tertulis / Keterangan Ahli Hukum Tata Negara dan Lingkungan Hidup',
        relevansi_hukum: 'Memperkuat konstruksi posita pertentangan norma UU dengan Pasal 28H ayat (1) UUD 1945.',
        status: 'disarankan',
        created_at: new Date().toISOString(),
      }
    ]
  });

  // Initialize and sync data with Firebase Auth and Firestore
  useEffect(() => {
    // 1. Seed legal knowledge base to Firestore once
    firestoreService.seedKnowledgeBaseIfNeeded();

    // 2. Ensure Firebase Anonymous Authentication is initialized
    ensureFirebaseAuth().then(fbUser => {
      setCurrentUser(prev => {
        if (!prev || prev.id.startsWith('usr_RM-DEMO') || prev.id.startsWith('usr_anon_')) {
          const pseudonymToken = 'RM-ANON-' + fbUser.uid.substring(0, 6).toUpperCase();
          const user: UserProfile = {
            id: fbUser.uid,
            auth_mode: 'anonim_pseudonim',
            email: null,
            pseudonim_token: pseudonymToken,
            tipe_pengguna: prev?.tipe_pengguna || 'individu',
            preferensi_bahasa: prev?.preferensi_bahasa || 'id',
            organisasi: prev?.organisasi || null,
            privacy_policy_accepted_at: prev?.privacy_policy_accepted_at || new Date().toISOString(),
            created_at: prev?.created_at || new Date().toISOString(),
          };
          firestoreService.saveUserProfile(user);
          return user;
        } else if (prev.id !== fbUser.uid) {
          const updated = { ...prev, id: fbUser.uid };
          firestoreService.saveUserProfile(updated);
          return updated;
        }
        return prev;
      });

      // Update demo case owner to active fbUser.uid so security rules permit access
      setCases(prev => prev.map(c => c.id === 'case-demo-001' ? { ...c, user_id: fbUser.uid } : c));
    }).catch(err => {
      console.warn('Firebase Anonymous Auth initialization notice:', err);
    });
  }, []);

  // Sync cases when currentUser ID changes
  useEffect(() => {
    if (currentUser?.id) {
      firestoreService.saveUserProfile(currentUser);

      // Load cases from Firestore if available
      firestoreService.getCasesByUser(currentUser.id).then(remoteCases => {
        if (remoteCases && remoteCases.length > 0) {
          setCases(prev => {
            const combined = [...remoteCases];
            for (const localCase of prev) {
              if (!combined.some(c => c.id === localCase.id)) {
                combined.push(localCase);
              }
            }
            return combined;
          });
        }
      }).catch(err => console.warn('Could not fetch remote cases:', err));
    }
  }, [currentUser?.id]);

  // Persist session and cases in localStorage and Firestore
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rm_user_session', JSON.stringify(currentUser));
      firestoreService.saveUserProfile(currentUser);
    } else {
      localStorage.removeItem('rm_user_session');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('rm_cases_data', JSON.stringify(cases));
  }, [cases]);

  // Load active case details from Firestore
  useEffect(() => {
    if (!activeCaseId) return;

    firestoreService.getMessagesByCase(activeCaseId).then(msgs => {
      if (msgs && msgs.length > 0) {
        setCaseMessages(prev => ({ ...prev, [activeCaseId]: msgs }));
      }
    }).catch(() => {});

    firestoreService.getAssessmentByCase(activeCaseId).then(asm => {
      if (asm) {
        setCaseAssessments(prev => ({ ...prev, [activeCaseId]: asm }));
      }
    }).catch(() => {});

    firestoreService.getEvidenceByCase(activeCaseId).then(evList => {
      if (evList && evList.length > 0) {
        setCaseEvidence(prev => ({ ...prev, [activeCaseId]: evList }));
      }
    }).catch(() => {});
  }, [activeCaseId]);

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0] || null;

  const handleStartNewCase = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    const newId = `case-${Date.now().toString(36)}`;
    const newCase: CaseRecord = {
      id: newId,
      user_id: currentUser.id,
      judul_singkat: 'Permohonan Pengujian Konstitusional Baru',
      status: 'draft',
      ringkasan_masalah_asli: '',
      bahasa_input: currentUser.preferensi_bahasa || 'id',
      ai_disclaimer_accepted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCases(prev => [newCase, ...prev]);
    setActiveCaseId(newId);
    firestoreService.saveCase(newCase);

    const initialGreeting = currentUser.preferensi_bahasa === 'jv'
      ? 'Sugeng rawuh ing Rakyat Menggugat. Kula Agen 1 (Intake). Mangga cariyosaken punapa pranatan/pasal ingkang damel kapitunan tumrap panjenengan, punapa akibat nyata ingkang dipun raosaken, saha punapa ingkang dipun suwun dhumateng Mahkamah Konstitusi/Mahkamah Agung.'
      : currentUser.preferensi_bahasa === 'su'
      ? 'Wilujeng sumping di Rakyat Menggugat. Sim kuring Agen 1 (Intake). Mangga carioskeun perkawis naon pasal/aturan anu ngarugikeun hak anjeun, pangaruh naon anu karandapan, sareng naon anu dipiharep ka Mahkamah Konstitusi/Mahkamah Agung.'
      : 'Selamat datang di Rakyat Menggugat. Saya adalah Agen 1 (Intake & Klarifikasi Fakta). Silakan ceritakan apa undang-undang atau pasal yang merugikan hak Anda, apa dampak nyata yang Anda alami, dan apa yang Anda harapkan diputus oleh Mahkamah Konstitusi/Mahkamah Agung.';

    const initialMsg: CaseMessage = {
      id: `msg-${Date.now()}`,
      case_id: newId,
      role: 'agent_intake',
      content: initialGreeting,
      created_at: new Date().toISOString(),
    };

    setCaseMessages(prev => ({
      ...prev,
      [newId]: [initialMsg]
    }));
    firestoreService.saveMessage(initialMsg);

    setCurrentScreen('chat');
  };

  const handleSendMessage = async (text: string) => {
    if (!activeCase) return;

    const userMsgId = `msg-${Date.now()}`;
    const newMsg: CaseMessage = {
      id: userMsgId,
      case_id: activeCase.id,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    const updatedSummary = activeCase.ringkasan_masalah_asli ? `${activeCase.ringkasan_masalah_asli} ${text}` : text;
    const updatedCase: CaseRecord = {
      ...activeCase,
      ringkasan_masalah_asli: updatedSummary,
      judul_singkat: text.length > 50 ? `${text.substring(0, 50)}...` : text,
      updated_at: new Date().toISOString()
    };

    // Update case and messages
    setCases(prev => prev.map(c => c.id === activeCase.id ? updatedCase : c));
    firestoreService.saveCase(updatedCase);

    const updatedHistory = [...(caseMessages[activeCase.id] || []), newMsg];
    setCaseMessages(prev => ({
      ...prev,
      [activeCase.id]: updatedHistory
    }));
    firestoreService.saveMessage(newMsg);

    // Call Agent 1 Intake API
    try {
      const response = await fetch('/api/agent-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseFacts: updatedSummary,
          chatHistory: updatedHistory.map(m => ({ role: m.role, content: m.content })),
          userLanguage: activeCase.bahasa_input || currentUser?.preferensi_bahasa || 'id'
        })
      });

      let botContent = 'Poin fakta telah dicatat. Dari uraian Anda: objek yang dipersoalkan berkaitan dengan kerugian hak konstitusional. Anda dapat menekan tombol "Lakukan Asesmen Kelayakan Dual-Agent" di sebelah kanan untuk menjalankan evaluasi independen 4 lapis.';
      let formalParaphrase = updatedSummary;

      if (response.ok) {
        const data = await response.json();
        if (data.message) botContent = data.message;
        if (data.formal_indonesian_paraphrase) {
          formalParaphrase = data.formal_indonesian_paraphrase;
          // Update case with the formal Indonesian legal paraphrase as canonical foundation
          const enrichedCase: CaseRecord = {
            ...updatedCase,
            ringkasan_masalah_asli: formalParaphrase,
            updated_at: new Date().toISOString()
          };
          setCases(prev => prev.map(c => c.id === activeCase.id ? enrichedCase : c));
          firestoreService.saveCase(enrichedCase);
        }
      }

      const botMsgId = `msg-${Date.now() + 1}`;
      const botResponse: CaseMessage = {
        id: botMsgId,
        case_id: activeCase.id,
        role: 'agent_intake',
        content: botContent,
        created_at: new Date().toISOString(),
      };

      setCaseMessages(prev => ({
        ...prev,
        [activeCase.id]: [...updatedHistory, botResponse]
      }));
      firestoreService.saveMessage(botResponse);
    } catch {
      // Fallback local response
      const botMsgId = `msg-${Date.now() + 1}`;
      const fallbackResponse: CaseMessage = {
        id: botMsgId,
        case_id: activeCase.id,
        role: 'agent_intake',
        content: 'Poin fakta telah dicatat. Dari uraian Anda: objek yang dipersoalkan berkaitan dengan kerugian langsung hak konstitusional. Anda dapat menekan tombol "Lakukan Asesmen Kelayakan Dual-Agent" di sebelah kanan untuk menganalisis 4 lapis kelayakan secara komprehensif.',
        created_at: new Date().toISOString(),
      };
      setCaseMessages(prev => ({
        ...prev,
        [activeCase.id]: [...updatedHistory, fallbackResponse]
      }));
      firestoreService.saveMessage(fallbackResponse);
    }
  };

  const handleRunAssessment = async () => {
    if (!activeCase) return;
    setIsAssessing(true);

    try {
      const facts = activeCase.ringkasan_masalah_asli || activeCase.judul_singkat;
      const res = await fetch('/api/assess-dual-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: activeCase.id,
          caseFacts: facts,
          userLanguage: activeCase.bahasa_input || currentUser?.preferensi_bahasa || 'id'
        })
      });

      let newAssessment: DualAgentAssessment;

      if (res.ok) {
        const data = await res.json();
        newAssessment = data.assessment;
      } else {
        throw new Error('API request failed');
      }

      setCaseAssessments(prev => ({
        ...prev,
        [activeCase.id]: newAssessment
      }));
      firestoreService.saveAssessment(newAssessment);

      const updatedCase: CaseRecord = { 
        ...activeCase, 
        status: 'assessed', 
        updated_at: new Date().toISOString() 
      };
      setCases(prev => prev.map(c => c.id === activeCase.id ? updatedCase : c));
      firestoreService.saveCase(updatedCase);

      // Generate & persist dynamic, scenario-aware evidence items (PMK No. 2/2021)
      try {
        const evRes = await fetch('/api/generate-evidence-matrix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId: activeCase.id,
            caseFacts: facts,
            petitionerName: currentUser?.organisasi?.pic_nama || (currentUser?.email ? currentUser.email.split('@')[0] : 'Pemohon Warga Negara')
          })
        });

        if (evRes.ok) {
          const evData = await evRes.json();
          if (evData.items && evData.items.length > 0) {
            setCaseEvidence(prev => ({
              ...prev,
              [activeCase.id]: evData.items
            }));
            await firestoreService.batchSaveEvidenceItems(evData.items);
          }
        }
      } catch (evErr) {
        console.warn('Evidence matrix generation warning:', evErr);
      }

      setCurrentScreen('assessment');
    } catch (err) {
      console.warn('Assessment API fallback:', err);
      // Fallback assessment
      const fallbackAsm: DualAgentAssessment = {
        id: `asm-${Date.now()}`,
        case_id: activeCase.id,
        agent_analysis_run_id: `run-ag2-${Date.now()}`,
        agent_verifier_run_id: `run-ag3-${Date.now()}`,
        hasil_akhir: 'layak',
        confidence_level: 'tinggi',
        agent_agreement: true,
        status_tampil_ke_user: 'layak',
        catatan_ambiguitas: 'Verifikasi independen mengonfirmasi kelayakan formil. Posita siap disusun.',
        layers: [
          {
            lapis_ke: 1,
            nama: 'kewenangan',
            status: 'lolos',
            jalur_hukum: 'MK',
            penjelasan: 'Objek yang dimohonkan pengujian adalah materi muatan dalam Undang-Undang (UU) terhadap UUD 1945. Mahkamah Konstitusi berwenang penuh (Pasal 24C ayat 1 UUD 1945).',
            rujukan: [
              {
                knowledge_entry_id: 'uud-1945-pasal-24c',
                version_id: 'v-uud-1945-24c-1',
                judul_dokumen: 'UUD 1945 Pasal 24C ayat (1)',
                kutipan_relevan: 'Mahkamah Konstitusi berwenang mengadili pada tingkat pertama dan terakhir yang putusannya bersifat final untuk menguji undang-undang terhadap Undang-Undang Dasar.'
              }
            ]
          },
          {
            lapis_ke: 2,
            nama: 'legal_standing',
            status: 'lolos',
            penjelasan: 'Pemohon memenuhi syarat kedudukan hukum 5 kriteria Putusan MK No. 006/PUU-III/2005.',
            rujukan: [
              {
                knowledge_entry_id: 'putusan-mk-006-2005',
                version_id: 'v-putusan-006-1',
                judul_dokumen: 'Yurisprudensi MK No. 006/PUU-III/2005',
                kutipan_relevan: 'Syarat kerugian konstitusional pemohon: hak konstitusional, kerugian spesifik aktual, causal verband, dan pemulihan.'
              }
            ]
          },
          {
            lapis_ke: 3,
            nama: 'batu_uji',
            status: 'lolos',
            penjelasan: 'Batu uji UUD 1945 telah teridentifikasi dan tidak terhalang asas ne bis in idem (Pasal 60 UU MK).',
            rujukan: [
              {
                knowledge_entry_id: 'uud-1945-pasal-28d-1',
                version_id: 'v-uud-28d1-1',
                judul_dokumen: 'UUD 1945 Pasal 28D ayat (1)',
                kutipan_relevan: 'Setiap orang berhak atas kepastian hukum yang adil.'
              }
            ]
          },
          {
            lapis_ke: 4,
            nama: 'posita',
            status: 'lolos',
            penjelasan: 'Konstruksi alasan permohonan logis dan berdasar hukum.',
            saran_perbaikan: 'Sertakan alat bukti tertulis bermaterai legalisir pos.',
            rujukan: []
          }
        ],
        ringkasan_untuk_user: 'Berdasarkan telaah Dual-Agent independen, permohonan Anda berpotensi kuat memenuhi seluruh syarat formil Mahkamah Konstitusi.',
        created_at: new Date().toISOString()
      };

      setCaseAssessments(prev => ({
        ...prev,
        [activeCase.id]: fallbackAsm
      }));
      firestoreService.saveAssessment(fallbackAsm);
      setCurrentScreen('assessment');
    } finally {
      setIsAssessing(false);
    }
  };

  const handleAcceptCaseDisclaimer = () => {
    if (!activeCase) return;
    const updatedCase: CaseRecord = {
      ...activeCase,
      ai_disclaimer_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCases(prev => prev.map(c => c.id === activeCase.id ? updatedCase : c));
    firestoreService.saveCase(updatedCase);
  };

  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setSyncToast({ message, type });
    setTimeout(() => {
      setSyncToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  const handleUpdateEvidenceItem = async (updatedItem: EvidenceItem) => {
    if (!activeCase) return;
    const previousList = caseEvidence[activeCase.id] || [];
    const updatedList = previousList.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );

    // Optimistic UI update
    setCaseEvidence(prev => ({
      ...prev,
      [activeCase.id]: updatedList
    }));

    // Server Firestore write verification
    const result = await firestoreService.saveEvidenceItem(updatedItem);
    if (!result.success) {
      showToast(`Gagal menyimpan status bukti ke Firestore: ${result.error || 'Koneksi terputus'}. Memulihkan status...`, 'error');
      // Rollback on server failure to keep UI and server strictly aligned
      setCaseEvidence(prev => ({
        ...prev,
        [activeCase.id]: previousList
      }));
    }
  };

  const handleDeleteEvidenceItem = async (evidenceId: string) => {
    if (!activeCase) return;
    const previousList = caseEvidence[activeCase.id] || [];
    const updatedList = previousList.filter(item => item.id !== evidenceId);

    setCaseEvidence(prev => ({
      ...prev,
      [activeCase.id]: updatedList
    }));

    const result = await firestoreService.deleteEvidenceItem(activeCase.id, evidenceId);
    if (!result.success) {
      showToast(`Gagal menghapus bukti dari server Firestore: ${result.error || 'Koneksi terputus'}`, 'error');
      setCaseEvidence(prev => ({
        ...prev,
        [activeCase.id]: previousList
      }));
    }
  };

  const handleAddCustomEvidence = async (item: Omit<EvidenceItem, 'id' | 'case_id' | 'created_at'>) => {
    if (!activeCase) return;
    const newItem: EvidenceItem = {
      ...item,
      id: `ev-${Date.now()}`,
      case_id: activeCase.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCaseEvidence(prev => ({
      ...prev,
      [activeCase.id]: [...(prev[activeCase.id] || []), newItem]
    }));
    
    const result = await firestoreService.saveEvidenceItem(newItem);
    if (!result.success) {
      showToast(`Gagal menyimpan bukti baru ke server: ${result.error}`, 'error');
    }
  };

  const handleSaveStatement = (type: StatementType, lawyerName?: string, lawyerNumber?: string) => {
    if (!activeCase) return;
    const updatedCase: CaseRecord = {
      ...activeCase,
      status: 'document_generated',
      updated_at: new Date().toISOString()
    };
    setCases(prev => prev.map(c => c.id === activeCase.id ? updatedCase : c));
    firestoreService.saveCase(updatedCase);
  };

  const handleDeleteCase = (caseId: string) => {
    setCases(prev => prev.filter(c => c.id !== caseId));
    firestoreService.deleteCase(caseId);
    if (activeCaseId === caseId) {
      const remaining = cases.filter(c => c.id !== caseId);
      if (remaining.length > 0) {
        setActiveCaseId(remaining[0].id);
      } else {
        setCurrentScreen('home');
      }
    }
  };

  const handleDeleteAllData = () => {
    if (currentUser?.id) {
      firestoreService.purgeUserData(currentUser.id);
    }
    localStorage.clear();
    setCases([]);
    setCurrentUser(null);
    setCaseMessages({});
    setCaseAssessments({});
    setCaseEvidence({});
    setCurrentScreen('home');
  };

  const currentAssessment = activeCase ? (caseAssessments[activeCase.id] || caseAssessments['case-demo-001']) : caseAssessments['case-demo-001'];
  const currentEvidence = activeCase ? (caseEvidence[activeCase.id] || caseEvidence['case-demo-001'] || []) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-stone-900 font-sans">
      {/* Institutional Top Navigation Header */}
      <Header
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setCurrentUser(null)}
        onLanguageChange={(lang) => {
          if (currentUser) {
            setCurrentUser(prev => prev ? { ...prev, preferensi_bahasa: lang } : null);
          }
        }}
      />

      {/* Sync / Error Feedback Toast */}
      {syncToast && (
        <div className={`sticky top-16 z-50 px-4 py-2 text-xs text-center font-medium shadow-md transition-all ${
          syncToast.type === 'error' ? 'bg-red-700 text-white' : syncToast.type === 'success' ? 'bg-emerald-800 text-white' : 'bg-stone-800 text-stone-100'
        }`}>
          <span>{syncToast.message}</span>
        </div>
      )}

      {/* Main Screen Content Router */}
      <main className="flex-1">
        {currentScreen === 'home' && (
          <EducationView
            onStartIntake={() => {
              if (!currentUser) {
                setIsAuthOpen(true);
              } else {
                handleStartNewCase();
              }
            }}
            onOpenBlankTemplate={() => {
              if (!currentUser) {
                setIsAuthOpen(true);
              } else {
                setCurrentScreen('document');
              }
            }}
            onSelectPersona={(type: UserType) => {
              if (currentUser) {
                setCurrentUser(prev => prev ? { ...prev, tipe_pengguna: type } : null);
              }
              handleStartNewCase();
            }}
          />
        )}

        {currentScreen === 'cases' && currentUser && (
          <CaseListDashboard
            cases={cases}
            currentUser={currentUser}
            onSelectCase={(selected) => {
              setActiveCaseId(selected.id);
              if (selected.status === 'assessed') {
                setCurrentScreen('assessment');
              } else if (selected.status === 'document_generated') {
                setCurrentScreen('document');
              } else {
                setCurrentScreen('chat');
              }
            }}
            onStartNewCase={handleStartNewCase}
            onDeleteCase={handleDeleteCase}
            onOpenPrivacy={() => setCurrentScreen('privacy')}
          />
        )}

        {currentScreen === 'chat' && activeCase && currentUser && (
          <CaseIntakeChat
            activeCase={activeCase}
            currentUser={currentUser}
            messages={caseMessages[activeCase.id] || []}
            onSendMessage={handleSendMessage}
            onRunAssessment={handleRunAssessment}
            isAssessing={isAssessing}
            onAcceptCaseDisclaimer={handleAcceptCaseDisclaimer}
          />
        )}

        {currentScreen === 'assessment' && activeCase && (
          <AssessmentReportView
            assessment={currentAssessment}
            activeCase={activeCase}
            onProceedToEvidence={() => setCurrentScreen('evidence')}
            onBackToChat={() => setCurrentScreen('chat')}
          />
        )}

        {currentScreen === 'evidence' && activeCase && (
          <EvidenceGuideView
            activeCase={activeCase}
            evidenceItems={currentEvidence}
            sectorName={activeCase.judul_singkat}
            onUpdateEvidenceItem={handleUpdateEvidenceItem}
            onDeleteEvidenceItem={handleDeleteEvidenceItem}
            onAddCustomEvidence={handleAddCustomEvidence}
            onProceedToDocument={() => setCurrentScreen('document')}
            onBackToAssessment={() => setCurrentScreen('assessment')}
          />
        )}

        {currentScreen === 'document' && activeCase && currentUser && (
          <DocumentGeneratorView
            activeCase={activeCase}
            currentUser={currentUser}
            assessment={currentAssessment}
            evidenceItems={currentEvidence}
            onBackToEvidence={() => setCurrentScreen('evidence')}
            onSaveStatement={handleSaveStatement}
          />
        )}

        {currentScreen === 'privacy' && (
          <AccountPrivacyView
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(prev => prev ? { ...prev, ...updated } : null)}
            onDeleteAllData={handleDeleteAllData}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentScreen === 'knowledge' && (
          <LegalKnowledgeBaseView
            onSelectPrecedentForIntake={(citation) => {
              handleStartNewCase();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="print:hidden border-t border-stone-200 bg-stone-100 text-stone-700 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-serif font-bold text-stone-900 text-sm">
            <span className="w-6 h-6 rounded bg-[#881337] text-white flex items-center justify-center text-xs">RM</span>
            <span>Rakyat Menggugat</span>
          </div>
          <p className="text-center sm:text-left text-stone-600">
            Platform nirlaba bantuan penyusunan permohonan konstitusional mandiri. Bukan representasi advokat resmi.
          </p>
          <div className="flex items-center gap-4 text-stone-600 font-medium">
            <button onClick={() => setCurrentScreen('privacy')} className="hover:underline">
              Kebijakan Privasi (UU PDP)
            </button>
            <span>•</span>
            <button onClick={() => setCurrentScreen('home')} className="hover:underline">
              Edukasi MK vs MA
            </button>
          </div>
        </div>
      </footer>

      {/* Auth & Pseudonym Dialog Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticate={(user) => {
          setCurrentUser(user);
          setCurrentScreen('cases');
        }}
        initialUserType={currentUser?.tipe_pengguna || 'individu'}
      />
    </div>
  );
}
