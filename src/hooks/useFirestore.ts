'use client';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { app } from '@/lib/firebaseClient'; // adjust path if needed

const db = getFirestore(app);

export function useFirestore(collectionName: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, collectionName));
      const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setData(docs);
      setLoading(false);
    };
    fetchData();
  }, [collectionName]);

  const addData = async (newDoc: any) => {
    await addDoc(collection(db, collectionName), newDoc);
  };

  return { data, loading, addData };
}
