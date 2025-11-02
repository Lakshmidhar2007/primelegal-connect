'use client';
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";

export default function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  if (!authReady) {
    return <div style={{ minHeight: "100vh" }}>Loading...</div>;
  }

  return <>{children}</>;
}
