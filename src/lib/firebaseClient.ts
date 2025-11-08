'use client';
// src/lib/firebaseClient.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-8593361603-692e2",
  appId: "1:1046445083601:web:fbeb9fecb968d001de2ef0",
  apiKey: "AIzaSyAG0WkxynFzrsTMfvfkJ_S5hZxvMkA-FPc",
  authDomain: "studio-8593361603-692e2.firebaseapp.com",
};

let firebaseApp: FirebaseApp;
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
} else {
    firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);


export { firebaseApp, auth, firestore };
