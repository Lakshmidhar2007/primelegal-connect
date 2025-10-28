'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { Linkedin, Link as LinkIcon, Briefcase, User, Calendar, Flag } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { format } from 'date-fns';
import { ChatDialog } from '@/components/shared/chat-dialog';

function LawyerProfile() {
  const searchParams = useSearchParams();
  const lawyerId = searchParams.get('id');
  const firestore = useFirestore();
  const { t } = useTranslation();
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);

  const lawyerDocRef = useMemoFirebase(() => {
    if (firestore && lawyerId) {
      return doc(firestore, 'lawyer_profiles', lawyerId);
    }
    return null;
  }, [firestore, lawyerId]);

  const { data: lawyer, isLoading } = useDoc(lawyerDocRef);

  if (isLoading) {
    return <LawyerProfileSkeleton />;
  }
  
  if (!lawyer) {
    return (
      <div className="container py-12 lg:py-24 text-center">
        <PageHeader title={t("Lawyer Not Found")} subtitle={t("The profile you are looking for does not exist.")} />
      </div>
    );
  }

  const fullName = `${(lawyer as any).firstName} ${(lawyer as any).lastName}`;
  const initials = `${(lawyer as any).firstName?.charAt(0)}${(lawyer as any).lastName?.charAt(0)}`;
  const dateOfBirth = (lawyer as any).dateOfBirth ? new Date((lawyer as any).dateOfBirth) : null;


  return (
    <>
    <div className="container py-12 lg:py-24">
        <div className="mx-auto max-w-4xl">
            <PageHeader title={fullName} subtitle={t((lawyer as any).specialty || 'Legal Professional')} />
            <Card className="mt-12">
                <CardHeader className="items-center text-center border-b pb-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={(lawyer as any).photoURL} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="mt-4 font-headline text-3xl">{fullName}</CardTitle>
                    <p className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4" />{t((lawyer as any).specialty || "Not specified")}</p>
                </CardHeader>
                <CardContent className="mt-6 grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2">
                        {(lawyer as any).bio && (
                            <div>
                                <h3 className="text-lg font-semibold font-headline flex items-center gap-2"><User className="h-5 w-5" />{t('About')} {(lawyer as any).firstName}</h3>
                                <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{t((lawyer as any).bio)}</p>
                            </div>
                        )}
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="text-lg font-semibold font-headline">{t('Additional Details')}</h3>
                            <ul className="mt-2 space-y-2 text-muted-foreground">
                                {dateOfBirth && (
                                    <li className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{t('Born on')}: {format(dateOfBirth, 'PPP')}</span></li>
                                )}
                                {(lawyer as any).nationality && (
                                    <li className="flex items-center gap-2"><Flag className="h-4 w-4" /><span>{t('Nationality')}: {t((lawyer as any).nationality)}</span></li>
                                )}
                                {(lawyer as any).barCouncilNumber && (
                                     <li className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span>{t('Bar Council #')}: {(lawyer as any).barCouncilNumber}</span></li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold font-headline">{t('Details')}</h3>
                        <div className="mt-2 space-y-4">
                           {(lawyer as any).website && (
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href={(lawyer as any).website} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="mr-2 h-4 w-4" />
                                        {t('Website')}
                                    </Link>
                                </Button>
                            )}
                             {(lawyer as any).linkedin && (
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href={(lawyer as any).linkedin} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="mr-2 h-4 w-4" />
                                        {t('LinkedIn')}
                                    </Link>
                                </Button>
                            )}
                             <Button className="w-full" onClick={() => setIsChatDialogOpen(true)}>
                                {t('Connect Now')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
    {isChatDialogOpen && lawyerId && (
        <ChatDialog 
            open={isChatDialogOpen} 
            onOpenChange={setIsChatDialogOpen}
            lawyerId={lawyerId}
        />
    )}
    </>
  );
}

function LawyerProfileSkeleton() {
  return (
    <div className="container py-12 lg:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="space-y-2 text-center">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-1/3 mx-auto" />
        </div>
        <Card className="mt-12">
            <CardHeader className="items-center text-center border-b pb-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-8 w-48 mt-4" />
                <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="mt-6 grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function LawyerProfilePage() {
  return (
    <Suspense fallback={<LawyerProfileSkeleton />}>
      <LawyerProfile />
    </Suspense>
  );
}
