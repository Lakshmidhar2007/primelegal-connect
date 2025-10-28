'use client';

import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { useTranslation } from '@/hooks/use-translation';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="container flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">
              {t('Login')}
            </CardTitle>
            <CardDescription>
              {t('Enter your credentials to access your account.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm 
                onSignupClick={() => router.push('/signup')}
                onSuccess={() => router.push('/')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
