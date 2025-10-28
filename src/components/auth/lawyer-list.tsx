'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';

export function LawyerList() {
  const firestore = useFirestore();
  
  const lawyersQuery = useMemoFirebase(() => {
    if (firestore) {
      return collection(firestore, 'lawyer_profiles');
    }
    return null;
  }, [firestore]);

  const { data: lawyers, isLoading } = useCollection(lawyersQuery);

  return (
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
                <p className="text-sm text-muted-foreground">{lawyer.specialty || 'Legal Professional'}</p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/lawyers/profile/${lawyer.userId}`}>View</Link>
              </Button>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-12">
          <p>No lawyers have registered yet. Be the first!</p>
        </div>
      )}
    </div>
  );
}
