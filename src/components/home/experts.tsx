'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useState } from 'react';
import { AskQuestionDialog } from '../shared/ask-question-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Static data for placeholder experts
const placeholderExperts = [
  {
    id: '1',
    firstName: 'Jessica',
    lastName: 'Chen',
    photoURL: PlaceHolderImages.find(img => img.id === 'expert1')?.imageUrl,
    specialty: 'Corporate Law',
  },
  {
    id: '2',
    firstName: 'David',
    lastName: 'Rodriguez',
    photoURL: PlaceHolderImages.find(img => img.id === 'expert2')?.imageUrl,
    specialty: 'Intellectual Property',
  },
  {
    id: '3',
    firstName: 'Samantha',
    lastName: 'Carter',
    photoURL: PlaceHolderImages.find(img => img.id === 'expert3')?.imageUrl,
    specialty: 'Family Law',
  },
  {
    id: '4',
    firstName: 'Michael',
    lastName: 'Benford',
    photoURL: PlaceHolderImages.find(img => img.id === 'expert4')?.imageUrl,
    specialty: 'Criminal Defense',
  },
];


export function Experts() {
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);

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
        {placeholderExperts.map((expert, i) => (
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
                        <Link href={`#`}>View Profile</Link>
                    </Button>
                    <Button variant="default" className="w-full" onClick={() => setIsQuestionDialogOpen(true)}>Connect</Button>
                </CardFooter>
            </Card>
          ))}
      </div>
       <div className="text-center mt-12">
            <p className="text-muted-foreground">More experts will be available soon. The feature to view dynamic lawyer profiles is currently under development.</p>
        </div>
    </section>
    <AskQuestionDialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen} />
    </>
  );
}
