'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';

type HowItWorksProps = {
  onAskQuestionClick: () => void;
};


export function HowItWorks({ onAskQuestionClick }: HowItWorksProps) {
  const { t } = useTranslation();
  const steps = [
    {
      id: 'ask',
      title: t('1. Ask Your Question'),
      description: t('Clearly describe your legal situation using our secure, confidential form. The more detail you provide, the better our initial analysis.'),
    },
    {
      id: 'insights',
      title: t('2. Get AI Insights'),
      description: t('Our advanced AI instantly analyzes your query, providing preliminary information, identifying key legal concepts, and suggesting next steps.'),
    },
    {
      id: 'connect',
      title: t('3. Connect with an Expert'),
      description: t('Based on the AI analysis and your needs, we connect you with a qualified legal professional for a formal consultation to handle your case.'),
    },
  ];

  const getCardContent = (step: typeof steps[0]) => (
    <Card
        className={`flex flex-col text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-black text-white animate-fade-in-up overflow-hidden border border-transparent hover:border-primary hover:scale-105 h-full`} 
    >
        <CardHeader className="items-center p-6 flex-grow">
            <CardTitle className="mt-4 font-headline text-2xl">{step.title}</CardTitle>
            <CardDescription className="px-6 pb-6 text-white/80 flex-grow">
            {step.description}
            </CardDescription>
        </CardHeader>
    </Card>
  );

  return (
    <section className="container py-12 lg:py-24">
      <div className="mx-auto max-w-3xl text-center animate-slide-in-from-left" style={{ animationDelay: '300ms' }}>
        <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-4xl md:text-5xl">
          {t('Your Path to Legal Clarity')}
        </h2>
        <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
          {t('Getting legal help has never been easier. Follow our straightforward three-step process.')}
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        <div 
            onClick={onAskQuestionClick}
            className="cursor-pointer animate-fade-in-up"
            style={{animationDelay: `400ms`}}
        >
            {getCardContent(steps[0])}
        </div>
        <a 
            href="#ask-ai" 
            className="animate-fade-in-up"
            style={{animationDelay: `550ms`}}
        >
            {getCardContent(steps[1])}
        </a>
        <Link
            href="#meet-experts" 
            className="animate-fade-in-up"
            style={{animationDelay: `700ms`}}
        >
           {getCardContent(steps[2])}
        </Link>
      </div>
    </section>
  );
}
