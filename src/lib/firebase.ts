/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase client initialization with Firestore and Anonymous/Email Auth
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
const rawProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';

// Validate whether Firebase has actual credentials configured
export const isFirebaseConfigured = Boolean(
  rawApiKey &&
  rawApiKey.trim().length > 10 &&
  !rawApiKey.includes('placeholder') &&
  rawProjectId &&
  rawProjectId.trim().length > 0
);

const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: rawProjectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const firestoreDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID;

// Initialize Firebase App conditionally
export const app: FirebaseApp | null = isFirebaseConfigured
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

// Initialize Firestore with specific database ID if configured
export const db: Firestore | null = (isFirebaseConfigured && app)
  ? (firestoreDbId && firestoreDbId !== '(default)' ? getFirestore(app, firestoreDbId) : getFirestore(app))
  : null;

// Initialize Firebase Auth conditionally
export const auth: Auth | null = (isFirebaseConfigured && app)
  ? getAuth(app)
  : null;

export interface SessionUser {
  uid: string;
  isAnonymous?: boolean;
  email?: string | null;
}

/**
 * Ensures a valid Auth session exists.
 * If Firebase is configured, signs in via Firebase Anonymous Auth.
 * If not configured or offline, falls back gracefully to a deterministic local session
 * without throwing auth/invalid-api-key errors.
 */
export async function ensureFirebaseAuth(): Promise<SessionUser> {
  if (!isFirebaseConfigured || !auth) {
    let localUid = localStorage.getItem('rm_session_uid');
    if (!localUid) {
      localUid = 'usr_anon_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem('rm_session_uid', localUid);
    }
    return { uid: localUid, isAnonymous: true };
  }

  try {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err: any) {
    console.warn('Firebase Anonymous Auth fallback to local session:', err?.message || err);
    let localUid = localStorage.getItem('rm_session_uid');
    if (!localUid) {
      localUid = 'usr_anon_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem('rm_session_uid', localUid);
    }
    return { uid: localUid, isAnonymous: true };
  }
}
