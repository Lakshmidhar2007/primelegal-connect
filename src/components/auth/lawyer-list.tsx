'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { useState } from 'react';
import { AskQuestionDialog } from '../shared/ask-question-dialog';
import { AuthDialog } from './auth-dialog';
import { useRouter } from 'next/navigation';

type LawyerListProps = {
    isConnectMode?: boolean;
}

export function LawyerList({ isConnectMode = false }: LawyerListProps) {
  const firestore = useFirestore();
  const { t } = useTranslation();
  const { user } = useUser();
  const router = useRouter();

  const [selectedLawyerId, setSelectedLawyerId] = useState<string | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const lawyersQuery = useMemoFirebase(() => {
    if (firestore) {
      return query(collection(firestore, 'lawyer_profiles'));
    }
    return null;
  }, [firestore]);

  const { data: lawyers, isLoading } = useCollection(lawyersQuery);

  const handleConnectClick = (lawyerId: string) => {
    if (!user) {
        setIsAuthOpen(true);
        return;
    }

    if (isConnectMode) {
      const form = document.querySelector('form');
      if (form) {
        // You might want to pass lawyerId to the form here
        // For now, we'll just show the dialog
        setIsQuestionDialogOpen(true);
        setSelectedLawyerId(lawyerId);
      }
    } else {
       router.push(`/submit-documents?lawyerId=${lawyerId}`);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsQuestionDialogOpen(open);
    if (!open) {
        setSelectedLawyerId(null);
    }
  }


  return (
    <>
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : lawyers && lawyers.length > 0 ? (
        lawyers.map((lawyer: any) => (
          <Card key={lawyer.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={lawyer.photoURL} />
                <AvatarFallback>
                  {lawyer.firstName?.charAt(0)}
                  {lawyer.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{lawyer.firstName} {lawyer.lastName}</h3>
                <p className="text-sm text-muted-foreground">{t(lawyer.specialty || 'Legal Professional')}</p>
              </div>
              {isConnectMode ? (
                 <Button onClick={() => handleConnectClick(lawyer.id)}>{t('Select')}</Button>
              ) : (
                <Button asChild variant="outline">
                    <Link href={`/lawyers/profile?id=${lawyer.id}`}>{t('View')}</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-12">
          <p>{t('No lawyers have registered yet. Be the first!')}</p>
        </div>
      )}
    </div>
    {isQuestionDialogOpen && selectedLawyerId && (
        <AskQuestionDialog
          open={isQuestionDialogOpen}
          onOpenChange={handleDialogClose}
          lawyerId={selectedLawyerId}
        />
      )}
      <AuthDialog open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  );
}
