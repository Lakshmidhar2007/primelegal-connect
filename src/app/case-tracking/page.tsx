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
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type Case = {
  caseSubject: string;
  submitted: string;
  status: string;
};

export default function CaseTrackingPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const casesCollectionRef = useMemoFirebase(() => {
    if (firestore && user) {
      return collection(firestore, 'users', user.uid, 'cases');
    }
    return null;
  }, [firestore, user]);

  const { data: cases, isLoading } = useCollection<Case>(casesCollectionRef);

  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title="Case Tracking"
        subtitle="Stay updated on the real-time progress of your legal matters."
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
                  <>
                    <TableRow>
                      <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-1/2 ml-auto" /></TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-1/2 ml-auto" /></TableCell>
                    </TableRow>
                  </>
                ) : cases && cases.length > 0 ? (
                  cases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.caseSubject}</TableCell>
                      <TableCell>{format(new Date(c.submitted), 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{c.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No cases have been filed yet.
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
