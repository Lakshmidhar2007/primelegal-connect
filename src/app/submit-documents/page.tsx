import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentForm } from './document-form';

export default function SubmitDocumentsPage() {
  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title="Secure Document Submission"
        subtitle="Upload your case-related documents through our encrypted portal. Your privacy and security are our top priorities."
      />
      <div className="mt-12 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Upload Your Files</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
