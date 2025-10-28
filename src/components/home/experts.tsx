'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useState } from 'react';
import { AskQuestionDialog } from '../shared/ask-question-dialog';

type Lawyer = {
    id: string;
    firstName?: string;
    lastName?: string;
    photoURL?: string;
    specialty?: string;
};

export function Experts() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);

  const lawyersQuery = useMemoFirebase(() => {
    // Only fetch lawyers if a user is logged in.
    if (firestore && user) {
      return query(collection(firestore, 'lawyers'));
    }
    return null;
  }, [firestore, user]);

  const { data: lawyers, isLoading } = useCollection<Lawyer>(lawyersQuery);

  const showLoading = isLoading || !firestore || !user;

  return (
    <>
    <section className="container py-12 lg:py-24">
      <div className="mx-auto max-w-3xl text-center animate-fade-in" style={{ animationDelay: '700ms' }}>
        <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-4xl md:text-5xl">
          Meet Our Legal Experts
        </h2>
        <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
          A curated network of experienced professionals ready to assist you.
        </p>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {showLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden text-center">
                <CardHeader className="p-0">
                    <Skeleton className="aspect-square w-full" />
                </CardHeader>
                <CardContent className="p-4">
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
          lawyers.map((expert, i) => (
            <Card key={expert.id} className="overflow-hidden text-center bg-card/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up flex flex-col" style={{animationDelay: `${800 + 150 * i}ms`}}>
                <CardHeader className="p-6 flex-grow-0">
                    <Avatar className="h-24 w-24 mx-auto">
                        <AvatarImage src={expert.photoURL} />
                        <AvatarFallback>
                            {expert.firstName?.charAt(0)}
                            {expert.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                    <CardTitle className="font-headline text-xl">{expert.firstName} {expert.lastName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{expert.specialty || 'Legal Professional'}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/lawyers/${expert.id}`}>View Profile</Link>
                    </Button>
                    <Button variant="default" className="w-full" onClick={() => setIsQuestionDialogOpen(true)}>Connect</Button>
                </CardFooter>
            </Card>
          ))
        ) : (
            <p className="col-span-full text-center text-muted-foreground">
              {user ? 'No lawyers have registered yet.' : 'Please log in to see our legal experts.'}
            </p>
        )}
      </div>
    </section>
    <AskQuestionDialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen} />
    </>
  );
}
