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
  caseId: z.string().regex(/^CASE-\d{3}$/, 'Please enter a valid Case ID (e.g., CASE-001).'),
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
      caseId: '',
      documentType: '',
      notes: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(values);
    setIsSubmitting(false);

    toast({
      title: 'Document Submitted Successfully',
      description: `Your ${values.documentType.toLowerCase()} for case ${values.caseId} has been uploaded.`,
      variant: 'default',
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="caseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Case ID</FormLabel>
              <FormControl>
                <Input placeholder="e.g., CASE-001" {...field} />
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
              <FormLabel>Document Type</FormLabel>
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
              <FormLabel>Document File</FormLabel>
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
              <FormLabel>Optional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any relevant notes about this document..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Document
        </Button>
      </form>
    </Form>
  );
}
