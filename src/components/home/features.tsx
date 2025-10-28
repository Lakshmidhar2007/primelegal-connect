'use client';
import { Gavel, FileCheck, BarChart3, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from '@/hooks/use-translation';

export function Features() {
  const { t } = useTranslation();
  const featuresList = [
    {
      icon: <Users className="h-8 w-8" />,
      title: t('Expert Connection'),
      description: t('Connect with vetted legal experts tailored to your specific case needs and geographical location.'),
    },
    {
      icon: <Gavel className="h-8 w-8" />,
      title: t('AI Query Sorting'),
      description: t('Our AI provides instant, initial analysis of your query to categorize your issue and offer relevant information.'),
    },
    {
      icon: <FileCheck className="h-8 w-8" />,
      title: t('Secure Document Submission'),
      description: t('Upload and share sensitive documents with your legal expert through our encrypted, secure platform.'),
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: t('Real-Time Case Tracking'),
      description: t('Stay informed on the progress of your case with a clear, up-to-date timeline of all activities.'),
    },
  ];

  return (
    <section className="w-full py-12 lg:py-24 bg-background/50">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center animate-slide-in-from-right" style={{ animationDelay: '500ms' }}>
          <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-4xl md:text-5xl">
            {t('A Modern Approach to Legal Services')}
          </h2>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
            {t('Leveraging technology to make legal support more accessible, transparent, and efficient.')}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {featuresList.map((feature, i) => (
            <Card key={feature.title} className="border-0 bg-transparent shadow-none animate-fade-in-up" style={{animationDelay: `${600 + 150 * i}ms`}}>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">{feature.icon}</div>
                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
