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
    };
    otherUserName?: string;
    otherUserPhotoURL?: string;
}

function MessagesList() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { t } = useTranslation();
    const [combinedChats, setCombinedChats] = useState<ChatItem[]>([]);
    const [otherUsersInfo, setOtherUsersInfo] = useState<Record<string, any>>({});
    const [isInfoLoading, setIsInfoLoading] = useState(false);

    const userChatsQuery = useMemoFirebase(() => {
        if (firestore && user?.uid) {
            return query(collection(firestore, 'chats'), where('userId', '==', user.uid));
        }
        return null;
    }, [firestore, user?.uid]);

    const lawyerChatsQuery = useMemoFirebase(() => {
        if (firestore && user?.uid) {
            return query(collection(firestore, 'chats'), where('lawyerId', '==', user.uid));
        }
        return null;
    }, [firestore, user?.uid]);

    const { data: userChats, isLoading: isUserChatsLoading } = useCollection<ChatItem>(userChatsQuery);
    const { data: lawyerChats, isLoading: isLawyerChatsLoading } = useCollection<ChatItem>(lawyerChatsQuery);

    useEffect(() => {
        const allChats = [...(userChats || []), ...(lawyerChats || [])];
        const uniqueChats = Array.from(new Map(allChats.map(chat => [chat.id, chat])).values());
        uniqueChats.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setCombinedChats(uniqueChats);
    }, [userChats, lawyerChats]);

    useEffect(() => {
        const fetchOtherUsersInfo = async () => {
            if (combinedChats.length === 0 || !firestore || !user) return;
            
            setIsInfoLoading(true);

            const otherUserIds = combinedChats.map(chat => chat.userId === user.uid ? chat.lawyerId : chat.userId);
            const uniqueOtherUserIds = [...new Set(otherUserIds)];
            
            const usersData: Record<string, any> = {};

            if(uniqueOtherUserIds.length > 0) {
                // Fetch from both users and lawyer_profiles collections
                const userProfilesQuery = query(collection(firestore, 'users'), where('id', 'in', uniqueOtherUserIds));
                const lawyerProfilesQuery = query(collection(firestore, 'lawyer_profiles'), where('userId', 'in', uniqueOtherUserIds));

                const [userProfilesSnapshot, lawyerProfilesSnapshot] = await Promise.all([
                    getDocs(userProfilesQuery),
                    getDocs(lawyerProfilesQuery)
                ]);

                userProfilesSnapshot.forEach(doc => {
                    usersData[doc.id] = doc.data();
                });
                lawyerProfilesSnapshot.forEach(doc => {
                    // lawyer_profiles data is generally more public and complete for lawyers
                    usersData[doc.data().userId] = { ...usersData[doc.data().userId], ...doc.data() };
                });
            }
            
            setOtherUsersInfo(usersData);
            setIsInfoLoading(false);
        };

        fetchOtherUsersInfo();
    }, [combinedChats, firestore, user]);

    const isListLoading = isUserLoading || isUserChatsLoading || isLawyerChatsLoading || isInfoLoading;

    const getOtherUserInfo = (chat: ChatItem) => {
        if (!user) return { name: '...', photoURL: '' };
        const otherId = chat.userId === user.uid ? chat.lawyerId : chat.userId;
        const otherUser = otherUsersInfo[otherId];
        return {
            name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : t('Legal Expert'),
            photoURL: otherUser?.photoURL
        };
    };

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
                ) : combinedChats && combinedChats.length > 0 ? (
                    combinedChats.map(chat => {
                        const { name, photoURL } = getOtherUserInfo(chat);
                        const otherId = chat.userId === user?.uid ? chat.lawyerId : chat.userId;
                        const otherUser = otherUsersInfo[otherId];

                        return (
                            <Link href={`/chat?id=${chat.id}`} key={chat.id}>
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={photoURL} />
                                            <AvatarFallback>{name?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <h3 className="font-semibold truncate">{t(name)}</h3>
                                            <p className="text-sm text-muted-foreground truncate">{t(chat.lastMessage)}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground shrink-0">
                                            {chat.createdAt ? formatDistanceToNow(new Date(chat.createdAt.seconds * 1000), { addSuffix: true }) : ''}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })
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
