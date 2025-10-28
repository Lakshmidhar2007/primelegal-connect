import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const steps = [
  {
    image: PlaceHolderImages.find(p => p.id === 'howItWorks1'),
    title: '1. Ask Your Question',
    description: 'Clearly describe your legal situation using our secure, confidential form. The more detail you provide, the better our initial analysis.',
  },
  {
    image: PlaceHolderImages.find(p => p.id === 'howItWorks2'),
    title: '2. Get AI Insights',
    description: 'Our advanced AI instantly analyzes your query, providing preliminary information, identifying key legal concepts, and suggesting next steps.',
  },
  {
    image: PlaceHolderImages.find(p => p.id === 'howItWorks3'),
    title: '3. Connect with an Expert',
    description: 'Based on the AI analysis and your needs, we connect you with a qualified legal professional for a formal consultation to handle your case.',
  },
];

export function HowItWorks() {
  return (
    <section className="container py-12 lg:py-24">
      <div className="mx-auto max-w-3xl text-center animate-slide-in-from-left" style={{ animationDelay: '300ms' }}>
        <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-4xl md:text-5xl">
          Your Path to Legal Clarity
        </h2>
        <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
          Getting legal help has never been easier. Follow our straightforward three-step process.
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <Card key={step.title} className="flex flex-col text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card/50 animate-fade-in-up overflow-hidden" style={{animationDelay: `${400 + 150 * i}ms`}}>
            {step.image && (
              <CardContent className="p-0">
                  <div className="aspect-video overflow-hidden">
                  <Image
                    src={step.image.imageUrl}
                    alt={step.title}
                    width={600}
                    height={338}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={step.image.imageHint}
                  />
                  </div>
              </CardContent>
            )}
            <CardHeader className="items-center p-6">
              <CardTitle className="mt-4 font-headline text-2xl">{step.title}</CardTitle>
            </CardHeader>
            <CardDescription className="px-6 pb-6 text-foreground/80">
              {step.description}
            </CardDescription>
          </Card>
        ))}
      </div>
    </section>
  );
}
