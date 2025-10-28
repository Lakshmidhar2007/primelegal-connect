'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function AppointmentList() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const appointmentsQuery = useMemoFirebase(() => {
    if (firestore && user) {
      return query(
        collection(firestore, 'appointments'),
        where('lawyerId', '==', user.uid),
        where('status', '==', 'Available'),
        orderBy('dateTime', 'asc')
      );
    }
    return null;
  }, [firestore, user]);

  const { data: appointments, isLoading } = useCollection(appointmentsQuery);

  const handleDelete = async (appointmentId: string) => {
    if (!firestore) return;
    const confirmed = window.confirm(t('Are you sure you want to delete this appointment?'));
    if (confirmed) {
      try {
        const appointmentRef = doc(firestore, 'appointments', appointmentId);
        await deleteDoc(appointmentRef);
        toast({
          title: t('Appointment Deleted'),
          description: t('The appointment slot has been removed.'),
        });
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast({
          variant: 'destructive',
          title: t('Error'),
          description: t('Could not delete the appointment. Please try again.'),
        });
      }
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>{t('Your Upcoming Schedule')}</CardTitle>
        <CardDescription>{t('These are your available, unbooked appointment slots.')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('Date')}</TableHead>
              <TableHead>{t('Time')}</TableHead>
              <TableHead className="w-[100px] text-right">{t('Status')}</TableHead>
              <TableHead className="w-[80px] text-right">{t('Action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : appointments && appointments.length > 0 ? (
              appointments.map((appt: any) => (
                <TableRow key={appt.id}>
                  <TableCell>{format(new Date(appt.dateTime), 'PPP')}</TableCell>
                  <TableCell>{format(new Date(appt.dateTime), 'p')}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{t(appt.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(appt.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {t('No upcoming appointments scheduled.')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
