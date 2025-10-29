'use client';

import { Suspense } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import { Skeleton } from '@/components/ui/skeleton';

type ChatItem = {
    id: string;
    lawyerId: string;
    userId: string;
    lastMessage: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    }
}

function MessagesList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { t } = useTranslation();

    const chatsQuery = useMemoFirebase(() => {
        if (firestore && user) {
            return query(
                collection(firestore, 'chats'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );
        }
        return null;
    }, [firestore, user]);

    const { data: chats, isLoading } = useCollection<ChatItem>(chatsQuery);

    return (
        <div className="container py-12 lg:py-16">
            <PageHeader title={t("Your Messages")} subtitle={t("All your conversations in one place.")} />
            <div className="mt-8 max-w-2xl mx-auto space-y-4">
                {isLoading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : chats && chats.length > 0 ? (
                    chats.map(chat => (
                        <Link href={`/chat?id=${chat.id}`} key={chat.id}>
                            <Card className="hover:bg-muted/50 transition-colors">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback>{/* Lawyer Initials */}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{t('Lawyer Name')}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{t(chat.lastMessage)}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(chat.createdAt.seconds * 1000), { addSuffix: true })}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <p>{t('You have no active conversations.')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}


export default function MessagesPage() {
    return (
        <Suspense fallback={<div>{('Loading messages...')}</div>}>
            <MessagesList />
        </Suspense>
    )
}
