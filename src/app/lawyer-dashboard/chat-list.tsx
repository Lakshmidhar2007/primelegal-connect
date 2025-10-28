'use client';

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { ChatDialog } from '@/components/shared/chat-dialog';

function ChatListItem({ chat }: { chat: any }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Find the other participant's ID
  const otherParticipantId = chat.participants.find((p: string) => p !== user?.uid);

  const userDocRef = useMemoFirebase(() => {
    if (firestore && otherParticipantId) {
      return doc(firestore, 'users', otherParticipantId);
    }
    return null;
  }, [firestore, otherParticipantId]);

  const { data: otherUser, isLoading: isLoadingUser } = useDoc(userDocRef);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };
  
  if (isLoadingUser) {
      return (
         <div className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-8 w-20" />
        </div>
      )
  }

  if (!otherUser) return null;

  const fullName = `${(otherUser as any).firstName} ${(otherUser as any).lastName}`;
  const initials = `${(otherUser as any).firstName?.charAt(0)}${(otherUser as any).lastName?.charAt(0)}`;


  return (
    <>
      <div className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors">
        <Avatar className="h-12 w-12">
          <AvatarImage src={(otherUser as any).photoURL} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{fullName}</p>
        </div>
        <Button variant="outline" onClick={handleOpenChat}>
          {t('Open Chat')}
        </Button>
      </div>
      {isChatOpen && (
        <ChatDialog
          open={isChatOpen}
          onOpenChange={setIsChatOpen}
          lawyerId={user!.uid} // The current user is the lawyer
          userId={otherParticipantId} // The other participant is the user
          chatId={chat.id}
        />
      )}
    </>
  );
}


export function ChatList() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const chatsQuery = useMemoFirebase(() => {
    if (firestore && user) {
      return query(
        collection(firestore, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
    }
    return null;
  }, [firestore, user]);

  const { data: chats, isLoading } = useCollection(chatsQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('My Chats')}</CardTitle>
        <CardDescription>{t('Your conversations with clients.')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            {isLoading ? (
                Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                    </div>
                ))
            ) : chats && chats.length > 0 ? (
                chats.map((chat) => (
                    <ChatListItem key={chat.id} chat={chat} />
                ))
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    <p>{t('You have no active chats.')}</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
