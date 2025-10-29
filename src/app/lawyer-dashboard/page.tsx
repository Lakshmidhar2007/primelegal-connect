'use client';

import { Suspense } from 'react';
import { LawyerProfileForm } from './lawyer-profile-form';
import { PageHeader } from '@/components/shared/page-header';
import { useTranslation } from '@/hooks/use-translation';
import { ClientCaseList } from './client-case-list';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import { useEffect, useState } from 'react';

function LawyerDashboard() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();
  const [cases, setCases] = useState<any[]>([]);
  const [areCasesLoading, setAreCasesLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      if (!firestore || !user) {
        setAreCasesLoading(false);
        return;
      }
      setAreCasesLoading(true);
      try {
        const casesQuery = query(collectionGroup(firestore, 'cases'), where('lawyerId', '==', user.uid));
        const querySnapshot = await getDocs(casesQuery);
        const fetchedCases = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
        // To get client full name, we might need to fetch user data separately
        const userIds = [...new Set(fetchedCases.map(c => c.userId))];
        const usersData: Record<string, any> = {};

        if (userIds.length > 0) {
            const usersQuery = query(collection(firestore, 'users'), where('id', 'in', userIds));
            const usersSnapshot = await getDocs(usersQuery);
            usersSnapshot.forEach(doc => {
                usersData[doc.id] = doc.data();
            });
        }
        
        const casesWithClientInfo = fetchedCases.map(c => ({
            ...c,
            fullName: usersData[c.userId] ? `${usersData[c.userId].firstName} ${usersData[c.userId].lastName}` : 'Unknown Client'
        }));

        setCases(casesWithClientInfo);

      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setAreCasesLoading(false);
      }
    };

    fetchCases();
  }, [firestore, user]);


  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title={t('Lawyer Dashboard')}
        subtitle={t('Manage your profile and client cases.')}
      />
      <div className="mt-12 grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClientCaseList cases={cases} isLoading={areCasesLoading} />
        </div>
        <div>
          <LawyerProfileForm />
        </div>
      </div>
    </div>
  );
}

export default function LawyerDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LawyerDashboard />
    </Suspense>
  )
}
    
