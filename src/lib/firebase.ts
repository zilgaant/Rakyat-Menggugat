/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firebase client initialization with Firestore and Anonymous/Email Auth
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously, User } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId || '',
};

const firestoreDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId;

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured
export const db: Firestore = firestoreDbId && firestoreDbId !== '(default)'
  ? getFirestore(app, firestoreDbId)
  : getFirestore(app);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

/**
 * Ensures a valid Firebase Auth session exists.
 * If not authenticated, automatically signs in using Firebase Anonymous Auth
 * to guarantee that request.auth.uid is populated for Firestore Security Rules.
 */
export async function ensureFirebaseAuth(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Firebase Anonymous Auth warning:', err);
    // If offline or network-blocked, fallback
    throw err;
  }
}
