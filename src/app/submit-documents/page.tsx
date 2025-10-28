'use client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentForm } from './document-form';
import { useTranslation } from '@/hooks/use-translation';

export default function SubmitDocumentsPage() {
  const { t } = useTranslation();
  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title={t("File a New Case")}
        subtitle={t("Submit the details of your case and any relevant documents through our secure portal. Your privacy and security are our top priorities.")}
      />
      <div className="mt-12 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t("Case Submission Form")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
