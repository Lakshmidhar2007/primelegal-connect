'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SignupForm } from '@/components/auth/signup-form';
import { LawyerList } from '@/components/auth/lawyer-list';

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="container py-12">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
        <div className="flex flex-col space-y-6">
            <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold font-headline">
                Sign Up
                </CardTitle>
                <CardDescription>
                Create an account to get started.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SignupForm
                    onLoginClick={() => router.push('/login')}
                    onSuccess={() => router.push('/')}
                />
            </CardContent>
            </Card>
        </div>
        <div className="flex flex-col space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-headline">Meet Our Legal Experts</h2>
                <p className="mt-2 text-muted-foreground">Join a growing network of professionals.</p>
            </div>
            <LawyerList />
        </div>
      </div>
    </div>
  );
}
