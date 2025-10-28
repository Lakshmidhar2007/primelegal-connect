'use client';

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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Expert Assigned':
      return 'default';
    case 'In Review':
      return 'secondary';
    case 'Resolved':
      return 'outline';
    case 'Submitted':
        return 'default'
    default:
      return 'secondary';
  }
};

export default function CaseTrackingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const casesQuery = useMemoFirebase(() => {
    if (firestore && user) {
      return query(collection(firestore, 'users', user.uid, 'cases'), orderBy('submitted', 'desc'));
    }
    return null;
  }, [firestore, user]);

  const { data: cases, isLoading: areCasesLoading } = useCollection(casesQuery);
  const isLoading = isUserLoading || areCasesLoading;

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
                  <TableHead>Subject</TableHead>
                  <TableHead className="w-[200px]">Date Submitted</TableHead>
                  <TableHead className="w-[180px] text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : cases && cases.length > 0 ? (
                  cases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{(caseItem as any).caseSubject}</TableCell>
                      <TableCell>{format(new Date((caseItem as any).submitted), 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={getStatusVariant((caseItem as any).status) as any}>
                          {(caseItem as any).status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                            You have not submitted any cases yet.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
