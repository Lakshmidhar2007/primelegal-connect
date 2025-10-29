'use client';

import { Suspense } from 'react';
import { LawyerProfileForm } from './lawyer-profile-form';
import { PageHeader } from '@/components/shared/page-header';
import { useTranslation } from '@/hooks/use-translation';
import { ClientCaseList } from './client-case-list';
import { useUser, useFirestore } from '@/firebase';
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
        // This is a collection group query to get all cases assigned to the current lawyer
        const casesQuery = query(collectionGroup(firestore, 'cases'), where('lawyerId', '==', user.uid));
        const querySnapshot = await getDocs(casesQuery);
        
        const fetchedCases = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            userId: doc.ref.parent.parent?.id // Get the userId from the path
        }));

        const userIds = [...new Set(fetchedCases.map(c => c.userId).filter(Boolean))];
        const usersData: Record<string, any> = {};

        if (userIds.length > 0) {
            // Fetch user documents to get client names
             for (let i = 0; i < userIds.length; i += 10) {
                const batch = userIds.slice(i, i + 10);
                const usersQuery = query(collection(firestore, 'users'), where('id', 'in', batch));
                const usersSnapshot = await getDocs(usersQuery);
                usersSnapshot.forEach(doc => {
                    usersData[doc.id] = doc.data();
                });
            }
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
    