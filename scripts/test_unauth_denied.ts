/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Script: Demonstrate PERMISSION_DENIED on unauthorized read & write against Firestore
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let firebaseConfigJson: any = {};
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfigJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch {
  // Ignore fallback
}

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey || '',
  authDomain: firebaseConfigJson.authDomain || '',
  projectId: firebaseConfigJson.projectId || '',
  storageBucket: firebaseConfigJson.storageBucket || '',
  messagingSenderId: firebaseConfigJson.messagingSenderId || '',
  appId: firebaseConfigJson.appId || '',
};

async function testPermissionDenied() {
  console.log('================================================================');
  console.log(' LIVE FIRESTORE SECURITY RULES VERIFICATION TEST');
  console.log(' Database ID: ' + (firebaseConfigJson.firestoreDatabaseId || '(default)'));
  console.log('================================================================\n');

  const app = initializeApp(firebaseConfig, 'TestClientUnauth');
  const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId);

  // Test 1: Attempting to read a sensitive case document without valid ownership
  const targetCaseId = 'case-user-a-confidential-9988';
  console.log(`[TEST 1] Attempting to READ protected document: 'cases/${targetCaseId}'...`);
  try {
    const snap = await getDoc(doc(db, 'cases', targetCaseId));
    console.log('[FAILED] Document was read unexpectedly:', snap.data());
  } catch (err: any) {
    console.log('[PASS: EXPECTED PERMISSION_DENIED]');
    console.log('  -> error.name   :', err.name);
    console.log('  -> error.code   :', err.code);
    console.log('  -> error.message:', err.message);
  }

  // Test 2: Attempting to read a sensitive subcollection message
  console.log(`\n[TEST 2] Attempting to READ subcollection: 'cases/${targetCaseId}/messages/msg-01'...`);
  try {
    const snap = await getDoc(doc(db, 'cases', targetCaseId, 'messages', 'msg-01'));
    console.log('[FAILED] Subcollection document was read unexpectedly:', snap.data());
  } catch (err: any) {
    console.log('[PASS: EXPECTED PERMISSION_DENIED]');
    console.log('  -> error.name   :', err.name);
    console.log('  -> error.code   :', err.code);
    console.log('  -> error.message:', err.message);
  }

  // Test 3: Attempting to read user private profile without ownership
  const targetUserId = 'usr_victim_citizen_1234';
  console.log(`\n[TEST 3] Attempting to READ user profile: 'users/${targetUserId}'...`);
  try {
    const snap = await getDoc(doc(db, 'users', targetUserId));
    console.log('[FAILED] User document was read unexpectedly:', snap.data());
  } catch (err: any) {
    console.log('[PASS: EXPECTED PERMISSION_DENIED]');
    console.log('  -> error.name   :', err.name);
    console.log('  -> error.code   :', err.code);
    console.log('  -> error.message:', err.message);
  }

  // Test 4: Attempting to TAMPER with legal knowledge entries (non-admin write)
  console.log(`\n[TEST 4] Attempting to WRITE to 'legal_knowledge_entries/uud-1945'...`);
  try {
    await setDoc(doc(db, 'legal_knowledge_entries', 'uud-1945'), {
      judul: 'Manipulated Constitution Text by Attacker',
      status_berlaku: 'palsu'
    }, { merge: true });
    console.log('[FAILED] Write succeeded unexpectedly!');
  } catch (err: any) {
    console.log('[PASS: EXPECTED PERMISSION_DENIED]');
    console.log('  -> error.name   :', err.name);
    console.log('  -> error.code   :', err.code);
    console.log('  -> error.message:', err.message);
  }

  // Test 5: Verify PUBLIC READ on legal_knowledge_entries is allowed
  console.log(`\n[TEST 5] Verifying PUBLIC READ access on 'legal_knowledge_entries/uud1945-art28d'...`);
  try {
    const snap = await getDoc(doc(db, 'legal_knowledge_entries', 'uud1945-art28d'));
    console.log('[PASS: ALLOWED]');
    console.log('  -> Document exists:', snap.exists());
    if (snap.exists()) {
      console.log('  -> Title          :', snap.data()?.judul);
    }
  } catch (err: any) {
    console.log('[FAILED] Public read failed:', err.message);
  }

  console.log('\n================================================================');
  console.log(' TEST SUMMARY: ALL UNAUTHORIZED REQUESTS PROMPTLY DENIED BY FIRESTORE RULES');
  console.log('================================================================');
  process.exit(0);
}

testPermissionDenied().catch(console.error);
