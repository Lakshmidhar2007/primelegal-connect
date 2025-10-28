'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { Linkedin, Link as LinkIcon, Briefcase, User, Calendar, Flag } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';
import { format } from 'date-fns';

function LawyerProfile() {
  const searchParams = useSearchParams();
  const lawyerId = searchParams.get('id');
  const firestore = useFirestore();
  const { t } = useTranslation();

  const lawyerProfileRef = useMemoFirebase(() => {
    if (firestore && lawyerId) {
      return doc(firestore, 'lawyer_profiles', lawyerId);
    }
    return null;
  }, [firestore, lawyerId]);

  const userDocRef = useMemoFirebase(() => {
    if (firestore && lawyerId) {
      // The user document has the same ID as the lawyer profile
      return doc(firestore, 'users', lawyerId);
    }
    return null;
  }, [firestore, lawyerId]);

  const { data: lawyerProfile, isLoading: isLoadingProfile } = useDoc(lawyerProfileRef);
  const { data: userProfile, isLoading: isLoadingUser } = useDoc(userDocRef);

  const isLoading = isLoadingProfile || isLoadingUser;

  if (isLoading) {
    return <LawyerProfileSkeleton />;
  }

  if (!lawyerProfile) {
    return (
      <div className="container py-12 lg:py-24 text-center">
        <PageHeader title={t("Lawyer Not Found")} subtitle={t("The profile you are looking for does not exist.")} />
      </div>
    );
  }

  const lawyer = { ...(lawyerProfile as any), ...(userProfile as any) };

  const fullName = `${lawyer.firstName} ${lawyer.lastName}`;
  const initials = `${lawyer.firstName?.charAt(0)}${lawyer.lastName?.charAt(0)}`;
  const dateOfBirth = lawyer.dateOfBirth ? new Date(lawyer.dateOfBirth) : null;


  return (
    <>
    <div className="container py-12 lg:py-24">
        <div className="mx-auto max-w-4xl">
            <PageHeader title={fullName} subtitle={t(lawyer.specialty || 'Legal Professional')} />
            <Card className="mt-12">
                <CardHeader className="flex flex-col md:flex-row items-center text-center md:text-left gap-6 border-b p-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={lawyer.photoURL} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <CardTitle className="font-headline text-3xl">{fullName}</CardTitle>
                        <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2"><Briefcase className="h-4 w-4" />{t(lawyer.specialty || "Not specified")}</p>
                    </div>
                </CardHeader>
                <CardContent className="mt-6 grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2">
                        {lawyer.bio && (
                            <div>
                                <h3 className="text-lg font-semibold font-headline flex items-center gap-2"><User className="h-5 w-5" />{t('About')} {lawyer.firstName}</h3>
                                <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{t(lawyer.bio)}</p>
                            </div>
                        )}
                        <div className="mt-6 pt-6 border-t">
                            <h3 className="text-lg font-semibold font-headline">{t('Additional Details')}</h3>
                            <ul className="mt-2 space-y-2 text-muted-foreground">
                                {dateOfBirth && (
                                    <li className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span>{t('Born on')}: {format(dateOfBirth, 'PPP')}</span></li>
                                )}
                                {lawyer.nationality && (
                                    <li className="flex items-center gap-2"><Flag className="h-4 w-4" /><span>{t('Nationality')}: {t(lawyer.nationality)}</span></li>
                                )}
                                {lawyer.barCouncilNumber && (
                                     <li className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span>{t('Bar Council #')}: {lawyer.barCouncilNumber}</span></li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold font-headline">{t('Details')}</h3>
                        <div className="mt-2 space-y-4">
                           {lawyer.website && (
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href={lawyer.website} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="mr-2 h-4 w-4" />
                                        {t('Website')}
                                    </Link>
                                </Button>
                            )}
                             {lawyer.linkedin && (
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href={lawyer.linkedin} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="mr-2 h-4 w-4" />
                                        {t('LinkedIn')}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
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
            <CardHeader className="flex flex-col md:flex-row items-center gap-6 border-b p-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-grow space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-32" />
                </div>
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
