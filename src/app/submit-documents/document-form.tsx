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
import { useState } from 'react';
import { useUser, useFirestore, addDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '@/hooks/use-translation';

const formSchema = z.object({
  caseSubject: z.string().min(5, 'Please provide a brief subject for your case.'),
  documentType: z.string().min(1, 'Please select a document type.'),
  file: z.any().refine(file => file?.length == 1, 'File is required.'),
  notes: z.string().optional(),
});

export function DocumentForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { t } = useTranslation();

   const userDocRef = useMemoFirebase(() => {
    if (firestore && user) {
      return doc(firestore, 'users', user.uid);
    }
    return null;
  }, [firestore, user]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseSubject: '',
      documentType: '',
      notes: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore || !userDocRef) {
        toast({
            variant: 'destructive',
            title: t('Authentication Error'),
            description: t('You must be logged in to submit a case.'),
        });
        return;
    }
    setIsSubmitting(true);
    
    try {
        const file = values.file[0];
        
        const newCaseId = uuidv4();
        
        const newCase = {
            caseId: newCaseId,
            caseSubject: values.caseSubject,
            documentType: values.documentType,
            notes: values.notes,
            fileName: file.name,
            submitted: new Date().toISOString(),
            status: 'Submitted',
        };
        
        const casesCollectionRef = collection(firestore, 'users', user.uid, 'cases');
        await addDoc(casesCollectionRef, newCase);

        toast({
          title: t('Case Filed Successfully'),
          description: t('Your case regarding "{{caseSubject}}" has been submitted. You will be notified of any updates.').replace('{{caseSubject}}', values.caseSubject),
          variant: 'default',
        });
        
        form.reset();
        
        router.push('/case-tracking');

    } catch (error) {
        console.error("Error submitting case:", error);
        toast({
          variant: 'destructive',
          title: t('Submission Error'),
          description: t('Could not submit your case. Please try again.'),
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="caseSubject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Case Subject')}</FormLabel>
              <FormControl>
                <Input placeholder={t("e.g., Landlord-Tenant Security Deposit Dispute")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Primary Document Type')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select a document type")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Contract">{t('Contract')}</SelectItem>
                  <SelectItem value="Court Order">{t('Court Order')}</SelectItem>
                  <SelectItem value="Lease Agreement">{t('Lease Agreement')}</SelectItem>
                  <SelectItem value="Evidence">{t('Evidence')}</SelectItem>
                  <SelectItem value="Other">{t('Other')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>{t('Attach Document')}</FormLabel>
              <FormControl>
                <Input type="file" onChange={(e) => onChange(e.target.files)} {...rest} />
              </FormControl>
              <FormDescription>
                {t('Max file size: 10MB. Accepted formats: PDF, DOCX, JPG.')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Case Details / Optional Notes')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("Provide a summary of your case and any other relevant details...")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('Submit Case')}
        </Button>
      </form>
    </Form>
  );
}
