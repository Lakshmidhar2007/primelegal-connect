import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const expertsData = [
  {
    name: 'Eleanor Vance',
    specialty: 'Corporate Law',
    image: PlaceHolderImages.find(p => p.id === 'expert1'),
  },
  {
    name: 'Marcus Thorne',
    specialty: 'Family Law',
    image: PlaceHolderImages.find(p => p.id === 'expert2'),
  },
  {
    name: 'Isabella Rossi',
    specialty: 'Intellectual Property',
    image: PlaceHolderImages.find(p => p.id === 'expert3'),
  },
  {
    name: 'Julian Croft',
    specialty: 'Criminal Defense',
    image: PlaceHolderImages.find(p => p.id === 'expert4'),
  },
];

export function Experts() {
  return (
    <section className="container py-12 lg:py-24">
      <div className="mx-auto max-w-3xl text-center animate-fade-in" style={{ animationDelay: '700ms' }}>
        <h2 className="text-3xl font-bold tracking-tighter font-headline sm:text-4xl md:text-5xl">
          Meet Our Legal Experts
        </h2>
        <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
          A curated network of experienced professionals ready to assist you.
        </p>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {expertsData.map((expert, i) => (
          <Card key={expert.name} className="overflow-hidden text-center bg-card/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: `${800 + 150 * i}ms`}}>
            <CardHeader className="p-0">
              {expert.image && (
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={expert.image.imageUrl}
                    alt={`Portrait of ${expert.name}`}
                    width={400}
                    height={400}
                    className="aspect-square object-cover w-full transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={expert.image.imageHint}
                  />
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="font-headline text-xl">{expert.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{expert.specialty}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full">Connect</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
