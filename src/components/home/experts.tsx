'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useState } from 'react';
import { AskQuestionDialog } from '../shared/ask-question-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '../ui/skeleton';

const experts = PlaceHolderImages.filter(img => img.id.startsWith('expert'));

export function Experts() {
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  
  // For demonstration, we'll keep a loading state simulation
  const [isLoading, setIsLoading] = useState(true);
  useState(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  });


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
          {isLoading &&
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
            ))}

          {!isLoading && experts?.map((expert, i) => (
            <Card key={expert.id} className="overflow-hidden text-center bg-card/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up flex flex-col" style={{ animationDelay: `${800 + 150 * i}ms` }}>
              <CardHeader className="p-6 flex-grow-0">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={expert.imageUrl} />
                  <AvatarFallback>
                    LP
                  </AvatarFallback>
                </Avatar>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="font-headline text-xl">Legal Professional</CardTitle>
                <p className="text-sm text-muted-foreground">Specialized in Various Fields</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/lawyers/profile">View Profile</Link>
                </Button>
                <Button variant="default" className="w-full" onClick={() => setIsQuestionDialogOpen(true)}>Connect</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {!isLoading && (!experts || experts.length === 0) && (
            <div className="text-center mt-12">
                <p className="text-muted-foreground">No lawyers have registered on the platform yet. Please check back later.</p>
            </div>
        )}
      </section>
      <AskQuestionDialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen} />
    </>
  );
}
