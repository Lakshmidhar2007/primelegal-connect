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

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="container flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md">
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
    </div>
  );
}
