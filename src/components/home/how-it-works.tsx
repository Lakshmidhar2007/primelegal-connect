'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';
import { FileQuestion, Bot, Handshake } from 'lucide-react';

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
      icon: <FileQuestion className="h-10 w-10" />,
      action: onAskQuestionClick,
      isLink: false,
    },
    {
      id: 'insights',
      title: t('2. Get AI Insights'),
      description: t('Our advanced AI instantly analyzes your query, providing preliminary information, identifying key legal concepts, and suggesting next steps.'),
      icon: <Bot className="h-10 w-10" />,
      href: '#ask-ai',
      isLink: true,
    },
    {
      id: 'connect',
      title: t('3. Connect with an Expert'),
      description: t('Based on the AI analysis, we connect you with a qualified legal professional for a formal consultation to handle your case.'),
      icon: <Handshake className="h-10 w-10" />,
      href: '#meet-experts',
      isLink: true,
    },
  ];
  
  const CardWrapper = ({ step, className, style }: { step: typeof steps[0], className?: string, style?: React.CSSProperties }) => {
    const cardContent = (
      <Card className="flex flex-col text-center shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm border-border/50 h-full rounded-2xl group">
          <CardHeader className="items-center p-8 flex-grow">
              <div className="p-4 bg-primary/10 rounded-full text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <CardTitle className="mt-4 font-headline text-2xl">{step.title}</CardTitle>
              <CardDescription className="mt-2 text-muted-foreground flex-grow">
              {step.description}
              </CardDescription>
          </CardHeader>
      </Card>
    );

    if (step.isLink) {
        return (
            <Link href={step.href!} className={className} style={style}>
                {cardContent}
            </Link>
        );
    }

    return (
        <div onClick={step.action} className={`${className} cursor-pointer`} style={style}>
            {cardContent}
        </div>
    );
  };


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
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
            <CardWrapper 
                key={step.id} 
                step={step} 
                className="animate-fade-in-up"
                style={{animationDelay: `${400 + 150 * i}ms`}}
            />
        ))}
      </div>
    </section>
  );
}
