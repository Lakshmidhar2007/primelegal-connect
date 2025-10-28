'use client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LawyerProfileForm } from './lawyer-profile-form';
import { useTranslation } from '@/hooks/use-translation';

export default function LawyerDashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title={t("Lawyer Dashboard")}
        subtitle={t("Manage your professional profile and availability.")}
      />
      <div className="mt-12 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('Your Profile')}</CardTitle>
          </CardHeader>
          <CardContent>
            <LawyerProfileForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
