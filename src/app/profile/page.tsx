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
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/use-translation';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email(),
    photoURL: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
    dateOfBirth: z.date().optional(),
});

export default function ProfilePage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
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
            firstName: '',
            lastName: '',
            email: '',
            photoURL: '',
            phone: '',
            address: '',
        },
    });

    useEffect(() => {
        if (userProfile) {
            form.reset({
                firstName: (userProfile as any).firstName || '',
                lastName: (userProfile as any).lastName || '',
                email: (userProfile as any).email || '',
                photoURL: (userProfile as any).photoURL || '',
                phone: (userProfile as any).phone || '',
                address: (userProfile as any).address || '',
                gender: (userProfile as any).gender,
                dateOfBirth: (userProfile as any).dateOfBirth ? new Date((userProfile as any).dateOfBirth) : undefined,
            });
            if((userProfile as any).photoURL) {
                setPreviewImage((userProfile as any).photoURL);
            }
        }
    }, [userProfile, form]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setPreviewImage(dataUrl);
                form.setValue('photoURL', dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };
    

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        if (!userDocRef || !user || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'User not found.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const { email, ...rest } = values;
            const updateData = {
                ...rest,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString().split('T')[0] : null,
            };

            setDocumentNonBlocking(userDocRef, updateData, { merge: true });

             // Also update lawyer_profiles if the user is a lawyer
            if ((userProfile as any)?.isLawyer) {
                const lawyerProfileRef = doc(firestore, 'lawyer_profiles', user.uid);
                const lawyerUpdateData = {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    photoURL: values.photoURL,
                    dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString().split('T')[0] : null,
                };
                setDocumentNonBlocking(lawyerProfileRef, lawyerUpdateData, { merge: true });
            }

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
    
    const isLoading = isUserLoading || isProfileLoading;

    return (
        <div className="container py-12 lg:py-24">
            <PageHeader
                title={t("Your Profile")}
                subtitle={t("Manage your personal information.")}
            />
            <div className="mt-12 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">{t('Account Details')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-6">
                                <div className="flex justify-center">
                                    <Skeleton className="h-24 w-24 rounded-full" />
                                </div>
                                <div className="flex gap-4">
                                    <Skeleton className="h-10 flex-1" />
                                    <Skeleton className="h-10 flex-1" />
                                </div>
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full mt-4" />
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="flex flex-col items-center space-y-4">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={previewImage ?? undefined} alt="Profile picture" />
                                            <AvatarFallback>
                                                {form.getValues('firstName')?.charAt(0)}
                                                {form.getValues('lastName')?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="max-w-xs"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>{t('First Name')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
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
                                                        <Input {...field} />
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
                                                    <Input disabled {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('Phone')}</FormLabel>
                                                <FormControl>
                                                    <Input type="tel" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('Address')}</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex gap-4">
                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>{t('Gender')}</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={t("Select your gender")} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="male">{t('Male')}</SelectItem>
                                                            <SelectItem value="female">{t('Female')}</SelectItem>
                                                            <SelectItem value="other">{t('Other')}</SelectItem>
                                                            <SelectItem value="prefer-not-to-say">{t('Prefer not to say')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="dateOfBirth"
                                            render={({ field }) => (
                                            <FormItem className="flex flex-col flex-1">
                                                <FormLabel>{t('Date of Birth')}</FormLabel>
                                                <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                        'pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? (
                                                        format(field.value, 'PPP')
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
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t('Save Changes')}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
