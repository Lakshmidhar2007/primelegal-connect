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
import { doc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseSubject: '',
      documentType: '',
      notes: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to submit a case.',
        });
        return;
    }
    setIsSubmitting(true);
    
    try {
        const file = values.file[0];
        
        // This is the correct reference to the 'cases' subcollection for the current user.
        const casesCollectionRef = collection(firestore, 'users', user.uid, 'cases');
        
        // Generate a new document reference within the 'cases' subcollection to get a unique ID.
        const newCaseRef = doc(casesCollectionRef);

        const newCase = {
            caseId: newCaseRef.id, // Use the ID from the new document reference.
            caseSubject: values.caseSubject,
            documentType: values.documentType,
            notes: values.notes,
            fileName: file.name,
            submitted: new Date().toISOString(),
            status: 'Submitted',
        };

        // Use the non-blocking update to add the new case document to the subcollection.
        // We pass the newCaseRef which points to the exact location for the new document.
        addDocumentNonBlocking(casesCollectionRef, newCase);
        
        toast({
          title: 'Case Filed Successfully',
          description: `Your case regarding "${values.caseSubject}" has been submitted.`,
          variant: 'default',
        });
        
        form.reset();
        
        router.push('/case-tracking');

    } catch (error) {
        // This will be caught by the non-blocking update handler which emits a global error
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
              <FormLabel>Case Subject</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Landlord-Tenant Security Deposit Dispute" {...field} />
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
              <FormLabel>Primary Document Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a document type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Court Order">Court Order</SelectItem>
                  <SelectItem value="Lease Agreement">Lease Agreement</SelectItem>
                  <SelectItem value="Evidence">Evidence</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
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
              <FormLabel>Attach Document</FormLabel>
              <FormControl>
                <Input type="file" onChange={(e) => onChange(e.target.files)} {...rest} />
              </FormControl>
              <FormDescription>
                Max file size: 10MB. Accepted formats: PDF, DOCX, JPG.
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
              <FormLabel>Case Details / Optional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a summary of your case and any other relevant details..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Case
        </Button>
      </form>
    </Form>
  );
}
