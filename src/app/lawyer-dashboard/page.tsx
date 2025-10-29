'use client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import { ClientCaseList } from './client-case-list';
import { LawyerProfileForm } from './lawyer-profile-form';

export default function LawyerDashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title={t('Lawyer Dashboard')}
        subtitle={t('Manage your public profile and client cases.')}
      />
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t('Update Your Profile')}</CardTitle>
            </CardHeader>
            <CardContent>
              <LawyerProfileForm />
            </CardContent>
          </Card>
        </div>
        <div>
            <ClientCaseList />
        </div>
      </div>
    </div>
  );
}
