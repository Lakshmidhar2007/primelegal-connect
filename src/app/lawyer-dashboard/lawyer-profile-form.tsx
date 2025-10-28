'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  specialty: z.string().min(1, 'Please select a specialty.'),
  bio: z.string().max(500, 'Bio must not exceed 500 characters.').optional(),
  website: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  linkedin: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

export function LawyerProfileForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const userDocRef = useMemoFirebase(() => {
    if (firestore && user) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialty: '',
      bio: '',
      website: '',
      linkedin: '',
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        specialty: (userProfile as any).specialty || '',
        bio: (userProfile as any).bio || '',
        website: (userProfile as any).website || '',
        linkedin: (userProfile as any).linkedin || '',
      });
    }
  }, [userProfile, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: t('Error'), description: t('User not found.') });
        setIsSubmitting(false);
        return;
    }

    try {
        // Update the private user document
        const privateUserRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(privateUserRef, values, { merge: true });

        // Update the public lawyer_profiles document
        const publicProfileRef = doc(firestore, 'lawyer_profiles', user.uid);
        setDocumentNonBlocking(publicProfileRef, values, { merge: true });

        toast({
            title: t('Profile Updated'),
            description: t('Your information has been saved successfully.'),
        });
    } catch(e) {
        // Error is handled by global error handler
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isUserLoading || isProfileLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Legal Specialty')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('Select your primary area of practice')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Corporate Law">{t('Corporate Law')}</SelectItem>
                  <SelectItem value="Family Law">{t('Family Law')}</SelectItem>
                  <SelectItem value="Intellectual Property">{t('Intellectual Property')}</SelectItem>
                  <SelectItem value="Criminal Defense">{t('Criminal Defense')}</SelectItem>
                  <SelectItem value="Real Estate Law">{t('Real Estate Law')}</SelectItem>
                  <SelectItem value="Tax Law">{t('Tax Law')}</SelectItem>
                  <SelectItem value="Other">{t('Other')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Professional Bio')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('Share a brief summary of your experience and qualifications...')}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('This will be displayed on your public profile.')}
              </FormDescription>
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
                <Input placeholder="https://your-firm.com" {...field} />
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
                <Input placeholder="https://linkedin.com/in/your-profile" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('Save Changes')}
        </Button>
      </form>
    </Form>
  );
}
