'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAIResponse } from '@/actions/query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, Loader2, Sparkles } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useUser } from '@/firebase';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  query: z.string().min(10, {
    message: 'Please describe your legal issue in at least 10 characters.',
  }),
});

type AskQuestionFormProps = {
    onSuccess?: () => void;
}

export function AskQuestionForm({ onSuccess }: AskQuestionFormProps) {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
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
      setAiResponse(result.data.initialResponse);
      if(onSuccess) onSuccess();
    } else {
      setError(result.error || 'Failed to get a response.');
    }

    setIsLoading(false);
  }

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <p className="mb-6 text-muted-foreground">
            Clearly describe your legal situation using our secure, confidential form. The more detail you provide, the better our initial analysis.
        </p>
        <Card className="shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 font-headline text-2xl">
              <Sparkles className="h-6 w-6 text-accent" />
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
                          placeholder={t("For example: 'I had a dispute with my landlord over the security deposit...'")}
                          className="min-h-[120px] resize-none text-base bg-background/70"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || isUserLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('Analyzing...')}
                    </>
                  ) : (
                    t('Get AI Analysis')
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && (
          <Card className="mt-6 text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <BrainCircuit className="h-6 w-6" />
                {t('AI Generated Insights')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        )}

        {error && (
            <div className="mt-6 text-red-500">
                <p>{error}</p>
            </div>
        )}

        {aiResponse && (
          <Card className="mt-6 text-left animate-in fade-in-50 duration-500 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                <BrainCircuit className="h-6 w-6" />
                {t('AI Generated Insights')}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-foreground/90 prose-p:text-foreground/90 prose-strong:text-foreground">
              <p>{aiResponse}</p>
            </CardContent>
          </Card>
        )}
      </div>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
