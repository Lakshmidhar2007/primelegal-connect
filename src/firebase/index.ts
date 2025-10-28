'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    return getSdks(getApp());
  }

  let firebaseApp;
  // In a production environment, Firebase App Hosting integrates with initializeApp()
  // to provide the necessary environment variables.
  if (process.env.NODE_ENV === 'production') {
    try {
      // Attempt to initialize via App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      console.warn('Automatic Firebase initialization failed. Falling back to firebaseConfig.', e);
      // Fallback to config object if automatic initialization fails even in production
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    // In development, always use the explicit firebaseConfig.
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}


export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
