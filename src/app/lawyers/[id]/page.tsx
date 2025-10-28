'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { Linkedin, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

type LawyerProfile = {
    firstName?: string;
    lastName?: string;
    photoURL?: string;
    specialty?: string;
    bio?: string;
    website?: string;
    linkedin?: string;
};

export default function LawyerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

  const lawyerDocRef = useMemoFirebase(() => {
    if (firestore && id) {
      return doc(firestore, 'users', id);
    }
    return null;
  }, [firestore, id]);

  const { data: lawyer, isLoading } = useDoc<LawyerProfile>(lawyerDocRef);

  const fullName = lawyer ? `${lawyer.firstName} ${lawyer.lastName}` : 'Legal Expert';
  const initials = lawyer ? `${lawyer.firstName?.charAt(0)}${lawyer.lastName?.charAt(0)}` : '';

  if (isLoading) {
    return (
      <div className="container py-12 lg:py-24">
        <div className="mx-auto max-w-4xl">
            <Skeleton className="h-12 w-1/2 mx-auto mb-4" />
            <Skeleton className="h-6 w-3/4 mx-auto mb-12" />
            <Card>
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-8 w-48 mt-4" />
                    <Skeleton className="h-5 w-32 mt-2" />
                </CardHeader>
                <CardContent className="mt-6 space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="container py-12 lg:py-24">
        <PageHeader title="Profile Not Found" subtitle="The lawyer you are looking for does not exist." />
      </div>
    );
  }

  return (
    <div className="container py-12 lg:py-24">
        <div className="mx-auto max-w-4xl">
            <PageHeader title={fullName} subtitle={lawyer.specialty || 'Legal Professional'} />
            <Card className="mt-12">
                <CardHeader className="items-center text-center border-b pb-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={lawyer.photoURL} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="mt-4 font-headline text-3xl">{fullName}</CardTitle>
                    <p className="text-muted-foreground">{lawyer.specialty}</p>
                </CardHeader>
                <CardContent className="mt-6 grid gap-8 md:grid-cols-3">
                    <div className="md:col-span-2">
                        {lawyer.bio && (
                            <div>
                                <h3 className="text-lg font-semibold font-headline">About {lawyer.firstName}</h3>
                                <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{lawyer.bio}</p>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold font-headline">Connect</h3>
                        <div className="mt-2 space-y-2">
                            {lawyer.website && (
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href={lawyer.website} target="_blank" rel="noopener noreferrer">
                                        <LinkIcon className="mr-2 h-4 w-4" />
                                        Website
                                    </Link>
                                </Button>
                            )}
                             {lawyer.linkedin && (
                                <Button asChild variant="outline" className="w-full justify-start">
                                    <Link href={lawyer.linkedin} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="mr-2 h-4 w-4" />
                                        LinkedIn
                                    </Link>
                                </Button>
                            )}
                             <Button className="w-full">
                                Connect Now
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
