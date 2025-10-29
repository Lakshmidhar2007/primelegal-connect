'use client';

import { Suspense } from 'react';
import { LawyerProfileForm } from './lawyer-profile-form';
import { PageHeader } from '@/components/shared/page-header';
import { useTranslation } from '@/hooks/use-translation';
import { ClientCaseList } from './client-case-list';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, collectionGroup } from 'firebase/firestore';

function LawyerDashboard() {
  const { t } = useTranslation();
  const { user } = useUser();
  const firestore = useFirestore();

  const casesQuery = useMemoFirebase(() => {
    if (firestore && user) {
      return query(collectionGroup(firestore, 'cases'), where('lawyerId', '==', user.uid));
    }
    return null;
  }, [firestore, user]);

  const { data: cases, isLoading: areCasesLoading } = useCollection(casesQuery);

  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title={t('Lawyer Dashboard')}
        subtitle={t('Manage your profile and client cases.')}
      />
      <div className="mt-12 grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClientCaseList cases={cases as any[]} isLoading={areCasesLoading} />
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
    
