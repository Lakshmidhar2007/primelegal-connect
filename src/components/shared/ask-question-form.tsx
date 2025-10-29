'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
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
import { collection, serverTimestamp, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { getAIChatResponse } from '@/actions/chat';

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
    lawyerId?: string;
}

export function AskQuestionForm({ onSuccess, lawyerId }: AskQuestionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();
  const { toast } = useToast();

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
    if (!user || !firestore) {
        setShowAuthDialog(true);
        return;
    }
    if (!lawyerId) {
        setError(t('No lawyer selected. Please select a lawyer first.'));
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
        const caseId = uuidv4();
        const caseData = {
            ...values,
            id: caseId,
            userId: user.uid,
            lawyerId: lawyerId,
            status: 'Submitted',
            submittedAt: new Date().toISOString(),
            issueDate: values.issueDate ? values.issueDate.toISOString() : null,
            documents: values.documents ? Array.from(values.documents).map((file: any) => file.name) : [],
        };
        
        const casesCollectionRef = collection(firestore, 'users', user.uid, 'cases');
        await addDoc(casesCollectionRef, caseData);


        const lawyerName = "Selected Lawyer"; 
        
        const chatRef = collection(firestore, 'chats');
        const chatData = {
            id: caseId,
            caseId: caseId,
            userId: user.uid,
            lawyerId: lawyerId,
            createdAt: serverTimestamp(),
            lastMessage: "AI: Welcome! How can I help?",
        };
        addDocumentNonBlocking(chatRef, chatData);

        await getAIChatResponse({ lawyerName: lawyerName, chatId: caseId });

        toast({
            title: t('Case Submitted Successfully'),
            description: t('The lawyer has been notified and will review your case shortly.'),
        });

        if(onSuccess) onSuccess();

    } catch (e) {
        setError(t('An unexpected error occurred. Please try again.'));
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-2xl">
        <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
            <AlertDescription>
            {t('All information provided will remain strictly confidential and will be shared only with the selected lawyer for review.')}
            </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Section 1 */}
            <fieldset className="space-y-4 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-lg font-medium font-headline">{t('Section 1: Personal Information')}</legend>
                <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>{t('Full Name')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>{t('Email Address')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>{t('Phone Number')}</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="contactMethod" render={({ field }) => (
                    <FormItem><FormLabel>{t('Preferred Contact Method')}</FormLabel><FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="email" id="email" /></FormControl><FormLabel htmlFor="email" className="font-normal">{t('Email')}</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="phone" id="phone" /></FormControl><FormLabel htmlFor="phone" className="font-normal">{t('Phone Call')}</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="text" id="text" /></FormControl><FormLabel htmlFor="text" className="font-normal">{t('WhatsApp / Text')}</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl><FormMessage /></FormItem>
                )}/>
            </fieldset>

            {/* Section 2 */}
            <fieldset className="space-y-4 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-lg font-medium font-headline">{t('Section 2: Case Details')}</legend>
                <FormField control={form.control} name="legalIssueType" render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('Type of Legal Issue')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder={t('Select the category that best fits your situation')} /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Civil Dispute">{t('Civil Dispute')}</SelectItem>
                                <SelectItem value="Criminal Matter">{t('Criminal Matter')}</SelectItem>
                                <SelectItem value="Family / Divorce">{t('Family / Divorce')}</SelectItem>
                                <SelectItem value="Property / Real Estate">{t('Property / Real Estate')}</SelectItem>
                                <SelectItem value="Employment / Workplace">{t('Employment / Workplace')}</SelectItem>
                                <SelectItem value="Contract / Business">{t('Contract / Business')}</SelectItem>
                                <SelectItem value="Consumer / Complaint">{t('Consumer / Complaint')}</SelectItem>
                                <SelectItem value="Other">{t('Other')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                {legalIssueType === 'Other' && (
                    <FormField control={form.control} name="otherLegalIssue" render={({ field }) => (
                        <FormItem><FormLabel>{t('Please Specify')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                )}
                 <FormField control={form.control} name="issueDate" render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>{t('When did this issue begin?')}</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? (format(field.value, "PPP")) : (<span>{t('Pick a date or approximate timeframe')}</span>)}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button></FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent>
                        </Popover><FormMessage />
                    </FormItem>
                 )}/>
                 <FormField control={form.control} name="involvedParties" render={({ field }) => (
                    <FormItem><FormLabel>{t('Who is involved in this issue (besides you)?')}</FormLabel><FormControl><Textarea placeholder={t('e.g., employer, landlord, family member, government agency, etc.')} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </fieldset>

            {/* Section 3 */}
            <fieldset className="space-y-4 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-lg font-medium font-headline">{t('Section 3: Detailed Description')}</legend>
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>{t('Please describe your legal situation clearly and in detail')}</FormLabel><FormControl><Textarea className="min-h-[120px]" placeholder={t('Include key facts, what happened, when, and any documents or evidence you have.')} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="desiredOutcome" render={({ field }) => (
                    <FormItem><FormLabel>{t('What specific outcome are you seeking?')}</FormLabel><FormControl><Textarea placeholder={t('e.g., settlement, compensation, divorce, legal advice, etc.')} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="previousStepsTaken" render={({ field }) => (
                    <FormItem><FormLabel>{t('Have you taken any steps so far (legal notice, police report, lawyer consultation, etc.)?')}</FormLabel><FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="yes" id="yes" /></FormControl><FormLabel htmlFor="yes" className="font-normal">{t('Yes')}</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="no" id="no" /></FormControl><FormLabel htmlFor="no" className="font-normal">{t('No')}</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl><FormMessage /></FormItem>
                )}/>
                 {previousStepsTaken === 'yes' && (
                    <FormField control={form.control} name="previousStepsDescription" render={({ field }) => (
                        <FormItem><FormLabel>{t('If yes, please describe')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                )}
            </fieldset>

            {/* Section 4 */}
            <fieldset className="space-y-4 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-lg font-medium font-headline">{t('Section 4: Confidentiality & Consent')}</legend>
                <FormField control={form.control} name="documents" render={({ field: { onChange, ...rest } }) => (
                    <FormItem>
                        <FormLabel>{t('Upload Relevant Documents (optional)')}</FormLabel>
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
                            <FormLabel>{t('I confirm that the information provided is accurate and I consent to share it with the selected lawyer.')}</FormLabel>
                            <FormMessage/>
                        </div>
                    </FormItem>
                )}/>
            </fieldset>

            {error && ( <div className="text-red-500"><p>{t(error)}</p></div> )}

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
            <p className="text-xs text-center text-muted-foreground">{t('You will receive an acknowledgment. All data is encrypted and protected.')}</p>
          </form>
        </Form>
      </div>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
