/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firestore persistence service for Rakyat Menggugat (Schema v1.1 Subcollections)
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  UserProfile, 
  CaseRecord, 
  CaseMessage, 
  DualAgentAssessment, 
  EvidenceItem,
  LegalKnowledgeEntry,
  LegalKnowledgeVersion
} from '../types';
import { SEED_LEGAL_KNOWLEDGE } from '../data/seedKnowledge';

export const firestoreService = {
  // --- USER PROFILE & PRIVACY POLICY CONSENT ---
  async saveUserProfile(user: UserProfile): Promise<void> {
    if (!db) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, user, { merge: true });
    } catch (err) {
      console.warn('Firestore: Falling back to local storage for user profile', err);
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!db) return null;
    try {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (err) {
      console.warn('Firestore: Could not fetch user from firestore, using local state', err);
      return null;
    }
  },

  // --- CASES ---
  async saveCase(caseRecord: CaseRecord): Promise<void> {
    if (!db) return;
    try {
      const caseRef = doc(db, 'cases', caseRecord.id);
      await setDoc(caseRef, caseRecord, { merge: true });
    } catch (err) {
      console.warn('Firestore: Falling back to local storage for case', err);
    }
  },

  async getCasesByUser(userId: string): Promise<CaseRecord[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'cases'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      const list: CaseRecord[] = [];
      snap.forEach(d => list.push(d.data() as CaseRecord));
      return list;
    } catch (err) {
      console.warn('Firestore: Failed to query cases, using local storage', err);
      return [];
    }
  },

  async deleteCase(caseId: string): Promise<void> {
    if (!db) return;
    try {
      // Delete subcollections: messages, evidence_items, assessments, generated_documents, consents, statement_form
      const collections = ['messages', 'evidence_items', 'assessments', 'generated_documents', 'consents', 'statement_form'];
      
      await Promise.all(collections.map(async (colName) => {
        try {
          if (!db) return;
          const snap = await getDocs(collection(db, 'cases', caseId, colName));
          await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
        } catch (subErr) {
          console.warn(`Firestore subcollection ${colName} deletion non-blocking notice:`, subErr);
        }
      }));

      // Delete parent case document
      await deleteDoc(doc(db, 'cases', caseId));
    } catch (err) {
      console.warn('Firestore deleteCase error:', err);
      throw err;
    }
  },

  // --- SUBCOLLECTION: cases/{caseId}/messages/{messageId} ---
  async saveMessage(message: CaseMessage): Promise<void> {
    if (!db) return;
    try {
      const msgRef = doc(db, 'cases', message.case_id, 'messages', message.id);
      await setDoc(msgRef, message);
    } catch (err) {
      console.warn('Firestore: saveMessage error:', err);
    }
  },

  async getMessagesByCase(caseId: string): Promise<CaseMessage[]> {
    if (!db) return [];
    try {
      const messagesRef = collection(db, 'cases', caseId, 'messages');
      const snap = await getDocs(messagesRef);
      const list: CaseMessage[] = [];
      snap.forEach(d => list.push(d.data() as CaseMessage));
      return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } catch (err) {
      console.warn('Firestore getMessagesByCase error:', err);
      return [];
    }
  },

  // --- SUBCOLLECTION: cases/{caseId}/assessments/{assessmentId} ---
  async saveAssessment(assessment: DualAgentAssessment): Promise<void> {
    if (!db) return;
    try {
      const asmRef = doc(db, 'cases', assessment.case_id, 'assessments', assessment.id);
      await setDoc(asmRef, assessment, { merge: true });
    } catch (err) {
      console.warn('Firestore saveAssessment error:', err);
    }
  },

  async getAssessmentByCase(caseId: string): Promise<DualAgentAssessment | null> {
    if (!db) return null;
    try {
      const asmCol = collection(db, 'cases', caseId, 'assessments');
      const snap = await getDocs(asmCol);
      if (!snap.empty) {
        // Return latest assessment
        const list: DualAgentAssessment[] = [];
        snap.forEach(d => list.push(d.data() as DualAgentAssessment));
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return list[0];
      }
      return null;
    } catch (err) {
      console.warn('Firestore getAssessmentByCase error:', err);
      return null;
    }
  },

  // --- SUBCOLLECTION: cases/{caseId}/evidence_items/{evidenceId} ---
  async saveEvidenceItem(item: EvidenceItem): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: true };
    try {
      const evRef = doc(db, 'cases', item.case_id, 'evidence_items', item.id);
      await setDoc(evRef, item, { merge: true });
      return { success: true };
    } catch (err: any) {
      console.error('Firestore saveEvidenceItem failure:', err);
      return { success: false, error: err?.message || 'Gagal menyimpan item bukti ke database server.' };
    }
  },

  async batchSaveEvidenceItems(items: EvidenceItem[]): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: true };
    try {
      for (const item of items) {
        const evRef = doc(db, 'cases', item.case_id, 'evidence_items', item.id);
        await setDoc(evRef, item, { merge: true });
      }
      return { success: true };
    } catch (err: any) {
      console.error('Firestore batchSaveEvidenceItems failure:', err);
      return { success: false, error: err?.message || 'Gagal menyimpan batch bukti ke database server.' };
    }
  },

  async deleteEvidenceItem(caseId: string, evidenceId: string): Promise<{ success: boolean; error?: string }> {
    if (!db) return { success: true };
    try {
      const evRef = doc(db, 'cases', caseId, 'evidence_items', evidenceId);
      await deleteDoc(evRef);
      return { success: true };
    } catch (err: any) {
      console.error('Firestore deleteEvidenceItem failure:', err);
      return { success: false, error: err?.message || 'Gagal menghapus item bukti dari database server.' };
    }
  },

  async getEvidenceByCase(caseId: string): Promise<EvidenceItem[]> {
    if (!db) return [];
    try {
      const evCol = collection(db, 'cases', caseId, 'evidence_items');
      const snap = await getDocs(evCol);
      const list: EvidenceItem[] = [];
      snap.forEach(d => list.push(d.data() as EvidenceItem));
      return list.sort((a, b) => {
        // Natural numerical sort for P-1, P-2, P-10
        const numA = parseInt(a.kode.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.kode.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });
    } catch (err) {
      console.warn('Firestore getEvidenceByCase error:', err);
      return [];
    }
  },

  // --- SUBCOLLECTION: cases/{caseId}/consents/{consentId} ---
  async saveConsent(caseId: string, userId: string, consentType: string): Promise<void> {
    if (!db) return;
    try {
      const consentId = `consent-${Date.now()}`;
      const consentRef = doc(db, 'cases', caseId, 'consents', consentId);
      await setDoc(consentRef, {
        id: consentId,
        case_id: caseId,
        user_id: userId,
        consent_type: consentType,
        accepted_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore saveConsent error:', err);
    }
  },

  // --- SUBCOLLECTION: cases/{caseId}/statement_form/{formId} ---
  async saveStatementForm(caseId: string, type: string, counselName?: string, barNumber?: string): Promise<void> {
    if (!db) return;
    try {
      const formId = `form-${Date.now()}`;
      const formRef = doc(db, 'cases', caseId, 'statement_form', formId);
      await setDoc(formRef, {
        id: formId,
        case_id: caseId,
        tipe_pernyataan: type,
        nama_pendamping: counselName || null,
        nomor_kta_advokat: barNumber || null,
        submitted_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore saveStatementForm error:', err);
    }
  },

  // --- LEGAL KNOWLEDGE: legal_knowledge_entries/{entryId}/versions/{versionId} ---
  async saveLegalKnowledgeEntry(entry: LegalKnowledgeEntry, version?: LegalKnowledgeVersion): Promise<void> {
    if (!db) return;
    try {
      const entryRef = doc(db, 'legal_knowledge_entries', entry.id);
      await setDoc(entryRef, entry, { merge: true });

      if (version) {
        const verRef = doc(db, 'legal_knowledge_entries', entry.id, 'versions', version.id);
        await setDoc(verRef, version, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore saveLegalKnowledgeEntry error:', err);
      throw err;
    }
  },

  async getLegalKnowledgeEntries(): Promise<LegalKnowledgeEntry[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, 'legal_knowledge_entries');
      const snap = await getDocs(colRef);
      const list: LegalKnowledgeEntry[] = [];
      snap.forEach(d => list.push(d.data() as LegalKnowledgeEntry));
      return list;
    } catch (err) {
      console.warn('Firestore getLegalKnowledgeEntries error:', err);
      return [];
    }
  },

  async getLegalKnowledgeVersions(entryId: string): Promise<LegalKnowledgeVersion[]> {
    if (!db) return [];
    try {
      const verCol = collection(db, 'legal_knowledge_entries', entryId, 'versions');
      const snap = await getDocs(verCol);
      const list: LegalKnowledgeVersion[] = [];
      snap.forEach(d => list.push(d.data() as LegalKnowledgeVersion));
      return list.sort((a, b) => (a.versi_ke || 0) - (b.versi_ke || 0));
    } catch (err) {
      console.warn('Firestore getLegalKnowledgeVersions error:', err);
      return [];
    }
  },

  async seedKnowledgeBaseIfNeeded(): Promise<void> {
    if (!db) return;
    try {
      for (const item of SEED_LEGAL_KNOWLEDGE) {
        // 1. Save entry document without isi_teks (pointer to current_version_id)
        const entryRef = doc(db, 'legal_knowledge_entries', item.entry.id);
        await setDoc(entryRef, {
          id: item.entry.id,
          sumber: item.entry.sumber,
          jenis_dokumen: item.entry.jenis_dokumen,
          nomor: item.entry.nomor,
          tahun: item.entry.tahun,
          judul: item.entry.judul,
          status_berlaku: item.entry.status_berlaku,
          current_version_id: item.version.id,
          last_synced_at: item.entry.last_synced_at
        }, { merge: true });

        // 2. Save version in subcollection legal_knowledge_entries/{entryId}/versions/{versionId}
        const versionRef = doc(db, 'legal_knowledge_entries', item.entry.id, 'versions', item.version.id);
        await setDoc(versionRef, {
          id: item.version.id,
          entry_id: item.entry.id,
          versi_ke: 1,
          isi_teks: item.version.isi_teks,
          catatan_perubahan: 'Versi awal seed pengetahuan hukum',
          tanggal_berlaku_versi: '2021-01-01',
          content_hash: item.version.content_hash,
          url_sumber: item.version.url_sumber,
          scraped_at: item.version.scraped_at,
          created_at: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore seedKnowledgeBase error:', err);
    }
  },

  // --- UU PDP RIGHT TO ERASURE (Delete all user data) ---
  async purgeUserData(userId: string): Promise<void> {
    if (!db) return;
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      const cases = await this.getCasesByUser(userId);
      for (const c of cases) {
        await this.deleteCase(c.id);
      }
    } catch (err) {
      console.warn('Firestore purgeUserData error:', err);
    }
  }
};
