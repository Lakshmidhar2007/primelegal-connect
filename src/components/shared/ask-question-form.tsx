'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAIResponse } from '@/actions/query';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileUp } from 'lucide-react';
import { useUser } from '@/firebase';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { useTranslation } from '@/hooks/use-translation';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required.' }),
  email: z.string().email(),
  phone: z.string().optional(),
  contactMethod: z.enum(['email', 'phone', 'text'], { required_error: 'Please select a contact method.' }),
  legalIssueType: z.string({ required_error: 'Please select a legal issue type.' }),
  otherLegalIssue: z.string().optional(),
  issueDate: z.date().optional(),
  involvedParties: z.string().min(2, { message: 'Please describe who is involved.'}),
  description: z.string().min(20, { message: 'Please provide a detailed description (at least 20 characters).' }),
  desiredOutcome: z.string().min(5, { message: 'Please describe your desired outcome.' }),
  previousStepsTaken: z.enum(['yes', 'no'], { required_error: 'Please select an option.'}),
  previousStepsDescription: z.string().optional(),
  consent: z.boolean().refine(val => val === true, { message: 'You must consent to continue.' }),
  documents: z.any().optional(),
}).refine(data => data.legalIssueType !== 'Other' || (data.legalIssueType === 'Other' && data.otherLegalIssue), {
    message: 'Please specify the legal issue type.',
    path: ['otherLegalIssue'],
});


type AskQuestionFormProps = {
    onSuccess?: () => void;
}

export function AskQuestionForm({ onSuccess }: AskQuestionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, isUserLoading } = useUser();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: user?.email || '',
      phone: '',
      otherLegalIssue: '',
      involvedParties: '',
      description: '',
      desiredOutcome: '',
      previousStepsDescription: '',
      consent: false,
    },
  });

  const legalIssueType = form.watch('legalIssueType');
  const previousStepsTaken = form.watch('previousStepsTaken');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        setShowAuthDialog(true);
        return;
    }

    setIsLoading(true);
    setError(null);

    // For now, we are just logging the form data.
    // In a real application, you would send this to your backend, and likely not use the simple AI query action.
    console.log("Form submitted:", values);

    // Simulating an API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demonstration, let's call the simple AI response.
    const result = await getAIResponse({ query: values.description });

    if (result.success && result.data) {
      if(onSuccess) onSuccess();
      // Perhaps show the AI response in a new dialog or a toast.
      // For now, just logging it.
      console.log("AI Response:", result.data.initialResponse);
    } else {
      setError(result.error || 'Failed to get a response.');
    }

    setIsLoading(false);
  }

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
            <AlertDescription>
            All information provided will remain strictly confidential and used only for preliminary legal analysis.
            </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Section 1 */}
            <fieldset className="space-y-4 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-lg font-medium font-headline">Section 1: Personal Information</legend>
                <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="contactMethod" render={({ field }) => (
                    <FormItem><FormLabel>Preferred Contact Method</FormLabel><FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="email" id="email" /></FormControl><FormLabel htmlFor="email" className="font-normal">Email</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="phone" id="phone" /></FormControl><FormLabel htmlFor="phone" className="font-normal">Phone Call</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="text" id="text" /></FormControl><FormLabel htmlFor="text" className="font-normal">WhatsApp / Text</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl><FormMessage /></FormItem>
                )}/>
            </fieldset>

            {/* Section 2 */}
            <fieldset className="space-y-4 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-lg font-medium font-headline">Section 2: Case Details</legend>
                <FormField control={form.control} name="legalIssueType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Type of Legal Issue</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select the category that best fits your situation" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Civil Dispute">Civil Dispute</SelectItem>
                                <SelectItem value="Criminal Matter">Criminal Matter</SelectItem>
                                <SelectItem value="Family / Divorce">Family / Divorce</SelectItem>
                                <SelectItem value="Property / Real Estate">Property / Real Estate</SelectItem>
                                <SelectItem value="Employment / Workplace">Employment / Workplace</SelectItem>
                                <SelectItem value="Contract / Business">Contract / Business</SelectItem>
                                <SelectItem value="Consumer / Complaint">Consumer / Complaint</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                {legalIssueType === 'Other' && (
                    <FormField control={form.control} name="otherLegalIssue" render={({ field }) => (
                        <FormItem><FormLabel>Please Specify</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                )}
                 <FormField control={form.control} name="issueDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>When did this issue begin?</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? (format(field.value, "PPP")) : (<span>Pick a date or approximate timeframe</span>)}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button></FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent>
                        </Popover><FormMessage />
                    </FormItem>
                 )}/>
                 <FormField control={form.control} name="involvedParties" render={({ field }) => (
                    <FormItem><FormLabel>Who is involved in this issue (besides you)?</FormLabel><FormControl><Textarea placeholder="e.g., employer, landlord, family member, government agency, etc." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </fieldset>

            {/* Section 3 */}
            <fieldset className="space-y-4 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-lg font-medium font-headline">Section 3: Detailed Description</legend>
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Please describe your legal situation clearly and in detail</FormLabel><FormControl><Textarea className="min-h-[120px]" placeholder="Include key facts, what happened, when, and any documents or evidence you have." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="desiredOutcome" render={({ field }) => (
                    <FormItem><FormLabel>What specific outcome are you seeking?</FormLabel><FormControl><Textarea placeholder="e.g., settlement, compensation, divorce, legal advice, etc." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="previousStepsTaken" render={({ field }) => (
                    <FormItem><FormLabel>Have you taken any steps so far (legal notice, police report, lawyer consultation, etc.)?</FormLabel><FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" id="yes" /></FormControl><FormLabel htmlFor="yes" className="font-normal">Yes</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" id="no" /></FormControl><FormLabel htmlFor="no" className="font-normal">No</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl><FormMessage /></FormItem>
                )}/>
                 {previousStepsTaken === 'yes' && (
                    <FormField control={form.control} name="previousStepsDescription" render={({ field }) => (
                        <FormItem><FormLabel>If yes, please describe</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                )}
            </fieldset>

            {/* Section 4 */}
            <fieldset className="space-y-4 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-lg font-medium font-headline">Section 4: Confidentiality & Consent</legend>
                <FormField control={form.control} name="documents" render={({ field: { onChange, ...rest } }) => (
                    <FormItem>
                        <FormLabel>Upload Relevant Documents (optional)</FormLabel>
                        <FormControl>
                            <Input type="file" multiple onChange={(e) => onChange(e.target.files)} {...rest} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="consent" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Do you agree to share your information for the purpose of initial legal review?</FormLabel>
                            <FormMessage/>
                        </div>
                    </FormItem>
                )}/>
            </fieldset>

            {error && ( <div className="text-red-500"><p>{error}</p></div> )}

            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading || isUserLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('Submitting...')}
                </>
              ) : (
                t('Submit Form Securely')
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">You will receive an acknowledgment within 24–48 hours. All data is encrypted and protected.</p>
          </form>
        </Form>
      </div>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
