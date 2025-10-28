'use client';
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getAIChatResponse } from '@/actions/chat';

type ChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lawyerId: string;
};

export function ChatDialog({ open, onOpenChange, lawyerId }: ChatDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [chatId, setChatId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const lawyerDocRef = useMemoFirebase(() => {
    if (firestore && lawyerId) {
      return doc(firestore, 'lawyer_profiles', lawyerId);
    }
    return null;
  }, [firestore, lawyerId]);
  const { data: lawyerProfile } = useDoc(lawyerDocRef);

  useEffect(() => {
    if (user && lawyerId) {
      const generatedChatId = [user.uid, lawyerId].sort().join('_');
      setChatId(generatedChatId);
    }
  }, [user, lawyerId]);

  const messagesQuery = useMemoFirebase(() => {
    if (firestore && chatId) {
      return query(collection(firestore, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    }
    return null;
  }, [firestore, chatId]);

  const { data: messages, isLoading } = useCollection(messagesQuery);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  const handleSendMessage = async () => {
    if (!message.trim() || !user || !chatId || !firestore) return;

    setIsSending(true);

    const messageData = {
      id: uuidv4(),
      text: message,
      senderId: user.uid,
      timestamp: serverTimestamp(),
    };
    
    const chatRef = doc(firestore, 'chats', chatId);
    const messagesRef = collection(chatRef, 'messages');

    try {
        const chatDoc = await getDoc(chatRef);
        if (!chatDoc.exists()) {
            await setDoc(chatRef, {
                participants: [user.uid, lawyerId],
                createdAt: serverTimestamp(),
            });
            
            const aiResponse = await getAIChatResponse({ lawyerName: (lawyerProfile as any)?.firstName || 'the lawyer' });
            if (aiResponse.success && aiResponse.data) {
                const aiMessage = {
                    id: uuidv4(),
                    text: aiResponse.data.response,
                    senderId: 'ai-bot',
                    timestamp: serverTimestamp(),
                };
                addDocumentNonBlocking(messagesRef, aiMessage);
            }
        }
        
        addDocumentNonBlocking(messagesRef, messageData);

        setMessage('');
    } catch (error) {
        console.error('Error sending message:', error);
    } finally {
        setIsSending(false);
    }
  };


  const getInitials = (name: string = '') => name.charAt(0).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-3">
             <Avatar>
                <AvatarImage src={(lawyerProfile as any)?.photoURL} />
                <AvatarFallback>{getInitials((lawyerProfile as any)?.firstName)}</AvatarFallback>
            </Avatar>
            {`${(lawyerProfile as any)?.firstName} ${(lawyerProfile as any)?.lastName}` || t('Lawyer')}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow p-4 overflow-y-auto">
           {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div> 
           : (messages || []).map((msg: any, index: number) => (
             <div key={index} className={cn("flex items-end gap-2 mb-4", msg.senderId === user?.uid ? "justify-end" : "justify-start")}>
                 {msg.senderId !== user?.uid && (
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={msg.senderId === 'ai-bot' ? undefined : (lawyerProfile as any)?.photoURL} />
                       <AvatarFallback>{msg.senderId === 'ai-bot' ? 'AI' : getInitials((lawyerProfile as any)?.firstName)}</AvatarFallback>
                    </Avatar>
                 )}
                 <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", msg.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted")}>
                   <p className="text-sm">{msg.text}</p>
                 </div>
             </div>
           ))}
           <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
                placeholder={t("Type a message...")}
            />
            <Button onClick={handleSendMessage} disabled={isSending}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
