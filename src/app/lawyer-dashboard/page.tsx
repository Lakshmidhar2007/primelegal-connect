
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LawyerProfileForm } from './lawyer-profile-form';

export default function LawyerDashboardPage() {
  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title="Lawyer Dashboard"
        subtitle="Manage your professional profile and availability."
      />
      <div className="mt-12 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <LawyerProfileForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
