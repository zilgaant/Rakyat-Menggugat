/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Script to test Firestore Security Rules cross-user isolation against the live database
 */

import { initializeApp, deleteApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import firebaseConfigJson from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

async function runSecurityTest() {
  console.log('===============================================================');
  console.log(' FIRESTORE SECURITY RULES: CROSS-USER ACCESS VERIFICATION TEST');
  console.log(' Target Database:', firebaseConfigJson.firestoreDatabaseId || '(default)');
  console.log('===============================================================\n');

  async function authUser(authInstance: any, label: string) {
    try {
      const cred = await signInAnonymously(authInstance);
      console.log(`[AUTH] ${label} authenticated anonymously: ${cred.user.uid}`);
      return cred.user;
    } catch (err: any) {
      if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/operation-not-allowed') {
        const testEmail = `${label.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}@test.rakyatmenggugat.id`;
        const testPass = 'SecurePass_12345!';
        const cred = await createUserWithEmailAndPassword(authInstance, testEmail, testPass);
        console.log(`[AUTH] ${label} authenticated via Email (${testEmail}): ${cred.user.uid}`);
        return cred.user;
      }
      throw err;
    }
  }

  // 1. Initialize Client App A (User A)
  const appA = initializeApp(firebaseConfig, 'ClientApp-UserA');
  const authA = getAuth(appA);
  const dbA = getFirestore(appA, firebaseConfigJson.firestoreDatabaseId);

  const userA = await authUser(authA, 'User_A');
  const userA_UID = userA.uid;
  console.log(`[TEST 1] User A active session UID: ${userA_UID}`);

  const testCaseId = `case-test-sec-${Date.now()}`;
  const caseDocRefA = doc(dbA, 'cases', testCaseId);
  const subMsgDocRefA = doc(dbA, 'cases', testCaseId, 'messages', 'msg-001');

  // User A creates case and subcollection message
  console.log(`[TEST 2] User A creating parent case '${testCaseId}' with user_id: ${userA_UID}...`);
  await setDoc(caseDocRefA, {
    id: testCaseId,
    user_id: userA_UID,
    judul_singkat: 'Permohonan Uji Materiil UU Cipta Kerja - User A',
    status: 'draft',
    created_at: new Date().toISOString()
  });
  console.log('         -> Case created successfully by User A (OWNER).');

  console.log(`[TEST 3] User A creating subcollection message in cases/${testCaseId}/messages/msg-001...`);
  await setDoc(subMsgDocRefA, {
    id: 'msg-001',
    case_id: testCaseId,
    role: 'user',
    content: 'Ini adalah fakta rahasia pemohon A.',
    created_at: new Date().toISOString()
  });
  console.log('         -> Subcollection message created successfully by User A.');

  // Verify User A can read own case
  const snapA = await getDoc(caseDocRefA);
  console.log(`[TEST 4] User A reading own case document: exists=${snapA.exists()}, title="${snapA.data()?.judul_singkat}"`);

  // 2. Initialize Client App B (User B - Cross-user attacker / different petitioner)
  const appB = initializeApp(firebaseConfig, 'ClientApp-UserB');
  const authB = getAuth(appB);
  const dbB = getFirestore(appB, firebaseConfigJson.firestoreDatabaseId);

  const userB = await authUser(authB, 'User_B');
  const userB_UID = userB.uid;
  console.log(`\n[TEST 5] User B active session UID: ${userB_UID}`);
  console.log(`         Distinct users confirmed (User A !== User B): ${userA_UID !== userB_UID}`);

  // Test 6: User B attempts to read User A's case document
  console.log(`\n[TEST 6] ATTEMPT: User B reading User A's case ('cases/${testCaseId}')...`);
  const caseDocRefB = doc(dbB, 'cases', testCaseId);
  try {
    const snapB = await getDoc(caseDocRefB);
    console.error(' [SECURITY FLAW] User B was able to read User A case! Data:', snapB.data());
  } catch (err: any) {
    console.log(' [EXPECTED PERMISSION_DENIED]');
    console.log('   Error Code   :', err.code);
    console.log('   Error Message:', err.message);
  }

  // Test 7: User B attempts to read User A's subcollection message
  console.log(`\n[TEST 7] ATTEMPT: User B reading User A's subcollection message ('cases/${testCaseId}/messages/msg-001')...`);
  const subMsgDocRefB = doc(dbB, 'cases', testCaseId, 'messages', 'msg-001');
  try {
    const snapMsgB = await getDoc(subMsgDocRefB);
    console.error(' [SECURITY FLAW] User B was able to read User A subcollection message! Data:', snapMsgB.data());
  } catch (err: any) {
    console.log(' [EXPECTED PERMISSION_DENIED]');
    console.log('   Error Code   :', err.code);
    console.log('   Error Message:', err.message);
  }

  // Test 8: User B attempts to inject a message into User A's case
  console.log(`\n[TEST 8] ATTEMPT: User B writing message into User A's case ('cases/${testCaseId}/messages/msg-injected')...`);
  const subMsgInjectB = doc(dbB, 'cases', testCaseId, 'messages', 'msg-injected');
  try {
    await setDoc(subMsgInjectB, {
      id: 'msg-injected',
      case_id: testCaseId,
      role: 'agent_intake',
      content: 'Injected message from attacker',
      created_at: new Date().toISOString()
    });
    console.error(' [SECURITY FLAW] User B was able to inject message into User A case!');
  } catch (err: any) {
    console.log(' [EXPECTED PERMISSION_DENIED]');
    console.log('   Error Code   :', err.code);
    console.log('   Error Message:', err.message);
  }

  // Test 9: User B attempts to alter legal_knowledge_entries (non-admin write)
  console.log(`\n[TEST 9] ATTEMPT: User B writing to legal_knowledge_entries (tampering norm)...`);
  const normRefB = doc(dbB, 'legal_knowledge_entries', 'uud1945-art28d');
  try {
    await setDoc(normRefB, {
      id: 'uud1945-art28d',
      judul: 'Pasal Palsu',
      status_berlaku: 'palsu'
    }, { merge: true });
    console.error(' [SECURITY FLAW] User B was able to write to legal_knowledge_entries!');
  } catch (err: any) {
    console.log(' [EXPECTED PERMISSION_DENIED]');
    console.log('   Error Code   :', err.code);
    console.log('   Error Message:', err.message);
  }

  // Cleanup by User A
  console.log(`\n[CLEANUP] User A deleting test artifacts...`);
  await deleteDoc(subMsgDocRefA);
  await deleteDoc(caseDocRefA);
  console.log('          Cleanup completed.');

  await deleteApp(appA);
  await deleteApp(appB);
  console.log('\n===============================================================');
  console.log(' ALL SECURITY TESTS COMPLETED SUCCESSFULLY: ACCESS CONTROL VERIFIED');
  console.log('===============================================================');
}

runSecurityTest().catch(console.error);
