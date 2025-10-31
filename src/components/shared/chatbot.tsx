'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { getChatbotResponse } from '@/actions/chatbot';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useTranslation } from '@/hooks/use-translation';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsLoading(true);
      getChatbotResponse({ history: [], message: "Introduce yourself." })
        .then(res => {
          if (res.success && res.data) {
            setMessages([{ role: 'model', content: res.data.response }]);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // Use a selector that works with ScrollArea's structure
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await getChatbotResponse({
        history: messages,
        message: input,
      });

      if (res.success && res.data) {
        const modelMessage: Message = { role: 'model', content: res.data.response };
        setMessages(prev => [...prev, modelMessage]);
      } else {
        const errorMessage: Message = {
          role: 'model',
          content: t('Sorry, something went wrong. Please try again.'),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'model',
        content: t('Sorry, something went wrong. Please try again.'),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="fixed top-4 left-4 z-50 h-16 w-16 rounded-full shadow-2xl animate-fade-in"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-8 w-8" />
        <span className="sr-only">{t('Open Chatbot')}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold font-headline flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {t('PrimeLegal AI')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-grow px-6" ref={scrollAreaRef}>
            <div className="space-y-6 pb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'model' && (
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex-shrink-0">
                      <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-sm rounded-xl px-4 py-3 text-sm shadow',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted rounded-bl-none'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{t(message.content)}</p>
                  </div>
                </div>
              ))}
               {isLoading && messages.length > 0 && (
                <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex-shrink-0">
                      <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-xl px-4 py-3 text-sm shadow rounded-bl-none">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <div className="relative">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t('Ask a legal question...')}
                className="pr-12 h-11"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">{t('Send')}</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
