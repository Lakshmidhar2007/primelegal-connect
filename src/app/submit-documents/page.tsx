'use client';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AskQuestionForm } from '@/components/shared/ask-question-form';
import { useTranslation } from '@/hooks/use-translation';
import { LawyerList } from '@/components/auth/lawyer-list';

export default function SubmitDocumentsPage() {
  const { t } = useTranslation();
  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title={t("File a New Case")}
        subtitle={t("Submit the details of your case to a lawyer of your choice through our secure portal. Your privacy is our top priority.")}
      />
      <div className="mt-12 max-w-4xl mx-auto">
         <div className="grid md:grid-cols-2 gap-12">
            <div>
                <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{t("Select a Lawyer")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <LawyerList isConnectMode={true} />
                </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{t("Case Submission Form")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <AskQuestionForm />
                </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
