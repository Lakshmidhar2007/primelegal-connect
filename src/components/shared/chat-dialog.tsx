'use client';
import { useState, useEffect, useRef }from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import { Loader2, Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { getAIChatResponse } from '@/actions/chat';

type ChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lawyerId: string;
  userId?: string; // Optional: can be passed in from lawyer dashboard
  chatId?: string; // Optional: can be passed in from lawyer dashboard
};

export function ChatDialog({ open, onOpenChange, lawyerId, userId: initialUserId, chatId: initialChatId }: ChatDialogProps) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const [chatId, setChatId] = useState<string | null>(initialChatId || null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { toast } = useToast();

  // Determine whose profile to fetch based on who is viewing the chat
  const profileId = currentUser?.uid === lawyerId ? initialUserId : lawyerId;

  const profileDocRef = useMemoFirebase(() => {
    if (firestore && profileId) {
        // If the current user is the lawyer, we fetch the other user's profile.
        // If the current user is the client, we fetch the lawyer's profile.
        const collectionName = currentUser?.uid === lawyerId ? 'users' : 'lawyer_profiles';
        return doc(firestore, collectionName, profileId);
    }
    return null;
  }, [firestore, profileId, currentUser?.uid, lawyerId]);
  const { data: profile } = useDoc(profileDocRef);


  useEffect(() => {
    // If a chat ID isn't provided, create a consistent one.
    if (!initialChatId && currentUser && lawyerId) {
      const generatedChatId = [currentUser.uid, lawyerId].sort().join('_');
      setChatId(generatedChatId);
    }
  }, [currentUser, lawyerId, initialChatId]);

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

  useEffect(() => {
    // When the dialog opens, check if it's a new chat and needs a welcome message.
    const initializeChat = async () => {
      if (open && chatId && firestore && profile) {
        const chatRef = doc(firestore, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);
        if (!chatDoc.exists()) {
          // This is a new chat, create the document and send the AI welcome message.
          const participants = [currentUser?.uid, lawyerId].sort();
           setDoc(chatRef, {
            participants,
            createdAt: serverTimestamp(),
          }).catch(error => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: chatRef.path,
                operation: 'write',
                requestResourceData: { participants }
             }));
          });
          
          // Call the server action to get the AI response and save it
          await getAIChatResponse({
              chatId: chatId,
              lawyerName: (profile as any).firstName || 'the lawyer',
          });
        }
      }
    };
    initializeChat();
  }, [open, chatId, firestore, profile, currentUser, lawyerId]);

  useEffect(scrollToBottom, [messages]);
  
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser || !chatId || !firestore) return;

    setIsSending(true);

    const messageData = {
      id: uuidv4(),
      text: message,
      senderId: currentUser.uid,
      senderType: 'user',
      timestamp: serverTimestamp(),
    };

    const messagesRef = collection(firestore, 'chats', chatId, 'messages');
    
    setMessage('');
    
    addDoc(messagesRef, messageData)
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: messagesRef.path,
            operation: 'create',
            requestResourceData: messageData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSending(false);
      });
  };


  const getInitials = (name: string = '') => name.charAt(0).toUpperCase();

  const profileName = `${(profile as any)?.firstName} ${(profile as any)?.lastName}` || t('Chat');


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-3">
             <Avatar>
                <AvatarImage src={(profile as any)?.photoURL} />
                <AvatarFallback>{getInitials((profile as any)?.firstName)}</AvatarFallback>
            </Avatar>
            {profileName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow p-4 overflow-y-auto">
           {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div> 
           : (messages || []).map((msg: any, index: number) => (
             <div key={msg.id || index} className={cn("flex items-end gap-2 mb-4", msg.senderId === currentUser?.uid ? "justify-end" : "justify-start")}>
                 {msg.senderId !== currentUser?.uid && (
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={msg.senderType === 'ai-bot' ? undefined : (profile as any)?.photoURL} />
                       <AvatarFallback>{msg.senderType === 'ai-bot' ? 'AI' : getInitials((profile as any)?.firstName)}</AvatarFallback>
                    </Avatar>
                 )}
                 <div className={cn(
                    "max-w-xs md:max-w-md p-3 rounded-lg", 
                    msg.senderId === currentUser?.uid ? "bg-primary text-primary-foreground" : "bg-muted",
                    msg.senderType === 'ai-bot' && "bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800"
                 )}>
                   <p className="text-sm">{t(msg.text)}</p>
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
                disabled={isSending}
            />
            <Button onClick={handleSendMessage} disabled={isSending || !message.trim()}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
    
