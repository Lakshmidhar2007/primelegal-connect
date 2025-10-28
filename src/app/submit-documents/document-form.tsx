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

const formSchema = z.object({
  caseSubject: z.string().min(5, 'Please provide a brief subject for your case.'),
  documentType: z.string().min(1, 'Please select a document type.'),
  file: z.any().refine(file => file?.length == 1, 'File is required.'),
  notes: z.string().optional(),
});

export function DocumentForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      caseSubject: '',
      documentType: '',
      notes: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newCaseId = `CASE-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
    console.log({ caseId: newCaseId, ...values});
    setIsSubmitting(false);

    toast({
      title: 'Case Filed Successfully',
      description: `Your case regarding "${values.caseSubject}" has been submitted with ID ${newCaseId}.`,
      variant: 'default',
    });
    form.reset();
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
