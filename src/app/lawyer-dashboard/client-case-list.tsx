'use client';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type ClientCaseListProps = {
  cases: any[];
  isLoading: boolean;
};

export function ClientCaseList({ cases, isLoading }: ClientCaseListProps) {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const router = useRouter();


  const handleApprove = (caseId: string) => {
    if (!firestore) return;
    const caseRef = doc(firestore, 'cases', caseId);
    setDocumentNonBlocking(caseRef, { status: 'Approved' }, { merge: true });
    toast({
        title: t('Case Approved'),
        description: t('The client has been notified.'),
    });
  }

  const handleChat = (caseId: string) => {
    router.push(`/chat?id=${caseId}`);
  }
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Client Cases')}</CardTitle>
        <CardDescription>{t("Incoming requests from clients.")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Client')}</TableHead>
              <TableHead>{t('Submitted')}</TableHead>
              <TableHead>{t('Status')}</TableHead>
              <TableHead className="text-right">{t('Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                   <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : cases && cases.length > 0 ? (
                cases.map((caseItem: any) => (
                    <TableRow key={caseItem.id}>
                    <TableCell>{caseItem.fullName}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(caseItem.submittedAt), { addSuffix: true })}</TableCell>
                    <TableCell>
                        <Badge variant={caseItem.status === 'Approved' ? 'default' : 'secondary'}>{t(caseItem.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        {caseItem.status === 'Submitted' && (
                            <Button onClick={() => handleApprove(caseItem.id)}>{t('Approve')}</Button>
                        )}
                        {caseItem.status === 'Approved' && (
                             <Button variant="outline" onClick={() => handleChat(caseItem.id)}>{t('Chat')}</Button>
                        )}
                    </TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                    {t('You have no client cases.')}
                    </TableCell>
                </TableRow>
            )}
            
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
