'use client';

import React, { type ReactNode, useEffect, useState } from 'react';
import FirebaseProvider, { useAuth } from '@/firebase/provider';
import { firebaseApp, auth, firestore } from '@/lib/firebaseClient';
import { onAuthStateChanged } from 'firebase/auth';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

function AuthStateGate({ children }: { children: React.ReactNode }) {
    const authInstance = useAuth();
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
            if (!authReady) {
                setAuthReady(true);
            }
        });
        return unsubscribe;
    }, [authInstance, authReady]);

    if (!authReady) {
        return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
    }
    
    return <>{children}</>;
}


export default function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
        <AuthStateGate>
            {children}
        </AuthStateGate>
    </FirebaseProvider>
  );
}
