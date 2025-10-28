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
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email(),
    photoURL: z.string().optional(),
});

export default function ProfilePage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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
        },
    });

    useEffect(() => {
        if (userProfile) {
            form.reset({
                firstName: (userProfile as any).firstName || '',
                lastName: (userProfile as any).lastName || '',
                email: (userProfile as any).email || '',
                photoURL: (userProfile as any).photoURL || '',
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
                // For now, we'll just store the data URL. In a real app, you'd upload this to a service like Firebase Storage.
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
            const { email, ...updateData } = values; // email should not be updated here
            setDocumentNonBlocking(userDocRef, updateData, { merge: true });

            if((userProfile as any)?.isLawyer) {
                const lawyerDocRef = doc(firestore, 'lawyers', user.uid);
                const publicProfileData = {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    photoURL: values.photoURL,
                };
                setDocumentNonBlocking(lawyerDocRef, publicProfileData, { merge: true });
            }

            toast({
                title: 'Profile Updated',
                description: 'Your information has been saved successfully.',
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
                title="Your Profile"
                subtitle="Manage your personal information."
            />
            <div className="mt-12 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Account Details</CardTitle>
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
                                                    <FormLabel>First Name</FormLabel>
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
                                                    <FormLabel>Last Name</FormLabel>
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
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input disabled {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
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
