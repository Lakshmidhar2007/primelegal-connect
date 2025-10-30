'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection, useUser, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, Timestamp, serverTimestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { v4 as uuidv4 } from 'uuid';

const chatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderType: 'user' | 'lawyer';
  timestamp: Timestamp;
};

function ChatRoom() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const messagesQuery = useMemoFirebase(() => {
    if (firestore && chatId) {
      return query(collection(firestore, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    }
    return null;
  }, [firestore, chatId]);

  const { data: messages } = useCollection<ChatMessage>(messagesQuery);
  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof chatSchema>) => {
    if (!chatId || !user || !firestore) return;

    const messagesRef = collection(firestore, 'chats', chatId, 'messages');
    const newMessage = {
      id: uuidv4(),
      text: values.message,
      senderId: user.uid,
      senderType: 'user' as 'user' | 'lawyer', // Assume sender is always a user for this form
      timestamp: serverTimestamp(),
    };
    
    await addDocumentNonBlocking(messagesRef, newMessage);
    form.reset();
  };

  return (
    <div className="container py-12 lg:py-16">
      <PageHeader title={t("Chat Room")} subtitle={t("Communicate with your legal expert.")} />
      <Card className="mt-8">
        <CardContent className="p-0">
          <div className="p-6 h-[600px] overflow-y-auto flex flex-col space-y-4">
            {messages?.map((msg) => {
              const isSender = msg.senderId === user?.uid;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex items-end gap-2',
                    isSender ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isSender && (
                    <Avatar className="h-8 w-8">
                      {/* You can add lawyer's avatar logic here */}
                      <AvatarFallback>L</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-xs md:max-w-md rounded-lg px-4 py-2',
                      isSender
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm">{t(msg.text)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="flex-grow">
                      <FormControl>
                        <Input placeholder={t("Type your message...")} {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" size="icon">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div>{('Loading...')}</div>}>
            <ChatRoom />
        </Suspense>
    )
}
