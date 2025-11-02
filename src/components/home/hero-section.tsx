
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAIResponse } from '@/actions/query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, Loader2, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useUser } from '@/firebase';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { useTranslation } from '@/hooks/use-translation';
import { AIInitialQueryResponseOutput } from '@/ai/flows/ai-initial-query-response';

const formSchema = z.object({
  query: z.string().min(10, {
    message: 'Please describe your legal issue in at least 10 characters.',
  }),
});

type HeroSectionProps = {
  onAskQuestionClick?: () => void;
};

export function HeroSection({ onAskQuestionClick }: HeroSectionProps) {
  const [aiResponse, setAiResponse] = useState<AIInitialQueryResponseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, isUserLoading } = useUser();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        setShowAuthDialog(true);
        return;
    }

    setIsLoading(true);
    setAiResponse(null);
    setError(null);

    const result = await getAIResponse({ query: values.query });

    if (result.success && result.data) {
      setAiResponse(result.data);
    } else {
      setError(result.error || t('Failed to get a response.'));
    }

    setIsLoading(false);
  }
  
  const headlineText = t('Get Instant Legal Insights with AI');

  return (
    <>
      <section id="ask-ai" className="relative py-20 text-center lg:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-6xl animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="relative bg-muted/30 dark:bg-muted/20 rounded-3xl px-8 py-16 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <Image
                  src="/parliament.png"
                  alt="Indian Parliament background"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  className="opacity-[0.4] dark:opacity-[0.25]"
                  data-ai-hint="indian parliament"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background/60"></div>
              </div>
              <div className="relative z-10 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tighter font-headline sm:text-5xl md:text-6xl lg:text-7xl !leading-tight">
                  {headlineText.split(' ').map((word, index) => (
                    <span key={index} className="inline-block transition-transform duration-300 ease-out hover:scale-110 hover:text-primary">
                      {word}&nbsp;
                    </span>
                  ))}
                </h1>
                <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                  {t("Describe your legal issue, and our AI will provide initial analysis and guidance. It's the first step towards clarity and resolution.")}
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Card className="shadow-2xl bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl">
                  <Sparkles className="h-6 w-6 text-primary" />
                  {t('Ask Our AI Assistant')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="query"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder={t("e.g., 'I had a dispute with my landlord over the security deposit...'")}
                              className="min-h-[120px] resize-none text-base bg-background/70 rounded-lg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" size="lg" className="w-full text-lg font-semibold" disabled={isLoading || isUserLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('Analyzing...')}
                        </>
                      ) : (
                        <>
                          {t('Get AI Analysis')} <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {isLoading && (
              <Card className="mt-6 text-left shadow-2xl bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-xl">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    {t('AI Generated Insights')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                     <div className="space-y-2">
                      <Skeleton className="h-5 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                     <div className="space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                </CardContent>
              </Card>
            )}

            {error && (
                <div className="mt-6 text-destructive-foreground bg-destructive/90 p-4 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5" />
                    <p className='font-medium'>{t(error)}</p>
                </div>
            )}

            {aiResponse && (
              <Card className="mt-6 text-left animate-in fade-in-50 duration-500 shadow-2xl bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                    {t('AI Generated Insights')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-base">
                  <div>
                    <h3 className="font-semibold text-lg tracking-tight">{t('Identified Problem')}</h3>
                    <p className="mt-1 text-muted-foreground">{t(aiResponse.problem)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg tracking-tight">{t('Suggested Solution')}</h3>
                    <p className="mt-1 text-muted-foreground">{t(aiResponse.solution)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg tracking-tight">{t('Applicable Indian Penal Code Sections')}</h3>
                    <p className="mt-1 text-muted-foreground whitespace-pre-wrap font-mono text-sm">{t(aiResponse.ipcSections)}</p>
                  </div>
                </CardContent>
                <CardFooter>
                    <p className='text-xs text-muted-foreground text-center w-full'>*This is an AI-generated analysis and not a substitute for professional legal advice.</p>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </section>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
