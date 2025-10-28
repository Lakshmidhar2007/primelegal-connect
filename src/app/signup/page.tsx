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
import { useTranslation } from '@/hooks/use-translation';
import { LawyerList } from '@/components/auth/lawyer-list';

export default function SignupPage() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className="container grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-14rem)] py-12">
      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold font-headline">
              {t('Sign Up')}
            </CardTitle>
            <CardDescription>
              {t('Create an account to get started.')}
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
      <div>
        <h2 className="text-2xl font-bold text-center mb-6 font-headline">{t('Meet Our Experts')}</h2>
        <LawyerList />
      </div>
    </div>
  );
}
