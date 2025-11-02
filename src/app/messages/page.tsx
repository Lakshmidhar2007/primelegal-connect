'use client';

import { Suspense } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '@/hooks/use-translation';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

type ChatItem = {
    id: string;
    lawyerId: string;
    userId: string;
    lastMessage: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    },
    lawyerName?: string;
    lawyerPhotoURL?: string;
}

function MessagesList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { t } = useTranslation();
    const [chatsWithLawyerInfo, setChatsWithLawyerInfo] = useState<ChatItem[]>([]);
    const [isLawyerInfoLoading, setIsLawyerInfoLoading] = useState(false);

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

    useEffect(() => {
        const fetchLawyerInfo = async () => {
            if (!chats || chats.length === 0 || !firestore) {
                setChatsWithLawyerInfo([]);
                return;
            }
            setIsLawyerInfoLoading(true);

            const lawyerIds = [...new Set(chats.map(c => c.lawyerId))];
            const lawyersData: Record<string, any> = {};

            if (lawyerIds.length > 0) {
                const lawyersQuery = query(collection(firestore, 'lawyer_profiles'), where('userId', 'in', lawyerIds));
                const lawyersSnapshot = await getDocs(lawyersQuery);
                lawyersSnapshot.forEach(doc => {
                    lawyersData[doc.id] = doc.data();
                });
            }

            const enrichedChats = chats.map(chat => ({
                ...chat,
                lawyerName: lawyersData[chat.lawyerId] ? `${lawyersData[chat.lawyerId].firstName} ${lawyersData[chat.lawyerId].lastName}` : 'Legal Expert',
                lawyerPhotoURL: lawyersData[chat.lawyerId]?.photoURL,
            }));

            setChatsWithLawyerInfo(enrichedChats);
            setIsLawyerInfoLoading(false);
        };

        fetchLawyerInfo();
    }, [chats, firestore]);

    const isListLoading = isLoading || isLawyerInfoLoading;

    return (
        <div className="container py-12 lg:py-16">
            <PageHeader title={t("Your Messages")} subtitle={t("All your conversations in one place.")} />
            <div className="mt-8 max-w-2xl mx-auto space-y-4">
                {isListLoading ? (
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
                ) : chatsWithLawyerInfo && chatsWithLawyerInfo.length > 0 ? (
                    chatsWithLawyerInfo.map(chat => (
                        <Link href={`/chat?id=${chat.id}`} key={chat.id}>
                            <Card className="hover:bg-muted/50 transition-colors">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={chat.lawyerPhotoURL} />
                                        <AvatarFallback>{chat.lawyerName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="font-semibold truncate">{t(chat.lawyerName || 'Legal Expert')}</h3>
                                        <p className="text-sm text-muted-foreground truncate">{t(chat.lastMessage)}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground shrink-0">
                                        {chat.createdAt ? formatDistanceToNow(new Date(chat.createdAt.seconds * 1000), { addSuffix: true }) : ''}
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
