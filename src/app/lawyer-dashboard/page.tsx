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

  const casesQuery = useMemoFirebase(() => {
    if (firestore && user?.uid) {
      return query(
        collectionGroup(firestore, 'cases'),
        where('lawyerId', '==', user.uid)
      );
    }
    return null;
  }, [firestore, user?.uid]);

  const { data: cases, isLoading: areCasesLoading } = useCollection(casesQuery);
  const [casesWithClientInfo, setCasesWithClientInfo] = useState<any[]>([]);
  const [isClientInfoLoading, setIsClientInfoLoading] = useState(false);

  useEffect(() => {
    const fetchClientInfo = async () => {
      setIsClientInfoLoading(true);
      if (!cases || cases.length === 0 || !firestore) {
        setCasesWithClientInfo([]);
        setIsClientInfoLoading(false);
        return;
      }
      
      const userIds = [...new Set(cases.map(c => c.userId).filter(Boolean))];
      const usersData: Record<string, any> = {};

      if (userIds.length > 0) {
        const userChunks = [];
        for (let i = 0; i < userIds.length; i += 30) {
            userChunks.push(userIds.slice(i, i + 30));
        }
        
        await Promise.all(userChunks.map(async (chunk) => {
            if(chunk.length > 0) {
                const usersQuery = query(collection(firestore, 'users'), where('id', 'in', chunk));
                const usersSnapshot = await getDocs(usersQuery);
                usersSnapshot.forEach(doc => {
                    usersData[doc.id] = doc.data();
                });
            }
        }));
      }
      
      // The `fullName` for the client is now directly on the case document.
      // So no extra fetching is needed. We just use the data we already have.
      const enrichedCases = cases.map(caseItem => ({
        ...caseItem,
        fullName: caseItem.fullName || usersData[caseItem.userId]?.firstName + ' ' + usersData[caseItem.userId]?.lastName || 'Unknown Client'
      }));

      setCasesWithClientInfo(enrichedCases);
      setIsClientInfoLoading(false);
    };

    fetchClientInfo();
  }, [cases, firestore]);

  const isLoading = areCasesLoading || isClientInfoLoading;

  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title={t('Lawyer Dashboard')}
        subtitle={t('Manage your profile and client cases.')}
      />
      <div className="mt-12 grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClientCaseList cases={casesWithClientInfo} isLoading={isLoading} />
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