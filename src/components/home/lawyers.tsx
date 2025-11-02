'use client';

import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
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
import { ArrowRight, MessageSquare, Check } from 'lucide-react';

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
        return query(collection(firestore, 'users', user.uid, 'cases'));
    }
    return null;
  }, [firestore, user]);

  const { data: lawyers, isLoading } = useCollection(lawyersQuery);
  const { data: cases } = useCollection(casesQuery);

  const handleConnectClick = (lawyerId: string) => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
        const existingCase = cases?.find((c:any) => c.lawyerId === lawyerId);
        if (existingCase) {
             router.push(`/chat?id=${existingCase.chatId}`);
        } else {
            setSelectedLawyerId(lawyerId);
            setIsQuestionDialogOpen(true);
        }
    }
  };

  const getButtonState = (lawyerId: string) => {
    if (!user || !cases) return { text: t('Connect'), icon: <ArrowRight className="ml-2 h-4 w-4" />, disabled: false, action: () => handleConnectClick(lawyerId) };
    const existingCase = cases.find((c: any) => c.lawyerId === lawyerId);

    if (existingCase && existingCase.status === 'Approved') {
      return { text: t('Chat'), icon: <MessageSquare className="ml-2 h-4 w-4" />, disabled: false, action: () => router.push(`/chat?id=${existingCase.chatId}`) };
    }
    if (existingCase) {
        return { text: t('Request Sent'), icon: <Check className="ml-2 h-4 w-4" />, disabled: true, action: () => {} };
    }
    return { text: t('Connect'), icon: <ArrowRight className="ml-2 h-4 w-4" />, disabled: false, action: () => handleConnectClick(lawyerId) };
  };

  const handleDialogClose = (open: boolean) => {
    setIsQuestionDialogOpen(open);
    if (!open) {
        setSelectedLawyerId(null);
    }
  }

  return (
    <>
      <section id="meet-experts" className="container py-12 lg:py-24 scroll-mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-4xl md:text-5xl">
            {t('Meet Our Legal Experts')}
          </h2>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
            {t('A curated network of experienced professionals ready to assist you.')}
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden text-center bg-card/50 flex flex-col rounded-2xl">
                <CardHeader className="p-6 items-center">
                  <Skeleton className="h-28 w-28 rounded-full" />
                </CardHeader>
                <CardContent className="p-6 pt-2 flex-grow">
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto mt-3" />
                </CardContent>
                <CardFooter className="p-4 flex flex-col gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))
          ) : lawyers && lawyers.length > 0 ? (
            lawyers.map((lawyer: any, i: number) => {
                const { text, icon, disabled, action } = getButtonState(lawyer.id);
                return (
                    <Card key={lawyer.id} className="overflow-hidden text-center bg-card/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col rounded-2xl animate-fade-in-up" style={{ animationDelay: `${150 * i}ms` }}>
                        <CardHeader className="p-6 items-center">
                          <Avatar className="h-28 w-28 border-4 border-primary/10">
                              <AvatarImage src={lawyer.photoURL} />
                              <AvatarFallback className="text-3xl">
                                {lawyer.firstName?.charAt(0)}
                                {lawyer.lastName?.charAt(0)}
                              </AvatarFallback>
                          </Avatar>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 flex-grow">
                          <CardTitle className="font-headline text-xl">{lawyer.firstName} {lawyer.lastName}</CardTitle>
                          <p className="text-sm text-primary font-medium mt-1">{t(lawyer.specialty || 'Legal Professional')}</p>
                        </CardContent>
                        <CardFooter className="p-4 flex flex-col gap-2">
                          <Button asChild variant="outline" className="w-full">
                              <Link href={`/lawyers/profile?id=${lawyer.id}`}>{t('View Profile')}</Link>
                          </Button>
                          <Button variant="default" className="w-full" onClick={action} disabled={disabled}>
                              {text} {icon}
                          </Button>
                        </CardFooter>
                    </Card>
                )
            })
          ) : (
            <div className="text-center mt-12 col-span-full">
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
