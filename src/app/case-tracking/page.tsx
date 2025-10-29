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
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';

export default function CaseTrackingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const userCasesCollectionRef = useMemoFirebase(() => {
    if (firestore && user) {
      return collection(firestore, 'users', user.uid, 'cases');
    }
    return null;
  }, [firestore, user]);

  const { data: cases, isLoading: areCasesLoading } = useCollection(userCasesCollectionRef);

  const isLoading = isUserLoading || areCasesLoading;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'secondary';
      case 'In Review':
      case 'Approved':
        return 'default';
      case 'Resolved':
        return 'outline';
      default:
        return 'secondary';
    }
  };


  return (
    <div className="container py-12 lg:py-24">
      <PageHeader
        title={t("Case Tracking")}
        subtitle={t("Stay updated on the real-time progress of your legal matters.")}
      />
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>{t("Your Cases")}</CardTitle>
            <CardDescription>
              {t("A summary of all your submitted cases.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Subject")}</TableHead>
                  <TableHead className="w-[200px]">{t("Date Submitted")}</TableHead>
                  <TableHead className="w-[180px] text-right">{t("Status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-[100px] ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : cases && cases.length > 0 ? (
                  cases.map((caseItem: any) => (
                    <TableRow key={caseItem.caseId}>
                      <TableCell className="font-medium">{t(caseItem.caseSubject || caseItem.description)}</TableCell>
                      <TableCell>{format(new Date(caseItem.submitted || caseItem.submittedAt), 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={getStatusVariant(caseItem.status)}>{t(caseItem.status)}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      {t("No cases have been filed yet.")}
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
