'use client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScheduleForm } from './schedule-form';
import { useTranslation } from '@/hooks/use-translation';
import { AppointmentList } from './appointment-list';
import { ClientCaseList } from './client-case-list';

export default function MakeSchedulePage() {
  const { t } = useTranslation();
  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title={t('Lawyer Dashboard')}
        subtitle={t('Manage your schedule and client cases.')}
      />
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{t('Create Appointment Slot')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleForm />
            </CardContent>
          </Card>
          <AppointmentList />
        </div>
        <div>
            <ClientCaseList />
        </div>
      </div>
    </div>
  );
}
    