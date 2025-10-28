import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const cases = [
  {
    id: 'CASE-001',
    subject: 'Landlord-Tenant Security Deposit Dispute',
    submitted: '2024-05-20',
    status: 'Expert Assigned',
  },
  {
    id: 'CASE-002',
    subject: 'Review of Employment Contract Terms',
    submitted: '2024-05-18',
    status: 'In Review',
  },
  {
    id: 'CASE-003',
    subject: 'Intellectual Property Trademark Application',
    submitted: '2024-05-15',
    status: 'Initial Filing',
  },
  {
    id: 'CASE-004',
    subject: 'Child Custody Agreement Modification',
    submitted: '2024-05-12',
    status: 'Resolved',
  },
  {
    id: 'CASE-005',
    subject: 'Small Business Incorporation',
    submitted: '2024-05-10',
    status: 'Documents Submitted',
  },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Expert Assigned':
      return 'default';
    case 'In Review':
      return 'secondary';
    case 'Resolved':
      return 'outline';
    default:
      return 'secondary';
  }
};

export default function CaseTrackingPage() {
  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title="Case Tracking"
        subtitle="Stay updated on the real-time progress of your legal matters. Here is an overview of your active and past cases."
      />
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Your Cases</CardTitle>
            <CardDescription>
              A summary of all your submitted cases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Case ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-[150px]">Date Submitted</TableHead>
                  <TableHead className="w-[180px] text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">{caseItem.id}</TableCell>
                    <TableCell>{caseItem.subject}</TableCell>
                    <TableCell>{caseItem.submitted}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusVariant(caseItem.status) as any}>
                        {caseItem.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
