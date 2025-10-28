'use client';

import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Switch } from '@/components/ui/switch';
import { doc } from 'firebase/firestore';
import { useTranslation } from '@/hooks/use-translation';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
  isLawyer: z.boolean().default(false),
  dateOfBirth: z.date().optional(),
  nationality: z.string().optional(),
  nationalityProof: z.any().optional(),
  barCouncilNumber: z.string().optional(),
  licensePdf: z.any().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(data => {
    if (data.isLawyer) {
        return !!data.dateOfBirth;
    }
    return true;
}, {
    message: "Date of Birth is required for lawyers.",
    path: ["dateOfBirth"],
}).refine(data => {
    if (data.isLawyer) {
        return !!data.nationality && data.nationality.length > 0;
    }
    return true;
}, {
    message: "Nationality is required for lawyers.",
    path: ["nationality"],
}).refine(data => {
    if (data.isLawyer) {
        return !!data.barCouncilNumber && data.barCouncilNumber.length > 0;
    }
    return true;
}, {
    message: "Bar Council Registration Number is required for lawyers.",
    path: ["barCouncilNumber"],
}).refine(data => {
    if (data.isLawyer) {
        return !!data.licensePdf;
    }
    return true;
}, {
    message: "Lawyer's license is required for verification.",
    path: ["licensePdf"],
});


type SignupFormProps = {
    onLoginClick: () => void;
    onSuccess: () => void;
};

export function SignupForm({ onLoginClick, onSuccess }: SignupFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      isLawyer: false,
      nationality: '',
      barCouncilNumber: '',
      nationalityProof: undefined,
      licensePdf: undefined,
    },
  });

  const isLawyer = form.watch('isLawyer');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (user && firestore) {
        const userRef = doc(firestore, 'users', user.uid);
        const { confirmPassword, nationalityProof, licensePdf, ...userDataToSave } = values;

        const userData = {
          ...userDataToSave,
          id: user.uid,
          registrationDate: new Date().toISOString(),
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString().split('T')[0] : undefined,
        };
        
        if (values.nationalityProof) {
          console.log('Nationality Proof provided:', values.nationalityProof[0].name);
        }
        if (values.licensePdf) {
          console.log('License PDF provided:', values.licensePdf[0].name);
        }
        
        setDocumentNonBlocking(userRef, userData, { merge: true });

        if (values.isLawyer) {
            const lawyerProfileRef = doc(firestore, 'lawyer_profiles', user.uid);
            const lawyerProfileData = {
                userId: user.uid,
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString().split('T')[0] : undefined,
                nationality: values.nationality,
                barCouncilNumber: values.barCouncilNumber,
            }
            setDocumentNonBlocking(lawyerProfileRef, lawyerProfileData, { merge: true });
        }
      }

      toast({
        title: t('Account Created'),
        description: t("You've been successfully signed up!"),
      });
      onSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('Sign Up Failed'),
        description: t(error.message || 'An unexpected error occurred.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4">
            <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                <FormItem className="flex-1">
                    <FormLabel>{t('First Name')}</FormLabel>
                    <FormControl>
                    <Input placeholder={t("John")} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                <FormItem className="flex-1">
                    <FormLabel>{t('Last Name')}</FormLabel>
                    <FormControl>
                    <Input placeholder={t("Doe")} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        </div>
        <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
            <FormItem>
                <FormLabel>{t('Email')}</FormLabel>
                <FormControl>
                <Input type="email" placeholder="m@example.com" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
            <FormItem>
                <FormLabel>{t('Password')}</FormLabel>
                <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
            <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
            <FormItem>
                <FormLabel>{t('Confirm Password')}</FormLabel>
                <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={form.control}
            name="isLawyer"
            render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                <FormLabel>{t('Are you a lawyer?')}</FormLabel>
                <FormDescription>
                    {t('Enable this if you are a legal professional.')}
                </FormDescription>
                </div>
                <FormControl>
                <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                />
                </FormControl>
            </FormItem>
            )}
        />

        {isLawyer && (
            <div className="space-y-4 pt-4 border-t">
                <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>{t('Date of Birth')}</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>{t('Pick a date')}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('Nationality')}</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nationalityProof"
                    render={({ field: { onChange, ...rest } }) => (
                        <FormItem>
                            <FormLabel>{t('Proof of Nationality')}</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*,.pdf" onChange={(e) => onChange(e.target.files)} {...rest} />
                            </FormControl>
                            <FormDescription>{t('Aadhar, PAN, Driving License, etc.')}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                    <FormField
                    control={form.control}
                    name="barCouncilNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('Bar Council Registration Number')}</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                    <FormField
                    control={form.control}
                    name="licensePdf"
                    render={({ field: { onChange, ...rest } }) => (
                        <FormItem>
                            <FormLabel>{t("Lawyer's License (PDF)")}</FormLabel>
                            <FormControl>
                                <Input type="file" accept=".pdf" onChange={(e) => onChange(e.target.files)} {...rest} />
                            </FormControl>
                            <FormDescription>{t("Upload for verification.")}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('Sign Up')}
        </Button>
        <div className="mt-4 text-center text-sm">
            {t('Already have an account?')}{' '}
            <Button variant="link" className="p-0 h-auto" onClick={onLoginClick}>
                {t('Login')}
            </Button>
        </div>
        </form>
    </Form>
  );
}
