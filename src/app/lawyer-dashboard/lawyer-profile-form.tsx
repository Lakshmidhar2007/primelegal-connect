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
import { useTranslation } from '@/hooks/use-translation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LEGAL_SPECIALTIES = [
    "Civil Dispute",
    "Criminal Matter",
    "Family / Divorce",
    "Property / Real Estate",
    "Employment / Workplace",
    "Contract / Business",
    "Consumer / Complaint",
    "Intellectual Property",
    "Taxation",
    "Immigration",
    "Other"
];

const formSchema = z.object({
  specialty: z.string().min(1, 'Please select your primary area of practice.'),
  bio: z.string().min(50, 'Please provide a bio of at least 50 characters.').max(1000, 'Bio cannot exceed 1000 characters.'),
  website: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  linkedin: z.string().url('Please enter a valid LinkedIn URL.').optional().or(z.literal('')),
});

export function LawyerProfileForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
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
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: t('Authentication Error'),
        description: t('You must be logged in to update your profile.'),
      });
      return;
    }
    setIsSubmitting(true);

    try {
        const userRef = doc(firestore, 'users', user.uid);
        const lawyerProfileRef = doc(firestore, 'lawyer_profiles', user.uid);
        
        // Update both user and lawyer_profiles collections
        setDocumentNonBlocking(userRef, values, { merge: true });
        setDocumentNonBlocking(lawyerProfileRef, values, { merge: true });
      
      toast({
        title: t('Profile Updated'),
        description: t('Your professional profile has been successfully updated.'),
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: t('Error'),
        description: t('Could not update your profile. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isProfileLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Area of Specialty')}</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select your primary legal specialty")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEGAL_SPECIALTIES.map(spec => (
                    <SelectItem key={spec} value={spec}>{t(spec)}</SelectItem>
                  ))}
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
                    placeholder={t("Tell clients about your experience, approach, and what makes you a great lawyer...")}
                    className="min-h-[150px]"
                    {...field}
                />
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
                <FormLabel>{t('Personal or Firm Website (Optional)')}</FormLabel>
                <FormControl>
                <Input placeholder="https://myfirm.com" {...field} />
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
                <FormLabel>{t('LinkedIn Profile URL (Optional)')}</FormLabel>
                <FormControl>
                <Input placeholder="https://linkedin.com/in/your-profile" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />

        <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isSubmitting || isProfileLoading}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('Save Profile')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
