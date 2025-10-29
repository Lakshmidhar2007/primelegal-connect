'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { useState } from 'react';
import { AuthDialog } from '../auth/auth-dialog';
import { AskQuestionDialog } from '../shared/ask-question-dialog';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

export function Lawyers() {
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

  const casesQuery = useMemoFirebase(() => {
    if (firestore && user) {
        return query(collection(firestore, 'cases'), where('userId', '==', user.uid));
    }
    return null;
  }, [firestore, user]);

  const { data: lawyers, isLoading } = useCollection(lawyersQuery);
  const {data: cases} = useCollection(casesQuery);


  const handleConnectClick = (lawyerId: string) => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
        const existingCase = cases?.find((c:any) => c.lawyerId === lawyerId && c.userId === user.uid);
        if (existingCase) {
             router.push(`/chat?id=${existingCase.id}`);
        } else {
            setSelectedLawyerId(lawyerId);
            setIsQuestionDialogOpen(true);
        }
    }
  };

  const getButtonState = (lawyerId: string) => {
    if (!user || !cases) return { text: t('Connect'), disabled: false };
    const existingCase = cases.find((c: any) => c.lawyerId === lawyerId && c.userId === user.uid);

    if (existingCase) {
        switch (existingCase.status) {
            case 'Submitted':
                return { text: t('Request Sent'), disabled: true };
            case 'Responded':
                return { text: t('Chat with Lawyer'), disabled: false };
            case 'Approved':
                return { text: t('Chat with Lawyer'), disabled: false };
            default:
                return { text: t('Connect'), disabled: false };
        }
    }
    return { text: t('Connect'), disabled: false };
};


  const handleDialogClose = (open: boolean) => {
    setIsQuestionDialogOpen(open);
    if (!open) {
        setSelectedLawyerId(null);
    }
  }


  return (
    <>
      <section className="container py-12 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-4xl md:text-5xl">
            {t('Meet Our Legal Experts')}
          </h2>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
            {t('A curated network of experienced professionals ready to assist you.')}
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden text-center bg-card/50 flex flex-col">
                <CardHeader className="p-6">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))
          ) : lawyers && lawyers.length > 0 ? (
            lawyers.map((lawyer: any) => {
                const { text, disabled } = getButtonState(lawyer.id);
                return (
                    <Card key={lawyer.id} className="overflow-hidden text-center bg-card/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col">
                        <CardHeader className="p-6 flex-grow-0">
                        <Avatar className="h-24 w-24 mx-auto">
                            <AvatarImage src={lawyer.photoURL} />
                            <AvatarFallback>
                            {lawyer.firstName?.charAt(0)}
                            {lawyer.lastName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                        <CardTitle className="font-headline text-xl">{lawyer.firstName} {lawyer.lastName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{t(lawyer.specialty || 'Legal Professional')}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                        <Button asChild variant="outline" className="w-full">
                            <Link href={`/lawyers/profile?id=${lawyer.id}`}>{t('View Profile')}</Link>
                        </Button>
                        <Button variant="default" className="w-full" onClick={() => handleConnectClick(lawyer.id)} disabled={disabled}>
                            {text}
                        </Button>
                        </CardFooter>
                    </Card>
                )
            })
          ) : (
            <div className="text-center mt-12 col-span-4">
              <p className="text-muted-foreground">{t('No lawyers have registered on the platform yet. Please check back later.')}</p>
            </div>
          )}
        </div>
      </section>
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
    