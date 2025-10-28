import { HelpCircle, BrainCircuit, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const steps = [
  {
    icon: <HelpCircle className="h-10 w-10 text-primary" />,
    title: '1. Ask Your Question',
    description: 'Clearly describe your legal situation using our secure, confidential form. The more detail you provide, the better our initial analysis.',
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
    title: '2. Get AI Insights',
    description: 'Our advanced AI instantly analyzes your query, providing preliminary information, identifying key legal concepts, and suggesting next steps.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: '3. Connect with an Expert',
    description: 'Based on the AI analysis and your needs, we connect you with a qualified legal professional for a formal consultation to handle your case.',
  },
];

export function HowItWorks() {
  return (
    <section className="container py-12 lg:py-24 animate-fade-in-up animation-delay-200">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-4xl md:text-5xl">
          Your Path to Legal Clarity
        </h2>
        <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
          Getting legal help has never been easier. Follow our straightforward three-step process.
        </p>
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <Card key={step.title} className="flex flex-col items-center p-6 text-center shadow-md hover:shadow-xl transition-shadow animate-fade-in-up" style={{animationDelay: `${200 * (i + 1)}ms`}}>
            <CardHeader className="items-center">
              {step.icon}
              <CardTitle className="mt-4 font-headline text-2xl">{step.title}</CardTitle>
            </CardHeader>
            <CardDescription className="mt-2">
              {step.description}
            </CardDescription>
          </Card>
        ))}
      </div>
    </section>
  );
}
