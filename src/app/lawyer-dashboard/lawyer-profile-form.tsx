'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';

const lawyerProfileSchema = z.object({
  specialty: z.string().min(2, 'Specialty is required.'),
  bio: z.string().min(20, 'Bio must be at least 20 characters.'),
  website: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  linkedin: z.string().url('Please enter a valid LinkedIn URL.').optional().or(z.literal('')),
});

export function LawyerProfileForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const lawyerProfileRef = useMemoFirebase(() => {
    if (firestore && user) {
      return doc(firestore, 'lawyer_profiles', user.uid);
    }
    return null;
  }, [firestore, user]);

  const { data: lawyerProfile, isLoading: isProfileLoading } = useDoc(lawyerProfileRef);

  const form = useForm<z.infer<typeof lawyerProfileSchema>>({
    resolver: zodResolver(lawyerProfileSchema),
    defaultValues: {
      specialty: '',
      bio: '',
      website: '',
      linkedin: '',
    },
  });

  useEffect(() => {
    if (lawyerProfile) {
      form.reset({
        specialty: (lawyerProfile as any).specialty || '',
        bio: (lawyerProfile as any).bio || '',
        website: (lawyerProfile as any).website || '',
        linkedin: (lawyerProfile as any).linkedin || '',
      });
    }
  }, [lawyerProfile, form]);

  async function onSubmit(values: z.infer<typeof lawyerProfileSchema>) {
    setIsSubmitting(true);
    if (!lawyerProfileRef) {
        toast({ variant: 'destructive', title: t('Error'), description: t('User not found.') });
        setIsSubmitting(false);
        return;
    }
    
    try {
      setDocumentNonBlocking(lawyerProfileRef, values, { merge: true });
      toast({
        title: t('Profile Updated'),
        description: t('Your public profile has been saved.'),
      });
    } catch(e) {
        // Errors are handled by the global error handler
    }
    finally {
      setIsSubmitting(false);
    }
  }

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <Card>
        <CardHeader>
            <CardTitle>{t('Manage Profile')}</CardTitle>
            <CardDescription>{t("This information is visible to clients.")}</CardDescription>
        </CardHeader>
        <CardContent>
             {isLoading ? (
                <div className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full mt-4" />
                </div>
                ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="specialty"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('Specialty')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t("e.g., Family Law, Criminal Defense")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('Biography')}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t("Tell clients about your experience and approach...")} className="min-h-[120px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="website"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('Website')}</FormLabel>
                                    <FormControl>
                                        <Input type="url" placeholder="https://your-website.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="linkedin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('LinkedIn Profile')}</FormLabel>
                                    <FormControl>
                                        <Input type="url" placeholder="https://linkedin.com/in/your-profile" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('Save Profile')}
                        </Button>
                    </form>
                </Form>
             )}
        </CardContent>
    </Card>
  );
}
