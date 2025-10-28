'use client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScheduleForm } from './schedule-form';
import { useTranslation } from '@/hooks/use-translation';

export default function MakeSchedulePage() {
  const { t } = useTranslation();
  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title={t("Make Schedule")}
        subtitle={t("Set your availability for appointments.")}
      />
      <div className="mt-12 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('Create Appointment Slot')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
