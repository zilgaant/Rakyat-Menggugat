/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Script: Seed initial Admin Reviewer document.
 * 
 * In accordance with the security rules, clients cannot self-promote to admin.
 * This script runs in a privileged backend environment (Firebase Admin SDK or CLI)
 * to seed the initial system administrator / legal curator.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

// Usage: npx tsx scripts/seed_admin.ts <ADMIN_UID> <ADMIN_EMAIL> [ROLE]
// Or via environment variables: ADMIN_UID, ADMIN_EMAIL, ADMIN_ROLE
async function seedAdmin() {
  const targetUid = process.argv[2] || process.env.ADMIN_UID;
  const targetEmail = process.argv[3] || process.env.ADMIN_EMAIL;
  const targetRole = process.argv[4] || process.env.ADMIN_ROLE || 'super_admin';

  if (!targetUid || !targetEmail) {
    console.error('Error: Admin UID and Email are required.');
    console.error('Usage: npx tsx scripts/seed_admin.ts <ADMIN_UID> <ADMIN_EMAIL> [ROLE]');
    console.error('Or set environment variables ADMIN_UID and ADMIN_EMAIL.');
    process.exit(1);
  }

  console.log('====================================================');
  console.log(' SEEDING INITIAL ADMIN REVIEWER TO FIRESTORE');
  console.log(' Target Project :', firebaseConfigJson.projectId);
  console.log(' Target Database:', firebaseConfigJson.firestoreDatabaseId || '(default)');
  console.log(' Admin UID      :', targetUid);
  console.log(' Admin Email    :', targetEmail);
  console.log(' Admin Role     :', targetRole);
  console.log('====================================================\n');

  // When run with service account or Application Default Credentials (ADC)
  if (!getApps().length) {
    initializeApp({
      projectId: firebaseConfigJson.projectId,
    });
  }

  const db = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
    ? getFirestore(firebaseConfigJson.firestoreDatabaseId)
    : getFirestore();

  const adminDocRef = db.collection('admin_reviewers').doc(targetUid);

  await adminDocRef.set({
    id: targetUid,
    email: targetEmail,
    role: targetRole,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }, { merge: true });

  console.log(`[SUCCESS] Admin document successfully seeded in 'admin_reviewers/${targetUid}'`);
  console.log('This UID will now evaluate isAdmin() === true in Firestore Security Rules.\n');
}

seedAdmin().catch((err) => {
  console.log('\n[NOTE] Running seed script requires Google Application Default Credentials (ADC) or Service Account:');
  console.log(err.message);
});
