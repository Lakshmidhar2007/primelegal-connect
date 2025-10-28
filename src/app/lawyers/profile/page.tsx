'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { Linkedin, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function LawyerProfilePage() {
  const lawyer = {
    firstName: 'Jane',
    lastName: 'Doe',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1080&auto=format&fit=crop&ixlib=rb-4.0.3',
    specialty: 'Corporate Law',
    bio: "Jane Doe is a seasoned corporate lawyer with over 15 years of experience advising startups and established companies. She specializes in mergers and acquisitions, venture capital financing, and corporate governance. Jane is passionate about helping entrepreneurs navigate the complex legal landscape and achieve their business goals. She is a dedicated advocate for her clients, known for her strategic thinking and practical approach.",
    website: 'https://example.com',
    linkedin: 'https://linkedin.com/in/janedoe-example',
  };

  const fullName = `${lawyer.firstName} ${lawyer.lastName}`;
  const initials = `${lawyer.firstName?.charAt(0)}${lawyer.lastName?.charAt(0)}`;

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
